'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth, useRequireAuth } from '@/app/lib/auth-context'
// import { QuickBooking } from '@/app/components/payments/CheckoutButton'

interface DashboardData {
  user: {
    id: string
    name: string
    email: string
    role: string
    memberSince: string
  }
  stats: {
    totalBookings: number
    classesAttended: number
    totalSpent: number
    upcomingThisWeek: number
  }
  upcomingBookings: Array<{
    id: string
    confirmationCode: string
    bookingDate: string
    status: string
    paymentStatus: string
    totalAmount: number
    amountPaid: number
    type: 'class' | 'event'
    item: any
  }>
  recentActivity: Array<{
    id: string
    type: 'class' | 'event'
    action: string
    title: string
    date: string
    status: string
    paymentStatus: string
    amount: number
  }>
  recommendedClasses: Array<{
    id: string
    title: string
    description: string
    level: string
    price: number
    duration: number
    startDate: string
    scheduleTime: string
    venue: any
    instructor: string
    spotsLeft: number
    totalSpots: number
  }>
}

export default function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  
  // Require authentication for dashboard access
  useRequireAuth()

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/user/dashboard/${user.id}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data')
      }
      
      const result = await response.json()
      setDashboardData(result.data)
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    // Handle time format (assumes 24hr format like "18:00")
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getTimeUntil = (dateString: string) => {
    const now = new Date()
    const eventDate = new Date(dateString)
    const diffMs = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= 7) return `In ${diffDays} days`
    return formatDate(dateString)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect via useRequireAuth)
  if (!user) {
    return null
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error || 'Failed to load dashboard data'}</p>
          </div>
          <button 
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const { user: dashboardUser, stats, upcomingBookings, recentActivity, recommendedClasses } = dashboardData

  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome back, {user.fullName}! 👋
              </h1>
              <p className="text-gray-600">
                Member since {formatDate(user.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link 
                href="/classes" 
                className="hidden sm:inline-block px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                Browse Classes
              </Link>
              <Link 
                href="/events" 
                className="hidden sm:inline-block px-4 py-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                View Events
              </Link>
              <div className="hidden md:block text-sm text-gray-600">
                Signed in as <span className="font-medium">{user.fullName}</span>
              </div>
              <button
                onClick={async () => {
                  await logout()
                  router.push('/login')
                }}
                className="px-3 py-2 sm:px-4 sm:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
              >
                <span className="hidden sm:inline">Sign Out</span>
                <span className="sm:hidden">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Classes Attended</p>
                <p className="text-2xl font-bold text-gray-900">{stats.classesAttended}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalSpent}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <span className="text-2xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingThisWeek}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upcoming Bookings */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Classes & Events</h2>
              </div>
              
              {upcomingBookings.length === 0 ? (
                <div className="p-6 text-center">
                  <span className="text-4xl mb-4 block">🗓️</span>
                  <p className="text-gray-600 mb-4">No upcoming bookings</p>
                  <Link 
                    href="/classes"
                    className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Browse Classes
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {upcomingBookings.map((booking) => (
                    <div key={booking.id} className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-2">
                            <span className="text-lg mr-2">
                              {booking.type === 'class' ? '📚' : '🎉'}
                            </span>
                            <h3 className="text-lg font-medium text-gray-900">
                              {booking.item.title}
                            </h3>
                            <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                              booking.item.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                              booking.item.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {booking.item.level}
                            </span>
                          </div>
                          
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <span className="mr-2">📅</span>
                              <span>{getTimeUntil(booking.item.startDate)}</span>
                              {booking.item.scheduleTime && (
                                <span className="ml-2">
                                  at {formatTime(booking.item.scheduleTime)}
                                </span>
                              )}
                            </div>
                            
                            {booking.item.venue && (
                              <div className="flex items-center">
                                <span className="mr-2">📍</span>
                                <span>{booking.item.venue.name}, {booking.item.venue.city}</span>
                              </div>
                            )}
                            
                            {booking.type === 'class' && booking.item.instructors?.[0] && (
                              <div className="flex items-center">
                                <span className="mr-2">👨‍🏫</span>
                                <span>Instructor: {booking.item.instructors[0].name}</span>
                              </div>
                            )}
                            
                            <div className="flex items-center">
                              <span className="mr-2">🎫</span>
                              <span>Confirmation: {booking.confirmationCode}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="ml-6 text-right">
                          <p className="text-lg font-semibold text-gray-900">
                            ${booking.amountPaid}
                          </p>
                          <p className="text-sm text-green-600">✅ Confirmed</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
              </div>
              <div className="p-4">
                {recentActivity.length === 0 ? (
                  <p className="text-gray-600 text-sm">No recent activity</p>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.slice(0, 5).map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-600">
                            {formatDate(activity.date)} • ${activity.amount}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Recommended Classes */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Recommended Classes</h3>
              </div>
              <div className="p-4">
                {recommendedClasses.length === 0 ? (
                  <p className="text-gray-600 text-sm">No recommendations available</p>
                ) : (
                  <div className="space-y-4">
                    {recommendedClasses.slice(0, 3).map((cls) => (
                      <div key={cls.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-sm font-medium text-gray-900 flex-1">
                            {cls.title}
                          </h4>
                          <span className="text-sm font-semibold text-purple-600 ml-2">
                            ${cls.price}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-600 mb-2">
                          <p>{cls.level} • {cls.duration}min</p>
                          <p>👨‍🏫 {cls.instructor}</p>
                          {cls.spotsLeft > 0 && (
                            <p className="text-green-600">
                              {cls.spotsLeft} spots left
                            </p>
                          )}
                        </div>
                        
                        <button
                          className="w-full text-center text-xs py-1 px-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                          onClick={() => {
                            const confirmed = confirm(`Book "${cls.title}" for $${cls.price}?\n\nThis is a demo booking - no payment will be processed.`)
                            if (confirmed) {
                              alert('Demo booking confirmed! ✅\n\nIn production, this would process payment and create a real booking.')
                            }
                          }}
                        >
                          Demo Book - ${cls.price}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
