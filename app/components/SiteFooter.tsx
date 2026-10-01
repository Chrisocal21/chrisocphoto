import { site } from '@/lib/site';

/** One quiet line under pages of text. The photo grid and the map run edge to edge and have no footer. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.07]">
      <div className="safe-x mx-auto flex max-w-6xl flex-col gap-2 py-8 text-[13px] text-neutral-400 sm:flex-row sm:items-center sm:justify-between">
        <p>
          &copy; {new Date().getFullYear()} {site.name}
          <span className="mx-2 text-neutral-600" aria-hidden="true">·</span>
          Shot on whatever was in my hand.
        </p>
        <p>
          Built by{' '}
          <a href={site.links.studio} target="_blank" rel="noopener noreferrer" className="text-link">
            Probably Fine Studios
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </p>
      </div>
    </footer>
  );
}
