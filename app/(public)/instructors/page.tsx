'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

interface Instructor {
  id: string
  name: string
  bio: string
  specialties: string
  experience: string
  imageUrl: string
  email: string
  phone: string
  socialLinks: any
  isActive: boolean
  classCount: number
  activeClasses: Array<{
    id: string
    title: string
    level: string
    isPrimary: boolean
  }>
  specialtiesArray: string[]
}

interface InstructorsPageContent {
  heroBadgeText: string
  heroTitle: string
  heroSubtitle: string
  heroFeatures: Array<{ icon: string; text: string }>
  statsSection: {
    title: string
    subtitle: string
    labels: {
      instructorsLabel: string
      classesLabel: string
      experienceLabel: string
    }
  }
  noInstructorsSection: {
    icon: string
    title: string
    subtitle: string
    buttonText: string
    buttonHref: string
  }
  errorSection: {
    icon: string
    subtitle: string
    buttonText: string
  }
  ctaSection: {
    badgeText: string
    title: string
    subtitle: string
    buttons: Array<{ text: string; href: string; isPrimary: boolean }>
    features: Array<{ icon: string; title: string; description: string }>
  }
}

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [pageContent, setPageContent] = useState<InstructorsPageContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch both instructors and page content in parallel
        const [instructorsResponse, contentResponse] = await Promise.all([
          fetch('/api/public/instructors'),
          fetch('/api/admin/content/instructors')
        ])
        
        if (instructorsResponse.ok) {
          const instructorsData = await instructorsResponse.json()
          setInstructors(instructorsData.instructors)
        } else {
          setError('Failed to load instructor data')
        }
        
        if (contentResponse.ok) {
          const contentData = await contentResponse.json()
          setPageContent(contentData.content)
        }
        // If content fails to load, we'll use fallback text in the render
        
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to load page data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getPlaceholderImage = (name: string) => {
    // Generate placeholder image based on name
    const colors = ['3B82F6', '8B5CF6', 'EF4444', '10B981', 'F59E0B', '6366F1']
    const colorIndex = name.length % colors.length
    const color = colors[colorIndex]
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return `https://ui-avatars.com/api/?name=${initials}&background=${color}&color=fff&size=300&font-size=0.6`
  }

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-200px)]" style={{background: 'var(--neutral-light)'}}>
        {/* Hero Section - Shorter Version */}
        <section 
          className="relative py-12 md:py-16 overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, var(--hero-overlay) 0%, var(--hero-overlay) 100%)'
          }}
        >
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 5 L35 15 L45 15 L37.5 22.5 L40 32.5 L30 25 L20 32.5 L22.5 22.5 L15 15 L25 15 Z" fill="%23d4af37" fill-opacity="0.3"/%3E%3C/svg%3E")',
              backgroundSize: '30px 30px'
            }}
          ></div>
          
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-8 left-10 text-2xl opacity-10 animate-pulse">👨‍🏫</div>
            <div className="absolute top-12 right-10 text-2xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}>✨</div>
            <div className="absolute bottom-8 left-1/2 text-2xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}>🎆</div>
          </div>
          
          <div className="relative z-10 dance-container text-center text-white">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white mb-4">
              <span className="mr-2">👨‍🏫</span>
              <span className="text-sm font-medium">{pageContent?.heroBadgeText || "Meet Our Expert Team"}</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 dance-font">
              {pageContent?.heroTitle || "Our"} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">Instructors</span>
            </h1>
            
            <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
              {pageContent?.heroSubtitle || "Meet the talented professionals behind our classes. Experienced, passionate, and dedicated to helping you achieve your dance goals."}
            </p>
          </div>
        </section>
        
        <div className="dance-container py-16 flex-grow flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mb-4 mx-auto" style={{borderBottomColor: 'var(--primary-gold)'}}></div>
            <p className="text-gray-600">Loading instructors...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-800 opacity-90"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}></div>
          <div className="relative px-6 lg:px-8 py-24 sm:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white mb-6">
                <span className="mr-2">👨‍🏫</span>
                <span className="text-sm font-medium">{pageContent?.heroBadgeText || "Meet Our Expert Team"}</span>
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 dance-font">
                {pageContent?.heroTitle || "Our"} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">Instructors</span>
              </h1>
              <p className="text-xl sm:text-2xl text-purple-100 mb-8 max-w-3xl mx-auto leading-relaxed">
                {pageContent?.heroSubtitle || "Meet the talented professionals behind our classes. Experienced, passionate, and dedicated to helping you achieve your dance goals."}
              </p>
            </div>
          </div>
        </section>
        
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center border border-red-200">
            <div className="text-6xl mb-4">{pageContent?.errorSection.icon || "⚠️"}</div>
            <p className="text-red-600 text-lg font-semibold mb-2">{error}</p>
            <p className="text-gray-500">{pageContent?.errorSection.subtitle || "Please try refreshing the page or contact support if the issue persists."}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {pageContent?.errorSection.buttonText || "Try Again"}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-200px)]" style={{background: 'var(--neutral-light)'}}>
      {/* Hero Section - Shorter Version */}
      <section 
        className="relative py-12 md:py-16 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, var(--hero-overlay) 0%, var(--hero-overlay) 100%)'
        }}
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M30 5 L35 15 L45 15 L37.5 22.5 L40 32.5 L30 25 L20 32.5 L22.5 22.5 L15 15 L25 15 Z" fill="%23d4af37" fill-opacity="0.3"/%3E%3C/svg%3E")',
            backgroundSize: '30px 30px'
          }}
        ></div>
        
        {/* Floating elements - positioned for shorter section */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-8 left-10 text-2xl opacity-10 animate-pulse">👨‍🏫</div>
          <div className="absolute top-12 right-10 text-2xl opacity-10 animate-pulse" style={{animationDelay: '1s'}}>✨</div>
          <div className="absolute bottom-8 left-1/2 text-2xl opacity-10 animate-pulse" style={{animationDelay: '2s'}}>🎆</div>
        </div>
        
        <div className="relative z-10 dance-container text-center text-white">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white mb-4">
            <span className="mr-2">👨‍🏫</span>
            <span className="text-sm font-medium">{pageContent?.heroBadgeText || "Meet Our Expert Team"}</span>
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 dance-font">
            {pageContent?.heroTitle || "Our"} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">Instructors</span>
          </h1>
          
          <p className="text-base md:text-lg text-white/90 mb-6 max-w-2xl mx-auto leading-relaxed">
            {pageContent?.heroSubtitle || `Meet the ${instructors.length} talented professionals behind our classes. Experienced, passionate, and dedicated to helping you achieve your dance goals.`}
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {(pageContent?.heroFeatures || [
              { icon: "🎭", text: "Expert instructors" },
              { icon: "🏆", text: "Years of experience" },
              { icon: "✨", text: "Personalized guidance" }
            ]).map((feature, index) => (
              <div key={index} className="flex items-center">
                {index > 0 && <div className="hidden sm:block text-white/40 mx-4">•</div>}
                <div className="flex items-center text-white/90">
                  <span className="mr-2">{feature.icon}</span>
                  <span className="font-medium">{feature.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16">
        <div className="dance-container">
          {instructors.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl shadow-lg p-12 max-w-md mx-auto border border-gray-100">
                <div className="text-6xl mb-4">{pageContent?.noInstructorsSection.icon || "👨‍🏫"}</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{pageContent?.noInstructorsSection.title || "No Instructors Available"}</h3>
                <p className="text-lg mb-6 text-gray-600">
                  {pageContent?.noInstructorsSection.subtitle || "We're currently updating our instructor profiles. Please check back soon!"}
                </p>
                <Link
                  href={pageContent?.noInstructorsSection.buttonHref || "/classes"}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {pageContent?.noInstructorsSection.buttonText || "View Classes"}
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Stats Section */}
              <div className="dance-section-header mb-16">
                <h2 className="dance-section-title">{pageContent?.statsSection.title || "Our Teaching Excellence"}</h2>
                <p className="max-w-2xl mx-auto mb-12">{pageContent?.statsSection.subtitle || "Meet our diverse team of professional dance instructors, each bringing unique expertise and passion to every class"}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="text-4xl font-bold mb-2 text-indigo-600">{instructors.length}</div>
                    <div className="text-gray-700 font-medium">{pageContent?.statsSection.labels.instructorsLabel || "Expert Instructors"}</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="text-4xl font-bold mb-2 text-emerald-600">
                      {instructors.reduce((sum, instructor) => sum + instructor.classCount, 0)}
                    </div>
                    <div className="text-gray-700 font-medium">{pageContent?.statsSection.labels.classesLabel || "Active Classes"}</div>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 text-center border border-gray-100 hover:shadow-xl transition-shadow duration-300">
                    <div className="text-4xl font-bold mb-2 text-purple-600">
                      {Math.round(instructors.reduce((sum, instructor) => sum + parseFloat(instructor.experience || '0'), 0) / instructors.length) || 0}+
                    </div>
                    <div className="text-gray-700 font-medium">{pageContent?.statsSection.labels.experienceLabel || "Years Experience"}</div>
                  </div>
                </div>
              </div>

              {/* Instructors Grid */}
              <div className="dance-card-grid mb-16">
                {instructors.map((instructor) => (
                  <div key={instructor.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group hover:-translate-y-1">
                    {/* Instructor Header */}
                    <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-50 to-indigo-100">
                      <div className="flex flex-col items-center">
                        <div className="relative mb-4">
                          <img
                            src={instructor.imageUrl || getPlaceholderImage(instructor.name)}
                            alt={instructor.name}
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md group-hover:scale-105 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement
                              target.src = getPlaceholderImage(instructor.name)
                            }}
                          />
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                            <span className="text-white text-xs font-bold">✓</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-1 text-center">
                          {instructor.name}
                        </h3>
                        {instructor.experience && (
                          <p className="text-indigo-600 text-sm font-medium px-3 py-1 bg-indigo-100 rounded-full">
                            {instructor.experience} Experience
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {/* Instructor Content */}
                    <div className="p-6">
                      {/* Bio */}
                      {instructor.bio && (
                        <p className="text-gray-600 mb-6 leading-relaxed text-sm">
                          {instructor.bio.length > 120 
                            ? `${instructor.bio.substring(0, 120)}...` 
                            : instructor.bio}
                        </p>
                      )}
                  
                      {/* Specialties */}
                      {instructor.specialtiesArray.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold mb-3 text-gray-700 uppercase tracking-wider">Specialties</p>
                          <div className="flex flex-wrap gap-2">
                            {instructor.specialtiesArray.slice(0, 5).map((specialty, index) => {
                              const colors = [
                                'bg-blue-100 text-blue-700 border-blue-200',
                                'bg-purple-100 text-purple-700 border-purple-200', 
                                'bg-emerald-100 text-emerald-700 border-emerald-200',
                                'bg-orange-100 text-orange-700 border-orange-200',
                                'bg-pink-100 text-pink-700 border-pink-200'
                              ]
                              const colorClass = colors[index % colors.length]
                              return (
                                <span 
                                  key={index} 
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${colorClass}`}
                                >
                                  {specialty}
                                </span>
                              )
                            })}
                            {instructor.specialtiesArray.length > 5 && (
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                                +{instructor.specialtiesArray.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                  
                      {/* Classes Info */}
                      <div className="mb-6">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div className="rounded-xl p-4 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                            <div className="text-2xl font-bold text-blue-600">
                              {instructor.classCount}
                            </div>
                            <div className="text-xs font-medium text-blue-700">Active Classes</div>
                          </div>
                          <div className="rounded-xl p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200">
                            <div className="text-2xl font-bold text-emerald-600">
                              {instructor.activeClasses.filter(c => c.isPrimary).length}
                            </div>
                            <div className="text-xs font-medium text-emerald-700">Lead Instructor</div>
                          </div>
                        </div>
                      </div>
                  
                      {/* Active Classes */}
                      {instructor.activeClasses.length > 0 && (
                        <div className="mb-6">
                          <p className="text-xs font-semibold mb-3 text-gray-700 uppercase tracking-wider">Current Classes</p>
                          <div className="space-y-2">
                            {instructor.activeClasses.slice(0, 3).map((cls) => (
                              <Link 
                                key={cls.id} 
                                href={`/classes/${cls.id}`}
                                className="block p-3 rounded-lg text-sm transition-all duration-300 border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 bg-gray-50 hover:transform hover:translate-x-1"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-gray-900">{cls.title}</span>
                                  {cls.isPrimary && (
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full border border-amber-200 font-medium">
                                      ⭐ Lead
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-600 mt-1">Level: {cls.level}</div>
                              </Link>
                            ))}
                            {instructor.activeClasses.length > 3 && (
                              <div className="text-center">
                                <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 font-medium">
                                  +{instructor.activeClasses.length - 3} more classes
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                  
                      {/* Contact Buttons */}
                      <div className="flex gap-3 pt-2">
                        <Link 
                          href={`/classes?instructor=${instructor.name}`}
                          className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-xl text-center text-sm transition-all duration-300 hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:-translate-y-0.5"
                        >
                          View Classes
                        </Link>
                        {instructor.email && (
                          <Link 
                            href={`mailto:${instructor.email}`}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-300 flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:-translate-y-0.5"
                            title="Contact instructor"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      
      {/* CTA Section */}
      {instructors.length > 0 && (
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
                <span className="mr-2">👨‍🏫</span>
                <span className="text-sm font-medium">{pageContent?.ctaSection.badgeText || "Start Your Journey"}</span>
              </div>
              <h3 className="text-4xl sm:text-5xl font-bold text-white mb-6 dance-font">
                {pageContent?.ctaSection.title || "Ready to"} <span className="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent dance-font">Learn?</span>
              </h3>
              <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto leading-relaxed" style={{color: 'var(--neutral-light)'}}>
                {pageContent?.ctaSection.subtitle || "Join our expert instructors and discover the joy of dance. From beginner-friendly classes to advanced techniques, we have the perfect class for you."}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {(pageContent?.ctaSection.buttons || [
                  { text: "🎆 Browse All Classes", href: "/classes", isPrimary: true },
                  { text: "📞 Schedule a Trial Class", href: "/contact", isPrimary: false }
                ]).map((button, index) => (
                  <Link 
                    key={index}
                    href={button.href}
                    className={button.isPrimary 
                      ? "dance-btn dance-btn-accent hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                      : "dance-btn dance-btn-outline hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
                    }
                  >
                    {button.text}
                  </Link>
                ))}
              </div>
              
              <div className="dance-card-grid">
                {(pageContent?.ctaSection.features || [
                  { icon: "🎨", title: "Personalized Instruction", description: "Get individual attention and customized feedback from our expert instructors" },
                  { icon: "🎭", title: "Multiple Dance Styles", description: "Learn from specialists in ballet, hip-hop, contemporary, salsa, and more" },
                  { icon: "🎆", title: "All Skill Levels", description: "Whether you're a complete beginner or advanced dancer, find your perfect class" }
                ]).map((feature, index) => (
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
      )}
    </div>
  )
}