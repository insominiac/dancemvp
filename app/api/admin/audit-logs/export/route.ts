import { NextRequest, NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'
    const action = searchParams.get('action')
    const table = searchParams.get('table')
    const user = searchParams.get('user')
    const dateRange = searchParams.get('dateRange')
    const search = searchParams.get('search')

    // Build where clause (same as main route)
    const where: any = {}
    
    if (action && action !== 'all') {
      where.action = { contains: action, mode: 'insensitive' }
    }
    
    if (table && table !== 'all') {
      where.tableName = table
    }
    
    if (user) {
      where.user = {
        OR: [
          { email: { contains: user, mode: 'insensitive' } },
          { fullName: { contains: user, mode: 'insensitive' } }
        ]
      }
    }
    
    if (dateRange && dateRange !== 'all') {
      const now = new Date()
      let startDate = new Date()
      
      switch (dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0)
          break
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
      }
      
      where.createdAt = { gte: startDate }
    }
    
    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { tableName: { contains: search, mode: 'insensitive' } },
        { recordId: { contains: search, mode: 'insensitive' } },
        { user: { 
          OR: [
            { email: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }

    // Get all matching logs (limit to reasonable amount for export)
    const logs = await db.auditLog.findMany({
      where,
      include: {
        user: {
          select: {
            fullName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10000 // Limit export to 10k records for performance
    })

    if (format === 'json') {
      return NextResponse.json(logs, {
        headers: {
          'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.json"`
        }
      })
    }

    // CSV export
    const csvHeaders = [
      'Timestamp',
      'User Name',
      'User Email',
      'User Role',
      'Action',
      'Table',
      'Record ID',
      'IP Address',
      'User Agent',
      'Old Values',
      'New Values'
    ]

    const csvRows = logs.map(log => [
      new Date(log.createdAt).toISOString(),
      log.user.fullName,
      log.user.email,
      log.user.role,
      log.action,
      log.tableName,
      log.recordId,
      log.ipAddress || '',
      log.userAgent ? log.userAgent.replace(/"/g, '""') : '', // Escape quotes
      log.oldValues ? log.oldValues.replace(/"/g, '""') : '',
      log.newValues ? log.newValues.replace(/"/g, '""') : ''
    ])

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to export audit logs' },
      { status: 500 }
    )
  }
}