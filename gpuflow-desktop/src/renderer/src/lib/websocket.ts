export class MachineConnection {
  private ws: WebSocket | null = null
  private authToken: string
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private heartbeatInterval: NodeJS.Timeout | null = null
  private isConnecting = false
  private shouldReconnect = true

  constructor(authToken: string) {
    this.authToken = authToken
  }

  connect(): void {
    if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.OPEN)) {
      console.log('Already connected or connecting')
      return
    }

    this.isConnecting = true
    const wsUrl = `ws://localhost:8000/api/v1/ws/machine/${this.authToken}`
    
    console.log('🔌 Connecting to GPUFlow network...')
    this.ws = new WebSocket(wsUrl)

    this.ws.onopen = () => {
      console.log('✅ Connected! Machine is now ONLINE')
      this.isConnecting = false
      this.reconnectAttempts = 0
      this.startHeartbeat()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        console.log('📨 Message from server:', data)
        
        if (data.event === 'START_JOB') {
          console.log('⚡ New job received:', data.job_id)
          // TODO: Handle job execution
        }
      } catch (error) {
        console.error('Failed to parse message:', error)
      }
    }

    this.ws.onerror = (error) => {
      console.error('❌ WebSocket error:', error)
      this.isConnecting = false
    }

    this.ws.onclose = () => {
      console.log('⚠️ Disconnected from server')
      this.isConnecting = false
      this.stopHeartbeat()
      
      if (this.shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++
        console.log(`Reconnecting... (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`)
        setTimeout(() => this.connect(), 3000 * this.reconnectAttempts)
      }
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'heartbeat' }))
        console.log('💓 Heartbeat sent')
      }
    }, 30000) // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
      this.heartbeatInterval = null
    }
  }

  disconnect(): void {
    console.log('🛑 Disconnecting machine...')
    this.shouldReconnect = false
    this.stopHeartbeat()
    
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN
  }

  sendHardwareInfo(gpuName: string, vramGB: number): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({
        type: 'hardware_info',
        gpu_name: gpuName,
        vram_gb: vramGB
      }))
      console.log('📊 Hardware info sent to server')
    }
  }
}

// Global connection manager
let activeConnection: MachineConnection | null = null

export function getActiveConnection(): MachineConnection | null {
  return activeConnection
}

export function setActiveConnection(connection: MachineConnection | null): void {
  activeConnection = connection
}
