export default function PricingPage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="py-20" style={{background: 'linear-gradient(135deg, var(--neutral-light), rgba(255,255,255,0.8)'}}>
        <div className="dance-container">
          <div className="dance-section-header">
            <h1 className="dance-section-title text-5xl mb-4 dance-font">Pricing</h1>
            <p className="text-xl">Simple, transparent pricing for everyone</p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 bg-white">
        <div className="dance-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="dance-card text-center">
              <div className="text-4xl mb-4">💫</div>
              <h3 className="text-2xl font-semibold mb-4" style={{color: 'var(--primary-dark)'}}>Single Class</h3>
              <p className="text-5xl font-bold mb-6" style={{color: 'var(--primary-gold)'}}>$20</p>
              <ul className="space-y-3 mb-8" style={{color: 'var(--neutral-gray)'}}>
                <li>✓ One-time class entry</li>
                <li>✓ Beginner to Advanced</li>
                <li>✓ Any dance style</li>
              </ul>
              <button className="dance-btn dance-btn-primary w-full">Choose Plan</button>
            </div>
            
            <div className="dance-card text-center" style={{border: '2px solid var(--primary-gold)', transform: 'scale(1.05)'}}>
              <div className="text-4xl mb-4">⭐</div>
              <h3 className="text-2xl font-semibold mb-4" style={{color: 'var(--primary-dark)'}}>Monthly Pass</h3>
              <p className="text-5xl font-bold mb-6" style={{color: 'var(--primary-gold)'}}>$80</p>
              <ul className="space-y-3 mb-8" style={{color: 'var(--neutral-gray)'}}>
                <li>✓ Up to 8 classes</li>
                <li>✓ Priority booking</li>
                <li>✓ Member discounts</li>
              </ul>
              <button className="dance-btn dance-btn-primary w-full">Most Popular</button>
            </div>
            
            <div className="dance-card text-center">
              <div className="text-4xl mb-4">🔥</div>
              <h3 className="text-2xl font-semibold mb-4" style={{color: 'var(--primary-dark)'}}>Unlimited</h3>
              <p className="text-5xl font-bold mb-6" style={{color: 'var(--primary-gold)'}}>$120</p>
              <ul className="space-y-3 mb-8" style={{color: 'var(--neutral-gray)'}}>
                <li>✓ Unlimited classes</li>
                <li>✓ All levels & styles</li>
                <li>✓ Best value</li>
              </ul>
              <button className="dance-btn dance-btn-primary w-full">Choose Plan</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
