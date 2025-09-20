import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'hero-backgrounds')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name)
    const fileName = `hero-bg-${Date.now()}${fileExtension}`
    const filePath = path.join(uploadsDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the public URL
    const publicUrl = `/uploads/hero-backgrounds/${fileName}`

    return NextResponse.json({
      success: true,
      message: 'Hero background image uploaded successfully',
      url: publicUrl,
      filename: fileName
    })
  } catch (error) {
    console.error('Error uploading hero background:', error)
    return NextResponse.json({ 
      error: 'Failed to upload hero background image' 
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filename = searchParams.get('filename')
    
    if (!filename) {
      return NextResponse.json({ error: 'No filename provided' }, { status: 400 })
    }

    // Delete the file
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'hero-backgrounds', filename)
    if (existsSync(filePath)) {
      const fs = require('fs').promises
      await fs.unlink(filePath)
    }

    return NextResponse.json({
      success: true,
      message: 'Hero background image deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting hero background:', error)
    return NextResponse.json({ 
      error: 'Failed to delete hero background image' 
    }, { status: 500 })
  }
}