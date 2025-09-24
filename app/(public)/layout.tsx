'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import FloatingCTA from './components/FloatingCTA'
import UrgencyBanner from './components/UrgencyBanner'
import LanguageSwitcher from '../components/LanguageSwitcher'
import '../../lib/i18n' // Initialize i18n

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

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { t } = useTranslation('common')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [theme, setTheme] = useState('sunset')
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [isBannerVisible, setIsBannerVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.setAttribute('data-theme', theme)
    }
  }, [theme])

  useEffect(() => {
    // Manage body class for banner visibility
    if (isBannerVisible) {
      document.body.classList.remove('banner-hidden')
    } else {
      document.body.classList.add('banner-hidden')
    }
  }, [isBannerVisible])

  useEffect(() => {
    setIsMobileMenuOpen(false) // Close mobile menu on route change
  }, [pathname])

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await fetch('/api/public/content/settings')
        if (response.ok) {
          const settings = await response.json()
          setSiteSettings(settings)
        }
      } catch (error) {
        console.error('Error loading site settings:', error)
      }
    }
    loadSiteSettings()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Urgency Banner */}
      <UrgencyBanner onVisibilityChange={setIsBannerVisible} />
      
      <nav className={`dance-navbar ${isScrolled ? 'scrolled' : ''} ${!isBannerVisible ? 'banner-hidden' : ''}`}>
        <div className="dance-nav-container">
          <Link href="/" className="dance-logo">{siteSettings?.siteName || (isMounted ? t('nav.siteName') : 'Dance Studio')}</Link>
          <div className="flex items-center gap-8">
            <ul className={`dance-nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
              <li><Link href="/" className="dance-nav-link">{isMounted ? t('nav.home') : 'Home'}</Link></li>
              <li><Link href="/classes" className="dance-nav-link">{isMounted ? t('nav.classes') : 'Classes'}</Link></li>
              <li><Link href="/events" className="dance-nav-link">{isMounted ? t('nav.events') : 'Events'}</Link></li>
              <li><Link href="/instructors" className="dance-nav-link">{isMounted ? t('nav.instructors') : 'Instructors'}</Link></li>
              <li><Link href="/about" className="dance-nav-link">{isMounted ? t('nav.about') : 'About'}</Link></li>
              <li><Link href="/contact" className="dance-nav-link">{isMounted ? t('nav.contact') : 'Contact'}</Link></li>
              <li className="md:hidden border-t border-gray-200 pt-4 mt-4">
                <div className="px-4">
                  <LanguageSwitcher />
                </div>
              </li>
            </ul>
            
            {/* Language Switcher beside navigation */}
            <div className="hidden md:flex items-center">
              <LanguageSwitcher />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <button className="menu-toggle md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Floating CTA Button */}
      <FloatingCTA />

      <footer className="footer bg-gray-900 text-white py-12 mt-auto">
        <div className="dance-container text-center">
          <div className="social-links flex justify-center gap-8 mb-8">
            {siteSettings?.socialMedia.facebook && (
              <a href={siteSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link">FB</a>
            )}
            {siteSettings?.socialMedia.instagram && (
              <a href={siteSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link">IG</a>
            )}
            {siteSettings?.socialMedia.twitter && (
              <a href={siteSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link">TW</a>
            )}
          </div>
          <p className="footer-text text-gray-400">
            &copy; 2024 {siteSettings?.siteName || (isMounted ? t('nav.siteName') : 'Dance Studio')}. {isMounted ? t('footer.allRightsReserved') : 'All rights reserved.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
