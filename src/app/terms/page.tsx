'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/70 font-bold mb-4 block">
            Legal
          </span>
          <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-6">
            Terms of Service
          </h1>
          <p className="text-gray-400">
            Last updated: January 29, 2026
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="prose prose-invert prose-gray max-w-none"
        >
          <div className="space-y-12 text-gray-300">
            <section>
              <h2 className="text-xl font-bold text-white mb-4">1. Agreement to Terms</h2>
              <p className="leading-relaxed">
                By accessing or using the Olelemalele website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">2. Products and Services</h2>
              <p className="leading-relaxed mb-4">
                Olelemalele sells premium canvas art prints and related products. All products are made to order and produced by our global network of print partners.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Product images are for illustration purposes and may vary slightly from the final product.</li>
                <li>Colors may appear differently depending on your monitor settings.</li>
                <li>We reserve the right to modify or discontinue products at any time.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">3. Orders and Payment</h2>
              <p className="leading-relaxed mb-4">
                By placing an order, you agree to provide accurate payment and shipping information. We accept major credit cards and other payment methods as displayed at checkout.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>All prices are in USD unless otherwise stated.</li>
                <li>Prices are subject to change without notice.</li>
                <li>We reserve the right to cancel orders for any reason.</li>
                <li>Orders cannot be modified after production has begun.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">4. Shipping and Delivery</h2>
              <p className="leading-relaxed">
                Shipping times are estimates and not guaranteed. Olelemalele is not responsible for delays caused by shipping carriers, customs, or events beyond our control. Risk of loss transfers to you upon delivery to the carrier.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">5. Returns and Refunds</h2>
              <p className="leading-relaxed mb-4">
                We accept returns within 30 days of delivery for non-custom items in original condition. To initiate a return, contact us at studio@olelemalele.com.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Limited edition items are final sale.</li>
                <li>Custom or personalized items cannot be returned.</li>
                <li>Damaged items will be replaced at no cost.</li>
                <li>Refunds are processed within 5-10 business days.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content on this website, including images, designs, text, and branding, is the property of Olelemalele or its licensors. You may not reproduce, distribute, or create derivative works without written permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">7. User Accounts</h2>
              <p className="leading-relaxed">
                You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized access to your account. We reserve the right to terminate accounts at our discretion.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">8. Limitation of Liability</h2>
              <p className="leading-relaxed">
                Olelemalele shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of our services. Our total liability shall not exceed the amount paid for the product in question.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">9. Governing Law</h2>
              <p className="leading-relaxed">
                These terms shall be governed by the laws of Bulgaria. Any disputes shall be resolved in the courts of Sofia, Bulgaria.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">10. Changes to Terms</h2>
              <p className="leading-relaxed">
                We reserve the right to update these terms at any time. Continued use of our services after changes constitutes acceptance of the new terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-4">11. Contact</h2>
              <p className="leading-relaxed">
                For questions about these Terms of Service, contact us at:
              </p>
              <div className="mt-4 p-6 rounded-xl bg-white/[0.02] border border-white/5">
                <p className="font-bold text-white">Olelemalele Studio</p>
                <p className="text-gray-400">Email: studio@olelemalele.com</p>
                <p className="text-gray-400">Sofia, Bulgaria</p>
              </div>
            </section>
          </div>
        </motion.div>

        {/* Footer Links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-wrap gap-6 justify-center text-sm"
        >
          <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/shipping" className="text-gray-400 hover:text-white transition-colors">
            Shipping & Returns
          </Link>
          <Link href="/faq" className="text-gray-400 hover:text-white transition-colors">
            FAQ
          </Link>
          <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
            Contact
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
