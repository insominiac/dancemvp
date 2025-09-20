'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [logoutMessage, setLogoutMessage] = useState('')
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()

  // Check for logout message and redirect if already authenticated
  useEffect(() => {
    // Check if user just logged out
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('logout') === 'success') {
      setLogoutMessage('You have been successfully logged out.')
      // Remove the parameter from URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname)
    }
    
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'ADMIN' ? '/admin' : 
                          user.role === 'INSTRUCTOR' ? '/instructor' : 
                          '/dashboard'
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(email, password)
    
    if (result.success) {
      // Redirect will happen via useEffect above
    } else {
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  const handleDemoLogin = async (role: 'admin' | 'instructor' | 'user') => {
    setLoading(true)
    setError('')

    let demoCredentials: { email: string; password: string }

    switch (role) {
      case 'admin':
        demoCredentials = { email: 'admin@dev.local', password: 'admin123' }
        break
      case 'instructor':
        demoCredentials = { email: 'instructor@demo.com', password: 'instructor123' }
        break
      case 'user':
        demoCredentials = { email: 'user@demo.com', password: 'user123' }
        break
    }

    const result = await login(demoCredentials.email, demoCredentials.password)
    
    if (!result.success) {
      setError(result.error || 'Demo login failed')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link 
              href="/register" 
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {/* Demo Login Buttons */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center mb-3">
            <span className="text-lg mr-2">🎭</span>
            <h3 className="text-sm font-semibold text-blue-800">Try Demo Accounts</h3>
          </div>
          <p className="text-xs text-blue-600 mb-4">Experience different user roles instantly</p>
          <div className="space-y-3">
            <button
              onClick={() => handleDemoLogin('admin')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-50 to-red-100 hover:from-red-100 hover:to-red-150 border border-red-200 text-red-800 py-3 px-4 rounded-lg transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">👑</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">Admin Dashboard</div>
                    <div className="text-xs opacity-75">Full system management</div>
                  </div>
                </div>
                <span className="text-xs font-mono bg-red-200 px-2 py-1 rounded text-red-700">admin@dev.local</span>
              </div>
            </button>
            
            <button
              onClick={() => handleDemoLogin('instructor')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-150 border border-green-200 text-green-800 py-3 px-4 rounded-lg transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">🎓</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">Instructor Panel</div>
                    <div className="text-xs opacity-75">Class & student management</div>
                  </div>
                </div>
                <span className="text-xs font-mono bg-green-200 px-2 py-1 rounded text-green-700">instructor@demo.com</span>
              </div>
            </button>
            
            <button
              onClick={() => handleDemoLogin('user')}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-150 border border-blue-200 text-blue-800 py-3 px-4 rounded-lg transition-all disabled:opacity-50 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg mr-2">💃</span>
                  <div className="text-left">
                    <div className="text-sm font-medium">Student Dashboard</div>
                    <div className="text-xs opacity-75">Book classes & events</div>
                  </div>
                </div>
                <span className="text-xs font-mono bg-blue-200 px-2 py-1 rounded text-blue-700">user@demo.com</span>
              </div>
            </button>
          </div>
          
          <div className="mt-3 pt-3 border-t border-blue-200">
            <p className="text-xs text-blue-600 text-center">
              💡 Each role has different access levels and features
            </p>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {logoutMessage && (
            <div className="text-green-600 text-sm text-center bg-green-50 border border-green-200 rounded-md p-3">
              {logoutMessage}
            </div>
          )}
          
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 border border-red-200 rounded-md p-3">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>

          <div className="text-center">
            <Link 
              href="/forgot-password" 
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot your password?
            </Link>
          </div>
        </form>

        <div className="mt-6">
          <div className="text-center text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-700">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
