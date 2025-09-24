export default function FAQPage() {
  const faqs = [
    { q: 'How do I book a class?', a: 'Browse classes, open the class page, and use the Book button.' },
    { q: 'Can beginners join?', a: 'Absolutely! We have classes for all levels.' },
    { q: 'Do you offer refunds?', a: 'Yes, up to 24 hours before the class or event.' },
  ]
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-6 dance-font">Frequently Asked Questions</h1>
      <div className="space-y-4">
        {faqs.map((f, i) => (
          <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
            <p className="text-gray-700">{f.a}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
