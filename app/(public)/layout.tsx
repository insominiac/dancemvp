'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslation } from 'react-i18next'
import FloatingCTA from './components/FloatingCTA'
import UrgencyBanner from './components/UrgencyBanner'
import LanguageSwitcher from '../components/LanguageSwitcher'
import ForumLink from '../components/ForumLink'
import TranslatedText from '../components/TranslatedText'
import { useAuth } from '../lib/auth-context'
import '@/lib/i18n'
import { LogIn as LogInIcon, UserPlus } from 'lucide-react'

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
  const { user, isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [theme, setTheme] = useState('sunset')
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [isBannerVisible, setIsBannerVisible] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false)
  const authMenuRef = useRef<HTMLDivElement>(null)
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
    setIsAuthMenuOpen(false)   // Close auth menu on route change
  }, [pathname])

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!authMenuRef.current) return
      if (!authMenuRef.current.contains(e.target as Node)) {
        setIsAuthMenuOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsAuthMenuOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    const loadSiteSettings = async () => {
      try {
        const response = await fetch('/api/public/content/settings', { cache: 'no-store' })
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
          <Link href="/" className="dance-logo">{siteSettings?.siteName || (isMounted ? t('nav.siteName') : 'DanceLink')}</Link>
          <div className="flex items-center gap-8">
            <ul className={`dance-nav-menu ${isMobileMenuOpen ? 'active' : ''}`}>
              <li><Link href="/" className="dance-nav-link">{isMounted ? t('nav.home') : 'Home'}</Link></li>
              <li><Link href="/classes" className="dance-nav-link">{isMounted ? t('nav.classes') : 'Classes'}</Link></li>
              <li><Link href="/events" className="dance-nav-link">{isMounted ? t('nav.events') : 'Events'}</Link></li>
              <li><Link href="/instructors" className="dance-nav-link">{isMounted ? t('nav.instructors') : 'Instructors'}</Link></li>
              <li><Link href="/partner-match" className="dance-nav-link">{isMounted ? t('nav.partnerMatch') : 'Partner Match'}</Link></li>
              <li><ForumLink className="dance-nav-link">{isMounted ? t('nav.forum') : 'Forum'}</ForumLink></li>
              <li><Link href="/about" className="dance-nav-link">{isMounted ? t('nav.about') : 'About'}</Link></li>
              <li><Link href="/contact" className="dance-nav-link">{isMounted ? t('nav.contact') : 'Contact'}</Link></li>
              <li><Link href="/become-a-host" className="dance-nav-link">{isMounted ? t('nav.becomeHost') : 'Become a Host'}</Link></li>
              {/* Mobile Auth (hide when logged in) */}
              {isMounted && !isAuthenticated && (
                <li className="md:hidden border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 space-y-3">
                    <div className="space-y-2">
                      <Link 
                        href="/login"
                        className="block text-center text-gray-700 hover:text-purple-600 transition-colors font-medium py-2"
                      >
                        Sign In
                      </Link>
                      <Link 
                        href="/register"
                        className="dance-btn dance-btn-primary text-base px-4 py-3 block text-center"
                      >
                        Join Now
                      </Link>
                    </div>
                  </div>
                </li>
              )}
              <li className="md:hidden pt-4 mt-4">
                <div className="px-4">
                  <Link href="/become-a-host" className="dance-btn dance-btn-primary w-full text-center">{isMounted ? t('nav.becomeHost') : 'Become a Host'}</Link>
                </div>
              </li>
              <li className="md:hidden border-t border-gray-200 pt-4 mt-4">
                <div className="px-4">
                  <LanguageSwitcher />
                </div>
              </li>
            </ul>
            
            {/* Language Switcher beside navigation */}
            <div className="hidden md:flex items-center gap-4">
              {/* Auth links (hide logged-in details and dashboard) */}
              {!isAuthenticated ? (
                <div className="relative" ref={authMenuRef}>
                  <button
                    onClick={() => setIsAuthMenuOpen((v) => !v)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-700 hover:text-purple-600 hover:border-purple-300 transition-colors"
                    aria-haspopup="menu"
                    aria-expanded={isAuthMenuOpen}
                    aria-label="Open account menu"
                  >
                    <span className="hidden sm:inline">Account</span>
                    <svg className={`w-4 h-4 transition-transform ${isAuthMenuOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.24 4.5a.75.75 0 01-1.08 0l-4.24-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
                    </svg>
                  </button>

                  {isAuthMenuOpen && (
                    <div
                      role="menu"
                      aria-label="Account menu"
                      className="absolute right-0 mt-2 w-52 rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black/5 z-50 overflow-hidden"
                    >
                      <div className="py-1">
                        <Link
                          href="/login"
                          className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                          onClick={() => setIsAuthMenuOpen(false)}
                        >
                          <span className="inline-flex items-center">
                            <LogInIcon className="w-4 h-4 mr-2 text-gray-500" />
                            {isMounted ? t('ui.logIn') : 'Log In'}
                          </span>
                        </Link>
                        <Link
                          href="/register"
                          className="block px-4 py-2 text-base text-gray-700 hover:bg-gray-50"
                          role="menuitem"
                          onClick={() => setIsAuthMenuOpen(false)}
                        >
                          <span className="inline-flex items-center">
                            <UserPlus className="w-4 h-4 mr-2 text-gray-500" />
                            {isMounted ? t('ui.signUp') : 'Sign Up'}
                          </span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              ) : null}
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

      {/* Dynamic Footer */}
      {siteSettings?.footer?.enabled !== false && (
        <footer 
          className={`footer text-white py-12 mt-auto ${
            siteSettings?.footer?.backgroundColor === 'gray-800' ? 'bg-gray-800' :
            siteSettings?.footer?.backgroundColor === 'gray-700' ? 'bg-gray-700' :
            siteSettings?.footer?.backgroundColor === 'purple-900' ? 'bg-purple-900' :
            siteSettings?.footer?.backgroundColor === 'blue-900' ? 'bg-blue-900' :
            siteSettings?.footer?.backgroundColor === 'black' ? 'bg-black' :
            'bg-gray-900'
          }`}
        >
          <div className={`dance-container ${
            siteSettings?.footer?.layout === 'columns' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8' :
            siteSettings?.footer?.layout === 'compact' ? 'flex flex-col md:flex-row justify-between items-center' :
            'text-center'
          }`}>
            
            {/* Newsletter Section */}
            {siteSettings?.footer?.newsletter?.enabled && siteSettings?.footer?.layout === 'columns' && (
              <div className="footer-section">
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--primary-gold)'}}>
                  <TranslatedText text={siteSettings.footer.newsletter.title} fallback={siteSettings.footer.newsletter.title} />
                </h3>
                <p className="text-gray-300 text-sm mb-4">
                  <TranslatedText text={siteSettings.footer.newsletter.description} fallback={siteSettings.footer.newsletter.description} />
                </p>
                <div className="flex">
                  <input
                    type="email"
                    placeholder={isMounted ? t('footer.emailPlaceholder') : 'Enter your email'}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-l text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                  <button className="px-4 py-2 bg-yellow-500 text-black rounded-r hover:bg-yellow-400 transition-colors">
                    <TranslatedText text={siteSettings.footer.newsletter.buttonText} fallback={siteSettings.footer.newsletter.buttonText} />
                  </button>
                </div>
              </div>
            )}

            {/* Quick Links */}
            {siteSettings?.footer?.showQuickLinks && siteSettings?.footer?.quickLinks?.length > 0 && siteSettings?.footer?.layout === 'columns' && (
              <div className="footer-section">
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--primary-gold)'}}>
                  {isMounted ? t('footer.quickLinks') : 'Quick Links'}
                </h3>
                <ul className="space-y-2">
                  {siteSettings.footer.quickLinks.map((link, index) => (
                    <li key={index}>
                      <Link 
                        href={link.url}
                        target={link.openInNewTab ? '_blank' : undefined}
                        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                        className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-sm"
                      >
                        <TranslatedText text={link.title} fallback={link.title} />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Contact Information */}
            {siteSettings?.footer?.showContact && siteSettings?.footer?.layout === 'columns' && (
              <div className="footer-section">
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--primary-gold)'}}>
                  {siteSettings?.footer?.contactSection?.title 
                    ? <TranslatedText text={siteSettings.footer.contactSection.title} fallback={siteSettings.footer.contactSection.title} />
                    : (isMounted ? t('footer.getInTouch') : 'Get in Touch')}
                </h3>
                <div className="space-y-2 text-sm text-gray-300">
                  {siteSettings?.footer?.contactSection?.showEmail && siteSettings?.contactEmail && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                      </svg>
                      {siteSettings.contactEmail}
                    </p>
                  )}
                  {siteSettings?.footer?.contactSection?.showPhone && siteSettings?.phoneNumber && (
                    <p className="flex items-center">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                      </svg>
                      {siteSettings.phoneNumber}
                    </p>
                  )}
                  {siteSettings?.footer?.contactSection?.showAddress && siteSettings?.address && (
                    <p className="flex items-start">
                      <svg className="w-4 h-4 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/>
                      </svg>
                      {siteSettings.address}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {siteSettings?.footer?.showSocialLinks && siteSettings?.footer?.layout === 'columns' && (
              <div className="footer-section">
                <h3 className="text-lg font-semibold mb-4" style={{color: 'var(--primary-gold)'}}>
                  {siteSettings?.footer?.socialLinksTitle 
                    ? <TranslatedText text={siteSettings.footer.socialLinksTitle} fallback={siteSettings.footer.socialLinksTitle} />
                    : (isMounted ? t('footer.followUs') : 'Follow Us')}
                </h3>
                <div className="flex flex-wrap gap-4">
                  {siteSettings?.socialMedia?.facebook && (
                    <a href={siteSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                       className="social-link hover:text-yellow-300 transition-colors duration-300"
                       aria-label="Facebook">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {siteSettings?.socialMedia?.instagram && (
                    <a href={siteSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" 
                       className="social-link hover:text-yellow-300 transition-colors duration-300"
                       aria-label="Instagram">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.435-3.396-1.168-.949-.734-1.423-1.647-1.423-2.738 0-.734.18-1.297.54-1.689.36-.393.81-.589 1.35-.589.54 0 .99.196 1.35.589.36.392.54.955.54 1.689 0 1.091-.474 2.004-1.423 2.738-.948.733-2.099 1.168-3.396 1.168z"/>
                      </svg>
                    </a>
                  )}
                  {siteSettings?.socialMedia?.twitter && (
                    <a href={siteSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" 
                       className="social-link hover:text-yellow-300 transition-colors duration-300"
                       aria-label="Twitter">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                      </svg>
                    </a>
                  )}
                  {siteSettings?.socialMedia?.youtube && (
                    <a href={siteSettings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" 
                       className="social-link hover:text-yellow-300 transition-colors duration-300"
                       aria-label="YouTube">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                      </svg>
                    </a>
                  )}
                  {siteSettings?.socialMedia?.tiktok && (
                    <a href={siteSettings.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" 
                       className="social-link hover:text-yellow-300 transition-colors duration-300"
                       aria-label="TikTok">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                      </svg>
                    </a>
                  )}
                  {siteSettings?.socialMedia?.linkedin && (
                    <a href={siteSettings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="social-link hover:text-yellow-300 transition-colors duration-300"
                       aria-label="LinkedIn">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Centered Layout Content */}
            {siteSettings?.footer?.layout === 'centered' && (
              <div className="text-center w-full">
                {/* Tagline */}
                {siteSettings?.footer?.showTagline && siteSettings?.footer?.tagline && (
                  <p className="text-lg mb-6" style={{color: 'var(--primary-gold)'}}>
                    <TranslatedText text={siteSettings.footer.tagline} fallback={siteSettings.footer.tagline} />
                  </p>
                )}
                
                {/* Social Links */}
                {siteSettings?.footer?.showSocialLinks && (
                  <div className="social-links flex justify-center gap-8 mb-8">
                    {siteSettings?.socialMedia?.facebook && (
                      <a href={siteSettings.socialMedia.facebook} target="_blank" rel="noopener noreferrer" 
                         className="social-link hover:text-yellow-300 transition-colors duration-300"
                         aria-label="Facebook">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                    )}
                    {siteSettings?.socialMedia?.instagram && (
                      <a href={siteSettings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" 
                         className="social-link hover:text-yellow-300 transition-colors duration-300"
                         aria-label="Instagram">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987 6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.435-3.396-1.168-.949-.734-1.423-1.647-1.423-2.738 0-.734.18-1.297.54-1.689.36-.393.81-.589 1.35-.589.54 0 .99.196 1.35.589.36.392.54.955.54 1.689 0 1.091-.474 2.004-1.423 2.738-.948.733-2.099 1.168-3.396 1.168z"/>
                        </svg>
                      </a>
                    )}
                    {siteSettings?.socialMedia?.twitter && (
                      <a href={siteSettings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" 
                         className="social-link hover:text-yellow-300 transition-colors duration-300"
                         aria-label="Twitter">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                        </svg>
                      </a>
                    )}
                    {siteSettings?.socialMedia?.youtube && (
                      <a href={siteSettings.socialMedia.youtube} target="_blank" rel="noopener noreferrer" 
                         className="social-link hover:text-yellow-300 transition-colors duration-300"
                         aria-label="YouTube">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </a>
                    )}
                    {siteSettings?.socialMedia?.tiktok && (
                      <a href={siteSettings.socialMedia.tiktok} target="_blank" rel="noopener noreferrer" 
                         className="social-link hover:text-yellow-300 transition-colors duration-300"
                         aria-label="TikTok">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                        </svg>
                      </a>
                    )}
                    {siteSettings?.socialMedia?.linkedin && (
                      <a href={siteSettings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" 
                         className="social-link hover:text-yellow-300 transition-colors duration-300"
                         aria-label="LinkedIn">
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      </a>
                    )}
                  </div>
                )}
                
                {/* Quick Links for centered layout */}
                {siteSettings?.footer?.showQuickLinks && siteSettings?.footer?.quickLinks?.length > 0 && (
                  <div className="flex flex-wrap justify-center gap-4 mb-6">
                    {siteSettings.footer.quickLinks.map((link, index) => (
                      <Link 
                        key={index}
                        href={link.url}
                        target={link.openInNewTab ? '_blank' : undefined}
                        rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                        className="text-gray-300 hover:text-yellow-300 transition-colors duration-300 text-sm"
                      >
                        <TranslatedText text={link.title} fallback={link.title} />
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Custom HTML */}
            {siteSettings?.footer?.customHTML && (
              <div 
                className="custom-footer-content"
                dangerouslySetInnerHTML={{ __html: siteSettings.footer.customHTML }}
              />
            )}
          </div>
          
          {/* Copyright - Always at bottom */}
          <div className={`border-t border-gray-700 mt-8 pt-6 text-center ${
            siteSettings?.footer?.layout === 'compact' ? 'mt-4 pt-4' : ''
          }`}>
            <p className="footer-text text-gray-400 text-sm">
              {siteSettings?.footer?.customCopyrightText || (
                `© ${siteSettings?.footer?.copyrightYear || new Date().getFullYear()} ${siteSettings?.siteName || (isMounted ? t('nav.siteName') : 'DanceLink')}. ${siteSettings?.footer?.copyrightText || (isMounted ? t('footer.allRightsReserved') : 'All rights reserved.')}`
              )}
            </p>
          </div>
        </footer>
      )}
    </div>
  )
}
