import Link from 'next/link';

export default function Contact() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Contact Us</h1>
        
        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div>
            <h2 className="text-2xl font-semibold mb-6">Get in Touch</h2>
            <p className="text-neutral-300 mb-8">
              Have questions about our guitar tuner? Need technical support? Want to share feedback? We'd love to hear from you!
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Email</h3>
                  <p className="text-neutral-300">contact@guitartune.app</p>
                  <p className="text-sm text-neutral-400">For general inquiries and support</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Technical Support</h3>
                  <p className="text-neutral-300">support@guitartune.app</p>
                  <p className="text-sm text-neutral-400">For technical issues and bug reports</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Feedback</h3>
                  <p className="text-neutral-300">feedback@guitartune.app</p>
                  <p className="text-sm text-neutral-400">Share your ideas and suggestions</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Contact Form */}
          <div className="bg-neutral-900 p-6 rounded-lg">
            <h2 className="text-2xl font-semibold mb-6">Send us a Message</h2>
            <form className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-neutral-300 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Your name"
                />
              </div>
              
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
                  Subject
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a subject</option>
                  <option value="general">General Inquiry</option>
                  <option value="technical">Technical Support</option>
                  <option value="feedback">Feedback</option>
                  <option value="bug">Bug Report</option>
                  <option value="feature">Feature Request</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-300 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-md text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Tell us how we can help..."
                ></textarea>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
        
        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-neutral-900 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">How accurate is the guitar tuner?</h3>
              <p className="text-neutral-300">
                Our tuner provides professional-grade accuracy with cent-level precision. It uses advanced FFT algorithms to detect pitch with high accuracy.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Does the tuner work on mobile devices?</h3>
              <p className="text-neutral-300">
                Yes! Our tuner is fully responsive and works on desktop, tablet, and mobile devices. Just allow microphone access when prompted.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">Is my audio data stored or transmitted?</h3>
              <p className="text-neutral-300">
                No, all audio processing happens locally in your browser. We don't store or transmit your audio data for maximum privacy.
              </p>
            </div>
            
            <div className="bg-neutral-900 p-4 rounded-lg">
              <h3 className="font-semibold text-white mb-2">What guitar tunings are supported?</h3>
              <p className="text-neutral-300">
                We support standard tuning (E A D G B E) and plan to add support for alternative tunings in future updates.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
