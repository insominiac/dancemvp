import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { AuditLogger } from './audit-logger'

export interface AuditMiddlewareConfig {
  excludePaths?: string[]
  includeBody?: boolean
  logLevel?: 'all' | 'mutations' | 'admin-only'
  sensitiveFields?: string[]
}

const defaultConfig: AuditMiddlewareConfig = {
  excludePaths: ['/api/health', '/api/status'],
  includeBody: false,
  logLevel: 'mutations',
  sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization']
}

export function createAuditMiddleware(config: AuditMiddlewareConfig = {}) {
  const finalConfig = { ...defaultConfig, ...config }

  return async function auditMiddleware(
    request: NextRequest,
    handler: (req: NextRequest) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const startTime = Date.now()
    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method

    // Skip excluded paths
    if (finalConfig.excludePaths?.some(path => pathname.includes(path))) {
      return handler(request)
    }

    // Skip non-mutation requests based on log level
    if (finalConfig.logLevel === 'mutations' && !['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return handler(request)
    }

    // Skip non-admin paths for admin-only logging
    if (finalConfig.logLevel === 'admin-only' && !pathname.includes('/admin')) {
      return handler(request)
    }

    let userId: string = 'anonymous'
    let userRole: string = 'guest'

    try {
      const session = await getServerSession(authOptions)
      if (session?.user) {
        userId = (session.user as any).id || 'unknown'
        userRole = (session.user as any).role || 'user'
      }
    } catch (error) {
      console.error('Error getting session for audit middleware:', error)
    }

    let requestBody: any = null
    if (finalConfig.includeBody && ['POST', 'PUT', 'PATCH'].includes(method)) {
      try {
        const text = await request.clone().text()
        if (text) {
          requestBody = JSON.parse(text)
          // Remove sensitive fields
          requestBody = sanitizeSensitiveData(requestBody, finalConfig.sensitiveFields || [])
        }
      } catch (error) {
        // Ignore JSON parsing errors
      }
    }

    let response: NextResponse
    let responseBody: any = null
    let statusCode = 500

    try {
      // Execute the handler
      response = await handler(request)
      statusCode = response.status

      // Capture response body for logging (only for errors or admin operations)
      if (finalConfig.includeBody && (statusCode >= 400 || pathname.includes('/admin'))) {
        try {
          const text = await response.clone().text()
          if (text) {
            responseBody = JSON.parse(text)
            responseBody = sanitizeSensitiveData(responseBody, finalConfig.sensitiveFields || [])
          }
        } catch (error) {
          // Ignore JSON parsing errors
        }
      }
    } catch (error) {
      statusCode = 500
      responseBody = { error: error instanceof Error ? error.message : 'Unknown error' }
      throw error
    } finally {
      // Log the API access
      const duration = Date.now() - startTime
      
      try {
        await AuditLogger.logApiAccess(
          userId, 
          pathname, 
          method, 
          statusCode
        )

        // Log detailed information for important operations
        if (shouldLogDetailed(pathname, method, statusCode)) {
          await AuditLogger.log({
            userId,
            action: `API_${method}_${getActionFromPath(pathname)}`,
            tableName: 'api_detailed_logs',
            recordId: pathname,
            newValues: {
              method,
              statusCode,
              duration,
              userRole,
              requestBody: finalConfig.includeBody ? requestBody : undefined,
              responseBody: finalConfig.includeBody ? responseBody : undefined,
              queryParams: Object.fromEntries(url.searchParams.entries())
            }
          })
        }

        // Log authentication failures
        if (statusCode === 401 || statusCode === 403) {
          await AuditLogger.logSecurityEvent(
            userId,
            'ACCESS_DENIED',
            {
              endpoint: pathname,
              method,
              statusCode,
              userRole
            }
          )
        }

      } catch (auditError) {
        console.error('Error logging audit trail:', auditError)
        // Don't fail the request due to audit logging issues
      }
    }

    return response
  }
}

function sanitizeSensitiveData(data: any, sensitiveFields: string[]): any {
  if (typeof data !== 'object' || data === null) {
    return data
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeSensitiveData(item, sensitiveFields))
  }

  const sanitized: any = {}
  for (const [key, value] of Object.entries(data)) {
    if (sensitiveFields.some(field => 
      key.toLowerCase().includes(field.toLowerCase())
    )) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeSensitiveData(value, sensitiveFields)
    } else {
      sanitized[key] = value
    }
  }
  
  return sanitized
}

function shouldLogDetailed(pathname: string, method: string, statusCode: number): boolean {
  // Log detailed info for:
  // - Admin operations
  // - User authentication/authorization
  // - Critical business operations
  // - Errors
  
  if (statusCode >= 400) return true
  if (pathname.includes('/admin')) return true
  if (pathname.includes('/auth')) return true
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return pathname.includes('/users') || 
           pathname.includes('/bookings') || 
           pathname.includes('/payments') ||
           pathname.includes('/transactions')
  }
  
  return false
}

function getActionFromPath(pathname: string): string {
  // Extract meaningful action from pathname
  const parts = pathname.split('/').filter(Boolean)
  
  if (parts.includes('admin')) return 'ADMIN_OPERATION'
  if (parts.includes('auth')) return 'AUTH_OPERATION'
  if (parts.includes('users')) return 'USER_OPERATION'
  if (parts.includes('classes')) return 'CLASS_OPERATION'
  if (parts.includes('events')) return 'EVENT_OPERATION'
  if (parts.includes('bookings')) return 'BOOKING_OPERATION'
  if (parts.includes('payments')) return 'PAYMENT_OPERATION'
  
  return 'API_OPERATION'
}

// Helper function to wrap an API route handler with audit middleware
export function withAudit<T extends NextRequest>(
  handler: (req: T) => Promise<NextResponse>,
  config?: AuditMiddlewareConfig
) {
  const middleware = createAuditMiddleware(config)
  
  return async (request: T): Promise<NextResponse> => {
    return middleware(request, handler)
  }
}

// Convenient preset configurations
export const auditConfigs = {
  // Log all requests with minimal details
  minimal: {
    logLevel: 'all' as const,
    includeBody: false
  },
  
  // Log mutations with request/response bodies
  detailed: {
    logLevel: 'mutations' as const,
    includeBody: true
  },
  
  // Only log admin operations with full details
  adminOnly: {
    logLevel: 'admin-only' as const,
    includeBody: true,
    excludePaths: []
  },
  
  // Security-focused logging
  security: {
    logLevel: 'all' as const,
    includeBody: true,
    sensitiveFields: ['password', 'token', 'secret', 'key', 'authorization', 'session', 'cookie']
  }
}