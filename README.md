# hybrid.cam — v2 build

Escrowed peer-to-peer camera marketplace for Metro Manila. Static HTML, no build
step, no framework. Version 2 adds a full landing page, product detail modals,
simulated feature graphics, a delivery wizard, meet-up scheduling, MapLibre live
tracking, an admin console and a source-file browser.

## Folders

- `hybrid-cam-v1/` — the original build, compiled unchanged for reference.
- `hybrid-cam-v2/` — this build.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Landing page (the page h1 is the first carousel slide): h1 caption + 4-slide hero carousel (a distinct animated graphic per slide: camera, escrow vault, inspection sheet, meet-up radar), about timeline, product grid + detail modals, feature sims, 3x3 services with animated icons, how-to simulation, tabbed delivery / meet-up wizard with ID + face + OTP verification, testimonial coverflow, contact desk with direct call, CTA art, discounts & rewards popup (bottom right) |
| `shop.html` | Inventory search: free text + category chips + brand, price, condition and sort |
| `protocol.html` | The seven escrow checkpoints |
| `sellers.html` | Seller onboarding, payouts, FAQ |
| `track.html` | Live rider tracking (MapLibre) + status timeline + OTP release |
| `login.html` | Static staff sign-in page for the admin console and source tools (the Company menu also raises an in-page credential prompt) |
| `admin.html` | Business management console (gated) — 7 views, tables paginated at 10 entries per page, sidebar collapses to a labelled dropdown on mobile |
| `source.html` | File directory: view source or live preview, copy to clipboard, clear (gated) |
| `404.html` | Not-found page |

## Assets

| File | Purpose |
| --- | --- |
| `assets/css/main.css` | v1 stylesheet: tokens, base, layout, components, light theme |
| `assets/css/v2.css` | v2 additive layer (slider, rig, products, forms, admin, browser) |
| `assets/js/main.js` | Shared header/footer partials, theme, marquee, reveal, stepper, modal |
| `assets/js/v2.js` | v2 nav config, content data and modules (slider, product modal, sims, wizard, meet-up, map) |
| `assets/js/gate.js` | Shared static access gate (sessionStorage, scope per account) |
| `assets/js/admin.js` | Admin console views |
| `assets/js/source.js` | Source browser (fetch, copy, clear, preview) |

## Conventions

- **BEM** naming throughout: `block__element--modifier`. Layout primitives are
  prefixed `l-`, utilities `u-`, state classes `is-`.
- **Tokens only** for colour, radius, spacing and shadow — both themes flip from
  the same `:root` / `[data-theme="light"]` token sets.
- **Progressive enhancement**: pages render without JS (partials aside), and
  every animation is disabled under `prefers-reduced-motion: reduce`.
- **Accessibility**: single `h1` per page, skip link, visible focus rings,
  `aria-live` on the slider/wizard/map readouts, 44px minimum hit targets, all
  text at 4.5:1 or better in both themes.
- **Vendor prefixes** written by hand in the same style as v1 (autoprefixer
  targets: last 2 versions, iOS 12+, not dead).

## Local run

Serve the folder over http (the source browser reads files with `fetch`, which
`file://` blocks):

```sh
python3 -m http.server 8080
# then open http://localhost:8080/hybrid-cam-v2/index.html
```

## Demo credentials

Staff gate (`login.html`):

- `admin` / `admin1234` — admin console + source tools (the hint shown in the prompt)
- `ops@hybrid.cam` / `hybrid2026` — admin console + source tools
- `dev@hybrid.cam` / `review2026` — source tools only

Sessions live in `sessionStorage` and end with the tab. This is a design build:
the gate is client-side and is **not** real authentication.

## Third-party

- MapLibre GL JS 4.7.1 (BSD-3) via unpkg, OpenStreetMap raster tiles.
- Fonts: Instrument Serif, Manrope, JetBrains Mono (Google Fonts).

Both are optional: the map degrades to the status timeline and the type falls
back to system serif/sans/mono stacks.
