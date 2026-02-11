// src/app/api/curator/upload/route.ts
import { hasRole, verifyToken } from '@/lib/auth'
import connectDB from '@/lib/db'
import Upload from '@/models/Upload'
import { mkdir, writeFile } from 'fs/promises'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import path from 'path'

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

async function getAuthUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null
  return verifyToken(token)
}

// POST: Upload an image
export async function POST(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user || !hasRole(user.role, 'curator')) {
      return NextResponse.json({ error: 'Curator access required' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const productId = formData.get('productId') as string | null

    if (!file || !productId) {
      return NextResponse.json({ error: 'File and productId are required' }, { status: 400 })
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG, PNG, and WebP images are allowed' }, { status: 400 })
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File size must be under 10MB' }, { status: 400 })
    }

    // Create upload directory
    await mkdir(UPLOAD_DIR, { recursive: true })

    // Generate unique filename
    const ext = path.extname(file.name) || '.jpg'
    const storedFilename = `${crypto.randomUUID()}${ext}`
    const filePath = path.join(UPLOAD_DIR, storedFilename)

    // Write file
    const bytes = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(bytes))

    // Save to DB
    const upload = await Upload.create({
      productId,
      originalFilename: file.name,
      storedFilename,
      imagePath: `/uploads/${storedFilename}`,
      mimeType: file.type,
      fileSize: file.size,
      submittedBy: user.userId,
      submittedByEmail: '',
      status: 'pending',
    })

    return NextResponse.json({ upload }, { status: 201 })
  } catch (error) {
    console.error('Upload POST error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

// GET: List uploads (filter by ?status=)
export async function GET(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user || !hasRole(user.role, 'curator')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status

    // Curators see their own uploads, admins see all
    if (!hasRole(user.role, 'admin')) {
      filter.submittedBy = user.userId
    }

    const uploads = await Upload.find(filter).sort({ createdAt: -1 }).limit(50)
    return NextResponse.json({ uploads })
  } catch (error) {
    console.error('Upload GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch uploads' }, { status: 500 })
  }
}

// PATCH: Approve or reject (admin+ only)
export async function PATCH(request: NextRequest) {
  try {
    await connectDB()
    const user = await getAuthUser()
    if (!user || !hasRole(user.role, 'admin')) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { uploadId, status, reviewNote } = body

    if (!uploadId || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const upload = await Upload.findByIdAndUpdate(
      uploadId,
      { status, reviewedBy: user.userId, reviewNote },
      { new: true }
    )

    if (!upload) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 })
    }

    return NextResponse.json({ upload })
  } catch (error) {
    console.error('Upload PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update upload' }, { status: 500 })
  }
}
