'use client'

import { useState, useEffect } from 'react'
import { useAuth, useRequireInstructor } from '@/app/lib/auth-context'
import { FileText, Plus, Upload, Search, Filter, Eye, Download, Edit, Trash2, Music, Video, Image, Link as LinkIcon, Folder } from 'lucide-react'

interface InstructorResource {
  id: string
  title: string
  description?: string
  type: 'LESSON_PLAN' | 'PLAYLIST' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'IMAGE' | 'LINK' | 'NOTE'
  category: 'TEACHING_MATERIALS' | 'MUSIC_PLAYLISTS' | 'CHOREOGRAPHY' | 'TECHNIQUE_GUIDES' | 'STUDENT_HANDOUTS' | 'ASSESSMENT_FORMS' | 'CLASS_SCHEDULES' | 'REFERENCES' | 'PERSONAL_NOTES'
  fileUrl?: string
  fileName?: string
  fileSize?: number
  mimeType?: string
  content?: string
  tags: string[]
  isPublic: boolean
  classId?: string
  views: number
  downloads: number
  createdAt: string
  updatedAt: string
  class?: {
    id: string
    title: string
  }
}

interface ResourceStats {
  overview: {
    totalResources: number
    totalViews: number
    totalDownloads: number
    publicResources: number
  }
  categoryBreakdown: Array<{
    category: string
    count: number
    views: number
    downloads: number
  }>
  recentResources: InstructorResource[]
}

export default function InstructorMaterialsPage() {
  const [resources, setResources] = useState<InstructorResource[]>([])
  const [stats, setStats] = useState<ResourceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedType, setSelectedType] = useState<string>('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingResource, setEditingResource] = useState<InstructorResource | null>(null)
  const [instructorId, setInstructorId] = useState<string | null>(null)
  
  const { user } = useAuth()
  useRequireInstructor()

  const resourceTypes = {
    LESSON_PLAN: { icon: FileText, label: 'Lesson Plan', color: 'text-blue-600' },
    PLAYLIST: { icon: Music, label: 'Playlist', color: 'text-purple-600' },
    VIDEO: { icon: Video, label: 'Video', color: 'text-red-600' },
    AUDIO: { icon: Music, label: 'Audio', color: 'text-green-600' },
    DOCUMENT: { icon: FileText, label: 'Document', color: 'text-gray-600' },
    IMAGE: { icon: Image, label: 'Image', color: 'text-pink-600' },
    LINK: { icon: LinkIcon, label: 'Link', color: 'text-blue-500' },
    NOTE: { icon: FileText, label: 'Note', color: 'text-yellow-600' }
  }

  const categories = {
    TEACHING_MATERIALS: 'Teaching Materials',
    MUSIC_PLAYLISTS: 'Music Playlists',
    CHOREOGRAPHY: 'Choreography',
    TECHNIQUE_GUIDES: 'Technique Guides',
    STUDENT_HANDOUTS: 'Student Handouts',
    ASSESSMENT_FORMS: 'Assessment Forms',
    CLASS_SCHEDULES: 'Class Schedules',
    REFERENCES: 'References',
    PERSONAL_NOTES: 'Personal Notes'
  }

  useEffect(() => {
    if (user) {
      fetchInstructorProfile()
    }
  }, [user])

  useEffect(() => {
    if (instructorId) {
      fetchResources()
      fetchStats()
    }
  }, [instructorId, selectedCategory, selectedType])

  const fetchInstructorProfile = async () => {
    try {
      const response = await fetch(`/api/instructor/profile/${user?.id}`)
      if (response.ok) {
        const data = await response.json()
        setInstructorId(data.instructor.id)
      }
    } catch (err) {
      console.error('Error fetching instructor profile:', err)
    }
  }

  const fetchResources = async () => {
    if (!instructorId) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({ instructorId })
      if (selectedCategory) params.append('category', selectedCategory)
      if (selectedType) params.append('type', selectedType)
      
      const response = await fetch(`/api/instructor/resources?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setResources(data.resources)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch resources')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    if (!instructorId) return
    
    try {
      const response = await fetch(`/api/instructor/resources/stats?instructorId=${instructorId}`)
      const data = await response.json()
      
      if (response.ok) {
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const handleCreateResource = async (formData: any) => {
    if (!instructorId) return
    
    try {
      const response = await fetch('/api/instructor/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, instructorId })
      })
      
      if (response.ok) {
        await fetchResources()
        await fetchStats()
        setShowCreateModal(false)
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to create resource')
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return
    
    try {
      const response = await fetch(`/api/instructor/resources/${resourceId}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await fetchResources()
        await fetchStats()
      } else {
        const data = await response.json()
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to delete resource')
    }
  }

  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading && !resources.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your resources...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Teaching Resources</h1>
        <p className="text-gray-600 mt-2">Manage your lesson plans, playlists, and teaching materials</p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <Folder className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Resources</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalResources}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalViews}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Downloads</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalDownloads}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 bg-orange-100 rounded-full">
                <LinkIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Public</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.publicResources}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              
              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Categories</option>
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              
              {/* Type Filter */}
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="">All Types</option>
                {Object.entries(resourceTypes).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            {/* Create Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Resource
            </button>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => {
          const typeConfig = resourceTypes[resource.type]
          const TypeIcon = typeConfig.icon
          
          return (
            <div key={resource.id} className="bg-white rounded-lg shadow hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg bg-gray-100`}>
                      <TypeIcon className={`w-5 h-5 ${typeConfig.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {resource.title}
                      </h3>
                      <p className="text-sm text-gray-500">{typeConfig.label}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setEditingResource(resource)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteResource(resource.id)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                
                {resource.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {resource.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{categories[resource.category]}</span>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <Eye className="w-4 h-4 mr-1" />
                      {resource.views}
                    </div>
                    <div className="flex items-center">
                      <Download className="w-4 h-4 mr-1" />
                      {resource.downloads}
                    </div>
                  </div>
                </div>
                
                {resource.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {resource.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        {tag}
                      </span>
                    ))}
                    {resource.tags.length > 3 && (
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                        +{resource.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}
                
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded ${
                    resource.isPublic 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {resource.isPublic ? 'Public' : 'Private'}
                  </span>
                  
                  <span className="text-xs text-gray-500">
                    {new Date(resource.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      {filteredResources.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No resources found</h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory || selectedType 
              ? 'Try adjusting your search or filters'
              : 'Get started by adding your first teaching resource'}
          </p>
          {(!searchTerm && !selectedCategory && !selectedType) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Resource
            </button>
          )}
        </div>
      )}
      
      {/* Create/Edit Resource Modal */}
      {(showCreateModal || editingResource) && (
        <ResourceModal
          resource={editingResource}
          onClose={() => {
            setShowCreateModal(false)
            setEditingResource(null)
          }}
          onSave={handleCreateResource}
          categories={categories}
          resourceTypes={resourceTypes}
        />
      )}
      
      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded max-w-md">
          <p>{error}</p>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 right-0 mt-2 mr-2 text-red-400 hover:text-red-600"
          >
            ×
          </button>
        </div>
      )}
    </div>
  )
}

