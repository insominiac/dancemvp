'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function AboutPage() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
      setSubscribed(true)
      setEmail('')
      // Here you would typically send the email to your backend
      setTimeout(() => setSubscribed(false), 3000)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="py-20" style={{background: 'linear-gradient(135deg, var(--primary-gold), var(--accent-rose))', color: 'white'}}>
        <div className="dance-container text-center">
          <h1 className="text-5xl font-bold mb-4 dance-font">🎭 About DanceLink</h1>
          <p className="text-xl opacity-90 mb-8">Connecting dancers through the universal language of movement</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <Link href="/classes" className="px-8 py-3 bg-white text-purple-900 rounded-full font-bold hover:transform hover:scale-105 transition-all duration-300">
              💃 Explore Classes
            </Link>
            <Link href="/contact" className="px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-purple-900 hover:transform hover:scale-105 transition-all duration-300">
              📞 Contact Us
            </Link>
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="dance-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>500+</div>
              <div className="text-gray-600">Happy Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>15+</div>
              <div className="text-gray-600">Dance Styles</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>20+</div>
              <div className="text-gray-600">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2" style={{color: 'var(--primary-gold)'}}>5</div>
              <div className="text-gray-600">Studio Locations</div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20" style={{background: 'var(--neutral-light)'}}>
        <div className="dance-container">
          <div className="dance-card max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <div className="text-6xl mb-4">💃</div>
              <h2 className="text-3xl font-bold mb-6" style={{color: 'var(--primary-dark)'}}>Our Story</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-lg leading-8 mb-6" style={{color: 'var(--neutral-gray)'}}>
                  DanceLink was founded with a simple belief: everyone deserves to experience the joy and connection that comes from dance. We started as a small community of passionate dancers and have grown into a thriving platform that connects thousands of students with world-class instructors.
                </p>
                <p className="text-lg leading-8" style={{color: 'var(--neutral-gray)'}}>
                  Our mission is to make dance accessible, welcoming, and transformative for people of all backgrounds and skill levels. Whether you're taking your first steps or perfecting advanced techniques, we're here to support your dance journey.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-white p-8 rounded-2xl shadow-lg">
                  <h3 className="text-2xl font-bold mb-4" style={{color: 'var(--primary-dark)'}}>✨ Why Choose Us?</h3>
                  <div className="space-y-4 text-left">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🎖️</span>
                      <span>Award-winning instructors</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">🏢</span>
                      <span>State-of-the-art studios</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">👥</span>
                      <span>Welcoming community</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📈</span>
                      <span>Proven results</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter CTA Section */}
      <section className="py-20 bg-white">
        <div className="dance-container">
          <div className="max-w-2xl mx-auto text-center">
            <div className="dance-card" style={{
              background: 'linear-gradient(135deg, var(--primary-dark), var(--accent-rose))',
              color: 'white'
            }}>
              <h2 className="text-3xl font-bold mb-4">📧 Stay in the Loop!</h2>
              <p className="text-lg mb-8 opacity-90">
                Get exclusive access to new classes, special events, and dance tips delivered to your inbox weekly.
              </p>
              
              {subscribed ? (
                <div className="bg-white bg-opacity-20 rounded-full py-4 px-6">
                  <p className="text-lg font-semibold">✅ Thanks for subscribing! Check your email soon.</p>
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
                    required
                  />
                  <button
                    type="submit"
                    className="px-8 py-3 bg-white text-purple-900 rounded-full font-bold hover:transform hover:scale-105 transition-all duration-300"
                  >
                    🚀 Subscribe
                  </button>
                </form>
              )}
              
              <div className="flex items-center justify-center gap-6 mt-8 text-sm opacity-80">
                <div className="flex items-center">
                  <span className="mr-2">🎁</span>
                  <span>Weekly dance tips</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">🎉</span>
                  <span>Exclusive events</span>
                </div>
                <div className="flex items-center">
                  <span className="mr-2">💰</span>
                  <span>Special discounts</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20" style={{background: 'var(--neutral-light)'}}>
        <div className="dance-container text-center">
          <h2 className="text-4xl font-bold mb-4" style={{color: 'var(--primary-dark)'}}>🎆 Ready to Begin Your Dance Journey?</h2>
          <p className="text-xl mb-8" style={{color: 'var(--neutral-gray)'}}>
            Join hundreds of dancers who have transformed their lives through movement at DanceLink.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center max-w-2xl mx-auto">
            <Link 
              href="/contact" 
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-lg hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300"
            >
              🎁 Start Free Trial
            </Link>
            <Link 
              href="/classes" 
              className="px-8 py-4 border-2 border-purple-600 text-purple-600 rounded-full font-semibold hover:bg-purple-600 hover:text-white hover:transform hover:scale-105 transition-all duration-300"
            >
              👀 Browse Classes
            </Link>
          </div>
          <p className="text-sm mt-6 opacity-75">
            ✅ No experience needed • ✅ Flexible scheduling • ✅ Money-back guarantee
          </p>
        </div>
      </section>
    </div>
  )
}
