'use client'

import { useAuth } from '@/app/lib/auth-context'
import NotificationSettings from '@/app/components/notifications/NotificationSettings'

export default function SettingsPage() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <p className="text-gray-600">Please log in to view settings</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your preferences and privacy options</p>
      </div>

      {/* Notification Settings */}
      <NotificationSettings userId={user.id} />

      {/* Other Settings (Placeholder for future) */}
      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Other Settings</h2>
        <div className="text-center py-8">
          <span className="text-4xl mb-4 block">⚙️</span>
          <p className="text-gray-600 mb-6">
            Additional settings like language, privacy, and account preferences are coming soon!
          </p>

          <div className="max-w-xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-900">Language</p>
              <p className="text-xs text-gray-600 mt-1">English (US)</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-900">Privacy</p>
              <p className="text-xs text-gray-600 mt-1">Standard</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-900">Time Zone</p>
              <p className="text-xs text-gray-600 mt-1">Automatic</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-900">Theme</p>
              <p className="text-xs text-gray-600 mt-1">System Default</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
