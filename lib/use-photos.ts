'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rowsToLocations } from './photos';
import type { PhotoRow } from './photos';

const REFRESH_MS = 30_000;

export type PhotosStatus = 'loading' | 'ready' | 'error';

/**
 * The published library, grouped by location. It starts from whatever the server rendered,
 * then keeps itself current: once on load, every 30 seconds while the tab is visible, and
 * whenever the tab comes back into view. A new upload shows up without a reload.
 */
export function usePhotos(initialRows: PhotoRow[] | null) {
  const [rows, setRows] = useState<PhotoRow[] | null>(initialRows);
  const [failed, setFailed] = useState(false);
  // Skip the re-render when a refresh returns exactly what is already on screen.
  const signature = useRef(initialRows ? JSON.stringify(initialRows) : '');

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/photos', { cache: 'no-store' });
      if (!res.ok) throw new Error(`/api/photos responded ${res.status}`);
      const next: unknown = await res.json();
      if (!Array.isArray(next)) throw new Error('/api/photos did not return a list');
      const nextSignature = JSON.stringify(next);
      if (nextSignature !== signature.current) {
        signature.current = nextSignature;
        setRows(next as PhotoRow[]);
      }
      setFailed(false);
    } catch (err) {
      console.error(err);
      setFailed(true);
    }
  }, []);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    refresh();
    const id = setInterval(refreshIfVisible, REFRESH_MS);
    document.addEventListener('visibilitychange', refreshIfVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', refreshIfVisible);
    };
  }, [refresh]);

  const retry = useCallback(() => {
    setFailed(false);
    refresh();
  }, [refresh]);

  const locations = useMemo(() => rowsToLocations(rows ?? []), [rows]);
  const status: PhotosStatus = rows ? 'ready' : failed ? 'error' : 'loading';

  return { locations, status, retry };
}
