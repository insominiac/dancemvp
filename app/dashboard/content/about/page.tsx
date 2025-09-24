'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface AboutContent {
  heroTitle: string
  heroSubtitle: string
  heroBadgeText: string
  heroFeatures: Array<{ icon: string; text: string }>
  statsTitle: string
  statsDescription: string
  stats: Array<{
    number: string
    label: string
    description: string
    color: string
  }>
  storyTitle: string
  storyDescription1: string
  storyDescription2: string
  whyChooseUsTitle: string
  features: Array<{
    icon: string
    title: string
    description: string
    bgColor: string
  }>
  newsletterTitle: string
  newsletterDescription: string
  newsletterBenefits: Array<{ icon: string; text: string }>
  ctaTitle: string
  ctaDescription: string
  ctaBadgeText: string
  ctaButtons: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
  }
  ctaFeatures: Array<{
    icon: string
    title: string
    description: string
  }>
}

export default function AboutContentManagement() {
  const [content, setContent] = useState<AboutContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/admin/content/about')
      if (response.ok) {
        const data = await response.json()
        setContent(data)
      } else {
        setMessage({ type: 'error', text: 'Failed to load content' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error loading content' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!content) return

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/about', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(content),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Content updated successfully!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to update content' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error updating content' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset to default content? This action cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/about', {
        method: 'DELETE',
      })

      if (response.ok) {
        const result = await response.json()
        setContent(result.content)
        setMessage({ type: 'success', text: 'Content reset to defaults!' })
        setTimeout(() => setMessage(null), 3000)
      } else {
        setMessage({ type: 'error', text: 'Failed to reset content' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error resetting content' })
    } finally {
      setIsSaving(false)
    }
  }

  const updateContent = (path: string, value: any) => {
    if (!content) return
    
    const newContent = { ...content }
    const keys = path.split('.')
    let current: any = newContent
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    setContent(newContent)
  }

  const updateArrayItem = (arrayPath: string, index: number, field: string, value: any) => {
    if (!content) return
    
    const newContent = { ...content }
    const array = (newContent as any)[arrayPath]
    if (array && array[index]) {
      array[index][field] = value
      setContent(newContent)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Not Available</h2>
          <p className="text-gray-600">Unable to load about page content.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">About Page Content</h1>
              <p className="text-gray-600 mt-1">Manage the content displayed on the about page</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleReset}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
          {message && (
            <div className={`mt-4 p-4 rounded-lg ${
              message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {message.text}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hero Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">🎭 Hero Section</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                <input
                  type="text"
                  value={content.heroBadgeText}
                  onChange={(e) => updateContent('heroBadgeText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.heroTitle}
                  onChange={(e) => updateContent('heroTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                <textarea
                  value={content.heroSubtitle}
                  onChange={(e) => updateContent('heroSubtitle', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                {content.heroFeatures.map((feature, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Icon"
                      value={feature.icon}
                      onChange={(e) => updateArrayItem('heroFeatures', index, 'icon', e.target.value)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="Text"
                      value={feature.text}
                      onChange={(e) => updateArrayItem('heroFeatures', index, 'text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Statistics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.statsTitle}
                  onChange={(e) => updateContent('statsTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={content.statsDescription}
                  onChange={(e) => updateContent('statsDescription', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats</label>
                {content.stats.map((stat, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3 mb-3">
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Number"
                        value={stat.number}
                        onChange={(e) => updateArrayItem('stats', index, 'number', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                      <select
                        value={stat.color}
                        onChange={(e) => updateArrayItem('stats', index, 'color', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="purple">Purple</option>
                        <option value="pink">Pink</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      placeholder="Label"
                      value={stat.label}
                      onChange={(e) => updateArrayItem('stats', index, 'label', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 mb-2"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={stat.description}
                      onChange={(e) => updateArrayItem('stats', index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💃 Our Story</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.storyTitle}
                  onChange={(e) => updateContent('storyTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Paragraph</label>
                <textarea
                  value={content.storyDescription1}
                  onChange={(e) => updateContent('storyDescription1', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Second Paragraph</label>
                <textarea
                  value={content.storyDescription2}
                  onChange={(e) => updateContent('storyDescription2', e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📧 Newsletter</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={content.newsletterTitle}
                  onChange={(e) => updateContent('newsletterTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={content.newsletterDescription}
                  onChange={(e) => updateContent('newsletterDescription', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">🎆 Call-to-Action</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Badge Text</label>
                  <input
                    type="text"
                    value={content.ctaBadgeText}
                    onChange={(e) => updateContent('ctaBadgeText', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={content.ctaTitle}
                    onChange={(e) => updateContent('ctaTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={content.ctaDescription}
                    onChange={(e) => updateContent('ctaDescription', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              </div>
            </div>
            <div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Primary Button</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Text"
                      value={content.ctaButtons.primary.text}
                      onChange={(e) => updateContent('ctaButtons.primary.text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={content.ctaButtons.primary.href}
                      onChange={(e) => updateContent('ctaButtons.primary.href', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Button</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Text"
                      value={content.ctaButtons.secondary.text}
                      onChange={(e) => updateContent('ctaButtons.secondary.text', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={content.ctaButtons.secondary.href}
                      onChange={(e) => updateContent('ctaButtons.secondary.href', e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <div className="mt-8 text-center">
          <button
            onClick={() => window.open('/about', '_blank')}
            className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Preview About Page
          </button>
        </div>
      </div>
    </div>
  )
}