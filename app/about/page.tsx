import type { Metadata } from 'next';
import Link from 'next/link';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import LatestFrames from '../components/LatestFrames';
import { IconArrowRight, IconArrowUpRight } from '../components/icons';
import { getInitialPhotos } from '@/lib/photo-store';
import { pageMetadata, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'About Chris',
  description:
    'Chris started in the Polaroid era, learned to see in the Instagram era, and still works by one rule: one frame, one place, one true line under it.',
  path: '/about',
});

const ELSEWHERE = [
  { label: 'Instagram', note: '@chrisocphoto', href: site.links.instagram },
  { label: 'Probably Fine Studios', note: 'The developer half', href: site.links.studio },
];

export default async function AboutPage() {
  const rows = (await getInitialPhotos()) ?? [];
  const places = new Set(rows.map((row) => row.location_name?.trim()).filter(Boolean));
  const latest = rows.slice(0, 6).map((row) => ({
    id: row.id,
    thumbUrl: row.r2_thumb_url,
    place: row.location_name?.trim() || null,
  }));

  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      <main id="main" className="safe-x mx-auto w-full max-w-6xl flex-1 pb-24 pt-14 sm:pt-24">
        {/* The headline is Chris's own line, from the last paragraph below */}
        <header className="max-w-4xl">
          <p className="eyebrow animate-rise">About</p>
          <h1
            className="mt-5 animate-rise font-display text-[2.6rem] font-light leading-[1.08] tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl"
            style={{ animationDelay: '80ms' }}
          >
            {site.tagline}
          </h1>
          <div className="mt-9 h-px w-24 animate-rise bg-spectrum" style={{ animationDelay: '160ms' }} />
        </header>

        <div className="mt-12 grid gap-14 sm:mt-16 lg:grid-cols-12 lg:gap-8">
          {/* About text */}
          <article className="max-w-2xl animate-rise space-y-6 lg:order-2 lg:col-span-7 lg:col-start-6 lg:max-w-none" style={{ animationDelay: '240ms' }}>
            <p className="text-xl font-light leading-relaxed text-neutral-100 sm:text-2xl sm:leading-relaxed">
              I started in the Polaroid era, back when a photo only meant something if you didn’t overexplain it.
              One image, one place, one caption — that was the whole rule, and honestly it still is. I just carried
              it with me through everything that came after.
            </p>

            <p className="text-[17px] leading-[1.8] text-neutral-300">
              The Instagram era is where I actually learned to see — feed by feed, frame by frame, figuring out
              what’s worth keeping and what’s just noise. Now I’m somewhere new, pulling that same film-era instinct
              into a digital world. DSLR at home. Phone when work hands me a ticket with no warning. GoPro when I’m
              not thinking, just moving. Doesn’t matter what’s in my hand — the eye’s the same eye it’s always been.
            </p>

            <p className="text-[17px] leading-[1.8] text-neutral-300">
              I’m not chasing a look or a career. I’m just still doing the one thing that’s never changed: one frame,
              one place, one true line under it. Everything else is just the world catching up to how I already see it.
            </p>

            <p className="pt-4">
              <Link href="/contact" className="button-secondary">
                Come say hi
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </p>
          </article>

          <aside className="animate-rise lg:order-1 lg:col-span-4" style={{ animationDelay: '320ms' }}>
            <div className="lg:sticky lg:top-28">
              <p className="font-display text-xl font-light leading-snug text-white">
                Photographer. Developer. Traveler. Futbol is life.
              </p>

              {rows.length > 0 && (
                <dl className="mt-9 grid grid-cols-2 gap-6 border-t border-white/10 pt-8">
                  <div className="flex flex-col-reverse justify-end">
                    <dt className="eyebrow mt-2">Photos</dt>
                    <dd className="font-display text-4xl font-light tabular-nums tracking-tight text-white">{rows.length}</dd>
                  </div>
                  <div className="flex flex-col-reverse justify-end">
                    <dt className="eyebrow mt-2">Places</dt>
                    <dd className="font-display text-4xl font-light tabular-nums tracking-tight text-white">{places.size}</dd>
                  </div>
                </dl>
              )}

              {/* External links */}
              <div className="mt-9 border-t border-white/10 pt-8">
                <h2 className="eyebrow font-sans">Elsewhere</h2>
                <ul className="mt-3">
                  {ELSEWHERE.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex items-center justify-between gap-4 border-b border-white/10 py-3.5"
                      >
                        <span>
                          <span className="block text-[15px] text-neutral-100 transition-colors duration-200 group-hover:text-white">
                            {link.label}
                            <span className="sr-only"> (opens in a new tab)</span>
                          </span>
                          <span className="block text-[13px] text-neutral-400">{link.note}</span>
                        </span>
                        <IconArrowUpRight className="h-[18px] w-[18px] shrink-0 text-neutral-500 transition-all duration-300 ease-swift group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* The six newest photos, straight from the library. Each opens in the viewer. */}
        {latest.length > 0 && (
          <section aria-labelledby="latest-heading" className="mt-20 border-t border-white/10 pt-10 sm:mt-28">
            <div className="flex items-baseline justify-between gap-6">
              <h2 id="latest-heading" className="eyebrow font-sans">Latest frames</h2>
              <Link href="/" className="text-link text-sm">
                See all {rows.length}
              </Link>
            </div>
            <LatestFrames frames={latest} />
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  );
}
