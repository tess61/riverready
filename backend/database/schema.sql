-- RiverReady schema (MySQL / MariaDB). Import into an existing database:
--   mariadb -u riverready -p riverready < backend/database/schema.sql
-- NOTE: the DROPs make re-importing reset the demo data. Remove them on a live database.

DROP TABLE IF EXISTS actions;
DROP TABLE IF EXISTS locations;

CREATE TABLE locations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  station_reference VARCHAR(50) NOT NULL,       -- EA stationReference (stable id)
  station_label VARCHAR(150) NULL,              -- cached label for display if EA is down
  river_name VARCHAR(100) NULL,
  town VARCHAR(100) NULL,
  notes TEXT NULL,
  risk_note VARCHAR(255) NULL,                  -- user's own note, not advice
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_station (station_reference)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE actions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category ENUM('documents','supplies','home','people','evacuation','other') NOT NULL DEFAULT 'other',
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  due_date DATE NULL,
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_action_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_location (location_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data for demo/testing. Station references are placeholders to be
-- checked against the live EA API in Phase 3.
INSERT INTO locations (name, station_reference, station_label, river_name, town, notes, risk_note) VALUES
  ('Family home', '1029TH', 'Demo station A', 'River Thames', 'Oxford', 'Ground floor flat near the river path.', 'Garden floods first in wet winters.'),
  ('Grandparents'' house', '2067', 'Demo station B', 'River Severn', 'Bewdley', 'Lives alone, needs help moving items upstairs.', NULL),
  ('Student house', '4009', 'Demo station C', 'River Tyne', 'Newcastle', NULL, 'Cellar is used for storage.');

INSERT INTO actions (location_id, title, description, category, priority, due_date, is_done) VALUES
  (1, 'Copy insurance documents', 'Keep a copy in a waterproof folder upstairs.', 'documents', 'high', '2026-12-01', 0),
  (1, 'Prepare a grab bag', 'Torch, charger, medication, spare clothes.', 'supplies', 'medium', NULL, 1),
  (1, 'Check where the stopcock is', NULL, 'home', 'low', NULL, 0),
  (1, 'Agree a meeting point with family', NULL, 'people', 'medium', '2026-12-15', 0),
  (2, 'Move valuables to the first floor', NULL, 'home', 'high', NULL, 0),
  (2, 'Write down emergency contacts', 'Include neighbours.', 'people', 'medium', NULL, 1),
  (3, 'Raise cellar items off the floor', NULL, 'home', 'medium', '2026-11-30', 0),
  (3, 'Plan an evacuation route', 'Two routes in case one is blocked.', 'evacuation', 'high', NULL, 0);
