import type { Location, Photo, Exif } from '@/app/data/locations';

export interface PhotoRow {
  id: string;
  r2_url: string;
  r2_thumb_url: string;
  lat: number;
  lng: number;
  location_name: string | null;
  caption: string | null;
  exif_json: string | null;
  date_taken: string | null;
}

export function rowsToLocations(rows: PhotoRow[]): Location[] {
  const map = new Map<string, Location>();

  for (const row of rows) {
    const name = row.location_name ?? 'Unknown';
    if (!map.has(name)) {
      map.set(name, {
        id: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        name,
        lat: row.lat,
        lng: row.lng,
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
