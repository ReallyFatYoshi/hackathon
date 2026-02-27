-- Payments tracking table (referenced in release route)
CREATE TABLE payments (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id       UUID NOT NULL REFERENCES bookings(id),
  amount           NUMERIC(10,2) NOT NULL,
  commission       NUMERIC(10,2) NOT NULL,
  net_amount       NUMERIC(10,2) NOT NULL,
  stripe_transfer_id TEXT,
  released_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "payments_client_select" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
        AND bookings.client_id = auth.uid()
    )
  );

CREATE POLICY "payments_chef_select" ON payments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings b
      JOIN chefs c ON c.id = b.chef_id
      WHERE b.id = payments.booking_id
        AND c.user_id = auth.uid()
    )
  );
