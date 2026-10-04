import Link from 'next/link'

import { isAdminSignupOpen } from '@/lib/auth/signup-code'
import AdminSignupForm from './AdminSignupForm'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Create admin account',
  robots: { index: false, follow: false },
}

export default function AdminSignupPage() {
  if (!isAdminSignupOpen()) {
    return (
      <div className="tdd-home tdd-auth">
        <h1>Sign-up is closed</h1>
        <p className="tdd-auth-lede">
          New admin accounts can only be created while an access code is active. Ask the site owner
          for access.
        </p>
        <Link href="/login" className="tdd-more">Back to sign in</Link>
      </div>
    )
  }

  return (
    <div className="tdd-home tdd-auth">
      <h1>Create admin account</h1>
      <p className="tdd-auth-lede">You need the access code set by the site owner.</p>
      <AdminSignupForm />
    </div>
  )
}
