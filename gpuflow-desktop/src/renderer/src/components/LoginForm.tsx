import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card'
import { authApi } from '@/lib/api'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onLoginSuccess: () => void
}

export function LoginForm({
  onSwitchToRegister,
  onLoginSuccess
}: LoginFormProps): React.JSX.Element {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await authApi.login(formData.email, formData.password)
      localStorage.setItem('access_token', response.access_token)
      localStorage.setItem('user_email', formData.email)

      console.log('Login successful:', response)
      onLoginSuccess()
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || 'Invalid email or password'
      setError(errorMessage)
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <Card className="w-full max-w-md bg-gradient-to-br from-slate-900/80 to-slate-800/80 border-slate-800/50 backdrop-blur-xl shadow-2xl">
      <CardHeader className="text-center pb-8">
        <CardTitle className="text-3xl font-bold mb-2">
          <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 text-transparent bg-clip-text">
            Welcome Back
          </span>
        </CardTitle>
        <p className="text-slate-400 text-sm">Sign in to your GPUFlow account</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-slate-300">
              Email
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              className="bg-slate-800/50 border-slate-700/50 text-white focus:border-orange-500/50 transition-colors h-11 placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-slate-300">
              Password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              className="bg-slate-800/50 border-slate-700/50 text-white focus:border-orange-500/50 transition-colors h-11 placeholder:text-slate-500"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 text-base font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col items-center gap-4">
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-slate-900/80 px-2 text-slate-500">Or</span>
          </div>
        </div>
        <p className="text-center text-sm text-slate-400">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-orange-400 hover:text-orange-300 font-medium transition-colors"
          >
            Create one
          </button>
        </p>
      </CardFooter>
    </Card>
  )
}
