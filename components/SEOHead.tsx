'use client'

import { useEffect } from 'react'
import Head from 'next/head'
import { usePageSeo, useStructuredData, useCustomMeta } from '../contexts/SeoContext'

interface SEOHeadProps {
  path: string
  fallbackTitle?: string
  fallbackDescription?: string
  fallbackImage?: string
}

export default function SEOHead({ 
  path, 
  fallbackTitle = 'Dance Platform',
  fallbackDescription = 'Professional dance classes and events platform',
  fallbackImage = '/default-og-image.jpg'
}: SEOHeadProps) {
  const { seoData, loading, error } = usePageSeo(path)
  const structuredData = useStructuredData(path)
  const customMeta = useCustomMeta(path)

  useEffect(() => {
    if (error) {
      console.error('SEO data fetch error:', error)
    }
  }, [error])

  if (loading) {
    return null
  }

  const title = seoData?.title || seoData?.ogTitle || fallbackTitle
  const description = seoData?.description || seoData?.ogDescription || fallbackDescription
  const keywords = seoData?.keywords
  const author = seoData?.author
  const robots = seoData?.robots || 'index,follow'
  const canonical = seoData?.canonical
  
  // Open Graph
  const ogTitle = seoData?.ogTitle || title
  const ogDescription = seoData?.ogDescription || description
  const ogImage = seoData?.ogImage || fallbackImage
  const ogType = seoData?.ogType || 'website'
  const ogUrl = seoData?.ogUrl
  
  // Twitter
  const twitterCard = seoData?.twitterCard || 'summary_large_image'
  const twitterTitle = seoData?.twitterTitle || ogTitle
  const twitterDescription = seoData?.twitterDescription || ogDescription
  const twitterImage = seoData?.twitterImage || ogImage
  const twitterCreator = seoData?.twitterCreator

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robots} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Viewport and mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Open Graph */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />
      {ogUrl && <meta property="og:url" content={ogUrl} />}
      <meta property="og:site_name" content="Dance Platform" />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
      
      {/* Favicon and Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      
      {/* Custom Meta Tags */}
      {customMeta.map((meta: any, index: number) => {
        if (meta.property) {
          return <meta key={index} property={meta.property} content={meta.content} />
        } else if (meta.name) {
          return <meta key={index} name={meta.name} content={meta.content} />
        } else if (meta.rel) {
          return <link key={index} rel={meta.rel} href={meta.href} {...meta.attributes} />
        }
        return null
      })}
    </Head>
  )
}

// Server-side version for App Router pages
export function generateMetadata(path: string, seoData?: any) {
  if (!seoData) {
    return {
      title: 'Dance Platform',
      description: 'Professional dance classes and events platform'
    }
  }

  const title = seoData.title || seoData.ogTitle || 'Dance Platform'
  const description = seoData.description || seoData.ogDescription || 'Professional dance classes and events platform'
  const images = seoData.ogImage ? [{ url: seoData.ogImage }] : []

  return {
    title,
    description,
    keywords: seoData.keywords,
    authors: seoData.author ? [{ name: seoData.author }] : undefined,
    robots: seoData.robots || 'index,follow',
    canonical: seoData.canonical,
    openGraph: {
      title: seoData.ogTitle || title,
      description: seoData.ogDescription || description,
      type: seoData.ogType || 'website',
      url: seoData.ogUrl,
      images,
      siteName: 'Dance Platform'
    },
    twitter: {
      card: seoData.twitterCard || 'summary_large_image',
      title: seoData.twitterTitle || seoData.ogTitle || title,
      description: seoData.twitterDescription || seoData.ogDescription || description,
      images: seoData.twitterImage ? [seoData.twitterImage] : images.map((img: any) => img.url),
      creator: seoData.twitterCreator
    },
    other: {
      ...(seoData.customMeta ? JSON.parse(seoData.customMeta).reduce((acc: any, meta: any) => {
        if (meta.name) acc[meta.name] = meta.content
        return acc
      }, {}) : {})
    }
  }
}

// Helper function to fetch SEO data server-side
export async function fetchSeoData(path: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/seo?path=${encodeURIComponent(path)}`, {
      cache: 'no-store' // Ensure fresh data
    })
    
    if (response.ok) {
      const data = await response.json()
      return data.seoData
    }
    
    return null
  } catch (error) {
    console.error('Failed to fetch SEO data:', error)
    return null
  }
}