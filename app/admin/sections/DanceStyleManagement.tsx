'use client'

import { useState, useEffect } from 'react'

interface DanceStyle {
  id: string
  name: string
  category: string | null
  icon: string | null
  subtitle: string | null
  description: string | null
  difficulty: string | null
  origin: string | null
  musicStyle: string | null
  characteristics: string | null // JSON string
  benefits: string | null // JSON string
  schedule: string | null // JSON string
  price: string | null
  instructors: string | null
  image: string | null
  videoUrl: string | null
  isActive: boolean
  isFeatured: boolean
  sortOrder: number | null
  createdAt: string
  updatedAt: string
  _count?: { 
    classStyles: number
    eventStyles: number
    userStyles: number
  }
}

export default function DanceStyleManagement() {
  const [styles, setStyles] = useState<DanceStyle[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingStyle, setEditingStyle] = useState<DanceStyle | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Latin',
    icon: '',
    subtitle: '',
    description: '',
    difficulty: 'Beginner-Friendly',
    origin: '',
    musicStyle: '',
    characteristics: [] as string[],
    benefits: [] as string[],
    schedule: [] as any[],
    price: '',
    instructors: '',
    image: '',
    videoUrl: '',
    isActive: true,
    isFeatured: false,
    sortOrder: 0
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
        // API returns { success: true, data: styles }
        setStyles(data.data || [])
      } else {
        console.error('Failed to fetch dance styles')
        setStyles([]) // Set empty array on error
      }
    } catch (err) {
      console.error('Error fetching dance styles:', err)
      setStyles([]) // Set empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdd = () => {
    setEditingStyle(null)
    setFormData({
      name: '',
      category: 'Latin',
      icon: '',
      subtitle: '',
      description: '',
      difficulty: 'Beginner-Friendly',
      origin: '',
      musicStyle: '',
      characteristics: [],
      benefits: [],
      schedule: [],
      price: '',
      instructors: '',
      image: '',
      videoUrl: '',
      isActive: true,
      isFeatured: false,
      sortOrder: 0
    })
    setShowModal(true)
  }

  const handleEdit = (style: DanceStyle) => {
    setEditingStyle(style)
    const parseJsonField = (field: string | null) => {
      if (!field) return []
      try {
        return JSON.parse(field)
      } catch {
        return []
      }
    }
    
    setFormData({
      name: style.name,
      category: style.category || 'Latin',
      icon: style.icon || '',
      subtitle: style.subtitle || '',
      description: style.description || '',
      difficulty: style.difficulty || 'Beginner-Friendly',
      origin: style.origin || '',
      musicStyle: style.musicStyle || '',
      characteristics: parseJsonField(style.characteristics),
      benefits: parseJsonField(style.benefits),
      schedule: parseJsonField(style.schedule),
      price: style.price || '',
      instructors: style.instructors || '',
      image: style.image || '',
      videoUrl: style.videoUrl || '',
      isActive: style.isActive,
      isFeatured: style.isFeatured,
      sortOrder: style.sortOrder || 0
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
    'Latin', 'Ballroom', 'Hip Hop', 'Contemporary', 'Ballet', 'Jazz', 
    'Street', 'Traditional', 'Modern', 'African', 'Brazilian', 'Caribbean', 'Other'
  ]

  const difficulties = [
    'Very Easy', 'Beginner-Friendly', 'Easy to Learn', 'Intermediate', 'Advanced', 'Professional', 'All Levels'
  ]

  const musicStyles = [
    'Latin', 'Romantic', 'African', 'Brazilian', 'Caribbean', 'Traditional', 'Modern', 'Various'
  ]

  const addArrayItem = (field: 'characteristics' | 'benefits' | 'schedule', item: any) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], item]
    })
  }

  const removeArrayItem = (field: 'characteristics' | 'benefits' | 'schedule', index: number) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((_, i) => i !== index)
    })
  }

  const updateArrayItem = (field: 'characteristics' | 'benefits' | 'schedule', index: number, value: any) => {
    const newArray = [...formData[field]]
    newArray[index] = value
    setFormData({
      ...formData,
      [field]: newArray
    })
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {styles && styles.length > 0 ? styles.map((style) => (
                <tr key={style.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{style.icon || '💃'}</span>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{style.name}</div>
                        <div className="text-xs text-gray-500">{style.subtitle || 'No subtitle'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm text-gray-900">
                        {getCategoryIcon(style.category || '')} {style.category || 'Uncategorized'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {style.difficulty || 'All Levels'} • {style.origin || 'Traditional'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>{style._count?.classStyles || 0} classes</div>
                      <div>{style._count?.eventStyles || 0} events</div>
                      <div>{style._count?.userStyles || 0} students</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full text-center ${
                        style.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {style.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {style.isFeatured && (
                        <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800 text-center">
                          Featured
                        </span>
                      )}
                      {style.sortOrder !== null && (
                        <span className="text-xs text-gray-500 text-center">
                          Order: {style.sortOrder}
                        </span>
                      )}
                    </div>
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
              )) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    <div className="flex flex-col items-center">
                      <div className="text-4xl mb-2">🎨</div>
                      <div className="text-lg font-medium mb-1">No dance styles found</div>
                      <div className="text-sm">Create your first dance style to get started</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">
                {editingStyle ? 'Edit Dance Style' : 'Add New Dance Style'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">📝 Basic Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="e.g., Salsa, Bachata, Tango"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
                    <input
                      type="text"
                      value={formData.icon}
                      onChange={(e) => setFormData({...formData, icon: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="🔥 💕 🌙 ✨"
                      maxLength={2}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                    <input
                      type="text"
                      value={formData.subtitle}
                      onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Feel the Cuban rhythm and energy"
                    />
                  </div>
                </div>
              </div>

              {/* Content Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">📖 Content Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Describe the dance style, its history, and what makes it unique..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty Level</label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {difficulties.map((diff) => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                      <input
                        type="text"
                        value={formData.origin}
                        onChange={(e) => setFormData({...formData, origin: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Cuba, Argentina, Brazil"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Music Style</label>
                      <select
                        value={formData.musicStyle}
                        onChange={(e) => setFormData({...formData, musicStyle: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        {musicStyles.map((music) => (
                          <option key={music} value={music}>{music}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Characteristics */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">✨ Characteristics</h4>
                <div className="space-y-2">
                  {formData.characteristics.map((char, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={char}
                        onChange={(e) => updateArrayItem('characteristics', index, e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Fast-paced, Energetic, Social"
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem('characteristics', index)}
                        className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => addArrayItem('characteristics', '')}
                    className="px-4 py-2 text-sm bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200"
                  >
                    + Add Characteristic
                  </button>
                </div>
              </div>

              {/* Business Details */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">💼 Business Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price Information</label>
                    <input
                      type="text"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="$35/class, $120/month"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructors</label>
                    <input
                      type="text"
                      value={formData.instructors}
                      onChange={(e) => setFormData({...formData, instructors: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Carlos & Maria, Professional Team"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Demo Video URL</label>
                    <input
                      type="url"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({...formData, videoUrl: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
                </div>
              </div>

              {/* Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-semibold mb-4 text-gray-800">⚙️ Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                      ✅ Active Style
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                      className="mr-2"
                    />
                    <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700">
                      ⭐ Featured Style
                    </label>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                    <input
                      type="number"
                      value={formData.sortOrder}
                      onChange={(e) => setFormData({...formData, sortOrder: parseInt(e.target.value) || 0})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <span>{editingStyle ? '✏️ Update' : '➕ Create'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
