'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

type Frame = {
  id: string;
  thumbUrl: string;
  /** Where the photo was taken, if known. */
  place: string | null;
};

/**
 * The newest photos as a strip of thumbnails, each opening in the viewer.
 *
 * The strip sits well below the fold (about three screens down on a phone), and the browser's
 * own lazy loading still fetches images that far away. So the thumbnails are only added once
 * the visitor has scrolled near them.
 */
export default function LatestFrames({ frames }: { frames: Frame[] }) {
  const list = useRef<HTMLUListElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const el = list.current;
    if (!el || near) return;
    if (!('IntersectionObserver' in window)) {
      setNear(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) setNear(true);
      },
      { rootMargin: '600px 0px' },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [near]);

  return (
    <ul ref={list} className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-6 sm:gap-3">
      {frames.map((frame) => (
        <li key={frame.id}>
          <Link
            href={`/?photo=${frame.id}`}
            aria-label={`Open photo${frame.place ? `: ${frame.place}` : ''}`}
            className="group block aspect-square overflow-hidden rounded-lg bg-neutral-900"
          >
            {near && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={frame.thumbUrl}
                alt=""
                decoding="async"
                className="h-full w-full animate-fade object-cover transition-transform duration-700 ease-swift group-hover:scale-105"
              />
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
