import { createServerSupabase } from '@/lib/supabase/server'
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
    <div className="min-h-screen bg-black text-white">
      <div className="flex items-center justify-end gap-4 border-b border-neutral-800 px-6 py-3 text-sm text-neutral-400">
        {user?.email && <span>{user.email}</span>}
        <SignOutButton />
      </div>
      {children}
    </div>
  )
}
