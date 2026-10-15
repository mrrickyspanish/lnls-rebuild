import { NextResponse } from 'next/server'

import { createSupabaseServiceClient } from '@/lib/supabase/client'
import { LANES, isLaneKey } from '@/lib/topics'

/**
 * Saves a subscriber's lane picks from the "Change what you get" page. The
 * token from their email link is the only key. Saving also turns emails
 * back on, so it doubles as "resubscribe".
 */
export async function POST(request: Request) {
  const { token, lanes: picked } = (await request.json().catch(() => ({}))) as { token?: string; lanes?: unknown }
  if (!token || typeof token !== 'string') return NextResponse.json({ error: 'Missing link token' }, { status: 400 })

  const lanes = Array.isArray(picked)
    ? [...new Set(picked.map((lane) => (lane === 'home' ? 'life' : lane)).filter(isLaneKey))]
    : []
  if (lanes.length === 0) return NextResponse.json({ error: 'Pick at least one lane' }, { status: 400 })

  const supabase = createSupabaseServiceClient()
  const { data, error } = await supabase
    .from('newsletter_subscribers')
    .update({ lanes: lanes.length === LANES.length ? null : lanes, active: true, unsubscribed_at: null } as any)
    .eq('unsubscribe_token', token)
    .select('id')

  if (error) {
    console.error('Preferences update failed:', error)
    return NextResponse.json({ error: 'Could not save. Please try again.' }, { status: 500 })
  }
  if (!data || data.length === 0) {
    return NextResponse.json({ error: 'This link has expired. Sign up again on the subscribe page.' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
