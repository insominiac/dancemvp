'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface BookingItem {
  id: string
  title: string
  price: string
  type: 'class' | 'event'
  spotsLeft?: number
  maxCapacity?: number
}

interface GuestBookingFormProps {
  item: BookingItem
  isAvailable: boolean
}

export default function GuestBookingForm({ item, isAvailable }: GuestBookingFormProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    emergencyContact: '',
    emergencyPhone: '',
    experience: 'beginner',
    notes: '',
    agreeToTerms: false
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.agreeToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare booking data to pass to payment page
      const bookingData = {
        [item.type === 'class' ? 'classId' : 'eventId']: item.id,
        className: item.title,
        price: item.price,
        bookingType: item.type,
        userDetails: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          emergencyContact: formData.emergencyContact,
          emergencyPhone: formData.emergencyPhone,
          experience: formData.experience,
          notes: formData.notes
        }
      }

      // Redirect to payment page with booking data
      const encodedData = encodeURIComponent(JSON.stringify(bookingData))
      router.push(`/booking/payment?data=${encodedData}`)
      
    } catch (error) {
      console.error('Booking preparation error:', error)
      alert('Failed to prepare booking. Please try again.')
      setIsSubmitting(false)
    }
  }

  if (!isAvailable) {
    return (
      <button
        disabled
        className="w-full py-4 rounded-full font-semibold bg-gray-400 text-gray-600 cursor-not-allowed"
      >
        {item.type === 'class' ? 'Class' : 'Event'} Unavailable
      </button>
    )
  }

  if (!showForm) {
    return (
      <div>
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-4 rounded-full font-semibold bg-white hover:transform hover:-translate-y-1 hover:shadow-lg transition-all"
          style={{ color: 'var(--primary-dark)' }}
        >
          Book {item.type === 'class' ? 'Class' : 'Event'} Now
        </button>
        <p className="text-xs text-center mt-4 opacity-75">
          No account required • Free cancellation up to 24 hours
        </p>
      </div>
    )
  }

  return (
    <div className="guest-booking-form">
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Book {item.title}</h3>
        <p className="text-sm opacity-80">Price: ${item.price}</p>
        {item.spotsLeft && (
          <p className="text-sm opacity-80">{item.spotsLeft} spots remaining</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">
              Email Address *
            </label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="your.email@example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="(555) 123-4567"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">
              Experience Level
            </label>
            <select
              name="experience"
              value={formData.experience}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              <option value="beginner" className="text-black">Beginner</option>
              <option value="intermediate" className="text-black">Intermediate</option>
              <option value="advanced" className="text-black">Advanced</option>
              <option value="professional" className="text-black">Professional</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">
              Emergency Contact Name *
            </label>
            <input
              type="text"
              name="emergencyContact"
              required
              value={formData.emergencyContact}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Emergency contact name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 opacity-90">
              Emergency Contact Phone *
            </label>
            <input
              type="tel"
              name="emergencyPhone"
              required
              value={formData.emergencyPhone}
              onChange={handleInputChange}
              className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Emergency contact phone"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 opacity-90">
            Special Requirements or Notes
          </label>
          <textarea
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleInputChange}
            className="w-full px-3 py-2 rounded-lg border bg-white/10 border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
            placeholder="Any special requirements, dietary restrictions, or questions..."
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleInputChange}
            className="rounded border-white/20 bg-white/10 text-white focus:ring-white/50"
          />
          <label htmlFor="agreeToTerms" className="text-sm opacity-90">
            I agree to the{' '}
            <a href="/terms" target="_blank" className="underline hover:opacity-80">
              terms and conditions
            </a>{' '}
            and{' '}
            <a href="/privacy" target="_blank" className="underline hover:opacity-80">
              privacy policy
            </a>
          </label>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="flex-1 py-3 rounded-full font-semibold bg-white/20 hover:bg-white/30 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-full font-semibold bg-white hover:bg-white/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: 'var(--primary-dark)' }}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Processing...
              </div>
            ) : (
              `Book for $${item.price}`
            )}
          </button>
        </div>
      </form>
    </div>
  )
}