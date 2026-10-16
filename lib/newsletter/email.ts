import { pieceTypeInfo } from '@/lib/articles/piece-type'
import { SITE_OWNER } from '@/lib/author'
import { escapeHtml } from '@/lib/email'
import { getSiteUrl } from '@/lib/site'
import { BUCKET_COLORS, LANES, bucketFor, topicFamily } from '@/lib/topics'

/**
 * The emails subscribers get, written as a note from the site's writer
 * rather than a brand blast: from his name, the headline as the subject, an
 * optional line from him above the story, his sign-off, and a footer that
 * says what they signed up for with "Change what you get" and "Unsubscribe".
 *
 * Built with tables and inline styles because that is what email clients
 * render reliably. Every email also has a plain-text version.
 */

const PAPER = '#FAFAF7'
const INK = '#141414'
const MUTED = '#5C6066'
const RULE = '#E3E3DE'
const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif"
const DISPLAY = "Impact, 'Arial Narrow Bold', 'Helvetica Neue', Arial, sans-serif"

function site() {
  return getSiteUrl().replace(/\/$/, '')
}

function absolute(url: string | null | undefined) {
  if (!url) return null
  if (/^https?:\/\//.test(url)) return url
  return `${site()}${url.startsWith('/') ? '' : '/'}${url}`
}

export function manageUrl(token: string) {
  return `${site()}/subscribe/manage?token=${encodeURIComponent(token)}`
}

/** For the List-Unsubscribe header: mail apps POST to it (one click). */
export function unsubscribeUrl(token: string) {
  return `${site()}/api/newsletter/unsubscribe?token=${encodeURIComponent(token)}`
}

/**
 * The "Unsubscribe" link in the email body opens a confirm button rather
 * than unsubscribing on the spot: some mail security scanners open every
 * link in a message, which would otherwise unsubscribe the reader.
 */
function unsubscribeLink(token: string) {
  return `${manageUrl(token)}&confirm=unsubscribe`
}

/** "Court and Life" / "Court, Code and Life" / "everything I write". */
function lanesSentence(lanes: string[] | null | undefined) {
  const picked = LANES.filter((lane) => lanes?.includes(lane.key) || (lane.key === 'life' && lanes?.includes('home')))
  if (!lanes?.length || picked.length === 0 || picked.length === LANES.length) return 'everything I write'
  const names = picked.map((lane) => lane.label)
  return names.length === 1 ? names[0] : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`
}

function paragraphs(text: string) {
  return text.split(/\n{2,}|\r\n\r\n/).map((p) => p.trim()).filter(Boolean)
}

function shell({ preheader, accent, inner }: { preheader: string; accent: string; inner: string }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${escapeHtml(preheader)}</title>
</head>
<body style="margin:0;padding:0;background:${PAPER};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};">
<tr><td align="center" style="padding:24px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
<tr><td style="height:6px;background:${accent};font-size:0;line-height:0;">&nbsp;</td></tr>
<tr><td style="padding:22px 0 0;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:2px;color:${MUTED};text-transform:uppercase;">The Daily Dribble</td></tr>
${inner}
</table>
</td></tr>
</table>
</body>
</html>`
}

function footer({ lanes, token }: { lanes: string[] | null | undefined; token: string }) {
  return `<tr><td style="padding:28px 0 0;border-top:1px solid ${RULE};font-family:${FONT};font-size:14px;line-height:1.6;color:${MUTED};">
You're getting this because you signed up for ${escapeHtml(lanesSentence(lanes))} on The Daily Dribble. Reply to this email and it comes straight to me.<br><br>
<a href="${manageUrl(token)}" style="color:${INK};font-weight:700;">Change what you get</a>
&nbsp;&middot;&nbsp;
<a href="${unsubscribeLink(token)}" style="color:${MUTED};">Unsubscribe</a>
</td></tr>`
}

function signOff() {
  const handle = SITE_OWNER.twitter.replace(/^@/, '')
  return `<tr><td style="padding:22px 0 28px;font-family:${FONT};font-size:17px;line-height:1.6;color:${INK};">
&mdash; ${escapeHtml(SITE_OWNER.name)}<br>
<a href="https://x.com/${handle}" style="font-size:14px;color:${MUTED};">@${escapeHtml(handle)}</a>
</td></tr>`
}

export interface StoryEmailInput {
  title: string
  excerpt: string | null
  slug: string
  hero_image_url: string | null
  topic: string | null
  article_type?: string | null
}

/** The email for one story, to one subscriber. */
export function renderStoryEmail({
  article,
  note,
  lanes,
  token,
}: {
  article: StoryEmailInput
  note?: string | null
  lanes: string[] | null | undefined
  token: string
}) {
  const accent = BUCKET_COLORS[topicFamily(article.topic)]
  const bucket = bucketFor(article.topic)
  const label = pieceTypeInfo(article.article_type)?.label
  const kicker = [bucket, label].filter(Boolean).join(' · ').toUpperCase()
  const url = `${site()}/news/${article.slug}`
  const image = absolute(article.hero_image_url)
  const noteParas = note ? paragraphs(note) : []

  const noteHtml = noteParas.length
    ? `<tr><td style="padding:22px 0 6px;font-family:${FONT};font-size:17px;line-height:1.6;color:${INK};">
${noteParas.map((p) => `<p style="margin:0 0 14px;">${escapeHtml(p)}</p>`).join('')}
</td></tr>`
    : ''

  const inner = `${noteHtml}
<tr><td style="padding:${noteParas.length ? '6px' : '22px'} 0 0;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid ${RULE};">
${image ? `<tr><td><a href="${url}"><img src="${escapeHtml(image)}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></a></td></tr>` : ''}
<tr><td style="padding:22px 22px 0;font-family:${FONT};font-size:13px;font-weight:700;letter-spacing:2px;color:${accent};">${escapeHtml(kicker)}</td></tr>
<tr><td style="padding:10px 22px 0;font-family:${DISPLAY};font-size:30px;line-height:1.1;color:${INK};text-transform:uppercase;"><a href="${url}" style="color:${INK};text-decoration:none;">${escapeHtml(article.title)}</a></td></tr>
${article.excerpt ? `<tr><td style="padding:12px 22px 0;font-family:${FONT};font-size:17px;line-height:1.6;color:#33363A;">${escapeHtml(article.excerpt)}</td></tr>` : ''}
<tr><td style="padding:20px 22px 24px;">
<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td style="background:${accent};">
<a href="${url}" style="display:inline-block;padding:14px 22px;font-family:${FONT};font-size:15px;font-weight:700;letter-spacing:1px;color:#0D0D0D;text-decoration:none;text-transform:uppercase;">Read it</a>
</td></tr></table>
</td></tr>
</table>
</td></tr>
${signOff()}
${footer({ lanes, token })}`

  const text = [
    ...noteParas,
    noteParas.length ? '' : null,
    kicker,
    article.title,
    article.excerpt ?? '',
    '',
    `Read it: ${url}`,
    '',
    `- ${SITE_OWNER.name}`,
    '',
    `You're getting this because you signed up for ${lanesSentence(lanes)} on The Daily Dribble. Reply and it comes straight to me.`,
    `Change what you get: ${manageUrl(token)}`,
    `Unsubscribe: ${unsubscribeLink(token)}`,
  ].filter((line) => line !== null).join('\n')

  return {
    subject: article.title,
    html: shell({ preheader: noteParas[0] ?? article.excerpt ?? article.title, accent, inner }),
    text,
  }
}

