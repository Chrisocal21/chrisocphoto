'use server';

import sharp from 'sharp';
import exifr from 'exifr';
import { putObject, deleteObjects } from '@/lib/r2';
import { d1Run, d1Query } from '@/lib/d1';
import { randomUUID } from 'crypto';
import type { Exif } from '@/app/data/locations';

function formatExif(
  raw: Record<string, unknown>,
  lat: number,
  lng: number,
  dateTaken: string,
): Exif {
  const aperture =
    typeof raw.FNumber === 'number' ? `f/${raw.FNumber}` : undefined;

  let shutter: string | undefined;
  if (typeof raw.ExposureTime === 'number') {
    const et = raw.ExposureTime;
    shutter = et >= 1 ? `${et}s` : `1/${Math.round(1 / et)}s`;
  }

  const make = typeof raw.Make === 'string' ? raw.Make.trim() : '';
  const model = typeof raw.Model === 'string' ? raw.Model.trim() : '';
  const camera = [make, model].filter(Boolean).join(' ') || 'Unknown';

  return {
    dateTaken,
    lat,
    lng,
    camera,
    aperture,
    shutter,
    iso: typeof raw.ISO === 'number' ? raw.ISO : undefined,
    focalLength:
      typeof raw.FocalLength === 'number'
        ? `${Math.round(raw.FocalLength)}mm`
        : undefined,
  };
}

export type UploadResult =
  | { ok: true; id: string; fullUrl: string; thumbUrl: string }
  | { ok: false; error: string };

export async function uploadPhoto(formData: FormData): Promise<UploadResult> {
  const file = formData.get('file') as File | null;
  const locationName = (formData.get('location_name') as string) || null;
  const caption = (formData.get('caption') as string) || null;

  if (!file) return { ok: false, error: 'No file provided' };

  const allowed = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp'];
  if (!allowed.includes(file.type.toLowerCase()))
    return { ok: false, error: 'Unsupported file type' };
  if (file.size > 10 * 1024 * 1024)
    return { ok: false, error: 'File exceeds 10 MB limit' };

  const buffer = Buffer.from(await file.arrayBuffer());

  // client_exif is extracted from the original file before canvas compression strips EXIF
  type ClientExif = { lat?: number | null; lng?: number | null; dateTaken?: string | null; make?: string | null; model?: string | null; aperture?: number | null; shutter?: number | null; iso?: number | null; focalLength?: number | null };
  let clientExif: ClientExif | null = null;
  const clientExifStr = formData.get('client_exif');
  if (typeof clientExifStr === 'string') {
    try { clientExif = JSON.parse(clientExifStr); } catch { /* malformed */ }
  }

  // Parse EXIF from buffer as fallback (canvas-compressed files have no EXIF)
  let raw: Record<string, unknown> = {};
  try {
    raw = (await exifr.parse(buffer, { gps: true, exif: true, tiff: true })) ?? {};
  } catch { /* no EXIF */ }

  const lat: number | null =
    clientExif?.lat != null ? clientExif.lat :
    typeof raw.latitude === 'number' ? raw.latitude : null;
  const lng: number | null =
    clientExif?.lng != null ? clientExif.lng :
    typeof raw.longitude === 'number' ? raw.longitude : null;

  const dateTaken =
    clientExif?.dateTaken ??
    (raw.DateTimeOriginal instanceof Date ? raw.DateTimeOriginal.toISOString() : new Date().toISOString());

  const exifRaw: Record<string, unknown> = clientExif ? {
    FNumber: clientExif.aperture,
    ExposureTime: clientExif.shutter,
    Make: clientExif.make,
    Model: clientExif.model,
    ISO: clientExif.iso,
    FocalLength: clientExif.focalLength,
  } : raw;

  const exifData =
    lat != null && lng != null ? formatExif(exifRaw, lat, lng, dateTaken) : null;

  // Resize with Sharp
  const id = randomUUID();
  let fullBuf: Buffer;
  let thumbBuf: Buffer;
  try {
    // Decode to raw pixels first — handles HEIC/HEIF and any input format.
    // .rotate() with no args reads the EXIF Orientation tag and corrects it,
    // stripping the tag so viewers don't double-rotate.
    const { data, info } = await sharp(buffer)
      .rotate()
      .raw()
      .toBuffer({ resolveWithObject: true });
    const img = sharp(data, { raw: { width: info.width, height: info.height, channels: info.channels } });
    [fullBuf, thumbBuf] = await Promise.all([
      img.clone().jpeg({ quality: 85 }).toBuffer(),
      img.clone().resize({ width: 800 }).jpeg({ quality: 80 }).toBuffer(),
    ]);
  } catch {
    fullBuf = buffer;
    thumbBuf = buffer;
  }

  // Upload to R2
  let fullUrl: string;
  let thumbUrl: string;
  try {
    [fullUrl, thumbUrl] = await Promise.all([
      putObject(`photos/${id}/full.jpg`, fullBuf, 'image/jpeg'),
      putObject(`photos/${id}/thumb.jpg`, thumbBuf, 'image/jpeg'),
    ]);
  } catch (err) {
    console.error('[uploadPhoto] R2:', err);
    return { ok: false, error: 'Upload to storage failed. Check R2 config.' };
  }

  // Write to D1
  try {
    await d1Run(
      `INSERT INTO photos
         (id, filename, r2_url, r2_thumb_url, lat, lng, location_name, caption, exif_json, status, date_taken)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?)`,
      [
        id,
        file.name,
        fullUrl,
        thumbUrl,
        lat,
        lng,
        locationName,
        caption,
        exifData ? JSON.stringify(exifData) : null,
        dateTaken,
      ],
    );
  } catch (err) {
    console.error('[uploadPhoto] D1:', err);
    return { ok: false, error: 'Database write failed. Check D1 config.' };
  }

  return { ok: true, id, fullUrl, thumbUrl };
}

