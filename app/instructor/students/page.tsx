'use client'

export default function InstructorStudentsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Students</h1>
        <p className="text-gray-600 mt-2">View and manage your enrolled students</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">👥</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Student Management</h3>
          <p className="text-gray-600 mb-6">
            Student management features are coming soon! You'll be able to track attendance, 
            add progress notes, and communicate with students.
          </p>
          
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg text-left">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    S
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Sarah Martinez</p>
                    <p className="text-sm text-gray-600">Beginner Salsa</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Attendance: 95%</span>
                  <span>Last class: 2 days ago</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-left">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    A
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Alex Thompson</p>
                    <p className="text-sm text-gray-600">Intermediate Bachata</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Attendance: 88%</span>
                  <span>Last class: 1 day ago</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-left">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    E
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Emma Wilson</p>
                    <p className="text-sm text-gray-600">Beginner Salsa</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Attendance: 92%</span>
                  <span>Last class: 3 days ago</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg text-left">
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3">
                    M
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Miguel Santos</p>
                    <p className="text-sm text-gray-600">Advanced Tango</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Attendance: 100%</span>
                  <span>Last class: 1 day ago</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <div className="text-center">
                <p className="text-sm text-blue-800 font-medium">Total Students</p>
                <p className="text-2xl font-bold text-blue-900">156</p>
                <p className="text-xs text-blue-700 mt-1">Across all classes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
