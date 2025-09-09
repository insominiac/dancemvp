'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { QuickBooking } from '@/app/components/payments/CheckoutButton'

interface ClassDetail {
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
  venue?: { 
    name: string
    address: string
    city: string
    state?: string
  }
  classInstructors?: any[]
  classStyles?: any[]
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
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

  const spotsLeft = classData.maxStudents - classData.currentStudents
  const isAvailable = spotsLeft > 0 && classData.status === 'ACTIVE'

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link href="/classes" className="text-purple-600 hover:text-purple-700">
          ← Back to classes
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Class Header */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{classData.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  classData.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                  classData.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                  classData.level === 'Advanced' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {classData.level}
                </span>
              </div>
              <p className="text-gray-600 text-lg">{classData.description}</p>
            </div>

            {/* Class Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Schedule</h3>
                <p className="text-gray-600">{classData.schedule}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Duration</h3>
                <p className="text-gray-600">{classData.duration} minutes per session</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Start Date</h3>
                <p className="text-gray-600">
                  {new Date(classData.startDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">End Date</h3>
                <p className="text-gray-600">
                  {new Date(classData.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {/* Venue Information */}
            {classData.venue && (
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Location</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-medium text-gray-900">{classData.venue.name}</p>
                  <p className="text-gray-600">{classData.venue.address}</p>
                  <p className="text-gray-600">
                    {classData.venue.city}{classData.venue.state && `, ${classData.venue.state}`}
                  </p>
                </div>
              </div>
            )}

            {/* Instructors */}
            {classData.classInstructors && classData.classInstructors.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Instructor(s)</h3>
                <div className="space-y-3">
                  {classData.classInstructors.map((ci: any) => (
                    <div key={ci.instructor.id} className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-semibold">
                          {ci.instructor.user.name?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{ci.instructor.user.name}</p>
                        <p className="text-sm text-gray-600">
                          {ci.instructor.experience} years experience
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dance Styles */}
            {classData.classStyles && classData.classStyles.length > 0 && (
              <div className="border-t pt-6 mt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Dance Styles</h3>
                <div className="flex flex-wrap gap-2">
                  {classData.classStyles.map((cs: any) => (
                    <span key={cs.style.id} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {cs.style.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* What to Expect */}
          <div className="bg-white rounded-lg shadow-lg p-8 mt-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What to Expect</h2>
            <ul className="space-y-3 text-gray-600">
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                Professional instruction from experienced dancers
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                Small class sizes for personalized attention
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                Progressive curriculum designed for your level
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                Supportive and encouraging environment
              </li>
              <li className="flex items-start">
                <span className="text-purple-600 mr-2">✓</span>
                All necessary equipment provided
              </li>
            </ul>
          </div>
        </div>

        {/* Booking Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
            <div className="text-center mb-6">
              <p className="text-3xl font-bold text-gray-900">${classData.price}</p>
              <p className="text-gray-600">per class</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Available spots:</span>
                <span className={`font-semibold ${
                  spotsLeft > 5 ? 'text-green-600' : 
                  spotsLeft > 0 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {spotsLeft > 0 ? `${spotsLeft} left` : 'Class full'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Class size:</span>
                <span className="font-semibold">{classData.maxStudents} students max</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Currently enrolled:</span>
                <span className="font-semibold">{classData.currentStudents} students</span>
              </div>
            </div>

            {isAvailable ? (
              <QuickBooking
                bookingType="class"
                itemId={classData.id}
                itemName={classData.title}
                price={parseFloat(classData.price)}
                userId={"temp-user-id"}  // TODO: Get from auth context
                className="w-full py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                onAuthRequired={() => {
                  // TODO: Redirect to login
                  alert('Please sign in to book this class')
                }}
              />
            ) : (
              <button
                disabled
                className="w-full py-3 rounded-lg font-semibold bg-gray-300 text-gray-500 cursor-not-allowed"
              >
                Class Unavailable
              </button>
            )}

            <p className="text-xs text-gray-500 text-center mt-4">
              Free cancellation up to 24 hours before class
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}
