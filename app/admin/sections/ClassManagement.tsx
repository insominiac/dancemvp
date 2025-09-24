'use client'

import { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Custom styles for date picker
const datePickerCustomStyles = `
  .react-datepicker {
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
  .react-datepicker__header {
    background-color: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }
  .react-datepicker__current-month {
    color: #1f2937;
    font-weight: 600;
  }
  .react-datepicker__day--selected {
    background-color: #8b5cf6 !important;
    color: white !important;
  }
  .react-datepicker__day--keyboard-selected {
    background-color: #a78bfa !important;
    color: white !important;
  }
  .react-datepicker__day:hover {
    background-color: #ede9fe;
  }
  .react-datepicker__day--in-range {
    background-color: #e0e7ff;
  }
`

interface Class {
  id: string
  title: string
  description: string
  level: string
  durationMins: number
  maxCapacity: number
  price: string
  scheduleDays?: string
  scheduleTime?: string
  startDate?: string | Date
  endDate?: string | Date
  isActive: boolean
  classInstructors?: any[]
  classStyles?: any[]
  _count?: { bookings: number }
}

// Helper function to calculate duration between dates
function calculateDuration(startDate: Date | null, endDate: Date | null): string {
  if (!startDate || !endDate) return ''
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  const weeks = Math.floor(diffDays / 7)
  const remainingDays = diffDays % 7
  
  let duration = ''
  if (weeks > 0) {
    duration += `${weeks} week${weeks > 1 ? 's' : ''}`
    if (remainingDays > 0) {
      duration += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`
    }
  } else {
    duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`
  }
  
  return `(${duration})`
}

export default function ClassManagement({ helperData }: { helperData: any }) {
  const [classes, setClasses] = useState<Class[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingClass, setEditingClass] = useState<Class | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'Beginner',
    durationMins: '60',
    maxCapacity: '30',
    price: '25',
    scheduleDays: '',
    scheduleTime: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    requirements: '',
    imageUrl: '',
    isActive: true,
    instructorIds: [] as string[],
    styleIds: [] as string[]
  })

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/classes')
      if (res.ok) {
        const data = await res.json()
        setClasses(data.classes)
      }
    } catch (err) {
      console.error('Error fetching classes:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingClass(null)
    setFormData({
      title: '',
      description: '',
      level: 'Beginner',
      durationMins: '60',
      maxCapacity: '30',
      price: '25',
      scheduleDays: '',
      scheduleTime: '',
      startDate: null,
      endDate: null,
      requirements: '',
      imageUrl: '',
      isActive: true,
      instructorIds: [],
      styleIds: []
    })
    setShowModal(true)
  }

  const handleEdit = (classItem: Class) => {
    setEditingClass(classItem)
    setFormData({
      title: classItem.title,
      description: classItem.description,
      level: classItem.level,
      durationMins: classItem.durationMins.toString(),
      maxCapacity: classItem.maxCapacity.toString(),
      price: classItem.price.toString(),
      scheduleDays: classItem.scheduleDays || '',
      scheduleTime: classItem.scheduleTime || '',
      startDate: classItem.startDate ? new Date(classItem.startDate) : null,
      endDate: classItem.endDate ? new Date(classItem.endDate) : null,
      requirements: '',
      imageUrl: '',
      isActive: classItem.isActive,
      instructorIds: classItem.classInstructors?.map((ci: any) => ci.instructorId) || [],
      styleIds: classItem.classStyles?.map((cs: any) => cs.styleId) || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return
    
    try {
      const res = await fetch(`/api/admin/classes/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchClasses()
        alert('Class deleted successfully')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete class')
      }
    } catch (err) {
      alert('Failed to delete class')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingClass 
      ? `/api/admin/classes/${editingClass.id}`
      : '/api/admin/classes'
    const method = editingClass ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowModal(false)
        fetchClasses()
        alert(`Class ${editingClass ? 'updated' : 'created'} successfully`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save class')
      }
    } catch (err) {
      alert('Failed to save class')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Custom CSS for date picker */}
      <style jsx global>{datePickerCustomStyles}</style>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Class Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          ➕ Add New Class
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {classes.map((classItem) => (
                <tr key={classItem.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{classItem.title}</div>
                      <div className="text-sm text-gray-500">
                        {classItem._count?.bookings || 0} bookings
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      {classItem.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{classItem.scheduleDays || 'Not set'}</div>
                    <div>{classItem.scheduleTime || ''}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div className="text-xs">
                      {classItem.startDate ? (
                        <div>Start: {new Date(classItem.startDate).toLocaleDateString()}</div>
                      ) : (
                        <div className="text-gray-400">No start date</div>
                      )}
                      {classItem.endDate ? (
                        <div>End: {new Date(classItem.endDate).toLocaleDateString()}</div>
                      ) : (
                        <div className="text-gray-400">No end date</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${classItem.price}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {classItem.maxCapacity} spots
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      classItem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {classItem.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(classItem)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id)}
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
              {editingClass ? 'Edit Class' : 'Add New Class'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  required
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (mins)</label>
                  <input
                    type="number"
                    value={formData.durationMins}
                    onChange={(e) => setFormData({...formData, durationMins: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Capacity</label>
                  <input
                    type="number"
                    value={formData.maxCapacity}
                    onChange={(e) => setFormData({...formData, maxCapacity: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Days</label>
                  <input
                    type="text"
                    value={formData.scheduleDays}
                    onChange={(e) => setFormData({...formData, scheduleDays: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Monday, Wednesday, Friday"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Schedule Time</label>
                  <input
                    type="text"
                    value={formData.scheduleTime}
                    onChange={(e) => setFormData({...formData, scheduleTime: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., 6:00 PM"
                  />
                </div>
              </div>
              
              {/* Class Duration Section */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Class Start Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.startDate}
                        onChange={(date) => setFormData({...formData, startDate: date})}
                        selectsStart
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        placeholderText="Select start date"
                        dateFormat="MMM d, yyyy"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        calendarClassName="shadow-lg border-0"
                        popperClassName="z-50"
                        showPopperArrow={false}
                        minDate={new Date()}
                        todayButton="Today"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">When does this class series begin?</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      📅 Class End Date
                    </label>
                    <div className="relative">
                      <DatePicker
                        selected={formData.endDate}
                        onChange={(date) => setFormData({...formData, endDate: date})}
                        selectsEnd
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        placeholderText="Select end date"
                        dateFormat="MMM d, yyyy"
                        className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        calendarClassName="shadow-lg border-0"
                        popperClassName="z-50"
                        showPopperArrow={false}
                        minDate={formData.startDate || new Date()}
                        disabled={!formData.startDate}
                        todayButton="Today"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.startDate ? 'When does this class series end?' : 'Select start date first'}
                    </p>
                  </div>
                </div>
                
                {/* Duration Display */}
                {formData.startDate && formData.endDate && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-purple-600">⏱️</span>
                      <span className="text-sm font-medium text-purple-800">
                        Class Duration: {calculateDuration(formData.startDate, formData.endDate)}
                      </span>
                    </div>
                    <p className="text-xs text-purple-600 mt-1">
                      From {formData.startDate.toLocaleDateString()} to {formData.endDate.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
              
              {helperData && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructors</label>
                    <select
                      multiple
                      value={formData.instructorIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        setFormData({...formData, instructorIds: selected})
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      size={3}
                    >
                      {helperData.instructors?.map((instructor: any) => (
                        <option key={instructor.id} value={instructor.id}>
                          {instructor.name} - {instructor.specialty || 'General'}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Dance Styles</label>
                    <select
                      multiple
                      value={formData.styleIds}
                      onChange={(e) => {
                        const selected = Array.from(e.target.selectedOptions, option => option.value)
                        setFormData({...formData, styleIds: selected})
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      size={3}
                    >
                      {helperData.danceStyles?.map((style: any) => (
                        <option key={style.id} value={style.id}>
                          {style.name} ({style.category})
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                  </div>
                </>
              )}
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Class is Active
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
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  {editingClass ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
