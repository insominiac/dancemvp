'use client'

import { useState, useEffect } from 'react'

interface Instructor {
  id: string
  userId: string
  user?: any
  bio: string
  experience: number
  specialties: string[]
  certifications: string[]
  hourlyRate: string
  isAvailable: boolean
  rating: number
  totalStudents: number
  profileImageUrl?: string
  instructorStyles?: any[]
  classes?: any[]
  _count?: { classes: number; students: number }
}

export default function InstructorManagement() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    bio: '',
    experience: '1',
    specialties: [] as string[],
    certifications: [] as string[],
    hourlyRate: '50',
    isAvailable: true,
    profileImageUrl: ''
  })

  useEffect(() => {
    fetchInstructors()
  }, [])

  const fetchInstructors = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/instructors')
      if (res.ok) {
        const data = await res.json()
        setInstructors(data.instructors)
      }
    } catch (err) {
      console.error('Error fetching instructors:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingInstructor(null)
    setFormData({
      userId: '',
      bio: '',
      experience: '1',
      specialties: [],
      certifications: [],
      hourlyRate: '50',
      isAvailable: true,
      profileImageUrl: ''
    })
    setShowModal(true)
  }

  const handleEdit = (instructor: Instructor) => {
    setEditingInstructor(instructor)
    setFormData({
      userId: instructor.userId,
      bio: instructor.bio || '',
      experience: instructor.experience.toString(),
      specialties: instructor.specialties || [],
      certifications: instructor.certifications || [],
      hourlyRate: instructor.hourlyRate.toString(),
      isAvailable: instructor.isAvailable,
      profileImageUrl: instructor.profileImageUrl || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instructor profile?')) return
    
    try {
      const res = await fetch(`/api/admin/instructors/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchInstructors()
        alert('Instructor deleted successfully')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete instructor')
      }
    } catch (err) {
      alert('Failed to delete instructor')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingInstructor 
      ? `/api/admin/instructors/${editingInstructor.id}`
      : '/api/admin/instructors'
    const method = editingInstructor ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowModal(false)
        fetchInstructors()
        alert(`Instructor ${editingInstructor ? 'updated' : 'created'} successfully`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save instructor')
      }
    } catch (err) {
      alert('Failed to save instructor')
    }
  }

  const toggleSpecialty = (specialty: string) => {
    setFormData(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(s => s !== specialty)
        : [...prev.specialties, specialty]
    }))
  }

  const addCertification = () => {
    const cert = prompt('Enter certification name:')
    if (cert && cert.trim()) {
      setFormData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert.trim()]
      }))
    }
  }

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }))
  }

  const availableSpecialties = [
    'Contemporary', 'Ballet', 'Jazz', 'Hip Hop', 'Latin',
    'Ballroom', 'Street', 'Modern', 'Tap', 'Salsa',
    'Bachata', 'Swing', 'Tango', 'Breaking', 'Choreography'
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Instructor Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          ➕ Add New Instructor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Instructor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Experience</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Classes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {instructors.map((instructor) => (
                <tr key={instructor.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {instructor.user?.name || 'Unknown'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {instructor.user?.email}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {instructor.specialties?.length || 0} specialties
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{instructor.experience} years</div>
                    <div className="text-xs text-gray-500">
                      {instructor.certifications?.length || 0} certifications
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${instructor.hourlyRate}/hr
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <span className="text-yellow-500">⭐</span>
                      <span className="ml-1 text-sm">{instructor.rating || 0}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {instructor.totalStudents || 0} students
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {instructor._count?.classes || 0} active
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      instructor.isAvailable
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {instructor.isAvailable ? 'Available' : 'Unavailable'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(instructor)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(instructor.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingInstructor ? 'Edit Instructor' : 'Add New Instructor'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingInstructor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <select
                    value={formData.userId}
                    onChange={(e) => setFormData({...formData, userId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select a user (must be instructor role)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">User must have instructor role</p>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Instructor bio..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={(e) => setFormData({...formData, experience: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({...formData, hourlyRate: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSpecialties.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={() => toggleSpecialty(specialty)}
                        className="rounded"
                      />
                      <span className="text-sm">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Certifications</label>
                <div className="space-y-2">
                  {formData.certifications.map((cert, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 rounded">{cert}</span>
                      <button
                        type="button"
                        onClick={() => removeCertification(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addCertification}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    + Add Certification
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profile Image URL</label>
                <input
                  type="url"
                  value={formData.profileImageUrl}
                  onChange={(e) => setFormData({...formData, profileImageUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Optional"
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Available for bookings
                </label>
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  {editingInstructor ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
