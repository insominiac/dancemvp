'use client'

export default function InstructorClassesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Classes</h1>
        <p className="text-gray-600 mt-2">Manage your teaching schedule and class details</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📚</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Class Management</h3>
          <p className="text-gray-600 mb-6">
            Class management features are coming soon! You'll be able to manage schedules, 
            track attendance, and update class details.
          </p>
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg text-left">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-blue-900">Beginner Salsa</p>
                  <p className="text-sm text-blue-700">Mondays & Thursdays 6:00 PM</p>
                  <p className="text-xs text-blue-600">12/15 students enrolled</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg text-left">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-purple-900">Intermediate Bachata</p>
                  <p className="text-sm text-purple-700">Tuesdays & Fridays 7:30 PM</p>
                  <p className="text-xs text-purple-600">8/12 students enrolled</p>
                </div>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
