import { NextRequest, NextResponse } from 'next/server'
import { subscribeToNewsletter } from '@/lib/supabase/client'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      )
    }

    // Add to database
    const { data, error } = await subscribeToNewsletter(email)

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Email already subscribed' },
          { status: 409 }
        )
      }
      throw error
    }

    // Send welcome email
    await resend.emails.send({
      from: 'LNLS <newsletter@lnls.media>',
      to: email,
      subject: 'Welcome to LNLS!',
      html: `
        <h1>Welcome to Late Night Lake Show!</h1>
        <p>Thanks for subscribing. You'll now get the latest Lakers news and LNLS updates delivered daily.</p>
        <p>Stay locked in.</p>
        <p>— The LNLS Team</p>
      `,
    })

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Failed to subscribe' },
      { status: 500 }
    )
  }
}
