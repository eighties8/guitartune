import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
            <p className="text-neutral-300 mb-4">
              GuitarTune.app collects minimal information necessary to provide our guitar tuning service:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Audio input from your microphone for tuning purposes (processed locally)</li>
              <li>Usage analytics to improve our service</li>
              <li>Device information for compatibility</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
            <p className="text-neutral-300 mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Provide guitar tuning functionality</li>
              <li>Improve our service and user experience</li>
              <li>Analyze usage patterns to enhance features</li>
              <li>Ensure technical compatibility</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Third-Party Services</h2>
            <p className="text-neutral-300 mb-4">
              We may use third-party services including:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Google Analytics for website analytics</li>
              <li>Google AdSense for advertising (if applicable)</li>
              <li>Cloud hosting services for website operation</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Cookies and Tracking</h2>
            <p className="text-neutral-300 mb-4">
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Remember your preferences</li>
              <li>Analyze website traffic</li>
              <li>Provide personalized content</li>
              <li>Improve our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
            <p className="text-neutral-300 mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>SSL encryption for data transmission</li>
              <li>Secure hosting infrastructure</li>
              <li>Regular security updates</li>
              <li>Limited data retention periods</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
            <p className="text-neutral-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request data correction or deletion</li>
              <li>Opt-out of data collection</li>
              <li>Contact us with privacy concerns</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Children's Privacy</h2>
            <p className="text-neutral-300 mb-4">
              Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Changes to This Policy</h2>
            <p className="text-neutral-300 mb-4">
              We may update this Privacy Policy from time to time. We will notify users of any material changes by posting the new policy on this page.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
            <p className="text-neutral-300 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
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
