/**
 * Image Upload API
 * Handles uploading images and pushing them to GitHub
 * Route: POST /api/upload
 */

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { execSync } from 'child_process'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (max 4MB to stay within Next.js body limits)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 4MB' },
        { status: 400 }
      )
    }

    // Generate filename with timestamp
    const timestamp = Date.now()
    const ext = file.name.split('.').pop() || 'jpg'
    const sanitizedName = file.name
      .replace(/\.[^.]+$/, '') // Remove extension
      .replace(/[^a-z0-9]/gi, '_') // Replace invalid chars with underscore
      .toLowerCase()
    const filename = `${sanitizedName}_${timestamp}.${ext}`

    // Save file to public/uploads/articles
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'articles')
    await mkdir(uploadDir, { recursive: true })
    
    const filePath = join(uploadDir, filename)
    const buffer = await file.arrayBuffer()
    await writeFile(filePath, Buffer.from(buffer))

    // Add and commit to git
    try {
      const relativeFilePath = `public/uploads/articles/${filename}`
      execSync(`cd "${process.cwd()}" && git add "${relativeFilePath}"`, { 
        stdio: 'pipe' 
      })
      execSync(`cd "${process.cwd()}" && git commit -m "Upload image: ${filename}"`, { 
        stdio: 'pipe' 
      })
      execSync(`cd "${process.cwd()}" && git push origin main`, { 
        stdio: 'pipe' 
      })
    } catch (gitError) {
      console.error('Git error (non-fatal):', gitError)
      // Continue anyway - file was saved locally
    }

    // Return the public path for the image
    const publicPath = `/uploads/articles/${filename}`
    
    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      path: publicPath,
      filename,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
