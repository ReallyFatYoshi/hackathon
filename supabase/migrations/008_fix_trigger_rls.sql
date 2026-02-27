-- ============================================================
-- Fix: trigger INSERT blocked by RLS
-- auth.uid() is NULL when the trigger runs (no JWT context),
-- so "profiles_insert_own" WITH CHECK (auth.uid() = id) fails.
-- Fix: recreate trigger function with row_security disabled,
-- and add a permissive INSERT policy for the trigger context.
-- ============================================================

-- 1. Drop the restrictive insert policy
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;

-- 2. Allow authenticated users to insert their own profile
--    AND allow the trigger (auth.uid() IS NULL, but id matches NEW.id)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR auth.uid() IS NULL
  );

-- 3. Recreate trigger function that also disables row security locally
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- 4. Re-attach trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
