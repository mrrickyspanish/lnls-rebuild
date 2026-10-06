import type { ReactNode } from 'react'

/** Shared frame for the privacy policy and terms of service. */
export default function LegalDoc({
  title,
  updated,
  children,
}: {
  title: string
  updated: string
  children: ReactNode
}) {
  return (
    <article className="tdd-home tdd-legal">
      <header className="tdd-legal-head">
        <h1>{title}</h1>
        <p className="tdd-legal-updated">Last updated {updated}</p>
      </header>
      <div className="tdd-legal-body">{children}</div>
    </article>
  )
}
