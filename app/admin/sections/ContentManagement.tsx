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

interface AboutContent {
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroBadgeText: string
  heroFeatures: { icon: string; text: string }[]
  // Stats Section
  statsTitle: string
  statsDescription: string
  stats: {
    number: string
    label: string
    description: string
    color: string
  }[]
  // Story Section
  storyTitle: string
  storyDescription1: string
  storyDescription2: string
  // Why Choose Us Features
  whyChooseUsTitle: string
  features: {
    icon: string
    title: string
    description: string
    bgColor: string
  }[]
  // Newsletter Section
  newsletterTitle: string
  newsletterDescription: string
  newsletterBenefits: { icon: string; text: string }[]
  // Final CTA Section
  ctaTitle: string
  ctaDescription: string
  ctaBadgeText: string
  ctaButtons: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
  }
  ctaFeatures: {
    icon: string
    title: string
    description: string
  }[]
}

interface EventsPageContent {
  // Hero Section
  heroBadgeText: string
  heroTitle: string
  heroSubtitle: string
  heroFeatures: { icon: string; text: string }[]
  
  // Featured Section
  featuredTitle: string
  featuredDescription: string
  
  // Search Section
  searchTitle: string
  searchDescription: string
  
  // CTA Section
  ctaBadgeText: string
  ctaTitle: string
  ctaDescription: string
  ctaButtons: {
    primary: { text: string; href: string }
    secondary: { text: string; href: string }
  }
  ctaFeatures: {
    icon: string
    title: string
    description: string
  }[]
}

interface InstructorsPageContent {
  // Hero Section
  heroBadgeText: string
  heroTitle: string
  heroSubtitle: string
  heroFeatures: { icon: string; text: string }[]
  
  // Stats Section
  statsSection: {
    title: string
    subtitle: string
    labels: {
      instructorsLabel: string
      classesLabel: string
      experienceLabel: string
    }
  }
  
  // No Instructors State
  noInstructorsSection: {
    icon: string
    title: string
    subtitle: string
    buttonText: string
    buttonHref: string
  }
  
  // Error State
  errorSection: {
    icon: string
    subtitle: string
    buttonText: string
  }
  
  // CTA Section
  ctaSection: {
    badgeText: string
    title: string
    subtitle: string
    buttons: { text: string; href: string; isPrimary: boolean }[]
    features: {
      icon: string
      title: string
      description: string
    }[]
  }
}

interface ContactPageContent {
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroButtons: { text: string; href: string; isPrimary: boolean }[]
  
  // Quick Options Section
  quickOptionsTitle: string
  quickOptions: {
    icon: string
    title: string
    description: string
    buttonText: string
    buttonHref: string
  }[]
  
  // Contact Form Section
  formTitle: string
  formSubtitle: string
  formOptions: { value: string; label: string }[]
  formFields: {
    nameLabel: string
    phoneLabel: string
    emailLabel: string
    interestLabel: string
    messageLabel: string
    namePlaceholder: string
    phonePlaceholder: string
    emailPlaceholder: string
    messagePlaceholder: string
  }
  submitButtonText: string
  responseTimeText: string
  
