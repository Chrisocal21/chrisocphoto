'use client';

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import type { MapRef, MapMouseEvent } from 'react-map-gl/mapbox';
import type { CircleLayer, SymbolLayer, GeoJSONSource } from 'mapbox-gl';
import type { Point } from 'geojson';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { Location } from '../data/locations';
import { rowsToLocations } from '@/lib/photos';
import type { PhotoRow } from '@/lib/photos';
import PhotoViewer from './PhotoViewer';

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

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
    'circle-radius': ['interpolate', ['linear'], ['get', 'photoCount'], 1, 10, 10, 16],
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
    'circle-radius': ['interpolate', ['linear'], ['get', 'photoCount'], 1, 4, 5, 6, 10, 8],
  },
};

export default function MapView() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [hoveredLocation, setHoveredLocation] = useState<Location | null>(null);
  const [hoveredClusterLocations, setHoveredClusterLocations] = useState<Location[]>([]);
  const [clusterPanel, setClusterPanel] = useState<Location[] | null>(null);
  const [clusterSearch, setClusterSearch] = useState('');
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [cursor, setCursor] = useState('grab');
  const mapRef = useRef<MapRef>(null);
  const hoveredClusterIdRef = useRef<number | null>(null);

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

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: locations
      .filter((loc) => loc.lat != null && loc.lng != null)
      .map((loc) => ({
        type: 'Feature' as const,
        geometry: { type: 'Point' as const, coordinates: [loc.lng!, loc.lat!] },
        properties: { id: loc.id, photoCount: loc.photos.length },
      })),
  }), [locations]);

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
          setClusterPanel(locs);
          setClusterSearch('');
        } else {
          // Fallback: zoom in
          const coords = (feature.geometry as Point).coordinates as [number, number];
          mapRef.current?.easeTo({ center: coords, zoom: 10, duration: 400 });
        }
      });
    } else if (feature.layer?.id === 'pins') {
      const id = feature.properties?.id;
      const location = locations.find((l) => l.id === id);
      if (location) setSelectedLocation(location);
    }
  }, [locations]);

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: -98.35, latitude: 39.5, zoom: 4.5 }}
        style={{ position: 'fixed', inset: 0, width: '100vw', height: '100vh' }}
        mapStyle="mapbox://styles/mapbox/navigation-night-v1"
        projection={{ name: 'globe' }}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['clusters', 'pins']}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMouseMove={onMouseMove}
        cursor={cursor}
        minZoom={2}
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

      {selectedLocation && (
        <PhotoViewer
          location={selectedLocation}
          onClose={() => setSelectedLocation(null)}
        />
      )}

      {/* Hover popup */}
      {hoveredLocation && hoverPos && !selectedLocation && (() => {
        // When a cluster resolves to exactly 1 unique location, treat it like a single pin hover
        const isCluster = hoveredLocation.id === '__cluster__';
        const singleLoc = isCluster && hoveredClusterLocations.length === 1 ? hoveredClusterLocations[0] : null;
        const displayName = singleLoc ? singleLoc.name : hoveredLocation.name;
        const displayPhotos = singleLoc ? singleLoc.photos : hoveredLocation.photos;
        const showLocationCards = isCluster && hoveredClusterLocations.length > 1;

        return (
        <div
          className="fixed z-40 pointer-events-none"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            transform: hoverPos.x > window.innerWidth - 230
              ? 'translate(-100%, -100%) translate(-12px, -12px)'
              : 'translate(12px, -100%) translateY(-12px)',
          }}
        >
          <div className="bg-black/85 backdrop-blur-md border border-white/12 rounded-xl overflow-hidden shadow-2xl w-52">
            <div className="px-3 py-2.5 border-b border-white/8">
              <p className="text-white/80 text-xs font-medium truncate">{displayName}</p>
              <p className="text-white/30 text-xs mt-0.5">
                {displayPhotos.length} photo{displayPhotos.length !== 1 ? 's' : ''}
              </p>
            </div>
            {/* Cluster with multiple distinct locations: per-location labeled previews */}
            {showLocationCards && (
              <div className="grid grid-cols-2 gap-px bg-white/5">
                {hoveredClusterLocations.slice(0, 4).map((loc) => (
                  <div
                    key={loc.id}
                    className="relative overflow-hidden bg-zinc-900"
                    style={{ aspectRatio: '1' }}
                  >
                    {loc.photos[0]?.thumbUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={loc.photos[0].thumbUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent px-1.5 pb-1 pt-4">
                      <p className="text-white text-[9px] font-medium truncate leading-tight">{loc.name}</p>
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
                    className="overflow-hidden bg-zinc-900"
                    style={{ aspectRatio: '1' }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.thumbUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        );
      })()}
      {/* Cluster location picker panel */}
      {clusterPanel && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setClusterPanel(null)}
        >
          <div
            className="bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden w-full max-w-xs shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 pt-4 pb-3 border-b border-white/8">
              <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">
                {clusterPanel.length} location{clusterPanel.length !== 1 ? 's' : ''} nearby
              </p>
              <input
                type="text"
                value={clusterSearch}
                onChange={(e) => setClusterSearch(e.target.value)}
                placeholder="Search locations…"
                className="w-full bg-zinc-800 text-white text-sm rounded-lg px-3 py-2 outline-none placeholder-white/30 border border-white/8 focus:border-white/20"
                // eslint-disable-next-line jsx-a11y/no-autofocus
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-72">
              {clusterPanel
                .filter((loc) => loc.name.toLowerCase().includes(clusterSearch.toLowerCase()))
                .map((loc) => (
                  <button
                    key={loc.id}
                    onClick={() => { setSelectedLocation(loc); setClusterPanel(null); }}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-white/5 text-left transition-colors"
                  >
                    {loc.photos[0]?.thumbUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={loc.photos[0].thumbUrl}
                        alt=""
                        className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-zinc-800 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white/90 text-sm font-medium truncate">{loc.name}</p>
                      <p className="text-white/35 text-xs mt-0.5">
                        {loc.photos.length} photo{loc.photos.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



