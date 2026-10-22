# 04 — Architecture

**Project:** BMW Experience Studio · **Version:** 1.0 · **Date:** 2026-10-01
**Related:** `02_TRD.md` · `06_TECH_STACK.md` · `05_BACKEND_SCHEMA.md`

---

## 1. System overview

The project is a **static multi-page website with shared data and behaviour** (no
framework or build step). All six HTML pages can be opened directly or served from a
static host; booking state is stored in the browser.

```
┌─────────────────────────────────────────────────────────────┐
│ Six HTML pages at the project root                        │
│ index · models · innovation · gallery · heritage · compare │
└──────────────┬───────────────────────────────┬────────────┘
               │ css/style.css                 │ scripts at end of body
               ▼                               ▼ (catalog first)
        ┌──────────────┐              ┌─────────────────────┐
        │ Shared CSS  │              │ js/catalog.js       │
        │ layout + UI │              │ BMW_CATALOG data    │
        └──────────────┘              └──────────┬──────────┘
                                                  │ read by
                                                  ▼
                                       ┌─────────────────────┐
                                       │ js/script.js        │
                                       │ page controllers    │
                                       └──────┬──────────────┘
                                              │ renders/references
                         ┌────────────────────┴─────────────────┐
                         ▼                                      ▼
                    image/ assets                       localStorage
```

## 2. Files

```
BMW/
├── index.html          Home, About, BMW Group story, and booking form
├── models.html         Model grid, search, filters, spec dialog, compare, and regions
├── innovation.html     Technology showcase and configurator
├── gallery.html        Gallery grid and lightbox
├── heritage.html       Filterable heritage timeline
├── compare.html        Standalone comparison view; comparison also appears on Models
├── css/
│   └── style.css       Shared tokens, layouts, components, responsive rules
├── js/
│   ├── catalog.js      window.BMW_CATALOG data source
│   └── script.js       Shared page controller
├── image/              42 model photos and BMW_M_logo.svg
└── docs/               Product, technical, UX, architecture, schema, and stack docs
```

**Layering rule:** `js/script.js` may read `js/catalog.js`; `js/catalog.js` must never
touch the DOM; HTML pages provide containers and hooks, not duplicate model records.

## 3. Data layer — `js/catalog.js`

```js
window.BMW_CATALOG = {
  models: [   // 42 entries → model grid, compare table, booking <select>, spec dialog
    { id:"i7", name:"i7 xDrive60", series:"BMW i", category:"Electric luxury sedan",
      tags:["electric","luxury","sedan"],
      image:"image/BMW_i7_xDrive60_1X7A7269.jpg",
      power:"544 hp", acceleration:"4.7 s", drive:"xDrive",
      description:"…", compare:true, bookable:true },
    …
  ],
  heritage: [ // 27 entries → timeline (sorted ascending by year at render)
    { year:1934, title:"BMW 303", image:"image/MHV_BMW_303_1934_01.jpg", blurb:"…" },
    …
  ],
  gallery: [  // 42 model photos → gallery grid + lightbox
    { src:"image/…", alt:"…", caption:"…" }
  ]
};
```

- `tags[]` drives chip filtering (`electric | m | suv | luxury | sedan | classic`).
- `compare: true` rows are emitted into the compare table.
- `bookable: true` models populate the booking `<select>` (defaults to all).
- Images referenced with literal paths; JS-side URL building wraps paths in `encodeURI()` (TRD AR-02).

## 4. Controller — `js/script.js` modules

Logical modules (one controller file, wrapped in an IIFE and executed at the end of each page body):

| # | Module | Responsibility | Key DOM contract |
|---|---|---|---|
| 1 | `header` | scroll state, hamburger, Esc close | `[data-header]`, `[data-menu-button]`, `.main-nav` |
| 2 | `catalogue` | render grid, filter, search, empty state | `[data-model-grid]`, `[data-filter]`, `#model-search`, `[data-result-count]` |
| 3 | `specDialog` | populate + open/close native dialog | `[data-spec-dialog]`, `[data-model]` |
| 4 | `heritage` | render timeline, IntersectionObserver reveal | `[data-heritage-list]` |
| 5 | `gallery` | render grid, lightbox open/nav/close | `[data-gallery-grid]`, `[data-lightbox]` |
| 6 | `compare` | render table rows on Models and Compare pages | `[data-compare-table]` |
| 7 | `booking` | populate select, min date, submit, persist optional details | `[data-drive-form]` |
| 8 | `configurator` | paint overlay, drive mode, range | `[data-paint-overlay]`, `[data-drive-mode]`, `[data-range]` |

