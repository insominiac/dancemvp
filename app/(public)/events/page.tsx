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
    <div>
      {/* Header Section */}
      <section className="py-20" style={{background: 'linear-gradient(135deg, var(--neutral-light), rgba(255,255,255,0.8)'}}>
        <div className="dance-container">
          <div className="dance-section-header">
            <h1 className="dance-section-title text-5xl mb-4">Upcoming Events</h1>
            <p className="text-xl">Join our exciting dance events, workshops, and competitions</p>
          </div>
        </div>
      </section>

      <div className="dance-container py-12">

        {/* Featured Events */}
        {events.filter(e => e.isFeatured).length > 0 && (
          <div className="mb-16">
            <div className="dance-section-header mb-8">
              <h2 className="text-3xl font-bold dance-font" style={{color: 'var(--primary-dark)'}}>Featured Events</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {events.filter(e => e.isFeatured).slice(0, 2).map((event) => (
                <div key={event.id} className="dance-card" style={{
                  background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="absolute top-4 right-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                  <h3 className="text-3xl font-bold mb-4 dance-font">{event.title}</h3>
                  <p className="mb-6 opacity-90 text-lg">{event.description}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-sm opacity-75 mb-2">
                        {formatEventDate(event.startDate, event.endDate)}
                      </p>
                      <p className="text-3xl font-bold">${event.price}</p>
                    </div>
                    <Link
                      href={`/events/${event.id}`}
                      className="px-8 py-3 bg-white rounded-full font-semibold hover:transform hover:-translate-y-1 hover:shadow-lg transition-all"
                      style={{color: 'var(--primary-dark)'}}
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
        <div className="dance-search-container">
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dance-search-input"
            />
            <button
              onClick={filterEvents}
              className="dance-search-button"
            >
              Search Events
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 justify-center">
            <select
              value={filters.eventType}
              onChange={(e) => setFilters({...filters, eventType: e.target.value})}
              className="dance-filter-select"
            >
              <option value="all">All Types</option>
              <option value="Workshop">Workshop</option>
              <option value="Competition">Competition</option>
              <option value="Showcase">Showcase</option>
              <option value="Social">Social</option>
              <option value="Masterclass">Masterclass</option>
            </select>
            
            <select
              value={filters.priceRange}
              onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
              className="dance-filter-select"
            >
              <option value="all">Any Price</option>
              <option value="0-50">Under $50</option>
              <option value="50-100">$50 - $100</option>
              <option value="100-200">$100 - $200</option>
              <option value="200-9999">Over $200</option>
            </select>
            
            <button
              onClick={() => {
                setFilters({ eventType: 'all', month: 'all', priceRange: 'all' })
                setSearchTerm('')
              }}
              className="px-6 py-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <p style={{color: 'var(--neutral-gray)'}}>
            Showing {filteredEvents.length} of {events.length} events
          </p>
        </div>

        {/* Events Grid */}
        <div className="dance-card-grid">
          {filteredEvents.filter(e => !e.isFeatured).map((event) => (
            <div key={event.id} className="dance-class-card" style={{
              background: `linear-gradient(rgba(26, 26, 46, 0.4), rgba(26, 26, 46, 0.7)), 
                          linear-gradient(135deg, var(--primary-dark), var(--accent-rose))`
            }}>
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  event.eventType === 'Workshop' ? 'bg-blue-100 text-blue-800' :
                  event.eventType === 'Competition' ? 'bg-red-100 text-red-800' :
                  event.eventType === 'Showcase' ? 'bg-purple-100 text-purple-800' :
                  event.eventType === 'Social' ? 'bg-green-100 text-green-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {event.eventType}
                </span>
              </div>

              <div className="dance-class-content">
                <h3 className="text-2xl font-semibold mb-2">{event.title}</h3>
                <p className="text-sm uppercase tracking-wide mb-3" style={{color: 'var(--primary-gold)'}}>
                  {formatEventDate(event.startDate, event.endDate)}
                </p>
                <p className="mb-4 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  {event.description}
                </p>
                
                <div className="space-y-2 mb-4 text-sm opacity-80">
                  <div className="flex items-center">
                    <span className="mr-2">⏰</span>
                    <span>{event.startTime} - {event.endTime}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>{event.venue?.name || 'TBD'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">👥</span>
                    <span>
                      {getSpotsLeft(event) > 0 
                        ? `${getSpotsLeft(event)} spots left`
                        : 'Sold out'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold">${event.price}</span>
                    <span className="text-sm opacity-75">/person</span>
                  </div>
                  <Link
                    href={`/events/${event.id}`}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      getSpotsLeft(event) > 0 && event.status === 'PUBLISHED'
                        ? 'bg-white text-purple-900 hover:transform hover:-translate-y-1 hover:shadow-lg'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
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
          <div className="text-center py-20">
            <div className="dance-card max-w-md mx-auto">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg mb-6" style={{color: 'var(--neutral-gray)'}}>
                No events found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setFilters({ eventType: 'all', month: 'all', priceRange: 'all' })
                  setSearchTerm('')
                }}
                className="dance-btn dance-btn-primary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
        
        {/* CTA Section */}
        {filteredEvents.length > 0 && (
          <div className="py-20">
            <div className="max-w-4xl mx-auto text-center">
              <div className="dance-card" style={{
                background: 'linear-gradient(135deg, var(--primary-dark), var(--accent-rose))',
                color: 'white'
              }}>
                <h3 className="text-4xl font-bold mb-4 dance-font">🎤 Ready to Join the Party?</h3>
                <p className="text-xl mb-8 opacity-90">
                  Don't miss out on our exclusive dance events! Book early to secure your spot and join our vibrant community.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
                  <Link 
                    href="/contact" 
                    className="px-8 py-4 bg-white rounded-full font-bold text-lg hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                    style={{color: 'var(--primary-dark)'}}
                  >
                    🎟️ Reserve Your Spot
                  </Link>
                  <Link 
                    href="/contact" 
                    className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-800 hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                  >
                    📞 Get Event Updates
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 text-sm">
                  <div className="opacity-90">
                    <div className="text-2xl mb-2">🎯</div>
                    <p><strong>Early Bird Discounts</strong><br/>Book in advance and save</p>
                  </div>
                  <div className="opacity-90">
                    <div className="text-2xl mb-2">🎆</div>
                    <p><strong>VIP Experience</strong><br/>Front row seats available</p>
                  </div>
                  <div className="opacity-90">
                    <div className="text-2xl mb-2">🎁</div>
                    <p><strong>Group Packages</strong><br/>Bring friends and save more</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
