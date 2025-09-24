'use client'

import React, { useState } from 'react'
import { CreditCard, Globe, DollarSign } from 'lucide-react'

interface PaymentProviderSelectorProps {
  onProviderChange: (provider: 'STRIPE' | 'WISE') => void
  selectedProvider: 'STRIPE' | 'WISE'
  disabled?: boolean
}

export default function PaymentProviderSelector({
  onProviderChange,
  selectedProvider,
  disabled = false
}: PaymentProviderSelectorProps) {
  const [hoveredProvider, setHoveredProvider] = useState<'STRIPE' | 'WISE' | null>(null)

  const providers = [
    {
      id: 'STRIPE' as const,
      name: 'Credit/Debit Card',
      description: 'Pay instantly with your card',
      icon: <CreditCard className="w-6 h-6" />,
      features: ['Instant payment', 'Credit/Debit cards', 'Secure checkout'],
      processingTime: 'Instant',
      fees: 'Standard card fees apply',
      color: 'bg-blue-50 border-blue-200',
      activeColor: 'bg-blue-100 border-blue-400',
      textColor: 'text-blue-700',
    },
    {
      id: 'WISE' as const,
      name: 'Wise Transfer',
      description: 'International transfers with great exchange rates',
      icon: <Globe className="w-6 h-6" />,
      features: ['Low fees', 'Great exchange rates', 'Multi-currency'],
      processingTime: '1-2 business days',
      fees: 'Lower international fees',
      color: 'bg-green-50 border-green-200',
      activeColor: 'bg-green-100 border-green-400',
      textColor: 'text-green-700',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-4">
        <DollarSign className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">Choose Payment Method</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {providers.map((provider) => {
          const isSelected = selectedProvider === provider.id
          const isHovered = hoveredProvider === provider.id

          return (
            <div
              key={provider.id}
              className={`
                relative cursor-pointer rounded-lg border-2 p-6 transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${isSelected 
                  ? `${provider.activeColor} ring-2 ring-offset-2 ring-blue-500` 
                  : provider.color
                }
                ${isHovered && !disabled ? 'scale-105 shadow-lg' : ''}
              `}
              onClick={() => !disabled && onProviderChange(provider.id)}
              onMouseEnter={() => !disabled && setHoveredProvider(provider.id)}
              onMouseLeave={() => setHoveredProvider(null)}
            >
              {/* Selection indicator */}
              <div className="absolute top-4 right-4">
                <div
                  className={`
                    w-5 h-5 rounded-full border-2 transition-all duration-200
                    ${isSelected 
                      ? 'bg-blue-500 border-blue-500' 
                      : 'border-gray-300'
                    }
                  `}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Provider content */}
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <div className={provider.textColor}>
                    {provider.icon}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      {provider.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {provider.description}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1">
                  {provider.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2"></div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Processing time and fees */}
                <div className="pt-2 border-t border-gray-200 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Processing time:</span>
                    <span className="font-medium text-gray-700">{provider.processingTime}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Fees:</span>
                    <span className="font-medium text-gray-700">{provider.fees}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional info */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-start space-x-2">
          <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center mt-0.5">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          </div>
          <div className="text-sm text-gray-600">
            <p className="font-medium mb-1">Secure Payment Processing</p>
            <p>
              {selectedProvider === 'STRIPE' 
                ? 'Your payment information is processed securely by Stripe and never stored on our servers.'
                : 'Your international transfer is processed securely by Wise with bank-level security and regulated by financial authorities.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}