-- ============================================================
-- Add company/individual applicant type support
-- ============================================================

-- Add fields to chef_applications
ALTER TABLE chef_applications
  ADD COLUMN IF NOT EXISTS applicant_type TEXT NOT NULL DEFAULT 'individual'
    CHECK (applicant_type IN ('individual', 'company')),
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add fields to chefs
ALTER TABLE chefs
  ADD COLUMN IF NOT EXISTS applicant_type TEXT NOT NULL DEFAULT 'individual'
    CHECK (applicant_type IN ('individual', 'company')),
  ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Update seed chefs to have correct type (all individual by default — OK)
-- Companies can be added via the application form going forward
