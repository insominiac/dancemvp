'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalClasses: number
  totalEvents: number
  totalBookings: number
  totalVenues: number
  totalInstructors: number
  confirmedBookings: number
  totalTransactions: number
  totalForumPosts: number
  totalTestimonials: number
  totalDanceStyles: number
  totalRevenue: number
  unreadNotifications: number
  activePartnerRequests: number
  unreadMessages: number
  userBreakdown: {
    admins: number
    instructors: number
    students: number
  }
}

interface TableInfo {
  name: string
  count: number
  icon: string
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [tables, setTables] = useState<TableInfo[]>([])
  const [recentActivity, setRecentActivity] = useState<any>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Fetch stats
      const statsRes = await fetch('/api/admin/stats')
      if (!statsRes.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsRes.json()
      setStats(statsData.stats)
      setRecentActivity(statsData.recentActivity)
      
      // Fetch tables info
      const tablesRes = await fetch('/api/admin/tables')
      if (!tablesRes.ok) throw new Error('Failed to fetch tables')
      const tablesData = await tablesRes.json()
      setTables(tablesData.tables)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'tables', label: 'Database Tables', icon: '🗄️' },
    { id: 'users', label: 'Users', icon: '👥' },
    { id: 'classes', label: 'Classes', icon: '📚' },
    { id: 'events', label: 'Events', icon: '🎉' },
    { id: 'bookings', label: 'Bookings', icon: '🎫' },
    { id: 'venues', label: 'Venues', icon: '🏢' },
    { id: 'transactions', label: 'Transactions', icon: '💰' },
    { id: 'forum', label: 'Forum', icon: '💬' },
    { id: 'messages', label: 'Messages', icon: '📧' }
  ]

  const renderDashboard = () => {
    if (!stats) return null
    
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
        
        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-purple-100 text-sm mt-2">{stats.confirmedBookings} confirmed</p>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-blue-100 text-sm mt-2">
                  {stats.userBreakdown.admins} admin, {stats.userBreakdown.instructors} instructors
                </p>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Classes & Events</p>
                <p className="text-3xl font-bold">{stats.totalClasses + stats.totalEvents}</p>
                <p className="text-green-100 text-sm mt-2">
                  {stats.totalClasses} classes, {stats.totalEvents} events
                </p>
              </div>
              <div className="text-4xl opacity-80">🎯</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                <p className="text-orange-100 text-sm mt-2">
                  {stats.totalTransactions} transactions
                </p>
              </div>
              <div className="text-4xl opacity-80">📝</div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Venues</p>
                <p className="text-2xl font-bold">{stats.totalVenues}</p>
              </div>
              <span className="text-2xl">🏢</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Dance Styles</p>
                <p className="text-2xl font-bold">{stats.totalDanceStyles}</p>
              </div>
              <span className="text-2xl">💃</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Forum Posts</p>
                <p className="text-2xl font-bold">{stats.totalForumPosts}</p>
              </div>
              <span className="text-2xl">💬</span>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Testimonials</p>
                <p className="text-2xl font-bold">{stats.totalTestimonials}</p>
              </div>
              <span className="text-2xl">⭐</span>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {(stats.unreadMessages > 0 || stats.unreadNotifications > 0 || stats.activePartnerRequests > 0) && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <span className="text-2xl">⚠️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You have{' '}
                  {stats.unreadMessages > 0 && `${stats.unreadMessages} unread messages, `}
                  {stats.unreadNotifications > 0 && `${stats.unreadNotifications} unread notifications, `}
                  {stats.activePartnerRequests > 0 && `${stats.activePartnerRequests} active partner requests`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
          
          {recentActivity.bookings && recentActivity.bookings.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-3">Recent Bookings</h4>
              <div className="space-y-2">
                {recentActivity.bookings.slice(0, 3).map((booking: any) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">🎫</span>
                      <div>
                        <p className="font-medium">
                          {booking.user.fullName} booked {booking.class?.title || booking.event?.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${booking.amountPaid} - {booking.status}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'CONFIRMED' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {recentActivity.users && recentActivity.users.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">New Users</h4>
              <div className="space-y-2">
                {recentActivity.users.slice(0, 3).map((user: any) => (
                  <div key={user.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-sm text-gray-500">{user.email} - {user.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  const renderTables = () => {
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Database Tables (20 Total)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {tables.map((table) => (
            <div key={table.name} className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl">{table.icon}</span>
                <span className="text-2xl font-bold text-purple-600">{table.count}</span>
              </div>
              <h3 className="font-semibold text-gray-800">{table.name}</h3>
              <p className="text-sm text-gray-500 mt-1">
                {table.count === 0 ? 'No records' : `${table.count} record${table.count === 1 ? '' : 's'}`}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">ℹ️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                All tables are created from the ERD-v2 specification and are fully operational in your Railway PostgreSQL database.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading database information...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-2xl">❌</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Error loading data: {error}
              </p>
              <button 
                onClick={fetchAdminData}
                className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      )
    }

    switch(activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'tables':
        return renderTables()
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">{activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}</h2>
            <p className="text-gray-600">This section displays data from the {activeSection} table in the database.</p>
            <p className="text-sm text-gray-500 mt-4">Full CRUD operations can be implemented for each table.</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                ERD-v2 Database
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchAdminData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                🔄 Refresh Data
              </button>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-screen shadow-lg">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                      activeSection === item.id 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-xl">{item.icon}</span>
                    <span>{item.label}</span>
                    {item.id === 'messages' && stats?.unreadMessages && stats.unreadMessages > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                        {stats.unreadMessages}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderSection()}
        </main>
      </div>
    </div>
  )
}
