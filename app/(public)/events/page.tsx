import { headers } from 'next/headers'
import EventsClient from './EventsClient'
import { translationService } from '@/lib/translation-service'
import { generateMetadata as genMeta } from '@/app/lib/seo'
import { apiUrl } from '@/app/lib/api'

interface Event {
  id: string
  title: string
  description: string
  eventType: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  price: string
  maxAttendees: number
  currentAttendees: number
  status: string
  isFeatured: boolean
  venue?: { name: string; city: string }
  eventStyles?: any[]
  imageUrl?: string
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

export async function generateMetadata() {
  try {
    const res = await fetch(apiUrl('seo?path=/events'), { cache: 'no-store' })
    if (res.ok) {
      const data = await res.json()
      return genMeta('/events', data.seoData)
    }
  } catch {}
  return genMeta('/events', null)
}

export default async function EventsPage() {
  // Detect language from cookie or Accept-Language
  const h = headers()
  const cookie = h.get('cookie') || ''
  const cookieLang = (cookie.match(/(?:^|;\s*)i18next=([^;]+)/)?.[1] || '').split('-')[0]
  const accept = h.get('accept-language') || ''
  const acceptLang = accept.split(',')[0]?.split('-')[0]
  const rawLang = (cookieLang || acceptLang || 'en').toLowerCase()
  const lang = /^[a-z]{2}$/.test(rawLang) ? (rawLang as string) : 'en'

  // Fetch events and page content from external API
  const [eventsRes, contentRes] = await Promise.all([
    fetch(apiUrl('public/events'), { cache: 'no-store' }),
    fetch(apiUrl('public/content/events'), { cache: 'no-store' })
  ])

  let events: Event[] = []
  let pageContent: EventsPageContent | null = null

  if (eventsRes.ok) {
    const data = await eventsRes.json()
    events = data.events || []
  }
  if (contentRes.ok) {
    pageContent = await contentRes.json()
  }

  // SSR translate dynamic content when not English
  if (lang && lang !== 'en' && events.length) {
    const texts: string[] = []
    const mapIdx: { i: number; field: 'title' | 'description' }[] = []
    events.forEach((e, i) => {
      texts.push(e.title || '')
      mapIdx.push({ i, field: 'title' })
      texts.push(e.description || '')
      mapIdx.push({ i, field: 'description' })
    })
    try {
      const translated = await translationService.translateBatch(texts, lang, 'en')
      translated.forEach((val, idx) => {
        const m = mapIdx[idx]
        if (m) {
          events[m.i][m.field] = val
        }
      })
    } catch (e) {
      // On error, keep original texts
    }
  }

  if (lang && lang !== 'en' && pageContent) {
    const contentTexts: string[] = []
    const keys: Array<keyof EventsPageContent> = [
      'heroBadgeText', 'heroTitle', 'heroSubtitle', 'featuredTitle', 'featuredDescription', 'searchTitle', 'searchDescription',
      'ctaBadgeText', 'ctaTitle', 'ctaDescription'
    ]
    const keyIndex: { key: keyof EventsPageContent }[] = []
    keys.forEach((k) => {
      const v = (pageContent as any)[k]
      if (typeof v === 'string' && v.trim()) {
        contentTexts.push(v)
        keyIndex.push({ key: k })
      }
    })
    try {
      if (contentTexts.length) {
        const out = await translationService.translateBatch(contentTexts, lang, 'en')
        out.forEach((val, idx) => {
          const k = keyIndex[idx]?.key
          if (k) (pageContent as any)[k] = val
        })
      }
    } catch {}
  }

  return <EventsClient initialEvents={events} initialPageContent={pageContent} initialLang={lang} />
}
