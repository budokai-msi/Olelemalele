'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'

const EditModeToggle = dynamic(() => import('@/components/admin/EditModeToggle'), { ssr: false })
const StickyNotesOverlay = dynamic(() => import('@/components/admin/StickyNotesOverlay'), { ssr: false })

export default function AdminOverlay() {
  const [editMode, setEditMode] = useState(false)

  return (
    <>
      <EditModeToggle onToggle={setEditMode} />
      <StickyNotesOverlay editMode={editMode} />
    </>
  )
}
