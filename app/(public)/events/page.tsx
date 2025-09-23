'use client'

import React, { useState, useEffect } from 'react'
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

interface EventsPageContent {
  // Hero Section
  heroBadgeText: string
  heroTitle: string
  heroSubtitle: string
  heroFeatures: { icon: string; text: string }[]
  
  // Featured Section
  featuredTitle: string
  featuredDescription: string
  
  // Search Section
  searchTitle: string
  searchDescription: string
  
  // CTA Section
  ctaBadgeText: string
  ctaTitle: string
  ctaDescription: string
  ctaButtons: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
  }
  ctaFeatures: {
    icon: string
    title: string
    description: string
  }[]
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [pageContent, setPageContent] = useState<EventsPageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    eventType: 'all',
    month: 'all',
    priceRange: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchEvents()
    fetchPageContent()
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

  const fetchPageContent = async () => {
    try {
      const res = await fetch('/api/admin/content/events')
      if (res.ok) {
        const content = await res.json()
        setPageContent(content)
      }
    } catch (err) {
      console.error('Error fetching page content:', err)
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

  if (isLoading || !pageContent) {
    return (
      <div className="dance-container">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderBottomColor: 'var(--primary-gold)'}}></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{background: 'var(--neutral-light)'}}>
      {/* Hero Section */}
      <section className="dance-hero">
        <div 
          className="dance-hero-background"
          style={{
            opacity: 0.1
          }}
        ></div>
        <div className="floating-elements">
          <div className="floating-element" style={{top: '20%', left: '10%', animationDelay: '0s'}}>🎭</div>
          <div className="floating-element" style={{top: '60%', right: '10%', animationDelay: '3s'}}>🎆</div>
          <div className="floating-element" style={{bottom: '20%', left: '50%', animationDelay: '6s'}}>✨</div>
        </div>
        <div className="dance-hero-content">
          <p className="dance-hero-subtitle">{pageContent.heroBadgeText}</p>
          <h1 className="dance-hero-title dance-font">
            {pageContent.heroTitle.split(' ').slice(0, -1).join(' ')} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">{pageContent.heroTitle.split(' ').slice(-1)[0]}</span>
          </h1>
          <p className="dance-hero-description">
            {pageContent.heroSubtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {pageContent.heroFeatures.map((feature, index) => (
              <React.Fragment key={index}>
                <div className="flex items-center text-white/90">
                  <span className="mr-2">{feature.icon}</span>
                  <span>{feature.text}</span>
                </div>
                {index < pageContent.heroFeatures.length - 1 && (
                  <div className="hidden sm:block text-white/60">•</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="dance-container">
          {/* Featured Events */}
          {events.filter(e => e.isFeatured).length > 0 && (
            <div className="mb-16">
              <div className="dance-section-header">
                <h2 className="dance-section-title">{pageContent.featuredTitle}</h2>
                <p className="max-w-2xl mx-auto">{pageContent.featuredDescription}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                {events.filter(e => e.isFeatured).slice(0, 2).map((event) => (
                  <div key={event.id} className="dance-card group relative overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
                    {/* Event Image */}
                    <div className="relative h-64 overflow-hidden" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}}>
                      {event.imageUrl && (
                        <img 
                          src={event.imageUrl} 
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 text-xs font-bold rounded-full flex items-center text-white" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}}>
                          <span className="mr-1">⭐</span> FEATURED
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                          {event.title}
                        </h3>
                        <p style={{color: 'var(--neutral-light)'}} className="text-sm font-medium uppercase tracking-wide">
                          {formatEventDate(event.startDate, event.endDate)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Event Content */}
                    <div className="p-6">
                      <p style={{color: 'var(--neutral-gray)'}} className="mb-6 leading-relaxed line-clamp-3">
                        {event.description}
                      </p>
                      
                      <div className="space-y-3 mb-6">
                        <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                          <span className="mr-3 text-lg">🎭</span>
                          <span className="font-medium">{event.eventType}</span>
                        </div>
                        <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                          <span className="mr-3 text-lg">⏰</span>
                          <span className="font-medium">{event.startTime} - {event.endTime}</span>
                        </div>
                        <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                          <span className="mr-3 text-lg">📍</span>
                          <span className="font-medium">{event.venue?.name || 'TBD'}</span>
                        </div>
                        <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                          <span className="mr-3 text-lg">👥</span>
                          <span className="font-medium">
                            {getSpotsLeft(event) > 0 
                              ? `${getSpotsLeft(event)} spots left`
                              : 'Sold out'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-3xl font-bold" style={{color: 'var(--primary-dark)'}}>${event.price}</span>
                          <span className="text-sm ml-1" style={{color: 'var(--neutral-gray)'}}>/person</span>
                        </div>
                        <Link
                          href={`/events/${event.id}`}
                          className="dance-btn dance-btn-accent hover:transform hover:scale-105 transition-all duration-300 px-8 py-3"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                    
                    {/* Premium Badge */}
                    <div className="absolute -top-2 -right-2 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}}>
                      Premium
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="dance-search-container mb-12">
            <div className="dance-section-header">
              <h2 className="dance-section-title">{pageContent.searchTitle}</h2>
              <p>{pageContent.searchDescription}</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search events by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dance-search-input"
                />
              </div>
              <button
                onClick={filterEvents}
                className="dance-btn dance-btn-accent hover:transform hover:scale-105 transition-all duration-300"
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
                <option value="Performance">Performance</option>
                <option value="Social Dance">Social Dance</option>
                <option value="Gala">Gala</option>
                <option value="Kids Event">Kids Event</option>
              </select>
              
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="dance-filter-select"
              >
                <option value="all">Any Price</option>
                <option value="0-25">Under $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-100">$50 - $100</option>
                <option value="100-9999">Over $100</option>
              </select>
              
              <button
                onClick={() => {
                  setFilters({ eventType: 'all', month: 'all', priceRange: 'all' })
                  setSearchTerm('')
                }}
                className="dance-btn dance-btn-secondary hover:transform hover:scale-105 transition-all duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-8 text-center">
            <p className="text-lg" style={{color: 'var(--neutral-gray)'}}>
              <span className="font-semibold" style={{color: 'var(--primary-gold)'}}>{filteredEvents.filter(e => !e.isFeatured).length}</span> of {events.filter(e => !e.isFeatured).length} events match your criteria
            </p>
          </div>

          {/* Events Grid */}
          <div className="dance-card-grid mb-16">
            {filteredEvents.filter(e => !e.isFeatured).map((event) => {
              const spotsLeft = getSpotsLeft(event);
              
              return (
                <div key={event.id} className="dance-card group relative overflow-hidden transform hover:-translate-y-2 transition-all duration-500">
                  {/* Event Header */}
                  <div className="relative h-48 overflow-hidden" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}}>
                    {event.imageUrl && (
                      <img 
                        src={event.imageUrl} 
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    )}
                    <div className="absolute inset-0" style={{background: 'rgba(26, 15, 31, 0.3)'}}></div>
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 text-xs rounded-full font-bold text-white ${
                        event.eventType === 'Workshop' ? 'bg-blue-500' :
                        event.eventType === 'Competition' ? 'bg-red-500' :
                        event.eventType === 'Performance' ? 'bg-purple-500' :
                        event.eventType === 'Social Dance' ? 'bg-green-500' :
                        event.eventType === 'Gala' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}>
                        {event.eventType}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <div className={`px-3 py-1 text-xs rounded-full font-bold text-white ${
                        spotsLeft <= 0 ? 'bg-red-500' :
                        spotsLeft <= 10 ? 'bg-orange-500' :
                        'bg-green-500'
                      }`}>
                        {spotsLeft > 0 ? `${spotsLeft} spots` : 'Sold Out'}
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-yellow-300 transition-colors">
                        {event.title}
                      </h3>
                      <p style={{color: 'var(--neutral-light)'}} className="text-sm font-medium uppercase tracking-wide">
                        {formatEventDate(event.startDate, event.endDate)}
                      </p>
                    </div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <p style={{color: 'var(--neutral-gray)'}} className="mb-6 leading-relaxed line-clamp-2">
                      {event.description}
                    </p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                        <span className="mr-3 text-lg">⏱️</span>
                        <span className="font-medium">{event.startTime} - {event.endTime}</span>
                      </div>
                      <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                        <span className="mr-3 text-lg">📍</span>
                        <span className="font-medium">{event.venue?.name || 'TBD'}</span>
                      </div>
                      <div className="flex items-center" style={{color: 'var(--primary-dark)'}}>
                        <span className="mr-3 text-lg">👥</span>
                        <span className="font-medium">
                          {event.maxAttendees} max attendees
                        </span>
                      </div>
                    </div>

                    {/* Availability Bar */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium" style={{color: 'var(--neutral-gray)'}}>Event Availability</span>
                        <span className={`text-sm font-bold ${
                          spotsLeft <= 0 ? 'text-red-500' :
                          spotsLeft <= 10 ? 'text-orange-500' :
                          'text-green-500'
                        }`}>
                          {spotsLeft > 0 ? `${spotsLeft} spots remaining` : 'Event Full'}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2 overflow-hidden" style={{backgroundColor: 'var(--neutral-light)'}}>
                        <div 
                          className={`h-full transition-all duration-500 ${
                            spotsLeft <= 0 ? 'bg-red-500' :
                            spotsLeft <= 10 ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{width: `${Math.max(5, (spotsLeft / event.maxAttendees) * 100)}%`}}
                        ></div>
                      </div>
                    </div>

                    {/* Price and Action Button */}
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold" style={{color: 'var(--primary-dark)'}}>${event.price}</span>
                        <span className="text-sm ml-1" style={{color: 'var(--neutral-gray)'}}>/person</span>
                      </div>
                      
                      <div className="flex gap-3">
                        <Link
                          href={`/events/${event.id}`}
                          className="dance-btn dance-btn-secondary hover:transform hover:scale-105 transition-all duration-300 px-6 py-3"
                        >
                          Details
                        </Link>
                        {spotsLeft > 0 ? (
                          <Link
                            href={`/events/${event.id}`}
                            className="dance-btn dance-btn-accent hover:transform hover:scale-105 transition-all duration-300 px-6 py-3"
                          >
                            Book Now
                          </Link>
                        ) : (
                          <button className="dance-btn px-6 py-3" style={{backgroundColor: 'var(--neutral-gray)', color: 'white', cursor: 'not-allowed'}}>
                            Sold Out
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Popular Badge */}
                  {spotsLeft <= 10 && spotsLeft > 0 && (
                    <div className="absolute -top-2 -right-2 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}}>
                      Almost Full!
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* No Results */}
          {filteredEvents.length === 0 && (
            <div className="text-center py-20">
              <div className="dance-card max-w-md mx-auto">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--primary-dark)'}}>No events found</h3>
                <p className="text-lg mb-6" style={{color: 'var(--neutral-gray)'}}>
                  No events match your search criteria. Try adjusting your filters or search terms.
                </p>
                <button
                  onClick={() => {
                    setFilters({ eventType: 'all', month: 'all', priceRange: 'all' })
                    setSearchTerm('')
                  }}
                  className="dance-btn dance-btn-accent hover:transform hover:scale-105 transition-all duration-300"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      {filteredEvents.length > 0 && (
        <section className="dance-cta">
          <div 
            className="dance-hero-background"
            style={{
              opacity: 0.1
            }}
          ></div>
          <div className="dance-container">
            <div className="text-center">
              <div className="dance-badge mb-6">
                <span className="mr-2">🎆</span>
                <span className="text-sm font-medium">{pageContent.ctaBadgeText}</span>
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold text-white mb-6 dance-font">
                {pageContent.ctaTitle.split(' ').slice(0, -1).join(' ')} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">{pageContent.ctaTitle.split(' ').slice(-1)[0]}</span>
              </h3>
              <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{color: 'var(--neutral-light)'}}>
                {pageContent.ctaDescription}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link 
                  href={pageContent.ctaButtons.primary.href} 
                  className="dance-btn dance-btn-accent hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  {pageContent.ctaButtons.primary.text}
                </Link>
                <Link 
                  href={pageContent.ctaButtons.secondary.href} 
                  className="dance-btn dance-btn-outline hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  {pageContent.ctaButtons.secondary.text}
                </Link>
              </div>
              
              <div className="dance-card-grid">
                {pageContent.ctaFeatures.map((feature, index) => (
                  <div key={index} className="group text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                    <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                    <p className="text-sm" style={{color: 'var(--neutral-light)'}}>{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
