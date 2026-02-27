-- ============================================================
-- Fix: infinite recursion in profiles RLS policy
-- profiles_admin_select queried `profiles` from within a
-- `profiles` policy — Postgres evaluates ALL policies on every
-- query, so this caused infinite recursion for ALL users.
-- Fix: use a SECURITY DEFINER function to break the cycle.
-- ============================================================

-- 1. Create helper function that runs as definer (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
$$;

-- 2. Replace the recursive policy on profiles
DROP POLICY IF EXISTS "profiles_admin_select" ON profiles;
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT USING (is_admin());

-- 3. Update other admin policies to use is_admin() for consistency
DROP POLICY IF EXISTS "applications_admin_all" ON chef_applications;
CREATE POLICY "applications_admin_all" ON chef_applications
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "interviews_admin_all" ON interviews;
CREATE POLICY "interviews_admin_all" ON interviews
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "chefs_admin_all" ON chefs;
CREATE POLICY "chefs_admin_all" ON chefs
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "events_admin_all" ON events;
CREATE POLICY "events_admin_all" ON events
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "event_apps_admin_all" ON event_applications;
CREATE POLICY "event_apps_admin_all" ON event_applications
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "bookings_admin_all" ON bookings;
CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (is_admin());

DROP POLICY IF EXISTS "reviews_admin_all" ON reviews;
CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (is_admin());
