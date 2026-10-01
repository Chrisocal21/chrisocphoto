import type { Location, Photo, Exif } from '@/app/data/locations';

export interface PhotoRow {
  id: string;
  r2_url: string;
  r2_thumb_url: string;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  caption: string | null;
  exif_json: string | null;
  date_taken: string | null;
}

/** Photos uploaded without a place are grouped under this name. It is never shown to visitors. */
export const UNKNOWN_LOCATION = 'Unknown';

/** A location's name for display, or null when the photo has no place attached. */
export function placeName(location: Location): string | null {
  return location.name && location.name !== UNKNOWN_LOCATION ? location.name : null;
}

/** Text alternative for a photo: its caption if it has one, otherwise where it was taken. */
export function photoAlt(photo: Photo, location: Location): string {
  const place = placeName(location);
  if (photo.caption) return place ? `${photo.caption}, ${place}` : photo.caption;
  return place ? `Photo taken in ${place}` : 'Photo';
}

export function rowsToLocations(rows: PhotoRow[]): Location[] {
  const map = new Map<string, Location>();

  for (const row of rows) {
    const name = (row.location_name ?? UNKNOWN_LOCATION).trim();
    if (!map.has(name)) {
      map.set(name, {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name,
        lat: row.lat ?? undefined,
        lng: row.lng ?? undefined,
        photos: [],
      });
    }

    let exif: Exif | undefined;
    if (row.exif_json) {
      try { exif = JSON.parse(row.exif_json) as Exif; } catch { /* ignore */ }
    }

    const photo: Photo = {
      id: row.id,
      url: row.r2_url,
      thumbUrl: row.r2_thumb_url,
      date: row.date_taken
        ? new Date(row.date_taken).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric',
          })
        : '',
      caption: row.caption ?? undefined,
      exif,
    };

    map.get(name)!.photos.push(photo);
  }

  return Array.from(map.values());
}
