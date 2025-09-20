'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface SeoData {
  id?: string
  path: string
  title?: string
  description?: string
  keywords?: string
  author?: string
  robots?: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  ogUrl?: string
  twitterCard?: string
  twitterTitle?: string
  twitterDescription?: string
  twitterImage?: string
  twitterCreator?: string
  structuredData?: string
  customMeta?: string
  isActive?: boolean
  priority?: number
}

interface SeoContextType {
  seoData: SeoData | null
  loading: boolean
  error: string | null
  fetchSeoData: (path: string) => Promise<void>
  clearSeoData: () => void
}

const SeoContext = createContext<SeoContextType | undefined>(undefined)

interface SeoProviderProps {
  children: ReactNode
}

export function SeoProvider({ children }: SeoProviderProps) {
  const [seoData, setSeoData] = useState<SeoData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchSeoData = async (path: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/seo?path=${encodeURIComponent(path)}`)
      
      if (response.ok) {
        const data = await response.json()
        setSeoData(data.seoData)
      } else if (response.status === 404) {
        // No SEO data found for this path - use defaults
        setSeoData(null)
      } else {
        throw new Error('Failed to fetch SEO data')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch SEO data')
      setSeoData(null)
    } finally {
      setLoading(false)
    }
  }

  const clearSeoData = () => {
    setSeoData(null)
    setError(null)
    setLoading(false)
  }

  return (
    <SeoContext.Provider value={{
      seoData,
      loading,
      error,
      fetchSeoData,
      clearSeoData
    }}>
      {children}
    </SeoContext.Provider>
  )
}

export function useSeo() {
  const context = useContext(SeoContext)
  if (context === undefined) {
    throw new Error('useSeo must be used within a SeoProvider')
  }
  return context
}

// Hook to automatically fetch and apply SEO data for current page
export function usePageSeo(path: string) {
  const { seoData, loading, error, fetchSeoData } = useSeo()

  useEffect(() => {
    if (path) {
      fetchSeoData(path)
    }
  }, [path, fetchSeoData])

  return { seoData, loading, error }
}

// Hook to generate meta tags for Next.js metadata API
export function useMetadata(path: string, defaults?: Partial<SeoData>) {
  const { seoData } = usePageSeo(path)
  
  const metadata = React.useMemo(() => {
    const data = seoData || defaults || {}
    
    const title = data.title || data.ogTitle || 'Dance Platform'
    const description = data.description || data.ogDescription || 'Professional dance classes and events platform'
    const images = data.ogImage ? [{ url: data.ogImage }] : []
    
    return {
      title,
      description,
      keywords: data.keywords,
      authors: data.author ? [{ name: data.author }] : undefined,
      robots: data.robots || 'index,follow',
      canonical: data.canonical,
      openGraph: {
        title: data.ogTitle || title,
        description: data.ogDescription || description,
        type: (data.ogType as any) || 'website',
        url: data.ogUrl,
        images
      },
      twitter: {
        card: (data.twitterCard as any) || 'summary_large_image',
        title: data.twitterTitle || data.ogTitle || title,
        description: data.twitterDescription || data.ogDescription || description,
        images: data.twitterImage ? [data.twitterImage] : images.map(img => img.url),
        creator: data.twitterCreator
      }
    }
  }, [seoData, defaults, path])

  return metadata
}

// Hook to generate structured data
export function useStructuredData(path: string) {
  const { seoData } = usePageSeo(path)
  
  return React.useMemo(() => {
    if (!seoData?.structuredData) return null
    
    try {
      return JSON.parse(seoData.structuredData)
    } catch (error) {
      console.error('Invalid structured data JSON:', error)
      return null
    }
  }, [seoData?.structuredData])
}

// Hook to generate custom meta tags
export function useCustomMeta(path: string) {
  const { seoData } = usePageSeo(path)
  
  return React.useMemo(() => {
    if (!seoData?.customMeta) return []
    
    try {
      const customMeta = JSON.parse(seoData.customMeta)
      return Array.isArray(customMeta) ? customMeta : []
    } catch (error) {
      console.error('Invalid custom meta JSON:', error)
      return []
    }
  }, [seoData?.customMeta])
}