// Resource Modal Component
function ResourceModal({ resource, onClose, onSave, categories, resourceTypes }: {
  resource: InstructorResource | null
  onClose: () => void
  onSave: (data: any) => void
  categories: any
  resourceTypes: any
}) {
  const [formData, setFormData] = useState({
    title: resource?.title || '',
    description: resource?.description || '',
    type: resource?.type || 'LESSON_PLAN',
    category: resource?.category || 'TEACHING_MATERIALS',
    content: resource?.content || '',
    tags: resource?.tags?.join(', ') || '',
    isPublic: resource?.isPublic || false,
    fileUrl: resource?.fileUrl || '',
    fileName: resource?.fileName || '',
    fileSize: resource?.fileSize || 0,
    mimeType: resource?.mimeType || ''
  })
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (file: File) => {
    if (!instructorId || !file) return
    
    setUploading(true)
    setUploadProgress(0)
    
    try {
      const uploadFormData = new FormData()
      uploadFormData.append('file', file)
      uploadFormData.append('instructorId', instructorId)
      
      const response = await fetch('/api/instructor/resources/upload', {
        method: 'POST',
        body: uploadFormData
      })
      
      if (response.ok) {
        const uploadResult = await response.json()
        setFormData(prev => ({
          ...prev,
          fileUrl: uploadResult.fileUrl,
          fileName: uploadResult.fileName,
          fileSize: uploadResult.fileSize,
          mimeType: uploadResult.mimeType
        }))
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
    } catch (err) {
      console.error('Upload error:', err)
      alert(err instanceof Error ? err.message : 'File upload failed')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-w-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {resource ? 'Edit Resource' : 'Create New Resource'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {Object.entries(resourceTypes).map(([value, { label }]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              >
                {Object.entries(categories).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content/Notes
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="Add your lesson plan, notes, or other content here..."
            />
          </div>
          
          {/* File Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              File Upload (Optional)
            </label>
            
            {formData.fileUrl ? (
              <div className="border border-gray-300 rounded-md p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Upload className="w-5 h-5 text-green-600 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formData.fileName}</p>
                      <p className="text-xs text-gray-500">
                        {formData.fileSize ? `${(formData.fileSize / 1024 / 1024).toFixed(1)} MB` : ''} • {formData.mimeType}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ 
                      ...prev, 
                      fileUrl: '', 
                      fileName: '', 
                      fileSize: 0, 
                      mimeType: '' 
                    }))}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6">
                <div className="text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="mt-4">
                    <label className="cursor-pointer">
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        {uploading ? 'Uploading...' : 'Upload a file'}
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        PDF, Word, Images, Audio, Video up to 50MB
                      </span>
                      <input
                        type="file"
                        className="sr-only"
                        disabled={uploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) {
                            handleFileUpload(file)
                          }
                        }}
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.ogg,.mp4,.webm"
                      />
                    </label>
                  </div>
                  {uploading && (
                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-purple-500 focus:border-purple-500"
              placeholder="salsa, beginner, warm-up"
            />
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPublic"
              checked={formData.isPublic}
              onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <label htmlFor="isPublic" className="ml-2 text-sm text-gray-700">
              Make this resource public (visible to students)
            </label>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
            >
              {resource ? 'Update' : 'Create'} Resource
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
