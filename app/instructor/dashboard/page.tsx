'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth, useRequireInstructor } from '@/app/lib/auth-context'

interface InstructorDashboardData {
  instructor: {
    id: string
    name: string
    email: string
    phone?: string
    bio?: string
    experience?: number
    specialties: string[]
    joinedDate: string
  }
  stats: {
    totalClasses: number
    studentsEnrolled: number
    upcomingThisWeek: number
    monthlyEarnings: number
    averageRating: number
  }
  todaysClasses: Array<{
    id: string
    title: string
    time: string
    duration: number
    enrolled: number
    capacity: number
    venue: string
    location: string
    students: Array<{ name: string; email: string }>
    styles: string[]
  }>
  upcomingClasses: Array<{
    id: string
    title: string
    startDate: string
    time: string
    duration: number
    enrolled: number
    capacity: number
    venue: string
    location: string
  }>
  recentActivity: Array<{
    id: string
    message: string
    time: string
    type: string
    userId: string
    classTitle: string
  }>
  performanceMetrics: {
    classesTaught: number
    newStudents: number
    attendanceRate: number
  }
}

interface ResourceStats {
  overview: {
    totalResources: number
    totalViews: number
    totalDownloads: number
    publicResources: number
  }
  recentResources: Array<{
    id: string
    title: string
    type: string
    category: string
    views: number
    createdAt: string
  }>
}

