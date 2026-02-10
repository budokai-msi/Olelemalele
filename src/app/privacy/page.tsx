'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-surface text-on-surface pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-accent font-bold mb-4 block">
            Legal
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Privacy Policy
          </h1>
          <p className="text-on-muted">
            Last updated: January 29, 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-12 text-on-muted"
        >
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">1. Introduction</h2>
            <p className="leading-relaxed">
              Olelemalele (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and make purchases.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-accent mb-2">Personal Information</h3>
                <p className="leading-relaxed text-on-muted">
                  When you make a purchase or create an account, we collect: name, email address, shipping address, billing address, phone number, and payment information.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-2">Automatically Collected Information</h3>
                <p className="leading-relaxed text-on-muted">
                  We automatically collect: IP address, browser type, device information, pages visited, time spent on pages, and referring website.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-accent mb-2">Cookies</h3>
                <p className="leading-relaxed text-on-muted">
                  We use cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. You can manage cookie preferences through your browser settings.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">3. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-on-muted">
              <li>Process and fulfill your orders</li>
              <li>Send order confirmations and shipping updates</li>
              <li>Respond to customer service inquiries</li>
              <li>Send marketing communications (with your consent)</li>
              <li>Improve our website and services</li>
              <li>Detect and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">4. Information Sharing</h2>
            <p className="leading-relaxed mb-4">
              We do not sell your personal information. We may share information with:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-on-muted">
              <li><strong>Service Providers:</strong> Print partners, payment processors, and shipping carriers who help fulfill orders.</li>
              <li><strong>Analytics Partners:</strong> Services that help us understand website usage.</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">5. Data Security</h2>
            <p className="leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">6. Your Rights</h2>
            <p className="leading-relaxed mb-4">
              Depending on your location, you may have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-on-muted">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Object to processing of your information</li>
              <li>Request data portability</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p className="leading-relaxed mt-4">
              To exercise these rights, contact us at studio@olelemalele.com.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">7. Data Retention</h2>
            <p className="leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, unless a longer retention period is required by law. Order information is retained for 7 years for tax and legal purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">8. International Transfers</h2>
            <p className="leading-relaxed">
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers in compliance with applicable data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">9. Third-Party Links</h2>
            <p className="leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the privacy practices of these websites. We encourage you to read the privacy policies of any linked sites.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">10. Children&apos;s Privacy</h2>
            <p className="leading-relaxed">
              Our services are not directed to individuals under 16. We do not knowingly collect personal information from children. If we become aware of such collection, we will delete the information immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">11. Updates to This Policy</h2>
            <p className="leading-relaxed">
              We may update this Privacy Policy from time to time. The updated version will be indicated by the &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-4">12. Contact Us</h2>
            <p className="leading-relaxed mb-4">
              For questions about this Privacy Policy or our data practices, contact us at:
            </p>
            <div className="p-6 rounded-xl bg-accent/[0.02] border border-[rgb(var(--border))]">
              <p className="font-bold text-on-surface">Olelemalele Studio</p>
              <p className="text-on-muted">Email: studio@olelemalele.com</p>
              <p className="text-on-muted">Sofia, Bulgaria</p>
            </div>
          </section>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-[rgb(var(--border))] flex flex-wrap gap-6 justify-center text-sm"
        >
          <Link href="/terms" className="text-on-muted hover:text-accent transition-colors">
            Terms of Service
          </Link>
          <Link href="/shipping" className="text-on-muted hover:text-accent transition-colors">
            Shipping & Returns
          </Link>
          <Link href="/faq" className="text-on-muted hover:text-accent transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="text-on-muted hover:text-accent transition-colors">
            Contact
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
