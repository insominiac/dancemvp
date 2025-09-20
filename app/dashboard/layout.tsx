'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ReactNode } from 'react'
import { useAuth, useRequireAuth } from '@/app/lib/auth-context'
import NotificationBell from '@/app/components/notifications/NotificationBell'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout, loading } = useAuth()
  
  // Require authentication for dashboard access
  useRequireAuth()
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }
  
  // Don't render if no user (will redirect via useRequireAuth)
  if (!user) {
    return null
  }

  // Base navigation items
  const baseNavigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: '🏠',
      current: pathname === '/dashboard'
    },
    {
      name: 'My Bookings',
      href: '/dashboard/bookings',
      icon: '📅',
      current: pathname === '/dashboard/bookings'
    },
    {
      name: 'Payment History',
      href: '/dashboard/payments',
      icon: '💳',
      current: pathname === '/dashboard/payments'
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: '👤',
      current: pathname === '/dashboard/profile'
    },
    {
      name: 'Notifications',
      href: '/dashboard/notifications',
      icon: '🔔',
      current: pathname === '/dashboard/notifications'
    },
    {
      name: 'Settings',
      href: '/dashboard/settings',
      icon: '⚙️',
      current: pathname === '/dashboard/settings'
    },
    {
      name: 'Test Notifications',
      href: '/dashboard/test-notifications',
      icon: '🧪',
      current: pathname === '/dashboard/test-notifications'
    }
  ]

  // Partner matching navigation (only for students/users and instructors)
  const partnerMatchingNav = {
    name: 'Partner Matching',
    href: '/dashboard/partner-matching',
    icon: '💝',
    current: pathname.startsWith('/dashboard/partner-matching')
  }

  // Filter navigation based on user role
  const navigation = [
    ...baseNavigation.slice(0, 2), // Dashboard and Bookings
    // Add partner matching for students/users and instructors only
    ...(user.role === 'USER' || user.role === 'INSTRUCTOR' ? [partnerMatchingNav] : []),
    ...baseNavigation.slice(2) // Rest of the navigation
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button - would need state management for mobile */}
      <div className="lg:hidden">
        {/* Mobile sidebar would go here */}
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold text-purple-600 dance-logo" style={{fontSize: '1.5rem'}}>Dance Platform</span>
            </Link>
          </div>
          
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                  item.current
                    ? 'bg-purple-100 text-purple-900 border-r-2 border-purple-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="mr-3 text-lg" aria-hidden="true">
                  {item.icon}
                </span>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* User info section */}
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="inline-block h-9 w-9 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-gray-500">
                      {user.role.toLowerCase()}
                    </p>
                    <button 
                      onClick={async () => {
                        await logout()
                        router.push('/login')
                      }}
                      className="text-xs font-medium text-gray-500 hover:text-gray-700 hover:underline"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top navigation for mobile */}
        <div className="lg:hidden bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-lg font-bold text-purple-600 dance-logo" style={{fontSize: '1.25rem'}}>
                Dance Platform
              </Link>
              <div className="flex items-center space-x-2">
                <NotificationBell userId={user.id} />
                <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                  <span className="sr-only">Open main menu</span>
                  <span className="text-xl">☰</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Top bar for desktop */}
        <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-3">
            <div className="flex items-center justify-end">
              <NotificationBell userId={user.id} />
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                © 2024 Dance Platform. All rights reserved.
              </p>
              <div className="flex space-x-4 text-sm">
                <Link href="/help" className="text-gray-500 hover:text-gray-700">
                  Help
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-gray-700">
                  Contact
                </Link>
                <Link href="/privacy" className="text-gray-500 hover:text-gray-700">
                  Privacy
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
