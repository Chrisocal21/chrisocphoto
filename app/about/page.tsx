import Menu from '../components/Menu';

export default function AboutPage() {
  return (
    <div className="fixed inset-0 bg-[#0a0f14]">
      <Menu />
      
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex items-center justify-center px-4 py-16">
          <article className="max-w-2xl w-full">
            {/* Logo */}
            <div className="mb-8 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/Logo-Vertical.png" 
                alt="ChrisOCPhoto" 
                className="w-32 opacity-90"
                style={{ mixBlendMode: 'screen', filter: 'brightness(1.1) contrast(1.05)' }}
              />
            </div>

            {/* About text */}
            <div className="space-y-5 text-white/75 leading-relaxed text-[15px] font-light">
              <p>
                I started in the Polaroid era, back when a photo only meant something if you didn't overexplain it. 
                One image, one place, one caption — that was the whole rule, and honestly it still is. I just carried 
                it with me through everything that came after.
              </p>
              
              <p>
                The Instagram era is where I actually learned to see — feed by feed, frame by frame, figuring out 
                what's worth keeping and what's just noise. Now I'm somewhere new, pulling that same film-era instinct 
                into a digital world. DSLR at home. Phone when work hands me a ticket with no warning. GoPro when I'm 
                not thinking, just moving. Doesn't matter what's in my hand — the eye's the same eye it's always been.
              </p>
              
              <p>
                I'm not chasing a look or a career. I'm just still doing the one thing that's never changed: one frame, 
                one place, one true line under it. Everything else is just the world catching up to how I already see it.
              </p>
              
              <p className="text-white/90 font-normal pt-2">
                Photographer. Developer. Traveler. Futbol is life.
              </p>
            </div>

            {/* External links */}
            <div className="mt-12 flex justify-center gap-6">
              <a
                href="https://instagram.com/chrisocphoto"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white/80 transition-colors text-sm"
              >
                Instagram
              </a>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
