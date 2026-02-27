-- ============================================================
-- Fix broken accounts caused by the infinite recursion bug
-- Run AFTER 004_fix_rls_recursion.sql
-- ============================================================

-- 1. Backfill missing profiles for any auth.users with no profile row
--    (happens when handle_new_user trigger ran but recursion caused silent failure,
--     or if the trigger itself hadn't been created yet)
INSERT INTO profiles (id, email, full_name, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.raw_user_meta_data->>'role', 'client')
FROM auth.users u
LEFT JOIN profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- 2. Set role = 'chef' for anyone who has submitted a chef application
--    but whose profile role is still 'client'
UPDATE profiles p
SET role = 'chef', updated_at = NOW()
WHERE p.role = 'client'
  AND EXISTS (
    SELECT 1 FROM chef_applications ca WHERE ca.user_id = p.id
  );
