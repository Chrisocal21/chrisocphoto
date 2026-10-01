import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { site } from "@/lib/site";

// Both fonts are downloaded at build time and served from this site, so no visitor's
// browser ever talks to Google. Each comes with a size-matched fallback to avoid layout shift.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const sora = Sora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sora",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | A photo journal by ${site.author}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  authors: [{ name: site.author, url: `${site.url}/about` }],
  creator: site.author,
  openGraph: {
    type: "website",
    siteName: site.name,
    locale: "en_US",
    description: site.description,
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/** schema.org description of the site and its author, for search engines. */
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: site.name,
  url: `${site.url}/`,
  description: site.description,
  author: {
    "@type": "Person",
    name: site.author,
    url: `${site.url}/about`,
    sameAs: [site.links.instagram, site.links.studio],
  },
};

/** Where the photos are served from, so the browser can open that connection early. */
function photoOrigin(): string | null {
  try {
    return new URL(process.env.CLOUDFLARE_R2_PUBLIC_URL ?? "").origin;
  } catch {
    return null;
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const photos = photoOrigin();

  return (
    <html lang="en" className={`${inter.variable} ${sora.variable}`}>
      <body className="bg-black font-sans text-white antialiased">
        {photos && <link rel="preconnect" href={photos} />}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Skip to content
        </a>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
        />
      </body>
    </html>
  );
}
