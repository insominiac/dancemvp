'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import cssStyles from './DanceStylesTabs.module.css'

interface DanceStyle {
  id: string
  name: string
  category: string
  classCount: number
  eventCount: number
  studentCount: number
  totalCount: number
  icon: string
  subtitle: string
  description: string
  difficulty: string
  origin: string
  musicStyle: string
  characteristics: string[]
}

interface DanceStylesTabsProps {
  danceStyles?: DanceStyle[]
  className?: string
}

export default function DanceStylesTabs({ danceStyles, className = '' }: DanceStylesTabsProps) {
  const [activeTab, setActiveTab] = useState<string>('')
  const [isLoading, setIsLoading] = useState(!danceStyles?.length)
  const [styles, setStyles] = useState<DanceStyle[]>(danceStyles || [])
  const [isMounted, setIsMounted] = useState(false)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsMounted(true)
    
    if (!danceStyles?.length) {
      fetchDanceStyles()
    } else {
      setStyles(danceStyles)
      if (danceStyles.length > 0) {
        setActiveTab(danceStyles[0].id)
      }
      setIsLoading(false)
    }
  }, [danceStyles])

  const fetchDanceStyles = async () => {
    try {
      const response = await fetch('/api/public/dance-styles')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setStyles(data.data.styles)
          if (data.data.styles.length > 0) {
            setActiveTab(data.data.styles[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching dance styles:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabClick = (styleId: string) => {
    setActiveTab(styleId)
    // Scroll the clicked tab into view
    const tabElement = document.getElementById(`tab-${styleId}`)
    if (tabElement && scrollContainerRef.current) {
      const container = scrollContainerRef.current
      const tabRect = tabElement.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()
      
      if (tabRect.left < containerRect.left) {
        container.scrollLeft -= (containerRect.left - tabRect.left + 20)
      } else if (tabRect.right > containerRect.right) {
        container.scrollLeft += (tabRect.right - containerRect.right + 20)
      }
    }
  }

  const updateScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' })
    }
  }

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    updateScrollButtons()
    
    const handleResize = () => updateScrollButtons()
    const handleScroll = () => updateScrollButtons()
    
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
      window.addEventListener('resize', handleResize)
      
      return () => {
        container.removeEventListener('scroll', handleScroll)
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [styles])

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent, styleId: string) => {
    const currentIndex = styles.findIndex(style => style.id === styleId)
    let newIndex = currentIndex

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault()
        newIndex = currentIndex > 0 ? currentIndex - 1 : styles.length - 1
        break
      case 'ArrowRight':
        event.preventDefault()
        newIndex = currentIndex < styles.length - 1 ? currentIndex + 1 : 0
        break
      case 'Home':
        event.preventDefault()
        newIndex = 0
        break
      case 'End':
        event.preventDefault()
        newIndex = styles.length - 1
        break
      default:
        return
    }

    const newStyle = styles[newIndex]
    if (newStyle) {
      handleTabClick(newStyle.id)
      // Focus the new tab
      setTimeout(() => {
        document.getElementById(`tab-${newStyle.id}`)?.focus()
      }, 50)
    }
  }

  const activeStyle = styles.find(style => style.id === activeTab)

  // Don't render dynamic content during SSR to avoid hydration mismatch
  if (!isMounted) {
    return (
      <section className={`py-20 ${className}`} style={{
        background: 'linear-gradient(135deg, var(--neutral-light) 0%, var(--white) 100%)',
        position: 'relative'
      }}>
        <div className="dance-container">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>
              Discover Our Dance Styles
            </h2>
            <p className="text-xl opacity-70" style={{ color: 'var(--neutral-gray)' }}>
              Loading our amazing dance styles...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-gold)' }}></div>
          </div>
        </div>
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className={`py-20 ${className}`} style={{
        background: 'linear-gradient(135deg, var(--neutral-light) 0%, var(--white) 100%)',
        position: 'relative'
      }}>
        <div className="dance-container">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>
              Discover Our Dance Styles
            </h2>
            <p className="text-xl opacity-70" style={{ color: 'var(--neutral-gray)' }}>
              Loading our amazing dance styles...
            </p>
          </div>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: 'var(--primary-gold)' }}></div>
          </div>
        </div>
      </section>
    )
  }

  if (!styles.length) {
    return (
      <section className={`py-20 ${className}`} style={{
        background: 'linear-gradient(135deg, var(--neutral-light) 0%, var(--white) 100%)',
        position: 'relative'
      }}>
        <div className="dance-container">
          <div className="text-center">
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>
              Discover Our Dance Styles
            </h2>
            <p className="text-xl opacity-70" style={{ color: 'var(--neutral-gray)' }}>
              No dance styles available at the moment.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={`py-20 ${className}`} style={{
      background: 'linear-gradient(135deg, var(--neutral-light) 0%, var(--white) 100%)',
      position: 'relative'
    }}>
        <div className="dance-container">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4" style={{ color: 'var(--primary-dark)' }}>
              Discover Our Dance Styles
            </h2>
            <p className="text-xl italic" style={{ color: 'var(--neutral-gray)' }}>
              Choose Your Perfect Dance Journey
            </p>
          </div>

          {/* Enhanced Tab Navigation with Horizontal Scroll */}
          <div className={cssStyles.danceTabNavigation}>
            <div className={cssStyles.tabScrollContainer}>
              {/* Left Scroll Button */}
              <button
                className={`${cssStyles.scrollButton} ${cssStyles.scrollLeft} ${!canScrollLeft ? cssStyles.disabled : ''}`}
                onClick={scrollLeft}
                disabled={!canScrollLeft}
                aria-label="Scroll tabs left"
                title="Scroll left"
              >
                ←
              </button>
              
              {/* Left Scroll Indicator */}
              <div className={`${cssStyles.scrollIndicator} ${cssStyles.scrollIndicatorLeft} ${!canScrollLeft ? cssStyles.hidden : ''}`} />
              
              {/* Scrollable Tab Container */}
              <div 
                ref={scrollContainerRef}
                className={cssStyles.tabScrollWrapper}
                onScroll={updateScrollButtons}
                role="tablist"
                aria-label="Dance style selection"
              >
                {styles.map((style, index) => (
                  <button
                    key={style.id}
                    id={`tab-${style.id}`}
                    className={`${cssStyles.danceTabBtn} ${activeTab === style.id ? cssStyles.active : ''}`}
                    onClick={() => handleTabClick(style.id)}
                    onKeyDown={(e) => handleKeyDown(e, style.id)}
                    role="tab"
                    aria-selected={activeTab === style.id}
                    aria-controls={`panel-${style.id}`}
                    tabIndex={activeTab === style.id ? 0 : -1}
                    style={{
                      animationDelay: `${index * 0.1}s`
                    }}
                  >
                    <span role="img" aria-label={`${style.name} icon`}>{style.icon}</span>
                    <span>{style.name}</span>
                    {style.totalCount > 0 && (
                      <span 
                        className="bg-white bg-opacity-20 px-2 py-1 rounded-full text-xs"
                        aria-label={`${style.totalCount} classes available`}
                      >
                        {style.totalCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Right Scroll Indicator */}
              <div className={`${cssStyles.scrollIndicator} ${cssStyles.scrollIndicatorRight} ${!canScrollRight ? cssStyles.hidden : ''}`} />
              
              {/* Right Scroll Button */}
              <button
                className={`${cssStyles.scrollButton} ${cssStyles.scrollRight} ${!canScrollRight ? cssStyles.disabled : ''}`}
                onClick={scrollRight}
                disabled={!canScrollRight}
                aria-label="Scroll tabs right"
                title="Scroll right"
              >
                →
              </button>
            </div>
            
            {/* Mobile Touch Hint */}
            {styles.length > 3 && (
              <div className="text-center mt-2">
                <p className="text-xs text-gray-500 md:hidden">
                  💡 Swipe left or right to see more dance styles
                </p>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className={cssStyles.danceTabContent}>
            {activeStyle && (
              <div 
                className={`${cssStyles.danceTabPanel} ${cssStyles.active}`}
                id={`panel-${activeStyle.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeStyle.id}`}
              >
                <div className={cssStyles.danceHeader}>
                  <div className={cssStyles.danceIcon}>{activeStyle.icon}</div>
                  <div>
                    <h2 className="text-4xl font-bold mb-2" style={{ color: 'var(--primary-dark)' }}>
                      {activeStyle.name}
                    </h2>
                    <p className="text-xl italic" style={{ color: 'var(--neutral-gray)' }}>
                      {activeStyle.subtitle}
                    </p>
                  </div>
                </div>

                <p className="text-lg leading-relaxed mb-8" style={{ color: 'var(--neutral-gray)' }}>
                  {activeStyle.description}
                </p>

                <div className={cssStyles.danceInfoGrid}>
                  <div className={cssStyles.danceInfoCard}>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-dark)' }}>
                      📊 Style Information
                    </h3>
                    <ul className="space-y-2">
                      <li><strong>Origin:</strong> {activeStyle.origin}</li>
                      <li><strong>Difficulty:</strong> {activeStyle.difficulty}</li>
                      <li><strong>Music Style:</strong> {activeStyle.musicStyle}</li>
                      <li><strong>Category:</strong> {activeStyle.category}</li>
                    </ul>
                  </div>

                  <div className={cssStyles.danceInfoCard}>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-dark)' }}>
                      ✨ Characteristics
                    </h3>
                    <ul className="space-y-1">
                      {activeStyle.characteristics.map((char, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2" style={{ color: 'var(--primary-gold)' }}>✓</span>
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={cssStyles.danceInfoCard}>
                    <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--primary-dark)' }}>
                      📈 Availability
                    </h3>
                    <ul className="space-y-2">
                      <li><strong>Classes:</strong> {activeStyle.classCount} available</li>
                      <li><strong>Events:</strong> {activeStyle.eventCount} upcoming</li>
                      <li><strong>Students:</strong> {activeStyle.studentCount} learning</li>
                    </ul>
                  </div>
                </div>

                <div className={`${cssStyles.danceCtaSection} mt-8`}>
                  <h3 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Dancing Script, cursive' }}>
                    Ready to Start Your {activeStyle.name} Journey?
                  </h3>
                  <p className="mb-6 opacity-90">
                    Join our community of passionate dancers and discover the joy of {activeStyle.name}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      href={`/classes?style=${activeStyle.name}`}
                      className="px-8 py-3 bg-white text-gray-800 rounded-full font-semibold hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300"
                    >
                      View {activeStyle.name} Classes
                    </Link>
                    <Link 
                      href="/contact"
                      className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-800 hover:transform hover:scale-105 hover:shadow-xl transition-all duration-300"
                    >
                      Book Free Trial
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
    </section>
  )
}
