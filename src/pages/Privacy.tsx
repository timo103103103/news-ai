import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Privacy Policy</h1>
        <p className="text-slate-600 mb-8">Last updated: December 11, 2025</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Overview</h2>
            <p className="text-slate-700">This Privacy Policy explains how NexVeris.ai collects, uses, discloses, and protects your information when you use our website and services. By using the service, you agree to the practices described here.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Information We Collect</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-700">
              <li>Account information such as name and email</li>
              <li>Authentication and session data</li>
              <li>Usage data, logs, device and browser information</li>
              <li>Content you submit (e.g., article URLs and analysis preferences)</li>
              <li>Payment and subscription details processed by our providers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">How We Use Information</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-700">
              <li>Provide, operate, and improve the service</li>
              <li>Authenticate users and maintain account security</li>
              <li>Personalize analysis results and recommendations</li>
              <li>Communicate updates, alerts, and customer support messages</li>
              <li>Comply with legal obligations and enforce policies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Data Retention</h2>
            <p className="text-slate-700">We retain information as long as your account is active or as needed to provide the service. We may retain and use information to comply with legal obligations, resolve disputes, and enforce agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Cookies and Analytics</h2>
            <p className="text-slate-700 mb-2">We use cookies and similar technologies to remember preferences, maintain sessions, and measure performance. Analytics help us understand usage patterns and improve features.</p>
            <p className="text-slate-700">You can control cookies through your browser settings. Disabling cookies may affect functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Sharing and Disclosure</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-700">
              <li>Service providers that help operate the platform</li>
              <li>Compliance with law, legal process, or enforceable requests</li>
              <li>Protection of rights, safety, and security of users and the platform</li>
              <li>Business transfers in connection with mergers, acquisitions, or reorganizations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Your Rights</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-700">
              <li>Access and update your account information</li>
              <li>Request deletion of your data subject to legal obligations</li>
              <li>Opt out of certain communications</li>
              <li>Lodge a complaint with your local data authority if applicable</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Security</h2>
            <p className="text-slate-700">We implement administrative, technical, and physical safeguards to protect information. No method of transmission or storage is completely secure. We continuously improve security practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Children</h2>
            <p className="text-slate-700">The service is not directed to children under 13. We do not knowingly collect data from children. If you believe a child has provided information, contact us to remove it.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Changes</h2>
            <p className="text-slate-700">We may update this Privacy Policy from time to time. The updated version will be indicated by a revised date and will be effective as soon as it is accessible.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Contact</h2>
            <p className="text-slate-700">Questions or requests can be sent via the <Link to="/account" className="text-indigo-600 hover:underline">Account</Link> page or by email at support@nexveris.ai.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
