'use client'

import { useTranslation } from 'react-i18next'
import { useState, useEffect, useRef } from 'react'

const languages = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' }
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setIsMounted(true)
  }, [])
  
  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0]

  const handleLanguageChange = (locale: string) => {
    i18n.changeLanguage(locale)
    setIsOpen(false)
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Show loading state during hydration
  if (!isMounted) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 rounded-xl border border-gray-200 shadow-sm backdrop-blur-sm">
          <span className="text-base drop-shadow-sm">🇺🇸</span>
          <span className="hidden sm:block font-semibold tracking-wide">EN</span>
          <svg 
            className="w-4 h-4 transition-all duration-300"
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 border border-gray-200 hover:border-transparent shadow-sm hover:shadow-md backdrop-blur-sm"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <span className="text-base drop-shadow-sm">{currentLanguage.flag}</span>
        <span className="hidden sm:block font-semibold tracking-wide">{currentLanguage.code.toUpperCase()}</span>
        <svg 
          className={`w-4 h-4 transition-all duration-300 group-hover:text-white ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-3 bg-white/95 backdrop-blur-lg border border-gray-200/50 rounded-2xl shadow-xl z-50 min-w-[180px] overflow-hidden transform transition-all duration-200 opacity-100 scale-100">
            <div className="py-2">
              {languages.map((language) => {
                const isSelected = language.code === i18n.language
                return (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageChange(language.code)}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 flex items-center gap-3 transition-all duration-200 group ${
                      isSelected 
                        ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 font-semibold border-l-4 border-purple-500' 
                        : 'text-gray-700 hover:text-purple-700'
                    }`}
                  >
                    <span className="text-lg drop-shadow-sm">{language.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium">{language.nativeName}</span>
                      <span className="text-xs text-gray-500 group-hover:text-purple-600">{language.name}</span>
                    </div>
                    {isSelected && (
                      <svg className="w-4 h-4 ml-auto text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                )
              })}
            </div>
            
            {/* Bottom decoration */}
            <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500"></div>
          </div>
        </>
      )}
    </div>
  )
}
