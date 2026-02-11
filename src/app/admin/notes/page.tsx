'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Note {
  _id: string
  content: string
  author: string
  authorRole: string
  page: string
  positionX: number
  positionY: number
  color: string
  resolved: boolean
  resolvedBy?: string
  resolvedAt?: string
  createdAt: string
}

export default function AdminNotesPage() {
  const [notes, setNotes] = useState<Note[]>([])
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all')

  useEffect(() => {
    fetchNotes()
  }, [filter])

  const fetchNotes = async () => {
    let query = ''
    if (filter === 'open') query = '?resolved=false'
    else if (filter === 'resolved') query = '?resolved=true'

    const res = await fetch(`/api/notes${query}`)
    if (res.ok) {
      const data = await res.json()
      setNotes(data.notes || [])
    }
  }

  const handleResolve = async (noteId: string, resolved: boolean) => {
    await fetch('/api/notes', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ noteId, resolved }),
    })
    fetchNotes()
  }

  const handleDelete = async (noteId: string) => {
    if (!confirm('Delete this note permanently?')) return
    await fetch(`/api/notes?id=${noteId}`, { method: 'DELETE' })
    fetchNotes()
  }

  const colorDot = (color: string) => {
    const colors: Record<string, string> = {
      yellow: '#FDE047',
      blue: '#93C5FD',
      green: '#86EFAC',
      pink: '#F9A8D4',
      orange: '#FDBA74',
    }
    return (
      <span
        className="inline-block w-3 h-3 rounded-full mr-2 flex-shrink-0"
        style={{ backgroundColor: colors[color] || colors.yellow }}
      />
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50 p-6 md:p-10">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-3xl font-bold text-neutral-900 mb-1">Feedback Notes</h1>
        <p className="text-neutral-500 text-sm mb-8">Review and manage site feedback from curators</p>

        {/* Filters */}
        <div className="flex gap-2 mb-8">
          {(['all', 'open', 'resolved'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${filter === f
                  ? 'bg-neutral-900 text-white'
                  : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
                }`}
            >
              {f} {f === 'open' && notes.filter(n => !n.resolved).length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-amber-400 text-neutral-900 rounded-full text-[9px]">
                  {notes.filter(n => !n.resolved).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notes list */}
        <div className="space-y-3">
          {notes.length === 0 ? (
            <p className="text-neutral-400 text-center py-16">No notes found</p>
          ) : (
            notes.map((note, i) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className={`bg-white rounded-xl border p-4 ${note.resolved ? 'border-neutral-200 opacity-70' : 'border-neutral-300'
                  }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">{colorDot(note.color)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 leading-relaxed">{note.content}</p>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[11px] text-neutral-400">
                      <span>📍 {note.page}</span>
                      <span>👤 {note.authorRole}</span>
                      <span>📅 {new Date(note.createdAt).toLocaleDateString()}</span>
                      {note.resolved && note.resolvedAt && (
                        <span>✓ Resolved {new Date(note.resolvedAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleResolve(note._id, !note.resolved)}
                      className={`px-3 py-1.5 text-[10px] font-bold uppercase rounded-lg transition-colors ${note.resolved
                          ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                        }`}
                    >
                      {note.resolved ? 'Reopen' : 'Resolve'}
                    </button>
                    <button
                      onClick={() => handleDelete(note._id)}
                      className="px-3 py-1.5 text-[10px] font-bold uppercase bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  )
}
