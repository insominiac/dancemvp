/**
 * Examples of how to use the audit middleware in different scenarios
 * This file shows patterns for implementing audit logging in API routes
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAudit, auditConfigs } from './audit-middleware'
import { AuditLogger } from './audit-logger'

// Example 1: Basic API route with minimal audit logging
export const minimalAuditRoute = withAudit(
  async (request: NextRequest) => {
    // Your API logic here
    return NextResponse.json({ message: 'Success' })
  },
  auditConfigs.minimal
)

// Example 2: Admin API route with detailed logging
export const adminAuditRoute = withAudit(
  async (request: NextRequest) => {
    // Your admin API logic here
    return NextResponse.json({ message: 'Admin operation completed' })
  },
  auditConfigs.adminOnly
)

// Example 3: Security-sensitive API route
export const securityAuditRoute = withAudit(
  async (request: NextRequest) => {
    // Your security-sensitive API logic here
    return NextResponse.json({ message: 'Security operation completed' })
  },
  auditConfigs.security
)

// Example 4: Custom audit configuration
export const customAuditRoute = withAudit(
  async (request: NextRequest) => {
    // Your API logic here
    return NextResponse.json({ message: 'Custom audit operation completed' })
  },
  {
    logLevel: 'mutations',
    includeBody: true,
    excludePaths: ['/api/health'],
    sensitiveFields: ['password', 'token', 'secret', 'ssn', 'creditCard']
  }
)

// Example 5: Manual audit logging within an API route
export async function manualAuditExample(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, action } = body

    // Perform your business logic
    // ...

    // Manual audit logging for specific events
    await AuditLogger.logCreate(
      userId,
      'custom_table',
      'record-id',
      { customField: 'customValue' }
    )

    // Log security event if needed
    await AuditLogger.logSecurityEvent(
      userId,
      'IMPORTANT_ACTION',
      { details: 'User performed important action' }
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    // Log system error
    await AuditLogger.logSystemEvent('API_ERROR', {
      endpoint: request.url,
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Example 6: Conditional audit logging
export async function conditionalAuditExample(request: NextRequest) {
  const body = await request.json()
  const { userId, sensitiveOperation } = body

  try {
    // Perform operation
    // ...

    // Only log if it's a sensitive operation
    if (sensitiveOperation) {
      await AuditLogger.logSecurityEvent(
        userId,
        'SENSITIVE_OPERATION',
        { 
          operation: sensitiveOperation,
          timestamp: new Date().toISOString(),
          ipAddress: request.ip || 'unknown'
        }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Operation failed' },
      { status: 500 }
    )
  }
}

/**
 * Usage in actual API route files:
 * 
 * // app/api/example/route.ts
 * import { withAudit, auditConfigs } from '@/app/lib/audit-middleware'
 * 
 * const handler = withAudit(
 *   async (request: NextRequest) => {
 *     // Your API logic here
 *     return NextResponse.json({ message: 'Success' })
 *   },
 *   auditConfigs.detailed // or auditConfigs.adminOnly, etc.
 * )
 * 
 * export { handler as GET, handler as POST }
 * 
 * Or for different methods:
 * 
 * export const GET = withAudit(async (req) => { ... }, auditConfigs.minimal)
 * export const POST = withAudit(async (req) => { ... }, auditConfigs.detailed)
 * export const PUT = withAudit(async (req) => { ... }, auditConfigs.adminOnly)
 */