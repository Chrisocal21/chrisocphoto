import { d1Query } from './d1';
import type { PhotoRow } from './photos';

const PUBLISHED_PHOTOS = `SELECT id, r2_url, r2_thumb_url, lat, lng, location_name, caption, exif_json, date_taken
       FROM photos WHERE status = 'published' ORDER BY date_taken DESC`;

/** How long a page may reuse the photo list before asking the database again, in seconds. */
const PAGE_CACHE_SECONDS = 60;

/** Every published photo, newest first, straight from the database. */
export function getPublishedPhotos(): Promise<PhotoRow[]> {
  return d1Query<PhotoRow>(PUBLISHED_PHOTOS);
}

/**
 * The photo list for rendering a page. It is reused for a minute, so pages are built ahead of
 * time with the photos already in their HTML and refresh themselves in the background. Once
 * loaded, the page checks /api/photos for anything newer, so a fresh upload still appears
 * right away.
 *
 * Returns null when the database can't be reached; the page then loads the list in the browser.
 */
export async function getInitialPhotos(): Promise<PhotoRow[] | null> {
  try {
    return await d1Query<PhotoRow>(PUBLISHED_PHOTOS, [], { revalidate: PAGE_CACHE_SECONDS });
  } catch (err) {
    // Next.js signals "render this at request time instead" by throwing. That is not a failure.
    if (err && typeof err === 'object' && 'digest' in err) throw err;
    console.error('[photo-store]', err instanceof Error ? err.message : err);
    return null;
  }
}
