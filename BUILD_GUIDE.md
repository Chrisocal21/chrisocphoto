# chrisocphoto.com — Build Guide

## What This Is

A public-facing photo journal. Visitors land on a fullscreen 3×3 photo grid — the entire library, page by page, swipeable left/right. Tap any photo to open a fullscreen viewer with EXIF info. A map view is available as a secondary discovery tool (via the menu) showing every location as a pin, with clustering. No portfolio grid hierarchy, no about page, no social features. Just photos.

**The grid IS the site. The map is a bonus.**

---

## Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js 14 (App Router) | Consistent with all other projects |
| Hosting | Vercel | Existing workflow |
| Storage | Cloudflare R2 | Photo storage, same as other projects |
| Database | Cloudflare D1 | Photo metadata, location data |
| Map | Mapbox GL JS (free tier) | Best dark map aesthetics, clustering support |
| EXIF parsing | exifr (npm) | Lightweight, reads GPS from iPhone photos |
| Image processing | Sharp | Resize/optimize on upload |
| Styling | Tailwind CSS | Consistent with stack |

---

## Core Concepts

### Photo Upload Flow
1. Chris uploads photos via a private admin route (`/admin/upload`)
2. EXIF data is extracted client-side using `exifr` before upload
3. GPS coordinates, date taken, and filename are parsed automatically
4. If no GPS data found, Chris is prompted to manually drop a pin
5. Photo is uploaded to Cloudflare R2
6. Metadata (coordinates, date, R2 URL, location name) is saved to D1

### Location Grouping
- Photos are grouped by proximity using coordinate clustering (Mapbox built-in)
- A single pin may represent 1 photo or 50+ from the same area
- Pin size scales with photo count
- Clicking a cluster zooms in; clicking a single pin opens the photo viewer

### Public View
- No login, no account, fully public
- URL: `www.chrisocphoto.com`
- Fullscreen 3×3 photo grid loads immediately — entire library, all locations mixed
- Swipe/drag left-right or use arrow keys to page through
- Tap any photo → fullscreen viewer with EXIF overlay (toggle with `i`)
- Arrow keys + swipe to navigate photos in viewer; swipe down or ESC to close
- Menu (top-right) → Map view for location-based browsing

---

## Data Model

### photos table (D1)
```sql
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_url TEXT NOT NULL,
  r2_thumb_url TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  location_name TEXT,
  date_taken TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);
```

---

## Key Routes

| Route | Purpose |
|---|---|
| `/` | **Main view** — fullscreen 3×3 photo grid, all photos, horizontal swipe |
| `/map` | Secondary view — fullscreen Mapbox dark map, all location pins |
| `/grid` | Redirects to `/` |
| `/admin` | Password-protected upload interface |
| `/admin/upload` | Drag-and-drop photo uploader |
| `/api/photos` | GET all photo metadata for map + grid rendering |
| `/api/upload` | POST — handles upload to R2, writes to D1 |

---

## Map Configuration

- Base style: Mapbox `dark-v11` or `navigation-night-v1`
- Start position: Centered on US, zoom level 4 (shows travel spread)
- Pins: Custom SVG dot, white fill, subtle glow
- Clustering: Enabled, clusters collapse below zoom 10
- Cluster color: White, scales with count
- No map controls visible (no zoom buttons, no compass) — clean

---

## Photo Viewer

- Opens as a fullscreen overlay on top of the map
- Black background
- Photo centered, aspect ratio preserved
- Minimal UI: location name top-left, date top-right, close button top-right
- If multiple photos at location: dot indicators bottom-center, swipe to navigate
- No captions, no titles, no EXIF data shown to public
- Keyboard: ESC closes, arrow keys navigate

---

## Admin Upload Interface

- Private route, password protected via simple env var check (no full auth system needed)
- Drag and drop or file picker, multi-select supported
- On drop: EXIF parsed immediately, shows preview + detected location name + date
- If GPS missing: inline map appears, Chris drops a pin manually
- Location name auto-populated via Mapbox reverse geocoding (city, state)
- Chris can edit location name before confirming
- Upload button sends to R2 + D1
- Progress indicator per photo

---

## Image Handling

- On upload: Sharp creates two versions
  - Full res: stored in R2 as-is (for viewer)
  - Thumbnail (800px wide): stored in R2 (for map clustering previews, faster loads)
- No editing, no filters, no processing beyond resize
- HEIC files from iPhone: convert to JPEG on upload via Sharp

---

## Environment Variables

