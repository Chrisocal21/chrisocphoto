'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="safe-x mx-auto flex min-h-dvh max-w-3xl flex-col items-center justify-center py-20 text-center">
      <p className="eyebrow">Something broke</p>
      <h1 className="mt-5 font-display text-3xl font-light tracking-[-0.03em] text-white sm:text-5xl">
        That wasn’t supposed to happen.
      </h1>
      <p className="mt-5 text-lg leading-relaxed text-neutral-400">
        Probably my fault. Give it another go, and if it keeps happening, the photos are still where you left them.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="button-primary">
          Try again
        </button>
        <Link href="/" className="button-secondary">
          Back to the photos
        </Link>
      </div>
    </main>
  );
}
