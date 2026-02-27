-- ============================================================
-- Fix: "database error saving new user"
-- The handle_new_user trigger runs as SECURITY DEFINER and
-- bypasses RLS — but if the profiles table has any issue the
-- INSERT fails and Supabase surfaces "database error saving
-- new user". This script ensures the trigger and table are solid.
-- ============================================================

-- Re-create the trigger function with explicit error handling
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

-- Ensure trigger exists (drop + re-create in case it's stale)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
