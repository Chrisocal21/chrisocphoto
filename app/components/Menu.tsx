'use client';

import { useState, useEffect, useId, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { site } from '@/lib/site';
import { IconArrowUpRight, IconGrid, IconInfo, IconInstagram, IconMail, IconMap, IconUser } from './icons';

const PAGES = [
  { label: 'Grid', href: '/', icon: IconGrid },
  { label: 'Map', href: '/map', icon: IconMap },
  { label: 'About', href: '/about', icon: IconInfo },
  { label: 'Contact', href: '/contact', icon: IconMail },
];

const EXTERNAL_LINKS = [
  { label: 'Instagram', href: site.links.instagram, icon: IconInstagram },
  // Add more external links here
];

const item = 'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors duration-150';
const itemIdle = 'text-neutral-300 hover:bg-white/[0.06] hover:text-white';
const itemIcon = 'h-[18px] w-[18px] shrink-0 text-neutral-500 transition-colors duration-150 group-hover:text-neutral-300';

export default function Menu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();
  const pathname = usePathname();

  // Close after navigating
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on click outside, on ESC, and when keyboard focus moves on past the menu
  useEffect(() => {
    if (!open) return;
    const outside = (target: EventTarget | null) => !ref.current?.contains(target as Node);
    const onPointerDown = (e: PointerEvent) => {
      if (outside(e.target)) setOpen(false);
    };
    const onFocusIn = (e: FocusEvent) => {
      if (outside(e.target)) setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const onAdmin = pathname.startsWith('/admin');

  return (
    <div ref={ref} className="relative">
      {/* Toggle button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="chrome-button flex-col gap-[5px]"
        aria-label={open ? 'Close menu' : 'Open menu'}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
      >
        <span className={`block h-px w-4 bg-current transition-transform duration-200 ${open ? 'translate-y-[6px] rotate-45' : ''}`} />
        <span className={`block h-px w-4 bg-current transition-opacity duration-200 ${open ? 'opacity-0' : ''}`} />
        <span className={`block h-px w-4 bg-current transition-transform duration-200 ${open ? '-translate-y-[6px] -rotate-45' : ''}`} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <nav
          id={panelId}
          aria-label="Site"
          className="absolute right-0 top-12 w-60 origin-top-right animate-pop rounded-2xl border border-white/10 bg-neutral-950/90 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-xl"
        >
          <ul>
            {PAGES.map(({ label, href, icon: PageIcon }) => {
              const current = pathname === href;
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    aria-current={current ? 'page' : undefined}
                    className={`${item} ${current ? 'bg-white/[0.07] text-white' : itemIdle}`}
                  >
                    <PageIcon className={current ? 'h-[18px] w-[18px] shrink-0 text-white' : itemIcon} />
                    <span className="flex-1">{label}</span>
                    {current && <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-spectrum" />}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mx-3 my-1.5 h-px bg-white/[0.08]" />

          <ul>
            {EXTERNAL_LINKS.map(({ label, href, icon: LinkIcon }) => (
              <li key={href}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={`${item} ${itemIdle}`}
                >
                  <LinkIcon className={itemIcon} />
                  <span className="flex-1">
                    {label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </span>
                  <IconArrowUpRight className="h-4 w-4 text-neutral-500 transition-colors duration-150 group-hover:text-neutral-300" />
                </a>
              </li>
            ))}
          </ul>

          <div className="mx-3 my-1.5 h-px bg-white/[0.08]" />

          <Link
            href="/admin"
            rel="nofollow"
            onClick={() => setOpen(false)}
            aria-current={onAdmin ? 'page' : undefined}
            className={`${item} ${onAdmin ? 'bg-white/[0.07] text-white' : 'text-neutral-400 hover:bg-white/[0.06] hover:text-neutral-200'}`}
          >
            <IconUser className={onAdmin ? 'h-[18px] w-[18px] shrink-0 text-white' : itemIcon} />
            Admin
          </Link>
        </nav>
      )}
    </div>
  );
}
