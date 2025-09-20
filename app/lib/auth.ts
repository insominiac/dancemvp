import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import bcryptjs from 'bcryptjs'
import prisma from './db'

// User type from database
export interface User {
  id: string
  email: string
  fullName: string
  role: 'USER' | 'INSTRUCTOR' | 'ADMIN'
  isVerified: boolean
}

// JWT payload type
interface JWTPayload {
  userId: string
  email: string
  role: string
}

// Get JWT secret (will be replaced with proper env variable)
const getJWTSecret = () => {
  return process.env.JWT_SECRET || 'development-secret-key-replace-in-production'
}

/**
 * Verify JWT token and return user data
 */
export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const payload = jwt.verify(token, getJWTSecret()) as JWTPayload
    return payload
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Get current user from request
 * In development, returns a mock admin user if no token is present
 */
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')

    // If no token, try to get from cookies
    const cookieToken = cookies().get('auth-token')?.value

    const finalToken = token || cookieToken

    if (!finalToken) {
      return null
    }

    // Verify token
    const payload = await verifyToken(finalToken)
    if (!payload) {
      return null
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true
      }
    })

    return user
  } catch (error) {
    console.error('Error getting current user:', error)
    return null
  }
}

/**
 * Check if user is admin
 */
export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN'
}

/**
 * Check if user is instructor
 */
export function isInstructor(user: User | null): boolean {
  return user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN'
}

/**
 * Check if user has permission for an action
 */
export function hasPermission(
  user: User | null,
  resource: string,
  action: 'create' | 'read' | 'update' | 'delete'
): boolean {
  if (!user) return false

  // Admins have all permissions
  if (user.role === 'ADMIN') {
    return true
  }

  // Define permissions for different roles
  const permissions: Record<string, Record<string, string[]>> = {
    INSTRUCTOR: {
      classes: ['read', 'update'], // Can read all classes and update their own
      events: ['read'],
      bookings: ['read'], // Can see bookings for their classes
      users: ['read'], // Can see student info
      venues: ['read'],
      'dance-styles': ['read']
    },
    USER: {
      classes: ['read'],
      events: ['read'],
      bookings: ['read'], // Can only see their own bookings
      venues: ['read'],
      'dance-styles': ['read']
    }
  }

  const rolePermissions = permissions[user.role]
  if (!rolePermissions) return false

  const resourcePermissions = rolePermissions[resource]
  if (!resourcePermissions) return false

  return resourcePermissions.includes(action)
}

/**
 * Require admin role - throws error if not admin
 */
export async function requireAdmin(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }

  if (!isAdmin(user)) {
    throw new Error('Admin privileges required')
  }

  return user
}

/**
 * Require authenticated user - throws error if not authenticated
 */
export async function requireAuth(request: NextRequest): Promise<User> {
  const user = await getCurrentUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }

  return user
}

/**
 * Generate JWT token for user
 */
export function generateToken(user: { id: string; email: string; role: string }): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role
  }

  return jwt.sign(payload, getJWTSecret(), {
    expiresIn: '7d'
  })
}

/**
 * Create session for user (sets cookie)
 */
export async function createSession(user: { id: string; email: string; role: string }) {
  const token = generateToken(user)
  
  cookies().set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  })

  return token
}

/**
 * Clear session (removes cookie)
 */
export async function clearSession() {
  // Clear the cookie with proper parameters
  cookies().set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0, // Expire immediately
    expires: new Date(0) // Set to past date
  })
  
  // Also delete the cookie
  cookies().delete('auth-token')
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcryptjs.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await bcryptjs.compare(password, hash)
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' }
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one lowercase letter' }
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: 'Password must contain at least one uppercase letter' }
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain at least one number' }
  }
  
  return { valid: true }
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isVerified: true,
        passwordHash: true
      }
    })

    if (!user || !user.passwordHash) {
      return null
    }

    const isPasswordValid = await verifyPassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return null
    }

    // Return user without password hash
    const { passwordHash, ...userWithoutPassword } = user
    return userWithoutPassword
  } catch (error) {
    console.error('Authentication error:', error)
    return null
  }
}