export default function InstructorDashboard() {
  const [dashboardData, setDashboardData] = useState<InstructorDashboardData | null>(null)
  const [resourceStats, setResourceStats] = useState<ResourceStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [instructorId, setInstructorId] = useState<string | null>(null)
  const { user, loading } = useAuth()
  
  // Require instructor authentication
  useRequireInstructor()

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
      // First, find the instructor record for current user
      const instructorLookupResponse = await fetch(`/api/instructor/profile/${user.id}`)
      
      if (!instructorLookupResponse.ok) {
        throw new Error('Instructor profile not found. Please contact admin.')
      }
      
      const instructorProfile = await instructorLookupResponse.json()
      const instructorIdValue = instructorProfile.instructor.id
      setInstructorId(instructorIdValue)
      
      // Fetch dashboard data and resource stats in parallel
      const [dashboardResponse, resourceResponse] = await Promise.all([
        fetch(`/api/instructor/dashboard/${instructorIdValue}`),
        fetch(`/api/instructor/resources/stats?instructorId=${instructorIdValue}`)
      ])
      
      if (!dashboardResponse.ok) {
        throw new Error('Failed to fetch instructor dashboard data')
      }
      
      const dashboardResult = await dashboardResponse.json()
      setDashboardData(dashboardResult.data)
      
      // Resource stats are optional - don't fail the whole dashboard if they fail
      if (resourceResponse.ok) {
        const resourceResult = await resourceResponse.json()
        setResourceStats(resourceResult)
      }
      
    } catch (err) {
      console.error('Dashboard error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect via useRequireInstructor)
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

  const { instructor, stats, todaysClasses, recentActivity, performanceMetrics } = dashboardData

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {instructor.name}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          Here's what's happening with your classes today
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Classes</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClasses}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Students Enrolled</p>
              <p className="text-2xl font-bold text-gray-900">{stats.studentsEnrolled}</p>
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

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">${stats.monthlyEarnings.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-full">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-gray-900">{stats.averageRating}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Teaching Resources Overview */}
      {resourceStats && (
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                <span className="text-2xl mr-3">📝</span>
                Teaching Resources
              </h2>
              <Link 
                href="/instructor/materials"
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View All →
              </Link>
            </div>
          </div>
          
          <div className="p-6">
            {/* Resource Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {resourceStats.overview.totalResources}
                </div>
                <div className="text-sm text-gray-600">Total Resources</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {resourceStats.overview.totalViews}
                </div>
                <div className="text-sm text-gray-600">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {resourceStats.overview.totalDownloads}
                </div>
                <div className="text-sm text-gray-600">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {resourceStats.overview.publicResources}
                </div>
                <div className="text-sm text-gray-600">Public Resources</div>
              </div>
            </div>
            
            {/* Recent Resources */}
            {resourceStats.recentResources.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Resources</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resourceStats.recentResources.slice(0, 4).map((resource) => {
                    const getTypeIcon = (type: string) => {
                      switch (type) {
                        case 'LESSON_PLAN': return '📚'
                        case 'PLAYLIST': return '🎵'
                        case 'VIDEO': return '🎥'
                        case 'AUDIO': return '🎧'
                        case 'DOCUMENT': return '📄'
                        case 'IMAGE': return '🖼️'
                        case 'LINK': return '🔗'
                        case 'NOTE': return '📝'
                        default: return '📄'
                      }
                    }
                    
                    const formatCategory = (category: string) => {
                      return category.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())
                    }
                    
                    return (
                      <div key={resource.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-lg mr-3">{getTypeIcon(resource.type)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {resource.title}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{formatCategory(resource.category)}</span>
                            <div className="flex items-center space-x-3">
                              <span>{resource.views} views</span>
                              <span>{new Date(resource.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <span className="text-4xl block mb-2">📝</span>
                <p className="text-gray-600 mb-4">No resources yet</p>
                <Link 
                  href="/instructor/materials"
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition"
                >
                  Create Your First Resource
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Today's Classes */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            </div>
            
            {todaysClasses.length === 0 ? (
              <div className="p-6 text-center">
                <span className="text-4xl mb-4 block">🎉</span>
                <p className="text-gray-600 mb-4">No classes scheduled for today</p>
                <p className="text-sm text-gray-500">Enjoy your day off!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {todaysClasses.map((cls) => (
                  <div key={cls.id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h3 className="text-lg font-medium text-gray-900">
                            {cls.title}
                          </h3>
                          <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            {cls.venue}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <span className="mr-1">🕐</span>
                            <span>{cls.time} ({cls.duration} min)</span>
                          </div>
                          
                          <div className="flex items-center">
                            <span className="mr-1">👥</span>
                            <span>{cls.enrolled}/{cls.capacity} students</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6 flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200">
                          Attendance
                        </button>
                        <button className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200">
                          Details
                        </button>
                      </div>
                    </div>
                    
                    {/* Progress bar for enrollment */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{width: `${(cls.enrolled / cls.capacity) * 100}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {cls.capacity - cls.enrolled} spots remaining
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Quick Actions</h3>
            </div>
            <div className="p-4 space-y-3">
              <Link 
                href="/instructor/messages"
                className="flex items-center p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition"
              >
                <span className="text-lg mr-3">💬</span>
                <div>
                  <p className="font-medium text-purple-900">Send Message</p>
                  <p className="text-xs text-purple-700">Message students or class</p>
                </div>
              </Link>
              
              <Link 
                href="/instructor/classes"
                className="flex items-center p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
              >
                <span className="text-lg mr-3">📚</span>
                <div>
                  <p className="font-medium text-blue-900">Manage Classes</p>
                  <p className="text-xs text-blue-700">View all your classes</p>
                </div>
              </Link>
              
              <Link 
                href="/instructor/students"
                className="flex items-center p-3 bg-green-50 rounded-lg hover:bg-green-100 transition"
              >
                <span className="text-lg mr-3">👥</span>
                <div>
                  <p className="font-medium text-green-900">View Students</p>
                  <p className="text-xs text-green-700">See enrolled students</p>
                </div>
              </Link>
              
              <Link 
                href="/instructor/materials"
                className="flex items-center p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition"
              >
                <span className="text-lg mr-3">📝</span>
                <div>
                  <p className="font-medium text-orange-900">Teaching Resources</p>
                  <p className="text-xs text-orange-700">Manage lesson plans & materials</p>
                </div>
              </Link>
              
              <Link 
                href="/instructor/analytics"
                className="flex items-center p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
              >
                <span className="text-lg mr-3">📈</span>
                <div>
                  <p className="font-medium text-indigo-900">Performance Analytics</p>
                  <p className="text-xs text-indigo-700">Track teaching & engagement metrics</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-4">
              <div className="space-y-3">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      activity.type === 'confirmed' ? 'bg-green-600' :
                      activity.type === 'cancelled' ? 'bg-red-600' :
                      'bg-purple-600'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.message}</p>
                      <p className="text-xs text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">This Month</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Classes Taught</span>
                <span className="font-semibold text-gray-900">{performanceMetrics.classesTaught}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">New Students</span>
                <span className="font-semibold text-green-600">+{performanceMetrics.newStudents}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Attendance Rate</span>
                <span className="font-semibold text-blue-600">{Math.round(performanceMetrics.attendanceRate * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Average Rating</span>
                <span className="font-semibold text-purple-600">{stats.averageRating}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
