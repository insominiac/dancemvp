'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import '../../lib/i18n' // Initialize i18n
import DanceStylesTabs from '../components/DanceStylesTabs'

interface Stats {
  students: number
  instructors: number
  classes: number
  events: number
  venues: number
  danceStyles: number
  totalBookings: number
}

interface FeaturedClass {
  id: string
  title: string
  description: string
  level: string
  price: string
  currentStudents: number
  spotsLeft: number
  classStyles: Array<{
    style: {
      name: string
      category: string
    }
  }>
  venue?: {
    name: string
    city: string
  }
}

interface PopularStyle {
  id: string
  name: string
  category: string
  _count: {
    classStyles: number
    eventStyles: number
  }
}

interface HomepageContent {
  heroTitle: string
  heroSubtitle: string
  heroButtonText: string
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

export default function HomePage() {
  const { t } = useTranslation('common')
  const [stats, setStats] = useState<Stats | null>(null)
  const [featuredClasses, setFeaturedClasses] = useState<FeaturedClass[]>([])
  const [popularStyles, setPopularStyles] = useState<PopularStyle[]>([])
  const [homepageContent, setHomepageContent] = useState<HomepageContent | null>(null)
  const [siteSettings, setSiteSettings] = useState<SiteSettings | null>(null)
  const [danceStyles, setDanceStyles] = useState<DanceStyle[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, featuredRes, homepageRes, settingsRes, danceStylesRes] = await Promise.all([
          fetch('/api/public/stats'),
          fetch('/api/public/featured'),
          fetch('/api/public/content/homepage'),
          fetch('/api/public/content/settings'),
          fetch('/api/public/dance-styles')
        ])

        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData.stats)
        }

        if (featuredRes.ok) {
          const featuredData = await featuredRes.json()
          setFeaturedClasses(featuredData.featuredClasses.slice(0, 3))
          setPopularStyles(featuredData.popularStyles.slice(0, 3))
        }

        if (homepageRes.ok) {
          const homepageData = await homepageRes.json()
          setHomepageContent(homepageData)
        }

        if (settingsRes.ok) {
          const settingsData = await settingsRes.json()
          setSiteSettings(settingsData)
        }

        if (danceStylesRes.ok) {
          const danceStylesData = await danceStylesRes.json()
          if (danceStylesData.success) {
            setDanceStyles(danceStylesData.data.styles)
          }
        }
      } catch (error) {
        console.error('Error fetching homepage data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const getStyleImage = (styleName: string) => {
    const images: { [key: string]: string } = {
      'Salsa': 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=400&auto=format&fit=crop',
      'Bachata': 'https://images.unsplash.com/photo-1508700929628-666bc8bd84ea?q=80&w=400&auto=format&fit=crop',
      'Kizomba': 'https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=400&auto=format&fit=crop',
      'Hip Hop': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=400&auto=format&fit=crop',
      'Contemporary': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?q=80&w=400&auto=format&fit=crop',
      'Ballet': 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?q=80&w=400&auto=format&fit=crop'
    }
    return images[styleName] || 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=400&auto=format&fit=crop'
  }
  return (
    <div>
      {/* Hero Section */}
      <section 
        className="dance-hero"
        style={{
          ...(homepageContent?.heroBackgroundImage && {
            background: `linear-gradient(135deg, var(--hero-overlay) 0%, var(--hero-overlay) 100%), url('${homepageContent.heroBackgroundImage}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          })
        }}
      >
        <div 
          className="dance-hero-background"
          style={{
            opacity: homepageContent?.heroBackgroundImage ? 0.05 : 0.1
          }}
        ></div>
        <div className="floating-elements">
          <div className="floating-element" style={{top: '20%', left: '10%', animationDelay: '0s'}}>✦</div>
          <div className="floating-element" style={{top: '60%', right: '10%', animationDelay: '3s'}}>✧</div>
          <div className="floating-element" style={{bottom: '20%', left: '50%', animationDelay: '6s'}}>✨</div>
        </div>
        <div className="dance-hero-content">
          <p className="dance-hero-subtitle">{t('hero.subtitle')}</p>
          <h1 className="dance-hero-title dance-font">
            {homepageContent?.heroTitle || siteSettings?.siteName || t('hero.title')}
          </h1>
          <p className="dance-hero-description">
            {homepageContent?.heroSubtitle || t('hero.description')}
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/classes" className="dance-btn dance-btn-primary hover:transform hover:scale-105 transition-all duration-300">
              {homepageContent?.heroButtonText || t('hero.exploreClasses')}
            </Link>
            <Link href="/contact" className="dance-btn dance-btn-secondary hover:transform hover:scale-105 transition-all duration-300">
              🎉 {t('hero.bookFreeTrial')}
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20" style={{background: 'var(--neutral-light)'}}>
        <div className="dance-container">
          <div className="dance-section-header reveal active">
            <h2 className="dance-section-title">
              {homepageContent?.aboutTitle || t('about.title')}
            </h2>
            <p>
              {homepageContent?.aboutDescription || t('about.description')}
            </p>
          </div>
          <div className="dance-card-grid">
            <div className="dance-card reveal active">
              <div className="text-center">
                <div className="text-5xl mb-4" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>🎓</div>
                <h3 className="text-xl font-semibold mb-3" style={{color: 'var(--primary-dark)'}}>{t('about.expertInstructors')}</h3>
                <p>{t('about.expertInstructorsDesc')}</p>
              </div>
            </div>
            <div className="dance-card reveal active">
              <div className="text-center">
                <div className="text-5xl mb-4" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>🏃</div>
                <h3 className="text-xl font-semibold mb-3" style={{color: 'var(--primary-dark)'}}>{t('about.allLevelsWelcome')}</h3>
                <p>{t('about.allLevelsWelcomeDesc')}</p>
              </div>
            </div>
            <div className="dance-card reveal active">
              <div className="text-center">
                <div className="text-5xl mb-4" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'}}>📍</div>
                <h3 className="text-xl font-semibold mb-3" style={{color: 'var(--primary-dark)'}}>{t('about.modernFacilities')}</h3>
                <p>{t('about.modernFacilitiesDesc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dance Styles Section */}
      <DanceStylesTabs danceStyles={danceStyles.length > 0 ? danceStyles : undefined} />

      {/* Featured Classes Section */}
      <section className="py-20 bg-white">
        <div className="dance-container">
          <div className="dance-section-header">
            <h2 className="dance-section-title">
              {featuredClasses.length > 0 ? t('classes.popularClasses') : t('classes.discoverStyles')}
            </h2>
            <p>
              {featuredClasses.length > 0 
                ? t('classes.joinPopular') 
                : t('classes.exploreDiverse')}
            </p>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="dance-card-grid">
              {featuredClasses.length > 0 ? (
                // Display real featured classes
                featuredClasses.map((cls) => {
                  const primaryStyle = cls.classStyles[0]?.style
                  const styleImage = primaryStyle ? getStyleImage(primaryStyle.name) : getStyleImage('Salsa')
                  
                  return (
                    <Link key={cls.id} href={`/classes/${cls.id}`} className="dance-class-card" style={{
                      background: `linear-gradient(rgba(26, 26, 46, 0.4), rgba(26, 26, 46, 0.7)), url('${styleImage}') center/cover`
                    }}>
                      <div className="dance-class-content">
                        <h3 className="text-2xl font-semibold mb-2">{cls.title}</h3>
                        <p className="text-sm uppercase tracking-wide" style={{color: 'var(--primary-gold)'}}>{cls.level}</p>
                        <p className="mt-3 opacity-0 class-description">{cls.description}</p>
                        <div className="mt-4 flex justify-between items-center opacity-0 class-details">
                          <span className="text-lg font-bold">${cls.price}</span>
                          <span className="text-sm">{cls.spotsLeft} spots left</span>
                        </div>
                      </div>
                    </Link>
                  )
                })
              ) : (
                // Fallback to popular styles if no featured classes
                popularStyles.map((style) => (
                  <Link key={style.id} href={`/classes?style=${style.name}`} className="dance-class-card" style={{
                    background: `linear-gradient(rgba(26, 26, 46, 0.4), rgba(26, 26, 46, 0.7)), url('${getStyleImage(style.name)}') center/cover`
                  }}>
                    <div className="dance-class-content">
                      <h3 className="text-2xl font-semibold mb-2">{style.name}</h3>
                      <p className="text-sm uppercase tracking-wide" style={{color: 'var(--primary-gold)'}}>{style.category}</p>
                      <p className="mt-3 opacity-0 class-description">
                        {style._count.classStyles} classes • {style._count.eventStyles} events
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link href="/classes" className="dance-btn dance-btn-primary hover:transform hover:scale-105 transition-all duration-300">
              💃 {t('classes.viewAll')}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20" style={{background: 'var(--primary-dark)', color: 'white'}}>
        <div className="dance-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {isLoading ? (
              // Loading placeholder
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index}>
                  <div className="text-5xl font-bold mb-2 animate-pulse" style={{color: 'var(--primary-gold)'}}>---</div>
                  <div className="text-white opacity-80 animate-pulse">Loading...</div>
                </div>
              ))
            ) : (
              <>
                <div>
                  <div className="text-5xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>
                    {stats?.students || 0}+
                  </div>
                  <div className="text-white opacity-80">{t('stats.happyStudents')}</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>
                    {stats?.danceStyles || 0}+
                  </div>
                  <div className="text-white opacity-80">{t('stats.danceStyles')}</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>
                    {stats?.instructors || 0}+
                  </div>
                  <div className="text-white opacity-80">{t('stats.expertInstructors')}</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>
                    {stats?.venues || 0}
                  </div>
                  <div className="text-white opacity-80">{t('stats.studioLocations')}</div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))', color: 'white'}}>
        <div className="dance-container text-center">
          <h2 className="text-4xl font-bold mb-4 dance-font">🌟 {t('cta.title')}</h2>
          <p className="text-xl mb-8 opacity-90">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <Link href="/contact" className="px-8 py-4 bg-white rounded-full font-bold text-lg hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300" 
                  style={{color: 'var(--primary-dark)'}}>
              🎁 {t('cta.startFreeTrial')}
            </Link>
            <Link href="/classes" className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-800 hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300">
              {t('cta.browseClasses')}
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-80">
            {t('cta.benefits')}
          </p>
        </div>
      </section>
    </div>
  )
}
