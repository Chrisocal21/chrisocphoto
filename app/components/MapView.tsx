'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
import type { CircleLayer, SymbolLayer, GeoJSONSource } from 'mapbox-gl';
import type { Point } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Location } from '../data/locations';
import type { PhotoRow } from '@/lib/photos';
import { usePhotos } from '@/lib/use-photos';
import { usePhotoParam } from '@/lib/use-photo-param';
import { morph } from '@/lib/view-transition';
import PhotoViewer from './PhotoViewer';
import { IconClose, IconSearch } from './icons';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

// One line to change if the base map should look different (BUILD_GUIDE.md lists the options)
const MAP_STYLE = 'mapbox://styles/mapbox/dark-v11';

// What surrounds the globe when zoomed all the way out: black space, a few stars, a thin haze
const FOG = {
  range: [0.8, 8] as [number, number],
  color: '#0a0a0a',
  'high-color': '#1a1a1f',
  'horizon-blend': 0.05,
  'space-color': '#000000',
  'star-intensity': 0.35,
};

// Cluster outer glow
const clusterGlowLayer: CircleLayer = {
  id: 'cluster-glow',
  type: 'circle',
  source: 'locations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': 'rgba(255,255,255,0.12)',
    'circle-radius': ['step', ['get', 'point_count'], 22, 5, 28, 10, 36],
    'circle-blur': 0.7,
  },
};

// Cluster circle
const clusterLayer: CircleLayer = {
  id: 'clusters',
  type: 'circle',
  source: 'locations',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': 'rgba(255,255,255,0.88)',
    'circle-radius': ['step', ['get', 'point_count'], 12, 5, 15, 10, 19],
  },
};

// Cluster count label
const clusterCountLayer: SymbolLayer = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'locations',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 11,
  },
  paint: { 'text-color': '#111' },
};

// Single pin glow
const pinGlowLayer: CircleLayer = {
  id: 'pin-glow',
  type: 'circle',
  source: 'locations',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': 'rgba(255,255,255,0.18)',
    'circle-radius': ['interpolate', ['linear'], ['get', 'photoCount'], 1, 20, 10, 30],
    'circle-blur': 0.9,
  },
};

// Single pin dot
const pinLayer: CircleLayer = {
  id: 'pins',
  type: 'circle',
  source: 'locations',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': 'rgba(255,255,255,0.92)',
    'circle-radius': ['interpolate', ['linear'], ['get', 'photoCount'], 1, 10, 5, 14, 10, 18],
  },
};

const plural = (n: number, word: string) => `${n} ${word}${n !== 1 ? 's' : ''}`;

type Props = {
  /** The library as the server saw it. Null if the server couldn't load it. */
  initialRows: PhotoRow[] | null;
};