  // FAQ Section
  faqTitle: string
  faqSubtitle: string
  faqs: { question: string; answer: string }[]
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
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null)
  const [eventsContent, setEventsContent] = useState<EventsPageContent | null>(null)
  const [instructorsContent, setInstructorsContent] = useState<InstructorsPageContent | null>(null)
  const [contactContent, setContactContent] = useState<ContactPageContent | null>(null)
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
  const [activeTab, setActiveTab] = useState<'overview' | 'homepage' | 'about' | 'events' | 'instructors' | 'contact' | 'settings'>('overview')
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
      const [homepageRes, settingsRes, aboutRes, eventsRes, instructorsRes, contactRes] = await Promise.all([
        fetch('/api/admin/content/homepage'),
        fetch('/api/admin/content/settings'),
        fetch('/api/admin/content/about'),
        fetch('/api/admin/content/events'),
        fetch('/api/admin/content/instructors'),
        fetch('/api/admin/content/contact')
      ])

      if (homepageRes.ok) {
        const homepageData = await homepageRes.json()
        setHomepageContent(homepageData)
      }

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setSiteSettings(settingsData)
      }

      if (aboutRes.ok) {
        const aboutData = await aboutRes.json()
        setAboutContent(aboutData)
      }

      if (eventsRes.ok) {
        const eventsData = await eventsRes.json()
        setEventsContent(eventsData)
      }

      if (instructorsRes.ok) {
        const instructorsData = await instructorsRes.json()
        setInstructorsContent(instructorsData.content)
      }

      if (contactRes.ok) {
        const contactData = await contactRes.json()
        setContactContent(contactData.content)
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

  const saveAboutContent = async () => {
    if (!aboutContent) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aboutContent)
      })

      if (response.ok) {
        alert('About page content updated successfully!')
      } else {
        throw new Error('Failed to save about content')
      }
    } catch (error) {
      console.error('Error saving about content:', error)
      alert('Failed to save about content')
    } finally {
      setIsSaving(false)
    }
  }

  const saveEventsContent = async () => {
    if (!eventsContent) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventsContent)
      })

      if (response.ok) {
        alert('Events page content updated successfully!')
      } else {
        throw new Error('Failed to save events content')
      }
    } catch (error) {
      console.error('Error saving events content:', error)
      alert('Failed to save events content')
    } finally {
      setIsSaving(false)
    }
  }

  const saveInstructorsContent = async () => {
    if (!instructorsContent) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/instructors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: instructorsContent })
      })

      if (response.ok) {
        alert('Instructors page content updated successfully!')
      } else {
        throw new Error('Failed to save instructors content')
      }
    } catch (error) {
      console.error('Error saving instructors content:', error)
      alert('Failed to save instructors content')
    } finally {
      setIsSaving(false)
    }
  }

  const saveContactContent = async () => {
    if (!contactContent) return
    
    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: contactContent })
      })

      if (response.ok) {
        alert('Contact page content updated successfully!')
      } else {
        throw new Error('Failed to save contact content')
      }
    } catch (error) {
      console.error('Error saving contact content:', error)
      alert('Failed to save contact content')
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

  const resetAboutToDefaults = async () => {
    if (!confirm('Are you sure you want to reset about page content to defaults? This cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/about', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        setAboutContent(data.content)
        alert('About page content reset to defaults successfully!')
      } else {
        throw new Error('Failed to reset about content')
      }
    } catch (error) {
      console.error('Error resetting about content:', error)
      alert('Failed to reset about content')
    } finally {
      setIsSaving(false)
    }
  }

  const resetEventsToDefaults = async () => {
    if (!confirm('Are you sure you want to reset events page content to defaults? This cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/events', {
        method: 'DELETE'
      })

      if (response.ok) {
        const data = await response.json()
        setEventsContent(data.content)
        alert('Events page content reset to defaults successfully!')
      } else {
        throw new Error('Failed to reset events content')
      }
    } catch (error) {
      console.error('Error resetting events content:', error)
      alert('Failed to reset events content')
    } finally {
      setIsSaving(false)
    }
  }

  const resetInstructorsToDefaults = async () => {
    if (!confirm('Are you sure you want to reset instructors page content to defaults? This cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/instructors', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setInstructorsContent(data.content)
        alert('Instructors page content reset to defaults successfully!')
      } else {
        throw new Error('Failed to reset instructors content')
      }
    } catch (error) {
      console.error('Error resetting instructors content:', error)
      alert('Failed to reset instructors content')
    } finally {
      setIsSaving(false)
    }
  }

  const resetContactToDefaults = async () => {
    if (!confirm('Are you sure you want to reset contact page content to defaults? This cannot be undone.')) {
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch('/api/admin/content/contact', {
        method: 'POST'
      })

      if (response.ok) {
        const data = await response.json()
        setContactContent(data.content)
        alert('Contact page content reset to defaults successfully!')
      } else {
        throw new Error('Failed to reset contact content')
      }
    } catch (error) {
      console.error('Error resetting contact content:', error)
      alert('Failed to reset contact content')
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

  const renderAboutTab = () => {
    if (!aboutContent) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">About Page Content</h3>
          <div className="flex gap-3">
            <button
              onClick={resetAboutToDefaults}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveAboutContent}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Hero Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={aboutContent.heroTitle}
                  onChange={(e) => setAboutContent({...aboutContent, heroTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Main hero title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={aboutContent.heroSubtitle}
                  onChange={(e) => setAboutContent({...aboutContent, heroSubtitle: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Hero subtitle or description"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={aboutContent.heroBadgeText}
                  onChange={(e) => setAboutContent({...aboutContent, heroBadgeText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Badge text (e.g., Our Story & Mission)"
                />
              </div>
              
              {/* Hero Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Features</label>
                <div className="space-y-2">
                  {aboutContent.heroFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => {
                          const newFeatures = [...aboutContent.heroFeatures]
                          newFeatures[index].icon = e.target.value
                          setAboutContent({...aboutContent, heroFeatures: newFeatures})
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="Icon"
                      />
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => {
                          const newFeatures = [...aboutContent.heroFeatures]
                          newFeatures[index].text = e.target.value
                          setAboutContent({...aboutContent, heroFeatures: newFeatures})
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="Feature text"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = aboutContent.heroFeatures.filter((_, i) => i !== index)
                          setAboutContent({...aboutContent, heroFeatures: newFeatures})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...aboutContent.heroFeatures, { icon: "🌟", text: "New feature" }]
                      setAboutContent({...aboutContent, heroFeatures: newFeatures})
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Stats Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats Title</label>
                <input
                  type="text"
                  value={aboutContent.statsTitle}
                  onChange={(e) => setAboutContent({...aboutContent, statsTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats Description</label>
                <textarea
                  value={aboutContent.statsDescription}
                  onChange={(e) => setAboutContent({...aboutContent, statsDescription: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* Stats Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Statistics</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aboutContent.stats.map((stat, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          value={stat.number}
                          onChange={(e) => {
                            const newStats = [...aboutContent.stats]
                            newStats[index].number = e.target.value
                            setAboutContent({...aboutContent, stats: newStats})
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Number"
                        />
                        <select
                          value={stat.color}
                          onChange={(e) => {
                            const newStats = [...aboutContent.stats]
                            newStats[index].color = e.target.value
                            setAboutContent({...aboutContent, stats: newStats})
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="purple">Purple</option>
                          <option value="pink">Pink</option>
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...aboutContent.stats]
                          newStats[index].label = e.target.value
                          setAboutContent({...aboutContent, stats: newStats})
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Label"
                      />
                      <input
                        type="text"
                        value={stat.description}
                        onChange={(e) => {
                          const newStats = [...aboutContent.stats]
                          newStats[index].description = e.target.value
                          setAboutContent({...aboutContent, stats: newStats})
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Description"
                      />
                      <button
                        onClick={() => {
                          const newStats = aboutContent.stats.filter((_, i) => i !== index)
                          setAboutContent({...aboutContent, stats: newStats})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newStats = [...aboutContent.stats, {
                      number: "100+",
                      label: "New Stat",
                      description: "Description",
                      color: "purple"
                    }]
                    setAboutContent({...aboutContent, stats: newStats})
                  }}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Add Statistic
                </button>
              </div>
            </div>
          </div>

          {/* Story Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Story Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Story Title</label>
                <input
                  type="text"
                  value={aboutContent.storyTitle}
                  onChange={(e) => setAboutContent({...aboutContent, storyTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Paragraph</label>
                <textarea
                  value={aboutContent.storyDescription1}
                  onChange={(e) => setAboutContent({...aboutContent, storyDescription1: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Second Paragraph</label>
                <textarea
                  value={aboutContent.storyDescription2}
                  onChange={(e) => setAboutContent({...aboutContent, storyDescription2: e.target.value})}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Why Choose Us Features */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Why Choose Us Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={aboutContent.whyChooseUsTitle}
                  onChange={(e) => setAboutContent({...aboutContent, whyChooseUsTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {aboutContent.features.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...aboutContent.features]
                            newFeatures[index].icon = e.target.value
                            setAboutContent({...aboutContent, features: newFeatures})
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Icon"
                        />
                        <select
                          value={feature.bgColor}
                          onChange={(e) => {
                            const newFeatures = [...aboutContent.features]
                            newFeatures[index].bgColor = e.target.value
                            setAboutContent({...aboutContent, features: newFeatures})
                          }}
                          className="px-2 py-1 border border-gray-300 rounded text-sm"
                        >
                          <option value="purple">Purple</option>
                          <option value="pink">Pink</option>
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                        </select>
                      </div>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...aboutContent.features]
                          newFeatures[index].title = e.target.value
                          setAboutContent({...aboutContent, features: newFeatures})
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Feature title"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...aboutContent.features]
                          newFeatures[index].description = e.target.value
                          setAboutContent({...aboutContent, features: newFeatures})
                        }}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Feature description"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = aboutContent.features.filter((_, i) => i !== index)
                          setAboutContent({...aboutContent, features: newFeatures})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newFeatures = [...aboutContent.features, {
                      icon: "🌟",
                      title: "New Feature",
                      description: "Feature description",
                      bgColor: "purple"
                    }]
                    setAboutContent({...aboutContent, features: newFeatures})
                  }}
                  className="mt-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>

          {/* Newsletter Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Newsletter Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Title</label>
                <input
                  type="text"
                  value={aboutContent.newsletterTitle}
                  onChange={(e) => setAboutContent({...aboutContent, newsletterTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Description</label>
                <textarea
                  value={aboutContent.newsletterDescription}
                  onChange={(e) => setAboutContent({...aboutContent, newsletterDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Newsletter Benefits</label>
                <div className="space-y-2">
                  {aboutContent.newsletterBenefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit.icon}
                        onChange={(e) => {
                          const newBenefits = [...aboutContent.newsletterBenefits]
                          newBenefits[index].icon = e.target.value
                          setAboutContent({...aboutContent, newsletterBenefits: newBenefits})
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="Icon"
                      />
                      <input
                        type="text"
                        value={benefit.text}
                        onChange={(e) => {
                          const newBenefits = [...aboutContent.newsletterBenefits]
                          newBenefits[index].text = e.target.value
                          setAboutContent({...aboutContent, newsletterBenefits: newBenefits})
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="Benefit text"
                      />
                      <button
                        onClick={() => {
                          const newBenefits = aboutContent.newsletterBenefits.filter((_, i) => i !== index)
                          setAboutContent({...aboutContent, newsletterBenefits: newBenefits})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newBenefits = [...aboutContent.newsletterBenefits, { icon: "🎁", text: "New benefit" }]
                      setAboutContent({...aboutContent, newsletterBenefits: newBenefits})
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Benefit
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Call-to-Action Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                <input
                  type="text"
                  value={aboutContent.ctaTitle}
                  onChange={(e) => setAboutContent({...aboutContent, ctaTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Description</label>
                <textarea
                  value={aboutContent.ctaDescription}
                  onChange={(e) => setAboutContent({...aboutContent, ctaDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={aboutContent.ctaBadgeText}
                  onChange={(e) => setAboutContent({...aboutContent, ctaBadgeText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button</label>
                  <input
                    type="text"
                    value={aboutContent.ctaButtons.primary.text}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      ctaButtons: {
                        ...aboutContent.ctaButtons,
                        primary: { ...aboutContent.ctaButtons.primary, text: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                    placeholder="Button text"
                  />
                  <input
                    type="text"
                    value={aboutContent.ctaButtons.primary.href}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      ctaButtons: {
                        ...aboutContent.ctaButtons,
                        primary: { ...aboutContent.ctaButtons.primary, href: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Button link"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button</label>
                  <input
                    type="text"
                    value={aboutContent.ctaButtons.secondary.text}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      ctaButtons: {
                        ...aboutContent.ctaButtons,
                        secondary: { ...aboutContent.ctaButtons.secondary, text: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                    placeholder="Button text"
                  />
                  <input
                    type="text"
                    value={aboutContent.ctaButtons.secondary.href}
                    onChange={(e) => setAboutContent({
                      ...aboutContent,
                      ctaButtons: {
                        ...aboutContent.ctaButtons,
                        secondary: { ...aboutContent.ctaButtons.secondary, href: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="Button link"
                  />
                </div>
              </div>
              
              {/* CTA Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Features</label>
                <div className="space-y-2">
                  {aboutContent.ctaFeatures.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...aboutContent.ctaFeatures]
                            newFeatures[index].icon = e.target.value
                            setAboutContent({...aboutContent, ctaFeatures: newFeatures})
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Icon"
                        />
                        <input
                          type="text"
                          value={feature.title}
                          onChange={(e) => {
                            const newFeatures = [...aboutContent.ctaFeatures]
                            newFeatures[index].title = e.target.value
                            setAboutContent({...aboutContent, ctaFeatures: newFeatures})
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Feature title"
                        />
                      </div>
                      <input
                        type="text"
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...aboutContent.ctaFeatures]
                          newFeatures[index].description = e.target.value
                          setAboutContent({...aboutContent, ctaFeatures: newFeatures})
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Feature description"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = aboutContent.ctaFeatures.filter((_, i) => i !== index)
                          setAboutContent({...aboutContent, ctaFeatures: newFeatures})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...aboutContent.ctaFeatures, {
                        icon: "✅",
                        title: "New Feature",
                        description: "Feature description"
                      }]
                      setAboutContent({...aboutContent, ctaFeatures: newFeatures})
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderEventsTab = () => {
    if (!eventsContent) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Events Page Content</h3>
          <div className="flex gap-3">
            <button
              onClick={resetEventsToDefaults}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveEventsContent}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Hero Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={eventsContent.heroBadgeText}
                  onChange={(e) => setEventsContent({...eventsContent, heroBadgeText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Experience the Magic of Dance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={eventsContent.heroTitle}
                  onChange={(e) => setEventsContent({...eventsContent, heroTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Upcoming Events"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={eventsContent.heroSubtitle}
                  onChange={(e) => setEventsContent({...eventsContent, heroSubtitle: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Join our exclusive dance events..."
                />
              </div>
              
              {/* Hero Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Features</label>
                <div className="space-y-2">
                  {eventsContent.heroFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => {
                          const newFeatures = [...eventsContent.heroFeatures]
                          newFeatures[index].icon = e.target.value
                          setEventsContent({...eventsContent, heroFeatures: newFeatures})
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="🎪"
                      />
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => {
                          const newFeatures = [...eventsContent.heroFeatures]
                          newFeatures[index].text = e.target.value
                          setEventsContent({...eventsContent, heroFeatures: newFeatures})
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="Feature text"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = eventsContent.heroFeatures.filter((_, i) => i !== index)
                          setEventsContent({...eventsContent, heroFeatures: newFeatures})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...eventsContent.heroFeatures, { icon: "🌟", text: "New feature" }]
                      setEventsContent({...eventsContent, heroFeatures: newFeatures})
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Featured Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Featured Events Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Title</label>
                <input
                  type="text"
                  value={eventsContent.featuredTitle}
                  onChange={(e) => setEventsContent({...eventsContent, featuredTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Featured Description</label>
                <textarea
                  value={eventsContent.featuredDescription}
                  onChange={(e) => setEventsContent({...eventsContent, featuredDescription: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Search Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Search & Filter Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Title</label>
                <input
                  type="text"
                  value={eventsContent.searchTitle}
                  onChange={(e) => setEventsContent({...eventsContent, searchTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Description</label>
                <input
                  type="text"
                  value={eventsContent.searchDescription}
                  onChange={(e) => setEventsContent({...eventsContent, searchDescription: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Call-to-Action Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Badge Text</label>
                <input
                  type="text"
                  value={eventsContent.ctaBadgeText}
                  onChange={(e) => setEventsContent({...eventsContent, ctaBadgeText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                <input
                  type="text"
                  value={eventsContent.ctaTitle}
                  onChange={(e) => setEventsContent({...eventsContent, ctaTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Description</label>
                <textarea
                  value={eventsContent.ctaDescription}
                  onChange={(e) => setEventsContent({...eventsContent, ctaDescription: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              {/* CTA Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Primary Button</label>
                  <input
                    type="text"
                    value={eventsContent.ctaButtons.primary.text}
                    onChange={(e) => setEventsContent({
                      ...eventsContent,
                      ctaButtons: {
                        ...eventsContent.ctaButtons,
                        primary: { ...eventsContent.ctaButtons.primary, text: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                    placeholder="🎫 Reserve Your Spot"
                  />
                  <input
                    type="text"
                    value={eventsContent.ctaButtons.primary.href}
                    onChange={(e) => setEventsContent({
                      ...eventsContent,
                      ctaButtons: {
                        ...eventsContent.ctaButtons,
                        primary: { ...eventsContent.ctaButtons.primary, href: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="/contact"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Secondary Button</label>
                  <input
                    type="text"
                    value={eventsContent.ctaButtons.secondary.text}
                    onChange={(e) => setEventsContent({
                      ...eventsContent,
                      ctaButtons: {
                        ...eventsContent.ctaButtons,
                        secondary: { ...eventsContent.ctaButtons.secondary, text: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded mb-2"
                    placeholder="📞 Get Event Updates"
                  />
                  <input
                    type="text"
                    value={eventsContent.ctaButtons.secondary.href}
                    onChange={(e) => setEventsContent({
                      ...eventsContent,
                      ctaButtons: {
                        ...eventsContent.ctaButtons,
                        secondary: { ...eventsContent.ctaButtons.secondary, href: e.target.value }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded"
                    placeholder="/contact"
                  />
                </div>
              </div>
              
              {/* CTA Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Features</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {eventsContent.ctaFeatures.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...eventsContent.ctaFeatures]
                            newFeatures[index].icon = e.target.value
                            setEventsContent({...eventsContent, ctaFeatures: newFeatures})
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="🎯"
                        />
                        <button
                          onClick={() => {
                            const newFeatures = eventsContent.ctaFeatures.filter((_, i) => i !== index)
                            setEventsContent({...eventsContent, ctaFeatures: newFeatures})
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...eventsContent.ctaFeatures]
                          newFeatures[index].title = e.target.value
                          setEventsContent({...eventsContent, ctaFeatures: newFeatures})
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Feature title"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...eventsContent.ctaFeatures]
                          newFeatures[index].description = e.target.value
                          setEventsContent({...eventsContent, ctaFeatures: newFeatures})
                        }}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Feature description"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newFeatures = [...eventsContent.ctaFeatures, {
                      icon: "🌟",
                      title: "New Feature",
                      description: "Feature description"
                    }]
                    setEventsContent({...eventsContent, ctaFeatures: newFeatures})
                  }}
                  className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderInstructorsTab = () => {
    if (!instructorsContent) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Instructors Page Content</h3>
          <div className="flex gap-3">
            <button
              onClick={resetInstructorsToDefaults}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveInstructorsContent}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Hero Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Badge Text</label>
                <input
                  type="text"
                  value={instructorsContent.heroBadgeText}
                  onChange={(e) => setInstructorsContent({...instructorsContent, heroBadgeText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Meet Our Expert Team"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={instructorsContent.heroTitle}
                  onChange={(e) => setInstructorsContent({...instructorsContent, heroTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Our Instructors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={instructorsContent.heroSubtitle}
                  onChange={(e) => setInstructorsContent({...instructorsContent, heroSubtitle: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Meet the talented professionals behind our classes..."
                />
              </div>
              
              {/* Hero Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Features</label>
                <div className="space-y-2">
                  {instructorsContent.heroFeatures.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature.icon}
                        onChange={(e) => {
                          const newFeatures = [...instructorsContent.heroFeatures]
                          newFeatures[index].icon = e.target.value
                          setInstructorsContent({...instructorsContent, heroFeatures: newFeatures})
                        }}
                        className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="🎭"
                      />
                      <input
                        type="text"
                        value={feature.text}
                        onChange={(e) => {
                          const newFeatures = [...instructorsContent.heroFeatures]
                          newFeatures[index].text = e.target.value
                          setInstructorsContent({...instructorsContent, heroFeatures: newFeatures})
                        }}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        placeholder="Feature text"
                      />
                      <button
                        onClick={() => {
                          const newFeatures = instructorsContent.heroFeatures.filter((_, i) => i !== index)
                          setInstructorsContent({...instructorsContent, heroFeatures: newFeatures})
                        }}
                        className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFeatures = [...instructorsContent.heroFeatures, { icon: "⭐", text: "New feature" }]
                      setInstructorsContent({...instructorsContent, heroFeatures: newFeatures})
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Statistics Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats Title</label>
                <input
                  type="text"
                  value={instructorsContent.statsSection.title}
                  onChange={(e) => setInstructorsContent({
                    ...instructorsContent,
                    statsSection: {
                      ...instructorsContent.statsSection,
                      title: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Our Teaching Excellence"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stats Subtitle</label>
                <textarea
                  value={instructorsContent.statsSection.subtitle}
                  onChange={(e) => setInstructorsContent({
                    ...instructorsContent,
                    statsSection: {
                      ...instructorsContent.statsSection,
                      subtitle: e.target.value
                    }
                  })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Meet our diverse team of professional dance instructors..."
                />
              </div>
              
              {/* Stats Labels */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instructors Label</label>
                  <input
                    type="text"
                    value={instructorsContent.statsSection.labels.instructorsLabel}
                    onChange={(e) => setInstructorsContent({
                      ...instructorsContent,
                      statsSection: {
                        ...instructorsContent.statsSection,
                        labels: {
                          ...instructorsContent.statsSection.labels,
                          instructorsLabel: e.target.value
                        }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Expert Instructors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Classes Label</label>
                  <input
                    type="text"
                    value={instructorsContent.statsSection.labels.classesLabel}
                    onChange={(e) => setInstructorsContent({
                      ...instructorsContent,
                      statsSection: {
                        ...instructorsContent.statsSection,
                        labels: {
                          ...instructorsContent.statsSection.labels,
                          classesLabel: e.target.value
                        }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Active Classes"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience Label</label>
                  <input
                    type="text"
                    value={instructorsContent.statsSection.labels.experienceLabel}
                    onChange={(e) => setInstructorsContent({
                      ...instructorsContent,
                      statsSection: {
                        ...instructorsContent.statsSection,
                        labels: {
                          ...instructorsContent.statsSection.labels,
                          experienceLabel: e.target.value
                        }
                      }
                    })}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    placeholder="Years Experience"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Call-to-Action Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Badge Text</label>
                <input
                  type="text"
                  value={instructorsContent.ctaSection.badgeText}
                  onChange={(e) => setInstructorsContent({
                    ...instructorsContent,
                    ctaSection: {
                      ...instructorsContent.ctaSection,
                      badgeText: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Start Your Journey"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Title</label>
                <input
                  type="text"
                  value={instructorsContent.ctaSection.title}
                  onChange={(e) => setInstructorsContent({
                    ...instructorsContent,
                    ctaSection: {
                      ...instructorsContent.ctaSection,
                      title: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ready to Learn?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Subtitle</label>
                <textarea
                  value={instructorsContent.ctaSection.subtitle}
                  onChange={(e) => setInstructorsContent({
                    ...instructorsContent,
                    ctaSection: {
                      ...instructorsContent.ctaSection,
                      subtitle: e.target.value
                    }
                  })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Join our expert instructors and discover the joy of dance..."
                />
              </div>
              
              {/* CTA Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Buttons</label>
                <div className="space-y-3">
                  {instructorsContent.ctaSection.buttons.map((button, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={button.text}
                          onChange={(e) => {
                            const newButtons = [...instructorsContent.ctaSection.buttons]
                            newButtons[index].text = e.target.value
                            setInstructorsContent({
                              ...instructorsContent,
                              ctaSection: {
                                ...instructorsContent.ctaSection,
                                buttons: newButtons
                              }
                            })
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Button text"
                        />
                        <input
                          type="text"
                          value={button.href}
                          onChange={(e) => {
                            const newButtons = [...instructorsContent.ctaSection.buttons]
                            newButtons[index].href = e.target.value
                            setInstructorsContent({
                              ...instructorsContent,
                              ctaSection: {
                                ...instructorsContent.ctaSection,
                                buttons: newButtons
                              }
                            })
                          }}
                          className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="/link"
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={button.isPrimary}
                            onChange={(e) => {
                              const newButtons = [...instructorsContent.ctaSection.buttons]
                              newButtons[index].isPrimary = e.target.checked
                              setInstructorsContent({
                                ...instructorsContent,
                                ctaSection: {
                                  ...instructorsContent.ctaSection,
                                  buttons: newButtons
                                }
                              })
                            }}
                            className="rounded"
                          />
                          <span className="text-xs">Primary</span>
                        </label>
                        <button
                          onClick={() => {
                            const newButtons = instructorsContent.ctaSection.buttons.filter((_, i) => i !== index)
                            setInstructorsContent({
                              ...instructorsContent,
                              ctaSection: {
                                ...instructorsContent.ctaSection,
                                buttons: newButtons
                              }
                            })
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newButtons = [...instructorsContent.ctaSection.buttons, {
                        text: "New Button",
                        href: "/link",
                        isPrimary: false
                      }]
                      setInstructorsContent({
                        ...instructorsContent,
                        ctaSection: {
                          ...instructorsContent.ctaSection,
                          buttons: newButtons
                        }
                      })
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Button
                  </button>
                </div>
              </div>
              
              {/* CTA Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Features</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {instructorsContent.ctaSection.features.map((feature, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature.icon}
                          onChange={(e) => {
                            const newFeatures = [...instructorsContent.ctaSection.features]
                            newFeatures[index].icon = e.target.value
                            setInstructorsContent({
                              ...instructorsContent,
                              ctaSection: {
                                ...instructorsContent.ctaSection,
                                features: newFeatures
                              }
                            })
                          }}
                          className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="🎨"
                        />
                        <button
                          onClick={() => {
                            const newFeatures = instructorsContent.ctaSection.features.filter((_, i) => i !== index)
                            setInstructorsContent({
                              ...instructorsContent,
                              ctaSection: {
                                ...instructorsContent.ctaSection,
                                features: newFeatures
                              }
                            })
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      <input
                        type="text"
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...instructorsContent.ctaSection.features]
                          newFeatures[index].title = e.target.value
                          setInstructorsContent({
                            ...instructorsContent,
                            ctaSection: {
                              ...instructorsContent.ctaSection,
                              features: newFeatures
                            }
                          })
                        }}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                        placeholder="Feature title"
                      />
                      <textarea
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...instructorsContent.ctaSection.features]
                          newFeatures[index].description = e.target.value
                          setInstructorsContent({
                            ...instructorsContent,
                            ctaSection: {
                              ...instructorsContent.ctaSection,
                              features: newFeatures
                            }
                          })
                        }}
                        rows={2}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Feature description"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newFeatures = [...instructorsContent.ctaSection.features, {
                      icon: "🌟",
                      title: "New Feature",
                      description: "Feature description"
                    }]
                    setInstructorsContent({
                      ...instructorsContent,
                      ctaSection: {
                        ...instructorsContent.ctaSection,
                        features: newFeatures
                      }
                    })
                  }}
                  className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Add Feature
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderContactTab = () => {
    if (!contactContent) {
      return (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        </div>
      )
    }

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Contact Page Content</h3>
          <div className="flex gap-3">
            <button
              onClick={resetContactToDefaults}
              disabled={isSaving}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
            >
              Reset to Defaults
            </button>
            <button
              onClick={saveContactContent}
              disabled={isSaving}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Hero Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Hero Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Title</label>
                <input
                  type="text"
                  value={contactContent.heroTitle}
                  onChange={(e) => setContactContent({...contactContent, heroTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="📞 Get in Touch"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Subtitle</label>
                <textarea
                  value={contactContent.heroSubtitle}
                  onChange={(e) => setContactContent({...contactContent, heroSubtitle: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Ready to start dancing? We're here to help you find the perfect class!"
                />
              </div>
              
              {/* Hero Buttons */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hero Buttons</label>
                <div className="space-y-3">
                  {contactContent.heroButtons.map((button, index) => (
                    <div key={index} className="border border-gray-200 rounded p-3">
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={button.text}
                          onChange={(e) => {
                            const newButtons = [...contactContent.heroButtons]
                            newButtons[index].text = e.target.value
                            setContactContent({...contactContent, heroButtons: newButtons})
                          }}
                          className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Button text"
                        />
                        <input
                          type="text"
                          value={button.href}
                          onChange={(e) => {
                            const newButtons = [...contactContent.heroButtons]
                            newButtons[index].href = e.target.value
                            setContactContent({...contactContent, heroButtons: newButtons})
                          }}
                          className="w-40 px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Link/URL"
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={button.isPrimary}
                            onChange={(e) => {
                              const newButtons = [...contactContent.heroButtons]
                              newButtons[index].isPrimary = e.target.checked
                              setContactContent({...contactContent, heroButtons: newButtons})
                            }}
                            className="rounded"
                          />
                          <span className="text-xs">Primary</span>
                        </label>
                        <button
                          onClick={() => {
                            const newButtons = contactContent.heroButtons.filter((_, i) => i !== index)
                            setContactContent({...contactContent, heroButtons: newButtons})
                          }}
                          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newButtons = [...contactContent.heroButtons, {
                        text: "New Button",
                        href: "#",
                        isPrimary: false
                      }]
                      setContactContent({...contactContent, heroButtons: newButtons})
                    }}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    + Add Button
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Options Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Quick Options Section</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Section Title</label>
                <input
                  type="text"
                  value={contactContent.quickOptionsTitle}
                  onChange={(e) => setContactContent({...contactContent, quickOptionsTitle: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Quick Actions"
                />
              </div>
              
              {/* Quick Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Quick Options</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {contactContent.quickOptions.map((option, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={option.icon}
                            onChange={(e) => {
                              const newOptions = [...contactContent.quickOptions]
                              newOptions[index].icon = e.target.value
                              setContactContent({...contactContent, quickOptions: newOptions})
                            }}
                            className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                            placeholder="🎁"
                          />
                          <button
                            onClick={() => {
                              const newOptions = contactContent.quickOptions.filter((_, i) => i !== index)
                              setContactContent({...contactContent, quickOptions: newOptions})
                            }}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                          >
                            Remove
                          </button>
                        </div>
                        <input
                          type="text"
                          value={option.title}
                          onChange={(e) => {
                            const newOptions = [...contactContent.quickOptions]
                            newOptions[index].title = e.target.value
                            setContactContent({...contactContent, quickOptions: newOptions})
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm font-medium"
                          placeholder="Option title"
                        />
                        <textarea
                          value={option.description}
                          onChange={(e) => {
                            const newOptions = [...contactContent.quickOptions]
                            newOptions[index].description = e.target.value
                            setContactContent({...contactContent, quickOptions: newOptions})
                          }}
                          rows={2}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="Option description"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={option.buttonText}
                            onChange={(e) => {
                              const newOptions = [...contactContent.quickOptions]
                              newOptions[index].buttonText = e.target.value
                              setContactContent({...contactContent, quickOptions: newOptions})
                            }}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Button text"
                          />
                          <input
                            type="text"
                            value={option.buttonHref}
                            onChange={(e) => {
                              const newOptions = [...contactContent.quickOptions]
                              newOptions[index].buttonHref = e.target.value
                              setContactContent({...contactContent, quickOptions: newOptions})
                            }}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Link"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => {
                    const newOptions = [...contactContent.quickOptions, {
                      icon: "⭐",
                      title: "New Option",
                      description: "Description here",
                      buttonText: "Action",
                      buttonHref: "#"
                    }]
                    setContactContent({...contactContent, quickOptions: newOptions})
                  }}
                  className="mt-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                >
                  + Add Quick Option
                </button>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">Contact Form Section</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                  <input
                    type="text"
                    value={contactContent.formTitle}
                    onChange={(e) => setContactContent({...contactContent, formTitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="📝 Send Us a Message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Submit Button Text</label>
                  <input
                    type="text"
                    value={contactContent.submitButtonText}
                    onChange={(e) => setContactContent({...contactContent, submitButtonText: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="🚀 Send Message"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Form Subtitle</label>
                <textarea
                  value={contactContent.formSubtitle}
                  onChange={(e) => setContactContent({...contactContent, formSubtitle: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="Fill out the form below and we'll get back to you within 24 hours"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Response Time Text</label>
                <input
                  type="text"
                  value={contactContent.responseTimeText}
                  onChange={(e) => setContactContent({...contactContent, responseTimeText: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="We typically respond within 2-4 hours during business hours"
                />
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold mb-4">FAQ Section</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FAQ Title</label>
                  <input
                    type="text"
                    value={contactContent.faqTitle}
                    onChange={(e) => setContactContent({...contactContent, faqTitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="❓ Frequently Asked Questions"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">FAQ Subtitle</label>
                  <input
                    type="text"
                    value={contactContent.faqSubtitle}
                    onChange={(e) => setContactContent({...contactContent, faqSubtitle: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Quick answers to common questions"
                  />
                </div>
              </div>
              
              {/* FAQ Items */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">FAQ Items</label>
                <div className="space-y-3">
                  {contactContent.faqs.map((faq, index) => (
                    <div key={index} className="border border-gray-200 rounded p-4">
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={faq.question}
                            onChange={(e) => {
                              const newFaqs = [...contactContent.faqs]
                              newFaqs[index].question = e.target.value
                              setContactContent({...contactContent, faqs: newFaqs})
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded font-medium"
                            placeholder="Question"
                          />
                          <button
                            onClick={() => {
                              const newFaqs = contactContent.faqs.filter((_, i) => i !== index)
                              setContactContent({...contactContent, faqs: newFaqs})
                            }}
                            className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        <textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const newFaqs = [...contactContent.faqs]
                            newFaqs[index].answer = e.target.value
                            setContactContent({...contactContent, faqs: newFaqs})
                          }}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded"
                          placeholder="Answer"
                        />
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newFaqs = [...contactContent.faqs, {
                        question: "New Question?",
                        answer: "Answer goes here."
                      }]
                      setContactContent({...contactContent, faqs: newFaqs})
                    }}
                    className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    + Add FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

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
            onClick={() => setActiveTab('about')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'about'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📄 About Page
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'events'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            🎪 Events Page
          </button>
          <button
            onClick={() => setActiveTab('instructors')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'instructors'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            👨‍🏫 Instructors Page
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'contact'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📞 Contact Page
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
      {activeTab === 'about' && renderAboutTab()}
      {activeTab === 'events' && renderEventsTab()}
      {activeTab === 'instructors' && renderInstructorsTab()}
      {activeTab === 'contact' && renderContactTab()}
      {activeTab === 'settings' && renderSettingsTab()}
    </div>
  )
}