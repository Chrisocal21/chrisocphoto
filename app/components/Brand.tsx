import Link from 'next/link';
import { site } from '@/lib/site';

type Props = {
  /** Wraps the logo in the same frosted capsule as the other floating controls, for use over photos and the map. */
  capsule?: boolean;
};

/** The logo, linking home. The image files come from scripts/generate-brand-assets.mjs. */
export default function Brand({ capsule = false }: Props) {
  return (
    <Link
      href="/"
      aria-label={`${site.name} home`}
      className={
        capsule
          ? 'glass inline-flex h-11 shrink-0 items-center rounded-full pl-2 pr-[1.125rem] transition-colors duration-200 hover:border-white/30'
          : 'inline-flex shrink-0 items-center rounded-md transition-opacity duration-200 hover:opacity-80'
      }
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/brand/lockup-1x.webp"
        srcSet="/brand/lockup-1x.webp 1x, /brand/lockup-2x.webp 2x, /brand/lockup-3x.webp 3x"
        width={130}
        height={28}
        alt=""
        decoding="async"
      />
    </Link>
  );
}