// ── Admin library actions ──────────────────────────────────────────────────

export interface AdminPhotoRow {
  id: string;
  filename: string;
  r2_url: string;
  r2_thumb_url: string;
  lat: number | null;
  lng: number | null;
  location_name: string | null;
  caption: string | null;
  status: string;
  date_taken: string | null;
}

export async function getAdminPhotos(): Promise<AdminPhotoRow[]> {
  return d1Query<AdminPhotoRow>(
    `SELECT id, filename, r2_url, r2_thumb_url, lat, lng, location_name, caption, status, date_taken
     FROM photos ORDER BY date_taken DESC`,
  );
}

export async function setPhotoStatus(id: string, status: 'draft' | 'published'): Promise<void> {
  await d1Run(`UPDATE photos SET status = ? WHERE id = ?`, [status, id]);
}

export async function setPhotoCaption(id: string, caption: string): Promise<void> {
  await d1Run(`UPDATE photos SET caption = ? WHERE id = ?`, [caption || null, id]);
}

export async function setPhotoLocation(
  id: string,
  location: string,
): Promise<{ lat: number | null; lng: number | null }> {
  let lat: number | null = null;
  let lng: number | null = null;

  if (location.trim()) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'chrisocphoto/1.0' } });
      if (res.ok) {
        const data = await res.json() as Array<{ lat: string; lon: string }>;
        if (data.length > 0) {
          lat = parseFloat(data[0].lat);
          lng = parseFloat(data[0].lon);
        }
      }
    } catch { /* geocoding failed — coords stay null */ }
  }

  await d1Run(
    `UPDATE photos SET location_name = ?, lat = ?, lng = ? WHERE id = ?`,
    [location || null, lat, lng, id],
  );
  return { lat, lng };
}

export async function deletePhoto(id: string): Promise<void> {
  await Promise.all([
    d1Run(`DELETE FROM photos WHERE id = ?`, [id]),
    deleteObjects([`photos/${id}/full.jpg`, `photos/${id}/thumb.jpg`]).catch(() => {}),
  ]);
}
