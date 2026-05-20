'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { MOCK_LOCATIONS } from '../data/locations';
import { uploadPhoto } from './actions';
import type { UploadResult } from './actions';

const STORAGE_KEY = 'chrisocphoto_admin';

// ── Upload queue types ────────────────────────────────────────────────────────
type QueueStatus = 'pending' | 'uploading' | 'done' | 'error';
interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  locationName: string;
  caption: string;
  gpsFound: boolean;
  status: QueueStatus;
  error?: string;
}

type PhotoEdit = { caption: string; status: 'draft' | 'published' };
type Store = {
  photos: Record<string, PhotoEdit>;
  locations: Record<string, string>; // locationId -> name override
};

function buildDefaults(): Store {
  const photos: Record<string, PhotoEdit> = {};
  const locations: Record<string, string> = {};
  for (const loc of MOCK_LOCATIONS) {
    locations[loc.id] = loc.name;
    for (const photo of loc.photos) {
      photos[photo.id] = { caption: '', status: 'published' };
    }
  }
  return { photos, locations };
}

export default function AdminPage() {
  const [tab, setTab] = useState<'upload' | 'library'>('upload');
  const [store, setStore] = useState<Store>({ photos: {}, locations: {} });
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const defaults = buildDefaults();
      if (saved) {
        const parsed: Store = JSON.parse(saved);
        setStore({
          photos: { ...defaults.photos, ...parsed.photos },
          locations: { ...defaults.locations, ...parsed.locations },
        });
      } else {
        setStore(defaults);
      }
    } catch {
      setStore(buildDefaults());
    }
    setReady(true);
  }, []);

  function save(next: Store) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStore(next);
  }

  function updatePhoto(photoId: string, field: keyof PhotoEdit, value: string) {
    save({
      ...store,
      photos: {
        ...store.photos,
        [photoId]: { ...store.photos[photoId], [field]: value },
      },
    });
  }

  function updateLocationName(locId: string, value: string) {
    save({ ...store, locations: { ...store.locations, [locId]: value } });
  }

  const totalPhotos = MOCK_LOCATIONS.reduce((n, l) => n + l.photos.length, 0);

  // ── Upload queue state ────────────────────────────────────────────────────
  const [queue, setQueue] = useState<QueuedFile[]>([]);
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOver = useRef(false);
  const [isDragOver, setIsDragOver] = useState(false);

  async function addFiles(files: FileList | null) {
    if (!files) return;
    const added: QueuedFile[] = [];
    for (const file of Array.from(files)) {
      const previewUrl = URL.createObjectURL(file);
      // Quick GPS check client-side
      let gpsFound = false;
      try {
        const exifr = (await import('exifr')).default;
        const gps = await exifr.gps(file);
        gpsFound = !!(gps?.latitude && gps?.longitude);
      } catch { /* no exifr in browser or no GPS */ }
      added.push({
        id: Math.random().toString(36).slice(2),
        file,
        previewUrl,
        locationName: '',
        caption: '',
        gpsFound,
        status: 'pending',
      });
    }
    setQueue((q) => [...q, ...added]);
  }

  function removeFromQueue(id: string) {
    setQueue((q) => q.filter((f) => f.id !== id));
  }

  function updateQueued(id: string, field: 'locationName' | 'caption', value: string) {
    setQueue((q) => q.map((f) => (f.id === id ? { ...f, [field]: value } : f)));
  }

  function handleUploadAll() {
    const pending = queue.filter((f) => f.status === 'pending');
    if (!pending.length) return;
    startTransition(async () => {
      for (const item of pending) {
        setQueue((q) => q.map((f) => (f.id === item.id ? { ...f, status: 'uploading' } : f)));
        const fd = new FormData();
        fd.append('file', item.file);
        if (item.locationName) fd.append('location_name', item.locationName);
        if (item.caption) fd.append('caption', item.caption);
        const result: UploadResult = await uploadPhoto(fd);
        setQueue((q) =>
          q.map((f) =>
            f.id === item.id
              ? result.ok
                ? { ...f, status: 'done' }
                : { ...f, status: 'error', error: result.error }
              : f,
          ),
        );
      }
    });
  }

  const pendingCount = queue.filter((f) => f.status === 'pending').length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <span className="text-white/40 text-xs tracking-widest uppercase">chrisocphoto</span>
          <span className="text-white/20 text-xs">admin</span>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/8">
          {(['upload', 'library'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs tracking-widest uppercase -mb-px border-b transition-colors ${
                tab === t
                  ? 'text-white/80 border-white/40'
                  : 'text-white/25 border-transparent hover:text-white/50'
              }`}
            >
              {t === 'library' ? `library (${totalPhotos})` : t}
            </button>
          ))}
        </div>

        {/* ── Upload tab ── */}
        {tab === 'upload' && (
          <>
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif,image/webp"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />

            {/* Drop zone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); if (!dragOver.current) { dragOver.current = true; setIsDragOver(true); } }}
              onDragLeave={() => { dragOver.current = false; setIsDragOver(false); }}
              onDrop={(e) => { e.preventDefault(); dragOver.current = false; setIsDragOver(false); addFiles(e.dataTransfer.files); }}
              className={`border border-dashed rounded-lg px-8 py-16 text-center mb-6 cursor-pointer transition-colors ${isDragOver ? 'border-white/30 bg-white/3' : 'border-white/10 hover:border-white/20'}`}
            >
              <div className="text-white/15 text-6xl mb-4 select-none">+</div>
              <p className="text-white/40 text-sm mb-2">Drop photos here or click to select</p>
              <p className="text-white/20 text-xs">JPEG · HEIC · PNG · GPS extracted automatically</p>
            </div>

            {/* Queue */}
            {queue.length > 0 && (
              <div className="space-y-1 mb-6">
                {queue.map((item) => (
                  <div key={item.id} className="border border-white/8 rounded-lg overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3">
                      {/* Thumb */}
                      <div className="w-12 h-12 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.previewUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/60 text-sm truncate">{item.file.name}</p>
                        <p className="text-white/25 text-xs mt-0.5">
                          {(item.file.size / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.status === 'pending' && (
                          <span className={`text-xs rounded px-2 py-0.5 ${item.gpsFound ? 'text-white/30 bg-white/5' : 'text-amber-400/50 bg-amber-400/8'}`}>
                            {item.gpsFound ? 'GPS ✓' : 'no GPS'}
                          </span>
                        )}
                        {item.status === 'uploading' && (
                          <span className="text-xs text-white/30 animate-pulse">uploading…</span>
                        )}
                        {item.status === 'done' && (
                          <span className="text-xs text-white/40">✓ uploaded</span>
                        )}
                        {item.status === 'error' && (
                          <span className="text-xs text-red-400/70">{item.error}</span>
                        )}
                        {item.status !== 'uploading' && (
                          <button
                            onClick={() => removeFromQueue(item.id)}
                            className="text-white/20 hover:text-white/60 text-lg leading-none transition-colors"
                          >×</button>
                        )}
                      </div>
                    </div>

                    {/* Editable fields */}
                    {item.status === 'pending' && (
                      <div className="border-t border-white/5 divide-y divide-white/5">
                        <div className="px-4 py-2.5 flex items-center gap-3">
                          <span className="text-white/25 text-xs w-24 flex-shrink-0">Location</span>
                          <input
                            value={item.locationName}
                            onChange={(e) => updateQueued(item.id, 'locationName', e.target.value)}
                            placeholder={item.gpsFound ? 'Auto-detected on upload' : 'Enter location name'}
                            className="flex-1 bg-transparent text-white/60 text-sm outline-none border-b border-white/10 focus:border-white/30 placeholder:text-white/20 transition-colors pb-0.5"
                          />
                        </div>
                        <div className="px-4 py-2.5 flex items-center gap-3">
                          <span className="text-white/25 text-xs w-24 flex-shrink-0">Caption</span>
                          <input
                            value={item.caption}
                            onChange={(e) => updateQueued(item.id, 'caption', e.target.value)}
                            placeholder="Optional caption…"
                            className="flex-1 bg-transparent text-white/60 text-sm outline-none border-b border-white/10 focus:border-white/30 placeholder:text-white/20 transition-colors pb-0.5"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Upload button */}
            {pendingCount > 0 && (
              <button
                onClick={handleUploadAll}
                disabled={isPending}
                className="w-full py-3 bg-white/8 hover:bg-white/12 border border-white/10 rounded-lg text-white/60 hover:text-white/80 text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isPending ? 'Uploading…' : `Upload ${pendingCount} photo${pendingCount !== 1 ? 's' : ''}`}
              </button>
            )}

            {queue.length === 0 && (
              <p className="text-white/15 text-xs text-center mt-2">No photos queued</p>
            )}
          </>
        )}

        {/* ── Library tab ── */}
        {tab === 'library' && ready && (
          <div className="space-y-8">
            {MOCK_LOCATIONS.map((loc) => (
              <div key={loc.id}>
                {/* Location header */}
                <div className="flex items-center gap-3 mb-2">
                  <input
                    value={store.locations[loc.id] ?? loc.name}
                    onChange={(e) => updateLocationName(loc.id, e.target.value)}
                    className="bg-transparent text-white/50 text-xs tracking-widest uppercase outline-none border-b border-transparent focus:border-white/25 hover:border-white/15 transition-colors pb-0.5"
                  />
                  <span className="text-white/15 text-xs">
                    {loc.photos.length} photo{loc.photos.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Photo rows */}
                <div className="space-y-1">
                  {loc.photos.map((photo) => {
                    const edit = store.photos[photo.id] ?? { caption: '', status: 'published' as const };
                    const isLive = edit.status === 'published';
                    return (
                      <div
                        key={photo.id}
                        className="flex items-center gap-3 group border border-white/5 hover:border-white/10 rounded-lg px-3 py-2 transition-colors"
                      >
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.thumbUrl} alt="" className="w-full h-full object-cover" />
                        </div>

                        {/* ID + date */}
                        <div className="w-20 flex-shrink-0">
                          <p className="text-white/20 text-xs font-mono truncate">{photo.id}</p>
                          <p className="text-white/15 text-xs truncate">{photo.date}</p>
                        </div>

                        {/* Caption */}
                        <input
                          value={edit.caption}
                          onChange={(e) => updatePhoto(photo.id, 'caption', e.target.value)}
                          placeholder="Add caption…"
                          className="flex-1 min-w-0 bg-transparent text-white/55 text-sm outline-none border-b border-transparent focus:border-white/20 hover:border-white/10 placeholder:text-white/15 transition-colors pb-0.5"
                        />

                        {/* EXIF — revealed on row hover */}
                        {photo.exif && (
                          <span className="text-white/20 text-xs flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                            {photo.exif.aperture}
                            {photo.exif.shutter ? ` · ${photo.exif.shutter}` : ''}
                            {photo.exif.iso ? ` · ISO ${photo.exif.iso}` : ''}
                          </span>
                        )}

                        {/* Status toggle */}
                        <button
                          onClick={() => updatePhoto(photo.id, 'status', isLive ? 'draft' : 'published')}
                          className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 transition-colors ${
                            isLive
                              ? 'text-white/40 border-white/15 hover:border-white/30'
                              : 'text-white/20 border-white/8 hover:border-white/20'
                          }`}
                        >
                          {isLive ? 'live' : 'draft'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
