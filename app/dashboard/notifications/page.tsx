'use client'

export default function NotificationsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
        <p className="text-gray-600 mt-2">Stay updated about your classes and events</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">🔔</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notifications Center</h3>
          <p className="text-gray-600 mb-6">
            Notifications are coming soon! You'll receive updates about upcoming classes, event changes, and more.
          </p>

          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm text-gray-900">Your Beginner Salsa class starts in 3 days</p>
              <p className="text-xs text-gray-600 mt-1">Dec 10, 2024 at 7:00 PM</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm text-gray-900">New workshop recommended: Contemporary Flow</p>
              <p className="text-xs text-gray-600 mt-1">Spots are limited</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg text-left">
              <p className="text-sm text-gray-900">Payment received for Hip Hop Fundamentals</p>
              <p className="text-xs text-gray-600 mt-1">Receipt available in Payment History</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
