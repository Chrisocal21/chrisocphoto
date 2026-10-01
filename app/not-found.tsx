import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from './components/SiteHeader';
import SiteFooter from './components/SiteFooter';

export const metadata: Metadata = {
  title: 'Page not found',
  description: 'That page doesn’t exist.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="main" className="safe-x mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center py-20 text-center">
        <p
          aria-hidden="true"
          className="animate-rise bg-spectrum bg-clip-text font-display text-[8.5rem] font-extralight leading-none tracking-[-0.06em] text-transparent sm:text-[13rem]"
        >
          404
        </p>
        <h1
          className="mt-6 animate-rise font-display text-3xl font-light tracking-[-0.03em] text-white sm:text-5xl"
          style={{ animationDelay: '80ms' }}
        >
          Lens cap’s still on.
        </h1>
        <p className="mt-5 animate-rise text-lg leading-relaxed text-neutral-400" style={{ animationDelay: '160ms' }}>
          Nothing at this address. It moved, it never existed, or I broke it.
        </p>
        <div className="mt-10 flex animate-rise flex-wrap justify-center gap-3" style={{ animationDelay: '240ms' }}>
          <Link href="/" className="button-primary">
            Back to the photos
          </Link>
          <Link href="/map" className="button-secondary">
            See the map
          </Link>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
