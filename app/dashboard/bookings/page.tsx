'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Booking {
  id: string
  confirmationCode: string
  bookingDate: string
  status: string
  paymentStatus: string
  totalAmount: number
  amountPaid: number
  type: 'class' | 'event'
  item: {
    id: string
    title: string
    description: string
    level: string
    startDate: string
    endDate: string
    scheduleTime?: string
    venue?: {
      name: string
      address: string
      city: string
    }
    instructors?: Array<{
      name: string
      email: string
    }>
  }
  transaction?: {
    id: string
    amount: number
    paymentDate: string
    paymentMethod: string
    transactionId: string
  }
}

interface BookingsData {
  upcoming: Booking[]
  past: Booking[]
  cancelled: Booking[]
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  cancelled: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800'
}

const paymentStatusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  refunded: 'bg-gray-100 text-gray-800'
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingsData | null>(null)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past' | 'cancelled'>('upcoming')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // TODO: Replace with actual user ID from authentication
  const userId = "temp-user-id"

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/user/bookings/${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch bookings')
      }
      
      const result = await response.json()
      setBookings(result.data)
    } catch (err) {
      console.error('Bookings error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load bookings')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (timeString: string) => {
    if (!timeString) return ''
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
    if (diffDays < 0) return 'Past'
    if (diffDays <= 7) return `In ${diffDays} days`
    return `In ${Math.ceil(diffDays / 7)} weeks`
  }

  const renderBookingCard = (booking: Booking) => (
    <div key={booking.id} className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <span className="text-xl mr-2">
              {booking.type === 'class' ? '📚' : '🎉'}
            </span>
            <h3 className="text-lg font-semibold text-gray-900">{booking.item.title}</h3>
            <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${
              booking.item.level === 'Beginner' ? 'bg-green-100 text-green-800' :
              booking.item.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {booking.item.level}
            </span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{booking.item.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600">
            <div className="flex items-center">
              <span className="mr-2">📅</span>
              <span>
                {formatDate(booking.item.startDate)}
                {booking.item.scheduleTime && (
                  <span className="ml-1">at {formatTime(booking.item.scheduleTime)}</span>
                )}
              </span>
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
            
            <div className="flex items-center">
              <span className="mr-2">📅</span>
              <span>Booked: {formatDate(booking.bookingDate)}</span>
            </div>
            
            {activeTab === 'upcoming' && (
              <div className="flex items-center">
                <span className="mr-2">⏰</span>
                <span className="font-medium text-purple-600">{getTimeUntil(booking.item.startDate)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-6 text-right flex-shrink-0">
          <p className="text-lg font-bold text-gray-900 mb-1">
            ${booking.amountPaid}
          </p>
          <div className="space-y-1">
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[booking.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
              {booking.status}
            </span>
            <br />
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${paymentStatusColors[booking.paymentStatus as keyof typeof paymentStatusColors] || 'bg-gray-100 text-gray-800'}`}>
              Payment: {booking.paymentStatus}
            </span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex space-x-3">
          {activeTab === 'upcoming' && booking.status === 'confirmed' && (
            <>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View Details
              </button>
              <button className="text-sm text-red-600 hover:text-red-700 font-medium">
                Cancel Booking
              </button>
            </>
          )}
          {activeTab === 'past' && (
            <>
              <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                View Details
              </button>
              <button className="text-sm text-gray-600 hover:text-gray-700 font-medium">
                Download Receipt
              </button>
            </>
          )}
          {activeTab === 'cancelled' && (
            <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
              Rebook Similar
            </button>
          )}
        </div>
        
        {booking.transaction && (
          <p className="text-xs text-gray-500">
            Transaction: {booking.transaction.transactionId}
          </p>
        )}
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    )
  }

  if (error || !bookings) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error || 'Failed to load bookings'}</p>
          </div>
          <button 
            onClick={fetchBookings}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const currentBookings = bookings[activeTab] || []

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Bookings</h1>
        <p className="text-gray-600 mt-2">Manage your class and event bookings</p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'upcoming', label: 'Upcoming', count: bookings.upcoming.length },
            { id: 'past', label: 'Past', count: bookings.past.length },
            { id: 'cancelled', label: 'Cancelled', count: bookings.cancelled.length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-purple-100 text-purple-600'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bookings List */}
      {currentBookings.length === 0 ? (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">
            {activeTab === 'upcoming' ? '📅' : activeTab === 'past' ? '✅' : '❌'}
          </span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No {activeTab} bookings
          </h3>
          <p className="text-gray-600 mb-6">
            {activeTab === 'upcoming' 
              ? "You don't have any upcoming classes or events booked."
              : activeTab === 'past'
              ? "Your past bookings will appear here once you attend classes or events."
              : "Your cancelled bookings will appear here."
            }
          </p>
          {activeTab === 'upcoming' && (
            <div className="flex justify-center space-x-4">
              <Link 
                href="/classes"
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Browse Classes
              </Link>
              <Link 
                href="/events"
                className="px-6 py-3 border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition"
              >
                View Events
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentBookings.map(renderBookingCard)}
        </div>
      )}

      {/* Summary Stats */}
      {currentBookings.length > 0 && (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Bookings Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{currentBookings.length}</p>
              <p className="text-sm text-gray-600">Total Bookings</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                ${currentBookings.reduce((sum, booking) => sum + booking.amountPaid, 0).toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">Total Amount</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">
                {currentBookings.filter(b => b.type === 'class').length}
              </p>
              <p className="text-sm text-gray-600">Classes</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
