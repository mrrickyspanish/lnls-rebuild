/**
 * Image Upload API
 * Handles uploading images to Supabase Storage
 * Route: POST /api/upload
 */

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client'

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

    const buffer = await file.arrayBuffer()
    const supabase = createSupabaseServiceClient()
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'article-images'
    const storagePath = `articles/${filename}`

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(storagePath, Buffer.from(buffer), {
        contentType: file.type,
        upsert: true,
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError)
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload image' },
        { status: 500 }
      )
    }

    const { data: publicData } = supabase.storage
      .from(bucket)
      .getPublicUrl(storagePath)

    const publicUrl = publicData?.publicUrl
    if (!publicUrl) {
      return NextResponse.json(
        { error: 'Failed to generate public URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      path: publicUrl,
      filename,
      storagePath,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    )
  }
}
