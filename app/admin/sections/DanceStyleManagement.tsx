'use client'

import { useState, useEffect } from 'react'

interface DanceStyle {
  id: string
  name: string
  category: string
  description: string
  difficulty: string
  isActive: boolean
  _count?: { classes: number; events: number; instructors: number }
}

export default function DanceStyleManagement() {
  const [styles, setStyles] = useState<DanceStyle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStyle, setEditingStyle] = useState<DanceStyle | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Contemporary',
    description: '',
    difficulty: 'Beginner',
    isActive: true
  })

  useEffect(() => {
    fetchStyles()
  }, [])

  const fetchStyles = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/dance-styles')
      if (res.ok) {
        const data = await res.json()
        setStyles(data.styles)
      }
    } catch (err) {
      console.error('Error fetching dance styles:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingStyle(null)
    setFormData({
      name: '',
      category: 'Contemporary',
      description: '',
      difficulty: 'Beginner',
      isActive: true
    })
    setShowModal(true)
  }

  const handleEdit = (style: DanceStyle) => {
    setEditingStyle(style)
    setFormData({
      name: style.name,
      category: style.category,
      description: style.description || '',
      difficulty: style.difficulty,
      isActive: style.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dance style?')) return
    
    try {
      const res = await fetch(`/api/admin/dance-styles/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchStyles()
        alert('Dance style deleted successfully')
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to delete dance style')
      }
    } catch (err) {
      alert('Failed to delete dance style')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const url = editingStyle 
      ? `/api/admin/dance-styles/${editingStyle.id}`
      : '/api/admin/dance-styles'
    const method = editingStyle ? 'PUT' : 'POST'
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (res.ok) {
        setShowModal(false)
        fetchStyles()
        alert(`Dance style ${editingStyle ? 'updated' : 'created'} successfully`)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to save dance style')
      }
    } catch (err) {
      alert('Failed to save dance style')
    }
  }

  const categories = [
    'Contemporary', 'Ballet', 'Jazz', 'Hip Hop', 'Latin', 
    'Ballroom', 'Street', 'Traditional', 'Modern', 'Other'
  ]

  const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'All Levels']

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Contemporary': '🎭',
      'Ballet': '🩰',
      'Jazz': '🎵',
      'Hip Hop': '🎤',
      'Latin': '💃',
      'Ballroom': '🕺',
      'Street': '🏙️',
      'Traditional': '🏛️',
      'Modern': '✨',
      'Other': '🎨'
    }
    return icons[category] || '🎨'
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Dance Style Management</h2>
        <button
          onClick={handleAdd}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          ➕ Add New Style
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Style</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Difficulty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {styles.map((style) => (
                <tr key={style.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{style.name}</div>
                    {style.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {style.description}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">
                      {getCategoryIcon(style.category)} {style.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${getDifficultyColor(style.difficulty)}`}>
                      {style.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{style._count?.classes || 0} classes</div>
                      <div>{style._count?.events || 0} events</div>
                      <div>{style._count?.instructors || 0} instructors</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      style.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {style.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleEdit(style)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(style.id)}
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
              {editingStyle ? 'Edit Dance Style' : 'Add New Dance Style'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {getCategoryIcon(cat)} {cat}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  {difficulties.map((diff) => (
                    <option key={diff} value={diff}>{diff}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                  placeholder="Optional description..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                  Active Style
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
                  {editingStyle ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
