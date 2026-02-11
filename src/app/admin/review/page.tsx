'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Upload {
  _id: string
  productId: string
  originalFilename: string
  imagePath: string
  mimeType: string
  fileSize: number
  submittedBy: string
  status: 'pending' | 'approved' | 'rejected'
  reviewNote?: string
  createdAt: string
}

export default function AdminReviewPage() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [reviewNote, setReviewNote] = useState<Record<string, string>>({})
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    fetchUploads()
  }, [filter])

  const fetchUploads = async () => {
    const query = filter === 'all' ? '' : `?status=${filter}`
    const res = await fetch(`/api/curator/upload${query}`)
    if (res.ok) {
      const data = await res.json()
      setUploads(data.uploads || [])
    }
  }

  const handleReview = async (uploadId: string, status: 'approved' | 'rejected') => {
    setProcessing(uploadId)
    try {
      const res = await fetch('/api/curator/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uploadId,
          status,
          reviewNote: reviewNote[uploadId] || '',
        }),
      })
      if (res.ok) {
        fetchUploads()
        setReviewNote((prev) => {
          const next = { ...prev }
          delete next[uploadId]
          return next
        })
      }
    } catch {
      console.error('Review failed')
    } finally {
      setProcessing(null)
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-5xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">Upload Review</h1>
        <p className="text-neutral-500 text-sm mb-8">Approve or reject curator submissions</p>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filter === f
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Upload grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence>
            {uploads.length === 0 ? (
              <p className="text-neutral-400 col-span-2 text-center py-16">No uploads found</p>
            ) : (
              uploads.map((upload) => (
                <motion.div
                  key={upload._id}
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.95, opacity: 0 }}
                  className="bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm"
                >
                  {/* Image preview */}
                  <div className="aspect-[4/3] bg-neutral-100 relative">
                    <img src={upload.imagePath} alt={upload.originalFilename} className="w-full h-full object-contain" />
                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase rounded-full ${upload.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : upload.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {upload.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <p className="text-sm font-medium text-neutral-800 truncate">{upload.originalFilename}</p>
                    <p className="text-xs text-neutral-400 mb-3">
                      Product: {upload.productId} · {upload.mimeType} · {(upload.fileSize / 1024).toFixed(0)}KB
                    </p>

                    {upload.status === 'pending' && (
                      <>
                        <textarea
                          value={reviewNote[upload._id] || ''}
                          onChange={(e) => setReviewNote((prev) => ({ ...prev, [upload._id]: e.target.value }))}
                          placeholder="Review note (optional)..."
                          className="w-full h-16 text-xs bg-neutral-50 border border-neutral-200 rounded-lg p-2 mb-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReview(upload._id, 'approved')}
                            disabled={processing === upload._id}
                            className="flex-1 py-2 text-xs font-bold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            ✓ Approve
                          </button>
                          <button
                            onClick={() => handleReview(upload._id, 'rejected')}
                            disabled={processing === upload._id}
                            className="flex-1 py-2 text-xs font-bold bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </>
                    )}

                    {upload.reviewNote && (
                      <p className="text-xs text-neutral-500 mt-2 italic">
                        Note: {upload.reviewNote}
                      </p>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}
