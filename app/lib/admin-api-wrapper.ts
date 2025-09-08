import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, User } from './auth'

export type AdminApiHandler = (
  request: NextRequest,
  context: {
    params?: any
    user: User
  }
) => Promise<NextResponse>

/**
 * Wrapper for admin API routes that handles authentication and error handling
 */
export function withAdminAuth(handler: AdminApiHandler) {
  return async (request: NextRequest, context?: { params?: any }) => {
    try {
      // Check admin permissions
      const user = await requireAdmin(request)
      
      // Handle both direct params and nested params structure
      const params = context?.params || context;
      
      // Call the actual handler with user context
      return await handler(request, {
        params,
        user
      })
    } catch (error: any) {
      console.error('Admin API Error:', error)
      
      // Handle authentication errors
      if (error.message === 'Authentication required') {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // Handle authorization errors
      if (error.message === 'Admin privileges required') {
        return NextResponse.json(
          { error: 'Admin privileges required' },
          { status: 403 }
        )
      }
      
      // Handle other errors
      return NextResponse.json(
        { error: error.message || 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Helper to create standard API responses
 */
export const ApiResponse = {
  success: (data: any, status = 200) => {
    return NextResponse.json(data, { status })
  },
  
  created: (data: any) => {
    return NextResponse.json(data, { status: 201 })
  },
  
  error: (message: string, status = 400) => {
    return NextResponse.json({ error: message }, { status })
  },
  
  notFound: (message = 'Resource not found') => {
    return NextResponse.json({ error: message }, { status: 404 })
  },
  
  unauthorized: (message = 'Authentication required') => {
    return NextResponse.json({ error: message }, { status: 401 })
  },
  
  forbidden: (message = 'Insufficient permissions') => {
    return NextResponse.json({ error: message }, { status: 403 })
  }
}
