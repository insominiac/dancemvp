'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

// Define interfaces for type safety
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

export default function AboutPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [content, setContent] = useState<AboutContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch content from API
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/public/content/about')
        if (response.ok) {
          const data = await response.json()
          setContent(data)
        } else {
          console.error('Failed to fetch about content')
        }
      } catch (error) {
        console.error('Error fetching about content:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContent()
  }, [])

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      // Here you would typically send the email to your backend
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    )
  }

  // Show error state if no content
  if (!content) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Unavailable</h2>
          <p className="text-gray-600">Unable to load page content. Please try again later.</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="dance-hero">
        <div 
          className="dance-hero-background"
          style={{
            opacity: 0.1
          }}
        ></div>
        <div className="floating-elements">
          <div className="floating-element" style={{top: '20%', left: '10%', animationDelay: '0s'}}>✦</div>
          <div className="floating-element" style={{top: '60%', right: '10%', animationDelay: '3s'}}>✧</div>
          <div className="floating-element" style={{bottom: '20%', left: '50%', animationDelay: '6s'}}>✨</div>
        </div>
        <div className="dance-hero-content">
          <p className="dance-hero-subtitle">{content.heroBadgeText}</p>
          <h1 className="dance-hero-title dance-font">
            {content.heroTitle.split(' ').map((word, index) => 
              index === content.heroTitle.split(' ').length - 1 ? (
                <span key={index} className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">{word}</span>
              ) : (
                word + ' '
              )
            )}
          </h1>
          <p className="dance-hero-description">
            {content.heroSubtitle}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {content.heroFeatures.map((feature, index) => (
              <div key={index} className="flex items-center text-white/90">
                <span className="mr-2">{feature.icon}</span>
                <span>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-20" style={{background: 'var(--neutral-light)'}}>
        <div className="dance-container">
          <div className="dance-section-header">
            <h2 className="dance-section-title">{content.statsTitle}</h2>
            <p>{content.statsDescription}</p>
          </div>
          <div className="dance-card-grid">
            {content.stats.map((stat, index) => (
              <div key={index} className="dance-card text-center">
                <div className="text-5xl font-bold mb-2" style={{
                  background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {stat.number}
                </div>
                <div className="font-medium mb-1" style={{color: 'var(--primary-dark)'}}>{stat.label}</div>
                <div className="text-sm" style={{color: 'var(--neutral-gray)'}}>{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="dance-container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-center lg:text-left mb-8">
                <div className="text-6xl mb-4">💃</div>
                <h2 className="text-4xl font-bold mb-6" style={{color: 'var(--primary-dark)'}}>{content.storyTitle}</h2>
              </div>
              <p className="text-lg leading-relaxed mb-6" style={{color: 'var(--neutral-gray)'}}>
                {content.storyDescription1}
              </p>
              <p className="text-lg leading-relaxed mb-8" style={{color: 'var(--neutral-gray)'}}>
                {content.storyDescription2}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/classes" 
                  className="dance-btn dance-btn-primary hover:transform hover:scale-105 transition-all duration-300"
                >
                  💃 Explore Classes
                </Link>
                <Link 
                  href="/contact" 
                  className="dance-btn dance-btn-secondary hover:transform hover:scale-105 transition-all duration-300"
                >
                  📞 Contact Us
                </Link>
              </div>
            </div>
            
            <div>
              <div className="dance-card">
                <h3 className="text-2xl font-bold mb-8 text-center" style={{color: 'var(--primary-dark)'}}>✨ {content.whyChooseUsTitle}</h3>
                <div className="space-y-6">
                  {content.features.map((feature, index) => (
                    <div key={index} className="dance-card" style={{marginBottom: '1rem'}}>
                      <div className="flex items-start">
                        <div className="text-2xl mr-4 mt-1" style={{
                          background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent'
                        }}>{feature.icon}</div>
                        <div>
                          <h4 className="font-semibold mb-1" style={{color: 'var(--primary-dark)'}}>{feature.title}</h4>
                          <p className="text-sm" style={{color: 'var(--neutral-gray)'}}>{feature.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="py-20" style={{background: 'var(--neutral-light)'}}>
        <div className="dance-container">
          <div className="dance-card">
            <div className="max-w-2xl mx-auto text-center">
              <div className="dance-hero-gradient p-8 text-white">
                <div className="text-6xl mb-4">📧</div>
                <h2 className="text-3xl font-bold mb-4 dance-font">{content.newsletterTitle}</h2>
                <p className="text-lg mb-8" style={{color: 'var(--neutral-light)'}}>
                  {content.newsletterDescription}
                </p>
                
                {subscribed ? (
                  <div className="dance-card" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                    <div className="text-4xl mb-2">✅</div>
                    <p className="text-lg font-semibold">Thanks for subscribing!</p>
                    <p style={{color: 'var(--neutral-light)'}}>Check your email for confirmation</p>
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit} className="max-w-lg mx-auto">
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email address"
                        className="flex-1 px-6 py-4 rounded-xl focus:outline-none focus:ring-2 border-0"
                        style={{color: 'var(--primary-dark)', backgroundColor: 'var(--neutral-light)', focusRingColor: 'rgba(255, 255, 255, 0.5)'}}
                        required
                      />
                      <button
                        type="submit"
                        className="dance-btn dance-btn-accent hover:transform hover:scale-105 transition-all duration-300"
                      >
                        🚀 Subscribe
                      </button>
                    </div>
                  </form>
                )}
                
                <div className="dance-card-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', marginTop: '2rem'}}>
                  {content.newsletterBenefits.map((benefit, index) => (
                    <div key={index} className="dance-card text-center" style={{background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.2)'}}>
                      <span className="text-2xl mb-2 block">{benefit.icon}</span>
                      <span className="text-sm font-medium">{benefit.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      {/* Final CTA Section */}
      <section className="dance-cta">
        <div 
          className="dance-hero-background"
          style={{
            opacity: 0.1
          }}
        ></div>
        <div className="dance-container">
          <div className="text-center">
            <div className="dance-badge mb-6">
              <span className="mr-2">🎆</span>
              <span className="text-sm font-medium">{content.ctaBadgeText}</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 dance-font">
              {content.ctaTitle.split(' ').slice(0, -2).join(' ')} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">{content.ctaTitle.split(' ').slice(-2).join(' ')}</span>
            </h2>
            <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{color: 'var(--neutral-light)'}}>
              {content.ctaDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link 
                href={content.ctaButtons.primary.href}
                className="dance-btn dance-btn-accent hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                {content.ctaButtons.primary.text}
              </Link>
              <Link 
                href={content.ctaButtons.secondary.href}
                className="dance-btn dance-btn-outline hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
              >
                {content.ctaButtons.secondary.text}
              </Link>
            </div>
            
            <div className="dance-card-grid">
              {content.ctaFeatures.map((feature, index) => (
                <div key={index} className="group text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{feature.icon}</div>
                  <h4 className="font-bold text-white mb-2">{feature.title}</h4>
                  <p className="text-sm" style={{color: 'var(--neutral-light)'}}>{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
