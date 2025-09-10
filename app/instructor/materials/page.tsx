'use client'

export default function InstructorMaterialsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Class Materials</h1>
        <p className="text-gray-600 mt-2">Upload lesson plans, playlists, and resources</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📝</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Teaching Materials</h3>
          <p className="text-gray-600 mb-6">
            Resource management features are coming soon!
          </p>
        </div>
      </div>
    </div>
  )
}
