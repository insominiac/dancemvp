'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function FloatingCTA() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      // Show the CTA after scrolling 200px
      const scrolled = window.scrollY > 200
      setIsVisible(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!isVisible) return null

  return (
    <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
      isMinimized ? 'transform scale-75' : ''
    }`}>
      {isMinimized ? (
        // Minimized state - small circular button
        <button
          onClick={() => setIsMinimized(false)}
          className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-2xl hover:transform hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          style={{ animation: 'pulse 2s infinite' }}
        >
          <span className="text-2xl">🎁</span>
        </button>
      ) : (
        // Full CTA card
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm border-2 border-purple-200 relative">
          <button
            onClick={() => setIsMinimized(true)}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-lg font-bold mb-2" style={{color: 'var(--primary-dark)'}}>
              Ready to Dance?
            </h3>
            <p className="text-sm mb-4" style={{color: 'var(--neutral-gray)'}}>
              Book your FREE trial class today!
            </p>
            
            <div className="space-y-2">
              <Link
                href="/contact"
                className="block w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold text-sm hover:transform hover:scale-105 hover:shadow-lg transition-all duration-300"
              >
                🎁 Book Free Trial
              </Link>
              
              <div className="flex gap-2">
                <a
                  href="tel:+1234567890"
                  className="flex-1 px-3 py-2 border border-purple-300 text-purple-600 rounded-full text-xs font-semibold hover:bg-purple-50 transition-colors"
                >
                  📞 Call
                </a>
                <Link
                  href="/classes"
                  className="flex-1 px-3 py-2 border border-purple-300 text-purple-600 rounded-full text-xs font-semibold hover:bg-purple-50 transition-colors"
                >
                  👀 Browse
                </Link>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-1 mt-3 text-xs opacity-75">
              <span>✅ No commitment</span>
              <span>•</span>
              <span>✅ All levels</span>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(168, 85, 247, 0.4);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(168, 85, 247, 0);
          }
        }
      `}</style>
    </div>
  )
}