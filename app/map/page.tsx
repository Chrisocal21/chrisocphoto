import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import SiteHeader from '../components/SiteHeader';
import { getInitialPhotos } from '@/lib/photo-store';
import { pageMetadata } from '@/lib/site';

const MapView = dynamic(() => import('../components/MapView'), { ssr: false });

export const metadata: Metadata = pageMetadata({
  title: 'Map',
  description: 'Every place Chris has pointed a camera at, pinned on a map. Pick a pin to see the photos taken there.',
  path: '/map',
});

export default async function MapPage() {
  const rows = await getInitialPhotos();

  return (
    // The plain wrapper gives Next.js an ordinary element to anchor to on navigation. Without it the
    // first elements are both position: fixed, which it warns about in development.
    <div>
      <SiteHeader variant="overlay" back={{ href: '/', label: 'Back to photos' }} />
      <main id="main" className="fixed inset-0 bg-black">
        <h1 className="sr-only">Map of where the photos were taken</h1>
        <MapView initialRows={rows} />
      </main>
    </div>
  );
}
