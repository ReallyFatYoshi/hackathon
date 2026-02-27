-- ============================================================
-- MyChef MVP — Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'chef', 'admin')),
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Admin can read all profiles
CREATE POLICY "profiles_admin_select" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- CHEF APPLICATIONS
-- ============================================================
CREATE TABLE chef_applications (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status               TEXT NOT NULL DEFAULT 'pending_review'
                         CHECK (status IN (
                           'pending_review','interview_scheduled','interview_completed',
                           'approved','rejected','no_show'
                         )),
  first_name           TEXT NOT NULL,
  last_name            TEXT NOT NULL,
  email                TEXT NOT NULL,
  phone                TEXT NOT NULL,
  years_experience     INT NOT NULL CHECK (years_experience >= 0),
  cuisine_specialties  TEXT[] NOT NULL DEFAULT '{}',
  event_specialties    TEXT[] NOT NULL DEFAULT '{}',
  bio                  TEXT NOT NULL,
  portfolio_images     TEXT[] NOT NULL DEFAULT '{}',
  social_links         JSONB DEFAULT '{}',
  admin_notes          TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chef_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "applications_select_own" ON chef_applications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "applications_insert_own" ON chef_applications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "applications_admin_all" ON chef_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- INTERVIEWS
-- ============================================================
CREATE TABLE interviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  application_id   UUID NOT NULL REFERENCES chef_applications(id) ON DELETE CASCADE,
  scheduled_at     TIMESTAMPTZ NOT NULL,
  daily_room_url   TEXT NOT NULL,
  daily_room_name  TEXT NOT NULL,
  status           TEXT NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN ('scheduled','in_progress','completed','no_show','cancelled')),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

-- Chef can view their own interview (via application)
CREATE POLICY "interviews_select_chef" ON interviews
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chef_applications ca
      WHERE ca.id = interviews.application_id
        AND ca.user_id = auth.uid()
    )
  );

CREATE POLICY "interviews_admin_all" ON interviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- CHEFS (approved profiles)
-- ============================================================
CREATE TABLE chefs (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id             UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  application_id      UUID UNIQUE REFERENCES chef_applications(id),
  first_name          TEXT NOT NULL,
  last_name           TEXT NOT NULL,
  bio                 TEXT NOT NULL,
  years_experience    INT NOT NULL,
  cuisine_specialties TEXT[] NOT NULL DEFAULT '{}',
  event_specialties   TEXT[] NOT NULL DEFAULT '{}',
  portfolio_images    TEXT[] NOT NULL DEFAULT '{}',
  social_links        JSONB DEFAULT '{}',
  total_events        INT NOT NULL DEFAULT 0,
  avg_rating          NUMERIC(3,2) NOT NULL DEFAULT 0,
  is_visible          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE chefs ENABLE ROW LEVEL SECURITY;

-- Public can read visible chefs
CREATE POLICY "chefs_select_public" ON chefs
  FOR SELECT USING (is_visible = TRUE);

-- Chef can read their own profile
CREATE POLICY "chefs_select_own" ON chefs
  FOR SELECT USING (auth.uid() = user_id);

-- Chef can update their own profile
CREATE POLICY "chefs_update_own" ON chefs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "chefs_admin_all" ON chefs
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT NOT NULL,
  event_type   TEXT NOT NULL,
  date         TIMESTAMPTZ NOT NULL,
  location     TEXT NOT NULL,
  guest_count  INT NOT NULL CHECK (guest_count > 0),
  budget_min   NUMERIC(10,2) NOT NULL,
  budget_max   NUMERIC(10,2) NOT NULL,
  description  TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'open'
                 CHECK (status IN ('open','filled','completed','cancelled')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Public / chefs can view open events
CREATE POLICY "events_select_open" ON events
  FOR SELECT USING (status = 'open' OR auth.uid() = client_id);

-- Client owns their events
CREATE POLICY "events_insert_client" ON events
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "events_update_client" ON events
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "events_admin_all" ON events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- EVENT APPLICATIONS
-- ============================================================
CREATE TABLE event_applications (
  id        UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id  UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  chef_id   UUID NOT NULL REFERENCES chefs(id) ON DELETE CASCADE,
  message   TEXT NOT NULL,
  status    TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (event_id, chef_id)
);

ALTER TABLE event_applications ENABLE ROW LEVEL SECURITY;

-- Chef can manage their own applications
CREATE POLICY "event_apps_chef_select" ON event_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chefs WHERE chefs.id = event_applications.chef_id AND chefs.user_id = auth.uid())
  );

CREATE POLICY "event_apps_chef_insert" ON event_applications
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM chefs WHERE chefs.id = event_applications.chef_id AND chefs.user_id = auth.uid())
  );

-- Client can view applications to their events
CREATE POLICY "event_apps_client_select" ON event_applications
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_applications.event_id AND events.client_id = auth.uid())
  );

CREATE POLICY "event_apps_client_update" ON event_applications
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM events WHERE events.id = event_applications.event_id AND events.client_id = auth.uid())
  );

CREATE POLICY "event_apps_admin_all" ON event_applications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- BOOKINGS
-- ============================================================
CREATE TABLE bookings (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id                 UUID NOT NULL REFERENCES events(id),
  chef_id                  UUID NOT NULL REFERENCES chefs(id),
  client_id                UUID NOT NULL REFERENCES auth.users(id),
  amount                   NUMERIC(10,2) NOT NULL,
  commission_pct           NUMERIC(5,2) NOT NULL DEFAULT 15,
  payment_status           TEXT NOT NULL DEFAULT 'held'
                             CHECK (payment_status IN ('held','released','refunded')),
  booking_status           TEXT NOT NULL DEFAULT 'confirmed'
                             CHECK (booking_status IN ('confirmed','completed','disputed','cancelled')),
  stripe_payment_intent_id TEXT,
  chef_completed_at        TIMESTAMPTZ,
  client_confirmed_at      TIMESTAMPTZ,
  created_at               TIMESTAMPTZ DEFAULT NOW(),
  updated_at               TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_select_client" ON bookings
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "bookings_select_chef" ON bookings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM chefs WHERE chefs.id = bookings.chef_id AND chefs.user_id = auth.uid())
  );

CREATE POLICY "bookings_update_client" ON bookings
  FOR UPDATE USING (auth.uid() = client_id);

CREATE POLICY "bookings_update_chef" ON bookings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM chefs WHERE chefs.id = bookings.chef_id AND chefs.user_id = auth.uid())
  );

CREATE POLICY "bookings_admin_all" ON bookings
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID UNIQUE NOT NULL REFERENCES bookings(id),
  client_id   UUID NOT NULL REFERENCES auth.users(id),
  chef_id     UUID NOT NULL REFERENCES chefs(id),
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reviews_select_public" ON reviews
  FOR SELECT USING (TRUE);

CREATE POLICY "reviews_insert_client" ON reviews
  FOR INSERT WITH CHECK (auth.uid() = client_id);

CREATE POLICY "reviews_admin_all" ON reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update avg_rating when review is added
CREATE OR REPLACE FUNCTION update_chef_rating()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE chefs
  SET
    avg_rating = (
      SELECT ROUND(AVG(rating)::NUMERIC, 2)
      FROM reviews
      WHERE chef_id = NEW.chef_id
    ),
    updated_at = NOW()
  WHERE id = NEW.chef_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_review_created
  AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_chef_rating();

-- Update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_applications BEFORE UPDATE ON chef_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_interviews BEFORE UPDATE ON interviews FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_chefs BEFORE UPDATE ON chefs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_events BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_bookings BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
