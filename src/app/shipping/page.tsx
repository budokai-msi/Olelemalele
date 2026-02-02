'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

// Stylish SVG icons
const GlobeIcon = () => (
  <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="20" cy="20" r="18" stroke="url(#globe-gradient)" strokeWidth="2" />
    <ellipse cx="20" cy="20" rx="10" ry="18" stroke="url(#globe-gradient)" strokeWidth="1.5" />
    <line x1="2" y1="20" x2="38" y2="20" stroke="url(#globe-gradient)" strokeWidth="1.5" />
    <path d="M6 12 Q20 14 34 12" stroke="url(#globe-gradient)" strokeWidth="1" fill="none" />
    <path d="M6 28 Q20 26 34 28" stroke="url(#globe-gradient)" strokeWidth="1" fill="none" />
    <defs>
      <linearGradient id="globe-gradient" x1="0" y1="0" x2="40" y2="40">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
)

const PackageIcon = () => (
  <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4L36 12V28L20 36L4 28V12L20 4Z" stroke="url(#package-gradient)" strokeWidth="2" strokeLinejoin="round" />
    <path d="M20 20L36 12" stroke="url(#package-gradient)" strokeWidth="1.5" />
    <path d="M20 20L4 12" stroke="url(#package-gradient)" strokeWidth="1.5" />
    <path d="M20 20V36" stroke="url(#package-gradient)" strokeWidth="1.5" />
    <path d="M12 8L28 16" stroke="url(#package-gradient)" strokeWidth="1" opacity="0.5" />
    <defs>
      <linearGradient id="package-gradient" x1="4" y1="4" x2="36" y2="36">
        <stop offset="0%" stopColor="#a78bfa" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
)

const TruckIcon = () => (
  <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="12" width="22" height="16" rx="2" stroke="url(#truck-gradient)" strokeWidth="2" />
    <path d="M24 16H32L38 22V28H24V16Z" stroke="url(#truck-gradient)" strokeWidth="2" strokeLinejoin="round" />
    <circle cx="10" cy="30" r="4" stroke="url(#truck-gradient)" strokeWidth="2" />
    <circle cx="30" cy="30" r="4" stroke="url(#truck-gradient)" strokeWidth="2" />
    <line x1="14" y1="28" x2="26" y2="28" stroke="url(#truck-gradient)" strokeWidth="2" />
    <defs>
      <linearGradient id="truck-gradient" x1="2" y1="12" x2="38" y2="34">
        <stop offset="0%" stopColor="#818cf8" />
        <stop offset="100%" stopColor="#4f46e5" />
      </linearGradient>
    </defs>
  </svg>
)

const LeafIcon = () => (
  <svg className="w-10 h-10 mx-auto" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 32C8 32 10 8 32 6C32 6 34 28 12 32" stroke="url(#leaf-gradient)" strokeWidth="2" strokeLinecap="round" />
    <path d="M8 32C12 24 20 18 32 6" stroke="url(#leaf-gradient)" strokeWidth="1.5" />
    <path d="M14 28C18 22 24 16 32 10" stroke="url(#leaf-gradient)" strokeWidth="1" opacity="0.5" />
    <defs>
      <linearGradient id="leaf-gradient" x1="8" y1="32" x2="32" y2="6">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#6366f1" />
      </linearGradient>
    </defs>
  </svg>
)

const shippingInfo = [
  {
    icon: GlobeIcon,
    title: 'Global Production',
    description: 'We produce in 32 countries to minimize shipping distance and environmental impact.',
  },
  {
    icon: PackageIcon,
    title: 'Secure Packaging',
    description: 'Every piece is carefully wrapped with protective corners and sturdy boxes.',
  },
  {
    icon: TruckIcon,
    title: 'Tracked Delivery',
    description: 'Full tracking from production to your doorstep via email updates.',
  },
  {
    icon: LeafIcon,
    title: 'Eco-Friendly',
    description: 'Recyclable packaging materials and carbon-neutral shipping options.',
  },
]

const shippingTimes = [
  { region: 'North America', standard: '5-8 days', express: '2-4 days' },
  { region: 'Europe', standard: '4-7 days', express: '2-3 days' },
  { region: 'UK', standard: '3-6 days', express: '1-3 days' },
  { region: 'Australia & NZ', standard: '7-12 days', express: '4-6 days' },
  { region: 'Asia', standard: '7-14 days', express: '4-7 days' },
  { region: 'Rest of World', standard: '10-20 days', express: '5-10 days' },
]

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-indigo-400 font-bold mb-4 block">
            Delivery Info
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            Shipping & Returns
          </h1>
          <p className="text-gray-400 max-w-lg mx-auto">
            We produce locally and ship globally to get museum-quality art to your walls as fast as possible.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
          {shippingInfo.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 rounded-2xl bg-white/[0.02] border border-white/5"
            >
              <div className="mb-4"><item.icon /></div>
              <h3 className="font-bold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Shipping Times */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">Estimated Delivery Times</h2>
          <p className="text-gray-400 text-center mb-8 max-w-md mx-auto text-sm">
            Production time is 2-5 business days before shipping begins.
          </p>
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full">
              <thead>
                <tr className="bg-white/5">
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-gray-400 font-bold">Region</th>
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-gray-400 font-bold">Standard</th>
                  <th className="text-left py-4 px-6 text-xs uppercase tracking-wider text-gray-400 font-bold">Express</th>
                </tr>
              </thead>
              <tbody>
                {shippingTimes.map((row, index) => (
                  <tr key={row.region} className={index % 2 === 0 ? '' : 'bg-white/[0.02]'}>
                    <td className="py-4 px-6 font-medium">{row.region}</td>
                    <td className="py-4 px-6 text-gray-400">{row.standard}</td>
                    <td className="py-4 px-6 text-indigo-400">{row.express}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* Returns Policy */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">Returns Policy</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-black text-indigo-400 mb-2">30</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">Day Returns</div>
              <p className="text-sm text-gray-400">
                Return any non-custom item within 30 days of delivery for a full refund.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-black text-indigo-400 mb-2">100%</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">Quality Guarantee</div>
              <p className="text-sm text-gray-400">
                If your item arrives damaged or defective, we&apos;ll replace it at no cost.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <div className="text-3xl font-black text-indigo-400 mb-2">Free</div>
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-4">Return Shipping</div>
              <p className="text-sm text-gray-400">
                We cover return shipping for damaged items. Standard returns ship at buyer&apos;s expense.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Return Process */}
        <motion.section
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold mb-8 text-center">How to Return</h2>
          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              {[
                { step: '01', title: 'Contact Us', desc: 'Email studio@olelemalele.com with your order number and reason for return.' },
                { step: '02', title: 'Get Label', desc: 'We&apos;ll send you a prepaid return label (for damaged items) or shipping instructions.' },
                { step: '03', title: 'Pack Securely', desc: 'Repack the item in original packaging. Items must be in original condition.' },
                { step: '04', title: 'Ship & Track', desc: 'Drop off at the nearest carrier location. Refund processed within 3-5 business days.' },
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="flex gap-6 items-start"
                >
                  <span className="text-2xl font-black text-indigo-500 opacity-50">{item.step}</span>
                  <div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center p-8 md:p-12 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-white/5"
        >
          <h3 className="text-2xl font-bold mb-4">Need Help?</h3>
          <p className="text-gray-400 mb-8">
            Questions about shipping or returns? We&apos;re here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/faq"
              className="px-8 py-4 border border-white/20 rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white/10 transition-colors"
            >
              View FAQ
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-indigo-500 hover:text-white transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
