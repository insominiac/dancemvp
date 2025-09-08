'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Stats {
  totalUsers: number
  totalClasses: number
  totalEvents: number
  totalBookings: number
  totalVenues: number
  totalInstructors: number
  confirmedBookings: number
  totalTransactions: number
  totalForumPosts: number
  totalTestimonials: number
  totalDanceStyles: number
  totalRevenue: number
  unreadNotifications: number
  activePartnerRequests: number
  unreadMessages: number
  userBreakdown: {
    admins: number
    instructors: number
    students: number
  }
}

interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  role: string
  bio?: string
  isVerified: boolean
  createdAt: string
  _count?: {
    bookings: number
    forumPosts: number
  }
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [stats, setStats] = useState<Stats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [formData, setFormData] = useState<any>({})

  useEffect(() => {
    fetchAdminData()
  }, [])

  useEffect(() => {
    if (activeSection === 'users') {
      fetchUsers()
    }
  }, [activeSection])

  const fetchAdminData = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const statsRes = await fetch('/api/admin/stats')
      if (!statsRes.ok) throw new Error('Failed to fetch stats')
      const statsData = await statsRes.json()
      setStats(statsData.stats)
    } catch (err) {
      console.error('Error fetching admin data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      if (!res.ok) throw new Error('Failed to fetch users')
      const data = await res.json()
      setUsers(data.users)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    }
  }

  const handleAddUser = () => {
    setFormData({
      email: '',
      password: '',
      fullName: '',
      phone: '',
      role: 'USER',
      bio: '',
      isVerified: false
    })
    setShowAddModal(true)
  }

  const handleEditUser = (user: User) => {
    setEditingItem(user)
    setFormData({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      role: user.role,
      bio: user.bio || '',
      isVerified: user.isVerified
    })
    setShowEditModal(true)
  }

  const handleDeleteUser = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE'
      })
      
      if (!res.ok) throw new Error('Failed to delete user')
      
      // Refresh users list
      fetchUsers()
      alert('User deleted successfully')
    } catch (err) {
      console.error('Error deleting user:', err)
      alert('Failed to delete user')
    }
  }

  const handleSaveUser = async () => {
    try {
      const url = editingItem 
        ? `/api/admin/users/${editingItem.id}`
        : '/api/admin/users'
      
      const method = editingItem ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to save user')
      }
      
      // Close modal and refresh
      setShowAddModal(false)
      setShowEditModal(false)
      setEditingItem(null)
      fetchUsers()
      alert(`User ${editingItem ? 'updated' : 'created'} successfully`)
    } catch (err) {
      console.error('Error saving user:', err)
      alert(err instanceof Error ? err.message : 'Failed to save user')
    }
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'users', label: 'Users', icon: '👥', badge: stats?.totalUsers },
    { id: 'classes', label: 'Classes', icon: '📚', badge: stats?.totalClasses },
    { id: 'events', label: 'Events', icon: '🎉', badge: stats?.totalEvents },
    { id: 'bookings', label: 'Bookings', icon: '🎫', badge: stats?.totalBookings },
    { id: 'venues', label: 'Venues', icon: '🏢', badge: stats?.totalVenues },
    { id: 'transactions', label: 'Transactions', icon: '💰', badge: stats?.totalTransactions },
    { id: 'styles', label: 'Dance Styles', icon: '💃', badge: stats?.totalDanceStyles },
    { id: 'forum', label: 'Forum', icon: '💬', badge: stats?.totalForumPosts },
    { id: 'messages', label: 'Messages', icon: '📧', badge: stats?.unreadMessages }
  ]

  const renderDashboard = () => {
    if (!stats) return null
    
    return (
      <div>
        <h2 className="text-3xl font-bold mb-8">Admin Dashboard</h2>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Total Revenue</p>
                <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
                <p className="text-purple-100 text-sm mt-2">{stats.confirmedBookings} confirmed</p>
              </div>
              <div className="text-4xl opacity-80">💰</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold">{stats.totalUsers}</p>
                <p className="text-blue-100 text-sm mt-2">
                  {stats.userBreakdown.admins} admin, {stats.userBreakdown.instructors} instructors
                </p>
              </div>
              <div className="text-4xl opacity-80">👥</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Classes & Events</p>
                <p className="text-3xl font-bold">{stats.totalClasses + stats.totalEvents}</p>
                <p className="text-green-100 text-sm mt-2">
                  {stats.totalClasses} classes, {stats.totalEvents} events
                </p>
              </div>
              <div className="text-4xl opacity-80">🎯</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Total Bookings</p>
                <p className="text-3xl font-bold">{stats.totalBookings}</p>
                <p className="text-orange-100 text-sm mt-2">
                  {stats.totalTransactions} transactions
                </p>
              </div>
              <div className="text-4xl opacity-80">📝</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button 
              onClick={() => { setActiveSection('users'); handleAddUser(); }}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">➕</span>
              <span className="text-sm">Add User</span>
            </button>
            <button 
              onClick={() => setActiveSection('classes')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">📚</span>
              <span className="text-sm">Add Class</span>
            </button>
            <button 
              onClick={() => setActiveSection('events')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">🎉</span>
              <span className="text-sm">Add Event</span>
            </button>
            <button 
              onClick={() => setActiveSection('messages')}
              className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition"
            >
              <span className="text-2xl block mb-2">📧</span>
              <span className="text-sm">View Messages</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderUsers = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">User Management</h2>
          <button
            onClick={handleAddUser}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <span>➕</span> Add New User
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                        user.role === 'INSTRUCTOR' ? 'bg-purple-100 text-purple-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user._count?.bookings || 0} bookings, {user._count?.forumPosts || 0} posts
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
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
      </div>
    )
  }

  const renderSection = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }

    if (error) {
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <p className="text-red-700">Error: {error}</p>
        </div>
      )
    }

    switch(activeSection) {
      case 'dashboard':
        return renderDashboard()
      case 'users':
        return renderUsers()
      default:
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} Management
            </h2>
            <p className="text-gray-600">
              Full CRUD operations for {activeSection} coming soon...
            </p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Full CRUD Access
              </span>
            </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={fetchAdminData}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                🔄 Refresh
              </button>
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                ← Back to Site
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white h-screen shadow-lg">
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                      activeSection === item.id 
                        ? 'bg-purple-600 text-white' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        activeSection === item.id 
                          ? 'bg-purple-700 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {renderSection()}
        </main>
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">
              {editingItem ? 'Edit User' : 'Add New User'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              {!editingItem && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={formData.password || ''}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    required
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  value={formData.role || 'USER'}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="USER">User</option>
                  <option value="INSTRUCTOR">Instructor</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={formData.isVerified || false}
                  onChange={(e) => setFormData({...formData, isVerified: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isVerified" className="text-sm font-medium text-gray-700">
                  Email Verified
                </label>
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setShowEditModal(false)
                  setEditingItem(null)
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUser}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
