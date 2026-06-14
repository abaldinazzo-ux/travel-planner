-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS destinations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  country       TEXT,
  emoji         TEXT DEFAULT '🗺️',
  color         TEXT DEFAULT '#3B6D8A',
  date_from     DATE,
  date_to       DATE,
  budget        NUMERIC(10,2),
  pos_x         NUMERIC(5,2) DEFAULT 50,
  pos_y         NUMERIC(5,2) DEFAULT 50,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS destination_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  category      TEXT NOT NULL CHECK (category IN ('voli','hotel','ristoranti','itinerari','attivita','note')),
  name          TEXT NOT NULL,
  price         NUMERIC(10,2),
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  notes         TEXT,
  url           TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trip_shares (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  owner_id      UUID NOT NULL REFERENCES auth.users(id),
  shared_with   UUID REFERENCES auth.users(id),
  share_token   TEXT UNIQUE DEFAULT gen_random_uuid()::TEXT,
  can_edit      BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE destination_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_shares ENABLE ROW LEVEL SECURITY;

-- Owner full access
CREATE POLICY "owner_all" ON destinations
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "owner_items" ON destination_items
  FOR ALL USING (
    destination_id IN (SELECT id FROM destinations WHERE user_id = auth.uid())
  );

CREATE POLICY "owner_shares" ON trip_shares
  FOR ALL USING (auth.uid() = owner_id);

-- Shared read via token or shared_with
CREATE POLICY "shared_read" ON destinations
  FOR SELECT USING (
    id IN (
      SELECT destination_id FROM trip_shares
      WHERE shared_with = auth.uid() OR shared_with IS NULL
    )
  );

CREATE POLICY "shared_items_read" ON destination_items
  FOR SELECT USING (
    destination_id IN (
      SELECT destination_id FROM trip_shares
      WHERE shared_with = auth.uid() OR shared_with IS NULL
    )
  );
