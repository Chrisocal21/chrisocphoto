'use client';

import { useEffect, useState } from 'react';
import type { Photo } from '@/app/data/locations';

// Width divided by height, per photo id. The database doesn't store dimensions, so they are
// learned from the thumbnail the first time it loads and remembered for the rest of the visit.
const aspects = new Map<string, number>();

export function rememberAspect(photoId: string, width: number, height: number) {
  if (width > 0 && height > 0) aspects.set(photoId, width / height);
}

/**
 * A photo's aspect ratio, or null until its thumbnail has loaded. The viewer needs it to size
 * the frame before the full-resolution image arrives.
 */
export function usePhotoAspect(photo: Photo): number | null {
  const [, setLoaded] = useState(0);

  useEffect(() => {
    if (aspects.has(photo.id) || !photo.thumbUrl) return;
    let alive = true;
    const img = new Image();
    img.onload = () => {
      rememberAspect(photo.id, img.naturalWidth, img.naturalHeight);
      if (alive) setLoaded((n) => n + 1);
    };
    img.src = photo.thumbUrl;
    return () => {
      alive = false;
    };
  }, [photo.id, photo.thumbUrl]);

  return aspects.get(photo.id) ?? null;
}
