'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

interface Upload {
  _id: string
  productId: string
  originalFilename: string
  imagePath: string
  fileSize: number
  status: 'pending' | 'approved' | 'rejected'
  createdAt: string
}

interface Note {
  _id: string
  content: string
  page: string
  color: string
  resolved: boolean
  createdAt: string
}

export default function CuratorDashboard() {
  const [uploads, setUploads] = useState<Upload[]>([])
  const [notes, setNotes] = useState<Note[]>([])
  const [activeTab, setActiveTab] = useState<'uploads' | 'notes'>('uploads')
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [productId, setProductId] = useState('')

  useEffect(() => {
    fetchUploads()
    fetchNotes()
  }, [])

  const fetchUploads = async () => {
    const res = await fetch('/api/curator/upload')
    if (res.ok) {
      const data = await res.json()
      setUploads(data.uploads || [])
    }
  }

  const fetchNotes = async () => {
    const res = await fetch('/api/notes')
    if (res.ok) {
      const data = await res.json()
      setNotes(data.notes || [])
    }
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file || !productId) return

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('productId', productId)

    try {
      const res = await fetch('/api/curator/upload', {
        method: 'POST',
        body: formData,
      })
      if (res.ok) {
        setProductId('')
        if (fileRef.current) fileRef.current.value = ''
        fetchUploads()
      }
    } catch {
      console.error('Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 border-amber-300',
      approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
    }
    return (
      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full border ${colors[status] || ''}`}>
        {status}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">Curator Dashboard</h1>
        <p className="text-neutral-500 text-sm mb-8">Manage uploads and feedback notes</p>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 bg-neutral-200 rounded-lg p-1 w-fit">
          {(['uploads', 'notes'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-md transition-all ${activeTab === tab
                ? 'bg-white text-neutral-900 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
                }`}
            >
              {tab === 'uploads' ? '📸 Uploads' : '📝 Notes'}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'uploads' ? (
            <motion.div
              key="uploads"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Upload form */}
              <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-6">
                <h2 className="text-lg font-bold text-neutral-800 mb-4">Upload New Image</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    placeholder="Product ID"
                    className="flex-1 px-4 py-2 text-sm border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 bg-neutral-50"
                  />
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    title="Choose an image file to upload"
                    className="flex-1 text-sm file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                  />
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="px-6 py-2 bg-teal-500 text-white font-medium text-sm rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Uploading...' : 'Upload'}
                  </button>
                </div>
              </div>

              {/* Upload list */}
              <div className="space-y-3">
                {uploads.length === 0 ? (
                  <p className="text-neutral-400 text-center py-12">No uploads yet</p>
                ) : (
                  uploads.map((upload) => (
                    <div key={upload._id} className="bg-white rounded-lg border border-neutral-200 p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-neutral-100 overflow-hidden flex-shrink-0">
                        <img src={upload.imagePath} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-neutral-800 truncate">{upload.originalFilename}</p>
                        <p className="text-xs text-neutral-400">Product: {upload.productId} · {(upload.fileSize / 1024).toFixed(0)}KB</p>
                      </div>
                      {statusBadge(upload.status)}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="notes"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="space-y-3">
                {notes.length === 0 ? (
                  <p className="text-neutral-400 text-center py-12">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note._id} className="bg-white rounded-lg border border-neutral-200 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <p className="text-sm text-neutral-800">{note.content}</p>
                          <p className="text-xs text-neutral-400 mt-1">Page: {note.page} · {new Date(note.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${note.resolved
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                          }`}>
                          {note.resolved ? '✓ Resolved' : 'Open'}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
