'use client'

export default function InstructorSettingsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Instructor Settings</h1>
        <p className="text-gray-600 mt-2">Manage your instructor profile and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">⚙️</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile & Availability</h3>
          <p className="text-gray-600 mb-6">
            Settings are coming soon! You'll be able to update your bio, set availability, and configure notifications.
          </p>
        </div>
      </div>
    </div>
  )
}
