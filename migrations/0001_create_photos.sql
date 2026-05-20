CREATE TABLE IF NOT EXISTS photos (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_url TEXT NOT NULL,
  r2_thumb_url TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  location_name TEXT,
  caption TEXT,
  status TEXT DEFAULT 'published',
  date_taken TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_photos_coords ON photos(lat, lng);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date_taken);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);
