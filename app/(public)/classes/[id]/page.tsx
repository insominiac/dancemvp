'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import EnhancedGuestBookingForm from '@/app/(public)/components/EnhancedGuestBookingForm'

interface ClassDetail {
  id: string
  title: string
  description: string
  level: string
  durationMins: number
  price: string
  maxCapacity: number
  currentStudents: number
  scheduleDays: string
  scheduleTime: string
  startDate: string
  endDate: string
  status: string
  isActive: boolean
  venue?: { 
    name: string
    addressLine1: string
    city: string
    state?: string
  }
  classInstructors?: any[]
  classStyles?: any[]
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  // const { user, isAuthenticated } = useAuth()
  const [classData, setClassData] = useState<ClassDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchClassDetails()
  }, [params.id])

  const fetchClassDetails = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/public/classes/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setClassData(data.class)
      }
    } catch (err) {
      console.error('Error fetching class details:', err)
    } finally {
      setIsLoading(false)
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

  if (!classData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Class not found</h1>
          <Link href="/classes" className="text-purple-600 hover:text-purple-700">
            ← Back to classes
          </Link>
        </div>
      </div>
    )
  }

  const spotsLeft = classData.maxCapacity - classData.currentStudents
  const isAvailable = spotsLeft > 0 && classData.isActive

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20" style={{background: 'linear-gradient(135deg, var(--primary-dark), var(--primary-gold))', color: 'white'}}>
        <div className="dance-container">
          <div className="mb-6">
            <Link href="/classes" className="text-white hover:opacity-80 transition inline-flex items-center">
              ← <span className="ml-2">Back to classes</span>
            </Link>
          </div>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 dance-font">{classData.title}</h1>
              <p className="text-xl opacity-90">{classData.description}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
              classData.level === 'Beginner' ? 'bg-green-100 text-green-800' :
              classData.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
              classData.level === 'Advanced' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {classData.level}
            </span>
          </div>
        </div>
      </section>

      <div className="dance-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="dance-card">
              <div className="mb-8">

                {/* Class Details */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="dance-card" style={{padding: '1.5rem'}}>
                    <h3 className="font-semibold mb-2" style={{color: 'var(--primary-dark)'}}>📅 Schedule</h3>
                    <p style={{color: 'var(--neutral-gray)'}}>{classData.scheduleDays}</p>
                    <p style={{color: 'var(--neutral-gray)'}}>{classData.scheduleTime}</p>
                  </div>
                  <div className="dance-card" style={{padding: '1.5rem'}}>
                    <h3 className="font-semibold mb-2" style={{color: 'var(--primary-dark)'}}>⏱️ Duration</h3>
                    <p style={{color: 'var(--neutral-gray)'}}>{classData.durationMins} minutes per session</p>
                  </div>
                  <div className="dance-card" style={{padding: '1.5rem'}}>
                    <h3 className="font-semibold mb-2" style={{color: 'var(--primary-dark)'}}>🗓️ Start Date</h3>
                    <p style={{color: 'var(--neutral-gray)'}}>
                      {new Date(classData.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="dance-card" style={{padding: '1.5rem'}}>
                    <h3 className="font-semibold mb-2" style={{color: 'var(--primary-dark)'}}>📆 End Date</h3>
                    <p style={{color: 'var(--neutral-gray)'}}>
                      {new Date(classData.endDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Venue Information */}
                {classData.venue && (
                  <div className="dance-card" style={{padding: '1.5rem', marginTop: '1.5rem'}}>
                    <h3 className="font-semibold mb-3" style={{color: 'var(--primary-dark)'}}>📍 Location</h3>
                    <div>
                      <p className="font-medium mb-1" style={{color: 'var(--primary-dark)'}}>{classData.venue.name}</p>
                      <p style={{color: 'var(--neutral-gray)'}}>{classData.venue.addressLine1}</p>
                      <p style={{color: 'var(--neutral-gray)'}}>
                        {classData.venue.city}{classData.venue.state && `, ${classData.venue.state}`}
                      </p>
                    </div>
                  </div>
                )}

                {/* Dance Styles */}
                {classData.classStyles && classData.classStyles.length > 0 && (
                  <div className="dance-card" style={{padding: '1.5rem', marginTop: '1.5rem'}}>
                    <h3 className="font-semibold mb-3" style={{color: 'var(--primary-dark)'}}>💃 Dance Styles</h3>
                    <div className="flex flex-wrap gap-2">
                      {classData.classStyles.map((cs: any) => (
                        <span key={cs.style.id} className="px-3 py-1 rounded-full text-sm" 
                              style={{background: 'var(--primary-gold)', color: 'white'}}>
                          {cs.style.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What to Expect */}
            <div className="dance-card mt-6">
              <h2 className="text-2xl font-bold mb-4" style={{color: 'var(--primary-dark)'}}>What to Expect</h2>
              <ul className="space-y-3" style={{color: 'var(--neutral-gray)'}}>
                <li className="flex items-start">
                  <span style={{color: 'var(--primary-gold)'}} className="mr-2">✓</span>
                  Professional instruction from experienced dancers
                </li>
                <li className="flex items-start">
                  <span style={{color: 'var(--primary-gold)'}} className="mr-2">✓</span>
                  Small class sizes for personalized attention
                </li>
                <li className="flex items-start">
                  <span style={{color: 'var(--primary-gold)'}} className="mr-2">✓</span>
                  Progressive curriculum designed for your level
                </li>
                <li className="flex items-start">
                  <span style={{color: 'var(--primary-gold)'}} className="mr-2">✓</span>
                  Supportive and encouraging environment
                </li>
                <li className="flex items-start">
                  <span style={{color: 'var(--primary-gold)'}} className="mr-2">✓</span>
                  All necessary equipment provided
                </li>
              </ul>
            </div>
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <div className="dance-card sticky top-24" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))', color: 'white'}}>
              <div className="text-center mb-6">
                <p className="text-4xl font-bold mb-2">${classData.price}</p>
                <p className="opacity-80">per class</p>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Available spots:</span>
                  <span className="font-semibold">
                    {spotsLeft > 0 ? `${spotsLeft} left` : 'Class full'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Class size:</span>
                  <span className="font-semibold">{classData.maxCapacity} students max</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="opacity-80">Currently enrolled:</span>
                  <span className="font-semibold">{classData.currentStudents} students</span>
                </div>
              </div>

              <EnhancedGuestBookingForm
                item={{
                  id: classData.id,
                  title: classData.title,
                  price: classData.price,
                  type: 'class',
                  spotsLeft: spotsLeft,
                  maxCapacity: classData.maxCapacity
                }}
                isAvailable={isAvailable}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
