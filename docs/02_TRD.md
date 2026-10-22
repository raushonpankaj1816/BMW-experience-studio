# 02 — Technical Requirements Document (TRD)

**Project:** BMW Experience Studio · **Version:** 1.0 · **Date:** 2026-10-01
**Related:** `01_PRD.md` · `04_ARCHITECTURE.md` · `06_TECH_STACK.md`

---

## 1. Scope

Technical requirements for the static, multi-page BMW showroom: functional behaviour,
performance budgets, accessibility, browser support, and asset-handling rules.

## 2. Functional Requirements

### 2.1 Catalogue & rendering

| ID | Requirement |
|----|-------------|
| FR-01 | All model data lives in **one source of truth** (`js/catalog.js`, `window.BMW_CATALOG`). No model data may be duplicated in markup. |
| FR-02 | The model grid is rendered client-side from the catalogue when the shared controller executes after the page markup. |
| FR-03 | Each model entry provides: `id`, `name`, `series`, `tags[]`, `image`, `alt`, `description`, `power`, `acceleration`, `drive`, `category`. |
| FR-04 | Grid render must be idempotent — re-rendering (e.g., on filter change) must not duplicate nodes or listeners (use event delegation). |

### 2.2 Filtering & search

| ID | Requirement |
|----|-------------|
| FR-10 | Filter chips are mutually exclusive; active chip sets `aria-selected="true"` and `.active`. |
| FR-11 | Filters: `all`, `electric`, `m`, `suv`, `luxury`, `sedan`, `classic`. |
| FR-12 | Search matches are case-insensitive and test `name`, `series`, `category`, and `tags`. |
| FR-13 | Filter and search compose (AND logic). Empty result set shows a "No models match" state. |
| FR-14 | On the home page, finder submit routes to `models.html` with an encoded query; on the models page, it filters and scrolls to `#models` without reloading. |
| FR-15 | Result count is announced via `aria-live="polite"`. |

### 2.3 Spec dialog

| ID | Requirement |
|----|-------------|
| FR-20 | Use native `<dialog>` + `showModal()` (focus trap, Esc, backdrop provided by the browser). |
| FR-21 | Opening a dialog records the invoking card; `close()` returns focus to it. |
| FR-22 | Backdrop click (`event.target === dialog`) closes the dialog. |
| FR-23 | Content is populated from the catalogue by `id`; missing id → no-op (no throw). |

### 2.4 Heritage timeline

| ID | Requirement |
|----|-------------|
| FR-30 | Renders from `heritage[]`: `year`, `title`, `image`, `blurb`. |
| FR-31 | Strict ascending chronological order regardless of source order. |
| FR-32 | Alternating left/right layout ≥ 980px; single column below. |
| FR-33 | Entries reveal on scroll via `IntersectionObserver` (with `prefers-reduced-motion` bypass). |

### 2.5 Gallery & lightbox

| ID | Requirement |
|----|-------------|
| FR-40 | Gallery renders all entries from `gallery[]` as a responsive grid. |
| FR-41 | Grid thumbnails use `loading="lazy"` + `decoding="async"`. |
| FR-42 | Lightbox must support: open on click, close on ✕ / backdrop / `Esc`. |
| FR-43 | Navigation: ← / → keys, prev/next buttons, wrap-around at both ends. |
| FR-44 | Counter displays `index / total`; also announced via `aria-live`. |
| FR-45 | Opening the lightbox locks body scroll (`overflow: hidden`) and restores it on close. |
| FR-46 | The current image is preloaded (adjacent images prefetched) to avoid blank frames. |

### 2.6 Compare & booking

| ID | Requirement |
|----|-------------|
| FR-50 | Compare table renders ≥ 8 rows from the catalogue on the Models page (no hard-coded rows in HTML). |
| FR-51 | Booking `<select>` options are generated from the catalogue (same source as the grid). |
| FR-52 | Form validation uses native `required` constraints; submit is intercepted, shows inline confirmation, resets fields. Optional vehicle and message fields are saved with the request. |
| FR-53 | Confirmation message includes submitted name and model; `aria-live="polite"`. |
| FR-54 | Date input must reject dates before today (set `min` to current date at runtime). |
| FR-55 | Submitted request is persisted to `localStorage` (`bmw.bookings`) — see `05_BACKEND_SCHEMA.md`. |

### 2.7 Header / navigation

