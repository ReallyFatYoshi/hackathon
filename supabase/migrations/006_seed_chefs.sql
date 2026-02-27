-- ============================================================
-- Seed: Fake verified chefs for testing / demo
-- Run in Supabase SQL Editor (needs postgres / service role)
-- ============================================================

DO $$
DECLARE
  -- chef user IDs
  u1 UUID := 'aaaaaaaa-0001-0001-0001-aaaaaaaaaaaa';
  u2 UUID := 'aaaaaaaa-0002-0002-0002-aaaaaaaaaaaa';
  u3 UUID := 'aaaaaaaa-0003-0003-0003-aaaaaaaaaaaa';
  u4 UUID := 'aaaaaaaa-0004-0004-0004-aaaaaaaaaaaa';
  u5 UUID := 'aaaaaaaa-0005-0005-0005-aaaaaaaaaaaa';
  u6 UUID := 'aaaaaaaa-0006-0006-0006-aaaaaaaaaaaa';
  u7 UUID := 'aaaaaaaa-0007-0007-0007-aaaaaaaaaaaa';
  u8 UUID := 'aaaaaaaa-0008-0008-0008-aaaaaaaaaaaa';

  -- application IDs
  a1 UUID := 'bbbbbbbb-0001-0001-0001-bbbbbbbbbbbb';
  a2 UUID := 'bbbbbbbb-0002-0002-0002-bbbbbbbbbbbb';
  a3 UUID := 'bbbbbbbb-0003-0003-0003-bbbbbbbbbbbb';
  a4 UUID := 'bbbbbbbb-0004-0004-0004-bbbbbbbbbbbb';
  a5 UUID := 'bbbbbbbb-0005-0005-0005-bbbbbbbbbbbb';
  a6 UUID := 'bbbbbbbb-0006-0006-0006-bbbbbbbbbbbb';
  a7 UUID := 'bbbbbbbb-0007-0007-0007-bbbbbbbbbbbb';
  a8 UUID := 'bbbbbbbb-0008-0008-0008-bbbbbbbbbbbb';
BEGIN

-- --------------------------------------------------------
-- 1. Create auth.users rows
-- --------------------------------------------------------
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at, raw_user_meta_data, confirmation_token)
VALUES
  (u1,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'marco.rossi@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Marco Rossi","role":"chef"}'::jsonb,''),
  (u2,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'aiko.tanaka@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Aiko Tanaka","role":"chef"}'::jsonb,''),
  (u3,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'layla.hassan@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Layla Hassan","role":"chef"}'::jsonb,''),
  (u4,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'james.okonkwo@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"James Okonkwo","role":"chef"}'::jsonb,''),
  (u5,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'sofia.mendez@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Sofia Mendez","role":"chef"}'::jsonb,''),
  (u6,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'pierre.leblanc@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Pierre Leblanc","role":"chef"}'::jsonb,''),
  (u7,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'priya.sharma@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Priya Sharma","role":"chef"}'::jsonb,''),
  (u8,'00000000-0000-0000-0000-000000000000','authenticated','authenticated',
   'lucas.wright@mychef.test','',NOW(),NOW(),NOW(),
   '{"full_name":"Lucas Wright","role":"chef"}'::jsonb,'')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- 2. Create profiles
-- --------------------------------------------------------
INSERT INTO profiles (id, role, full_name, email) VALUES
  (u1,'chef','Marco Rossi',   'marco.rossi@mychef.test'),
  (u2,'chef','Aiko Tanaka',   'aiko.tanaka@mychef.test'),
  (u3,'chef','Layla Hassan',  'layla.hassan@mychef.test'),
  (u4,'chef','James Okonkwo', 'james.okonkwo@mychef.test'),
  (u5,'chef','Sofia Mendez',  'sofia.mendez@mychef.test'),
  (u6,'chef','Pierre Leblanc','pierre.leblanc@mychef.test'),
  (u7,'chef','Priya Sharma',  'priya.sharma@mychef.test'),
  (u8,'chef','Lucas Wright',  'lucas.wright@mychef.test')
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- 3. Create approved chef_applications
-- --------------------------------------------------------
INSERT INTO chef_applications
  (id, user_id, status, first_name, last_name, email, phone,
   years_experience, cuisine_specialties, event_specialties, bio, portfolio_images)
