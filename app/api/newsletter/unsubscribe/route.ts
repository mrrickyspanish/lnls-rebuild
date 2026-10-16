import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client'

async function unsubscribe(token: string) {
  const supabase = createSupabaseServiceClient()
  return supabase
    .from('newsletter_subscribers')
    .update({ active: false, unsubscribed_at: new Date().toISOString() })
    .eq('unsubscribe_token', token)
}

/**
 * The "Unsubscribe" link in every email. Unsubscribes, then lands on the
 * "Change what you get" page, which confirms it and offers a way back in
 * (it used to be a bare HTML page with no way back).
 */
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  const { error } = await unsubscribe(token)
  if (error) {
    console.error('Unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }

  const next = new URL('/subscribe/manage', request.nextUrl.origin)
  next.searchParams.set('token', token)
  next.searchParams.set('status', 'unsubscribed')
  return NextResponse.redirect(next, 303)
}

/**
 * One-click unsubscribe (RFC 8058): Gmail and Yahoo POST to the
 * List-Unsubscribe URL from their own "Unsubscribe" button.
 */
export async function POST(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim()
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })
  const { error } = await unsubscribe(token)
  if (error) {
    console.error('One-click unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
