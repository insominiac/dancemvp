'use client'

import { useState, useEffect } from 'react'

interface Booking {
  id: string
  userId: string
  user?: any
  classId?: string
  class?: any
  eventId?: string
  event?: any
  bookingType: string
  status: string
  amount: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function BookingManagement({ helperData }: { helperData: any }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null)
  const [formData, setFormData] = useState({
    userId: '',
    classId: '',
    eventId: '',
    bookingType: 'Class',
    status: 'PENDING',
    amount: '50',
    notes: ''
  })
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/bookings')
      if (res.ok) {
        const data = await res.json()
        setBookings(data.bookings)
      }
    } catch (err) {
      console.error('Error fetching bookings:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingBooking(null)
    setFormData({
      userId: helperData?.users?.[0]?.id || '',
      classId: '',
      eventId: '',
      bookingType: 'Class',
      status: 'PENDING',
      amount: '50',
      notes: ''
    })
    setShowModal(true)
  }

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking)
    setFormData({
      userId: booking.userId,
      classId: booking.classId || '',
      eventId: booking.eventId || '',
      bookingType: booking.bookingType,
      status: booking.status,
      amount: booking.amount.toString(),
      notes: booking.notes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return
    
    try {
      const res = await fetch(`/api/admin/bookings/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchBookings()
        alert('Booking deleted successfully')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete booking')
      }
    } catch (err) {
      alert('Failed to delete booking')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingBooking 
      ? `/api/admin/bookings/${editingBooking.id}`
      : '/api/admin/bookings'
    const method = editingBooking ? 'PUT' : 'POST'
    
    // Clean up data based on booking type
    const submitData = { ...formData }
    if (formData.bookingType === 'Class') {
      delete (submitData as any).eventId
    } else {
      delete (submitData as any).classId
    }
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData)
      })
      
      if (res.ok) {
        setShowModal(false)
        fetchBookings()
        alert(`Booking ${editingBooking ? 'updated' : 'created'} successfully`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save booking')
      }
    } catch (err) {
      alert('Failed to save booking')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter)

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
        <h2 className="text-3xl font-bold">Booking Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          ➕ Add New Booking
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg transition ${
              filter === status
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? 'All' : status}
            {status !== 'all' && (
              <span className="ml-2 text-xs">
                ({bookings.filter(b => b.status === status).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {booking.user?.name || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {booking.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {booking.bookingType === 'Class' 
                        ? booking.class?.title 
                        : booking.event?.title}
                    </div>
                    {booking.notes && (
                      <div className="text-xs text-gray-500 mt-1">{booking.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                      {booking.bookingType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium">
                    ${booking.amount}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(booking)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(booking.id)}
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
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">
              {editingBooking ? 'Edit Booking' : 'Add New Booking'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select
                  value={formData.userId}
                  onChange={(e) => setFormData({...formData, userId: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select a user</option>
                  {helperData?.users?.map((user: any) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking Type</label>
                <select
                  value={formData.bookingType}
                  onChange={(e) => setFormData({...formData, bookingType: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={!!editingBooking}
                >
                  <option value="Class">Class</option>
                  <option value="Event">Event</option>
                </select>
              </div>
              
              {formData.bookingType === 'Class' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                  <select
                    value={formData.classId}
                    onChange={(e) => setFormData({...formData, classId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select a class</option>
                    {helperData?.classes?.map((cls: any) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.title} - {cls.schedule}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
                  <select
                    value={formData.eventId}
                    onChange={(e) => setFormData({...formData, eventId: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  >
                    <option value="">Select an event</option>
                    {helperData?.events?.map((event: any) => (
                      <option key={event.id} value={event.id}>
                        {event.title} - {new Date(event.startDate).toLocaleDateString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                  placeholder="Optional notes..."
                />
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
                  {editingBooking ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
