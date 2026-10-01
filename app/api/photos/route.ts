import { NextResponse } from 'next/server';
import { getPublishedPhotos } from '@/lib/photo-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const rows = await getPublishedPhotos();
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[api/photos]', err);
    return NextResponse.json({ error: 'Failed to load photos' }, { status: 500 });
  }
}
