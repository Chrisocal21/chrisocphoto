import type { Metadata } from 'next';
import PhotoGrid from './components/PhotoGrid';
import SiteHeader from './components/SiteHeader';
import { getInitialPhotos } from '@/lib/photo-store';
import { pageMetadata } from '@/lib/site';

export const metadata: Metadata = pageMetadata({ path: '/' });

export default async function Home() {
  const rows = await getInitialPhotos();

  return (
    // The plain wrapper gives Next.js an ordinary element to anchor to on navigation. Without it the
    // first elements are both position: fixed, which it warns about in development.
    <div>
      <SiteHeader variant="overlay" />
      <PhotoGrid initialRows={rows} />
    </div>
  );
}
