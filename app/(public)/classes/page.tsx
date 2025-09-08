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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Dance Classes</h1>
        <p className="text-xl text-gray-600">
          Find the perfect dance class for your skill level and style
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Search classes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Level Filter */}
          <div>
            <select
              value={filters.level}
              onChange={(e) => setFilters({...filters, level: e.target.value})}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
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
              <option value="0-25">Under $25</option>
              <option value="25-50">$25 - $50</option>
              <option value="50-75">$50 - $75</option>
              <option value="75-999">Over $75</option>
            </select>
          </div>

          {/* Clear Filters */}
          <div>
            <button
              onClick={() => {
                setFilters({ level: 'all', style: 'all', instructor: 'all', priceRange: 'all' })
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
          Showing {filteredClasses.length} of {classes.length} classes
        </p>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClasses.map((cls) => (
          <div key={cls.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition">
            {/* Class Image */}
            <div className="h-48 bg-gradient-to-br from-purple-400 to-purple-600 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl opacity-50 text-white">💃</span>
              </div>
              <div className="absolute top-4 right-4">
                <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(cls.level)}`}>
                  {cls.level}
                </span>
              </div>
            </div>

            {/* Class Info */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{cls.title}</h3>
              <p className="text-gray-600 mb-4 line-clamp-2">{cls.description}</p>

              {/* Details */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📅</span>
                  <span>{cls.schedule}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">⏱️</span>
                  <span>{cls.duration} minutes</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">📍</span>
                  <span>{cls.venue?.name || 'TBD'}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">👥</span>
                  <span>
                    {getSpotsLeft(cls) > 0 
                      ? `${getSpotsLeft(cls)} spots left`
                      : 'Class full'}
                  </span>
                </div>
              </div>

              {/* Price and Book Button */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-gray-900">${cls.price}</span>
                  <span className="text-sm text-gray-500">/class</span>
                </div>
                <Link
                  href={`/classes/${cls.id}`}
                  className={`px-4 py-2 rounded-lg transition ${
                    getSpotsLeft(cls) > 0
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
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
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No classes found matching your criteria.</p>
          <button
            onClick={() => {
              setFilters({ level: 'all', style: 'all', instructor: 'all', priceRange: 'all' })
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