```
MAPBOX_TOKEN=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_R2_BUCKET=
CLOUDFLARE_R2_ACCESS_KEY=
CLOUDFLARE_R2_SECRET_KEY=
CLOUDFLARE_D1_DATABASE_ID=
CLOUDFLARE_R2_PUBLIC_URL=
ADMIN_PASSWORD=
```

---

## Database Schema Details

### photos table with indexes
```sql
CREATE TABLE photos (
  id TEXT PRIMARY KEY,
  filename TEXT NOT NULL,
  r2_url TEXT NOT NULL,
  r2_thumb_url TEXT NOT NULL,
  lat REAL NOT NULL,
  lng REAL NOT NULL,
  location_name TEXT,
  date_taken TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_photos_coords ON photos(lat, lng);
CREATE INDEX idx_photos_date ON photos(date_taken);
```

### Migration Files
- Use Drizzle ORM or raw SQL migrations
- Store in `/migrations` folder
- Run via `wrangler d1 execute` or migration script

---

## R2 Configuration

### Public Access
- R2 bucket configured with public read access
- Custom domain optional: `photos.chrisocphoto.com`
- CORS enabled for browser uploads from admin
- Photos served directly from R2 public URL

### CORS Settings
```json
{
  "AllowedOrigins": ["https://chrisocphoto.com", "http://localhost:3000"],
  "AllowedMethods": ["GET", "PUT", "POST"],
  "AllowedHeaders": ["*"],
  "MaxAgeSeconds": 3000
}
```

---

## File Validation & Security

### Upload Constraints
- Max file size: 10MB
- Allowed formats: JPEG, PNG, HEIC
- Server-side file type validation (magic number check, not just extension)
- Rate limiting on `/api/upload`: max 10 uploads per minute per IP
- Duplicate detection: check filename + file size before upload

### Image Processing Settings
- Sharp quality: 85% for JPEG
- Thumbnail: 800px wide, maintain aspect ratio
- Preserve EXIF orientation data
- Strip all other metadata from public versions

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- Cloudflare account with D1 and R2 enabled
- Wrangler CLI installed globally: `npm i -g wrangler`

### Initial Setup
1. Clone repo, run `npm install`
2. Copy `.env.example` to `.env.local`
3. Run `wrangler d1 create chrisocphoto-db` — copy database ID to env
4. Run `wrangler r2 bucket create chrisocphoto-photos` — copy bucket name to env
5. Run database migrations: `wrangler d1 execute chrisocphoto-db --file=./migrations/0001_create_photos.sql`
6. Configure R2 CORS via Cloudflare dashboard
7. Run `npm run dev` to start Next.js locally

### Testing with Real Cloudflare Resources
- Local dev uses remote D1/R2 by default (no local emulation needed for Phase 1)
- Use Wrangler auth: `wrangler login`

---

## Deployment Checklist

### First Deploy
1. Push code to GitHub
2. Connect repo to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy
5. Configure custom domain in Vercel: `chrisocphoto.com`
6. Test photo upload via `/admin/upload`
7. Verify map loads and photos display

### Cloudflare Bindings
- D1 database binding handled via environment variable (not Vercel edge config)
- R2 accessed via AWS S3-compatible API, not Workers binding

---

## Error Handling Strategy

### Logging
- Use Vercel logs for Phase 1 (built-in)
- Console errors captured automatically
- Phase 3: add Sentry if needed

### Upload Failures
- R2 upload fails → return error, do not write to D1
- D1 write fails → log error, admin retries manually (no auto-retry in Phase 1)
- Invalid file → client-side validation first, server validation second

### Edge Cases
- Missing GPS: admin drops pin manually (already in plan)
- Invalid coordinates: reject upload, show error
- Missing date_taken: use current timestamp as fallback
- Duplicate coordinates: allow, display as separate pins (viewer shows multiple photos)

---

## Backup Strategy

### Photos
- R2 has built-in redundancy
- Optional: periodic backup to external storage (Phase 3)

### Database
- Export D1 data weekly via `wrangler d1 export`
- Store in private GitHub repo or local backup

---

---

## Design Principles

- Dark everything — map, viewer, admin
- No logo, no nav bar, no footer on the public site
- The map loads edge-to-edge, full viewport
- Photography is the only content
- Mobile-first — the experience on a phone should feel native
- No loading spinners if possible — thumbnails load progressively as pins are tapped
- SVG icons only, no emoji

---

## Out of Scope (Do Not Build)

- User accounts or authentication beyond admin password
- Comments, likes, or any social features
- Blog or writing section
- Contact form
- Analytics dashboard
- Photo editing tools
- Multiple photographers / multi-user support
- Paid or premium features