export default function MapView({ initialRows }: Props) {
  const { locations, status } = usePhotos(initialRows);
  const viewer = usePhotoParam();
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoveredClusterLocations, setHoveredClusterLocations] = useState<Location[]>([]);
  const [panel, setPanel] = useState<{ title: string; locations: Location[] } | null>(null);
  const [panelSearch, setPanelSearch] = useState('');
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState('grab');
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef<MapRef>(null);
  const hoveredClusterIdRef = useRef<number | null>(null);
  const framed = useRef(false);

  const pinned = useMemo(() => locations.filter((loc) => loc.lat != null && loc.lng != null), [locations]);
  const photoCount = useMemo(() => pinned.reduce((sum, loc) => sum + loc.photos.length, 0), [pinned]);

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: pinned.map((loc) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lng!, loc.lat!] },
      properties: { id: loc.id, photoCount: loc.photos.length },
    })),
  }), [pinned]);

  // The open photo comes from the address bar (?photo=<id>), so Back closes the viewer
  const selected = useMemo(() => {
    if (!viewer.photoId) return null;
    for (const location of locations) {
      const index = location.photos.findIndex((p) => p.id === viewer.photoId);
      if (index !== -1) return { location, index };
    }
    return null;
  }, [locations, viewer.photoId]);

  // A link to a photo that has since been removed: drop its id from the address and show the map
  useEffect(() => {
    if (status === 'ready' && viewer.photoId && !selected) viewer.close();
  }, [status, viewer, selected]);

  const openLocation = useCallback((location: Location) => {
    if (location.photos.length) morph(() => viewer.open(location.photos[0].id));
  }, [viewer]);

  // Start on a view that holds every pin, whatever the screen size. Once: later refreshes leave the map where it is.
  useEffect(() => {
    const map = mapRef.current;
    if (!mapReady || framed.current || !map || pinned.length === 0) return;
    framed.current = true;
    if (pinned.length === 1) {
      map.easeTo({ center: [pinned[0].lng!, pinned[0].lat!], zoom: 8, duration: 1400 });
      return;
    }
    const lngs = pinned.map((loc) => loc.lng!);
    const lats = pinned.map((loc) => loc.lat!);
    map.fitBounds(
      [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
      { padding: { top: 110, bottom: 110, left: 56, right: 56 }, maxZoom: 9, duration: 1400 },
    );
  }, [mapReady, pinned]);

  // ESC closes the location list
  useEffect(() => {
    if (!panel) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [panel]);

  const openPanel = useCallback((title: string, list: Location[]) => {
    setPanel({ title, locations: list });
    setPanelSearch('');
    setHoveredLocation(null);
  }, []);

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => {
    setCursor('grab');
    setHoveredLocation(null);
    setHoveredClusterLocations([]);
    setHoverPos(null);
    hoveredClusterIdRef.current = null;
  }, []);

  const onMouseMove = useCallback((e: MapMouseEvent) => {
    const feature = e.features?.[0];
    if (feature?.layer?.id === 'pins') {
      const id = feature.properties?.id;
      const loc = locations.find((l) => l.id === id);
      if (loc) {
        setHoveredLocation(loc);
        setHoverPos({ x: e.point.x, y: e.point.y });
      }
    } else if (feature?.layer?.id === 'clusters') {
      const clusterId = feature.properties?.cluster_id as number;
      const count = feature.properties?.point_count ?? 0;
      hoveredClusterIdRef.current = clusterId;
      setHoveredLocation({
        id: '__cluster__',
        name: 'Multiple locations',
        photos: Array.from({ length: count }, (_, i) => ({ id: `__c_${i}`, url: '', thumbUrl: '', date: '' })),
      });
      setHoveredClusterLocations([]);
      setHoverPos({ x: e.point.x, y: e.point.y });
      // Async: load the actual leaf locations so we can show per-place previews
      const source = mapRef.current?.getSource('locations') as GeoJSONSource | undefined;
      source?.getClusterLeaves(clusterId, 8, 0, (err: Error | null | undefined, leaves) => {
        if (err || !leaves || hoveredClusterIdRef.current !== clusterId) return;
        const seen = new Set<string>();
        const leafLocs = leaves
          .map((leaf) => locations.find((l) => l.id === leaf.properties?.id))
          .filter((l): l is Location => {
            if (!l || seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
          });
        setHoveredClusterLocations(leafLocs);
      });
    } else {
      hoveredClusterIdRef.current = null;
      setHoveredLocation(null);
      setHoveredClusterLocations([]);
    }
  }, [locations]);

  const onClick = useCallback((e: MapMouseEvent) => {
    const features = e.features;
    if (!features?.length) return;
    const feature = features[0];

    if (feature.layer?.id === 'clusters') {
      const clusterId = feature.properties?.cluster_id as number;
      const source = mapRef.current?.getSource('locations') as GeoJSONSource | undefined;
      source?.getClusterLeaves(clusterId, 50, 0, (err: Error | null | undefined, leaves) => {
        if (err || !leaves) return;
        const seen = new Set<string>();
        const locs = leaves
          .map((leaf) => locations.find((l) => l.id === leaf.properties?.id))
          .filter((l): l is Location => {
            if (!l || seen.has(l.id)) return false;
            seen.add(l.id);
            return true;
          });
        if (locs.length > 0) {
          openPanel(`${plural(locs.length, 'location')} nearby`, locs);
        } else {
          // Fallback: zoom in
          const coords = (feature.geometry as Point).coordinates as [number, number];
          mapRef.current?.easeTo({ center: coords, zoom: 10, duration: 400 });
        }
      });
    } else if (feature.layer?.id === 'pins') {
      const id = feature.properties?.id;
      const location = locations.find((l) => l.id === id);
      if (location) openLocation(location);
    }
  }, [locations, openLocation, openPanel]);

  if (!MAPBOX_TOKEN) {
    return (
      <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
        <div className="max-w-sm">
          <h2 className="font-display text-2xl font-light text-white">The map isn’t available right now.</h2>
          <p className="mt-3 text-[15px] leading-relaxed text-neutral-400">The photos are all still on the grid.</p>
        </div>
      </div>
    );
  }

  const panelLocations = panel
    ? panel.locations.filter((loc) => loc.name.toLowerCase().includes(panelSearch.toLowerCase()))
    : [];

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -98.35, latitude: 39.5, zoom: 2.4 }}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        projection={{ name: 'globe' }}
        fog={FOG}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['clusters', 'pins']}
        onLoad={() => setMapReady(true)}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        cursor={cursor}
        minZoom={1.5}
      >
        <Source
          id="locations"
          type="geojson"
          data={geojson}
        >
          <Layer {...clusterGlowLayer} />
          <Layer {...clusterLayer} />
          <Layer {...clusterCountLayer} />
          <Layer {...pinGlowLayer} />
          <Layer {...pinLayer} />
        </Source>
      </Map>

      {/* Every place in one list. Also the way in for anyone not using a mouse. */}
      {pinned.length > 0 && (
        <div className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-10 flex justify-center">
          <button
            type="button"
            onClick={() => openPanel(plural(pinned.length, 'place'), pinned)}
            className="glass pointer-events-auto mb-5 flex h-11 items-center rounded-full px-5 text-[13px] tabular-nums text-white transition-colors duration-200 hover:border-white/30"
          >
            {plural(pinned.length, 'place')}
            <span className="mx-2 text-white/40" aria-hidden="true">·</span>
            <span className="text-neutral-300">{plural(photoCount, 'photo')}</span>
          </button>
        </div>
      )}

      {selected && (
        <PhotoViewer
          location={selected.location}
          index={selected.index}
          onNavigate={viewer.show}
          onClose={() => morph(viewer.close)}
        />
      )}

      {/* Hover popup */}
      {hoveredLocation && hoverPos && !selected && !panel && (() => {
        // When a cluster resolves to exactly 1 unique location, treat it like a single pin hover
        const isCluster = hoveredLocation.id === '__cluster__';
        const singleLoc = isCluster && hoveredClusterLocations.length === 1 ? hoveredClusterLocations[0] : null;
        const displayName = singleLoc ? singleLoc.name : hoveredLocation.name;
        const displayPhotos = singleLoc ? singleLoc.photos : hoveredLocation.photos;
        const showLocationCards = isCluster && hoveredClusterLocations.length > 1;

        return (
        <div
          className="pointer-events-none absolute z-40"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            transform: hoverPos.x > window.innerWidth - 250
              ? 'translate(-100%, -100%) translate(-12px, -12px)'
              : 'translate(12px, -100%) translateY(-12px)',
          }}
        >
          <div className="w-56 overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/90 shadow-2xl shadow-black/70 backdrop-blur-xl">
            <div className="px-3.5 py-3">
              <p className="truncate font-display text-[13px] text-white">{displayName}</p>
              <p className="mt-0.5 text-xs tabular-nums text-neutral-400">{plural(displayPhotos.length, 'photo')}</p>
            </div>
            {/* Cluster with multiple distinct locations: per-location labeled previews */}
            {showLocationCards && (
              <div className="grid grid-cols-2 gap-px bg-white/5">
                {hoveredClusterLocations.slice(0, 4).map((loc) => (
                  <div
                    key={loc.id}
                    className="relative overflow-hidden bg-neutral-900"
                    style={{ aspectRatio: '1' }}
                  >
                    {loc.photos[0]?.thumbUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={loc.photos[0].thumbUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2 pb-1.5 pt-5">
                      <p className="truncate text-[10px] font-medium leading-tight text-white">{loc.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {/* Single pin or single-location cluster: photo grid */}
            {!showLocationCards && displayPhotos.filter((p) => p.thumbUrl).length > 0 && (
              <div
                className={`grid gap-px bg-white/5 ${
                  displayPhotos.filter((p) => p.thumbUrl).length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                }`}
              >
                {displayPhotos.slice(0, 4).filter((p) => p.thumbUrl).map((photo) => (
                  <div
                    key={photo.id}
                    className="overflow-hidden bg-neutral-900"
                    style={{ aspectRatio: '1' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        );
      })()}

      {/* Location picker panel: the places inside a cluster, or all of them */}
      {panel && createPortal(
        <div
          className="fixed inset-0 z-[900] flex animate-fade items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={() => setPanel(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label={panel.title}
            className="w-full max-w-xs overflow-hidden rounded-2xl border border-white/10 bg-neutral-950 shadow-2xl shadow-black/70"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-white/[0.08] px-4 pb-3 pt-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="eyebrow">{panel.title}</p>
                <button
                  type="button"
                  onClick={() => setPanel(null)}
                  className="-mr-1.5 flex h-7 w-7 items-center justify-center rounded-full text-neutral-400 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <IconClose className="h-4 w-4" />
                </button>
              </div>
              <div className="relative">
                <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
                <input
                  type="text"
                  value={panelSearch}
                  onChange={(e) => setPanelSearch(e.target.value)}
                  placeholder="Search locations…"
                  aria-label="Search locations"
                  className="field py-2 pl-9 pr-3"
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                />
              </div>
            </div>
            <div className="max-h-72 overflow-y-auto p-1.5">
              {panelLocations.map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => { setPanel(null); openLocation(loc); }}
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-white/[0.06]"
                >
                  {loc.photos[0]?.thumbUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={loc.photos[0].thumbUrl}
                      alt=""
                      className="h-11 w-11 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-11 w-11 flex-shrink-0 rounded-lg bg-neutral-800" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-white">{loc.name}</p>
                    <p className="mt-0.5 text-xs tabular-nums text-neutral-400">{plural(loc.photos.length, 'photo')}</p>
                  </div>
                </button>
              ))}
              {panelLocations.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-neutral-400">Nothing by that name. Yet.</p>
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
