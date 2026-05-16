# chrisocphoto.com — Phase Plan

## Overview

Three phases. Each phase is fully functional before moving to the next. No over-engineering upfront — build what works, test it, then layer on top.

**Architecture decision (May 2026):** The grid is now the main view at `/`. The map is a secondary discovery view at `/map`, accessible from the menu. This puts photos front and center on first load.

---

## Phase 1 — Foundation (Core Experience)

**Goal:** A working public site with real photos — grid loads from the database, map shows real pins.

### What Gets Built
- Next.js project setup with Tailwind, Cloudflare D1 + R2 connected
- D1 database with photos table created and migrated
- `/api/photos` — returns all photo metadata as JSON for grid + map rendering
- `/api/upload` — accepts photo, extracts EXIF, uploads to R2, writes to D1
- `/admin/upload` — private upload page, password protected, drag-and-drop, EXIF preview, manual pin fallback
- `/` — fullscreen 3×3 photo grid, all photos from API, horizontal swipe
- `/map` — fullscreen Mapbox dark map, all pins from API, clustering
- Photo viewer — fullscreen overlay with EXIF panel, opens from grid or map
- Sharp image processing — full res + thumbnail on every upload
- HEIC → JPEG conversion on upload

### Done When
- Chris can upload a photo from his phone via the admin page
- The photo appears in the grid automatically
- The pin appears on the map automatically
- A visitor can tap a photo in the grid and see it fullscreen
- Works on mobile

---

## Phase 2 — Polish (The Real Experience)

**Goal:** Make it feel like a real product, not a prototype.

### What Gets Built
- Multi-photo viewer — swipe navigation when a pin has multiple photos, dot indicators
- Mapbox clustering — pins group at low zoom, expand as you zoom in, cluster size scales with count
- Reverse geocoding on upload — auto-populate location name (city, state) via Mapbox API
- Editable location name in admin before confirming upload
- Map start position and zoom tuned to Chris's actual photo spread
- Progressive thumbnail loading — thumbnails load first, full res on demand
- Keyboard navigation in viewer (ESC to close, arrows to navigate)
- Mobile gestures — swipe down to close viewer, swipe left/right to navigate photos
- Admin upload: multi-select, batch upload with per-photo progress
- Basic error handling — failed uploads, missing GPS, bad files

### Done When
- The experience feels native on iPhone
- Multi-photo locations feel smooth to browse
- The map clustering looks intentional and clean
- Upload flow handles edge cases gracefully

---

## Phase 3 — Refinements (Long-Term Additions)

**Goal:** Small additions that improve the experience over time. No rush on these.

### What Gets Built
- Map filters — filter pins by year (simple year selector, not a full date range)
- Photo count indicator — subtle badge on pins showing how many photos are there
- Deep linking — each location gets a shareable URL (`/place/san-diego` or `/place/[id]`) so Chris can share a specific location's photos
- Admin photo management — view all uploaded photos, delete a photo, edit location name after upload
- Lazy loading map pins — for performance as the library grows (hundreds of photos)
- Optional: simple stats page (`/stats`) — total photos, total locations, most photographed city. Private or public, Chris's call.

### Done When
- Chris can manage his library without touching the database directly
- Specific locations are shareable
- Performance holds up as photo count grows

---

## What Copilot Needs to Start

Hand off Phase 1 with:
- `chrisocphoto-build-guide.md` (the full build guide)
- This phase plan
- Tell Copilot: "Start with Phase 1 only. Build in this order: project setup → D1 schema → R2 connection → upload API → admin upload page → map page → photo viewer. Do not build Phase 2 features yet."

---

## Notes

- Test on iPhone throughout Phase 1 — mobile is the primary device
- Mapbox free tier is 50,000 map loads/month — more than enough to start
- Admin password lives in env vars — no need for a full auth system
- Keep the public route completely static-feeling — no visible loading states if possible
- Cheers!
