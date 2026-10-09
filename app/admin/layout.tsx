import { createServerSupabase } from '@/lib/supabase/server'
import Link from 'next/link'
import SignOutButton from '@/components/admin/SignOutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Middleware has already refused anyone who is not an admin; this only reads
  // the address for display.
  const supabase = await createServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    // .tdd-admin: on admin pages the site nav stops pinning to the top and
    // the public footer (newsletter signup, site links) is hidden, so the
    // editor's own pinned bars get the screen (see globals.css).
    <div className="tdd-admin min-h-screen bg-black text-white">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-800 px-4 sm:px-6 py-2 text-sm text-neutral-400">
        <Link href="/admin" className="min-h-[44px] inline-flex items-center font-semibold text-neutral-200 hover:text-white">
          Admin
        </Link>
        <div className="flex items-center gap-4 min-w-0">
          {user?.email && <span className="truncate">{user.email}</span>}
          <SignOutButton />
        </div>
      </div>
      {children}
    </div>
  )
}
