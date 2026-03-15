BEGIN;

CREATE EXTENSION IF NOT EXISTS btree_gist;

DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS guests CASCADE;
DROP TABLE IF EXISTS rooms CASCADE;

DROP TYPE IF EXISTS booking_status CASCADE;

CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  room_number TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE guests (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bookings (
  id BIGSERIAL PRIMARY KEY,
  guest_id INTEGER NOT NULL REFERENCES guests(id),
  room_id INTEGER NOT NULL REFERENCES rooms(id),
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMPTZ,
  CHECK (check_out_date > check_in_date)
);

ALTER TABLE bookings
ADD CONSTRAINT no_room_overlap
EXCLUDE USING GIST (
  room_id WITH =,
  daterange(check_in_date, check_out_date, '[)') WITH &&
)
WHERE (status <> 'cancelled');

COMMIT;
