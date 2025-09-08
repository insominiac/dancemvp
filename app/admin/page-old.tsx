'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface ClassData {
  id: string
  title: string
  description: string
  level: string
  price: number
  maxCapacity: number
  instructor?: {
    fullName: string
  }
  _count?: {
    bookings: number
  }
}

interface Stats {
  totalUsers: number
  totalClasses: number
  totalBookings: number
  monthlyRevenue: number
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('dashboard')
  const [classes, setClasses] = useState<ClassData[]>([])
  const [stats, setStats] = useState<Stats>({
    totalUsers: 1247,
    totalClasses: 48,
    totalBookings: 523,
    monthlyRevenue: 15847
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    level: 'beginner',
    price: 25,
    maxCapacity: 30
  })

  // Load classes from localStorage or API
  useEffect(() => {
    loadClasses()
  }, [])

  const loadClasses = () => {
    // Check localStorage first
    const savedClasses = localStorage.getItem('adminClasses')
    if (savedClasses) {
      setClasses(JSON.parse(savedClasses))
    } else {
      // Default classes
      const defaultClasses = [
        {
          id: '1',
          title: 'Hip Hop Basics',
          description: 'Learn the fundamentals of hip hop dance',
          level: 'beginner',
          price: 25,
          maxCapacity: 30,
          instructor: { fullName: 'Sarah Johnson' },
          _count: { bookings: 24 }
        },
        {
          id: '2',
          title: 'Ballet Advanced',
          description: 'Advanced ballet techniques',
          level: 'advanced',
          price: 35,
          maxCapacity: 20,
          instructor: { fullName: 'Maria Rodriguez' },
          _count: { bookings: 18 }
        }
      ]
      setClasses(defaultClasses)
      localStorage.setItem('adminClasses', JSON.stringify(defaultClasses))
    }
  }

  const handleAddClass = () => {
    const newClass = {
      id: Date.now().toString(),
      ...formData,
      instructor: { fullName: 'Admin User' },
      _count: { bookings: 0 }
    }
    
    const updatedClasses = [...classes, newClass]
    setClasses(updatedClasses)
    localStorage.setItem('adminClasses', JSON.stringify(updatedClasses))
    
    // Update frontend if available
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('storage'))
    }
    
    setShowAddModal(false)
    setFormData({
      title: '',
      description: '',
      level: 'beginner',
      price: 25,
      maxCapacity: 30
    })
  }

  const handleDeleteClass = (id: string) => {
    if (confirm('Are you sure you want to delete this class?')) {
      const updatedClasses = classes.filter(c => c.id !== id)
      setClasses(updatedClasses)
      localStorage.setItem('adminClasses', JSON.stringify(updatedClasses))
      window.dispatchEvent(new Event('storage'))
    }
  }

  const renderSection = () => {
    switch(activeSection) {
      case 'dashboard':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">Dashboard Overview</h2>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Monthly Revenue</p>
                    <p className="text-3xl font-bold text-gray-900">${stats.monthlyRevenue.toLocaleString()}</p>
                    <p className="text-green-600 text-sm mt-2">↑ 22% from last month</p>
                  </div>
                  <div className="text-4xl">💰</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Users</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
                    <p className="text-green-600 text-sm mt-2">↑ 58 new this week</p>
                  </div>
                  <div className="text-4xl">👥</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active Classes</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalClasses}</p>
                    <p className="text-gray-600 text-sm mt-2">{classes.length} listed</p>
                  </div>
                  <div className="text-4xl">🎯</div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Total Bookings</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                    <p className="text-green-600 text-sm mt-2">↑ 15% this month</p>
                  </div>
                  <div className="text-4xl">📝</div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🎉</span>
                    <div>
                      <p className="font-medium">New booking for Hip Hop Basics</p>
                      <p className="text-sm text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Confirmed</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">👤</span>
                    <div>
                      <p className="font-medium">New user registration</p>
                      <p className="text-sm text-gray-500">15 minutes ago</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">Student</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">💳</span>
                    <div>
                      <p className="font-medium">Payment received: $35</p>
                      <p className="text-sm text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">Success</span>
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'classes':
        return (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-bold">Class Management</h2>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition"
              >
                + Add New Class
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map(cls => (
                <div key={cls.id} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-900">{cls.title}</h3>
                    <p className="text-gray-600 mt-2">{cls.description}</p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Level:</span>
                      <span className="font-medium capitalize">{cls.level}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price:</span>
                      <span className="font-medium">${cls.price}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Capacity:</span>
                      <span className="font-medium">{cls._count?.bookings || 0}/{cls.maxCapacity}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Instructor:</span>
                      <span className="font-medium">{cls.instructor?.fullName || 'Not assigned'}</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(cls.id)}
                      className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      
      case 'users':
        return (
          <div>
            <h2 className="text-3xl font-bold mb-8">User Management</h2>
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">John Admin</td>
                    <td className="px-6 py-4 whitespace-nowrap">admin@dance.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Admin</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">Sarah Johnson</td>
                    <td className="px-6 py-4 whitespace-nowrap">sarah@email.com</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Instructor</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Active</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                      <button className="text-red-600 hover:text-red-900">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )
      
      default:
        return <div>Select a section</div>
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            💃 Admin Panel
          </h1>
          <p className="text-gray-400 text-sm mt-2">Dance Platform 2.0</p>
        </div>
        
        <nav className="space-y-2">
          <button
            onClick={() => setActiveSection('dashboard')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === 'dashboard' ? 'bg-purple-600' : 'hover:bg-gray-700'
            }`}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveSection('classes')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === 'classes' ? 'bg-purple-600' : 'hover:bg-gray-700'
            }`}
          >
            🎯 Classes
          </button>
          <button
            onClick={() => setActiveSection('users')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === 'users' ? 'bg-purple-600' : 'hover:bg-gray-700'
            }`}
          >
            👥 Users
          </button>
          <button
            onClick={() => setActiveSection('bookings')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === 'bookings' ? 'bg-purple-600' : 'hover:bg-gray-700'
            }`}
          >
            📝 Bookings
          </button>
          <button
            onClick={() => setActiveSection('analytics')}
            className={`w-full text-left px-4 py-3 rounded-lg transition ${
              activeSection === 'analytics' ? 'bg-purple-600' : 'hover:bg-gray-700'
            }`}
          >
            📈 Analytics
          </button>
        </nav>
        
        <div className="mt-auto pt-8">
          <Link href="/" className="block w-full text-center px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition">
            ← Back to Site
          </Link>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 p-8">
        {renderSection()}
      </div>
      
      {/* Add Class Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-6">Add New Class</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({...formData, level: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Capacity</label>
                <input
                  type="number"
                  value={formData.maxCapacity}
                  onChange={(e) => setFormData({...formData, maxCapacity: parseInt(e.target.value)})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-4 mt-6">
              <button
                onClick={handleAddClass}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition"
              >
                Add Class
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
