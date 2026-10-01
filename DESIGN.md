# How this site looks

Read this before changing anything visual. It applies to people and to AI.

The whole design follows from one line: get out of the way of the images. The grid is the site, the map is a bonus, and everything else is there to help someone look at a photo.

## The rules

1. **The photos are the color.** Everything around them is black, white, and gray. The only accent is the spectrum from the "OC" in the logo, and it only ever appears as a thin line or a small mark.
2. **Nothing sits on a photo except a capsule.** The logo, the menu button, the page counter, and the arrows are small frosted pills. No bars, no banners, no dark bands across the top of the grid.
3. **Two typefaces.** Sora for headings, always light. Inter for everything else.
4. **One control size.** Every button that floats over a photo or the map is 44px tall, which is also a comfortable tap target on a phone.
5. **Readable grays only.** Anything meant to be read is `neutral-400` or lighter on black. Fainter grays are for icons and dividers.
6. **Motion is short and optional.** Things ease in over a fraction of a second. Visitors who ask their device for reduced motion get none.
7. **SVG icons only, no emoji.** One set, one stroke width, in `app/components/icons.tsx`.

## The pieces

| What | Value | Where it is set |
| :--- | :--- | :--- |
| Background | `#000` | `app/layout.tsx` (body) |
| Raised surfaces | `neutral-950` at 90%, blurred | menu, details card, places list |
| Hairlines | white at 7 to 10% | borders and dividers |
| Body text | `neutral-300` | |
| Secondary text | `neutral-400` | |
| Spectrum | nine stops sampled from the logo | `--spectrum` in `app/globals.css` |
| Heading font | Sora, weight 300 | `app/layout.tsx`, `tailwind.config.ts` |
| Text font | Inter | same |
| Easing | `cubic-bezier(0.16, 1, 0.3, 1)` (`ease-swift`) | `tailwind.config.ts` |

Reusable classes, all in `app/globals.css`:

| Class | Use it for |
| :--- | :--- |
| `.eyebrow` | The small uppercase label above a heading or a group of links |
| `.glass` | The frosted surface for anything floating over a photo or the map |
| `.chrome-button` | Round icon buttons: menu, close, back, previous, next |
| `.button-primary`, `.button-secondary` | The white button and the outlined one |
| `.field` | Text inputs |
| `.text-link` | A link inside a sentence |

Tailwind 3 only generates opacity steps of 5 (`/5`, `/10`, `/15`). Anything in between, such as `border-white/8`, silently does nothing. Write `border-white/[0.08]` instead.

## The logo files

`public/Logo-Horizontal.png` and `public/Logo-Vertical.png` are the originals. Everything else is made from them by one script:

```bash
npm run brand
```

It writes the header logo (`public/brand/`), the app icons (`public/icons/`), the browser tab icons, and the link-preview card (in `app/`). Run it only if the logo changes.

## How the pages are put together

| Page | Header | Notes |
| :--- | :--- | :--- |
| Grid (`/`) | Floating capsules | Nine photos a screen, paged sideways. Counter at the bottom, spectrum line shows how far through you are |
| Map (`/map`) | Floating capsules, plus a back button | The count at the bottom opens a list of every place |
| About, Contact, 404 | Solid bar | A page of text, with a one-line footer |
| Admin | Solid bar | Private. Same greys and type, layout unchanged |

`app/components/SiteHeader.tsx` draws both kinds of header. `PhotoViewer.tsx` is shared by the grid and the map.

## Things the site does that are easy to break

- **Photos are in the page before any JavaScript runs.** Pages are built ahead of time from the database and refreshed every 60 seconds (`lib/photo-store.ts`). Once loaded, the page asks `/api/photos` for anything newer, so a new upload still appears on open tabs within 30 seconds.
- **The grid loads in three steps:** the top row, then the rest of the first screen, then one page ahead of the visitor. Loading all of it at once is slower where it matters, on a phone.
- **The grid photos fade in, and the fade earns its place.** It looks like a nicety you could drop for speed. Dropping it was tried and measured: nothing appeared sooner, and the phone score fell from about 88 to about 78, because the browser then times a second-row photo instead of a top-row one. The note is on the `tile-in` animation in `tailwind.config.ts`.
- **The thumbnails on the About page wait until you scroll near them** (`app/components/LatestFrames.tsx`). They sit about three screens down on a phone, and the browser's own lazy loading fetched all six anyway.
- **The open photo lives in the address** as `?photo=<id>` (`lib/use-photo-param.ts`). That is what makes Back close the viewer and what makes a single photo shareable.
- **Opening a photo grows it out of its place in the grid.** That is a view transition (`lib/view-transition.ts`, plus the rules at the bottom of `app/globals.css`). Browsers without it just swap screens.
- **The map token only works from approved addresses.** `localhost:3000` is one of them, so the map will not load from another port.

## Words

The voice guide for everything Chris publishes is `VOICE.md` in the `probablyfinestudios` repo. The short version: he is the butt of the joke, the facts stay straight, and anything a visitor needs in order to act is plain before it is clever.

The About text is Chris's own and was not rewritten. Its last line became the headline.

These lines were written in his voice on October 1, 2026 and are drafts until he has read them:

| Where | Line |
| :--- | :--- |
| Footer | "Shot on whatever was in my hand." |
| About, link list | "Probably Fine Studios: The developer half" |
| About | "Come say hi" |
| Contact | "A question about a photo, a place I should point a camera at, or just a hello. I read everything. (It's a small inbox.)" |
| Contact, after sending | "Sent. I'll get back to you by email. Cheers!" |
| Contact, if it fails | "That didn't send. Give it another go in a minute." |
| 404 | "Lens cap's still on." and "Nothing at this address. It moved, it never existed, or I broke it." |
| Error page | "That wasn't supposed to happen. Probably my fault." |
| Grid, last empty tile | "That's all of them. So far." |
| Grid, if photos fail to load | "If it keeps happening, I probably broke something." |
| Map, search with no match | "Nothing by that name. Yet." |
| Admin sign-in | "Staff only. (It's a staff of one.)" |

## Checked on October 1, 2026

Measured with Lighthouse on a simulated phone, against the live site before this pass went out and again after.

| Page | Performance before | after | Accessibility before | after |
| :--- | :--- | :--- | :--- | :--- |
| Grid | 84 | 87 | 100 | 100 |
| About | 93 | 99 | 95 | 100 |
| Contact | 86 | 99 | 100 | 100 |

Best practices and SEO are 100 on all three, before and after. On a desktop every page scores 96 to 100.

Lighthouse moves a few points between runs, and by more on a page's first visit after a deploy. The grid varies the most: six runs of a production build on this machine gave a median of 88 and a range of 86 to 96.

The number that matters more than the score: on a normal connection the first photo used to appear after about a second and a half, because the page had to load, then ask for the list of photos, then fetch them. It now appears in about a quarter of a second, because the photos are already in the page.

What is left on the grid is the thumbnails themselves. They are 800px wide, and a tile on a phone is about 130px wide. Serving them at the size they are shown is the one change that would move that score much further, and it is a storage decision, not a styling one.
