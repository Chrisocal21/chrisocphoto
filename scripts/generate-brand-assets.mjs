// Regenerates every logo-derived file from the two source logos in public/.
// Run with: npm run brand   (only needed if the logo changes)
//
// The source logos are large PNGs on a solid black background. The site needs them
// small, transparent, and in a few shapes:
//
//   public/brand/lockup-{1,2,3}x.webp   lens + wordmark, for the header
//   public/brand/mark.webp              the lens on its own
//   public/icons/icon-{192,512}.png     app icons for the web manifest
//   public/icons/icon-maskable-512.png  the same, with room for Android's icon mask
//   app/favicon.ico, app/icon.png       browser tab icons
//   app/apple-icon.png                  iOS home-screen icon
//   app/opengraph-image.png             link-preview card
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const HORIZONTAL = 'public/Logo-Horizontal.png';
const VERTICAL = 'public/Logo-Vertical.png';
const BACKGROUND = '#000000';

// Where the artwork sits inside each source file (measured from the pixels).
// `lens` is the circle the outer "C" ring follows; the glass itself is LENS_RATIO of that radius.
const LAYOUT = {
  horizontal: { lockup: { left: 155, top: 304, right: 1641, bottom: 620 }, lens: { cx: 313.2, cy: 462.1, r: 157.3 }, wordmarkFrom: 500 },
  vertical: { lens: { cx: 634.0, cy: 489.1, r: 250.8 } },
};
const LENS_RATIO = 0.732;

// The spectrum on the "OC" in the wordmark, sampled from the logo. Also used as the site's accent (app/globals.css).
const SPECTRUM = ['#ec04b4', '#9b23e7', '#5353e6', '#1f83e3', '#1bbddd', '#63bf69', '#faf402', '#ff692a', '#fd3053'];

/**
 * Turns "artwork on black" into "artwork on transparent". Each pixel's opacity comes from its
 * brightness, and its colour is brightened to compensate, so the result looks identical on black
 * and blends cleanly on anything else. `solidAbove` is the brightness that counts as fully opaque;
 * `lens` keeps the whole lens glass solid so photos never show through the dark parts of it.
 */
async function knockOutBlack(file, { solidAbove, lens, lensOnlyLeftOf = Infinity, wordmarkSolidAbove = solidAbove }) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  const lensRadius = lens ? lens.r * LENS_RATIO : 0;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * channels;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const brightness = Math.max(r, g, b);
      const inMark = x < lensOnlyLeftOf;

      // Below this the "black" background is only compression noise.
      let alpha = brightness < 6 ? 0 : Math.min(1, brightness / (inMark ? solidAbove : wordmarkSolidAbove));
      if (lens && inMark) {
        const distance = Math.hypot(x + 0.5 - lens.cx, y + 0.5 - lens.cy);
        alpha = Math.max(alpha, Math.min(1, Math.max(0, lensRadius + 0.5 - distance)));
      }

      const o = (y * width + x) * 4;
      if (alpha > 0) {
        out[o] = Math.min(255, Math.round(r / alpha));
        out[o + 1] = Math.min(255, Math.round(g / alpha));
        out[o + 2] = Math.min(255, Math.round(b / alpha));
        out[o + 3] = Math.round(alpha * 255);
      }
    }
  }
  return sharp(out, { raw: { width, height, channels: 4 } }).png().toBuffer();
}

