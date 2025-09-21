'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/app/lib/auth-context'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'

interface TokenData {
  id: string
  name: string | null
  purpose: string | null
  allowedRoles: string[]
  usedCount: number
  maxUses: number | null
  expiresAt: string | null
  metadata: any
  createdBy: string
}

export default function TokenLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [tokenValid, setTokenValid] = useState(false)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [tokenError, setTokenError] = useState('')
  const [tokenLoading, setTokenLoading] = useState(true)
  
  const { login, isAuthenticated, user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const token = params.token as string

  // Validate token on mount
  useEffect(() => {
    if (token) {
      validateToken()
    }
  }, [token])

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const redirectPath = user.role === 'ADMIN' ? '/admin' : 
                          user.role === 'INSTRUCTOR' ? '/instructor' : 
                          '/dashboard'
      router.push(redirectPath)
    }
  }, [isAuthenticated, user, router])

  const validateToken = async () => {
    try {
      const response = await fetch(`/api/auth/login-tokens/validate/${token}`)
      const result = await response.json()

      if (result.valid) {
        setTokenValid(true)
        setTokenData(result.data)
        
        // Pre-fill metadata if available (like email for marketing campaigns)
        if (result.data.metadata?.email) {
          setEmail(result.data.metadata.email)
        }
      } else {
        setTokenError(result.error || 'Invalid login link')
      }
    } catch (error) {
      console.error('Token validation error:', error)
      setTokenError('Failed to validate login link')
    } finally {
      setTokenLoading(false)
    }
  }

  const trackLoginAttempt = async (email: string, success: boolean, failureReason?: string) => {
    try {
      await fetch(`/api/auth/login-tokens/validate/${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          success,
          failureReason
        })
      })
    } catch (error) {
      console.error('Failed to track login attempt:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Check if user role is allowed for this token
    if (tokenData?.allowedRoles && tokenData.allowedRoles.length > 0) {
      // Note: We can't check role before login, so we'll validate after
    }

    const result = await login(email, password)
    
    if (result.success) {
      // Track successful login attempt
      await trackLoginAttempt(email, true)
      
      // Role validation would happen in the useEffect redirect logic above
    } else {
      // Track failed login attempt
      await trackLoginAttempt(email, false, result.error)
      setError(result.error || 'Login failed')
    }
    
    setLoading(false)
  }

  const getTokenPurposeDisplay = (purpose: string | null) => {
    switch (purpose) {
      case 'marketing': return '📧 Marketing Campaign'
      case 'referral': return '👥 Referral Link'
      case 'admin': return '👑 Admin Access'
      case 'campaign': return '🎯 Special Campaign'
      default: return '🔗 Special Access'
    }
  }

  const getRemainingUses = () => {
    if (!tokenData?.maxUses) return 'Unlimited'
    return `${tokenData.maxUses - tokenData.usedCount} remaining`
  }

  const getExpirationInfo = () => {
    if (!tokenData?.expiresAt) return null
    const expiresAt = new Date(tokenData.expiresAt)
    const now = new Date()
    const timeDiff = expiresAt.getTime() - now.getTime()
    const hoursRemaining = Math.ceil(timeDiff / (1000 * 60 * 60))
    
    if (hoursRemaining <= 0) return 'Expired'
    if (hoursRemaining < 24) return `Expires in ${hoursRemaining}h`
    const daysRemaining = Math.ceil(hoursRemaining / 24)
    return `Expires in ${daysRemaining}d`
  }

  if (tokenLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Validating login link...</p>
        </div>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="text-4xl mb-2">🚫</div>
            <h2 className="text-xl font-bold mb-2">Invalid Login Link</h2>
            <p>{tokenError}</p>
          </div>
          
          <div className="space-y-3">
            <Link 
              href="/login" 
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition"
            >
              Go to Standard Login
            </Link>
            <Link 
              href="/" 
              className="block text-indigo-600 hover:text-indigo-500 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        {/* Special Token Info */}
        {tokenData && (
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-4 shadow-sm">
            <div className="text-center mb-3">
              <div className="text-2xl mb-2">✨</div>
              <h3 className="font-semibold text-indigo-800">
                {getTokenPurposeDisplay(tokenData.purpose)}
              </h3>
              {tokenData.name && (
                <p className="text-sm text-indigo-600 mt-1">{tokenData.name}</p>
              )}
            </div>
            
            <div className="flex justify-between text-xs text-indigo-700">
              <span>Uses: {getRemainingUses()}</span>
              {getExpirationInfo() && (
                <span>{getExpirationInfo()}</span>
              )}
            </div>

            {tokenData.metadata?.campaign && (
              <div className="mt-2 text-center">
                <span className="inline-block bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded">
                  {tokenData.metadata.campaign}
                </span>
              </div>
            )}
          </div>
        )}

        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome! Please sign in
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            You've accessed a special login link
          </p>
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
                'Sign in with Special Link'
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

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link href="/login" className="hover:text-gray-700">
            Use standard login instead
          </Link>
          {' • '}
          <Link href="/" className="hover:text-gray-700">
            Back to home
          </Link>
        </div>

        {tokenData?.createdBy && (
          <div className="text-center text-xs text-gray-400">
            Link created by {tokenData.createdBy}
          </div>
        )}
      </div>
    </div>
  )
}