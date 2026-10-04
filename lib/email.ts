import type { Resend } from 'resend'

import { CONTACT_EMAIL } from '@/lib/contact'

/**
 * Everything outgoing mail needs, in one place.
 *
 * Resend only delivers from a domain verified in the account, and the verified
 * one is thedailydribble.com. The code sent from newsletter@lnls.media, a
 * domain that is not verified, so every message was rejected.
 */
export const BRAND_NAME = 'The Daily Dribble'

/** Replies from subscribers land in the contact inbox, not a no-reply void. */
export const EMAIL_REPLY_TO = CONTACT_EMAIL

/**
 * RESEND_FROM_EMAIL still overrides this. If it is set in Vercel it must be on
 * a verified domain, for example `The Daily Dribble <newsletter@thedailydribble.com>`.
 */
export function emailFrom(): string {
  return process.env.RESEND_FROM_EMAIL || `${BRAND_NAME} <newsletter@thedailydribble.com>`
}

/** Escape text before it is placed inside an HTML email. */
export function escapeHtml(value: string | null | undefined): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

type SendPayload = Parameters<Resend['emails']['send']>[0]

/**
 * Resend's SDK does NOT throw when the API rejects a message (unverified
 * domain, bad address, over quota, unpaid account). It returns
 * `{ data: null, error }`. The routes wrapped send() in try/catch and counted
 * a message as sent whenever nothing threw, so every rejected email was
 * counted as delivered and nothing ever showed up as a failure. This turns a
 * returned error into a thrown one so those handlers see it.
 */
export async function sendOrThrow(client: Resend, payload: SendPayload) {
  const { data, error } = await client.emails.send(payload)
  if (error) throw new Error(`${error.name}: ${error.message}`)
  return data
}