**Binding strategy:** one delegated listener per container (grid, gallery) — keeps
re-renders cheap and prevents listener leaks.

## 5. Key interaction flows

### 5.1 Filter + search

```
chip click / input event
   └─► state = { filter, query }
        └─► models.filter(m => (filter==="all" || m.tags.includes(filter))
                             && (q==="" || match(m.name, m.tags, q)))
             ├─► render cards
             ├─► update count → aria-live
             └─► toggle empty-state node
```

### 5.2 Spec dialog

```
click [data-model=id]
   └─► model = models.find(id)          // miss → return
        └─► fill nodes (category/title/desc/power/speed/drive/img)
             └─► dialog.showModal()     // focus trap + Esc: native
                  └─► close → invoker.focus()
```

### 5.3 Gallery lightbox

```
open:  click thumb(i) → index=i → show(i) → lock scroll → focus ✕
show:  preload(i±1) → set src/alt/caption → counter "i+1 / total" (aria-live)
nav:   ← / → / buttons → index = (i ± 1 + n) % n → show(index)
close: ✕ | Esc | backdrop click → unlock scroll → thumb(i).focus()
```

### 5.4 Booking submit

```
submit → preventDefault
   ├─► validity check (native checkValidity)
   ├─► payload { id, name, firstName, middleName, lastName, email, phoneCountryCode, phone, gender, preferredContact, modelId, date, time, city, vehicle, message, createdAt }
   ├─► localStorage["bmw.bookings"].push(payload)
   ├─► status.textContent = "Thanks <name>. …" (aria-live)
   └─► form.reset(); date.min = today
```

## 6. Rendering pipeline

```
Bottom-of-body script execution (HTML is already parsed)
 ├─ renderGrid(models)
 ├─ renderHeritage(heritage.sort(by year))
 ├─ renderGallery(gallery)
 ├─ renderCompare(models.filter(compare)) on Models and Compare pages
 ├─ populateBookingSelect(models.filter(bookable))
 ├─ setFormMinDate()
 └─ initHeader / initConfigurator / initLightbox
```

Data-driven renderers build markup from the catalogue and replace their container's
children; event delegation keeps interactions attached across catalogue re-renders.

## 7. State model

No framework state — a single plain object:

```js
const state = { filter: "all", query: "", galleryIndex: 0, lastInvoker: null };
```

Persisted state (browser only):

| Key | Content |
|---|---|
| `bmw.bookings` | Array of test-drive requests (see `05_BACKEND_SCHEMA.md`) |

## 8. Styling architecture

Single `css/style.css`, ordered:

1. `:root` tokens
2. Reset/base (`box-sizing`, typography defaults, `svg` stroke rules)
3. Layout utilities (`.section`, `.quick-tools` padding rules)
4. Components (header, hero, chips, cards, dialog, lightbox, timeline…)
5. `@media (max-width: 980px)` → tablet
6. `@media (max-width: 680px)` → mobile
7. `@media (prefers-reduced-motion: reduce)` overrides

No CSS preprocessor; custom properties for theming.

## 9. Error handling

| Case | Behaviour |
|---|---|
| Unknown model id in dialog | silent no-op |
| Image 404 | `img.onerror` → placeholder class (muted gradient + alt text) |
| `localStorage` unavailable | booking still confirms; persistence skipped (try/catch) |
| Missing `BMW_CATALOG` | script guards with early return + console warning |
| No JS | page still shows hero, intro, static sections (progressive enhancement) |

## 10. Extension points

- **New model** → one object in `catalog.js` (grid, compare, booking, dialog update automatically).
- **New filter chip** → add tag to models + chip button in HTML (data-driven).
- **Backend** → swap booking persistence for `POST /api/bookings` (`05_BACKEND_SCHEMA.md` §5).
- **Image derivatives** → introduce `image/opt/` + `<picture>` sources without touching logic.
