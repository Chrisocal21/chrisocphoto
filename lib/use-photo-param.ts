'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const PARAM = 'photo';

function readParam(): string | null {
  return new URLSearchParams(window.location.search).get(PARAM);
}

function urlFor(photoId: string | null): string {
  const url = new URL(window.location.href);
  if (photoId) url.searchParams.set(PARAM, photoId);
  else url.searchParams.delete(PARAM);
  return url.pathname + url.search + url.hash;
}

/** True when the current history entry is one this hook added, so Back leads to the page underneath. */
function openedHere(): boolean {
  return Boolean((window.history.state as { photoViewer?: boolean } | null)?.photoViewer);
}

/**
 * Keeps the open photo in the address bar as ?photo=<id>. That makes a single photo
 * shareable, and it makes the browser's Back button close the viewer instead of leaving
 * the site, which is what people expect on a phone.
 */
export function usePhotoParam() {
  // Starts empty and is filled in after hydration, so the server and browser render the same HTML.
  const [photoId, setPhotoId] = useState<string | null>(null);
  // Set between asking the browser to go back and it actually doing so.
  const closing = useRef(false);

  useEffect(() => {
    const sync = () => {
      closing.current = false;
      setPhotoId(readParam());
    };
    sync();
    window.addEventListener('popstate', sync);
    return () => window.removeEventListener('popstate', sync);
  }, []);

  /** Open the viewer on a photo. Adds a history entry. */
  const open = useCallback((id: string) => {
    const push = () => {
      window.history.pushState({ photoViewer: true }, '', urlFor(id));
      setPhotoId(id);
    };
    // A close is still unwinding: wait for it, or this entry would be the one that gets popped.
    if (closing.current) window.addEventListener('popstate', push, { once: true });
    else push();
  }, []);

  /** Move to another photo while the viewer is open. Rewrites the current entry. */
  const show = useCallback((id: string) => {
    window.history.replaceState(openedHere() ? { photoViewer: true } : null, '', urlFor(id));
    setPhotoId(id);
  }, []);

  /** Close the viewer. */
  const close = useCallback(() => {
    setPhotoId(null);
    if (openedHere()) {
      closing.current = true;
      window.history.back();
    } else {
      // Arrived on a shared link: there is nothing of ours to go back to, so just tidy the address.
      window.history.replaceState(null, '', urlFor(null));
    }
  }, []);

  return useMemo(() => ({ photoId, open, show, close }), [photoId, open, show, close]);
}
