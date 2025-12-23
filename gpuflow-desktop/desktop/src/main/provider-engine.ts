import WebSocket from "ws";
import Docker from "dockerode";
import axios from "axios";
import si from "systeminformation";
import { BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import os from "os";

const API_URL = "http://localhost:8000/api/v1";
const WS_URL = "ws://localhost:8000/api/v1";

export class ProviderEngine {
    private ws: WebSocket | null = null;
    private docker : Docker ; 
    private token : string ;
    private mainWindow : BrowserWindow ; 
    private isRunning : boolean = false; 
    
    constructor(token: string, window: BrowserWindow) {
        this.token = token; 
        this.mainWindow = window;
    

    const socketPath = process.platform ==='win32'
    ? '//./pipe/docker_engine'
    : '/var/run/docker.sock';

    this.docker = new Docker({ socketPath });
    }

    private log(message: string) {
        console.log(message);
        this.mainWindow.webContents.send("log", message);
    }

    private status(status:string) {
        this.mainWindow.webContents.send('status', status);
    }

    public async start() {
        if (this.isRunning) {
            return;
        }
        this.isRunning = true;
        this.log('Starting GPUFlow Provider...');
        this.status('connecting');

        try {
            const graphics = await si.graphics();
            const gpu = graphics.controllers[0]; 
            const specs = {
                type : "hardware_info", 
                gpu_name : gpu ? `${gpu.vendor} ${gpu.model}` : "CPU Mode (No GPU Detected)", 
                vram_gb : gpu && gpu.vram ? Math.round(gpu.vram / 1024) : 0,
            }
            this.log(`Detected GPU: ${specs.gpu_name}`);

            // connect to websocket 
            this.ws = new WebSocket(`${WS_URL}/ws/machine/${this.token}`);

            this.ws.on('open', () => {
                this.log('Connected to GPUFlow Server');
                this.log(`Sending specs: ${JSON.stringify(specs)}`);
                this.status('online');
                this.ws?.send(JSON.stringify(specs));
            });
            this.ws.on('message', async (data: Buffer) => {
                try {
                    const msgStr = data.toString();
                    this.log(`WS Message: ${msgStr}`);
                    const msg = JSON.parse(msgStr);
                    if (msg.event === "START_JOB") {
                        await this.handleJob(msg);
                    }
                } catch (err: any) {
                    this.log(`WS Parse Error: ${err.message}`);
                }
            });

            this.ws.on('error', (err) => {
                this.log(`Socket Error: ${err.message}`);
                this.status('error');
            });

            this.ws.on('close', () => {
                this.log("Disconnected. Retrying in 5s...");
                this.status('offline');
                setTimeout(() => {
                if (this.isRunning) {
                    this.ws = null; // reset
                    this.start();
                }
                }, 5000);
            });

            } catch (err: any) {
            this.log(`Critical Error: ${err.message}`);
            this.status('error');
            }
        }

    public stop() {
        this.isRunning = false;
        if (this.ws) {
            this.ws.terminate();
            this.ws = null;
        }
        this.status('offline');
        this.log("Provider Stopped");
    }

    private async handleJob(jobMsg: any) {
        const { job_id, code } = jobMsg;
        this.log(`JOB RECEIVED: ${job_id.slice(0,8)}...`);
        this.log(`Code payload length: ${code?.length || 0} bytes`);
        
        try {
        this.log(`Updating job status to 'running'...`);
        await axios.patch(`${API_URL}/jobs/${job_id}`, { status: 'running' }, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        this.log(`Job status updated to 'running'`);

        this.log("Spawning Docker Container...");
        const logs = await this.runDockerContainer(job_id, code);
        this.log(`Container execution complete. Logs length: ${logs.length}`);

        const status = logs.includes("Execution failed") ? 'failed' : 'completed';
        
        this.log(`Updating job status to '${status}'...`);
        await axios.patch(`${API_URL}/jobs/${job_id}`, { 
            status, 
            result: logs 
        }, {
            headers: { Authorization: `Bearer ${this.token}` }
        });
        
        this.log(`Job ${status.toUpperCase()}`);

        } catch (err: any) {
        this.log(`Execution Error: ${err.message}`);
        this.log(`Stack: ${err.stack}`);
        }
    }

    private async runDockerContainer(jobId: string, codePayload: string): Promise<string> {
        return new Promise(async (resolve) => {
        let logs = "";
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `job_${jobId}_`));
        
        try {
                const files = JSON.parse(codePayload);
                for (const [filename, fileData] of Object.entries(files)) {
                    // @ts-ignore
                    fs.writeFileSync(path.join(tempDir, filename), fileData.content || fileData);
                }
            } catch {
                fs.writeFileSync(path.join(tempDir, "main.py"), codePayload);
            }

            try {
                const container = await this.docker.createContainer({
            Image: 'python:3.9-slim',
            Cmd: ['python', '-u', 'main.py'],
            HostConfig: {
                Binds: [`${tempDir}:/app:ro`], 
                Memory: 512 * 1024 * 1024, 
                NetworkMode: 'none' 
            },
            WorkingDir: '/app',
            Tty: false
            });

            await container.start();
            
            const stream = await container.logs({ follow: true, stdout: true, stderr: true });
            stream.on('data', (chunk) => {
            const line = chunk.toString('utf8').replace(/[\u0000-\u0008]/g, ''); 
            logs += line;
            this.log(`> ${line.trim()}`);
            });

            const result = await container.wait();
            
            if (result.StatusCode !== 0) {
            logs += `\nExecution failed with exit code ${result.StatusCode}`;
            }

            await container.remove();
            resolve(logs);

        } catch (err: any) {
            resolve(`Docker Error: ${err.message}`);
        }
    });
  }
}
