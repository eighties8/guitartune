import Link from 'next/link';

export default function About() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">About GuitarTune.app</h1>
        
        <div className="prose prose-invert max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Our Mission</h2>
            <p className="text-neutral-300 mb-4">
              GuitarTune.app is dedicated to providing musicians with a professional, accurate, and easy-to-use guitar tuning tool. We believe that every guitarist deserves access to precise tuning technology, whether they're a beginner or a seasoned professional.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-neutral-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-blue-400">Professional Tuning</h3>
                <p className="text-neutral-300">
                  Advanced pitch detection algorithms provide accurate tuning for all guitar types and tunings.
                </p>
              </div>
              <div className="bg-neutral-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-purple-400">Easy to Use</h3>
                <p className="text-neutral-300">
                  Simple, intuitive interface designed for musicians of all skill levels.
                </p>
              </div>
              <div className="bg-neutral-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-green-400">Multiple Tunings</h3>
                <p className="text-neutral-300">
                  Support for standard and alternative guitar tunings to suit your playing style.
                </p>
              </div>
              <div className="bg-neutral-900 p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-3 text-yellow-400">Real-time Feedback</h3>
                <p className="text-neutral-300">
                  Visual indicators and precise cent measurements for perfect tuning accuracy.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How It Works</h2>
            <p className="text-neutral-300 mb-4">
              Our guitar tuner uses advanced audio processing technology to analyze the frequency of your guitar strings in real-time. Here's how it works:
            </p>
            <ol className="list-decimal list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Microphone Access:</strong> Allow microphone access when prompted</li>
              <li><strong>String Selection:</strong> Choose the string you want to tune</li>
              <li><strong>Play the String:</strong> Pluck the string clearly</li>
              <li><strong>Follow the Indicator:</strong> Adjust tuning based on visual feedback</li>
              <li><strong>Perfect Pitch:</strong> Achieve precise tuning with cent-level accuracy</li>
            </ol>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Technology</h2>
            <p className="text-neutral-300 mb-4">
              GuitarTune.app is built with modern web technologies to provide the best possible tuning experience:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Advanced FFT (Fast Fourier Transform) algorithms for precise frequency analysis</li>
              <li>Real-time audio processing using Web Audio API</li>
              <li>Responsive design that works on desktop and mobile devices</li>
              <li>Optimized for low latency and high accuracy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Privacy & Security</h2>
            <p className="text-neutral-300 mb-4">
              We take your privacy seriously. Our tuner processes audio locally in your browser - we don't store or transmit your audio data. All tuning calculations happen on your device for maximum privacy and security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Get Started</h2>
            <p className="text-neutral-300 mb-6">
              Ready to tune your guitar? Head back to our main tuner and start playing!
            </p>
            <Link 
              href="/" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Tuning
            </Link>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-neutral-300 mb-4">
              Have questions, suggestions, or feedback? We'd love to hear from you:
            </p>
            <p className="text-neutral-300">
              Email: contact@guitartune.app<br />
              Website: <Link href="https://guitartune.app" className="text-blue-400 hover:text-blue-300">https://guitartune.app</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
