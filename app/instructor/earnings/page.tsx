'use client'

export default function InstructorEarningsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Earnings & Payments</h1>
        <p className="text-gray-600 mt-2">Track your teaching income and payment history</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">💰</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Earnings Dashboard</h3>
          <p className="text-gray-600 mb-6">
            Earnings tracking and payment management features are coming soon!
          </p>
          
          <div className="max-w-md mx-auto bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-800 font-medium">This Month's Earnings</p>
            <p className="text-3xl font-bold text-green-900">$3,420.00</p>
            <p className="text-xs text-green-700 mt-1">32 classes taught</p>
          </div>
        </div>
      </div>
    </div>
  )
}
