'use client'

import { useHaptic } from '@/hooks/useHaptic'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
  const triggerHaptic = useHaptic()
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    triggerHaptic()
  }

  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">

        {/* Left Side: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-indigo-400 font-bold mb-6">Connect</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            Let&apos;s build<br />
            <span className="text-gradient">the Void.</span>
          </h1>
          <p className="text-gray-400 text-lg max-w-md leading-relaxed mb-12">
            Interested in a custom commission? Wholesale inquiry? Or just want to talk about fluid dynamics? We&apos;re listening.
          </p>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Direct Mail</p>
              <p className="text-xl font-bold border-b border-indigo-500/30 inline-block">studio@olelemalele.com</p>
            </div>
            <div className="flex gap-8">
              <SocialLink label="Instagram" href="https://instagram.com" />
              <SocialLink label="Twitter" href="https://twitter.com" />
              <SocialLink label="LinkedIn" href="https://linkedin.com" />
            </div>
          </div>
        </motion.div>

        {/* Right Side: Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          <div className="glass p-8 md:p-12 rounded-[2.5rem] border border-white/5 shadow-2xl">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center"
              >
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Message Sent</h2>
                <p className="text-gray-500 text-sm italic">Expect a response within 48 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-xs uppercase tracking-widest text-white/50 hover:text-white underline underline-offset-4"
                >
                  Send another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <InputField label="Name" placeholder="Alex Vance" required />
                  <InputField label="Email" placeholder="alex@olelemalele.com" type="email" required />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1 italic">The Topic</label>
                  <select
                    title="Inquiry Topic"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-indigo-500/40 appearance-none transition-colors"
                  >
                    <option className="bg-black">General Inquiry</option>
                    <option className="bg-black">Commission Request</option>
                    <option className="bg-black">Order Issue</option>
                    <option className="bg-black">Collaborations</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1 italic">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your project..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-gray-700 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full bg-white text-black py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5 mt-4"
                >
                  <span className="relative z-10">Send Message</span>
                  <div className="absolute inset-0 bg-indigo-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left -z-10" />
                </button>
              </form>
            )}
          </div>

          {/* Background Decorative Element */}
          <div className="absolute -z-10 -bottom-10 -right-10 w-40 h-40 bg-indigo-500/10 blur-[80px] rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </main>
  )
}

function SocialLink({ label, href }: { label: string, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors border-b border-transparent hover:border-white">
      {label}
    </a>
  )
}

function InputField({ label, placeholder, type = 'text', required = false }: { label: string, placeholder: string, type?: string, required?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-bold px-1 italic">{label}</label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-indigo-500/40 transition-colors placeholder:text-gray-700"
      />
    </div>
  )
}
