import type { Metadata } from 'next';

/** Site-wide facts used by the layout, navigation, metadata, sitemap, and link previews. */
export const site = {
  name: 'ChrisOCPhoto',
  /** The apex domain redirects here, so canonical URLs use www. */
  url: 'https://www.chrisocphoto.com',
  author: 'Chris',
  /** Chris's own line, from the About page. */
  tagline: 'One frame, one place, one true line under it.',
  description:
    'A photo journal by Chris. One frame, one place, one true line under it. Page through the grid, or wander the map to see where each shot was taken.',
  links: {
    instagram: 'https://instagram.com/chrisocphoto',
    studio: 'https://probablyfinestudios.com',
  },
};

/** The link-preview card (app/opengraph-image.png). Named here because a page that sets its own preview text has to restate the image. */
const previewImage = {
  url: '/opengraph-image.png',
  width: 1200,
  height: 630,
  alt: `${site.name}: the camera lens logo and wordmark on black.`,
};

/** Title, description, canonical URL, and link-preview tags for one page. */
export function pageMetadata({
  title,
  description = site.description,
  path,
}: {
  /** Leave out on the homepage to use the site's default title. */
  title?: string;
  description?: string;
  path: string;
}): Metadata {
  const fullTitle = title ? `${title} | ${site.name}` : undefined;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: path },
    openGraph: {
      type: 'website',
      siteName: site.name,
      locale: 'en_US',
      url: path,
      ...(fullTitle ? { title: fullTitle } : {}),
      description,
      images: [previewImage],
    },
    twitter: {
      card: 'summary_large_image',
      ...(fullTitle ? { title: fullTitle } : {}),
      description,
      images: [previewImage],
    },
  };
}
