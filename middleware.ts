import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Public routes that don't require authentication
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/public',
  '/classes',
  '/events',
  '/instructors',
  '/about',
  '/contact',
  '/api/swagger',
  '/unauthorized',
  '/error'
]

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin'
]

// Instructor routes (admin or instructor role required)
const instructorRoutes = [
  '/instructor'
]

// User routes (any authenticated user)
const userRoutes = [
  '/dashboard',
  '/profile'
]

// Partner matching routes (students/users and instructors only)
const partnerMatchingRoutes = [
  '/dashboard/partner-matching',
  '/api/user/partner-discovery',
  '/api/user/match-requests',
  '/api/user/profile'
]

// Helper function to check if path starts with any of the given routes
function pathStartsWith(path: string, routes: string[]): boolean {
  return routes.some(route => path.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // Allow public routes
  if (publicRoutes.some(route => path === route) || path.startsWith('/api/public') || path.startsWith('/_next') || path.startsWith('/favicon')) {
    return NextResponse.next()
  }

  // Get authentication data from session cookies
  const sessionId = request.cookies.get('session_id')?.value
  const userId = request.cookies.get('user_id')?.value
  const userRole = request.cookies.get('user_role')?.value
  
  // Also check for JWT token in header for API requests
  const token = request.headers.get('authorization')?.replace('Bearer ', '')

  // Helper function to decode JWT payload (without verification for performance)
  function decodeToken(token: string) {
    try {
      return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())
    } catch {
      return null
    }
  }

  // Helper function to handle authentication redirects
  function handleAuthRedirect(requiresAuth: boolean = true, requiredRole?: string) {
    // Check for session-based authentication first
    const isAuthenticated = sessionId && userId && userRole
    
    // Always require authentication - no development mode bypass
    if (!isAuthenticated && !token && requiresAuth) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Handle role-based access control
    if (requiredRole) {
      let currentUserRole = userRole
      
      // If using JWT token, decode it for role
      if (token && !currentUserRole) {
        const payload = decodeToken(token)
        if (!payload) {
          if (path.startsWith('/api/')) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
          }
          return NextResponse.redirect(new URL('/login', request.url))
        }
        currentUserRole = payload.role
      }
      if (requiredRole === 'ADMIN' && currentUserRole !== 'ADMIN') {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      if (requiredRole === 'INSTRUCTOR' && currentUserRole !== 'ADMIN' && currentUserRole !== 'INSTRUCTOR') {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Instructor privileges required' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }

      if (requiredRole === 'STUDENT_OR_INSTRUCTOR' && currentUserRole !== 'USER' && currentUserRole !== 'INSTRUCTOR') {
        if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Student or instructor privileges required' }, { status: 403 })
        }
        return NextResponse.redirect(new URL('/unauthorized', request.url))
      }
    }

    return NextResponse.next()
  }

  // Check route-specific authentication requirements
  if (pathStartsWith(path, adminRoutes)) {
    return handleAuthRedirect(true, 'ADMIN')
  }

  if (pathStartsWith(path, instructorRoutes)) {
    return handleAuthRedirect(true, 'INSTRUCTOR')
  }

  if (pathStartsWith(path, partnerMatchingRoutes)) {
    return handleAuthRedirect(true, 'STUDENT_OR_INSTRUCTOR')
  }

  if (pathStartsWith(path, userRoutes)) {
    return handleAuthRedirect(true)
  }

  // Allow all other routes
  return NextResponse.next()
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
