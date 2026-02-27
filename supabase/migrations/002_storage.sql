-- ============================================================
-- Storage Buckets Setup (run in Supabase SQL editor or via CLI)
-- ============================================================

-- Chef portfolio images bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('chef-portfolio', 'chef-portfolio', true)
ON CONFLICT DO NOTHING;

-- RLS policies for storage
CREATE POLICY "portfolio_images_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'chef-portfolio');

CREATE POLICY "portfolio_images_auth_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'chef-portfolio'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "portfolio_images_owner_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'chef-portfolio'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
