'use client'

export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-2">Manage your personal information and preferences</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">👤</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Management</h3>
          <p className="text-gray-600 mb-6">
            Profile management features are coming soon! You'll be able to update your personal information, 
            change your password, and manage your notification preferences.
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Name</span>
              <span className="text-gray-900 font-medium">Demo User</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Email</span>
              <span className="text-gray-900 font-medium">demo@example.com</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Member Since</span>
              <span className="text-gray-900 font-medium">Demo Account</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
