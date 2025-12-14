import { Link } from 'react-router-dom'

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-24 transition-colors">
      <div className="container mx-auto max-w-4xl px-6 py-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Terms of Service</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Last updated: December 11, 2025</p>

        <div className="bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-6 space-y-8 backdrop-blur-lg">
          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Acceptance of Terms</h2>
            <p className="text-slate-700 dark:text-slate-300">By accessing or using NexVeris.ai, you agree to be bound by these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Services</h2>
            <p className="text-slate-700 dark:text-slate-300">We provide AI-powered analysis of news articles, signals, and related insights. Features may change or be updated without prior notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Accounts</h2>
            <p className="text-slate-700 dark:text-slate-300">You are responsible for safeguarding your account credentials and for activities under your account. Notify us immediately of any unauthorized use.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Subscriptions and Billing</h2>
            <p className="text-slate-700 dark:text-slate-300">Paid plans renew on a subscription basis unless cancelled. Prices and billing terms are shown at checkout. Taxes may apply. You can manage your plan on the <Link to="/account" className="text-indigo-600 hover:underline">Account</Link> page.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Acceptable Use</h2>
            <ul className="list-disc pl-6 space-y-1 text-slate-700 dark:text-slate-300">
              <li>No scraping, mining, or bulk extraction beyond allowed API limits</li>
              <li>No reverse engineering or circumventing security</li>
              <li>No illegal, harmful, or abusive activities</li>
              <li>No sharing of paid content outside your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Intellectual Property</h2>
            <p className="text-slate-700 dark:text-slate-300">The platform, models, and content are owned by NexVeris.ai or its licensors. You receive a limited, non-transferable right to use the service in accordance with these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">User Content</h2>
            <p className="text-slate-700 dark:text-slate-300">You retain rights to content you submit. You grant us a limited license to process that content to provide the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Third-Party Links</h2>
            <p className="text-slate-700 dark:text-slate-300">The service may link to third-party sites or sources. We are not responsible for their content, policies, or practices.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Disclaimers</h2>
            <p className="text-slate-700 dark:text-slate-300">The service is provided on an "as is" and "as available" basis without warranties of any kind. Analysis outputs are informational and do not constitute financial or legal advice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Limitation of Liability</h2>
            <p className="text-slate-700 dark:text-slate-300">To the maximum extent permitted by law, NexVeris.ai is not liable for indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Indemnification</h2>
            <p className="text-slate-700 dark:text-slate-300">You agree to indemnify and hold harmless NexVeris.ai from claims, damages, and expenses arising from your use of the service or violation of these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Termination</h2>
            <p className="text-slate-700 dark:text-slate-300">We may suspend or terminate access for any violation of these terms or misuse of the service. You may stop using the service at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Governing Law</h2>
            <p className="text-slate-700 dark:text-slate-300">These terms are governed by the laws applicable to NexVeris.ai. Disputes will be handled in the competent courts of that jurisdiction.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Changes</h2>
            <p className="text-slate-700 dark:text-slate-300">We may update these Terms of Service from time to time. Continued use of the service after changes indicates acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Contact</h2>
            <p className="text-slate-700 dark:text-slate-300">Contact support at support@nexveris.ai or through the <Link to="/account" className="text-indigo-600 hover:underline">Account</Link> page.</p>
          </section>
        </div>
      </div>
    </div>
  )
}