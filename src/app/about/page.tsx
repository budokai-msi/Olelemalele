'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white pt-32 pb-24 px-4 md:px-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-12"
        >
          {/* Badge */}
          <div className="flex justify-center">
            <span className="glass px-4 py-2 rounded-full text-[10px] uppercase tracking-[0.3em] text-white/50">
              The Philosophy
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter text-center leading-[0.85]">
            MUSEUM QUALITY.<br />
            <span className="text-gradient">STREET SOUL.</span>
          </h1>

          {/* Manifesto Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24 pt-12 md:pt-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold">01 — The Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                Olelemalele was born from the intersection of digital fluid dynamics and traditional canvas weight.
                We believe that art shouldn&apos;t just hang on a wall—it should pulse with the room.
                Our collections are designed for those who find beauty in the void and power in the silence.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <h3 className="text-xs uppercase tracking-[0.3em] text-indigo-400 font-bold">02 — The Craft</h3>
              <p className="text-gray-400 leading-relaxed">
                Every drop is printed on heavyweight, archival-grade canvas fibers using 12-color giclée processes.
                These aren&apos;t just prints; they are statements that will outlast the trends.
                Sustainability is woven into our process, from FSC-certified wood frames to local fulfillment in 32 countries.
              </p>
            </motion.div>
          </div>

          {/* Full Width Quote */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative py-24 md:py-40 text-center"
          >
            <div className="absolute inset-0 bg-indigo-500/5 blur-[120px] rounded-full" />
            <p className="relative text-2xl md:text-4xl font-light italic tracking-tight max-w-2xl mx-auto leading-tight">
              &ldquo;Canvas is dead. You are the gallery. Wear the void. Own the moment.&rdquo;
            </p>
          </motion.div>

          {/* Location / Origin */}
          <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">Based in</p>
              <p className="text-sm font-bold uppercase tracking-tighter">Sofia, Bulgaria</p>
            </div>
            <Link
              href="/gallery"
              className="px-12 py-4 border border-white/20 rounded-full text-xs uppercase tracking-widest font-black hover:bg-white hover:text-black transition-all"
            >
              Explore the Archive
            </Link>
          </div>
        </motion.div>
      </div>
    </main>
  )
}
