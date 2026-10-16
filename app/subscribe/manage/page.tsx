import Link from 'next/link'

import ManageLanes from '@/components/ManageLanes'
import { createSupabaseServiceClient } from '@/lib/supabase/client'
import { LANES } from '@/lib/topics'

export const metadata = {
  title: 'Change what you get',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

type PageProps = { searchParams: Promise<{ token?: string; status?: string; confirm?: string }> }

/** Masks an address for display: rick@example.com -> r***@example.com. */
function mask(email: string) {
  const [name, domain] = email.split('@')
  return domain ? `${name.slice(0, 1)}***@${domain}` : email
}

/**
 * Where "Change what you get" (and "Unsubscribe") in every email lands. The
 * token in the link identifies the subscriber; nothing else is needed.
 */
export default async function ManageSubscriptionPage({ searchParams }: PageProps) {
  const { token, status, confirm } = await searchParams
  let subscriber: { email: string; active: boolean; lanes: string[] | null } | null = null

  if (token) {
    const supabase = createSupabaseServiceClient()
    const { data } = await supabase
      .from('newsletter_subscribers')
      .select('*')
      .eq('unsubscribe_token', token)
      .maybeSingle()
    if (data) {
      const row = data as { email: string; active?: boolean | null; lanes?: string[] | null }
      subscriber = { email: row.email, active: row.active !== false, lanes: row.lanes ?? null }
    }
  }

  return (
    <div className="tdd-home tdd-contact">
      <header className="tdd-contact-hero">
        <h1>Change what you get</h1>
        {subscriber ? (
          <p>
            {status === 'unsubscribed' || !subscriber.active
              ? <>You&apos;re unsubscribed, {mask(subscriber.email)}. Changed your mind? Pick your lanes and save to start getting emails again.</>
              : <>Pick the lanes you want emails for, {mask(subscriber.email)}. You can change this any time from the link in any email.</>}
          </p>
        ) : (
          <p>This link has expired or isn&apos;t complete. <Link href="/subscribe">Sign up again</Link> and pick your lanes there.</p>
        )}
      </header>

      {subscriber && token && (
        <ManageLanes
          token={token}
          initial={(subscriber.lanes?.length ? subscriber.lanes.map((lane) => (lane === 'home' ? 'life' : lane)) : LANES.map((lane) => lane.key)) as string[]}
          active={subscriber.active && status !== 'unsubscribed'}
          confirmUnsubscribe={confirm === 'unsubscribe'}
        />
      )}
    </div>
  )
}
