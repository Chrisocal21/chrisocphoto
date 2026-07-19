'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import type { Location } from '../data/locations';

type Props = {
  location: Location;
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

export default function PhotoViewer({ location, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const photo = location.photos[currentIndex];
  const exif = photo.exif;
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const goNext = useCallback(() => {
    setLoaded(false);
    setShowInfo(false);
    setCurrentIndex((i) => (i + 1) % location.photos.length);
  }, [location.photos.length]);

  const goPrev = useCallback(() => {
    setLoaded(false);
    setShowInfo(false);
    setCurrentIndex((i) => (i - 1 + location.photos.length) % location.photos.length);
  }, [location.photos.length]);

  useEffect(() => {
    setCurrentIndex(0);
    setLoaded(false);
    setShowInfo(false);
  }, [location.id]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { if (showInfo) setShowInfo(false); else onClose(); }
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'i') setShowInfo((v) => !v);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, goNext, goPrev, showInfo]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (dy > 80 && Math.abs(dy) > Math.abs(dx)) { onClose(); return; }
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) goNext(); else goPrev();
    }
  };

  const dt = exif ? formatDateTime(exif.dateTaken) : null;

  return (
    <div
      className="fixed inset-0 z-[1000] bg-black flex flex-col"
      onClick={() => { if (showInfo) setShowInfo(false); else onClose(); }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Header */}
      <div
        className="absolute top-0 left-0 right-0 flex justify-between items-start px-6 py-5 z-10"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/70 text-sm font-medium tracking-wide">
          {location.name}
        </span>
        <div className="flex items-center gap-4">
          <span className="text-white/40 text-sm">{photo.date}</span>
          {location.photos.length > 1 && (
            <span className="text-white/30 text-xs tabular-nums">
              {currentIndex + 1} / {location.photos.length}
            </span>
          )}
          {/* Info button */}
          <button
            onClick={() => setShowInfo((v) => !v)}
            className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-semibold transition-colors ${showInfo ? 'border-white/60 text-white/80 bg-white/10' : 'border-white/20 text-white/30 hover:border-white/50 hover:text-white/60'}`}
            aria-label="Photo info"
          >
            i
          </button>
          <button
            onClick={onClose}
            className="text-white/50 hover:text-white transition-colors text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
      </div>

      {/* Photo */}
      <div
        className="flex-1 flex items-center justify-center overflow-hidden px-4 py-4 sm:px-16 sm:py-8"
        onClick={(e) => e.stopPropagation()}
      >
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-8 h-8 border border-white/20 border-t-white/60 rounded-full animate-spin" />
          </div>
        )}
        <img
          key={photo.id}
          src={photo.url}
          alt={location.name}
          onLoad={() => setLoaded(true)}
          className={`max-w-full object-contain transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          style={{ maxHeight: 'calc(100svh - 8rem)' }}
        />
      </div>

      {/* Dot indicators */}
      {location.photos.length > 1 && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {location.photos.map((_, i) => (
            <button
              key={i}
              onClick={() => { setLoaded(false); setShowInfo(false); setCurrentIndex(i); }}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/25'}`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}

      {/* Info panel */}
      {showInfo && (
        <div
          className="absolute bottom-0 left-0 right-0 z-20 px-6 py-6"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.0) 100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {exif ? (
            <div className="grid grid-cols-2 gap-x-10 gap-y-2.5 text-xs max-w-lg">
              {dt && (
                <>
                  <Row label="Date" value={dt.date} />
                  <Row label="Time" value={dt.time} />
                </>
              )}
              <Row label="GPS" value={formatCoords(exif.lat, exif.lng)} />
              <Row label="Camera" value={exif.camera} />
              {exif.lens && <Row label="Lens" value={exif.lens} />}
              {exif.aperture && <Row label="Aperture" value={exif.aperture} />}
              {exif.shutter && <Row label="Shutter" value={exif.shutter} />}
              {exif.iso !== undefined && <Row label="ISO" value={String(exif.iso)} />}
              {exif.focalLength && <Row label="Focal length" value={exif.focalLength} />}
              <Row label="Location" value={location.name} />
            </div>
          ) : (
            <p className="text-white/25 text-xs">No EXIF data available.</p>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-white/30 uppercase tracking-widest text-[9px]">{label}</span>
      <span className="text-white/80 text-xs">{value}</span>
    </div>
  );
}

