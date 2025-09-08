import Link from 'next/link'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl">💃</span>
                <span className="text-xl font-bold text-gray-900">Dance Platform</span>
              </Link>
            </div>

            {/* Main Navigation */}
            <nav className="hidden md:flex space-x-8">
              <Link href="/classes" className="text-gray-700 hover:text-purple-600 font-medium">
                Classes
              </Link>
              <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium">
                Events
              </Link>
              <Link href="/instructors" className="text-gray-700 hover:text-purple-600 font-medium">
                Instructors
              </Link>
              <Link href="/about" className="text-gray-700 hover:text-purple-600 font-medium">
                About
              </Link>
              <Link href="/contact" className="text-gray-700 hover:text-purple-600 font-medium">
                Contact
              </Link>
            </nav>

            {/* Auth Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                href="/login" 
                className="text-gray-700 hover:text-purple-600 font-medium"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dance Platform</h3>
              <p className="text-gray-400">
                Your premier destination for dance classes and events.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/classes" className="hover:text-white">Classes</Link></li>
                <li><Link href="/events" className="hover:text-white">Events</Link></li>
                <li><Link href="/instructors" className="hover:text-white">Instructors</Link></li>
                <li><Link href="/pricing" className="hover:text-white">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect</h4>
              <p className="text-gray-400 mb-4">Follow us on social media</p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white">📘</a>
                <a href="#" className="text-gray-400 hover:text-white">📷</a>
                <a href="#" className="text-gray-400 hover:text-white">🐦</a>
                <a href="#" className="text-gray-400 hover:text-white">📺</a>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>&copy; 2024 Dance Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
