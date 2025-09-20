'use client'

import { useState, useEffect } from 'react'
import { useAuth, useRequireInstructor } from '@/app/lib/auth-context'
import PerformanceDashboard from '../components/PerformanceDashboard'

export default function InstructorAnalyticsPage() {
  const [instructorId, setInstructorId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, loading } = useAuth()
  
  // Require instructor authentication
  useRequireInstructor()

  useEffect(() => {
    if (user) {
      fetchInstructorId()
    }
  }, [user])

  const fetchInstructorId = async () => {
    if (!user) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/instructor/profile/${user.id}`)
      
      if (!response.ok) {
        throw new Error('Instructor profile not found')
      }
      
      const data = await response.json()
      setInstructorId(data.instructor.id)
      
    } catch (err) {
      console.error('Error fetching instructor ID:', err)
      setError(err instanceof Error ? err.message : 'Failed to load instructor profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  // Don't render if no user (will redirect via useRequireInstructor)
  if (!user) {
    return null
  }

  if (error || !instructorId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error || 'Failed to load instructor profile'}</p>
          </div>
          <button 
            onClick={fetchInstructorId}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Track your teaching performance and student engagement</p>
      </div>
      
      <PerformanceDashboard instructorId={instructorId} />
    </div>
  )
}
