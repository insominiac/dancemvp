import { NextRequest, NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const action = searchParams.get('action')
    const table = searchParams.get('table')
    const user = searchParams.get('user')
    const dateRange = searchParams.get('dateRange')
    const search = searchParams.get('search')

    const skip = (page - 1) * limit

    // Build where clause
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

    // Get logs with pagination
    const [logs, totalCount] = await Promise.all([
      db.auditLog.findMany({
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
        skip,
        take: limit
      }),
      db.auditLog.count({ where })
    ])

    // Get filter options
    const [actionOptions, tableOptions] = await Promise.all([
      db.auditLog.findMany({
        select: { action: true },
        distinct: ['action'],
        orderBy: { action: 'asc' }
      }).then(results => results.map(r => r.action)),
      db.auditLog.findMany({
        select: { tableName: true },
        distinct: ['tableName'],
        orderBy: { tableName: 'asc' }
      }).then(results => results.map(r => r.tableName))
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      logs,
      totalCount,
      totalPages,
      currentPage: page,
      actionOptions,
      tableOptions
    })
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}