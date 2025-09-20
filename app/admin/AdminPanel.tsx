'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/lib/auth-context'
import { useRouter } from 'next/navigation'

// Import section components
import UserManagement from './sections/UserManagement'
import ClassManagement from './sections/ClassManagement'
import EventManagement from './sections/EventManagement'
import BookingManagement from './sections/BookingManagement'
import ForumModeration from './sections/ForumModeration'
import PartnerMatchingManagement from './sections/PartnerMatchingManagement'
import AuditTrail from './sections/AuditTrail'

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

export default function AdminPanel() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [helperData, setHelperData] = useState<any>(null)

  useEffect(() => {
    fetchAdminData()
    fetchHelperData()
  }, [])

  const fetchAdminData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const statsRes = await fetch('/api/admin/stats')
      if (!statsRes.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsRes.json()
      setStats(statsData.stats)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchHelperData = async () => {
    try {
      const res = await fetch('/api/admin/helpers')
      if (res.ok) {
        const data = await res.json()
        setHelperData(data)
      }
    } catch (err) {
      console.error('Error fetching helper data:', err)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥', badge: stats?.totalUsers },
    { id: 'classes', label: 'Classes', icon: '📚', badge: stats?.totalClasses },
    { id: 'events', label: 'Events', icon: '🎉', badge: stats?.totalEvents },
    { id: 'bookings', label: 'Bookings', icon: '🎫', badge: stats?.totalBookings },
    { id: 'venues', label: 'Venues', icon: '🏢', badge: stats?.totalVenues },
    { id: 'transactions', label: 'Transactions', icon: '💰', badge: stats?.totalTransactions },
    { id: 'styles', label: 'Dance Styles', icon: '💃', badge: stats?.totalDanceStyles },
    { id: 'partner-matching', label: 'Partner Matching', icon: '💕', badge: stats?.activePartnerRequests },
    { id: 'forum', label: 'Forum', icon: '💬', badge: stats?.totalForumPosts },
    { id: 'messages', label: 'Messages', icon: '📧', badge: stats?.unreadMessages },
    { id: 'audit', label: 'Audit Trail', icon: '🔍' }
  ]

  const renderDashboard = () => {
    if (!stats) return null
    
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>
        
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

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => setActiveSection('users')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">👤</span>
              <span className="text-sm">Manage Users</span>
            </button>
            <button 
              onClick={() => setActiveSection('classes')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">📚</span>
              <span className="text-sm">Manage Classes</span>
            </button>
            <button 
              onClick={() => setActiveSection('events')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">🎉</span>
              <span className="text-sm">Manage Events</span>
            </button>
            <button 
              onClick={() => setActiveSection('bookings')}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">🎫</span>
              <span className="text-sm">View Bookings</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSection = () => {
    if (isLoading && activeSection === 'dashboard') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    if (error && activeSection === 'dashboard') {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )
    }

    switch(activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return <UserManagement />
      case 'classes':
        return <ClassManagement helperData={helperData} />
      case 'events':
        return <EventManagement helperData={helperData} />
      case 'bookings':
        return <BookingManagement helperData={helperData} />
      case 'forum':
        return <ForumModeration />
      case 'partner-matching':
        return <PartnerMatchingManagement />
      case 'audit':
        return <AuditTrail />
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management
            </h2>
            <p className="text-gray-600">
              This section is under development. Full CRUD operations coming soon!
            </p>
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
                Full CRUD Access
              </span>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{user.fullName}</p>
                    <p className="text-xs text-gray-500">{user.role} • {user.email}</p>
                  </div>
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-semibold text-sm">
                      {user.fullName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              <div className="border-l border-gray-300 h-6"></div>
              <button 
                onClick={() => {
                  fetchAdminData()
                  fetchHelperData()
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                title="Refresh data"
              >
                🔄 Refresh
              </button>
              <button 
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                title="Logout"
              >
                🚪 Logout
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
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                      activeSection === item.id 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeSection === item.id 
                          ? 'bg-purple-700 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
              
              {/* Logout Button in Sidebar */}
              <li className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <span className="text-xl">🚪</span>
                  <span>Logout</span>
                </button>
              </li>
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
