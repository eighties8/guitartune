import Link from 'next/link';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="mb-8">
          <Link href="/" className="text-blue-400 hover:text-blue-300 transition-colors">
            ← Back to Home
          </Link>
        </div>
        
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-invert max-w-none">
          <p className="text-neutral-300 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>
          
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-neutral-300 mb-4">
              By accessing and using GuitarTune.app, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">2. Use License</h2>
            <p className="text-neutral-300 mb-4">
              Permission is granted to temporarily download one copy of the materials (information or software) on GuitarTune.app for personal, non-commercial transitory viewing only.
            </p>
            <p className="text-neutral-300 mb-4">This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside text-neutral-300 space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on GuitarTune.app</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">3. Disclaimer</h2>
            <p className="text-neutral-300 mb-4">
              The materials on GuitarTune.app are provided on an 'as is' basis. GuitarTune.app makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">4. Limitations</h2>
            <p className="text-neutral-300 mb-4">
              In no event shall GuitarTune.app or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GuitarTune.app, even if GuitarTune.app or a GuitarTune.app authorized representative has been notified orally or in writing of the possibility of such damage.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">5. Accuracy of Materials</h2>
            <p className="text-neutral-300 mb-4">
              The materials appearing on GuitarTune.app could include technical, typographical, or photographic errors. GuitarTune.app does not warrant that any of the materials on its website are accurate, complete or current. GuitarTune.app may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">6. Links</h2>
            <p className="text-neutral-300 mb-4">
              GuitarTune.app has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by GuitarTune.app of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">7. Modifications</h2>
            <p className="text-neutral-300 mb-4">
              GuitarTune.app may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">8. Governing Law</h2>
            <p className="text-neutral-300 mb-4">
              These terms and conditions are governed by and construed in accordance with the laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
            <p className="text-neutral-300 mb-4">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="text-neutral-300">
              Email: legal@guitartune.app<br />
              Website: <Link href="https://guitartune.app" className="text-blue-400 hover:text-blue-300">https://guitartune.app</Link>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
