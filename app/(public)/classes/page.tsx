'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Class {
  id: string
  title: string
  description: string
  level: string
  duration: number
  price: string
  maxStudents: number
  currentStudents: number
  schedule: string
  startDate: string
  endDate: string
  status: string
  venue?: { name: string; city: string }
  classInstructors?: any[]
  classStyles?: any[]
  imageUrl?: string
}

export default function ClassesPage() {
  const router = useRouter()
  const [classes, setClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [bookingClass, setBookingClass] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    level: 'all',
    style: 'all',
    instructor: 'all',
    priceRange: 'all'
  })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    filterClasses()
  }, [classes, filters, searchTerm])

  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/public/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data.classes)
        setFilteredClasses(data.classes)
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filterClasses = () => {
    let filtered = [...classes]

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(cls => 
        cls.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cls.description.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Level filter
    if (filters.level !== 'all') {
      filtered = filtered.filter(cls => cls.level === filters.level)
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      const [min, max] = filters.priceRange.split('-').map(Number)
      filtered = filtered.filter(cls => {
        const price = parseFloat(cls.price)
        return price >= min && (max ? price <= max : true)
      })
    }

    setFilteredClasses(filtered)
  }

  const getSpotsLeft = (cls: Class) => {
    return cls.maxStudents - cls.currentStudents
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const handleBookNow = (cls: Class) => {
    const bookingData = {
      classId: cls.id,
      className: cls.title,
      price: cls.price,
      bookingType: 'class',
      userDetails: {
        name: '',
        email: '',
        phone: '',
        emergencyContact: '',
        emergencyPhone: '',
        experience: 'beginner',
        notes: ''
      }
    }
    
    // Store booking data and redirect to booking form
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData))
    router.push(`/classes/${cls.id}/book`)
  }

  const getAvailabilityStatus = (cls: Class) => {
    const spotsLeft = getSpotsLeft(cls)
    if (spotsLeft <= 0) return { status: 'full', color: 'text-red-500', icon: '🚫' }
    if (spotsLeft <= 3) return { status: 'few', color: 'text-orange-500', icon: '⚠️' }
    return { status: 'available', color: 'text-green-500', icon: '✅' }
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="dance-container py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto" style={{borderBottomColor: 'var(--primary-gold)'}}></div>
            <p className="text-gray-600">Loading dance classes...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)] bg-gray-50">
      {/* Header Section */}
      <section className="dance-hero">
        <div 
          className="dance-hero-background"
          style={{
            opacity: 0.1
          }}
        ></div>
        <div className="floating-elements">
          <div className="floating-element" style={{top: '20%', left: '10%', animationDelay: '0s'}}>💃</div>
          <div className="floating-element" style={{top: '60%', right: '10%', animationDelay: '3s'}}>🎵</div>
          <div className="floating-element" style={{bottom: '20%', left: '50%', animationDelay: '6s'}}>✨</div>
        </div>
        <div className="dance-hero-content">
          <p className="dance-hero-subtitle">Discover Your Perfect Dance Style</p>
          <h1 className="dance-hero-title dance-font">
            Dance <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">Classes</span>
          </h1>
          <p className="dance-hero-description">
            Join our vibrant dance community and learn from world-class instructors in a supportive, fun environment
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 flex-wrap">
            <div className="flex items-center text-white/90 text-sm sm:text-base whitespace-nowrap">
              <span className="mr-2">✨</span>
              <span>All skill levels welcome</span>
            </div>
            <div className="hidden sm:block text-white/60 mx-2">•</div>
            <div className="flex items-center text-white/90 text-sm sm:text-base whitespace-nowrap">
              <span className="mr-2">👥</span>
              <span>Small class sizes</span>
            </div>
            <div className="hidden sm:block text-white/60 mx-2">•</div>
            <div className="flex items-center text-white/90 text-sm sm:text-base whitespace-nowrap">
              <span className="mr-2">🏆</span>
              <span>Expert instructors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="dance-container">
          {/* Search and Filters */}
          <div className="dance-search-container mb-12">
            <div className="dance-section-header">
              <h2 className="dance-section-title">Find Your Perfect Class</h2>
              <p>Filter classes by your preferences and skill level</p>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search classes by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="dance-search-input"
                />
              </div>
              <button
                onClick={filterClasses}
                className="dance-btn dance-btn-accent hover:transform hover:scale-105 transition-all duration-300"
              >
                Search Classes
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <select
                value={filters.level}
                onChange={(e) => setFilters({...filters, level: e.target.value})}
                className="dance-filter-select"
              >
                <option value="all">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
              
              <select
                value={filters.priceRange}
                onChange={(e) => setFilters({...filters, priceRange: e.target.value})}
                className="dance-filter-select"
              >
                <option value="all">Any Price</option>
                <option value="0-25">Under $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50-75">$50 - $75</option>
                <option value="75-999">Over $75</option>
              </select>
              
              <button
                onClick={() => {
                  setFilters({ level: 'all', style: 'all', instructor: 'all', priceRange: 'all' })
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
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200">
              <span className="text-sm text-gray-600">
                <span className="font-semibold text-indigo-600">{filteredClasses.length}</span> of {classes.length} classes found
              </span>
            </div>
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredClasses.map((cls) => {
              const availability = getAvailabilityStatus(cls)
              const spotsLeft = getSpotsLeft(cls)
              
              return (
                <div key={cls.id} className="bg-white rounded-xl shadow-md overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col border border-gray-100">
                  {/* Card Header */}
                  <div className="relative h-48 bg-gradient-to-br from-slate-50 to-slate-100 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
                    
                    {/* Badges - Level and Availability */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                      <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        cls.level === 'Beginner' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        cls.level === 'Intermediate' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        cls.level === 'Advanced' ? 'bg-rose-100 text-rose-700 border border-rose-200' :
                        'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}>
                        {cls.level}
                      </span>
                      <div className={`px-3 py-1 text-xs rounded-full font-semibold ${
                        availability.status === 'full' ? 'bg-red-50 text-red-700 border border-red-200' :
                        availability.status === 'few' ? 'bg-orange-50 text-orange-700 border border-orange-200' :
                        'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        <span className="hidden sm:inline">{availability.icon} </span>
                        {spotsLeft > 0 ? `${spotsLeft} left` : 'Full'}
                      </div>
                    </div>
                    
                    {/* Title */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                        {cls.title}
                      </h3>
                      <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                        {cls.schedule}
                      </p>
                    </div>
                    
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-indigo-600/10 via-transparent to-transparent"></div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    {/* Description */}
                    <p className="text-gray-600 mb-4 leading-relaxed text-sm line-clamp-2">
                      {cls.description}
                    </p>
                    
                    {/* Details Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                          <span className="text-blue-600 text-sm">⏱️</span>
                        </div>
                        <span className="text-sm font-medium">{cls.duration}min</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center mr-3">
                          <span className="text-green-600 text-sm">📍</span>
                        </div>
                        <span className="text-sm font-medium truncate">{cls.venue?.name || 'TBD'}</span>
                      </div>
                      <div className="flex items-center text-gray-700 col-span-1 sm:col-span-1">
                        <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center mr-3">
                          <span className="text-purple-600 text-sm">👨‍🏫</span>
                        </div>
                        <span className="text-sm font-medium truncate">
                          {cls.classInstructors?.[0]?.instructor?.user?.fullName || 'Pro Instructor'}
                        </span>
                      </div>
                    </div>

                    {/* Availability Section */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-sm font-semibold text-gray-700">Class Availability</span>
                        <span className={`text-sm font-bold ${
                          availability.status === 'full' ? 'text-red-600' :
                          availability.status === 'few' ? 'text-orange-600' :
                          'text-green-600'
                        }`}>
                          {spotsLeft > 0 ? `${spotsLeft}/${cls.maxStudents} spots left` : 'Class Full'}
                        </span>
                      </div>
                      <div className="w-full rounded-full h-2 overflow-hidden bg-gray-200">
                        <div 
                          className={`h-full transition-all duration-500 rounded-full ${
                            availability.status === 'full' ? 'bg-red-500' :
                            availability.status === 'few' ? 'bg-orange-500' :
                            'bg-green-500'
                          }`}
                          style={{width: `${Math.max(10, (spotsLeft / cls.maxStudents) * 100)}%`}}
                        ></div>
                      </div>
                    </div>

                    {/* Price and Actions */}
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4 pb-4 border-t border-gray-100">
                        <div className="pt-4">
                          <span className="text-2xl font-bold text-gray-900">${cls.price}</span>
                          <span className="text-sm text-gray-500 ml-1">/class</span>
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        <Link
                          href={`/classes/${cls.id}`}
                          className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-center rounded-lg font-medium transition-all duration-300 hover:transform hover:scale-105"
                        >
                          View Details
                        </Link>
                        {spotsLeft > 0 ? (
                          <button
                            onClick={() => handleBookNow(cls)}
                            disabled={bookingClass === cls.id}
                            className="flex-1 px-4 py-3 text-white font-semibold rounded-lg transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            style={{
                              background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose)), linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}
                          >
                            {bookingClass === cls.id ? (
                              <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Booking...
                              </div>
                            ) : (
                              'Book Now'
                            )}
                          </button>
                        ) : (
                          <button className="flex-1 px-4 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed">
                            Class Full
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Popular Badge */}
                  {spotsLeft <= 3 && spotsLeft > 0 && (
                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full transform rotate-12 shadow-lg">
                      Almost Full!
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* No Results */}
        {filteredClasses.length === 0 && (
          <div className="text-center py-20">
            <div className="bg-white rounded-xl shadow-md p-8 max-w-md mx-auto border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-gray-400">💃</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Classes Found</h3>
              <p className="text-gray-600 mb-6">
                No classes match your current search criteria. Try adjusting your filters or search terms.
              </p>
              <button
                onClick={() => {
                  setFilters({ level: 'all', style: 'all', instructor: 'all', priceRange: 'all' })
                  setSearchTerm('')
                }}
                className="px-6 py-3 text-white font-semibold rounded-lg transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose)), linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        )}
        
          {/* CTA Section */}
          {filteredClasses.length > 0 && (
            <section className="text-center py-20">
              <div className="max-w-2xl mx-auto">
                <h3 className="text-3xl font-bold mb-4 text-gray-900">🎯 Can't decide which class to choose?</h3>
                <p className="text-lg mb-8 text-gray-600">
                  Book a free trial class and discover your perfect dance style with our expert instructors
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                  <Link 
                    href="/contact" 
                    className="flex-1 text-center px-6 py-3 text-white font-bold rounded-lg transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl"
                    style={{ background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose)), linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.1))'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))'}
                  >
                    🎁 Free Trial
                  </Link>
                  <Link 
                    href="/contact" 
                    className="flex-1 text-center px-6 py-3 border-2 font-bold rounded-lg transition-all duration-300 hover:transform hover:scale-105"
                    style={{ 
                      borderColor: 'var(--accent-rose)',
                      color: 'var(--accent-rose)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--accent-rose)'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = 'var(--accent-rose)'
                    }}
                  >
                    💬 Get Advice
                  </Link>
                </div>
                <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs sm:text-sm text-gray-600">
                  <div className="flex items-center">
                    <span className="mr-1">✨</span>
                    <span>Professional guidance</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">🎵</span>
                    <span>All styles available</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1">👥</span>
                    <span>Small group sizes</span>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  )
}
