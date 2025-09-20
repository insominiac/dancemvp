'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Instructor {
  id: string
  name: string
  bio: string
  specialties: string
  experience: string
  imageUrl: string
  email: string
  phone: string
  socialLinks: any
  isActive: boolean
  classCount: number
  activeClasses: Array<{
    id: string
    title: string
    level: string
    isPrimary: boolean
  }>
  specialtiesArray: string[]
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await fetch('/api/public/instructors')
        if (response.ok) {
          const data = await response.json()
          setInstructors(data.instructors)
        } else {
          setError('Failed to load instructor data')
        }
      } catch (error) {
        console.error('Error fetching instructors:', error)
        setError('Failed to load instructor data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstructors()
  }, [])

  const getPlaceholderImage = (name: string) => {
    // Generate placeholder image based on name
    const colors = ['3B82F6', '8B5CF6', 'EF4444', '10B981', 'F59E0B', '6366F1']
    const colorIndex = name.length % colors.length
    const color = colors[colorIndex]
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=300&font-size=0.6`
  }

  if (isLoading) {
    return (
      <div>
        {/* Header Section */}
        <section className="py-20" style={{background: 'linear-gradient(135deg, var(--neutral-light), rgba(255,255,255,0.8)'}}>
          <div className="dance-container">
            <div className="dance-section-header">
              <h1 className="dance-section-title text-5xl mb-4">Our Instructors</h1>
              <p className="text-xl">Meet the professionals behind our classes</p>
            </div>
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        {/* Header Section */}
        <section className="py-20" style={{background: 'linear-gradient(135deg, var(--neutral-light), rgba(255,255,255,0.8)'}}>
          <div className="dance-container">
            <div className="dance-section-header">
              <h1 className="dance-section-title text-5xl mb-4">Our Instructors</h1>
              <p className="text-xl">Meet the professionals behind our classes</p>
            </div>
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg p-8 text-center border border-red-200">
            <p className="text-red-600">{error}</p>
            <p className="text-sm text-gray-500 mt-2">Please try refreshing the page.</p>
          </div>
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
            <h1 className="dance-section-title text-5xl mb-4">Our Instructors</h1>
            <p className="text-xl">Meet the {instructors.length} talented professionals behind our classes</p>
          </div>
        </div>
      </section>

      <div className="dance-container py-12">
        {instructors.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center border border-dashed">
            <div className="text-6xl mb-4">👨‍🏫</div>
            <p className="text-gray-600">No instructor profiles available at the moment.</p>
            <p className="text-sm text-gray-500 mt-2">Check back soon as we add more instructors to our team.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {instructors.map((instructor) => (
              <div key={instructor.id} className="dance-card hover:transform hover:-translate-y-2 transition-all duration-300">
                <div className="text-center">
                  {/* Instructor Image */}
                  <div className="mb-6">
                    <img
                      src={instructor.imageUrl || getPlaceholderImage(instructor.name)}
                      alt={instructor.name}
                      className="w-32 h-32 rounded-full mx-auto object-cover border-4 border-white shadow-lg"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = getPlaceholderImage(instructor.name)
                      }}
                    />
                  </div>
                  
                  {/* Instructor Info */}
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2" style={{color: 'var(--primary-dark)'}}>
                      {instructor.name}
                    </h3>
                    {instructor.experience && (
                      <p className="text-sm uppercase tracking-wide mb-2" style={{color: 'var(--primary-gold)'}}>
                        {instructor.experience} Experience
                      </p>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {instructor.bio && (
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {instructor.bio.length > 120 
                        ? `${instructor.bio.substring(0, 120)}...` 
                        : instructor.bio}
                    </p>
                  )}
                  
                  {/* Specialties */}
                  {instructor.specialtiesArray.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs font-semibold text-gray-500 mb-2">SPECIALTIES</p>
                      <div className="flex flex-wrap justify-center gap-1">
                        {instructor.specialtiesArray.slice(0, 4).map((specialty, index) => (
                          <span 
                            key={index} 
                            className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs"
                          >
                            {specialty}
                          </span>
                        ))}
                        {instructor.specialtiesArray.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                            +{instructor.specialtiesArray.length - 4} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Classes Info */}
                  <div className="mb-6">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold" style={{color: 'var(--primary-gold)'}}>
                          {instructor.classCount}
                        </div>
                        <div className="text-xs text-gray-500">Active Classes</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold" style={{color: 'var(--primary-gold)'}}>
                          {instructor.activeClasses.filter(c => c.isPrimary).length}
                        </div>
                        <div className="text-xs text-gray-500">Lead Instructor</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Active Classes */}
                  {instructor.activeClasses.length > 0 && (
                    <div className="mb-6">
                      <p className="text-xs font-semibold text-gray-500 mb-2">CURRENT CLASSES</p>
                      <div className="space-y-1">
                        {instructor.activeClasses.slice(0, 3).map((cls) => (
                          <Link 
                            key={cls.id} 
                            href={`/classes/${cls.id}`}
                            className="block text-sm text-gray-600 hover:text-purple-600 transition-colors"
                          >
                            {cls.title} ({cls.level})
                            {cls.isPrimary && <span className="text-xs text-purple-600 ml-1">★</span>}
                          </Link>
                        ))}
                        {instructor.activeClasses.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{instructor.activeClasses.length - 3} more classes
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Contact Button */}
                  <Link 
                    href={`/classes?instructor=${instructor.name}`}
                    className="dance-btn dance-btn-primary text-sm px-6 py-2"
                  >
                    View Classes
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
