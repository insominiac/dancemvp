'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User } from './auth'
import { getClientDeviceInfo } from './device-fingerprint'

interface AuthContextType {
  user: User | null
  loading: boolean
  sessionId: string | null
  activeSessions: SessionInfo[]
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; conflictingRole?: string }>
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  isInstructor: boolean
  checkAuth: () => Promise<void>
  switchRole: (targetRole: 'USER' | 'INSTRUCTOR' | 'ADMIN') => Promise<{ success: boolean; error?: string }>
  terminateOtherSessions: () => Promise<number>
  refreshSessions: () => Promise<void>
}

interface SessionInfo {
  id: string
  userRole: string
  deviceInfo: string
  ipAddress: string
  lastAccessedAt: string
  createdAt: string
  expiresAt: string
}

interface RegisterData {
  email: string
  password: string
  fullName: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [activeSessions, setActiveSessions] = useState<SessionInfo[]>([])

  // Check authentication status and validate session
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
        setSessionId(userData.sessionId || null)
        
        // Fetch active sessions if user is authenticated
        if (userData.user) {
          await refreshSessions()
        }
      } else {
        setUser(null)
        setSessionId(null)
        setActiveSessions([])
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUser(null)
      setSessionId(null)
      setActiveSessions([])
    } finally {
      setLoading(false)
    }
  }

  // Refresh active sessions
  const refreshSessions = async () => {
    if (!user) return
    
    try {
      const response = await fetch(`/api/auth/sessions?userId=${user.id}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setActiveSessions(data.sessions || [])
      }
    } catch (error) {
      console.error('Error fetching sessions:', error)
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setUser(data.user)
        setSessionId(data.sessionId || null)
        
        // Refresh sessions after successful login
        if (data.user) {
          await refreshSessions()
        }
        
        return { 
          success: true,
          conflictingRole: data.conflictingRole 
        }
      } else {
        return { 
          success: false, 
          error: data.error || 'Login failed',
          conflictingRole: data.conflictingRole
        }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  const register = async (registerData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Registration failed' 
        }
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error(`Logout failed with status: ${response.status}`)
      }
      
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if the logout request fails, clear user state
    } finally {
      // Always clear user state
      setUser(null)
      setSessionId(null)
      setActiveSessions([])
      setLoading(false)
    }
  }

  // Switch between roles (if user has multiple roles)
  const switchRole = async (targetRole: 'USER' | 'INSTRUCTOR' | 'ADMIN') => {
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Check if user has the target role
    if (targetRole === 'ADMIN' && user.role !== 'ADMIN') {
      return { success: false, error: 'Insufficient permissions for admin role' }
    }
    
    if (targetRole === 'INSTRUCTOR' && user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN') {
      return { success: false, error: 'Insufficient permissions for instructor role' }
    }

    try {
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ targetRole }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSessionId(data.sessionId)
        await refreshSessions()
        return { success: true }
      } else {
        return { 
          success: false, 
          error: data.error || 'Failed to switch role' 
        }
      }
    } catch (error) {
      console.error('Role switch error:', error)
      return { 
        success: false, 
        error: 'Network error. Please try again.' 
      }
    }
  }

  // Terminate all other sessions except current one
  const terminateOtherSessions = async () => {
    if (!sessionId) return 0

    try {
      const response = await fetch(`/api/auth/sessions?sessionId=${sessionId}&action=others`, {
        method: 'DELETE',
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        await refreshSessions()
        return data.terminatedCount || 0
      }
    } catch (error) {
      console.error('Error terminating sessions:', error)
    }
    
    return 0
  }

  const isAuthenticated = !!user
  const isAdmin = user?.role === 'ADMIN'
  const isInstructor = user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'

  const contextValue: AuthContextType = {
    user,
    loading,
    sessionId,
    activeSessions,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    isInstructor,
    checkAuth,
    switchRole,
    terminateOtherSessions,
    refreshSessions,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Additional utility hooks
export function useRequireAuth(redirectTo: string = '/login') {
  const { isAuthenticated, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = redirectTo
    }
  }, [isAuthenticated, loading, redirectTo])

  return { isAuthenticated, loading }
}

export function useRequireAdmin(redirectTo: string = '/unauthorized') {
  const { isAdmin, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAdmin) {
      window.location.href = redirectTo
    }
  }, [isAdmin, loading, redirectTo])

  return { isAdmin, loading }
}

export function useRequireInstructor(redirectTo: string = '/unauthorized') {
  const { isInstructor, loading } = useAuth()
  
  useEffect(() => {
    if (!loading && !isInstructor) {
      window.location.href = redirectTo
    }
  }, [isInstructor, loading, redirectTo])

  return { isInstructor, loading }
}
