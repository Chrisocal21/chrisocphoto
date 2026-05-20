'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const EXTERNAL_LINKS = [
  { label: 'Instagram', href: 'https://instagram.com/chrisocphoto' },
  // Add more external links here
];

export default function Menu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const onMap = pathname === '/map';

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <div ref={ref} className="fixed top-5 right-5 z-[500]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 flex flex-col items-center justify-center gap-[5px] rounded-full bg-black/40 backdrop-blur-sm border border-white/10 hover:border-white/25 transition-colors group"
        aria-label="Menu"
      >
        <span className={`block w-4 h-px bg-white/60 transition-all duration-200 ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
        <span className={`block w-4 h-px bg-white/60 transition-all duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block w-4 h-px bg-white/60 transition-all duration-200 ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute top-11 right-0 w-48 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl overflow-hidden shadow-xl">
          {/* Logo */}
          <div className="px-4 pt-3.5 pb-2.5 border-b border-white/8">
            <span className="text-white/80 text-sm font-semibold tracking-wide">ChrisOCPhoto</span>
          </div>
          <nav className="py-1.5">
            {onMap ? (
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-50">
                  <rect x="1" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="7.5" y="1" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="1" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                </svg>
                Grid
              </Link>
            ) : (
              <Link
                href="/map"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-50">
                  <path d="M1 3.5L5 2L9 4L13 2.5V11L9 12.5L5 10.5L1 12V3.5Z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="none"/>
                  <circle cx="5" cy="6" r="1.2" fill="currentColor"/>
                </svg>
                Map
              </Link>
            )}

            <div className="h-px bg-white/8 mx-3 my-1" />

            {EXTERNAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-50">
                  <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="7" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="10.5" cy="3.5" r="0.75" fill="currentColor"/>
                </svg>
                {link.label}
              </a>
            ))}

            <div className="h-px bg-white/8 mx-3 my-1" />

            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="opacity-50">
                <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M1.5 12.5c0-3.038 2.462-5.5 5.5-5.5s5.5 2.462 5.5 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Admin
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
