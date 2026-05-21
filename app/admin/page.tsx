'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { uploadPhoto, getAdminPhotos, setPhotoStatus, setPhotoCaption, setPhotoLocation, deletePhoto } from './actions';
import type { UploadResult, AdminPhotoRow } from './actions';
import Menu from '../components/Menu';

// ── Upload queue types ────────────────────────────────────────────────────────
type QueueStatus = 'pending' | 'uploading' | 'done' | 'error';
interface QueuedFile {
  id: string;
  file: File;
  previewUrl: string;
  locationName: string;
  caption: string;
  status: QueueStatus;
  error?: string;
}

export default function AdminPage() {
  const [tab, setTab] = useState<'upload' | 'library'>('upload');
  const [dbPhotos, setDbPhotos] = useState<AdminPhotoRow[]>([]);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (tab === 'library') {
      setLoadingLibrary(true);
      getAdminPhotos()
        .then((rows) => { setDbPhotos(rows); setLoadingLibrary(false); })
        .catch(() => setLoadingLibrary(false));
    }
  }, [tab]);

  const totalPhotos = dbPhotos.length;

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
      added.push({
        id: Math.random().toString(36).slice(2),
        file,
        previewUrl,
        locationName: '',
        caption: '',
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
      <Menu />
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
                            placeholder="Enter location name"
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
        {tab === 'library' && (
          <div className="space-y-8">
            {loadingLibrary && (
              <p className="text-white/25 text-sm text-center py-8">Loading…</p>
            )}
            {!loadingLibrary && dbPhotos.length === 0 && (
              <p className="text-white/20 text-sm text-center py-8">No photos yet</p>
            )}
            {!loadingLibrary && (() => {
              const groups = new Map<string, AdminPhotoRow[]>();
              for (const p of dbPhotos) {
                const key = p.location_name ?? 'Unknown';
                if (!groups.has(key)) groups.set(key, []);
                groups.get(key)!.push(p);
              }
              return Array.from(groups.entries()).map(([locName, photos]) => (
                <div key={locName}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-white/50 text-xs tracking-widest uppercase">{locName}</span>
                    <span className="text-white/15 text-xs">{photos.length} photo{photos.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="space-y-1">
                    {photos.map((photo) => {
                      const isLive = photo.status === 'published';
                      const confirmDelete = deletingId === photo.id;
                      return (
                        <div
                          key={photo.id}
                          className="border border-white/5 hover:border-white/10 rounded-lg overflow-hidden transition-colors"
                        >
                          {/* Top row */}
                          <div className="flex items-center gap-3 px-3 py-2">
                            <div className="w-10 h-10 rounded bg-white/5 flex-shrink-0 overflow-hidden">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={photo.r2_thumb_url} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-white/35 text-xs truncate">{photo.filename}</p>
                              <p className="text-white/15 text-xs">
                                {photo.date_taken
                                  ? new Date(photo.date_taken).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                  : '—'}
                              </p>
                            </div>
                            <button
                              onClick={async () => {
                                const next = isLive ? 'draft' : 'published';
                                await setPhotoStatus(photo.id, next);
                                setDbPhotos((prev) =>
                                  prev.map((p) => p.id === photo.id ? { ...p, status: next } : p),
                                );
                              }}
                              className={`text-xs px-2 py-0.5 rounded border flex-shrink-0 transition-colors ${
                                isLive
                                  ? 'text-white/40 border-white/15 hover:border-white/30'
                                  : 'text-white/20 border-white/8 hover:border-white/20'
                              }`}
                            >
                              {isLive ? 'live' : 'draft'}
                            </button>
                            {/* Pencil */}
                            <button
                              onClick={() => setEditingId(editingId === photo.id ? null : photo.id)}
                              className={`transition-colors flex-shrink-0 p-1 ${editingId === photo.id ? 'text-white/50' : 'text-white/15 hover:text-white/45'}`}
                              title="Edit details"
                            >
                              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                <path d="M9 2l2 2-7 7H2v-2L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            {confirmDelete ? (
                              <div className="flex items-center gap-1 flex-shrink-0">
                                <button
                                  onClick={async () => {
                                    await deletePhoto(photo.id);
                                    setDbPhotos((prev) => prev.filter((p) => p.id !== photo.id));
                                    setDeletingId(null);
                                  }}
                                  className="text-xs px-2 py-0.5 rounded border border-red-500/40 text-red-400/80 hover:border-red-500/70 transition-colors"
                                >
                                  confirm
                                </button>
                                <button
                                  onClick={() => setDeletingId(null)}
                                  className="text-white/20 hover:text-white/50 text-lg leading-none transition-colors px-1"
                                >×</button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setDeletingId(photo.id)}
                                className="text-white/15 hover:text-red-400/60 transition-colors flex-shrink-0 p-1"
                                title="Delete photo"
                              >
                                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                                  <path d="M2 3h9M5 3V2h3v1M3 3l.7 8h5.6L10 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Edit fields — shown only when pencil is active */}
                          {editingId === photo.id && (
                          <div className="border-t border-white/5 divide-y divide-white/5">
                            <div className="px-3 py-2 flex items-center gap-3">
                              <span className="text-white/20 text-xs w-16 flex-shrink-0">Location</span>
                              <input
                                defaultValue={photo.location_name ?? ''}
                                onBlur={async (e) => {
                                  const { lat, lng } = await setPhotoLocation(photo.id, e.target.value);
                                  setDbPhotos((prev) =>
                                    prev.map((p) => p.id === photo.id
                                      ? { ...p, location_name: e.target.value || null, lat, lng }
                                      : p),
                                  );
                                }}
                                placeholder="Enter location…"
                                className="flex-1 bg-transparent text-white/55 text-sm outline-none border-b border-transparent focus:border-white/20 hover:border-white/10 placeholder:text-white/15 transition-colors pb-0.5"
                              />
                              {photo.lat != null && (
                                <span className="text-white/30 text-xs flex-shrink-0" title={`${photo.lat?.toFixed(4)}, ${photo.lng?.toFixed(4)}`}>📍</span>
                              )}
                            </div>
                            <div className="px-3 py-2 flex items-center gap-3">
                              <span className="text-white/20 text-xs w-16 flex-shrink-0">Caption</span>
                              <input
                                defaultValue={photo.caption ?? ''}
                                onBlur={(e) => setPhotoCaption(photo.id, e.target.value)}
                                placeholder="Add caption…"
                                className="flex-1 bg-transparent text-white/55 text-sm outline-none border-b border-transparent focus:border-white/20 hover:border-white/10 placeholder:text-white/15 transition-colors pb-0.5"
                              />
                            </div>
                          </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

      </div>
    </div>
  );
}