/** The welcome email, sent once on sign-up. */
export function renderWelcomeEmail({ lanes, token }: { lanes: string[] | null | undefined; token: string }) {
  const accent = BUCKET_COLORS.court
  const what = lanesSentence(lanes)
  const inner = `<tr><td style="padding:22px 0 0;font-family:${FONT};font-size:17px;line-height:1.6;color:${INK};">
<p style="margin:0 0 14px;">Thanks for subscribing. This is my home for sports, tech, culture, and life at home, and now it comes to you.</p>
<p style="margin:0 0 14px;">You'll get ${escapeHtml(what)} as I publish it. If that ever changes, use the link at the bottom of any email.</p>
<p style="margin:0 0 14px;">Every piece is labeled Opinion, Analysis, Report or Rumor, so you always know what you're reading. <a href="${site()}/standards" style="color:${INK};font-weight:700;">Here's how I work.</a></p>
</td></tr>
${signOff()}
${footer({ lanes, token })}`

  const text = [
    'Thanks for subscribing. This is my home for sports, tech, culture, and life at home, and now it comes to you.',
    '',
    `You'll get ${what} as I publish it. If that ever changes, use the link at the bottom of any email.`,
    '',
    `Every piece is labeled Opinion, Analysis, Report or Rumor. How I work: ${site()}/standards`,
    '',
    `- ${SITE_OWNER.name}`,
    '',
    `Change what you get: ${manageUrl(token)}`,
    `Unsubscribe: ${unsubscribeLink(token)}`,
  ].join('\n')

  return {
    subject: `Welcome to The Daily Dribble`,
    html: shell({ preheader: 'Thanks for subscribing.', accent, inner }),
    text,
  }
}
