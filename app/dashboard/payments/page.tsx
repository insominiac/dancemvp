'use client'

export default function PaymentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment History</h1>
        <p className="text-gray-600 mt-2">View your payment transactions and receipts</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">💳</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Payment History</h3>
          <p className="text-gray-600 mb-6">
            Payment history features are coming soon! You'll be able to view all your transactions, 
            download receipts, and manage your payment methods.
          </p>
          
          {/* Demo payment history */}
          <div className="max-w-2xl mx-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg text-left">
                <div>
                  <p className="font-medium text-gray-900">Beginner Salsa Class</p>
                  <p className="text-sm text-gray-600">Dec 8, 2024 • DEMO12345</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">$45.00</p>
                  <p className="text-xs text-green-600">✅ Paid</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg text-left">
                <div>
                  <p className="font-medium text-gray-900">Weekend Dance Workshop</p>
                  <p className="text-sm text-gray-600">Dec 5, 2024 • DEMO67890</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">$55.00</p>
                  <p className="text-xs text-green-600">✅ Paid</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg text-left">
                <div>
                  <p className="font-medium text-gray-900">Hip Hop Fundamentals</p>
                  <p className="text-sm text-gray-600">Nov 15, 2024 • DEMO-PAST</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">$40.00</p>
                  <p className="text-xs text-blue-600">✅ Completed</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-blue-800 font-medium">Total Spent</p>
                <p className="text-2xl font-bold text-blue-900">$320.00</p>
                <p className="text-xs text-blue-700 mt-1">Across all bookings</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
