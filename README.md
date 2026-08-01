# shannonmurdoch.com

Product design portfolio. Plain HTML + CSS + a little vanilla JS. **No build step, no dependencies.**

## Structure

```
index.html                              Home — hero, numbers, work, testimonials, the loop, what I'm looking for
about.html                              About — process, career, stack, currently researching, interests
work.html                               Case study index
work/paired-flight-modal.html           Case study 01
work/mobile-flight-purchase-path.html   Case study 02
work/ui-pattern-library.html            Case study 03
work/web3connect.html                   Case study 04 (outline — full write-up pending)
contact.html                            What I'm looking for + how to reach me
404.html                                Served by GitHub Pages on unknown paths
style.css                               Whole design system, one file, sectioned & commented
script.js                               Progressive enhancement only — site works with JS off
images/                                 WebP, all with explicit width/height to avoid layout shift
sitemap.xml, robots.txt, CNAME
```

## Local preview

Paths are relative, so opening `index.html` directly works — but serve over HTTP to match production:

```bash
python -m http.server 8080
# then visit http://localhost:8080
```

## Design system

All tokens live in `:root` at the top of `style.css`. To retheme, change those and nothing else.

- **Colour** — warm paper (`--paper`), near-black ink (`--ink`), one terracotta accent (`--accent`).
  Dark surfaces use `--accent-on-ink` / `--accent-on-ink-strong`, because `--accent` is too dark to
  read on ink. Resting state is the mid tone; interaction moves it toward the light, mirroring how
  `--accent` / `--accent-hover` deepen on light backgrounds. Never hardcode a peach —
  use the tokens, or the two shades drift apart (they already had, at `#E8926F` vs `#EE9B76`).
  Every foreground/background pair used in the site was checked against WCAG AA.
- **Type** — Fraunces (display) + Inter (UI/body), from Google Fonts with `display=swap`.
  Sizes are a fluid clamp scale, `--step--2` through `--step-6`. Don't hard-code font sizes.
- **Spacing** — `--sp-1` … `--sp-10`. Layout width is `--wrap` (74rem) with a fluid `--gutter`.
- **Components** — `.work-card`, `.quote-card`, `.panel`, `.cap`, `.timeline`, `.cs-chapter`,
  `.round`, `.callout` (`--decision` / `--insight` / `--outcome` / `--learn`), `.phone`, `.cs-nav`.

### Gotchas worth knowing before you edit

- `.toc` needs `align-self: start` — a stretched grid item cannot `position: sticky`.
- Bold text on dark surfaces is handled by one explicit rule near the top of `style.css`.
  If you add a new dark section, add its selector there or `<strong>` will render invisible.
- `.work-card__media` **contains** images by default (right for landscape UI screenshots).
  Add `work-card__media--cover` for portrait phone screenshots and photos.
- `.hero__role` dividers are `::before` pseudo-elements so a separator can never dangle at the
  end of a wrapped line.
- The Google Fonts URL must escape its ampersands as `&amp;` or the page fails HTML validation.
- **Inline SVG icons need `width`/`height` attributes in the markup**, not just a CSS size. The global
  `svg { max-width: 100% }` has no intrinsic size to fall back on, so an unsized icon inside a flex or
  block container expands to fill it if the stylesheet is stale, slow or cached. The LinkedIn glyphs
  carry `width="16" height="16"` for exactly this reason — verified by disabling the stylesheet.
- **SVG is deliberately excluded from the `display: block` media reset.** Every icon here lives in a
  flex or grid parent, which blockifies children regardless — but a block-level `svg` element drops
  onto its own line whenever component CSS hasn't applied yet. Leaving SVG inline means icons degrade
  beside their text rather than under it. Don't add `svg` back to that reset.
- **`style.css` and `script.js` are linked with `?v=N`.** Bump the number when you change either file,
  or returning visitors (and aggressive local dev servers) will keep serving the old copy. This bit us
  repeatedly during the build.
- **Measured results use `--positive`, never the terracotta accent.** A rising metric in a warm red
  reads as a loss. `.work-card__outcome` and `.callout--outcome` are green; `.callout--insight` uses
  the lighter `--positive-wash` so the two callout types stay distinguishable. The terracotta accent
  stays for brand, links and emphasis.
- **The work cards are one big link ("stretched link").** `.work-card__title a::after` covers the
  whole card, thumbnail included, and needs its explicit `z-index: 1`. `.work-card__media` is also
  positioned with `z-index: auto`, so without it the two paint in order-modified document order —
  the image covered the overlay on standard cards and `order: -1` flipped it on `--alt` ones, so
  half the thumbnails were dead. Keep the card to exactly one `<a>`; a second link to the same
  destination makes the card announce twice to screen readers.
- `.attr-link__icon` sets **no colour at all**. `fill="currentColor"` makes it inherit the author
  name beside it, in both themes and every state, so the two can't drift apart. That also means
  `.attr-link` is excluded from the generic `.section--ink a:not(.btn)` link tint — without the
  `:not(.attr-link)`, that rule outranks it and recolours the name but not the glyph.

## JavaScript

`script.js` adds: mobile nav, header hairline on scroll, the testimonial carousel, reveal-on-scroll,
case-study reading progress, and TOC active state. All optional — with JS disabled the carousel
degrades to a horizontal scroll-snap list and everything else renders normally.
`prefers-reduced-motion` is respected throughout.

## Content to keep current

- **Testimonial job titles** in `index.html`, `about.html` and `contact.html` — worth verifying before
  a job-search push. Sources: Webjet farewell Kudoboard, Rob Nastos' letter, LinkedIn recommendations.
- **Testimonial LinkedIn links.** Attribution names are wrapped in `<a class="attr-link">` with the
  LinkedIn glyph inside, so name and icon are one target. To add one, follow the existing pattern —
  `target="_blank" rel="noopener noreferrer"` plus the `visually-hidden` "on LinkedIn (opens in a new
  tab)" suffix that gives the link its accessible name. Names with no profile on file stay plain text:
  currently Tara Saxon, Chelsea Lidgerwood, David Pirogov, Lana D, Roger Quinn and Eric.
- **Personal interests** on `about.html` — written from context; worth a pass in your own words.
- **`work/web3connect.html`** — currently an outline with a "write-up in progress" badge.
  Replace the placeholder thumbnail (`images/work/ui-pattern-library/07-hologram-documentation.webp`)
  in `index.html` and `work.html` once real screens are ready.
- **Footer year** — hard-coded, one line per page.
- `images/artefacts-slideshow/` holds the original uncompressed v1 photos. The site now uses the
  optimised copies in `images/artefacts/`, so the old folder can be deleted.

## Deployment

Hosted on **GitHub Pages** from `main` (root). `CNAME` binds the site to `shannonmurdoch.com`.
DNS via Cloudflare (DNS-only, not proxied): four A records to GitHub Pages
(`185.199.108-111.153`) and a `www` CNAME to `cryptomius.github.io`. Pushes to `main` auto-deploy.
