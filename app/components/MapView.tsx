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
  const [cursor, setCursor] = useState('grab');
  const mapRef = useRef<MapRef>(null);

  useEffect(() => {
    fetch('/api/photos')
      .then((r) => r.json())
      .then((rows: PhotoRow[]) => setLocations(rowsToLocations(rows)))
      .catch(console.error);
  }, []);

  const geojson = useMemo(() => ({
    type: 'FeatureCollection' as const,
    features: locations.map((loc) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [loc.lng, loc.lat] },
      properties: { id: loc.id, photoCount: loc.photos.length },
    })),
  }), [locations]);

  const onMouseEnter = useCallback(() => setCursor('pointer'), []);
  const onMouseLeave = useCallback(() => setCursor('grab'), []);

  const onClick = useCallback((e: MapMouseEvent) => {
    const features = e.features;
    if (!features?.length) return;
    const feature = features[0];

    if (feature.layer?.id === 'clusters') {
      const clusterId = feature.properties?.cluster_id;
      const source = mapRef.current?.getSource('locations') as GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err: Error | null | undefined, zoom: number | null | undefined) => {
        if (err || zoom == null) return;
        const coords = (feature.geometry as Point).coordinates as [number, number];
        mapRef.current?.easeTo({ center: coords, zoom: zoom + 0.5, duration: 400 });
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
        cursor={cursor}
        minZoom={2}
      >
        <Source
          id="locations"
          type="geojson"
          data={geojson}
          cluster={true}
          clusterMaxZoom={12}
          clusterRadius={45}
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
    </>
  );
}



