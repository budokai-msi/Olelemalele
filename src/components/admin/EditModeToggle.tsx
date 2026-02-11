'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface EditModeToggleProps {
  onToggle: (editMode: boolean) => void
}

export default function EditModeToggle({ onToggle }: EditModeToggleProps) {
  const [editMode, setEditMode] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Check if user has admin/curator role
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me')
        if (res.ok) {
          const data = await res.json()
          const role = data.user?.role
          if (role === 'admin' || role === 'super_admin' || role === 'curator') {
            setIsAdmin(true)
          }
        }
      } catch {
        // Not authenticated
      }
    }
    checkAuth()
  }, [])

  const toggleEditMode = () => {
    const newMode = !editMode
    setEditMode(newMode)
    onToggle(newMode)
  }

  if (!isAdmin) return null

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, delay: 1 }}
        onClick={toggleEditMode}
        className="fixed bottom-6 right-6 z-[8999] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors border-2"
        style={{
          backgroundColor: editMode ? '#F59E0B' : 'rgb(var(--accent))',
          borderColor: editMode ? '#D97706' : 'rgb(var(--accent-glow))',
        }}
        title={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
        aria-label={editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
      >
        <span className="text-white text-xl">
          {editMode ? '✕' : '✏️'}
        </span>
      </motion.button>
    </AnimatePresence>
  )
}