VALUES
  (a1,u1,'approved','Marco','Rossi','marco.rossi@mychef.test','+1-555-0101',
   12, ARRAY['Italian','Mediterranean'],
   ARRAY['Wedding','Corporate','Private Dining'],
   'Born in Naples, trained under Michelin-starred mentors in Rome before bringing authentic Italian craft to North America. My philosophy: simple, seasonal ingredients transformed by technique.',
   ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600','https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600']),

  (a2,u2,'approved','Aiko','Tanaka','aiko.tanaka@mychef.test','+1-555-0102',
   9, ARRAY['Japanese','Asian Fusion','Sushi'],
   ARRAY['Corporate','Private Dining','Catering'],
   'Tokyo-trained sushi master and kaiseki specialist now based in New York. I blend traditional Japanese precision with local seasonal ingredients to create unforgettable omakase experiences.',
   ARRAY['https://images.unsplash.com/photo-1553621042-f6e147245754?w=600','https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600','https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600']),

  (a3,u3,'approved','Layla','Hassan','layla.hassan@mychef.test','+1-555-0103',
   15, ARRAY['Middle Eastern','Mediterranean','Vegan'],
   ARRAY['Wedding','Catering','Festival'],
   'A culinary ambassador for Levantine cuisine, I weave together the spices of Beirut, the mezze traditions of Syria, and modern plant-forward techniques into stunning large-format spreads.',
   ARRAY['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600']),

  (a4,u4,'approved','James','Okonkwo','james.okonkwo@mychef.test','+1-555-0104',
   11, ARRAY['West African','Caribbean','Barbecue'],
   ARRAY['Festival','Corporate','Catering'],
   'Growing up in Lagos, food was how we celebrated everything. I bring the bold, smoky flavors of West African open-fire cooking and Caribbean jerk traditions to modern events of all sizes.',
   ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600','https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600','https://images.unsplash.com/photo-1544025162-d76694265947?w=600']),

  (a5,u5,'approved','Sofia','Mendez','sofia.mendez@mychef.test','+1-555-0105',
   8, ARRAY['Mexican','Latin American','Vegan'],
   ARRAY['Wedding','Private Dining','Corporate'],
   'From Mexico City''s street markets to fine dining in Oaxaca, I craft elevated Mexican cuisine that honors tradition while embracing innovation. Specialist in plant-based Latin fare.',
   ARRAY['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600','https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600','https://images.unsplash.com/photo-1547592180-85f173990554?w=600']),

  (a6,u6,'approved','Pierre','Leblanc','pierre.leblanc@mychef.test','+1-555-0106',
   18, ARRAY['French','Pastry','European'],
   ARRAY['Wedding','Private Dining','Corporate'],
   'Classically trained at Le Cordon Bleu Paris with 18 years spanning Michelin-starred kitchens in Lyon and Montreal. Renowned for elaborate tasting menus and show-stopping wedding patisserie.',
   ARRAY['https://images.unsplash.com/photo-1484723091739-30990b5d2a4c?w=600','https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600','https://images.unsplash.com/photo-1612203985729-70726954388c?w=600']),

  (a7,u7,'approved','Priya','Sharma','priya.sharma@mychef.test','+1-555-0107',
   10, ARRAY['Indian','South Asian','Vegan'],
   ARRAY['Wedding','Catering','Festival'],
   'Raised in Jaipur, trained in Mumbai''s top hotel kitchens. I specialize in regional Indian cuisine from coastal Kerala seafood curries to royal Mughal banquet feasts for 500+ guests.',
   ARRAY['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600','https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=600','https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600']),

  (a8,u8,'approved','Lucas','Wright','lucas.wright@mychef.test','+1-555-0108',
   7, ARRAY['American','Barbecue','Comfort Food'],
   ARRAY['Corporate','Festival','Catering'],
   'Former Food Network contestant turned full-time event chef. My specialty is elevated comfort food — think wagyu smash burgers, slow-smoked brisket, and lobster mac for crowds who want flavor above all.',
   ARRAY['https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600','https://images.unsplash.com/photo-1558030006-450675393462?w=600','https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600'])
ON CONFLICT (id) DO NOTHING;

-- --------------------------------------------------------
-- 4. Create chefs rows (public profiles)
-- --------------------------------------------------------
INSERT INTO chefs
  (user_id, application_id, first_name, last_name, bio,
   years_experience, cuisine_specialties, event_specialties,
   portfolio_images, total_events, avg_rating, is_visible)
VALUES
  (u1,a1,'Marco','Rossi',
   'Born in Naples, trained under Michelin-starred mentors in Rome before bringing authentic Italian craft to North America. My philosophy: simple, seasonal ingredients transformed by technique.',
   12, ARRAY['Italian','Mediterranean'], ARRAY['Wedding','Corporate','Private Dining'],
   ARRAY['https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600','https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600','https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=600'],
   47, 4.92, TRUE),

  (u2,a2,'Aiko','Tanaka',
   'Tokyo-trained sushi master and kaiseki specialist now based in New York. I blend traditional Japanese precision with local seasonal ingredients to create unforgettable omakase experiences.',
   9, ARRAY['Japanese','Asian Fusion','Sushi'], ARRAY['Corporate','Private Dining','Catering'],
   ARRAY['https://images.unsplash.com/photo-1553621042-f6e147245754?w=600','https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600','https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=600'],
   31, 4.88, TRUE),

  (u3,a3,'Layla','Hassan',
   'A culinary ambassador for Levantine cuisine, I weave together the spices of Beirut, the mezze traditions of Syria, and modern plant-forward techniques into stunning large-format spreads.',
   15, ARRAY['Middle Eastern','Mediterranean','Vegan'], ARRAY['Wedding','Catering','Festival'],
   ARRAY['https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600','https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600','https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=600'],
   62, 4.95, TRUE),

  (u4,a4,'James','Okonkwo',
   'Growing up in Lagos, food was how we celebrated everything. I bring the bold, smoky flavors of West African open-fire cooking and Caribbean jerk traditions to modern events of all sizes.',
   11, ARRAY['West African','Caribbean','Barbecue'], ARRAY['Festival','Corporate','Catering'],
   ARRAY['https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=600','https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600','https://images.unsplash.com/photo-1544025162-d76694265947?w=600'],
   38, 4.80, TRUE),

  (u5,a5,'Sofia','Mendez',
   'From Mexico City''s street markets to fine dining in Oaxaca, I craft elevated Mexican cuisine that honors tradition while embracing innovation. Specialist in plant-based Latin fare.',
   8, ARRAY['Mexican','Latin American','Vegan'], ARRAY['Wedding','Private Dining','Corporate'],
   ARRAY['https://images.unsplash.com/photo-1551218808-94e220e084d2?w=600','https://images.unsplash.com/photo-1565299507177-b0ac66763828?w=600','https://images.unsplash.com/photo-1547592180-85f173990554?w=600'],
   24, 4.75, TRUE),

  (u6,a6,'Pierre','Leblanc',
   'Classically trained at Le Cordon Bleu Paris with 18 years spanning Michelin-starred kitchens in Lyon and Montreal. Renowned for elaborate tasting menus and show-stopping wedding patisserie.',
   18, ARRAY['French','Pastry','European'], ARRAY['Wedding','Private Dining','Corporate'],
   ARRAY['https://images.unsplash.com/photo-1484723091739-30990b5d2a4c?w=600','https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600','https://images.unsplash.com/photo-1612203985729-70726954388c?w=600'],
   89, 4.97, TRUE),

  (u7,a7,'Priya','Sharma',
   'Raised in Jaipur, trained in Mumbai''s top hotel kitchens. I specialize in regional Indian cuisine from coastal Kerala seafood curries to royal Mughal banquet feasts for 500+ guests.',
   10, ARRAY['Indian','South Asian','Vegan'], ARRAY['Wedding','Catering','Festival'],
   ARRAY['https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600','https://images.unsplash.com/photo-1567188040759-fb8a883dc6d6?w=600','https://images.unsplash.com/photo-1601050690597-df0568f70950?w=600'],
   55, 4.85, TRUE),

  (u8,a8,'Lucas','Wright',
   'Former Food Network contestant turned full-time event chef. My specialty is elevated comfort food — think wagyu smash burgers, slow-smoked brisket, and lobster mac for crowds who want flavor above all.',
   7, ARRAY['American','Barbecue','Comfort Food'], ARRAY['Corporate','Festival','Catering'],
   ARRAY['https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=600','https://images.unsplash.com/photo-1558030006-450675393462?w=600','https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?w=600'],
   19, 4.70, TRUE)
ON CONFLICT (user_id) DO NOTHING;

END $$;
