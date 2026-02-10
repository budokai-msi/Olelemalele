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
    <main className="min-h-screen bg-surface text-on-surface pt-32 pb-24 px-4 md:px-12 relative overflow-hidden">
      {/* ═══ Ambient Glow Orbs ═══ */}
      <div className="absolute top-20 left-1/4 w-[500px] h-[500px] bg-accent/[0.04] blur-[150px] rounded-full pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-accent/[0.06] blur-[120px] rounded-full pointer-events-none animate-pulse-glow delay-2s" />

      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24 relative z-10">

        {/* Left Side: Text */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col justify-center"
        >
          <span className="text-xs uppercase tracking-[0.4em] text-accent font-bold mb-6">Connect</span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-8 leading-[0.85] uppercase">
            Let&apos;s build<br />
            <span className="text-gradient">the Void.</span>
          </h1>
          <p className="text-on-muted text-lg max-w-md leading-relaxed mb-12">
            Interested in a custom commission? Wholesale inquiry? Or just want to talk about fluid dynamics? We&apos;re listening.
          </p>

          <div className="space-y-8">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-on-faint mb-2">Direct Mail</p>
              <p className="text-xl font-bold border-b border-accent/30 inline-block">studio@olelemalele.com</p>
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
          <div className="glass p-8 md:p-12 rounded-[2.5rem] glow-border shadow-2xl laser-border-orbit">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-24 text-center"
              >
                <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6 glow">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold uppercase tracking-tight mb-2">Message Sent</h2>
                <p className="text-on-faint text-sm italic">Expect a response within 48 hours.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-8 text-xs uppercase tracking-widest text-on-faint hover:text-accent underline underline-offset-4"
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
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-faint font-bold px-1 italic">The Topic</label>
                  <select
                    title="Inquiry Topic"
                    className="w-full bg-accent/5 border border-[rgb(var(--border))] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-accent/40 appearance-none transition-colors"
                  >
                    <option className="bg-surface">General Inquiry</option>
                    <option className="bg-surface">Commission Request</option>
                    <option className="bg-surface">Order Issue</option>
                    <option className="bg-surface">Collaborations</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.2em] text-on-faint font-bold px-1 italic">Message</label>
                  <textarea
                    rows={5}
                    placeholder="Tell us about your project..."
                    className="w-full bg-accent/5 border border-[rgb(var(--border))] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-accent/40 transition-colors placeholder:text-on-faint/50 resize-none"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="group relative w-full bg-accent text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs overflow-hidden transition-all duration-500 hover:scale-[1.02] active:scale-95 glow-intense mt-4 laser-btn hover:shadow-[0_0_30px_rgba(45,212,191,0.3)]"
                >
                  <span className="relative z-10">Send Message</span>
                  <div className="absolute inset-0 bg-accent-glow scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left -z-10" />
                </button>
              </form>
            )}
          </div>

          {/* Background Decorative Glow */}
          <div className="absolute -z-10 -bottom-16 -right-16 w-64 h-64 bg-accent/[0.08] blur-[100px] rounded-full pointer-events-none animate-pulse-glow" />
          <div className="absolute -z-10 -top-10 -left-10 w-48 h-48 bg-accent/[0.06] blur-[80px] rounded-full pointer-events-none" />
        </motion.div>
      </div>
    </main>
  )
}

function SocialLink({ label, href }: { label: string, href: string }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold uppercase tracking-widest text-on-faint hover:text-accent transition-colors border-b border-transparent hover:border-accent">
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
        className="w-full bg-accent/5 border border-[rgb(var(--border))] rounded-xl px-4 py-4 text-sm focus:outline-none focus:border-accent/40 transition-colors placeholder:text-on-faint/50"
      />
    </div>
  )
}
