'use client';

export default function ContactPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20" style={{background: 'var(--primary-dark)', color: 'white'}}>
        <div className="dance-container text-center">
          <h1 className="text-5xl font-bold mb-4 dance-font">📞 Get in Touch</h1>
          <p className="text-xl opacity-90 mb-8">Ready to start dancing? We're here to help you find the perfect class!</p>
          
          {/* Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-2xl mx-auto">
            <a href="tel:+1234567890" className="px-8 py-4 bg-white rounded-full font-bold text-lg hover:transform hover:scale-105 hover:shadow-2xl transition-all duration-300" 
               style={{color: 'var(--primary-dark)'}}>
              📱 Call Now: (123) 456-7890
            </a>
            <a href="mailto:info@dancelink.com" className="px-8 py-4 border-2 border-white text-white rounded-full font-semibold hover:bg-white hover:text-gray-800 hover:transform hover:scale-105 transition-all duration-300">
              ✉️ Email Us
            </a>
          </div>
        </div>
      </section>
      
      {/* Quick Options Section */}
      <section className="py-12 bg-white">
        <div className="dance-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="dance-card text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">🎁</div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--primary-dark)'}}>Book Free Trial</h3>
              <p className="mb-4" style={{color: 'var(--neutral-gray)'}}>Try any class for free and see if it's right for you</p>
              <a href="tel:+1234567890" className="dance-btn dance-btn-primary">Book Now</a>
            </div>
            <div className="dance-card text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">💬</div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--primary-dark)'}}>Live Chat</h3>
              <p className="mb-4" style={{color: 'var(--neutral-gray)'}}>Get instant answers to your questions</p>
              <button className="dance-btn dance-btn-secondary" onClick={() => alert('Chat feature coming soon!')}>Chat Now</button>
            </div>
            <div className="dance-card text-center hover:transform hover:scale-105 transition-all duration-300">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-3" style={{color: 'var(--primary-dark)'}}>Schedule Visit</h3>
              <p className="mb-4" style={{color: 'var(--neutral-gray)'}}>Visit our studio and meet our instructors</p>
              <a href="mailto:info@dancelink.com" className="dance-btn dance-btn-primary">Schedule</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20" style={{background: 'var(--neutral-light)'}}>
        <div className="dance-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--primary-dark)'}}>📝 Send Us a Message</h2>
            <p style={{color: 'var(--neutral-gray)'}}>Fill out the form below and we'll get back to you within 24 hours</p>
          </div>
          <div className="dance-card max-w-2xl mx-auto">
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-dark)'}}>Name *</label>
                  <input className="w-full px-4 py-3 border-2 rounded-full focus:border-yellow-400 focus:outline-none transition border-gray-300" 
                         placeholder="Your name" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-dark)'}}>Phone</label>
                  <input type="tel" className="w-full px-4 py-3 border-2 rounded-full focus:border-yellow-400 focus:outline-none transition border-gray-300" 
                         placeholder="(123) 456-7890" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-dark)'}}>Email *</label>
                <input type="email" className="w-full px-4 py-3 border-2 rounded-full focus:border-yellow-400 focus:outline-none transition border-gray-300" 
                       placeholder="you@example.com" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-dark)'}}>I'm interested in:</label>
                <select className="w-full px-4 py-3 border-2 rounded-full focus:border-yellow-400 focus:outline-none transition border-gray-300">
                  <option value="">Select an option</option>
                  <option value="trial">🎁 Free Trial Class</option>
                  <option value="classes">💃 Regular Classes</option>
                  <option value="events">🎉 Events & Workshops</option>
                  <option value="private">👨‍🏫 Private Lessons</option>
                  <option value="other">❓ Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{color: 'var(--primary-dark)'}}>Message</label>
                <textarea className="w-full px-4 py-3 border-2 rounded-lg focus:border-yellow-400 focus:outline-none transition border-gray-300" 
                          rows={5} placeholder="Tell us about your dance goals, experience level, or any questions you have..."></textarea>
              </div>
              <div className="text-center">
                <button type="submit" className="dance-btn dance-btn-primary px-12 hover:transform hover:scale-105 transition-all duration-300">
                  🚀 Send Message
                </button>
                <p className="text-sm mt-4 opacity-75">We typically respond within 2-4 hours during business hours</p>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="dance-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4" style={{color: 'var(--primary-dark)'}}>❓ Frequently Asked Questions</h2>
            <p style={{color: 'var(--neutral-gray)'}}>Quick answers to common questions</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="dance-card">
              <h3 className="text-lg font-bold mb-3" style={{color: 'var(--primary-dark)'}}>Do I need experience to start?</h3>
              <p style={{color: 'var(--neutral-gray)'}}>Not at all! We have beginner-friendly classes for all dance styles. Our instructors are experienced in teaching complete beginners.</p>
            </div>
            <div className="dance-card">
              <h3 className="text-lg font-bold mb-3" style={{color: 'var(--primary-dark)'}}>What should I wear?</h3>
              <p style={{color: 'var(--neutral-gray)'}}>Comfortable clothing that allows you to move freely. Most students wear athletic wear or casual clothes with supportive shoes.</p>
            </div>
            <div className="dance-card">
              <h3 className="text-lg font-bold mb-3" style={{color: 'var(--primary-dark)'}}>Can I try before I commit?</h3>
              <p style={{color: 'var(--neutral-gray)'}}>Yes! We offer a free trial class for all new students. This lets you experience our teaching style and see if the class is right for you.</p>
            </div>
            <div className="dance-card">
              <h3 className="text-lg font-bold mb-3" style={{color: 'var(--primary-dark)'}}>How do I book a class?</h3>
              <p style={{color: 'var(--neutral-gray)'}}>Call us at (123) 456-7890, send us an email, or fill out the contact form above. We'll help you find the perfect class!</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
