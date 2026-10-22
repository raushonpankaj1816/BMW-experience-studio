# 06 — Tech Stack

**Project:** BMW Experience Studio · **Version:** 1.0 · **Date:** 2026-10-01
**Related:** `04_ARCHITECTURE.md` · `02_TRD.md`

---

## 1. Stack summary

| Layer | Choice | Version / notes |
|---|---|---|
| Markup | HTML5 (semantic) | `<dialog>`, `<picture>`, ARIA |
| Styling | `css/style.css` — CSS3 + custom properties | Grid, `aspect-ratio`, `backdrop-filter`, `mix-blend-mode` |
| Logic | `js/script.js` — Vanilla JavaScript (ES2019+) | ES modules not required — classic script |
| Fonts | Google Fonts — Inter | `display=swap`, preconnected |
| Icons | Inline SVG | 24×24 viewBox, `stroke: currentColor`, no icon library |
| Data | `js/catalog.js` → `window.BMW_CATALOG` | Loaded before `js/script.js`; single source of truth |
| Storage | `localStorage` | Booking requests (best-effort) |
| Server | None required | Static files; optional `python -m http.server` for dev |
| Version control | Git (optional) | Repo init at project root if desired |

## 2. Why this stack

| Decision | Rationale |
|---|---|
| **No framework** | The site has six static pages with shared interactions. React/Vue would add a build step, ~150 KB of runtime, and toolchain maintenance for no user-visible gain. |
| **No bundler** | Local HTML, CSS, and JavaScript files load directly; double-clicking `index.html` must work. Keeps the project portable to any static host (GitHub Pages, Netlify, S3). |
| **Single CSS file** | Tokens, components, and media queries stay together in `css/style.css`; a preprocessor would only add a build step. |
| **Data module separated** | `catalog.js` isolates content from behaviour so models/heritage/gallery can be edited without touching controller logic (see Architecture §3). |
| **Native `<dialog>`** | Gives focus trap, `Esc`, backdrop and top-layer stacking for free — replaces a custom modal implementation. |
| **Inter font** | Neutral, technical grotesk matching BMW's tone; variable weights 400–800 cover the whole type scale. |

## 3. Browser APIs used

| API | Purpose | Fallback |
|---|---|---|
| `<dialog>.showModal()` | Spec dialog | — (required browser, TRD §3.4) |
| `IntersectionObserver` | Heritage/scroll reveal | show content immediately if unsupported |
| CSS Grid + `aspect-ratio` | All layouts, card image crops | — |
| `backdrop-filter` | Header/form glass effects | solid rgba background already set |
| `mix-blend-mode: color` | Configurator paint overlay | overlay still tints without blend |
| `localStorage` | Booking persistence | try/catch → confirm-only |
| `<picture>` + `srcset` | Hero art direction (desktop vs mobile) | single `img` fallback |
| `history`/anchor smooth scroll | Navigation | native jump |
| `prefers-reduced-motion` | Motion opt-out | — |

## 4. Tooling

| Task | Tool |
|---|---|
| Local preview | `python -m http.server 8080` (or VS Code **Live Server**) |
| Editing | VS Code (+ Live Server extension) |
| Inspection | Browser DevTools (Network → 404 check; Lighthouse audit) |
| Image reference verification | PowerShell one-liner (TRD §5) |
| Optional image pipeline (PRD F-C01) | `sharp`/Squoosh → `image/opt/*.webp` at 1600px |
| Optional deployment | GitHub Pages / Netlify drag-and-drop of the folder |

## 5. Third-party dependencies

| Dependency | Loaded from | Size | Notes |
|---|---|---|---|
| Inter (4 weights) | `fonts.googleapis.com` | ~15 KB woff2 subset | `preconnect` ×2 already in head |

**Nothing else.** No jQuery, no analytics, no trackers, no CDN scripts — the page must
work offline apart from the font (falls back to `Arial`).

## 6. Repository conventions

- **Indentation:** 2 spaces (HTML/CSS/JS).
- **Naming:** `kebab-case` for CSS classes; `data-*` attributes for JS hooks
  (`[data-model-grid]`), never for styling; `camelCase` for JS identifiers.
- **Selection contract:** JS selects via `data-*` hooks only — class names stay free
  for styling changes.
- **Comments:** section banners in CSS (`/* ── Header ── */`), block comments before
  each JS module.
- **Assets:** never rename files in `image\`; new assets go to `image\` with
  `PascalCase` names, no spaces.
- **Docs:** this `docs\` folder is the source of truth; update the matching doc when
  behaviour changes (PRD → features, TRD → requirements, ARCH → flows, SCHEMA → data).

## 7. Deliverables checklist

- [x] `docs/01_PRD.md`
- [x] `docs/02_TRD.md`
- [x] `docs/03_UI_UX_SPEC.md`
- [x] `docs/04_ARCHITECTURE.md`
- [x] `docs/05_BACKEND_SCHEMA.md`
- [x] `docs/06_TECH_STACK.md`
- [x] `js/catalog.js` — data layer (42 models, 27 heritage entries, 42 gallery photos)
- [x] Six HTML pages — home, models, innovation, gallery, heritage, and compare
- [x] `css/style.css` — shared page styling
- [x] `js/script.js` — shared page controller
- [x] QA pass per TRD §4 — 40/40 interaction checks recorded (2026-10-02)
