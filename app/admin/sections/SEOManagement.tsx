'use client'

import { useState, useEffect } from 'react'

interface SeoPage {
  id: string
  path: string
  title?: string
  description?: string
  keywords?: string
  author?: string
  robots?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  ogUrl?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCreator?: string
  structuredData?: string
  customMeta?: string
  isActive: boolean
  priority: number
  lastModified: string
  createdAt: string
  updatedAt: string
}

interface SeoFormData {
  path: string
  title: string
  description: string
  keywords: string
  author: string
  robots: string
  canonical: string
  ogTitle: string
  ogDescription: string
  ogImage: string
  ogType: string
  ogUrl: string
  twitterCard: string
  twitterTitle: string
  twitterDescription: string
  twitterImage: string
  twitterCreator: string
  structuredData: string
  customMeta: string
  isActive: boolean
  priority: number
}

const defaultSeoData: SeoFormData = {
  path: '',
  title: '',
  description: '',
  keywords: '',
  author: '',
  robots: 'index,follow',
  canonical: '',
  ogTitle: '',
  ogDescription: '',
  ogImage: '',
  ogType: 'website',
  ogUrl: '',
  twitterCard: 'summary_large_image',
  twitterTitle: '',
  twitterDescription: '',
  twitterImage: '',
  twitterCreator: '',
  structuredData: '',
  customMeta: '',
  isActive: true,
  priority: 5
}

const commonPaths = [
  '/',
  '/about',
  '/classes',
  '/events',
  '/instructors',
  '/contact',
  '/login',
  '/register',
  '/forum',
  '/pricing'
]

