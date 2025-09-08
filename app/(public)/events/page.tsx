'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  price: string
  maxAttendees: number
  currentAttendees: number
  status: string
  isFeatured: boolean
  venue?: { name: string; city: string }
  eventStyles?: any[]
  imageUrl?: string
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    eventType: 'all',
    month: 'all',
    priceRange: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvents()
  }, [])

  useEffect(() => {
    filterEvents()
  }, [events, filters, searchTerm])

  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/public/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data.events)
        setFilteredEvents(data.events)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterEvents = () => {
    let filtered = [...events]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Event type filter
    if (filters.eventType !== 'all') {
      filtered = filtered.filter(event => event.eventType === filters.eventType)
    }

    // Month filter
    if (filters.month !== 'all') {
      filtered = filtered.filter(event => {
        const eventMonth = new Date(event.startDate).getMonth()
        return eventMonth === parseInt(filters.month)
      })
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(event => {
        const price = parseFloat(event.price)
        return price >= min && (max ? price <= max : true)
      })
    }

    setFilteredEvents(filtered)
  }

  const getSpotsLeft = (event: Event) => {
    return event.maxAttendees - event.currentAttendees
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'Workshop': return 'bg-blue-100 text-blue-800'
      case 'Competition': return 'bg-red-100 text-red-800'
      case 'Showcase': return 'bg-purple-100 text-purple-800'
      case 'Social': return 'bg-green-100 text-green-800'
      case 'Masterclass': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatEventDate = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
    
    if (startDate === endDate) {
      return start.toLocaleDateString('en-US', options)
    } else {
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', options)}`
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Upcoming Events</h1>
        <p className="text-xl text-gray-600">
          Join our exciting dance events, workshops, and competitions
        </p>
      </div>

      {/* Featured Events */}
      {events.filter(e => e.isFeatured).length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {events.filter(e => e.isFeatured).slice(0, 2).map((event) => (
              <div key={event.id} className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg p-6 text-white">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold">{event.title}</h3>
                  <span className="text-yellow-300">⭐ Featured</span>
                </div>
                <p className="mb-4 opacity-90">{event.description}</p>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm opacity-75">
                      {formatEventDate(event.startDate, event.endDate)}
                    </p>
                    <p className="text-2xl font-bold mt-2">${event.price}</p>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className="px-6 py-2 bg-white text-purple-600 rounded-lg hover:bg-gray-100 transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({...filters, eventType: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Competition">Competition</option>
              <option value="Showcase">Showcase</option>
              <option value="Social">Social</option>
              <option value="Masterclass">Masterclass</option>
            </select>
          </div>

          {/* Price Range Filter */}
          <div>
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">Any Price</option>
              <option value="0-50">Under $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200-9999">Over $200</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setFilters({ eventType: 'all', month: 'all', priceRange: 'all' })
                setSearchTerm('')
              }}
              className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Showing {filteredEvents.length} of {events.length} events
        </p>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.filter(e => !e.isFeatured).map((event) => (
          <div key={event.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            {/* Event Image */}
            <div className="h-48 bg-gradient-to-br from-indigo-400 to-purple-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-50 text-white">🎉</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getEventTypeColor(event.eventType)}`}>
                  {event.eventType}
                </span>
              </div>
            </div>

            {/* Event Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📅</span>
                  <span>{formatEventDate(event.startDate, event.endDate)}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">⏰</span>
                  <span>{event.startTime} - {event.endTime}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📍</span>
                  <span>{event.venue?.name || 'TBD'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">👥</span>
                  <span>
                    {getSpotsLeft(event) > 0 
                      ? `${getSpotsLeft(event)} spots left`
                      : 'Sold out'}
                  </span>
                </div>
              </div>

              {/* Price and Register Button */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${event.price}</span>
                  <span className="text-sm text-gray-500">/person</span>
                </div>
                <Link
                  href={`/events/${event.id}`}
                  className={`px-4 py-2 rounded-lg transition ${
                    getSpotsLeft(event) > 0 && event.status === 'PUBLISHED'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {getSpotsLeft(event) > 0 ? 'View Details' : 'Sold Out'}
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No events found matching your criteria.</p>
          <button
            onClick={() => {
              setFilters({ eventType: 'all', month: 'all', priceRange: 'all' })
              setSearchTerm('')
            }}
            className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  )
}
