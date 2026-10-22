# 01 — Product Requirements Document (PRD)

**Project:** BMW Experience Studio
**Type:** Static premium automotive showcase website
**Location:** `BMW/`
**Version:** 1.0
**Date:** 2026-10-01
**Status:** Approved for build

---

## 1. Vision

A premium, static multi-page digital showroom for BMW, built around the owner's local
collection of 42 BMW photographs and the BMW M logo. The site should feel like a manufacturer-grade
experience — fast model discovery, cinematic photography, performance-led detail, and a
booking flow that matches BMW's brand character — while running as plain static files
with no build step and no server dependency.

## 2. Goals

| ID | Goal |
|----|------|
| G1 | Showcase the full BMW range using **every one of the 42 JPGs** in `image/` |
| G2 | Make model discovery instant (filters + search + spec dialogs) |
| G3 | Tell the brand story with a dedicated **Heritage timeline** (1916 → 2025) |
| G4 | Provide a **42-photo gallery with lightbox** |
| G5 | Keep the existing comparison, configurator, and test-drive booking flows |
| G6 | Stay responsive and accessible (375px → 1440px+, keyboard navigable) |
| G7 | Load fast despite large source photos (lazy loading, no hero blocking) |

## 3. Non-Goals

- Not an e-commerce site — no prices, cart, or checkout.
- No real payment or CRM integration for bookings (static site; see `05_BACKEND_SCHEMA.md`).
- No framework rewrite (React/Vue/etc.) — plain HTML/CSS/JS only.
- No modification or deletion of the original image files.

## 4. Target Users

| Persona | Need | Primary sections |
|---|---|---|
| **EV Shopper** | Compare electric models, range/power, book a drive | Models (Electric filter), Compare, Book Drive |
| **Performance Enthusiast** | M cars, specs, 0–100 times | Models (M filter), Spec dialog, Compare |
| **Family / SUV Buyer** | Space, models lineup, practicality | Models (SUV filter), Compare |
| **Brand Fan / Historian** | Classic cars and lineage | Heritage, Gallery |
| **Casual Browser** | Attractive overview, shareable | Hero, Gallery, Configurator |

## 5. Feature Requirements (MoSCoW)

### Must have (M)

| ID | Feature | Description |
|----|---------|-------------|
| F-M01 | Hero | Full-viewport hero with responsive `<picture>` (i7 desktop / iX mobile), CTA buttons, quick-facts panel |
| F-M02 | Model catalogue | 20+ model cards rendered from a single data source, with photo, series tag, description, "View Specs" |
| F-M03 | Filters | Chips: All · Electric · M · SUV · Luxury · Sedan & Coupe · Classic |
| F-M04 | Search | Free-text search over model name + tags, combined with active filter |
| F-M05 | Spec dialog | Modal with image, category, description, power / 0–100 / drive |
| F-M06 | Heritage timeline | 27 milestones spanning 1916 to 2025, with image and era filters |
| F-M07 | Gallery | Responsive grid of all 42 model photographs + lightbox (prev/next, keyboard, counter); M logo badge in footer |
| F-M08 | Compare table | Catalogue-driven performance comparison in the Models page |
| F-M09 | Booking form | First/middle/last name, email, country-code phone, optional gender and preferred contact, model, date, time, location, vehicle and message; inline confirmation |
| F-M10 | Responsive nav | Fixed header → hamburger menu ≤ 980px |
| F-M11 | Performance | `loading="lazy"` on all non-hero images; preloaded hero |

### Should have (S)

| ID | Feature | Description |
|----|---------|-------------|
| F-S01 | Configurator | Paint swatches (blend-mode overlay), drive mode segmented control, performance bias slider |
| F-S02 | Finder bar | "Find your BMW" search that routes to or filters the model grid |
| F-S03 | Stats strip | Live counts (models, images) and a BMW Group story on Home |
| F-S04 | Scroll reveal | Fade/rise animation on heritage + section headings |

### Could have (C)

| ID | Feature | Description |
|----|---------|-------------|
| F-C01 | Image compression | Optional WebP/1600px derivatives for faster loads |
| F-C02 | Favorites | Persist liked models to `localStorage` |
| F-C03 | Dark/light toggle | Theme switcher |

## 6. Success Metrics

| Metric | Target |
|---|---|
| Images referenced by the site | 43 / 43 (42 JPGs + `BMW_M_logo.svg`) |
| Model cards in catalogue | ≥ 20 *(built: 42)* |
| Largest Contentful Paint (local, broadband) | < 2.0 s |
| Lighthouse Performance (mobile, simulated) | ≥ 85 |
| Broken images / console errors | 0 |
| Works at widths | 375, 414, 768, 1024, 1440, 1920 px |
| Keyboard operable | Nav, filters, dialog, lightbox, form |

## 7. Image Inventory (43 assets)

| Group | Count | Examples |
|---|---|---|
| Electric | 10 | i7, iX, i5, i5 Touring, iX1, iX2, iX3 ×2, i3, i3 (G28) |
| SUV / SAV | 11 | X1, X2 M35i, X3 M50, X5, X6 M60i, X7 ×2, XM, iX3 |
| Sedan / Coupe / Touring | 13 | 118d, M235, 320d, G20, M440i, G21, G26, 4 GC, 520i, 520d, 740d, 630d GT, G14 |
| M / Performance | 6 | M850i, XM, X3 M50, X7 M60i, X6 M60i, M235 |
| Heritage / Classic | 8 | 303 (1934), 340 (1950), Isetta (1955), M1 (1981), 850Ci (1993), 328i (1998), Z4 (2006), i3 (2018) |
| Assets | 1 | `BMW_M_logo.svg` |

> **Note:** several filenames contain parentheses, commas, spaces and an en-dash
> (`BMW_118d_M_Sportpaket_(F70)_–_f_30032025.jpg`). All references must match the
> on-disk names exactly; see TRD §5.

## 8. Release Plan

| Phase | Scope | Status |
|---|---|---|
| Phase 0 | Project docs (`docs/01`–`06`) | ✅ Done |
| Phase 1 | Catalogue data layer + expanded model grid + filters | ✅ Done |
| Phase 2 | Heritage timeline section | ✅ Done |
| Phase 3 | Gallery grid + lightbox | ✅ Done |
| Phase 4 | Compare/booking expansion, performance pass, QA | ✅ Done |
