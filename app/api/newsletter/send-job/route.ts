import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { Receiver } from '@upstash/qstash'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import { randomUUID } from 'crypto'

const resendApiKey = process.env.RESEND_API_KEY
const resend = new Resend(resendApiKey)

function buildArticleUrl(slug: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://lnls.media'
  return `${base.replace(/\/$/, '')}/news/${slug}`
}

function buildUnsubscribeUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    'https://lnls.media'
  return `${base.replace(/\/$/, '')}/api/newsletter/unsubscribe?token=${token}`
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

  return receiver.verify({
    signature,
    body,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const verified = await verifyQstash(request, body)

    if (!verified) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const payload = JSON.parse(body) as { slug?: string }
    const slug = payload.slug

    if (!slug) {
      return NextResponse.json({ error: 'Slug is required' }, { status: 400 })
    }

    if (!resendApiKey) {
      return NextResponse.json({ error: 'RESEND_API_KEY missing' }, { status: 500 })
    }

    const supabase = createSupabaseServiceClient()
    const { data: article, error: articleError } = await supabase
      .from('articles')
      .select('id, title, excerpt, slug, hero_image_url, published, last_newsletter_sent_at')
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

    const { data: subscribers, error: subsError } = await supabase
      .from('newsletter_subscribers')
      .select('id, email, unsubscribe_token')
      .eq('active', true)

    if (subsError) {
      console.error('Newsletter subscribers lookup failed:', subsError)
      return NextResponse.json({ error: 'Failed to load subscribers' }, { status: 500 })
    }

    const list = subscribers ?? []
    const articleUrl = buildArticleUrl(article.slug)
    const subject = `New article: ${article.title}`
    const from = process.env.RESEND_FROM_EMAIL || 'LNLS <newsletter@lnls.media>'

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

          const unsubscribeUrl = buildUnsubscribeUrl(token)

          await resend.emails.send({
            from,
            to: subscriber.email,
            subject,
            headers: {
              'List-Unsubscribe': `<${unsubscribeUrl}>`,
            },
            html: `
              <div style="font-family:Arial,sans-serif;line-height:1.6">
                <p>Hi there,</p>
                <h1>${article.title}</h1>
                ${article.hero_image_url ? `<img src="${article.hero_image_url}" alt="${article.title}" style="max-width:100%;border-radius:12px" />` : ''}
                <p>${article.excerpt || ''}</p>
                <p><a href="${articleUrl}">Read the full article</a></p>
                <p style="font-size:12px;color:#777">If you want to stop receiving these emails, <a href="${unsubscribeUrl}">unsubscribe here</a>.</p>
                <p>— The LNLS Team</p>
              </div>
            `,
          })
          sent += 1
        } catch (mailErr) {
          failed += 1
          console.warn('Resend send error:', mailErr)
        }
      }))
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
