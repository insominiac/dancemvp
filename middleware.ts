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
  '/contact'
]

// Admin-only routes
const adminRoutes = [
  '/admin',
  '/api/admin'
]

// Helper function to check if path starts with any of the given routes
function pathStartsWith(path: string, routes: string[]): boolean {
  return routes.some(route => path.startsWith(route))
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow public routes
  if (publicRoutes.some(route => path === route || path.startsWith('/api/public'))) {
    return NextResponse.next()
  }

  // Check for admin routes
  if (pathStartsWith(path, adminRoutes)) {
    try {
      // Get token from cookie or header
      const token = request.cookies.get('auth-token')?.value ||
                   request.headers.get('authorization')?.replace('Bearer ', '')

      // In development mode, allow access without token (mock admin user will be used)
      if (!token && process.env.NODE_ENV === 'development') {
        console.log('🔓 Middleware: Development mode - allowing admin access')
        
        // Add a header to indicate development mode
        const response = NextResponse.next()
        response.headers.set('X-Dev-Mode', 'true')
        response.headers.set('X-Dev-User', 'admin')
        return response
      }

      // In production, require token
      if (!token && process.env.NODE_ENV === 'production') {
        // Redirect to login for web requests
        if (!path.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/login', request.url))
        }
        
        // Return 401 for API requests
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }

      // If token exists, verify it's an admin token
      if (token) {
        try {
          // Basic JWT decode (without verification for middleware performance)
          // Full verification happens in the auth utility
          const payload = JSON.parse(
            Buffer.from(token.split('.')[1], 'base64').toString()
          )

          // Check if user is admin
          if (payload.role !== 'ADMIN') {
            // Return 403 Forbidden for non-admin users
            if (!path.startsWith('/api/')) {
              return NextResponse.redirect(new URL('/unauthorized', request.url))
            }
            
            return NextResponse.json(
              { error: 'Admin privileges required' },
              { status: 403 }
            )
          }
        } catch (error) {
          console.error('Token decode error:', error)
          
          // Invalid token
          if (!path.startsWith('/api/')) {
            return NextResponse.redirect(new URL('/login', request.url))
          }
          
          return NextResponse.json(
            { error: 'Invalid authentication token' },
            { status: 401 }
          )
        }
      }

      // Allow the request to proceed
      return NextResponse.next()
      
    } catch (error) {
      console.error('Middleware error:', error)
      
      // On error, deny access
      if (!path.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/error', request.url))
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }

  // For all other authenticated routes (future user dashboard, etc.)
  if (path.startsWith('/dashboard') || path.startsWith('/profile')) {
    const token = request.cookies.get('auth-token')?.value ||
                 request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      if (!path.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

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
