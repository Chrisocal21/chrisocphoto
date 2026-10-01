import Link from 'next/link';
import Brand from './Brand';
import Menu from './Menu';
import { IconChevronLeft } from './icons';

type Props = {
  /**
   * `overlay` floats the logo and menu over a full-screen photo grid or map, each in its own
   * frosted capsule, with nothing else in the way. `bar` is a solid strip for pages of text,
   * so words never scroll under the logo.
   */
  variant?: 'overlay' | 'bar';
  /** Shows a back button before the logo. */
  back?: { href: string; label: string };
};

export default function SiteHeader({ variant = 'bar', back }: Props) {
  const overlay = variant === 'overlay';

  return (
    <header
      className={
        overlay
          ? 'pointer-events-none fixed inset-x-0 top-0 z-[500]'
          : 'sticky top-0 z-[500] border-b border-white/[0.07] bg-black/75 backdrop-blur-xl'
      }
    >
      <div className="safe-top">
        <div className={`safe-x flex h-[4.5rem] items-center justify-between gap-4 ${overlay ? '' : 'mx-auto max-w-6xl'}`}>
          <div className="pointer-events-auto flex min-w-0 items-center gap-2">
            {back && (
              <Link href={back.href} className="chrome-button" aria-label={back.label}>
                <IconChevronLeft className="h-[18px] w-[18px]" />
              </Link>
            )}
            <Brand capsule={overlay} />
          </div>
          <div className="pointer-events-auto">
            <Menu />
          </div>
        </div>
      </div>
    </header>
  );
}
