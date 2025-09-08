'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

// Mock data store (in production, this would come from API)
const mockClasses = [
  {
    id: 1,
    title: 'Hip Hop Masterclass',
    instructor: 'Sarah Johnson',
    level: 'Intermediate',
    price: 35,
    schedule: 'Mon/Wed/Fri 6PM',
    capacity: 30,
    enrolled: 24,
    image: '/api/placeholder/400/300'
  },
  {
    id: 2,
    title: 'Ballet Fundamentals',
    instructor: 'Maria Rodriguez',
    level: 'Beginner',
    price: 40,
    schedule: 'Tue/Thu 7PM',
    capacity: 20,
    enrolled: 18,
    image: '/api/placeholder/400/300'
  },
  {
    id: 3,
    title: 'Contemporary Flow',
    instructor: 'James Chen',
    level: 'Advanced',
    price: 45,
    schedule: 'Sat/Sun 10AM',
    capacity: 25,
    enrolled: 22,
    image: '/api/placeholder/400/300'
  }
]

export default function HomePage() {
  const [classes, setClasses] = useState(mockClasses)
  const [selectedLevel, setSelectedLevel] = useState('all')
  const [isLoading, setIsLoading] = useState(false)

  // Filter classes based on level
  const filteredClasses = selectedLevel === 'all' 
    ? classes 
    : classes.filter(c => c.level.toLowerCase() === selectedLevel)

  return (
    <div className="min-h-screen">
      {/* Navigation Header */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                💃 Dance Platform 2.0
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/classes" className="text-gray-700 hover:text-purple-600 transition">
                Classes
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-purple-600 transition">
                Events
              </Link>
              <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 transition">
                Dashboard
              </Link>
              <Link href="/admin" className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition">
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-purple-600 to-pink-600 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6 animate-fade-in">
              Welcome to Dance Platform 2.0
            </h1>
            <p className="text-xl mb-8 opacity-90">
              Scalable, Modern, Real-time Dance Studio Management
            </p>
            <div className="flex justify-center space-x-4">
              <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105">
                Get Started
              </button>
              <button className="px-8 py-4 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition">
                View Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">1,247</div>
              <div className="text-gray-600 mt-2">Active Students</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">48</div>
              <div className="text-gray-600 mt-2">Dance Classes</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">12</div>
              <div className="text-gray-600 mt-2">Expert Instructors</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-pink-600">4.9⭐</div>
              <div className="text-gray-600 mt-2">Average Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Classes Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Classes
            </h2>
            <p className="text-xl text-gray-600">
              Join our world-class dance programs
            </p>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            {['all', 'beginner', 'intermediate', 'advanced'].map(level => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-6 py-2 rounded-full font-medium transition ${
                  selectedLevel === level
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          {/* Classes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredClasses.map(cls => (
              <div key={cls.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition transform hover:scale-105">
                <div className="h-48 bg-gradient-to-r from-purple-400 to-pink-400"></div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{cls.title}</h3>
                  <p className="text-gray-600 mb-4">with {cls.instructor}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                      {cls.level}
                    </span>
                    <span className="text-2xl font-bold text-gray-900">
                      ${cls.price}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    <p>📅 {cls.schedule}</p>
                    <p>👥 {cls.enrolled}/{cls.capacity} enrolled</p>
                  </div>
                  <div className="flex space-x-2">
                    <button className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg transition">
                      Book Now
                    </button>
                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Platform Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold mb-2">Real-time Updates</h3>
              <p className="text-gray-600">Live class availability and instant booking confirmations</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="text-xl font-semibold mb-2">Secure Payments</h3>
              <p className="text-gray-600">Stripe integration with PCI compliance</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Analytics Dashboard</h3>
              <p className="text-gray-600">Track revenue, attendance, and growth metrics</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-xl font-semibold mb-2">Auto-scaling</h3>
              <p className="text-gray-600">Handles 10,000+ concurrent users</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold mb-2">Mobile Responsive</h3>
              <p className="text-gray-600">Perfect experience on any device</p>
            </div>
            <div className="text-center p-6">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold mb-2">High Performance</h3>
              <p className="text-gray-600">Sub-200ms API response times</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Dance Studio?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of studios using our platform
          </p>
          <button className="px-8 py-4 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105">
            Start Free Trial
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-gray-400">© 2024 Dance Platform 2.0 - Built with Next.js, React, and TypeScript</p>
            <p className="text-gray-500 mt-2">Scalable Architecture Ready for Production</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
