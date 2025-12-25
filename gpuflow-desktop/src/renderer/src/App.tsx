import { useState, useEffect } from 'react'
import { RegisterForm } from './components/RegisterForm'
import { LoginForm } from './components/LoginForm'
import { Dashboard } from './components/Dashboard'
import { Button } from './components/ui/button'
import { healthCheck, type HealthCheckResponse } from '@/lib/api'

type View = 'home' | 'register' | 'login' | 'dashboard'

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<View>('home')
  const [backendStatus, setBackendStatus] = useState<{
    connected: boolean
    data?: HealthCheckResponse
    error?: string
  }>({ connected: false })

  useEffect(() => {
    const checkBackend = async () => {
      try {
        console.log('🔍 Checking backend connection...')
        const data = await healthCheck()
        console.log('✅ Backend connected successfully:', data)
        setBackendStatus({ connected: true, data })
      } catch (error: any) {
        console.error('❌ Backend connection failed:', error.message)
        setBackendStatus({
          connected: false,
          error: error.message || 'Failed to connect to backend'
        })
      }
    }

    checkBackend()

    // Check if user is already logged in
    const token = localStorage.getItem('access_token')
    if (token) {
      setCurrentView('dashboard')
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user_email')
    setCurrentView('home')
  }

  const handleLoginSuccess = () => {
    setCurrentView('dashboard')
  }

  if (currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />
  }

  if (currentView === 'register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">GPUFlow</h1>
            <p className="text-gray-400">Desktop Provider Application</p>
          </div>
          <RegisterForm onSwitchToLogin={() => setCurrentView('login')} />
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('home')}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (currentView === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">GPUFlow</h1>
            <p className="text-gray-400">Desktop Provider Application</p>
          </div>
          <LoginForm
            onSwitchToRegister={() => setCurrentView('register')}
            onLoginSuccess={handleLoginSuccess}
          />
          <div className="text-center">
            <Button
              variant="ghost"
              onClick={() => setCurrentView('home')}
              className="text-gray-400 hover:text-white"
            >
              ← Back to Home
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold mb-2">
            <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-transparent bg-clip-text">
              GPUFlow
            </span>
          </h1>
          <p className="text-slate-400 text-lg font-medium">Desktop Provider Application</p>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Connect your machine to the GPUFlow network and start earning by providing GPU resources
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-slate-800/50">
          <div className="space-y-4">
            <Button
              onClick={() => setCurrentView('register')}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 text-base font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
            >
              Create Account
            </Button>

            <Button
              onClick={() => setCurrentView('login')}
              variant="outline"
              className="w-full border-slate-700/50 hover:bg-slate-800/50 text-white h-11 text-base font-medium"
            >
              Sign In
            </Button>
          </div>
        </div>

        <div className="text-center space-y-2">
          <div className="text-slate-500 text-xs">
            <p>Secure • Fast • Reliable</p>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs">
            <div
              className={`w-2 h-2 rounded-full ${
                backendStatus.connected ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className={backendStatus.connected ? 'text-green-400' : 'text-red-400'}>
              {backendStatus.connected
                ? `Backend: ${backendStatus.data?.project || 'Connected'}`
                : 'Backend: Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
