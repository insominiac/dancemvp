'use client'

// Example: How to use SEO in different page types
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SEOHead from '../components/SEOHead'
import { useMetadata, useStructuredData } from '../contexts/SeoContext'

// METHOD 1: Client-side SEO with SEOHead component
export function ClientSidePage() {
  const router = useRouter()
  
  return (
    <div>
      {/* This component handles all meta tags dynamically */}
      <SEOHead 
        path="/about"
        fallbackTitle="About Us - Dance Platform"
        fallbackDescription="Learn about our mission to connect dancers worldwide"
        fallbackImage="/about-og-image.jpg"
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1>About Page</h1>
        <p>This page uses client-side SEO with the SEOHead component.</p>
      </div>
    </div>
  )
}

// METHOD 2: Using metadata hook for custom meta handling
export function CustomMetaPage() {
  const metadata = useMetadata('/classes', {
    title: 'Dance Classes - Default Title',
    description: 'Browse our amazing dance classes',
    ogImage: '/classes-default.jpg'
  })
  
  const structuredData = useStructuredData('/classes')
  
  useEffect(() => {
    // You can use the metadata object to update document head manually
    if (metadata.title) {
      document.title = metadata.title
    }
  }, [metadata])
  
  return (
    <div>
      <div className="container mx-auto px-4 py-8">
        <h1>Classes Page</h1>
        <p>Current SEO title: {metadata.title}</p>
        <p>Current SEO description: {metadata.description}</p>
        
        {structuredData && (
          <div>
            <h2>Structured Data Present</h2>
            <pre>{JSON.stringify(structuredData, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}

// METHOD 3: Server-side rendering with App Router (metadata export)
// File: app/events/page.tsx

import { fetchSeoData, generateMetadata as genMeta } from '../components/SEOHead'

// Server-side metadata generation
export async function generateMetadata() {
  const seoData = await fetchSeoData('/events')
  return genMeta('/events', seoData)
}

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Events Page</h1>
      <p>This page uses server-side SEO with generateMetadata export.</p>
      <p>SEO data is fetched at build time and rendered in the HTML head.</p>
    </div>
  )
}

// METHOD 4: Dynamic pages with params
// File: app/classes/[id]/page.tsx

/*
import { fetchSeoData, generateMetadata as genMeta } from '../../components/SEOHead'

export async function generateMetadata({ params }: { params: { id: string } }) {
  // You can combine URL params with SEO data
  const seoData = await fetchSeoData(`/classes/${params.id}`)
  
  // If no specific SEO data, you can generate dynamic meta based on the class
  if (!seoData) {
    // Fetch class data to generate dynamic SEO
    const classData = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/classes/${params.id}`)
      .then(res => res.ok ? res.json() : null)
    
    if (classData) {
      return {
        title: `${classData.title} - Dance Classes`,
        description: classData.description.substring(0, 160),
        openGraph: {
          title: `${classData.title} - Dance Classes`,
          description: classData.description,
          images: classData.image ? [{ url: classData.image }] : []
        }
      }
    }
  }
  
  return genMeta(`/classes/${params.id}`, seoData)
}

export default function ClassDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>Class Detail Page</h1>
      <p>Class ID: {params.id}</p>
      <p>This page uses dynamic SEO based on the class data.</p>
    </div>
  )
}
*/

// USAGE EXAMPLES FOR ADMIN:

export function SEOExamples() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1>SEO Integration Examples</h1>
      
      <div className="space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-4">1. Basic Page SEO</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{`import SEOHead from '../components/SEOHead'

export default function AboutPage() {
  return (
    <div>
      <SEOHead 
        path="/about"
        fallbackTitle="About Us"
        fallbackDescription="Learn about our company"
      />
      <h1>About Page Content</h1>
    </div>
  )
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">2. Server-Side SEO (App Router)</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{`import { fetchSeoData, generateMetadata as genMeta } from '../components/SEOHead'

export async function generateMetadata() {
  const seoData = await fetchSeoData('/events')
  return genMeta('/events', seoData)
}

export default function EventsPage() {
  return <h1>Events</h1>
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">3. Dynamic Pages</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{`export async function generateMetadata({ params }) {
  const seoData = await fetchSeoData(\`/classes/\${params.id}\`)
  
  // Fallback to dynamic generation
  if (!seoData) {
    const classData = await fetchClassData(params.id)
    return {
      title: \`\${classData.title} - Classes\`,
      description: classData.description
    }
  }
  
  return genMeta(\`/classes/\${params.id}\`, seoData)
}`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">4. Custom Meta Tags</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{`// In admin, add custom meta JSON:
[
  {
    "name": "theme-color",
    "content": "#6366f1"
  },
  {
    "property": "article:author",
    "content": "John Doe"
  },
  {
    "rel": "alternate",
    "href": "/es/about",
    "attributes": { "hreflang": "es" }
  }
]`}</pre>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">5. Structured Data</h2>
          <div className="bg-gray-100 p-4 rounded">
            <pre>{`// In admin, add structured data JSON:
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Dance Platform",
  "url": "https://danceplatform.com",
  "logo": "https://danceplatform.com/logo.png",
  "sameAs": [
    "https://facebook.com/danceplatform",
    "https://instagram.com/danceplatform"
  ]
}`}</pre>
          </div>
        </section>
      </div>
    </div>
  )
}