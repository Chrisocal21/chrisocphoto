'use client';

import { flushSync } from 'react-dom';

type ViewTransition = { finished: Promise<void>; ready: Promise<void> };
type TransitionDocument = Document & { startViewTransition?: (update: () => void) => ViewTransition };

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Applies a state change and, where the browser supports it, animates between the two
 * screens. `from` and `to` name the grid thumbnail that should morph into the viewer's frame
 * (opening) or that the frame should morph back into (closing). The frame carries the shared
 * name permanently (.viewer-frame in globals.css), so only the thumbnail is tagged here.
 *
 * While a morph runs, <html data-photo-transition="open|close"> tells the stylesheet which
 * side holds the whole photo, so it can show that one alone instead of cross-fading it with
 * the cropped thumbnail (which reads as a ghosted double image).
 *
 * Without view transitions, or when the visitor prefers reduced motion, the change just happens.
 */
export function morph(update: () => void, tag: { from?: HTMLElement | null; to?: () => HTMLElement | null } = {}) {
  const doc = document as TransitionDocument;
  if (!doc.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }

  const root = document.documentElement;
  let tagged: HTMLElement | null = null;
  if (tag.from) tag.from.style.setProperty('view-transition-name', 'photo');

  const transition = doc.startViewTransition(() => {
    flushSync(update);
    if (tag.from) {
      tag.from.style.removeProperty('view-transition-name');
      // Only a morph if the viewer's frame is already there to grow into
      if (document.querySelector('.viewer-frame')) root.dataset.photoTransition = 'open';
    }
    tagged = tag.to?.() ?? null;
    if (tagged) {
      tagged.style.setProperty('view-transition-name', 'photo');
      root.dataset.photoTransition = 'close';
    }
  });

  const tidy = () => {
    tag.from?.style.removeProperty('view-transition-name');
    tagged?.style.removeProperty('view-transition-name');
    delete root.dataset.photoTransition;
  };
  transition.finished.then(tidy, tidy);
  // A transition that gets skipped (hidden tab, a second one starting) rejects `ready`. That is fine.
  transition.ready.catch(() => {});
}
