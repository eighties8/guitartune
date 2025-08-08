import Link from 'next/link';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">What Are Cookies</h2>
            <p className="text-neutral-300 mb-4">
              Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and to provide information to website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
            <p className="text-neutral-300 mb-4">
              GuitarTune.app uses cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Essential Cookies:</strong> Required for the website to function properly</li>
              <li><strong>Analytics Cookies:</strong> Help us understand how visitors use our website</li>
              <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
              <li><strong>Advertising Cookies:</strong> Used to deliver relevant advertisements (if applicable)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Types of Cookies We Use</h2>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-blue-400">Essential Cookies</h3>
              <p className="text-neutral-300 mb-2">
                These cookies are necessary for the website to function and cannot be switched off in our systems.
              </p>
              <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                <li>Session management</li>
                <li>Security features</li>
                <li>Basic functionality</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-green-400">Analytics Cookies</h3>
              <p className="text-neutral-300 mb-2">
                These cookies help us understand how visitors interact with our website.
              </p>
              <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                <li>Google Analytics</li>
                <li>Page view tracking</li>
                <li>User behavior analysis</li>
              </ul>
            </div>

            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 text-purple-400">Preference Cookies</h3>
              <p className="text-neutral-300 mb-2">
                These cookies remember your choices and preferences.
              </p>
              <ul className="list-disc list-inside text-neutral-300 space-y-1 ml-4">
                <li>Language preferences</li>
                <li>Theme settings</li>
                <li>User interface preferences</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Third-Party Cookies</h2>
            <p className="text-neutral-300 mb-4">
              We may use third-party services that set their own cookies:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Google Analytics:</strong> Website analytics and performance tracking</li>
              <li><strong>Google AdSense:</strong> Advertising services (if applicable)</li>
              <li><strong>Social Media:</strong> Social sharing and integration features</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Managing Cookies</h2>
            <p className="text-neutral-300 mb-4">
              You can control and manage cookies in several ways:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Browser Settings:</strong> Most browsers allow you to manage cookies through settings</li>
              <li><strong>Cookie Consent:</strong> We provide options to accept or decline non-essential cookies</li>
              <li><strong>Third-Party Opt-out:</strong> You can opt out of third-party cookies through their respective services</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Cookie Duration</h2>
            <p className="text-neutral-300 mb-4">
              Cookies on our website may be:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li><strong>Session Cookies:</strong> Temporary cookies that expire when you close your browser</li>
              <li><strong>Persistent Cookies:</strong> Cookies that remain on your device for a set period</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="text-neutral-300 mb-4">
              We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-neutral-300 mb-4">
              If you have any questions about our use of cookies, please contact us at:
            </p>
            <p className="text-neutral-300">
              Email: privacy@guitartune.app<br />
              Website: <Link href="https://guitartune.app" className="text-blue-400 hover:text-blue-300">https://guitartune.app</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
