import { EMAIL_REPLY_TO, personalFrom, sendOrThrow } from '@/lib/email'
import { renderStoryEmail, unsubscribeUrl } from '@/lib/newsletter/email'
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Receiver } from '@upstash/qstash'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import { wantsStory } from '@/lib/topics'
import { randomUUID } from 'crypto'

const resendApiKey = process.env.RESEND_API_KEY
// Constructed on first use. `new Resend(undefined)` throws at import time, so
// building without RESEND_API_KEY failed while collecting page data even
// though the guards below never send mail without a key.
let resendClient: Resend | null = null
function resend(): Resend {
  if (!resendClient) resendClient = new Resend(resendApiKey)
  return resendClient
}

async function verifyQstash(request: NextRequest, body: string): Promise<boolean> {
  const signature = request.headers.get('Upstash-Signature')
  if (!signature) return false

  const current = process.env.QSTASH_CURRENT_SIGNING_KEY
  const next = process.env.QSTASH_NEXT_SIGNING_KEY
  if (!current || !next) return false

  const receiver = new Receiver({
    currentSigningKey: current,
    nextSigningKey: next,
  })

  // Receiver.verify() THROWS on a bad signature rather than returning false, so
  // a forged request used to fall into the route's catch-all and answer 500.
  try {
    return await receiver.verify({
      signature,
      body,
    })
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const verified = await verifyQstash(request, body)

    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body) as { slug?: string; note?: string }
    const slug = payload.slug
    // Optional line from the writer, shown above the story in the email.
    const note = typeof payload.note === 'string' ? payload.note.trim().slice(0, 600) : ''

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 })
    }

    const supabase = createSupabaseServiceClient()
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (articleError) {
      console.error('Newsletter article lookup failed:', articleError)
      return NextResponse.json({ error: 'Failed to load article' }, { status: 500 })
    }

    if (!article || !article.published) {
      return NextResponse.json({ error: 'Article not found or unpublished' }, { status: 404 })
    }

    if (article.last_newsletter_sent_at) {
      return NextResponse.json({ error: 'Newsletter already sent' }, { status: 409 })
    }

    // '*' rather than naming `lanes`, so this still works before
    // supabase/add_subscriber_lanes.sql is run (everyone gets everything).
    const { data: subscribers, error: subsError } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('active', true)

    if (subsError) {
      console.error('Newsletter subscribers lookup failed:', subsError)
      return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 })
    }

    // Only readers who picked this story's lane, plus everyone who gets every
    // lane (lanes NULL or empty).
    const list = ((subscribers ?? []) as Array<{ id: string; email: string; unsubscribe_token: string | null; lanes?: string[] | null }>)
      .filter((subscriber) => wantsStory(subscriber.lanes, article.topic))
    const from = personalFrom()

    let sent = 0
    let failed = 0
    const batchSize = 25

    for (let i = 0; i < list.length; i += batchSize) {
      const batch = list.slice(i, i + batchSize)
      await Promise.all(batch.map(async (subscriber) => {
        try {
          let token = subscriber.unsubscribe_token
          if (!token) {
            token = randomUUID()
            await supabase
              .from('newsletter_subscribers')
              .update({ unsubscribe_token: token })
              .eq('id', subscriber.id)
          }

          const email = renderStoryEmail({ article, note, lanes: subscriber.lanes, token })

          await sendOrThrow(resend(), {
            from,
            replyTo: EMAIL_REPLY_TO,
            to: subscriber.email,
            subject: email.subject,
            headers: {
              // One-click unsubscribe (RFC 8058), which Gmail and Yahoo
              // expect from bulk senders.
              'List-Unsubscribe': `<${unsubscribeUrl(token)}>`,
              'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
            },
            html: email.html,
            text: email.text,
          })
          sent += 1
        } catch (mailErr) {
          failed += 1
          console.warn('Resend send error:', mailErr)
        }
      }))
    }

    // Mark the article as emailed only if at least one message was accepted.
    // It used to be marked unconditionally, so a job where every send failed
    // still locked the admin's Send button for that article for good.
    if (sent === 0) {
      if (failed > 0) {
        console.error(`Newsletter job for "${article.slug}" delivered 0 of ${list.length}; leaving it unmarked so it can be retried.`)
        // A non-2xx lets QStash retry. Nothing went out, so a retry cannot double-send.
        return NextResponse.json(
          { ok: false, error: 'No emails were delivered', total: list.length, sent, failed },
          { status: 502 }
        )
      }
      return NextResponse.json({ ok: true, total: 0, sent: 0, failed: 0 })
    }

    await supabase
      .from('articles')
      .update({ last_newsletter_sent_at: new Date().toISOString() })
      .eq('id', article.id)

    return NextResponse.json({ ok: true, total: list.length, sent, failed })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('Newsletter send job crash:', msg)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
