'use client'

export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Account Settings</h1>
        <p className="text-gray-600 mt-2">Manage your preferences and privacy options</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">⚙️</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Settings</h3>
          <p className="text-gray-600 mb-6">
            Settings are coming soon! You'll be able to configure language, privacy, and notification preferences.
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
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-600 mt-1">Enabled</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm font-medium text-gray-900">SMS Notifications</p>
              <p className="text-xs text-gray-600 mt-1">Disabled</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
