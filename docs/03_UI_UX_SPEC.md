# 03 — UI/UX Specification

**Project:** BMW Experience Studio · **Version:** 1.0 · **Date:** 2026-10-01
**Related:** `01_PRD.md` · `02_TRD.md`

---

## 1. Design principles

These shared design rules apply across the six HTML pages: Home, Models, Innovation,
Gallery, Heritage, and Compare. Each page loads the shared stylesheet and controller;
the data-driven pages also render from `js/catalog.js`.

1. **Photography first** — images dominate; UI chrome stays quiet (thin borders, restrained radius).
2. **Performance-led tone** — big type, tight line-height, strong numeric callouts (hp, 0–100).
3. **Two-mode palette** — light "paper" sections for browsing, dark "studio" sections for drama (hero, innovation, gallery, booking).
4. **Consistent geometry** — 6px radius everywhere, 1px borders, one shadow scale.
5. **No decorative clutter** — icons are line SVGs, colour is used for meaning (blue = info, red = M, teal = accent).

## 2. Design tokens

### 2.1 Colour

| Token | Value | Usage |
|---|---|---|
| `--ink` | `#101216` | Primary text, dark chips, headers |
| `--paper` | `#f5f5f1` | Page background (light sections) |
| `--muted` | `#6b7078` | Secondary text |
| `--line` | `rgba(16,18,22,.14)` | Borders on light surfaces |
| `--blue` | `#1267d8` | Primary accent, CTAs, eyebrow labels |
| `--red` | `#c41f35` | M Performance accent |
| `--teal` | `#0c8b86` | Accent on dark surfaces (`#5be0c8` for text) |
| `--silver` | `#d9dee4` | Neutral fill |
| `--white` | `#ffffff` | Text on dark, card background |
| `--shadow` | `0 22px 70px rgba(10,13,18,.22)` | Dialog / elevated surfaces |
| Dark surfaces | `#05070a` hero · `#121417` innovation · `#0d0f12` gallery · `#08090b` footer | |

**Contrast rules:** body text ≥ 4.5:1 (`--ink` on `--paper` = 15.4:1 ✅); text on dark uses ≥ 72% white alpha.

### 2.2 Typography

Family: **Inter** (400/500/600/700/800), fallback `Arial, sans-serif`.

| Role | Size | Weight | Line-height |
|---|---|---|---|
| Hero `h1` | `clamp(5rem, 18vw, 15.5rem)` | 800 | 0.78 |
| Section `h2` | `clamp(2rem, 5vw, 4.7rem)` | 800 | 0.98 |
| Card `h3` | `1.45rem` | 700 | 1.2 |
| Eyebrow | `0.78rem` uppercase, `letter-spacing .08em` | 800 | 1 |
| Body | `1rem` | 400 | 1.65–1.8 |
| Metric | `clamp(1.35rem, 2vw, 1.85rem)` | 800 | 1 |
| Small/label | `0.82rem` | 500 | 1.4 |

### 2.3 Spacing & shape

- Section padding: `clamp(72px, 10vw, 128px)` block / `clamp(18px, 5vw, 72px)` inline.
- Grid gaps: 18px (cards), 14px (tool tiles), 12px (lists).
- Radius: **6px** everywhere; chips `999px`; swatches/brand mark `50%`.
- Border: `1px solid var(--line)` (light) / `rgba(255,255,255,.14–.25)` (dark).

### 2.4 Motion

| Effect | Timing | Easing |
|---|---|---|
| Hover lift (buttons) | 180ms | ease, `translateY(-2px)` |
| Nav underline | 180ms | ease, `scaleX` |
| Header state | 220ms | ease (bg/shadow/colour) |
| Paint overlay change | 180ms | ease |
| Scroll reveal | 500ms | `cubic-bezier(.2,.7,.3,1)`, 24px rise |

`prefers-reduced-motion: reduce` → all transitions ≈ 0, no smooth scroll, reveals shown immediately.

## 3. Layout & breakpoints

| | Desktop > 980 | Tablet ≤ 980 | Mobile ≤ 680 |
|---|---|---|---|
| Nav | inline links | hamburger panel (fixed, top 78px) | same |
| Model grid | 3 col | 2 col | 1 col |
| Quick tools | 3 col (1.4/.8/.8) | 1 col | 1 col |
| Feature / config / drive | 2 col | 1 col | 1 col |
| Gallery (grid) | 4 col | 3 col | 2 col |
| Heritage | alternating 2-col | alternating | stacked |
| Hero panel | absolute bottom-right | static, centered | 1 col stacked |
| Compare | full table | full table | min-width 720px, `overflow-x:auto` |

## 4. Section-by-section specification

### S1 — Header (fixed)
- Left: BMW roundel mark (CSS, 38px) + wordmark. Centre/right: nav links (Home, Models, Innovation, Gallery, Heritage, Compare, Book Drive).
- Default: transparent, white text over hero. After `scrollY > 24`: `rgba(245,245,241,.92)` + blur(18px) + shadow, ink text.
- Mobile: menu button (42×42, 1px border, hamburger SVG); panel drops below header with 12px padding, 14px link rows.

