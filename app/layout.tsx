import type { Metadata } from 'next'
import { Dancing_Script } from 'next/font/google'
import './globals.css'
import './styles/dance-theme.css'
import { AuthProvider } from '@/app/lib/auth-context'
import ServiceWorkerProvider from '@/app/components/ServiceWorkerProvider'

const dancingScript = Dancing_Script({ 
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-dancing',
})

export const metadata: Metadata = {
  title: 'Dance Platform - Modern Dance Studio Management',
  description: 'Professional dance studio platform with booking, payments, and management',
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${dancingScript.variable}`} style={{fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"}}>
        <ServiceWorkerProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ServiceWorkerProvider>
      </body>
    </html>
  )
}
