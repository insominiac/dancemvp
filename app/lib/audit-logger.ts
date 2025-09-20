import db from './db'
import { headers } from 'next/headers'

interface AuditLogData {
  userId: string
  action: string
  tableName: string
  recordId: string
  oldValues?: object
  newValues?: object
  ipAddress?: string
  userAgent?: string
}

export class AuditLogger {
  private static async getClientInfo() {
    try {
      const headersList = headers()
      const forwardedFor = headersList.get('x-forwarded-for')
      const realIp = headersList.get('x-real-ip')
      const ipAddress = forwardedFor?.split(',')[0] || realIp || headersList.get('x-client-ip') || 'unknown'
      const userAgent = headersList.get('user-agent') || 'unknown'
      
      return { ipAddress, userAgent }
    } catch (error) {
      // If headers() fails (e.g., not in request context), return defaults
      return { ipAddress: 'system', userAgent: 'system' }
    }
  }

  static async log(data: Omit<AuditLogData, 'ipAddress' | 'userAgent'>) {
    try {
      const clientInfo = await this.getClientInfo()
      
      await db.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          tableName: data.tableName,
          recordId: data.recordId,
          oldValues: data.oldValues ? JSON.stringify(data.oldValues) : null,
          newValues: data.newValues ? JSON.stringify(data.newValues) : null,
          ipAddress: clientInfo.ipAddress,
          userAgent: clientInfo.userAgent
        }
      })
    } catch (error) {
      console.error('Failed to create audit log:', error)
      // Don't throw error to avoid breaking the main operation
    }
  }

  // Convenience methods for common actions
  static async logCreate(userId: string, tableName: string, recordId: string, newValues: object) {
    await this.log({
      userId,
      action: 'CREATE',
      tableName,
      recordId,
      newValues
    })
  }

  static async logUpdate(userId: string, tableName: string, recordId: string, oldValues: object, newValues: object) {
    await this.log({
      userId,
      action: 'UPDATE',
      tableName,
      recordId,
      oldValues,
      newValues
    })
  }

  static async logDelete(userId: string, tableName: string, recordId: string, oldValues: object) {
    await this.log({
      userId,
      action: 'DELETE',
      tableName,
      recordId,
      oldValues
    })
  }

  static async logLogin(userId: string) {
    await this.log({
      userId,
      action: 'LOGIN',
      tableName: 'sessions',
      recordId: userId
    })
  }

  static async logLogout(userId: string, sessionId?: string) {
    await this.log({
      userId,
      action: 'LOGOUT',
      tableName: 'sessions',
      recordId: sessionId || userId
    })
  }

  static async logPasswordChange(userId: string) {
    await this.log({
      userId,
      action: 'PASSWORD_CHANGE',
      tableName: 'users',
      recordId: userId
    })
  }

  static async logRoleChange(adminUserId: string, targetUserId: string, oldRole: string, newRole: string) {
    await this.log({
      userId: adminUserId,
      action: 'ROLE_CHANGE',
      tableName: 'users',
      recordId: targetUserId,
      oldValues: { role: oldRole },
      newValues: { role: newRole }
    })
  }

  static async logFailedLogin(email: string, reason: string) {
    // For failed logins, we'll use a system user ID since we don't have a valid user
    await this.log({
      userId: 'system',
      action: 'LOGIN_FAILED',
      tableName: 'users',
      recordId: email,
      newValues: { reason }
    })
  }

  static async logSystemEvent(action: string, details: object) {
    await this.log({
      userId: 'system',
      action: action,
      tableName: 'system',
      recordId: 'system',
      newValues: details
    })
  }

  static async logApiAccess(userId: string, endpoint: string, method: string, statusCode: number) {
    await this.log({
      userId,
      action: 'API_ACCESS',
      tableName: 'api_logs',
      recordId: endpoint,
      newValues: { method, statusCode, endpoint }
    })
  }

  static async logSecurityEvent(userId: string, event: string, details: object) {
    await this.log({
      userId,
      action: 'SECURITY_EVENT',
      tableName: 'security_logs',
      recordId: userId,
      newValues: { event, ...details }
    })
  }

  static async logConfigChange(adminUserId: string, configKey: string, oldValue: any, newValue: any) {
    await this.log({
      userId: adminUserId,
      action: 'CONFIG_CHANGE',
      tableName: 'system_config',
      recordId: configKey,
      oldValues: { [configKey]: oldValue },
      newValues: { [configKey]: newValue }
    })
  }
}

// Prisma middleware for automatic audit logging
export function createAuditMiddleware() {
  return async (params: any, next: any) => {
    const result = await next(params)
    
    // Only log for certain models and actions
    const auditableModels = [
      'user', 'class', 'event', 'booking', 'transaction', 
      'venue', 'instructor', 'danceStyle', 'contactMessage',
      'testimonial', 'forumPost', 'forumReply'
    ]
    
    if (!auditableModels.includes(params.model)) {
      return result
    }

    try {
      // Get user ID from context (this would need to be set in your API routes)
      const userId = (global as any).currentUserId || 'system'
      
      switch (params.action) {
        case 'create':
          await AuditLogger.logCreate(
            userId,
            params.model,
            result.id || 'unknown',
            result
          )
          break
          
        case 'update':
          // For updates, we'd need the old values, which is tricky with Prisma
          await AuditLogger.log({
            userId,
            action: 'UPDATE',
            tableName: params.model,
            recordId: params.args.where.id || 'unknown',
            newValues: params.args.data
          })
          break
          
        case 'delete':
          await AuditLogger.log({
            userId,
            action: 'DELETE',
            tableName: params.model,
            recordId: params.args.where.id || 'unknown'
          })
          break
      }
    } catch (error) {
      console.error('Audit middleware error:', error)
      // Don't fail the original operation
    }
    
    return result
  }
}

// Helper to set user context for audit logging
export function setAuditContext(userId: string) {
  (global as any).currentUserId = userId
}

export function clearAuditContext() {
  delete (global as any).currentUserId
}