BEGIN;

TRUNCATE TABLE
  bookings,
  guests,
  rooms
RESTART IDENTITY CASCADE;

INSERT INTO rooms (room_number, category)
VALUES
  ('101', 'single'),
  ('102', 'single'),
  ('103', 'single'),
  ('201', 'double'),
  ('202', 'double'),
  ('203', 'double'),
  ('301', 'suite'),
  ('302', 'suite');

COMMIT;
