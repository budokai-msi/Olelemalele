'use client'

import { AnimatePresence, motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

const faqs = [
  {
    category: 'Orders & Shipping',
    items: [
      {
        question: 'How long does shipping take?',
        answer: 'We produce and ship from 32 countries worldwide to minimize transit time. Standard shipping typically takes 5-10 business days. Express shipping (where available) takes 2-4 business days. Production time is 2-5 business days before shipping.',
      },
      {
        question: 'Do you ship internationally?',
        answer: 'Yes! We ship to over 100 countries worldwide. Shipping costs and delivery times vary by location. All customs duties and import taxes are the responsibility of the recipient.',
      },
      {
        question: 'Can I track my order?',
        answer: 'Absolutely. Once your order ships, you\'ll receive an email with tracking information. You can also view order status in your account dashboard.',
      },
      {
        question: 'What if my order arrives damaged?',
        answer: 'We take great care in packaging, but if your artwork arrives damaged, contact us within 48 hours with photos. We\'ll send a replacement at no cost.',
      },
    ],
  },
  {
    category: 'Products & Quality',
    items: [
      {
        question: 'What materials do you use?',
        answer: 'Our canvases are printed on premium 400gsm poly-cotton blend with a matte finish. We use 12-color giclée printing for exceptional color accuracy and depth. Frames are made from sustainably sourced kiln-dried wood.',
      },
      {
        question: 'Are prints museum-quality?',
        answer: 'Yes. Our archival inks are rated for 100+ years of fade resistance under normal indoor conditions. Each piece is produced to gallery standards.',
      },
      {
        question: 'What sizes are available?',
        answer: 'Sizes vary by artwork. Common sizes include 12x16", 16x20", 20x24", 24x36", and 36x48". Limited editions may have exclusive sizing options.',
      },
      {
        question: 'Do canvases come framed?',
        answer: 'Canvases come gallery-wrapped on a solid wood stretcher bar, ready to hang. We also offer premium frame options including Black, White, Natural Wood, Dark Wood, and Gold Accent.',
      },
    ],
  },
  {
    category: 'Returns & Refunds',
    items: [
      {
        question: 'What is your return policy?',
        answer: 'We accept returns within 30 days of delivery for non-custom items. Products must be in original condition and packaging. Limited edition pieces are final sale.',
      },
      {
        question: 'How do I initiate a return?',
        answer: 'Contact our support team at studio@olelemalele.com with your order number. We\'ll provide a return shipping label and process your refund once we receive the item.',
      },
      {
        question: 'When will I receive my refund?',
        answer: 'Refunds are processed within 3-5 business days after we receive your return. It may take an additional 5-10 business days for the funds to appear in your account.',
      },
    ],
  },
  {
    category: 'Account & Orders',
    items: [
      {
        question: 'Do I need an account to order?',
        answer: 'No, you can checkout as a guest. However, creating an account lets you track orders, save favorites, and get exclusive early access to new drops.',
      },
      {
        question: 'Can I modify or cancel my order?',
        answer: 'Orders can be modified or cancelled within 2 hours of placement. After production begins, changes are not possible. Contact us immediately if you need to make changes.',
      },
      {
        question: 'Do you offer gift cards?',
        answer: 'Gift cards are coming soon! Sign up for our newsletter to be notified when they become available.',
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className="border-b border-white/5 last:border-0"
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex items-center justify-between text-left group"
      >
        <span className="text-white font-medium group-hover:text-white/70 transition-colors pr-8">
          {question}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-gray-500 text-xl flex-shrink-0"
        >
          +
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-gray-400 leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/70 font-bold mb-4 block">
            Support
          </span>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            FAQ
          </h1>
          <p className="text-gray-400 max-w-md mx-auto">
            Find answers to common questions about orders, shipping, and our products.
          </p>
        </motion.div>

        {/* FAQ Sections */}
        <div className="space-y-12">
          {faqs.map((section, sectionIndex) => (
            <motion.section
              key={section.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
            >
              <h2 className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold mb-6 pb-4 border-b border-white/10">
                {section.category}
              </h2>
              <div>
                {section.items.map((item) => (
                  <FAQItem key={item.question} {...item} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center p-8 md:p-12 rounded-2xl bg-white/[0.02] border border-white/5"
        >
          <h3 className="text-2xl font-bold mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-8">
            Our team is here to help. Reach out and we&apos;ll get back to you within 24 hours.
          </p>
          <Link
            href="/contact"
            className="inline-block px-8 py-4 bg-white text-black rounded-full font-bold uppercase tracking-wider text-sm hover:bg-white hover:text-white transition-colors"
          >
            Contact Us
          </Link>
        </motion.div>
      </div>
    </main>
  )
}
