import { Suspense } from 'react'
import LoginForm from './LoginForm'

export const metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
}

export default function LoginPage() {
  return (
    <div className="tdd-home tdd-auth">
      <h1>Sign in</h1>
      <p className="tdd-auth-lede">Admin access for The Daily Dribble desk.</p>
      <Suspense>
        <LoginForm />
      </Suspense>
    </div>
  )
}
