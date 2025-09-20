'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'

interface UrgencyBannerProps {
  onVisibilityChange?: (visible: boolean) => void
}

export default function UrgencyBanner({ onVisibilityChange }: UrgencyBannerProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [timeLeft, setTimeLeft] = useState('')
  const [isClient, setIsClient] = useState(false)
  
  // Generate deterministic animation values only on client-side
  const animationStyles = useMemo(() => {
    if (!isClient) return []
    return Array.from({ length: 20 }).map((_, i) => ({
      left: `${(i * 13.7) % 100}%`, // Deterministic positioning
      top: `${(i * 7.3) % 100}%`,
      animationDelay: `${(i * 0.3) % 3}s`,
      animationDuration: `${2 + (i * 0.1) % 2}s`
    }))
  }, [isClient])

  useEffect(() => {
    // Set client-side flag after hydration
    setIsClient(true)
  }, [])

  useEffect(() => {
    // Notify parent of visibility changes
    onVisibilityChange?.(isVisible)
  }, [isVisible, onVisibilityChange])

  useEffect(() => {
    // Calculate time until end of current month (example urgency)
    const calculateTimeLeft = () => {
      const now = new Date()
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      const difference = endOfMonth.getTime() - now.getTime()

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24))
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
        
        setTimeLeft(`${days}d ${hours}h ${minutes}m`)
      } else {
        setTimeLeft('Expired')
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute

    return () => clearInterval(timer)
  }, [])

  return (
    <div className={`urgency-banner bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 px-4 relative overflow-hidden ${!isVisible ? 'hidden' : ''}`}>
      <div className="dance-container relative z-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-2xl animate-bounce">🔥</div>
            <div>
              <span className="font-bold text-lg">LIMITED TIME OFFER: </span>
              <span className="text-yellow-300">50% OFF Your First Month!</span>
              <div className="text-sm opacity-90 mt-1">
                ⏰ Ends in: <span className="font-mono font-bold">{timeLeft}</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 relative z-20">
            <Link 
              href="/contact"
              className="px-6 py-2 bg-white text-red-600 rounded-full font-bold text-sm hover:transform hover:scale-105 transition-all duration-300 whitespace-nowrap relative z-20"
            >
              🎁 Claim Offer
            </Link>
            <button
              onClick={() => {
                setIsVisible(false)
                onVisibilityChange?.(false)
              }}
              className="text-white hover:text-gray-200 transition-colors relative z-20 p-1"
              aria-label="Close banner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
      {/* Animated background effect */}
      <div className="absolute inset-0 opacity-20 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          {animationStyles.map((style, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full animate-pulse pointer-events-none"
              style={style}
            />
          ))}
        </div>
      </div>
    </div>
  )
}