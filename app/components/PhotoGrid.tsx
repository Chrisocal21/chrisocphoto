'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { Location, Photo } from '../data/locations';
import PhotoViewer from './PhotoViewer';
import { IconChevronLeft, IconChevronRight } from './icons';
import { photoAlt, placeName } from '@/lib/photos';
import type { PhotoRow } from '@/lib/photos';
import { usePhotos } from '@/lib/use-photos';
import { usePhotoParam } from '@/lib/use-photo-param';
import { rememberAspect } from '@/lib/photo-aspect';
import { morph, prefersReducedMotion } from '@/lib/view-transition';
import { site } from '@/lib/site';

const PER_PAGE = 9;
const TOP_ROW = 3;

type Props = {
  /** The library as the server saw it, so the first screen arrives with its photos. Null if the server couldn't load it. */
  initialRows: PhotoRow[] | null;
};

export default function PhotoGrid({ initialRows }: Props) {
  const { locations, status, retry } = usePhotos(initialRows);
  const viewer = usePhotoParam();
  const [currentPage, setCurrentPage] = useState(0);
  // Thumbnails load in three steps so the first thing on screen never waits behind photos
  // nobody has reached yet: 0 = the top row, 1 = the rest of the first screen, 2 = one page
  // ahead of wherever the visitor is.
  const [loadStage, setLoadStage] = useState(0);
  const [furthestPage, setFurthestPage] = useState(0);
  const [dragging, setDragging] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const drag = useRef<{ startX: number; startLeft: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const wheel = useRef({ total: 0, last: 0, lockedUntil: 0 });

  const allPhotos = useMemo(
    () => locations.flatMap((loc) => loc.photos.map((photo) => ({ photo, location: loc }))),
    [locations],
  );

  const pages = useMemo(() => {
    const p: { photo: Photo; location: Location }[][] = [];
    for (let i = 0; i < allPhotos.length; i += PER_PAGE) p.push(allPhotos.slice(i, i + PER_PAGE));
    return p;
  }, [allPhotos]);

  // Where each photo lives: its location, its place within that location, and its page of the grid
  const lookup = useMemo(() => {
    const map = new Map<string, { location: Location; index: number; page: number }>();
    let position = 0;
    for (const location of locations) {
      location.photos.forEach((photo, index) => {
        map.set(photo.id, { location, index, page: Math.floor(position / PER_PAGE) });
        position += 1;
      });
    }
    return map;
  }, [locations]);

  const selected = viewer.photoId ? lookup.get(viewer.photoId) ?? null : null;
  const lastPage = Math.max(pages.length - 1, 0);

  // A link to a photo that has since been removed: drop its id from the address and show the grid
  useEffect(() => {
    if (status === 'ready' && viewer.photoId && !lookup.has(viewer.photoId)) viewer.close();
  }, [status, viewer, lookup]);

  useEffect(() => {
    pageRef.current = currentPage;
    setFurthestPage((furthest) => Math.max(furthest, currentPage));
  }, [currentPage]);

  // Move to the next loading step once the photos of the current one have arrived (or failed).
  // The timers are a backstop for a photo that never answers.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || loadStage >= 2) return;
    const check = () => {
      const images = Array.from(el.querySelectorAll('.photo-page:first-child [data-photo]')).map((tile) => tile.querySelector('img'));
      const waiting = loadStage === 0 ? images.slice(0, TOP_ROW) : images;
      if (waiting.every((img) => img?.complete)) setLoadStage(loadStage + 1);
    };
    check();
    // load and error don't bubble, so listen on the way down instead
    el.addEventListener('load', check, true);
    el.addEventListener('error', check, true);
    const backstop = setTimeout(() => setLoadStage(loadStage + 1), loadStage === 0 ? 1500 : 4000);
    return () => {
      el.removeEventListener('load', check, true);
      el.removeEventListener('error', check, true);
      clearTimeout(backstop);
    };
  }, [loadStage, status]);

  const shouldLoad = (pageIndex: number, i: number) =>
    pageIndex === 0 ? i < TOP_ROW || loadStage >= 1 : pageIndex <= furthestPage + (loadStage >= 2 ? 1 : 0);

  const goToPage = useCallback((page: number, behavior?: ScrollBehavior) => {
    const el = scrollRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(page, lastPage));
    setCurrentPage(clamped);
    el.scrollTo({ left: clamped * el.clientWidth, behavior: behavior ?? (prefersReducedMotion() ? 'auto' : 'smooth') });
  }, [lastPage]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected) return;
      if (e.target instanceof HTMLElement && e.target.closest('input, textarea, select')) return;
      // Alt+Arrow is the browser's own back and forward
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      let target: number | null = null;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') target = currentPage + 1;
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') target = currentPage - 1;
      if (e.key === 'Home') target = 0;
      if (e.key === 'End') target = lastPage;
      if (target === null) return;
      // Otherwise the browser also scrolls the grid itself when a photo has focus, and one press turns two pages
      e.preventDefault();
      goToPage(target);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, lastPage, selected, goToPage]);

  // Mouse drag: the grid follows the pointer, then settles on the nearest page.
  // Touch is left alone; phones scroll and snap natively.
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || e.button !== 0 || !scrollRef.current) return;
    drag.current = { startX: e.clientX, startLeft: scrollRef.current.scrollLeft, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scrollRef.current;
    if (!d || !el) return;
    const dx = e.clientX - d.startX;
    if (!d.moved && Math.abs(dx) > 5) {
      d.moved = true;
      el.setPointerCapture(e.pointerId);
      el.style.scrollSnapType = 'none';
      setDragging(true);
    }
    if (d.moved) el.scrollLeft = d.startLeft - dx;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = drag.current;
    const el = scrollRef.current;
    drag.current = null;
    if (!d?.moved || !el) return;
    setDragging(false);
    // The click that follows a drag would otherwise open whatever photo the pointer ended on
    suppressClick.current = true;
    setTimeout(() => { suppressClick.current = false; }, 0);

    const dx = e.clientX - d.startX;
    const startPage = Math.round(d.startLeft / el.clientWidth);
    const far = Math.abs(dx) > Math.min(120, el.clientWidth * 0.12);
    goToPage(far ? startPage + (dx < 0 ? 1 : -1) : startPage);

    // Snapping stays off until the glide to the new page has finished, or it would cut the glide short
    const restoreSnap = () => { el.style.scrollSnapType = ''; };
    if ('onscrollend' in window) {
      el.addEventListener('scrollend', restoreSnap, { once: true });
      setTimeout(restoreSnap, 1000);
    } else {
      setTimeout(restoreSnap, 500);
    }
  };

  // A mouse wheel only scrolls vertically and this grid only moves sideways, so one push of the
  // wheel turns one page. Sideways trackpad swipes are left to the browser.
  const onWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || Math.abs(e.deltaX) >= Math.abs(e.deltaY)) return;
    const w = wheel.current;
    const now = performance.now();
    if (now < w.lockedUntil) return;
    if (now - w.last > 250) w.total = 0;
    w.last = now;
    w.total += e.deltaY;
    if (Math.abs(w.total) < 60) return;
    goToPage(pageRef.current + (w.total > 0 ? 1 : -1));
    w.total = 0;
    w.lockedUntil = now + 650;
  };

  // Keep page state in sync when user native-scrolls (touch)
  const onScroll = () => {
    const el = scrollRef.current;
    if (!el || !el.clientWidth) return;
    setCurrentPage(Math.round(el.scrollLeft / el.clientWidth));
  };

  const tileMedia = (photoId: string) =>
    scrollRef.current?.querySelector<HTMLElement>(`[data-photo="${CSS.escape(photoId)}"] [data-tile-media]`) ?? null;

  const openPhoto = (photoId: string, tile: HTMLElement) => {
    // The viewer sizes itself from the thumbnail's shape, which the tile already knows
    const img = tile.querySelector('img');
    if (img?.complete) rememberAspect(photoId, img.naturalWidth, img.naturalHeight);
    morph(() => viewer.open(photoId), { from: tile.querySelector<HTMLElement>('[data-tile-media]') });
  };

  // Closing lands the grid on the page that holds the photo you were looking at
  const closeViewer = () => {
    const photoId = viewer.photoId;
    const entry = photoId ? lookup.get(photoId) : undefined;
    morph(
      () => {
        viewer.close();
        if (entry) goToPage(entry.page, 'instant');
      },
      { to: () => (photoId ? tileMedia(photoId) : null) },
    );
  };

  return (
    <>
      <main id="main" className="fixed inset-0 bg-black">
        <h1 className="sr-only">{site.name}: a photo journal by {site.author}</h1>

        {status === 'ready' && pages.length > 0 && (
          <>
            {/* Scroll container */}
            <div
              ref={scrollRef}
              onScroll={onScroll}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              onWheel={onWheel}
              role="region"
              aria-roledescription="carousel"
              aria-label="Photos"
              className={`photo-grid no-scrollbar absolute inset-0 flex select-none snap-x snap-mandatory overflow-x-auto overflow-y-hidden overscroll-x-contain ${dragging ? 'is-dragging cursor-grabbing' : 'cursor-grab'}`}
            >
              {pages.map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Page ${pageIndex + 1} of ${pages.length}`}
                  className="photo-page grid h-full w-full shrink-0 snap-start grid-cols-3 grid-rows-3 gap-px"
                >
                  {page.map(({ photo, location }, i) => {
                    const place = placeName(location);
                    const firstPage = pageIndex === 0;
                    return (
                      <button
                        key={photo.id}
                        type="button"
                        data-photo={photo.id}
                        onClick={(e) => {
                          if (suppressClick.current) return;
                          openPhoto(photo.id, e.currentTarget);
                        }}
                        aria-label={photo.caption ? `Open photo: ${photoAlt(photo, location)}` : place ? `Open photo taken in ${place}` : 'Open photo'}
                        className="photo-tile group relative h-full w-full overflow-hidden bg-neutral-900 outline-none"
                      >
                        <span data-tile-media className="absolute inset-0 overflow-hidden">
                          {shouldLoad(pageIndex, i) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={photo.thumbUrl}
                              alt=""
                              className="pointer-events-none h-full w-full animate-tile-in object-cover"
                              // The first screen arrives on a short diagonal stagger, top-left to bottom-right
                              style={firstPage ? { animationDelay: `${((i % 3) + Math.floor(i / 3)) * 70}ms` } : undefined}
                              loading={firstPage ? 'eager' : 'lazy'}
                              fetchPriority={firstPage && i < 3 ? 'high' : undefined}
                              decoding="async"
                              draggable={false}
                              onLoad={(e) => rememberAspect(photo.id, e.currentTarget.naturalWidth, e.currentTarget.naturalHeight)}
                            />
                          )}
                        </span>
                        {place && (
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 flex bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-10 text-left opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
                            <span className="truncate text-xs font-medium text-white">{place}</span>
                          </span>
                        )}
                        <span aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-0 ring-2 ring-inset ring-white group-focus-visible:opacity-100" />
                      </button>
                    );
                  })}
                  {page.length < PER_PAGE &&
                    Array.from({ length: PER_PAGE - page.length }).map((_, i) => (
                      <div key={`empty-${i}`} className="flex items-center justify-center bg-neutral-950 p-4 text-center">
                        {i === 0 && <p className="font-display text-sm font-light text-neutral-400">That’s all of them. So far.</p>}
                      </div>
                    ))}
                </div>
              ))}
            </div>

            {/* Click arrows on desktop */}
            {currentPage > 0 && (
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                className="chrome-button absolute left-4 top-1/2 z-10 hidden -translate-y-1/2 md:inline-flex"
                aria-label="Previous page"
              >
                <IconChevronLeft />
              </button>
            )}
            {currentPage < lastPage && (
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                className="chrome-button absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 md:inline-flex"
                aria-label="Next page"
              >
                <IconChevronRight />
              </button>
            )}

            {/* Pager */}
            <div className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
              <div className="glass pointer-events-auto mb-5 flex items-center rounded-full p-1 text-[13px]">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 0}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30 md:hidden"
                  aria-label="Previous page"
                >
                  <IconChevronLeft className="h-4 w-4" />
                </button>
                <p className="flex h-9 items-center px-2.5 tabular-nums text-white md:pl-4" aria-live="polite" aria-atomic="true">
                  <span className="sr-only">Page </span>
                  {currentPage + 1}
                  <span className="mx-1.5 text-white/40" aria-hidden="true">/</span>
                  <span className="sr-only"> of </span>
                  {pages.length}
                </p>
                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage >= lastPage}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:pointer-events-none disabled:opacity-30 md:hidden"
                  aria-label="Next page"
                >
                  <IconChevronRight className="h-4 w-4" />
                </button>
                <p className="ml-1 hidden h-9 items-center border-l border-white/10 pl-3.5 pr-4 text-neutral-300 md:flex">
                  {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* How far through the library you are, drawn in the logo's spectrum */}
            <div aria-hidden="true" className="absolute inset-x-0 bottom-0 z-10 h-0.5 bg-white/10">
              <div
                className="h-full bg-spectrum transition-[clip-path] duration-500 ease-swift"
                style={{ clipPath: `inset(0 ${100 - ((currentPage + 1) / pages.length) * 100}% 0 0)` }}
              />
            </div>
          </>
        )}

        {/* Still loading: nine quiet placeholders instead of a spinner */}
        {status === 'loading' && (
          <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px" aria-busy="true" aria-label="Loading photos">
            {Array.from({ length: PER_PAGE }).map((_, i) => (
              <div key={i} className="animate-shimmer bg-neutral-900" style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <Notice title="Couldn’t load the photos.">
            <p>Give it another go. If it keeps happening, I probably broke something.</p>
            <button type="button" onClick={retry} className="button-primary mt-6">Try again</button>
          </Notice>
        )}

        {status === 'ready' && pages.length === 0 && (
          <Notice title="No photos yet.">
            <p>Check back soon.</p>
          </Notice>
        )}
      </main>

      {selected && (
        <PhotoViewer
          location={selected.location}
          index={selected.index}
          onNavigate={viewer.show}
          onClose={closeViewer}
        />
      )}
    </>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
      <div className="max-w-sm animate-rise">
        <h2 className="font-display text-2xl font-light text-white">{title}</h2>
        <div className="mt-3 text-[15px] leading-relaxed text-neutral-400">{children}</div>
      </div>
    </div>
  );
}
