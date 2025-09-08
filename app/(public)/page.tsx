import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Welcome to Dance Platform
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Discover your passion for dance with our expert instructors
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/classes"
                className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                Browse Classes
              </Link>
              <Link
                href="/events"
                className="px-8 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-400 transition"
              >
                Upcoming Events
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-50 to-transparent"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
              <p className="text-gray-600">Learn from certified professionals with years of experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏃</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">All Levels Welcome</h3>
              <p className="text-gray-600">From beginners to advanced, we have classes for everyone</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📍</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Multiple Locations</h3>
              <p className="text-gray-600">Convenient venues across the city with modern facilities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Dancing?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join our community of dancers and discover the joy of movement
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
            >
              Get Started
            </Link>
            <Link
              href="/contact"
              className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-purple-600">500+</div>
              <div className="text-gray-600 mt-2">Happy Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">20+</div>
              <div className="text-gray-600 mt-2">Dance Styles</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">15+</div>
              <div className="text-gray-600 mt-2">Expert Instructors</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">5</div>
              <div className="text-gray-600 mt-2">Studio Locations</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