export default function SEOManagement() {
  const [seoPages, setSeoPages] = useState<SeoPage[]>([])
  const [filteredPages, setFilteredPages] = useState<SeoPage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list')
  const [editingPage, setEditingPage] = useState<SeoPage | null>(null)
  const [formData, setFormData] = useState<SeoFormData>(defaultSeoData)
  const [searchTerm, setSearchTerm] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    fetchSeoPages()
  }, [currentPage])

  useEffect(() => {
    filterPages()
  }, [seoPages, searchTerm])

  const fetchSeoPages = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/seo?page=${currentPage}&limit=${itemsPerPage}`)
      if (response.ok) {
        const data = await response.json()
        setSeoPages(data.seoPages)
        setTotalPages(data.pagination.totalPages)
      } else {
        console.error('Failed to fetch SEO pages')
      }
    } catch (error) {
      console.error('Error fetching SEO pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const filterPages = () => {
    if (!searchTerm) {
      setFilteredPages(seoPages)
    } else {
      const filtered = seoPages.filter(page =>
        page.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        page.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredPages(filtered)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const url = editingPage ? `/api/admin/seo/${editingPage.id}` : '/api/admin/seo'
      const method = editingPage ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchSeoPages()
        resetForm()
        setActiveTab('list')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to save SEO page')
      }
    } catch (error) {
      console.error('Error saving SEO page:', error)
      alert('Failed to save SEO page')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (page: SeoPage) => {
    setEditingPage(page)
    setFormData({
      path: page.path,
      title: page.title || '',
      description: page.description || '',
      keywords: page.keywords || '',
      author: page.author || '',
      robots: page.robots || 'index,follow',
      canonical: page.canonical || '',
      ogTitle: page.ogTitle || '',
      ogDescription: page.ogDescription || '',
      ogImage: page.ogImage || '',
      ogType: page.ogType || 'website',
      ogUrl: page.ogUrl || '',
      twitterCard: page.twitterCard || 'summary_large_image',
      twitterTitle: page.twitterTitle || '',
      twitterDescription: page.twitterDescription || '',
      twitterImage: page.twitterImage || '',
      twitterCreator: page.twitterCreator || '',
      structuredData: page.structuredData || '',
      customMeta: page.customMeta || '',
      isActive: page.isActive,
      priority: page.priority
    })
    setActiveTab('edit')
  }

  const handleDelete = async (id: string, path: string) => {
    if (!confirm(`Are you sure you want to delete SEO settings for "${path}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/admin/seo/${id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        await fetchSeoPages()
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to delete SEO page')
      }
    } catch (error) {
      console.error('Error deleting SEO page:', error)
      alert('Failed to delete SEO page')
    }
  }

  const resetForm = () => {
    setFormData(defaultSeoData)
    setEditingPage(null)
    setShowPreview(false)
  }

  const handleInputChange = (field: keyof SeoFormData, value: string | boolean | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const getSeoPreview = () => {
    return {
      title: formData.title || formData.ogTitle || 'Untitled Page',
      description: formData.description || formData.ogDescription || 'No description available',
      url: `https://yourdomain.com${formData.path}`,
      image: formData.ogImage || formData.twitterImage || '/default-og-image.jpg'
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">SEO Management</h2>
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('list')}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'list' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            📋 All Pages
          </button>
          <button
            onClick={() => { resetForm(); setActiveTab('create') }}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === 'create' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            ➕ Add SEO Page
          </button>
        </div>
      </div>

      {activeTab === 'list' && (
        <div>
          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search pages by path, title, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <span className="text-sm text-gray-600">
                {filteredPages.length} of {seoPages.length} pages
              </span>
            </div>
          </div>

          {/* SEO Pages Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Path
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Modified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPages.map((page) => (
                  <tr key={page.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {page.path}
                        </code>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">
                        {page.title || 'No title'}
                      </div>
                      {page.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {page.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        page.priority >= 8 ? 'bg-red-100 text-red-800' :
                        page.priority >= 5 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {page.priority}/10
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        page.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {page.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(page.lastModified).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(page)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(page.id, page.path)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredPages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">No SEO pages found</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {(activeTab === 'create' || activeTab === 'edit') && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold">
              {editingPage ? 'Edit SEO Page' : 'Create SEO Page'}
            </h3>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
              <button
                type="button"
                onClick={() => { resetForm(); setActiveTab('list') }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                Cancel
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Form */}
            <div>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic SEO */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">📄 Basic SEO</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Page Path *
                      </label>
                      <div className="flex items-center">
                        <select
                          value={formData.path}
                          onChange={(e) => handleInputChange('path', e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="">Select or type custom path</option>
                          {commonPaths.map(path => (
                            <option key={path} value={path}>{path}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Custom path"
                          value={formData.path}
                          onChange={(e) => handleInputChange('path', e.target.value)}
                          className="flex-1 px-3 py-2 border border-l-0 border-gray-300 rounded-r-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Page title for <title> tag"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.title.length}/60 characters (recommended)
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Meta description"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.description.length}/160 characters (recommended)
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Keywords
                        </label>
                        <input
                          type="text"
                          value={formData.keywords}
                          onChange={(e) => handleInputChange('keywords', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="keyword1, keyword2, keyword3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Author
                        </label>
                        <input
                          type="text"
                          value={formData.author}
                          onChange={(e) => handleInputChange('author', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="Content author"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Robots
                        </label>
                        <select
                          value={formData.robots}
                          onChange={(e) => handleInputChange('robots', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="index,follow">Index, Follow</option>
                          <option value="noindex,follow">No Index, Follow</option>
                          <option value="index,nofollow">Index, No Follow</option>
                          <option value="noindex,nofollow">No Index, No Follow</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Canonical URL
                        </label>
                        <input
                          type="url"
                          value={formData.canonical}
                          onChange={(e) => handleInputChange('canonical', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="https://yourdomain.com/canonical-url"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Open Graph */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">📱 Open Graph (Facebook)</h4>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OG Title
                      </label>
                      <input
                        type="text"
                        value={formData.ogTitle}
                        onChange={(e) => handleInputChange('ogTitle', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Open Graph title (falls back to title if empty)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        OG Description
                      </label>
                      <textarea
                        value={formData.ogDescription}
                        onChange={(e) => handleInputChange('ogDescription', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Open Graph description (falls back to description if empty)"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          OG Image URL
                        </label>
                        <input
                          type="url"
                          value={formData.ogImage}
                          onChange={(e) => handleInputChange('ogImage', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="https://yourdomain.com/og-image.jpg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          OG Type
                        </label>
                        <select
                          value={formData.ogType}
                          onChange={(e) => handleInputChange('ogType', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="website">Website</option>
                          <option value="article">Article</option>
                          <option value="profile">Profile</option>
                          <option value="business.business">Business</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Twitter */}
                <div className="bg-sky-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">🐦 Twitter Cards</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter Card Type
                        </label>
                        <select
                          value={formData.twitterCard}
                          onChange={(e) => handleInputChange('twitterCard', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">Summary Large Image</option>
                          <option value="app">App</option>
                          <option value="player">Player</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Twitter Creator
                        </label>
                        <input
                          type="text"
                          value={formData.twitterCreator}
                          onChange={(e) => handleInputChange('twitterCreator', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                          placeholder="@username"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Settings */}
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="text-lg font-medium mb-4">⚙️ Settings</h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority (1-10)
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={formData.priority}
                          onChange={(e) => handleInputChange('priority', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div className="flex items-center">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.isActive}
                            onChange={(e) => handleInputChange('isActive', e.target.checked)}
                            className="mr-2"
                          />
                          <span className="text-sm font-medium text-gray-700">Active</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.path}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {isSubmitting ? 'Saving...' : (editingPage ? 'Update SEO Page' : 'Create SEO Page')}
                  </button>
                </div>
              </form>
            </div>

            {/* Preview */}
            {showPreview && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="text-lg font-medium mb-4">🔍 Preview</h4>
                
                {/* Google Search Preview */}
                <div className="bg-white p-4 rounded-lg shadow mb-4">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Google Search Result</h5>
                  <div className="space-y-1">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {getSeoPreview().title}
                    </div>
                    <div className="text-green-600 text-sm">
                      {getSeoPreview().url}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {getSeoPreview().description}
                    </div>
                  </div>
                </div>

                {/* Social Media Preview */}
                <div className="bg-white p-4 rounded-lg shadow">
                  <h5 className="text-sm font-medium text-gray-500 mb-2">Social Media Share</h5>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    {getSeoPreview().image && (
                      <div className="aspect-video bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-sm">
                          🖼️ {getSeoPreview().image}
                        </span>
                      </div>
                    )}
                    <div className="p-3">
                      <div className="font-medium text-sm">
                        {getSeoPreview().title}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        {getSeoPreview().description}
                      </div>
                      <div className="text-gray-400 text-xs mt-1">
                        {getSeoPreview().url}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}