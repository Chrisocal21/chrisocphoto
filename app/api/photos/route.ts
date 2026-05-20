import { NextResponse } from 'next/server';
import { d1Query } from '@/lib/d1';
import type { PhotoRow } from '@/lib/photos';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await d1Query<PhotoRow>(
      `SELECT id, r2_url, r2_thumb_url, lat, lng, location_name, caption, exif_json, date_taken
       FROM photos WHERE status = 'published' ORDER BY date_taken DESC`,
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[api/photos]', err);
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 });
  }
}
