import dynamic from 'next/dynamic';
import Link from 'next/link';
import Menu from '../components/Menu';

const MapView = dynamic(() => import('../components/MapView'), { ssr: false });

export default function MapPage() {
  return (
    <main className="fixed inset-0">
      <MapView />
      {/* Back to grid */}
      <Link
        href="/"
        className="fixed top-5 left-5 z-[500] w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/25 transition-colors text-white/60 hover:text-white"
        aria-label="Back to photos"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </Link>
      <Menu />
    </main>
  );
}
