'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

interface Note {
  _id: string
  content: string
  author: string
  authorRole: string
  page: string
  positionX: number
  positionY: number
  color: 'yellow' | 'blue' | 'green' | 'pink' | 'orange'
  resolved: boolean
  createdAt: string
}

const NOTE_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  yellow: { bg: '#FEF9C3', border: '#FDE047', text: '#854D0E' },
  blue: { bg: '#DBEAFE', border: '#93C5FD', text: '#1E40AF' },
  green: { bg: '#DCFCE7', border: '#86EFAC', text: '#166534' },
  pink: { bg: '#FCE7F3', border: '#F9A8D4', text: '#9D174D' },
  orange: { bg: '#FFEDD5', border: '#FDBA74', text: '#9A3412' },
}

interface StickyNotesOverlayProps {
  editMode: boolean
}

export default function StickyNotesOverlay({ editMode }: StickyNotesOverlayProps) {
  const [notes, setNotes] = useState<Note[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createPos, setCreatePos] = useState({ x: 0, y: 0 })
  const [newContent, setNewContent] = useState('')
  const [newColor, setNewColor] = useState<'yellow' | 'blue' | 'green' | 'pink' | 'orange'>('yellow')
  const pathname = usePathname()

  // Fetch notes for current page
  const fetchNotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/notes?page=${encodeURIComponent(String(pathname ?? '/'))}`)
      if (res.ok) {
        const data = await res.json()
        setNotes(data.notes || [])
      }
    } catch {
      // Silently fail if notes can't be fetched
    }
  }, [pathname])

  useEffect(() => {
    if (editMode) {
      fetchNotes()
    }
  }, [editMode, fetchNotes])

  // Handle page click to create note
  const handlePageClick = useCallback((e: MouseEvent) => {
    if (!editMode) return
    // Don't create note if clicking on an existing note or the form
    const target = e.target as HTMLElement
    if (target.closest('.sticky-note') || target.closest('.sticky-note-form')) return

    const x = (e.clientX / window.innerWidth) * 100
    const y = ((e.clientY + window.scrollY) / document.documentElement.scrollHeight) * 100

    setCreatePos({ x, y })
    setShowCreateForm(true)
    setNewContent('')
  }, [editMode])

  useEffect(() => {
    if (editMode) {
      document.addEventListener('click', handlePageClick)
      return () => document.removeEventListener('click', handlePageClick)
    }
  }, [editMode, handlePageClick])

  // Create note
  const handleCreate = async () => {
    if (!newContent.trim()) return

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newContent.trim(),
          page: pathname,
          positionX: createPos.x,
          positionY: createPos.y,
          color: newColor,
        }),
      })

      if (res.ok) {
        setShowCreateForm(false)
        setNewContent('')
        fetchNotes()
      }
    } catch {
      console.error('Failed to create note')
    }
  }

  // Resolve note
  const handleResolve = async (noteId: string, resolved: boolean) => {
    try {
      await fetch('/api/notes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noteId, resolved }),
      })
      fetchNotes()
    } catch {
      console.error('Failed to update note')
    }
  }

  if (!editMode) return null

  return (
    <>
      {/* Existing notes */}
      {notes.map((note) => {
        const colorScheme = NOTE_COLORS[note.color] || NOTE_COLORS.yellow
        return (
          <motion.div
            key={note._id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: Math.random() * 6 - 3 }}
            className="sticky-note fixed z-[9000] w-48 shadow-xl rounded-md cursor-default"
            style={{
              left: `${note.positionX}%`,
              top: `${note.positionY}%`,
              backgroundColor: colorScheme.bg,
              borderTop: `3px solid ${colorScheme.border}`,
              color: colorScheme.text,
            }}
          >
            <div className="p-3">
              <p className="text-xs leading-relaxed whitespace-pre-wrap">{note.content}</p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-[10px] opacity-60">{note.authorRole}</span>
                <button
                  onClick={() => handleResolve(note._id, !note.resolved)}
                  className="text-[10px] font-bold px-2 py-0.5 rounded"
                  style={{
                    backgroundColor: note.resolved ? colorScheme.border : 'transparent',
                    border: `1px solid ${colorScheme.border}`,
                  }}
                >
                  {note.resolved ? '✓ Resolved' : 'Resolve'}
                </button>
              </div>
            </div>
          </motion.div>
        )
      })}

      {/* Create form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="sticky-note-form fixed z-[9500] w-64 bg-white rounded-xl shadow-2xl border border-neutral-200 overflow-hidden"
            style={{
              left: `${Math.min(createPos.x, 80)}%`,
              top: `${createPos.y}%`,
            }}
          >
            <div className="p-4">
              <p className="text-xs font-bold text-neutral-700 mb-2 uppercase tracking-wider">Add Note</p>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Type your feedback..."
                className="w-full h-20 text-xs text-neutral-800 bg-neutral-50 rounded-lg p-2 border border-neutral-200 resize-none focus:outline-none focus:ring-2 focus:ring-teal-400"
                maxLength={500}
                autoFocus
              />
              {/* Color picker */}
              <div className="flex gap-1.5 mt-2">
                {(Object.keys(NOTE_COLORS) as Array<keyof typeof NOTE_COLORS>).map((color) => (
                  <button
                    key={color}
                    onClick={() => setNewColor(color as typeof newColor)}
                    className="w-5 h-5 rounded-full border-2 transition-transform text-[0px]"
                    title={`Select ${color} color`}
                    aria-label={`Select ${color} note color`}
                    style={{
                      backgroundColor: NOTE_COLORS[color].bg,
                      borderColor: newColor === color ? NOTE_COLORS[color].border : 'transparent',
                      transform: newColor === color ? 'scale(1.2)' : 'scale(1)',
                    }}
                  >{color}</button>
                ))}
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={handleCreate}
                  className="flex-1 text-xs font-bold py-1.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 text-xs font-bold py-1.5 bg-neutral-100 text-neutral-600 rounded-lg hover:bg-neutral-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit mode indicator */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[9000] pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="px-4 py-2 bg-amber-500/90 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm"
        >
          ✏️ Edit Mode — Click to add notes
        </motion.div>
      </div>
    </>
  )
}
