-- Admin accounts for /admin (replaces the shared Basic-auth password).
--
-- Run once in the lnls Supabase project: SQL Editor -> paste -> Run.
-- Safe to re-run (IF NOT EXISTS / DROP POLICY IF EXISTS).
--
-- Model, ported from clw-wizards: admins are real Supabase Auth users. A user
-- is an admin only if they ALSO have an active row here. Rows are written only
-- server-side with the service role, after the ADMIN_SIGNUP_CODE env secret is
-- verified (app/admin-signup/actions.ts). Being signed in is never enough on
-- its own, so it does not matter if Supabase Auth allows public sign-ups.
--
-- Named admin_profiles (not `profiles`) so it cannot collide with a table this
-- project may already have.

CREATE TABLE IF NOT EXISTS public.admin_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;

-- A signed-in user may read ONLY their own row; the middleware needs this to
-- check their own admin status. There are deliberately no insert, update or
-- delete policies: only the service role (which bypasses RLS) can write.
DROP POLICY IF EXISTS "read_own_admin_profile" ON public.admin_profiles;
CREATE POLICY "read_own_admin_profile"
  ON public.admin_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Explicit grants: newer Supabase projects no longer expose new public tables
-- to the API by default.
GRANT SELECT ON public.admin_profiles TO authenticated;
REVOKE ALL ON public.admin_profiles FROM anon;
