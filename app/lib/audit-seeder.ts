import db from './db'

// This function creates sample audit logs for testing
export async function seedAuditLogs() {
  try {
    console.log('Creating sample audit logs...')

    // Get a sample user for testing (or create one if none exists)
    let user = await db.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (!user) {
      // Create a sample admin user for audit logs
      user = await db.user.create({
        data: {
          email: 'admin@danceplatform.com',
          passwordHash: 'placeholder', // This would be hashed in real use
          fullName: 'System Admin',
          role: 'ADMIN',
          isVerified: true
        }
      })
    }

    const sampleLogs = [
      {
        userId: user.id,
        action: 'LOGIN',
        tableName: 'sessions',
        recordId: user.id,
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7) // 1 week ago
      },
      {
        userId: user.id,
        action: 'CREATE',
        tableName: 'classes',
        recordId: 'sample-class-id',
        newValues: JSON.stringify({
          title: 'Hip Hop Basics',
          description: 'Learn fundamental hip hop moves',
          level: 'BEGINNER',
          price: 25.00
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6) // 6 days ago
      },
      {
        userId: user.id,
        action: 'UPDATE',
        tableName: 'users',
        recordId: user.id,
        oldValues: JSON.stringify({ fullName: 'System Admin' }),
        newValues: JSON.stringify({ fullName: 'System Administrator' }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5) // 5 days ago
      },
      {
        userId: user.id,
        action: 'DELETE',
        tableName: 'classes',
        recordId: 'old-class-id',
        oldValues: JSON.stringify({
          title: 'Old Class',
          description: 'This class was cancelled',
          level: 'INTERMEDIATE'
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4) // 4 days ago
      },
      {
        userId: 'system',
        action: 'LOGIN_FAILED',
        tableName: 'users',
        recordId: 'suspicious@example.com',
        newValues: JSON.stringify({ reason: 'Invalid credentials', attempts: 3 }),
        ipAddress: '203.0.113.50',
        userAgent: 'curl/7.68.0',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3) // 3 days ago
      },
      {
        userId: user.id,
        action: 'ROLE_CHANGE',
        tableName: 'users',
        recordId: 'sample-user-id',
        oldValues: JSON.stringify({ role: 'USER' }),
        newValues: JSON.stringify({ role: 'INSTRUCTOR' }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2) // 2 days ago
      },
      {
        userId: user.id,
        action: 'CREATE',
        tableName: 'bookings',
        recordId: 'sample-booking-id',
        newValues: JSON.stringify({
          userId: 'sample-user-id',
          classId: 'sample-class-id',
          status: 'CONFIRMED',
          amountPaid: 25.00
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24) // 1 day ago
      },
      {
        userId: user.id,
        action: 'SECURITY_EVENT',
        tableName: 'security_logs',
        recordId: user.id,
        newValues: JSON.stringify({
          event: 'ADMIN_ACCESS_GRANTED',
          resource: '/admin/users',
          timestamp: new Date().toISOString()
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12) // 12 hours ago
      },
      {
        userId: user.id,
        action: 'CONFIG_CHANGE',
        tableName: 'system_config',
        recordId: 'email_notifications',
        oldValues: JSON.stringify({ enabled: true }),
        newValues: JSON.stringify({ enabled: false }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6) // 6 hours ago
      },
      {
        userId: user.id,
        action: 'API_ACCESS',
        tableName: 'api_logs',
        recordId: '/api/admin/users',
        newValues: JSON.stringify({
          method: 'GET',
          statusCode: 200,
          endpoint: '/api/admin/users'
        }),
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        createdAt: new Date(Date.now() - 1000 * 60 * 30) // 30 minutes ago
      }
    ]

    // Create the audit logs
    await db.auditLog.createMany({
      data: sampleLogs,
      skipDuplicates: true
    })

    console.log(`Created ${sampleLogs.length} sample audit logs`)
    return sampleLogs.length
  } catch (error) {
    console.error('Error seeding audit logs:', error)
    throw error
  }
}