| ID | Requirement |
|----|-------------|
| FR-60 | Header gains `.scrolled` styling when `scrollY > 24` (passive scroll listener). |
| FR-61 | ≤ 980px: nav collapses to a hamburger; `aria-expanded` toggles; `Esc` closes; body scroll locked while open. |
| FR-62 | Nav link click closes the menu and navigates to the selected page or section; Home is available on every page. |

## 3. Non-Functional Requirements

### 3.1 Performance budget

| Item | Budget |
|---|---|
| HTML + CSS + JS (uncompressed) | ≤ 120 KB total |
| Hero image priority | `<link rel="preload">` for the mobile hero; desktop hero via `<picture>` |
| Non-hero images | `loading="lazy" decoding="async"` |
| Fonts | `display=swap`, preconnect to `fonts.googleapis.com` / `fonts.gstatic.com` |
| LCP (local, broadband) | < 2.0 s |
| CLS | < 0.1 — all images declare `aspect-ratio` or fixed dimensions |
| Third-party requests | 1 (Google Fonts) — no trackers, no analytics |

### 3.2 Responsive breakpoints

| Token | Width | Behaviour |
|---|---|---|
| Desktop | > 980px | 3-column model grid, inline nav, 2-col hero panel |
| Tablet | ≤ 980px | 2-column grid, hamburger nav, stacked feature/config/drive sections |
| Mobile | ≤ 680px | 1-column grid, stacked panels, horizontal-scroll compare table |

Test matrix: **375, 414, 768, 1024, 1440, 1920 px**.

### 3.3 Accessibility (target WCAG 2.1 AA)

- Semantic landmarks: `header`, `nav`, `main`, `section[aria-label]`, `footer`.
- Every image has meaningful `alt` (decorative → `alt=""` + `aria-hidden`).
- All interactive elements reachable and operable by keyboard; visible focus ring.
- Colour contrast ≥ 4.5:1 for body text, ≥ 3:1 for large text/UI borders.
- `aria-live` regions for: search results, lightbox counter, form confirmation.
- Tabs/chips expose `role="tab"` + `aria-selected`.
- Respect `prefers-reduced-motion: reduce` — disable smooth scroll and reveal animations.
- Heading order is sequential (single `h1`, section `h2`, card `h3`).

### 3.4 Browser support

| Browser | Minimum |
|---|---|
| Chrome / Edge | 90+ |
| Firefox | 88+ |
| Safari | 15+ (macOS/iOS) |
| Samsung Internet | 19+ |

Required APIs: `<dialog>`, `IntersectionObserver`, CSS Grid, `aspect-ratio`,
`backdrop-filter` (progressive), `object-fit: cover`, ES2019 JS.

### 3.5 Asset-handling rules

| ID | Rule |
|----|------|
| AR-01 | Filenames must be copied **byte-for-byte** from disk — no case changes, no hyphen/underscore substitution. |
| AR-02 | Special characters present in the collection: `(` `)` `,` `–` (U+2013) `_` spaces. These are legal in `src` attributes but **must be URL-encoded when constructed in JS** (`encodeURI()` on the path). |
| AR-03 | Never rename originals; if derivatives are created (F-C01), write them to `image/opt/`. |
| AR-04 | Every image reference is verified against disk by a pre-release check script (see §5). |
| AR-05 | `alt` text describes the specific model, not "BMW image". |

## 4. Quality Assurance / Acceptance

| Check | Pass criteria |
|---|---|
| Console | No errors, no warnings on load or interaction |
| Network | 0 × 404 for images/fonts; no mixed content |
| Images | Every one of the 43 assets renders at least once |
| Filters | Each chip narrows the grid correctly; combined with search |
| Dialog | Opens from every card, closes via ✕/Esc/backdrop, focus returns |
| Lightbox | Wraps around, keyboard works, counter correct, scroll locks |
| Form | Validation blocks empty submit; confirmation shown; date `min` set |
| Responsive | No horizontal scroll at 375px (except the compare table) |
| A11y | Tab order sane; screen-reader labels present on icon buttons |

## 5. Verification procedure

Run before release:

```powershell
# 1. every image referenced in code exists on disk
Select-String -Path index.html,js\script.js,js\catalog.js -Pattern 'image/[^"'')]+\.jpg' -AllMatches |
  ForEach-Object { $_.Matches.Value } | Sort-Object -Unique |
  ForEach-Object { if (-not (Test-Path $_)) { "MISSING: $_" } }

# 2. serve locally
python -m http.server 8080     # then open http://localhost:8080
```

## 6. Out-of-scope technical items

- Server-side rendering, databases, authentication.
- Automated CI (optional future: GitHub Pages deploy workflow).
- Image transcoding pipeline (optional — see PRD F-C01).
