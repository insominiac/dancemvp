'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Send, Users, TrendingUp, Settings, Plus, Search, Filter, Eye, EyeOff, Trash2, Calendar, Clock } from 'lucide-react'
import NotificationComposer from './NotificationComposer'
import NotificationAnalytics from './NotificationAnalytics'
import NotificationTemplates from './NotificationTemplates'

interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
  actionUrl?: string
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    profileImage?: string
  }
}

interface NotificationStats {
  totalSent: number
  totalRead: number
  totalUnread: number
  readRate: number
  recentActivity: number
}

export default function NotificationCenter() {
  const [activeTab, setActiveTab] = useState<'overview' | 'compose' | 'analytics' | 'templates'>('overview')
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats>({
    totalSent: 0,
    totalRead: 0,
    totalUnread: 0,
    readRate: 0,
    recentActivity: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedPriority, setSelectedPriority] = useState<string>('all')
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([])

  const notificationTypes = [
    'BOOKING_CONFIRMATION',
    'CLASS_REMINDER',
    'PAYMENT_CONFIRMATION',
    'CLASS_CANCELLED',
    'SYSTEM_ANNOUNCEMENT',
    'INSTRUCTOR_MESSAGE'
  ]

  const priorities = ['LOW', 'NORMAL', 'HIGH', 'URGENT']

  // Fetch notifications and stats
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch recent notifications for admin overview
      const notificationsResponse = await fetch('/api/admin/notifications?limit=50')
      if (!notificationsResponse.ok) {
        throw new Error('Failed to fetch notifications')
      }
      const notificationsData = await notificationsResponse.json()
      setNotifications(notificationsData.notifications || [])

      // Fetch stats
      const statsResponse = await fetch('/api/admin/notifications/stats')
      if (!statsResponse.ok) {
        throw new Error('Failed to fetch stats')
      }
      const statsData = await statsResponse.json()
      setStats(statsData)

    } catch (err) {
      console.error('Error fetching notification data:', err)
      setError('Failed to load notification data')
    } finally {
      setLoading(false)
    }
  }

  // Handle bulk actions
  const handleBulkAction = async (action: 'markRead' | 'markUnread' | 'delete') => {
    if (selectedNotifications.length === 0) return

    try {
      const response = await fetch('/api/admin/notifications/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          action,
          notificationIds: selectedNotifications
        })
      })

      if (!response.ok) {
        throw new Error(`Failed to ${action} notifications`)
      }

      // Refresh data and clear selection
      await fetchData()
      setSelectedNotifications([])
    } catch (err) {
      console.error(`Error performing bulk ${action}:`, err)
    }
  }

  // Filter notifications based on search and filters
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesType = selectedType === 'all' || notification.type === selectedType
    const matchesPriority = selectedPriority === 'all' || notification.priority === selectedPriority
    
    return matchesSearch && matchesType && matchesPriority
  })

  // Get time ago string
  const getTimeAgo = (dateString: string) => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
    
    if (diffInSeconds < 60) return 'Just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    return `${Math.floor(diffInSeconds / 86400)}d ago`
  }

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'text-red-600 bg-red-50'
      case 'HIGH': return 'text-orange-600 bg-orange-50'
      case 'NORMAL': return 'text-blue-600 bg-blue-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading notification center...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Notification Center</h2>
          <p className="text-gray-600 mt-1">Manage and monitor all platform notifications</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('compose')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Notification
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Send className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Total Sent</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalSent.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Eye className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Read</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalRead.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <EyeOff className="h-8 w-8 text-orange-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Unread</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.totalUnread.toLocaleString()}</dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <TrendingUp className="h-8 w-8 text-purple-600" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">Read Rate</dt>
                <dd className="text-lg font-medium text-gray-900">{stats.readRate.toFixed(1)}%</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'overview', label: 'Overview', icon: Bell },
            { key: 'compose', label: 'Compose', icon: Send },
            { key: 'analytics', label: 'Analytics', icon: TrendingUp },
            { key: 'templates', label: 'Templates', icon: Settings }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Filters and Search */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Types</option>
                  {notificationTypes.map(type => (
                    <option key={type} value={type}>
                      {type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedPriority}
                  onChange={(e) => setSelectedPriority(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Priorities</option>
                  {priorities.map(priority => (
                    <option key={priority} value={priority}>{priority}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedNotifications.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {selectedNotifications.length} notifications selected
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleBulkAction('markRead')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Mark Read
                    </button>
                    <button
                      onClick={() => handleBulkAction('markUnread')}
                      className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <EyeOff className="w-3 h-3 mr-1" />
                      Mark Unread
                    </button>
                    <button
                      onClick={() => handleBulkAction('delete')}
                      className="inline-flex items-center px-3 py-1.5 border border-red-300 text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notifications List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Notifications</h3>
            </div>
            
            {error ? (
              <div className="p-6 text-center text-red-600">
                <p>{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Try again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications found</h3>
                <p className="text-gray-600">No notifications match your current filters.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredNotifications.map((notification) => (
                  <div key={notification.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications([...selectedNotifications, notification.id])
                          } else {
                            setSelectedNotifications(selectedNotifications.filter(id => id !== notification.id))
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <p className={`text-sm font-medium text-gray-900 ${
                                !notification.isRead ? 'font-semibold' : ''
                              }`}>
                                {notification.title}
                              </p>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                getPriorityColor(notification.priority)
                              }`}>
                                {notification.priority}
                              </span>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                            <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                              <span className="flex items-center">
                                <Users className="w-3 h-3 mr-1" />
                                {notification.user.fullName}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {getTimeAgo(notification.createdAt)}
                              </span>
                              <span className="capitalize">
                                {notification.type.replace(/_/g, ' ').toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'compose' && <NotificationComposer onSent={fetchData} />}
      {activeTab === 'analytics' && <NotificationAnalytics />}
      {activeTab === 'templates' && <NotificationTemplates />}
    </div>
  )
}
