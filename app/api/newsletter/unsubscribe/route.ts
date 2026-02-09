import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token')?.trim()

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    const supabase = createSupabaseServiceClient()
    const { error } = await supabase
      .from('newsletter_subscribers')
      .update({ active: false, unsubscribed_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)

    if (error) {
      console.error('Unsubscribe error:', error)
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }

    const html = `
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family:Arial,sans-serif;line-height:1.6;padding:24px">
          <h1>You're unsubscribed</h1>
          <p>You will no longer receive newsletter emails from LNLS.</p>
        </body>
      </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Unsubscribe route crash:', msg)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
