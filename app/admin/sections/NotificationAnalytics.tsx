'use client'

import React, { useState, useEffect } from 'react'
import { BarChart, LineChart, PieChart, TrendingUp, TrendingDown, Activity, Users, Mail, Smartphone, Clock } from 'lucide-react'

interface AnalyticsData {
  overview: {
    totalSent: number
    totalRead: number
    totalUnread: number
    readRate: number
    avgResponseTime: number
    activeUsers: number
  }
  trends: {
    date: string
    sent: number
    read: number
    clicked: number
  }[]
  byType: {
    type: string
    count: number
    readRate: number
  }[]
  byPriority: {
    priority: string
    count: number
    readRate: number
  }[]
  devices: {
    device: string
    count: number
    percentage: number
  }[]
  topPerformers: {
    type: string
    title: string
    readRate: number
    clickRate: number
    sentCount: number
  }[]
  recentActivity: {
    id: string
    type: string
    title: string
    recipientCount: number
    readCount: number
    createdAt: string
  }[]
}

export default function NotificationAnalytics() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')

  // Fetch analytics data
  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/notifications/analytics?timeRange=${timeRange}`)
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const analyticsData = await response.json()
      setData(analyticsData)

    } catch (err: any) {
      console.error('Error fetching analytics:', err)
      setError(err.message || 'Failed to load analytics data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading analytics...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center text-red-600">
          <p>{error || 'No analytics data available'}</p>
          <button
            onClick={fetchAnalytics}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatPercentage = (num: number) => `${num.toFixed(1)}%`

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp className="w-4 h-4 text-green-500" />
    if (current < previous) return <TrendingDown className="w-4 h-4 text-red-500" />
    return <Activity className="w-4 h-4 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Range Selector */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Notification Analytics</h3>
          <p className="text-sm text-gray-600">Performance metrics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Time Range:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sent</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.overview.totalSent)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Activity className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Read Rate</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatPercentage(data.overview.readRate)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Active Users</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.overview.activeUsers)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Avg Response Time</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {data.overview.avgResponseTime}m
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Mail className="h-8 w-8 text-gray-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatNumber(data.overview.totalUnread)}
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Smartphone className="h-8 w-8 text-indigo-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Mobile Users</dt>
                <dd className="flex items-baseline">
                  <div className="text-2xl font-semibold text-gray-900">
                    {data.devices.find(d => d.device === 'mobile')?.percentage.toFixed(0) || '0'}%
                  </div>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance by Type */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BarChart className="w-5 h-5 mr-2" />
              Performance by Type
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.byType.map((item, index) => (
                <div key={item.type} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-gray-900">
                        {item.type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                      <span className="text-sm text-gray-500">
                        {item.count} • {formatPercentage(item.readRate)}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full bg-blue-${500 + (index * 100) % 400}`}
                        style={{ width: `${item.readRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance by Priority */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Performance by Priority
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.byPriority.map((item, index) => {
                const colors = {
                  'URGENT': 'bg-red-500',
                  'HIGH': 'bg-orange-500',
                  'NORMAL': 'bg-blue-500',
                  'LOW': 'bg-gray-500'
                }
                return (
                  <div key={item.priority} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-900 flex items-center">
                          <div className={`w-3 h-3 rounded-full mr-2 ${colors[item.priority as keyof typeof colors]}`}></div>
                          {item.priority}
                        </span>
                        <span className="text-sm text-gray-500">
                          {item.count} • {formatPercentage(item.readRate)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${colors[item.priority as keyof typeof colors]}`}
                          style={{ width: `${item.readRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Trends Chart (Placeholder) */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <LineChart className="w-5 h-5 mr-2" />
            Trends Over Time
          </h3>
        </div>
        <div className="p-6">
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <LineChart className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-sm">Interactive chart would be displayed here</p>
              <p className="text-gray-400 text-xs mt-1">Showing sent, read, and click trends</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Performers and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Top Performing Notifications</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.topPerformers.slice(0, 5).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.type.replace(/_/g, ' ').toLowerCase()} • {item.sentCount} sent
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-green-600">
                      {formatPercentage(item.readRate)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage(item.clickRate)} CTR
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.recentActivity.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {item.type.replace(/_/g, ' ').toLowerCase()} • {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-900">
                      {item.readCount}/{item.recipientCount}
                    </div>
                    <div className="text-xs text-gray-500">
                      {formatPercentage((item.readCount / item.recipientCount) * 100)} read
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Device Breakdown */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Device Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.devices.map((device, index) => {
              const icons = {
                'desktop': '🖥️',
                'mobile': '📱',
                'tablet': '💻'
              }
              return (
                <div key={device.device} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl mb-2">
                    {icons[device.device as keyof typeof icons] || '📱'}
                  </div>
                  <div className="font-semibold text-lg text-gray-900">
                    {formatPercentage(device.percentage)}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {device.device}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatNumber(device.count)} users
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}