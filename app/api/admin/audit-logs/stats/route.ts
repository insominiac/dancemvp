import { NextRequest, NextResponse } from 'next/server'
import db from '@/app/lib/db'

export async function GET(request: NextRequest) {
  try {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - 7)
    
    // Get statistics
    const [
      totalLogs,
      todayLogs,
      weeklyLogs,
      topActionsData,
      topUsersData,
      topTablesData
    ] = await Promise.all([
      db.auditLog.count(),
      db.auditLog.count({
        where: { createdAt: { gte: todayStart } }
      }),
      db.auditLog.count({
        where: { createdAt: { gte: weekStart } }
      }),
      db.auditLog.groupBy({
        by: ['action'],
        _count: { action: true },
        orderBy: { _count: { action: 'desc' } },
        take: 5
      }),
      db.auditLog.groupBy({
        by: ['userId'],
        _count: { userId: true },
        orderBy: { _count: { userId: 'desc' } },
        take: 5
      }),
      db.auditLog.groupBy({
        by: ['tableName'],
        _count: { tableName: true },
        orderBy: { _count: { tableName: 'desc' } },
        take: 5
      })
    ])

    // Get user details for top users
    const userIds = topUsersData.map(u => u.userId)
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, fullName: true, email: true }
    })

    const topActions = topActionsData.map(item => ({
      action: item.action,
      count: item._count.action
    }))

    const topUsers = topUsersData.map(item => {
      const user = users.find(u => u.id === item.userId)
      return {
        user: user ? `${user.fullName} (${user.email})` : 'Unknown User',
        count: item._count.userId
      }
    })

    const topTables = topTablesData.map(item => ({
      table: item.tableName,
      count: item._count.tableName
    }))

    return NextResponse.json({
      totalLogs,
      todayLogs,
      weeklyLogs,
      topActions,
      topUsers,
      topTables
    })
  } catch (error) {
    console.error('Error fetching audit log statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit log statistics' },
      { status: 500 }
    )
  }
}