/** A square icon: `glyph` centred on a dark tile, filling `fill` of the width. Square tiles come out fully opaque. */
async function icon(glyph, size, { fill, rounded }) {
  const inner = Math.round(size * fill);
  const resized = await sharp(glyph).resize(inner, inner, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
  const radius = rounded ? Math.round(size * 0.22) : 0;
  const tile = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="${BACKGROUND}"/></svg>`,
  );
  const offset = Math.round((size - inner) / 2);
  const composed = sharp(tile).composite([{ input: resized, left: offset, top: offset }]);
  if (!rounded) composed.flatten({ background: BACKGROUND });
  return composed.png({ compressionLevel: 9, effort: 10 }).toBuffer();
}

/** Wraps a PNG in a single-image .ico container. */
function ico(png, size) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // image count
  header.writeUInt8(size, 6); // width
  header.writeUInt8(size, 7); // height
  header.writeUInt8(0, 8); // palette
  header.writeUInt8(0, 9); // reserved
  header.writeUInt16LE(1, 10); // color planes
  header.writeUInt16LE(32, 12); // bits per pixel
  header.writeUInt32LE(png.length, 14); // image size
  header.writeUInt32LE(22, 18); // image offset
  return Buffer.concat([header, png]);
}

await mkdir('public/brand', { recursive: true });
await mkdir('public/icons', { recursive: true });

// ── Header lockup: lens + wordmark, cropped tight ────────────────────────────
const { lockup, lens: horizontalLens, wordmarkFrom } = LAYOUT.horizontal;
const horizontalCutout = await knockOutBlack(HORIZONTAL, {
  solidAbove: 96,
  wordmarkSolidAbove: 235,
  lens: horizontalLens,
  lensOnlyLeftOf: wordmarkFrom,
});
const pad = 2;
const lockupArt = await sharp(horizontalCutout)
  .extract({
    left: lockup.left - pad,
    top: lockup.top - pad,
    width: lockup.right - lockup.left + 1 + pad * 2,
    height: lockup.bottom - lockup.top + 1 + pad * 2,
  })
  .png()
  .toBuffer();
const lockupMeta = await sharp(lockupArt).metadata();
const LOCKUP_HEIGHT = 28;
for (const scale of [1, 2, 3]) {
  await sharp(lockupArt)
    .resize({ height: LOCKUP_HEIGHT * scale })
    .webp({ quality: 90, alphaQuality: 100, effort: 6 })
    .toFile(`public/brand/lockup-${scale}x.webp`);
}
const lockupWidth = Math.round((lockupMeta.width / lockupMeta.height) * LOCKUP_HEIGHT);

// ── The lens on its own, from the larger artwork in the vertical logo ────────
const verticalLens = LAYOUT.vertical.lens;
const verticalCutout = await knockOutBlack(VERTICAL, { solidAbove: 96, lens: verticalLens, lensOnlyLeftOf: Infinity });
const half = Math.ceil(verticalLens.r) + 3;
const mark = await sharp(verticalCutout)
  .extract({ left: Math.round(verticalLens.cx) - half, top: Math.round(verticalLens.cy) - half, width: half * 2, height: half * 2 })
  .png()
  .toBuffer();
await sharp(mark).resize(256, 256).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile('public/brand/mark.webp');

// ── Icons ────────────────────────────────────────────────────────────────────
await writeFile('app/favicon.ico', ico(await icon(mark, 48, { fill: 0.84, rounded: true }), 48));
await writeFile('app/icon.png', await icon(mark, 96, { fill: 0.84, rounded: true }));
await writeFile('app/apple-icon.png', await icon(mark, 180, { fill: 0.74, rounded: false }));
await writeFile('public/icons/icon-192.png', await icon(mark, 192, { fill: 0.8, rounded: true }));
await writeFile('public/icons/icon-512.png', await icon(mark, 512, { fill: 0.8, rounded: true }));
// Android crops maskable icons to a circle or squircle; the artwork stays inside the middle 60%.
await writeFile('public/icons/icon-maskable-512.png', await icon(mark, 512, { fill: 0.58, rounded: false }));

// ── Link-preview card: the lockup on black, with the spectrum as a hairline ──
const OG = { width: 1200, height: 630 };
const ogLockup = await sharp(lockupArt).resize({ width: 720 }).png().toBuffer();
const ogLockupMeta = await sharp(ogLockup).metadata();
const stops = SPECTRUM.map((color, index) => `<stop offset="${((index / (SPECTRUM.length - 1)) * 100).toFixed(1)}%" stop-color="${color}"/>`).join('');
const card = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${OG.width}" height="${OG.height}">
    <defs><linearGradient id="spectrum" x1="0" x2="1" y1="0" y2="0">${stops}</linearGradient></defs>
    <rect width="${OG.width}" height="${OG.height}" fill="${BACKGROUND}"/>
    <rect x="0" y="${OG.height - 6}" width="${OG.width}" height="6" fill="url(#spectrum)"/>
  </svg>`,
);
await sharp(card)
  .composite([{ input: ogLockup, left: Math.round((OG.width - ogLockupMeta.width) / 2), top: Math.round((OG.height - ogLockupMeta.height) / 2) - 3 }])
  .flatten({ background: BACKGROUND })
  .png({ compressionLevel: 9, effort: 10 })
  .toFile('app/opengraph-image.png');

console.log(`Brand assets written. The header lockup is ${lockupWidth}x${LOCKUP_HEIGHT} at 1x (app/components/Brand.tsx).`);
