'use server';

import sharp from 'sharp';
import exifr from 'exifr';
import { putObject } from '@/lib/r2';
import { d1Run } from '@/lib/d1';
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

  // Parse EXIF
  let raw: Record<string, unknown> = {};
  try {
    raw = (await exifr.parse(buffer, { gps: true, exif: true, tiff: true })) ?? {};
  } catch { /* no EXIF */ }

  const lat = typeof raw.latitude === 'number' ? raw.latitude : null;
  const lng = typeof raw.longitude === 'number' ? raw.longitude : null;
  if (!lat || !lng)
    return { ok: false, error: 'No GPS data found in photo.' };

  const dateTaken =
    raw.DateTimeOriginal instanceof Date
      ? raw.DateTimeOriginal.toISOString()
      : new Date().toISOString();

  const exifData = formatExif(raw, lat, lng, dateTaken);

  // Resize with Sharp
  const id = randomUUID();
  let fullBuf: Buffer;
  let thumbBuf: Buffer;
  try {
    const img = sharp(buffer);
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
        JSON.stringify(exifData),
        dateTaken,
      ],
    );
  } catch (err) {
    console.error('[uploadPhoto] D1:', err);
    return { ok: false, error: 'Database write failed. Check D1 config.' };
  }

  return { ok: true, id, fullUrl, thumbUrl };
}
