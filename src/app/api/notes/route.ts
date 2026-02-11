// src/app/api/notes/route.ts
import { hasRole, verifyToken } from '@/lib/auth'
import connectDB from '@/lib/db'
import Note from '@/models/Note'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function getAuthUser(request: NextRequest) {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  const decoded = verifyToken(token)
  if (!decoded) return null
  return decoded
}

// GET: List notes (filter by ?page= or ?resolved=)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser(request)
    if (!user || !hasRole(user.role, 'curator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page')
    const resolved = searchParams.get('resolved')

    const filter: Record<string, unknown> = {}
    if (page) filter.page = page
    if (resolved !== null && resolved !== undefined) filter.resolved = resolved === 'true'

    const notes = await Note.find(filter).sort({ createdAt: -1 }).limit(100)
    return NextResponse.json({ notes })
  } catch (error) {
    console.error('Notes GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 })
  }
}

// POST: Create a note
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser(request)
    if (!user || !hasRole(user.role, 'curator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { content, page, positionX, positionY, color } = body

    if (!content || !page || positionX === undefined || positionY === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const note = await Note.create({
      content,
      author: user.userId,
      authorEmail: '', // Will be populated from user model if needed
      authorRole: user.role,
      page,
      positionX: Math.max(0, Math.min(100, positionX)),
      positionY: Math.max(0, Math.min(100, positionY)),
      color: color || 'yellow',
    })

    return NextResponse.json({ note }, { status: 201 })
  } catch (error) {
    console.error('Notes POST error:', error)
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 })
  }
}

// PATCH: Resolve/unresolve a note
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser(request)
    if (!user || !hasRole(user.role, 'curator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { noteId, resolved } = body

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    const update: Record<string, unknown> = { resolved: !!resolved }
    if (resolved) {
      update.resolvedBy = user.userId
      update.resolvedAt = new Date()
    } else {
      update.resolvedBy = undefined
      update.resolvedAt = undefined
    }

    const note = await Note.findByIdAndUpdate(noteId, update, { new: true })
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ note })
  } catch (error) {
    console.error('Notes PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update note' }, { status: 500 })
  }
}

// DELETE: Remove a note (admin+ only)
export async function DELETE(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser(request)
    if (!user || !hasRole(user.role, 'admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const noteId = searchParams.get('id')

    if (!noteId) {
      return NextResponse.json({ error: 'Note ID required' }, { status: 400 })
    }

    const note = await Note.findByIdAndDelete(noteId)
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Note deleted' })
  } catch (error) {
    console.error('Notes DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete note' }, { status: 500 })
  }
}
