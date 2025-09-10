'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface InstructorLayoutProps {
  children: ReactNode
}

export default function InstructorLayout({ children }: InstructorLayoutProps) {
  const pathname = usePathname()

  const navigation = [
    {
      name: 'Dashboard',
      href: '/instructor/dashboard',
      icon: '🏠',
      current: pathname === '/instructor/dashboard'
    },
    {
      name: 'My Classes',
      href: '/instructor/classes',
      icon: '📚',
      current: pathname === '/instructor/classes'
    },
    {
      name: 'Students',
      href: '/instructor/students',
      icon: '👥',
      current: pathname === '/instructor/students'
    },
    {
      name: 'Messages',
      href: '/instructor/messages',
      icon: '💬',
      current: pathname === '/instructor/messages'
    },
    {
      name: 'Analytics',
      href: '/instructor/analytics',
      icon: '📈',
      current: pathname === '/instructor/analytics'
    },
    {
      name: 'Earnings',
      href: '/instructor/earnings',
      icon: '💰',
      current: pathname === '/instructor/earnings'
    },
    {
      name: 'Materials',
      href: '/instructor/materials',
      icon: '📝',
      current: pathname === '/instructor/materials'
    },
    {
      name: 'Settings',
      href: '/instructor/settings',
      icon: '⚙️',
      current: pathname === '/instructor/settings'
    }
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
              <span className="text-xl font-bold text-purple-600">Instructor Portal</span>
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
                  <span className="text-sm font-medium text-white">I</span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    Demo Instructor
                  </p>
                  <p className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                    <Link href="/api/auth/logout" className="hover:underline">
                      Sign out
                    </Link>
                  </p>
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
              <Link href="/" className="text-lg font-bold text-purple-600">
                Instructor Portal
              </Link>
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
                <span className="sr-only">Open main menu</span>
                <span className="text-xl">☰</span>
              </button>
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
                © 2024 Dance Platform - Instructor Portal
              </p>
              <div className="flex space-x-4 text-sm">
                <Link href="/help" className="text-gray-500 hover:text-gray-700">
                  Help
                </Link>
                <Link href="/contact" className="text-gray-500 hover:text-gray-700">
                  Support
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
