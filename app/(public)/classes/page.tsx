'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

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
  const [classes, setClasses] = useState<Class[]>([])
  const [filteredClasses, setFilteredClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
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
            <h1 className="dance-section-title text-5xl mb-4">Dance Classes</h1>
            <p className="text-xl">Find the perfect dance class for your skill level and style</p>
          </div>
        </div>
      </section>

      <div className="dance-container py-12">
        {/* Search and Filters */}
        <div className="dance-search-container">
          <div className="flex flex-wrap gap-4 mb-6">
            <input
              type="text"
              placeholder="🔍 Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="dance-search-input"
            />
            <button
              onClick={filterClasses}
              className="dance-search-button"
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
              className="px-6 py-3 bg-gray-100 rounded-full hover:bg-gray-200 transition"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-8 text-center">
          <p style={{color: 'var(--neutral-gray)'}}>
            Showing {filteredClasses.length} of {classes.length} classes
          </p>
        </div>

        {/* Classes Grid */}
        <div className="dance-card-grid">
          {filteredClasses.map((cls) => (
            <div key={cls.id} className="dance-class-card" style={{
              background: `linear-gradient(rgba(26, 26, 46, 0.4), rgba(26, 26, 46, 0.7)), 
                          linear-gradient(135deg, var(--primary-dark), var(--primary-gold))`
            }}>
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  cls.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  cls.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  cls.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {cls.level}
                </span>
              </div>

              <div className="dance-class-content">
                <h3 className="text-2xl font-semibold mb-2">{cls.title}</h3>
                <p className="text-sm uppercase tracking-wide mb-3" style={{color: 'var(--primary-gold)'}}>
                  {cls.schedule}
                </p>
                <p className="mb-4 opacity-0 transition-opacity duration-300 hover:opacity-100">
                  {cls.description}
                </p>
                
                <div className="space-y-2 mb-4 text-sm opacity-80">
                  <div className="flex items-center">
                    <span className="mr-2">⏱️</span>
                    <span>{cls.duration} minutes</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">📍</span>
                    <span>{cls.venue?.name || 'TBD'}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">👥</span>
                    <span>
                      {getSpotsLeft(cls) > 0 
                        ? `${getSpotsLeft(cls)} spots left`
                        : 'Class full'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-3xl font-bold">${cls.price}</span>
                    <span className="text-sm opacity-75">/class</span>
                  </div>
                  <Link
                    href={`/classes/${cls.id}`}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      getSpotsLeft(cls) > 0
                        ? 'bg-white text-purple-900 hover:transform hover:-translate-y-1 hover:shadow-lg'
                        : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    {getSpotsLeft(cls) > 0 ? 'View Details' : 'Class Full'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredClasses.length === 0 && (
          <div className="text-center py-20">
            <div className="dance-card max-w-md mx-auto">
              <div className="text-6xl mb-4">💃</div>
              <p className="text-lg mb-6" style={{color: 'var(--neutral-gray)'}}>
                No classes found matching your criteria.
              </p>
              <button
                onClick={() => {
                  setFilters({ level: 'all', style: 'all', instructor: 'all', priceRange: 'all' })
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
        {filteredClasses.length > 0 && (
          <div className="text-center py-20">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-3xl font-bold mb-4">🎯 Can't decide which class to choose?</h3>
              <p className="text-lg mb-8" style={{color: 'var(--neutral-gray)'}}>
                Book a free trial class and discover your perfect dance style with our expert instructors
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/contact" 
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                >
                  🎁 Book Free Trial
                </Link>
                <Link 
                  href="/contact" 
                  className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-600 hover:text-white hover:transform hover:scale-105 transition-all duration-300"
                >
                  💬 Get Personalized Advice
                </Link>
              </div>
              <p className="text-sm mt-4 opacity-75">
                ✨ Professional guidance • 🎵 All styles available • 👥 Small group sizes
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
