import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '@/app/lib/session-middleware'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
const ALLOWED_MIME_TYPES = [
  // Documents
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  // Images
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  // Audio
  'audio/mpeg',
  'audio/wav',
  'audio/ogg',
  'audio/mp3',
  // Video
  'video/mp4',
  'video/webm',
  'video/ogg'
]

export async function POST(request: NextRequest) {
  try {
    const sessionResult = await validateSession(request, 'INSTRUCTOR')
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const instructorId = formData.get('instructorId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed. Supported types: PDF, Word, Text, Images, Audio, Video' },
        { status: 400 }
      )
    }

    // Create unique filename
    const timestamp = Date.now()
    const cleanFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${cleanFilename}`

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public/uploads/instructor-resources', instructorId)
    
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      console.error('Error creating directory:', error)
      return NextResponse.json(
        { error: 'Failed to create upload directory' },
        { status: 500 }
      )
    }

    // Save file
    const filePath = path.join(uploadDir, filename)
    const fileBuffer = Buffer.from(await file.arrayBuffer())
    
    try {
      await writeFile(filePath, fileBuffer)
    } catch (error) {
      console.error('Error saving file:', error)
      return NextResponse.json(
        { error: 'Failed to save file' },
        { status: 500 }
      )
    }

    // Return file information
    const fileUrl = `/uploads/instructor-resources/${instructorId}/${filename}`
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Internal server error during file upload' },
      { status: 500 }
    )
  }
}

// GET endpoint to list uploaded files for an instructor
export async function GET(request: NextRequest) {
  try {
    const sessionResult = await validateSession(request, 'INSTRUCTOR')
    if (!sessionResult.isValid) {
      return NextResponse.json(
        { error: sessionResult.error },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    if (!instructorId) {
      return NextResponse.json(
        { error: 'Instructor ID is required' },
        { status: 400 }
      )
    }

    const fs = require('fs').promises
    const uploadDir = path.join(process.cwd(), 'public/uploads/instructor-resources', instructorId)
    
    try {
      const files = await fs.readdir(uploadDir)
      const fileList = await Promise.all(
        files.map(async (filename: string) => {
          const filePath = path.join(uploadDir, filename)
          const stats = await fs.stat(filePath)
          return {
            filename,
            url: `/uploads/instructor-resources/${instructorId}/${filename}`,
            size: stats.size,
            uploadedAt: stats.mtime
          }
        })
      )
      
      return NextResponse.json({ files: fileList })
    } catch (error) {
      // Directory doesn't exist or is empty
      return NextResponse.json({ files: [] })
    }

  } catch (error) {
    console.error('Error listing files:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}