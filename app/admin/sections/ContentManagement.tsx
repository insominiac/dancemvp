'use client'

import { useState, useEffect } from 'react'

interface Stats {
  students: number
  instructors: number
  classes: number
  events: number
  venues: number
  danceStyles: number
  totalBookings: number
}

interface FeaturedContent {
  featuredClasses: any[]
  featuredEvents: any[]
  featuredInstructors: any[]
  popularStyles: any[]
}

interface HomepageContent {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
  heroBackgroundImage: string | null
  aboutTitle: string
  aboutDescription: string
  testimonialsEnabled: boolean
  newsletterEnabled: boolean
}

interface SiteSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  phoneNumber: string
  address: string
  socialMedia: {
    facebook: string
    instagram: string
    twitter: string
  }
}

export default function ContentManagement() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [featuredContent, setFeaturedContent] = useState<FeaturedContent | null>(null)
  const [homepageContent, setHomepageContent] = useState<HomepageContent>({
    heroTitle: "Master the Art of Dance",
    heroSubtitle: "Join our community of passionate dancers and experienced instructors",
    heroButtonText: "Start Your Journey",
    heroBackgroundImage: null,
    aboutTitle: "Why Choose Our Studio?",
    aboutDescription: "We offer a wide range of dance classes for all skill levels, with expert instructors and a supportive community.",
    testimonialsEnabled: true,
    newsletterEnabled: true
  })
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    siteName: "Dance Studio",
    siteDescription: "Premier dance studio offering classes for all levels",
    contactEmail: "info@dancestudio.com",
    phoneNumber: "+1 (555) 123-4567",
    address: "123 Dance Street, City, State 12345",
    socialMedia: {
      facebook: "https://facebook.com/dancestudio",
      instagram: "https://instagram.com/dancestudio",
      twitter: "https://twitter.com/dancestudio"
    }
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'overview' | 'homepage' | 'settings'>('overview')
  const [isUploadingBg, setIsUploadingBg] = useState(false)

  useEffect(() => {
    fetchData()
    loadSavedContent()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const [statsRes, featuredRes] = await Promise.all([
        fetch('/api/public/stats'),
        fetch('/api/public/featured')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
        setLastUpdated(statsData.lastUpdated)
      }

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        setFeaturedContent(featuredData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadSavedContent = async () => {
    try {
      const [homepageRes, settingsRes] = await Promise.all([
        fetch('/api/admin/content/homepage'),
        fetch('/api/admin/content/settings')
      ])

      if (homepageRes.ok) {
        const homepageData = await homepageRes.json()
        setHomepageContent(homepageData)
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSiteSettings(settingsData)
      }
    } catch (error) {
      console.error('Error loading saved content:', error)
    }
  }

  const refreshCache = async () => {
    setIsLoading(true)
    // Force refresh by adding cache-busting parameter
    try {
      const timestamp = new Date().getTime()
      const [statsRes, featuredRes] = await Promise.all([
        fetch(`/api/public/stats?t=${timestamp}`, { cache: 'no-store' }),
        fetch(`/api/public/featured?t=${timestamp}`, { cache: 'no-store' })
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats)
        setLastUpdated(statsData.lastUpdated)
      }

      if (featuredRes.ok) {
        const featuredData = await featuredRes.json()
        setFeaturedContent(featuredData)
      }
      
      alert('Content cache refreshed successfully!')
    } catch (error) {
      console.error('Error refreshing cache:', error)
      alert('Failed to refresh cache')
    } finally {
      setIsLoading(false)
    }
  }

  const saveHomepageContent = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/homepage', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageContent)
      })

      if (response.ok) {
        alert('Homepage content updated successfully!')
      } else {
        throw new Error('Failed to save homepage content')
      }
    } catch (error) {
      console.error('Error saving homepage content:', error)
      alert('Failed to save homepage content')
    } finally {
      setIsSaving(false)
    }
  }

  const saveSiteSettings = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings)
      })

      if (response.ok) {
        alert('Site settings updated successfully!')
      } else {
        throw new Error('Failed to save site settings')
      }
    } catch (error) {
      console.error('Error saving site settings:', error)
      alert('Failed to save site settings')
    } finally {
      setIsSaving(false)
    }
  }

  const resetToDefaults = async () => {
    if (!confirm('Are you sure you want to reset site settings to defaults? This cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/settings', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        setSiteSettings(data.settings)
        alert('Site settings reset to defaults successfully!')
      } else {
        throw new Error('Failed to reset site settings')
      }
    } catch (error) {
      console.error('Error resetting site settings:', error)
      alert('Failed to reset site settings')
    } finally {
      setIsSaving(false)
    }
  }

  const handleHeroBgUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingBg(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload/hero-bg', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        setHomepageContent({
          ...homepageContent,
          heroBackgroundImage: data.url
        })
        alert('Hero background image uploaded successfully!')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Error uploading hero background:', error)
      alert('Failed to upload hero background image: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setIsUploadingBg(false)
      // Reset the input
      event.target.value = ''
    }
  }

  const handleHeroBgRemove = async () => {
    if (!homepageContent.heroBackgroundImage) return
    
    if (!confirm('Are you sure you want to remove the hero background image?')) {
      return
    }

    try {
      // Extract filename from URL
      const filename = homepageContent.heroBackgroundImage.split('/').pop()
      if (filename) {
        await fetch(`/api/admin/upload/hero-bg?filename=${filename}`, {
          method: 'DELETE'
        })
      }
      
      setHomepageContent({
        ...homepageContent,
        heroBackgroundImage: null
      })
      alert('Hero background image removed successfully!')
    } catch (error) {
      console.error('Error removing hero background:', error)
      alert('Failed to remove hero background image')
    }
  }

  const renderOverviewTab = () => (
    <div>
      {lastUpdated && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Last Updated:</strong> {new Date(lastUpdated).toLocaleString()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Homepage Statistics */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Homepage Statistics</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : stats ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.students}</div>
                <div className="text-sm text-gray-600">Students</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.instructors}</div>
                <div className="text-sm text-gray-600">Instructors</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.classes}</div>
                <div className="text-sm text-gray-600">Classes</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.events}</div>
                <div className="text-sm text-gray-600">Events</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.venues}</div>
                <div className="text-sm text-gray-600">Venues</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{stats.danceStyles}</div>
                <div className="text-sm text-gray-600">Dance Styles</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Failed to load statistics</p>
          )}
        </div>

        {/* Featured Content */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Featured Content</h3>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : featuredContent ? (
            <div className="space-y-4">
              <div className="p-3 bg-green-50 border border-green-200 rounded">
                <div className="font-medium">Featured Classes</div>
                <div className="text-sm text-gray-600">{featuredContent.featuredClasses.length} items</div>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                <div className="font-medium">Featured Events</div>
                <div className="text-sm text-gray-600">{featuredContent.featuredEvents.length} items</div>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                <div className="font-medium">Featured Instructors</div>
                <div className="text-sm text-gray-600">{featuredContent.featuredInstructors.length} items</div>
              </div>
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                <div className="font-medium">Popular Styles</div>
                <div className="text-sm text-gray-600">{featuredContent.popularStyles.length} items</div>
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Failed to load featured content</p>
          )}
        </div>
      </div>

      {/* Content Management Instructions */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">How Dynamic Content Works</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <h5 className="font-semibold mb-2">Homepage Statistics:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Automatically calculated from database</li>
              <li>• Updates every 5 minutes (ISR)</li>
              <li>• Includes active students, instructors, classes</li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-2">Featured Content:</h5>
            <ul className="space-y-1 text-gray-600">
              <li>• Classes: Based on booking popularity</li>
              <li>• Events: Marked as "featured" in admin</li>
              <li>• Instructors: Most active teachers</li>
              <li>• Styles: By class/event count</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHomepageTab = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Homepage Content</h3>
        <button
          onClick={saveHomepageContent}
          disabled={isSaving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        {/* Hero Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Hero Section</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
              <input
                type="text"
                value={homepageContent.heroTitle}
                onChange={(e) => setHomepageContent({...homepageContent, heroTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Main hero title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
              <textarea
                value={homepageContent.heroSubtitle}
                onChange={(e) => setHomepageContent({...homepageContent, heroSubtitle: e.target.value})}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Hero subtitle or description"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Button Text</label>
              <input
                type="text"
                value={homepageContent.heroButtonText}
                onChange={(e) => setHomepageContent({...homepageContent, heroButtonText: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Button text"
              />
            </div>
            
            {/* Hero Background Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hero Background Image</label>
              <div className="space-y-4">
                {homepageContent.heroBackgroundImage ? (
                  <div className="relative">
                    <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={homepageContent.heroBackgroundImage}
                        alt="Hero Background"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={handleHeroBgRemove}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                      title="Remove image"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No background image selected</span>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <label className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleHeroBgUpload}
                      disabled={isUploadingBg}
                      className="hidden"
                    />
                    <div className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer text-center disabled:opacity-50">
                      {isUploadingBg ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </span>
                      ) : (
                        <span>📸 Upload Background Image</span>
                      )}
                    </div>
                  </label>
                </div>
                
                <div className="text-sm text-gray-500">
                  <p>• Recommended size: 1920x1080 pixels or larger</p>
                  <p>• Supported formats: JPG, PNG, WebP, GIF</p>
                  <p>• Maximum file size: 5MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* About Section */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">About Section</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Title</label>
              <input
                type="text"
                value={homepageContent.aboutTitle}
                onChange={(e) => setHomepageContent({...homepageContent, aboutTitle: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="About section title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">About Description</label>
              <textarea
                value={homepageContent.aboutDescription}
                onChange={(e) => setHomepageContent({...homepageContent, aboutDescription: e.target.value})}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="About section description"
              />
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Section Toggles</h4>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="testimonials"
                checked={homepageContent.testimonialsEnabled}
                onChange={(e) => setHomepageContent({...homepageContent, testimonialsEnabled: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="testimonials" className="ml-2 block text-sm text-gray-900">
                Enable Testimonials Section
              </label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="newsletter"
                checked={homepageContent.newsletterEnabled}
                onChange={(e) => setHomepageContent({...homepageContent, newsletterEnabled: e.target.checked})}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="newsletter" className="ml-2 block text-sm text-gray-900">
                Enable Newsletter Signup Section
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSettingsTab = () => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Site Settings</h3>
        <div className="flex gap-3">
          <button
            onClick={resetToDefaults}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
          >
            Reset to Defaults
          </button>
          <button
            onClick={saveSiteSettings}
            disabled={isSaving}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">General Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
              <input
                type="text"
                value={siteSettings.siteName}
                onChange={(e) => setSiteSettings({...siteSettings, siteName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
              <input
                type="email"
                value={siteSettings.contactEmail}
                onChange={(e) => setSiteSettings({...siteSettings, contactEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={siteSettings.phoneNumber}
                onChange={(e) => setSiteSettings({...siteSettings, phoneNumber: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={siteSettings.address}
                onChange={(e) => setSiteSettings({...siteSettings, address: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
            <textarea
              value={siteSettings.siteDescription}
              onChange={(e) => setSiteSettings({...siteSettings, siteDescription: e.target.value})}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Brief description of your dance studio"
            />
          </div>
        </div>

        {/* Social Media */}
        <div className="border border-gray-200 rounded-lg p-6">
          <h4 className="text-lg font-semibold mb-4">Social Media Links</h4>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
              <input
                type="url"
                value={siteSettings.socialMedia.facebook}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  socialMedia: {...siteSettings.socialMedia, facebook: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
              <input
                type="url"
                value={siteSettings.socialMedia.instagram}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  socialMedia: {...siteSettings.socialMedia, instagram: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://instagram.com/yourpage"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
              <input
                type="url"
                value={siteSettings.socialMedia.twitter}
                onChange={(e) => setSiteSettings({
                  ...siteSettings,
                  socialMedia: {...siteSettings.socialMedia, twitter: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://twitter.com/yourpage"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Content Management</h2>
        <div className="flex gap-4">
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Refresh Data'}
          </button>
          <button
            onClick={refreshCache}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            disabled={isLoading}
          >
            🔄 Clear Cache
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveTab('homepage')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'homepage'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🏠 Homepage Content
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'settings'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            ⚙️ Site Settings
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'homepage' && renderHomepageTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </div>
  )
}