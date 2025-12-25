import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { machineApi, type MachineResponse } from '@/lib/api'
import { getSystemInfo } from '@/lib/system-info'
import { MachineConnection, setActiveConnection } from '@/lib/websocket'
import { Copy, Plus, Server, Wifi, WifiOff } from 'lucide-react'

interface DashboardProps {
  onLogout: () => void
}

export function Dashboard({ onLogout }: DashboardProps): React.JSX.Element {
  const [machines, setMachines] = useState<MachineResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddMachine, setShowAddMachine] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [detectedGPU, setDetectedGPU] = useState<{ name: string; vram: number } | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('disconnected')

  useEffect(() => {
    loadMachines()

    // Cleanup: disconnect WebSocket when component unmounts (app closes)
    return () => {
      const connection = new MachineConnection('')
      connection.disconnect()
      setActiveConnection(null)
    }
  }, [])

  const loadMachines = async () => {
    try {
      setIsLoading(true)
      const data = await machineApi.getMachines()
      setMachines(data)

      // Auto-connect to WebSocket if user has machines
      if (data.length > 0) {
        const firstMachine = data[0]
        connectToMachine(firstMachine.auth_token, firstMachine.gpu_name, firstMachine.vram_gb)
      }
    } catch (err: any) {
      setError('Failed to load machines')
      console.error('Error loading machines:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const connectToMachine = (authToken: string, gpuName?: string, vramGB?: number) => {
    setConnectionStatus('connecting')
    const connection = new MachineConnection(authToken)
    setActiveConnection(connection)
    connection.connect()

    // Send hardware info if available
    if (gpuName && vramGB) {
      setTimeout(() => {
        connection.sendHardwareInfo(gpuName, vramGB)
      }, 1000)
    }

    // Update status after connection attempt
    setTimeout(() => {
      if (connection.isConnected()) {
        setConnectionStatus('connected')
      } else {
        setConnectionStatus('disconnected')
      }
    }, 2000)
  }

  const handleAddMachine = async () => {
    setIsRegistering(true)
    setError('')

    try {
      // Get system information including GPU details
      const systemInfo = await getSystemInfo()
      console.log('Detected system info:', systemInfo)

      const machineName = `${systemInfo.platform}-${systemInfo.gpuName.substring(0, 20)}`

      const newMachine = await machineApi.registerMachine({
        name: machineName,
        description: 'Registered from desktop app',
        device_id: systemInfo.deviceId,
        gpu_name: systemInfo.gpuName,
        vram_gb: systemInfo.vramGB
      })

      setMachines([...machines, newMachine])
      setShowAddMachine(false)
      console.log('Machine registered:', newMachine)

      // Auto-connect to the newly registered machine
      connectToMachine(newMachine.auth_token, systemInfo.gpuName, systemInfo.vramGB)
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Failed to register machine'
      setError(errorMessage)
      console.error('Registration error:', err)
      setTimeout(() => {
        setError('')
      }, 5000)
    } finally {
      setIsRegistering(false)
    }
  }

  const copyToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(token)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  const maskToken = (token: string) => {
    if (token.length <= 8) return token
    return token.substring(0, 4) + '•'.repeat(token.length - 8) + token.substring(token.length - 4)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-transparent bg-clip-text">
                Dashboard
              </span>
            </h1>
            <p className="text-slate-400">Manage your GPU provider machines</p>
          </div>
          <Button
            variant="outline"
            onClick={onLogout}
            className="border-slate-700/50 hover:bg-slate-800/50 text-white"
          >
            Logout
          </Button>
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">My Machines</h2>
          <Button
            onClick={async () => {
              setShowAddMachine(true)
              const sysInfo = await getSystemInfo()
              setDetectedGPU({ name: sysInfo.gpuName, vram: sysInfo.vramGB })
            }}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Machine
          </Button>
        </div>

        {isLoading ? (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-800/50">
            <CardContent className="p-8 text-center">
              <p className="text-slate-400">Loading machines...</p>
            </CardContent>
          </Card>
        ) : machines.length === 0 ? (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-800/50">
            <CardContent className="p-12 text-center space-y-4">
              <Server className="w-16 h-16 mx-auto text-slate-600" />
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">No machines registered</h3>
                <p className="text-slate-400 mb-6">
                  Register your first machine to start providing GPU resources
                </p>
                <Button
                  onClick={() => setShowAddMachine(true)}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Register This Machine
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {machines.map((machine) => (
              <Card
                key={machine.id}
                className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-800/50"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-orange-500/10">
                        <Server className="w-6 h-6 text-orange-500" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{machine.name}</CardTitle>
                        {machine.description && (
                          <p className="text-sm text-slate-400 mt-1">{machine.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {machine.is_online ? (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                          <Wifi className="w-4 h-4 text-green-500" />
                          <span className="text-sm text-green-400">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-500/10 border border-slate-500/20">
                          <WifiOff className="w-4 h-4 text-slate-500" />
                          <span className="text-sm text-slate-400">Offline</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {machine.gpu_name && (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                      <span className="text-sm text-slate-400">GPU</span>
                      <span className="text-sm text-white font-medium">
                        {machine.gpu_name} {machine.vram_gb && `(${machine.vram_gb}GB)`}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">Auth Token</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 font-mono text-sm text-slate-300">
                        {maskToken(machine.auth_token)}
                      </div>
                      <Button
                        onClick={() => copyToken(machine.auth_token)}
                        variant="outline"
                        size="icon"
                        className="border-slate-700/50 hover:bg-slate-800/50"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    {copiedToken === machine.auth_token && (
                      <p className="text-xs text-green-400">Token copied to clipboard!</p>
                    )}
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                    <span className="text-sm text-slate-400">Status</span>
                    <div className="flex items-center gap-2">
                      {connectionStatus === 'connected' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="text-sm text-green-400 font-medium">Online</span>
                        </>
                      ) : connectionStatus === 'connecting' ? (
                        <>
                          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                          <span className="text-sm text-orange-400 font-medium">Connecting...</span>
                        </>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-slate-500" />
                          <span className="text-sm text-slate-400 font-medium">Offline</span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {showAddMachine && (
          <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white">Register New Machine</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-slate-400 text-sm">
                This will register the current machine and generate an authentication token for it.
              </p>

              {detectedGPU && (
                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50 space-y-2">
                  <p className="text-sm font-medium text-slate-300">Detected Hardware:</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">GPU</span>
                    <span className="text-sm text-white font-medium">{detectedGPU.name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">VRAM</span>
                    <span className="text-sm text-white font-medium">{detectedGPU.vram} GB</span>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleAddMachine}
                  disabled={isRegistering}
                  className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {isRegistering ? 'Registering...' : 'Register This Machine'}
                </Button>
                <Button
                  onClick={() => {
                    setShowAddMachine(false)
                    setDetectedGPU(null)
                  }}
                  variant="outline"
                  className="border-slate-700/50 hover:bg-slate-800/50 text-white"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
