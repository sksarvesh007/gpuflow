import { useState, useEffect, useRef } from 'react'
import { Card } from './components/ui/card'
import { Terminal, Power, Cpu, Activity } from 'lucide-react'
import { cn } from './lib/utils'

function App(): JSX.Element {
  const [token, setToken] = useState('')
  const [status, setStatus] = useState('offline')
  const [logs, setLogs] = useState<string[]>([])
  const logsEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Listen for logs
    // @ts-ignore
    window.electron.ipcRenderer.on('log', (_, msg) => {
      setLogs(prev => [...prev, msg].slice(-100))
    })
    
    // Listen for status
    // @ts-ignore
    window.electron.ipcRenderer.on('status', (_, newStatus) => {
      setStatus(newStatus)
    })
  }, [])

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs])

  const toggleProvider = () => {
    if (status === 'offline' || status === 'error') {
      // @ts-ignore
      window.electron.ipcRenderer.send('start-provider', token)
    } else {
      // @ts-ignore
      window.electron.ipcRenderer.send('stop-provider')
    }
  }

  const isOnline = status === 'online' || status === 'connecting'

  return (
    <div className="h-screen bg-slate-950 text-white p-6 flex flex-col font-sans">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <Cpu className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold">GPUFlow Provider</h1>
            <p className="text-xs text-slate-400">v1.0.0 • Desktop Client</p>
          </div>
        </div>
        <div className={cn(
          "px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-2",
          status === 'online' ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
        )}>
          <div className={cn("w-2 h-2 rounded-full", status === 'online' ? "bg-green-400" : "bg-red-400")} />
          {status}
        </div>
      </div>

      {/* Main Controls */}
      <Card className="p-4 mb-4 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-400 mb-1.5 block">Machine Auth Token</label>
          <input
            type="password"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            disabled={isOnline}
            placeholder="Paste token starting with..."
            className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500 disabled:opacity-50"
          />
        </div>

        <button
          onClick={toggleProvider}
          className={cn(
            "w-full py-2 rounded font-medium flex items-center justify-center gap-2 transition-colors",
            isOnline 
              ? "bg-red-500/10 text-red-400 hover:bg-red-500/20" 
              : "bg-purple-600 text-white hover:bg-purple-700"
          )}
        >
          <Power className="w-4 h-4" />
          {isOnline ? 'Stop Provider' : 'Connect to Network'}
        </button>
      </Card>

      {/* Logs Window */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex items-center gap-2 mb-2 text-slate-400 text-xs uppercase font-bold tracking-wider">
          <Activity className="w-3 h-3" /> Live Activity
        </div>
        <div className="flex-1 bg-[#1e1e1e] rounded-lg border border-slate-800 p-4 overflow-y-auto font-mono text-xs">
          {logs.length === 0 && (
            <div className="text-slate-600 italic">Waiting for connection...</div>
          )}
          {logs.map((log, i) => (
            <div key={i} className="mb-1 break-all text-slate-300">
              <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
              {log}
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>
      </div>

    </div>
  )
}

export default App