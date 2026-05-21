'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Menu from './components/Menu';
import type { Location, Photo } from './data/locations';
import PhotoViewer from './components/PhotoViewer';
import { rowsToLocations } from '@/lib/photos';
import type { PhotoRow } from '@/lib/photos';

const PER_PAGE = 9;

export default function Home() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selected, setSelected] = useState<{ location: Location; photoId: string } | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef<number | null>(null);
  const isDragging = useRef(false);

  useEffect(() => {
    function load() {
      fetch('/api/photos')
        .then((r) => r.json())
        .then((rows: PhotoRow[]) => setLocations(rowsToLocations(rows)))
        .catch(console.error);
    }
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, []);

  const allPhotos = useMemo(
    () => locations.flatMap((loc) => loc.photos.map((photo) => ({ photo, location: loc }))),
    [locations],
  );

  const pages = useMemo(() => {
    const p: { photo: Photo; location: Location }[][] = [];
    for (let i = 0; i < allPhotos.length; i += PER_PAGE) p.push(allPhotos.slice(i, i + PER_PAGE));
    return p;
  }, [allPhotos]);

  const goToPage = useCallback((page: number) => {
    const clamped = Math.max(0, Math.min(page, pages.length - 1));
    setCurrentPage(clamped);
    scrollRef.current?.scrollTo({ left: clamped * window.innerWidth, behavior: 'smooth' });
  }, [pages]);

  // Arrow key navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (selected) return;
      if (e.key === 'ArrowRight') goToPage(currentPage + 1);
      if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentPage, selected, goToPage]);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    dragStart.current = e.clientX;
    isDragging.current = false;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (dragStart.current === null) return;
    if (Math.abs(e.clientX - dragStart.current) > 5) isDragging.current = true;
  };
  const onMouseUp = (e: React.MouseEvent) => {
    if (dragStart.current === null) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = null;
    if (Math.abs(dx) > 60) {
      goToPage(dx < 0 ? currentPage + 1 : currentPage - 1);
    }
  };

  // Keep page state in sync when user native-scrolls (touch)
  const onScroll = () => {
    if (!scrollRef.current) return;
    const page = Math.round(scrollRef.current.scrollLeft / window.innerWidth);
    setCurrentPage(page);
  };

  const viewerLocation = selected
    ? {
        ...selected.location,
        photos: [
          selected.location.photos.find((p) => p.id === selected.photoId)!,
          ...selected.location.photos.filter((p) => p.id !== selected.photoId),
        ],
      }
    : null;

  return (
    <>
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 z-10 flex items-center gap-3 px-4 py-4 bg-gradient-to-b from-black/70 to-transparent pointer-events-none">
        <span className="text-white/30 text-xs pointer-events-none">{allPhotos.length} photos</span>
        <span className="text-white/20 text-xs ml-auto pointer-events-none">{currentPage + 1} / {pages.length}</span>
      </div>

      {/* Click arrows on desktop */}
      {currentPage > 0 && (
        <button
          onClick={() => goToPage(currentPage - 1)}
          className="fixed left-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-5xl text-white/70 hover:text-white transition-colors"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
        >‹</button>
      )}
      {currentPage < pages.length - 1 && (
        <button
          onClick={() => goToPage(currentPage + 1)}
          className="fixed right-3 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center text-5xl text-white/70 hover:text-white transition-colors"
          style={{ textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}
        >›</button>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        onScroll={onScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="fixed inset-0 bg-black flex overflow-x-auto overflow-y-hidden select-none"
        style={{
          scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          cursor: 'grab',
        }}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className="flex-shrink-0 w-screen h-screen grid grid-cols-3 grid-rows-3 gap-px"
            style={{ scrollSnapAlign: 'start' }}
          >
            {page.map(({ photo, location }) => (
              <button
                key={photo.id}
                onClick={() => {
                  if (isDragging.current) return;
                  setSelected({ location, photoId: photo.id });
                }}
                className="relative overflow-hidden bg-zinc-900 group w-full h-full"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.thumbUrl}
                  alt={location.name}
                  className="w-full h-full object-cover transition-opacity duration-150 group-hover:opacity-70 pointer-events-none"
                  loading="lazy"
                  draggable={false}
                />
                <div className="absolute inset-0 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-white/80 text-xs truncate">{location.name}</span>
                </div>
              </button>
            ))}
            {page.length < PER_PAGE &&
              Array.from({ length: PER_PAGE - page.length }).map((_, i) => (
                <div key={`empty-${i}`} className="bg-zinc-950" />
              ))}
          </div>
        ))}
      </div>

      <Menu />

      {viewerLocation && (
        <PhotoViewer location={viewerLocation} onClose={() => setSelected(null)} />
      )}
    </>
  );
}

