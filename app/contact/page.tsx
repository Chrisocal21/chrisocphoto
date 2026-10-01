import type { Metadata } from 'next';
import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import ContactForm from '../components/ContactForm';
import { IconArrowUpRight } from '../components/icons';
import { pageMetadata, site } from '@/lib/site';

export const metadata: Metadata = pageMetadata({
  title: 'Contact',
  description: 'Get in touch with Chris. A question about a photo, a place worth photographing, or just a hello. It goes straight to his inbox.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />

      {/* On a phone the order is intro, form, other links. On wide screens the form sits to the
          right, spanning both rows, with the other links tucked under the intro. */}
      <main
        id="main"
        className="safe-x mx-auto grid w-full max-w-6xl flex-1 content-start gap-x-8 gap-y-12 pb-24 pt-14 sm:pt-24 lg:grid-cols-12 lg:grid-rows-[auto_1fr] lg:gap-y-10"
      >
        <div className="lg:col-span-5">
          <p className="eyebrow animate-rise">Contact</p>
          <h1
            className="mt-5 animate-rise font-display text-[2.6rem] font-light leading-[1.08] tracking-[-0.035em] text-white sm:text-6xl"
            style={{ animationDelay: '80ms' }}
          >
            Get in touch
          </h1>
          <div className="mt-9 h-px w-24 animate-rise bg-spectrum" style={{ animationDelay: '160ms' }} />
          <p className="mt-9 max-w-md animate-rise text-lg font-light leading-relaxed text-neutral-300 sm:text-xl sm:leading-relaxed" style={{ animationDelay: '240ms' }}>
            A question about a photo, a place I should point a camera at, or just a hello. I read everything.
            (It’s a small inbox.)
          </p>
        </div>

        <div className="animate-rise lg:col-span-6 lg:col-start-7 lg:row-span-2" style={{ animationDelay: '240ms' }}>
          <ContactForm />
        </div>

        <div className="max-w-md animate-rise border-t border-white/10 pt-8 lg:col-span-5 lg:self-start" style={{ animationDelay: '320ms' }}>
          <h2 className="eyebrow font-sans">Elsewhere</h2>
          <a
            href={site.links.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="group mt-3 flex items-center justify-between gap-4 border-b border-white/10 py-3.5"
          >
            <span>
              <span className="block text-[15px] text-neutral-100 transition-colors duration-200 group-hover:text-white">
                Instagram
                <span className="sr-only"> (opens in a new tab)</span>
              </span>
              <span className="block text-[13px] text-neutral-400">@chrisocphoto</span>
            </span>
            <IconArrowUpRight className="h-[18px] w-[18px] shrink-0 text-neutral-500 transition-all duration-300 ease-swift group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" />
          </a>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
