-- Make lat/lng nullable to support photos without GPS data
PRAGMA foreign_keys=OFF;

CREATE TABLE photos_new (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_url TEXT NOT NULL,
  r2_thumb_url TEXT NOT NULL,
  lat REAL,
  lng REAL,
  location_name TEXT,
  caption TEXT,
  exif_json TEXT,
  status TEXT DEFAULT 'published',
  date_taken TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT INTO photos_new SELECT id, filename, r2_url, r2_thumb_url, lat, lng, location_name, caption, exif_json, status, date_taken, created_at FROM photos;

DROP TABLE photos;
ALTER TABLE photos_new RENAME TO photos;

CREATE INDEX IF NOT EXISTS idx_photos_coords ON photos(lat, lng);
CREATE INDEX IF NOT EXISTS idx_photos_date ON photos(date_taken);
CREATE INDEX IF NOT EXISTS idx_photos_status ON photos(status);

PRAGMA foreign_keys=ON;