### S2 — Hero
- `min-height: 92vh`, image `object-fit: cover`, dual gradient scrim (left→right and bottom→up) guaranteeing text contrast.
- Content: eyebrow (`#84b8ff`) → giant `h1` → copy (max 620px) → two CTAs (primary blue, secondary glass).
- Quick-facts panel: 3 columns, glass (`rgba(255,255,255,.12)` + blur 16px), metric + label.
- ⚠ On ≤ 680px the panel stacks vertically and buttons go full-width.

### S3 — Quick tools strip
- Dark (`--ink`) band: finder (search input + blue submit) + two stat tiles.
- Stat numbers: `#89bdff` / accent `#5be0c8`, 2.15rem.
- **Change:** numbers become live values (models count, image count).

### S4 — Intro
- Two-column: `h2` left, muted paragraph right; aligns to `end`.

### S4a — Origin & ownership (Home)
- Two-column editorial layout: historic BMW photo and company overview on the left; six ownership/origin fact cards on the right.
- Mobile stacks the photo, copy, and cards into one column.

### S4b — BMW Group story (Home)
- Dark section with six company fact tiles and the six BMW Group brand cards.
- Regional BMW website links live on the Models page, not in the footer.

### S5 — Models
- Heading + filter chips (pill, 42px, active = ink fill) + result count (aria-live).
- **Card:** 4:3 image (`object-fit: cover`), 22px body → series label (blue; red when `.m`) → `h3` → description (`min-height: 78px`, muted) → full-width outline button inverts on hover.
- Empty state: centred muted message spanning the grid.
- The catalogue-driven comparison table follows the model grid; regional links follow the comparison.

### S6 — Innovation (dark `#121417`)
- 0.95fr / 1.3fr split; feature list rows 52px with teal SVG icons in bordered tiles.

### S7 — Configurator
- Preview pane (min-height 470px, dark) with `mix-blend-mode: color` paint overlay; label bottom-left with text-shadow.
- Controls column: paint fieldset (42px round swatches, active = 2px blue ring), segmented drive mode (3-up, active = ink fill), range slider (`accent-color: var(--red)`) with live % readout.

### S8 — Gallery (dark `#0d0f12`)
- **New:** responsive thumbnail grid (4/3/2 cols) → click opens lightbox.
- Thumbnail: 4:3 crop, hover = slight brighten + scale 1.03 (180ms), focus ring visible.
- **Lightbox:** fixed overlay `rgba(5,7,10,.92)` + blur; image `max-height: 84vh`, `object-fit: contain`; caption bar bottom-left; counter bottom-right (`12 / 42`); ✕ top-right; prev/next 56px glass buttons at edges (same `.icon-button` style as before).

### S9 — Heritage (new, light `--paper`)
- Section eyebrow `Heritage`, `h2` "Nine decades in motion."
- Timeline: 2px centre line (desktop), alternating cards with year badge (blue, 800), image 4:3, title, 2-line blurb.
- Year badge: pill, `--ink` fill, white text.
- Scroll reveal per entry (see motion table).

### S10 — Compare
- 4-column grid `1.1fr .7fr 1fr 1.2fr`; header row ink/white; rows 64px min; 1px cell borders; first cell bold.
- ≤ 680px: horizontal scroll (min-width 720px) — acceptable per TRD.

### S11 — Book a drive
- Background: XM photo with left-to-right dark gradient (`.drive`).
- Form: glass card (blur 18px) with grouped rows for name, contact details, preferences, vehicle, and schedule; dark translucent inputs; teal confirmation text. Rows stack on mobile.

### S12 — Footer
- `#08090b`, brand, BMW Group, Contact, and Follow BMW worldwide columns, in that order after the brand; the social column uses a compact four-by-two icon grid. Region links are kept out of the footer.

## 5. Component states

| Component | Default | Hover | Focus | Active/Selected | Disabled |
|---|---|---|---|---|---|
| Chip | transparent, 1px line | border → ink | 2px blue outline, offset 2 | ink fill, white text | — |
| Primary button | blue fill | +lift, darken 6% | same outline | translateY(0) | 45% opacity, `not-allowed` |
| Card button | outline ink | ink fill, white text | outline | — | — |
| Gallery thumb | none | brighten 1.06, scale 1.03 | outline | — | — |
| Swatch | 1px inset ring | scale 1.08 | outline | 2px blue ring | — |
| Segmented | transparent | paper fill | outline | ink fill | — |
| Inputs | dark translucent, no border glow | — | 1px blue border | — | — |
| Icon button | glass | white fill 14% | outline | — | — |

## 6. Content & voice

- Confident, concise, technical — short sentences, real specs (hp, seconds, xDrive).
- Numbers always carry units (`544 hp`, `4.7 s`, `0–100 km/h`).
- Sentence case for headings; uppercase only for eyebrows/series labels.
- No exclamation marks; no marketing filler ("amazing", "best-ever").

## 7. Accessibility checklist (UI level)

- [ ] One `h1`; sections use `h2`; cards `h3`.
- [ ] Icon-only buttons have `aria-label`.
- [ ] Filter chips: `role="tab"` + `aria-selected`.
- [ ] Dialog/lightbox: focus trapped (native `<dialog>`), Esc closes, focus returns to invoker.
- [ ] `aria-live` on: result count, lightbox counter, form status.
- [ ] Touch targets ≥ 44×44px.
- [ ] Focus visible on every interactive element (never `outline: none` without replacement).
- [ ] Reduced-motion honoured.
