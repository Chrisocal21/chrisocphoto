'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { Location } from '../data/locations';
import { photoAlt, placeName } from '@/lib/photos';
import { usePhotoAspect } from '@/lib/photo-aspect';
import { IconChevronLeft, IconChevronRight, IconClose, IconInfo } from './icons';
import { site } from '@/lib/site';

type Props = {
  location: Location;
  /** Which of the location's photos is showing. */
  index: number;
  onNavigate: (photoId: string) => void;
  onClose: () => void;
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  return { date, time };
}

function formatCoords(lat: number, lng: number) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  const fmt = (v: number) => Math.abs(v).toFixed(4);
  return `${fmt(lat)}° ${latDir},  ${fmt(lng)}° ${lngDir}`;
}

export default function PhotoViewer({ location, index, onNavigate, onClose }: Props) {
  const photos = location.photos;
  const count = photos.length;
  const photo = photos[index];
  const exif = photo.exif;
  const place = placeName(location);
  const aspect = usePhotoAspect(photo);

  const [showInfo, setShowInfo] = useState(false);
  const [loadedId, setLoadedId] = useState<string | null>(null);
  const loaded = loadedId === photo.id;
  const dialogRef = useRef<HTMLDivElement>(null);
  const fullRef = useRef<HTMLImageElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  // The photo the viewer opened on grows out of the grid. Every photo after it fades in.
  const openedOn = useRef(photo.id);

  const goTo = useCallback((i: number) => {
    setShowInfo(false);
    onNavigate(photos[(i + count) % count].id);
  }, [photos, count, onNavigate]);

  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);
  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);

  const dismiss = useCallback(() => {
    if (showInfo) setShowInfo(false); else onClose();
  }, [showInfo, onClose]);

  // Hold the page still behind the viewer, take keyboard focus, and hand it back on close
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = 'hidden';
    dialogRef.current?.focus({ preventScroll: true });
    return () => {
      root.style.overflow = overflow;
      previous?.focus?.({ preventScroll: true });
    };
  }, []);

  // Name the tab after the place while a photo is open, and put the page's own title back after
  useEffect(() => {
    const pageTitle = document.title;
    return () => {
      document.title = pageTitle;
    };
  }, []);

  useEffect(() => {
    document.title = `${place ?? 'Photo'} | ${site.name}`;
  }, [place]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dismiss();
      // Alt+Arrow is the browser's own back and forward, and Back already closes the viewer
      const plain = !e.metaKey && !e.ctrlKey && !e.altKey;
      if (plain && e.key === 'ArrowRight' && count > 1) goNext();
      if (plain && e.key === 'ArrowLeft' && count > 1) goPrev();
      if (plain && e.key === 'i') setShowInfo((v) => !v);
      // Keep Tab inside the viewer while it is open
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>('button:not([tabindex="-1"])'))
          .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);
        if (!focusable.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === dialogRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [dismiss, goNext, goPrev, count]);

  // The full image may already be in the browser's cache, in which case onLoad never fires
  useEffect(() => {
    const img = fullRef.current;
    if (img?.complete && img.naturalWidth > 0) setLoadedId(photo.id);
  }, [photo.id, aspect]);

  // Fetch the photos either side so moving between them is instant
  useEffect(() => {
    if (count < 2) return;
    for (const neighbour of [photos[(index + 1) % count], photos[(index - 1 + count) % count]]) {
      new Image().src = neighbour.thumbUrl;
      new Image().src = neighbour.url;
    }
  }, [photos, index, count]);

  const onTouchStart = (e: React.TouchEvent) => {
    // Two fingers is a pinch, and a zoomed-in page is being panned. Neither is a swipe.
    const zoomed = (window.visualViewport?.scale ?? 1) > 1.01;
    touchStart.current = e.touches.length === 1 && !zoomed
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) { dismiss(); return; }
    if (dy < -80 && Math.abs(dy) > Math.abs(dx)) { setShowInfo(true); return; }
    if (count > 1 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  const dt = exif ? formatDateTime(exif.dateTaken) : null;
  const position = count > 1 ? `Photo ${index + 1} of ${count}` : 'Photo';
  const exposure = exif
    ? [
        { label: 'Aperture', value: exif.aperture },
        { label: 'Shutter', value: exif.shutter },
        { label: 'ISO', value: exif.iso !== undefined ? String(exif.iso) : undefined },
        { label: 'Focal', value: exif.focalLength },
      ].filter((item): item is { label: string; value: string } => Boolean(item.value))
    : [];

  // Rendered straight into <body> so it sits above everything, whichever page opened it
  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={place ? `${position}, ${place}` : position}
      tabIndex={-1}
      className="fixed inset-0 z-[1000] flex flex-col bg-black pb-[env(safe-area-inset-bottom)] outline-none"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {[position, place, photo.caption].filter(Boolean).join('. ')}
      </p>

      {/* Header */}
      <div className="safe-top shrink-0">
        <div className="safe-x flex h-16 items-center justify-between gap-4">
          <div className="min-w-0">
            {place && <p className="truncate font-display text-[15px] leading-tight text-white">{place}</p>}
            {photo.date && <p className="mt-0.5 text-xs tabular-nums text-neutral-400">{photo.date}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {count > 1 && (
              <span className="mr-1 text-[13px] tabular-nums text-neutral-400" aria-hidden="true">
                {index + 1} / {count}
              </span>
            )}
            {/* Info button */}
            <button
              type="button"
              onClick={() => setShowInfo((v) => !v)}
              className={`chrome-button ${showInfo ? 'border-white/40 bg-white/15 text-white' : ''}`}
              aria-label="Photo details"
              aria-pressed={showInfo}
              title="Details (i)"
            >
              <IconInfo className="h-[18px] w-[18px]" />
            </button>
            <button type="button" onClick={onClose} className="chrome-button" aria-label="Close" title="Close (Esc)">
              <IconClose className="h-[18px] w-[18px]" />
            </button>
          </div>
        </div>
      </div>

      {/* Photo. A click on the empty space around it closes the viewer. */}
      <div
        className="relative min-h-0 flex-1"
        onClick={(e) => { if (!(e.target as Element).closest('figure, button')) dismiss(); }}
      >
        <div className="absolute inset-x-3 inset-y-0 [container-type:size] sm:inset-x-20">
          <div className="grid h-full w-full place-items-center">
            {aspect && (
              <figure className="flex flex-col items-center">
                {/* The frame is exactly the photo's shape, sized to fit the space. The thumbnail
                    fills it straight away and the full image fades in over it once it arrives.
                    When the details sheet takes room on a phone, the frame eases down to fit. */}
                <div
                  key={photo.id}
                  className={`viewer-frame relative overflow-hidden bg-neutral-900 transition-[width] duration-300 ease-swift ${photo.id === openedOn.current ? '' : 'animate-fade'}`}
                  style={{
                    aspectRatio: String(aspect),
                    width: `min(100cqw, calc((100cqh - ${photo.caption ? '3.5rem' : '0px'}) * ${aspect}))`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.thumbUrl} alt="" draggable={false} className="absolute inset-0 h-full w-full object-cover" />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    ref={fullRef}
                    src={photo.url}
                    alt={photoAlt(photo, location)}
                    draggable={false}
                    onLoad={() => setLoadedId(photo.id)}
                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
                  />
                </div>
                {photo.caption && (
                  <figcaption className="mt-3 line-clamp-2 h-11 max-w-prose px-2 text-center text-sm leading-snug text-neutral-200">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            )}
          </div>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              className="chrome-button max-sm:sr-only sm:absolute sm:left-5 sm:top-1/2 sm:-translate-y-1/2"
              aria-label="Previous photo"
            >
              <IconChevronLeft className="h-[18px] w-[18px]" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="chrome-button max-sm:sr-only sm:absolute sm:right-5 sm:top-1/2 sm:-translate-y-1/2"
              aria-label="Next photo"
            >
              <IconChevronRight className="h-[18px] w-[18px]" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      <div className="flex h-12 shrink-0 items-center justify-center">
        {count > 1 && <Dots count={count} index={index} onSelect={goTo} />}
      </div>

      {/* Info panel. On a phone it is a sheet that takes its own space, so the photo shrinks
          to sit above it instead of being covered. On larger screens it is a card in the corner. */}
      {showInfo && (
        <div className="shrink-0 animate-sheet sm:absolute sm:bottom-6 sm:left-6 sm:z-20 sm:w-[24rem]">
          <div className="rounded-t-2xl border border-b-0 border-white/10 bg-neutral-950 px-5 pb-5 pt-4 sm:rounded-2xl sm:border-b sm:bg-neutral-950/90 sm:shadow-2xl sm:shadow-black/70 sm:backdrop-blur-xl">
            <div className="mb-3 flex items-center justify-between">
              <p className="eyebrow">Details</p>
              <button
                type="button"
                onClick={() => setShowInfo(false)}
                className="-mr-2 flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Close details"
              >
                <IconClose className="h-4 w-4" />
              </button>
            </div>

            {exposure.length > 0 && (
              <dl className="mb-4 grid auto-cols-fr grid-flow-col divide-x divide-white/10 rounded-xl border border-white/10 bg-white/[0.03]">
                {exposure.map((item) => (
                  <div key={item.label} className="flex flex-col-reverse px-2 py-2.5 text-center">
                    <dt className="mt-1 text-[9px] uppercase tracking-widest text-neutral-400">{item.label}</dt>
                    <dd className="font-display text-[15px] tabular-nums text-white">{item.value}</dd>
                  </div>
                ))}
              </dl>
            )}

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
              {exif ? (
                <>
                  <Row label="Camera" value={exif.camera} />
                  {exif.lens && <Row label="Lens" value={exif.lens} />}
                  {dt && (
                    <>
                      <Row label="Date" value={dt.date} />
                      <Row label="Time" value={dt.time} />
                    </>
                  )}
                  {place && <Row label="Location" value={place} />}
                  <Row label="GPS" value={formatCoords(exif.lat, exif.lng)} />
                </>
              ) : (
                <>
                  {place && <Row label="Location" value={place} />}
                  {photo.date && <Row label="Date" value={photo.date} />}
                </>
              )}
            </dl>
            {!exif && <p className="mt-3 text-xs text-neutral-400">No EXIF data available.</p>}
          </div>
        </div>
      )}
    </div>,
    document.body,
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[9px] uppercase tracking-widest text-neutral-400">{label}</dt>
      <dd className="text-[13px] tabular-nums text-neutral-100">{value}</dd>
    </div>
  );
}

const DOT_WINDOW = 7;
const DOT_STEP = 14;

/**
 * One dot per photo, up to seven. Past that the row slides to keep the current photo in view
 * and the dots at each end shrink to show there is more in that direction.
 * The dots are a mouse and touch shortcut only; the counter and arrows carry the same information.
 */
function Dots({ count, index, onSelect }: { count: number; index: number; onSelect: (i: number) => void }) {
  const start = Math.min(Math.max(index - Math.floor(DOT_WINDOW / 2), 0), Math.max(count - DOT_WINDOW, 0));
  const moreBefore = start > 0;
  const moreAfter = start + DOT_WINDOW < count;

  return (
    <div aria-hidden="true" className="overflow-hidden" style={{ width: Math.min(count, DOT_WINDOW) * DOT_STEP }}>
      <div className="flex transition-transform duration-300 ease-swift" style={{ transform: `translateX(${-start * DOT_STEP}px)` }}>
        {Array.from({ length: count }, (_, i) => {
          const slot = i - start;
          let scale = 1;
          if (slot < 0 || slot >= DOT_WINDOW) scale = 0;
          else if ((moreBefore && slot === 0) || (moreAfter && slot === DOT_WINDOW - 1)) scale = 0.45;
          else if ((moreBefore && slot === 1) || (moreAfter && slot === DOT_WINDOW - 2)) scale = 0.72;
          return (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => onSelect(i)}
              className="flex h-6 shrink-0 items-center justify-center"
              style={{ width: DOT_STEP }}
            >
              <span
                className={`block h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-300 ${i === index ? 'bg-white' : 'bg-white/30'}`}
                style={{ transform: `scale(${scale})` }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
