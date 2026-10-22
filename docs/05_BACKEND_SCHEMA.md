# 05 — Backend / Data Schema

**Project:** BMW Experience Studio · **Version:** 1.0 · **Date:** 2026-10-01
**Related:** `04_ARCHITECTURE.md` · `02_TRD.md`

---

## 1. Current state: no server

The site is fully static. There is **no backend today**:

- Model data ships with the pages (`js/catalog.js`).
- Test-drive requests are validated and confirmed **in the browser** and persisted to
  `localStorage` under `bmw.bookings`.

This document specifies (a) the canonical data model the front end consumes, (b) the
browser persistence format, and (c) — in §5 — the API to implement if/when a real
backend is added.

## 2. Entities

### 2.1 `Model`

Canonical car record. Mirrors `BMW_CATALOG.models[]`.

```jsonc
{
  "id": "i7",                        // string, unique, kebab/lowercase, used by dialog + booking
  "name": "i7 xDrive60",             // display name (without "BMW " prefix)
  "series": "BMW i",                 // series badge text
  "category": "Electric luxury sedan",// dialog eyebrow
  "tags": ["electric", "luxury", "sedan"],   // filter vocabulary (see enum)
  "image": "image/BMW_i7_xDrive60_1X7A7269.jpg", // relative path, byte-exact
  "alt": "BMW i7 xDrive60",          // accessible description
  "power": "544 hp",                 // display string (unit included)
  "acceleration": "4.7 s",           // 0–100 km/h display string
  "drive": "xDrive",                 // xDrive | Electric xDrive | Rear-wheel | Front-wheel
  "description": "…",                // 1–2 sentence card/dialog copy
  "year": 2025,                      // int, model year (optional)
  "compare": true,                   // include in compare table (target: ≥ 8 rows)
  "bookable": true                   // include in booking <select>
}
```

**Tag enum:** `electric | m | suv | luxury | sedan | classic`
**Sort order:** catalogue order = display order (curated, flagship first).

### 2.2 `HeritageEntry`

```jsonc
{
  "year": 1934,                       // int, required, ascending sort key
  "title": "BMW 303",                 // required
  "image": "image/MHV_BMW_303_1934_01.jpg",
  "alt": "BMW 303 from 1934",
  "blurb": "…"                        // ≤ 160 chars
}
```

Reference set (8): 303/1934 · 340/1950 · Isetta/1955 · M1/1981 · 850Ci/1993 ·
328i/1998 · Z4 E85/2006 · i3/2018.

### 2.3 `GalleryItem`

```jsonc
{
  "src": "image/BMW_M1_1981_(38175603185).jpg",
  "alt": "BMW M1 classic sports car",
  "caption": "BMW M1 — Motorsport heritage",
  "tags": ["classic", "m"]            // optional, for future gallery filters
}
```

The gallery currently contains 42 model photos. `BMW_M_logo.svg` is a separate brand
asset and is not a gallery item.

### 2.4 `TestDriveRequest`

```jsonc
{
  "id": "tdr_1759315200000_ab12",     // "tdr_" + Date.now() + "_" + random 4 chars
  "name": "Priya Sharma",             // string, 2–80 chars, trimmed
  "firstName": "Priya",               // required name parts
  "middleName": "",                   // optional
  "lastName": "Sharma",               // required
  "email": "priya@example.com",       // required, valid email address
  "phoneCountryCode": "+91",          // required calling code
  "phone": "+91 98765 43210",         // calling code + entered phone number
  "gender": "",                       // optional; empty means prefer not to say
  "preferredContact": "Email",        // optional contact preference
  "modelId": "ix",                    // → Model.id (foreign key)
  "modelName": "BMW iX",              // denormalised for display
  "date": "2026-10-15",               // ISO-8601 date, ≥ today
  "time": "Morning · 09:00 – 12:00", // optional preferred time
  "city": "Munich",                   // required retailer location
  "vehicle": "BMW 3 Series, 2019",    // optional current vehicle
  "message": "Interested in city driving", // optional, trimmed, ≤ 500 chars
  "createdAt": "2026-10-01T09:30:00Z",// ISO-8601 timestamp
  "status": "pending"                 // pending | confirmed | cancelled
}
```

## 3. Validation rules

| Field | Rule | Enforced by |
|---|---|---|
| `name` | first and last required; combined name ≤ 80 chars | required name inputs + JS trim/check |
| `middleName` | optional, ≤ 40 chars | `maxlength` |
| `email` | required, valid email | `<input type="email" required>` |
| `phoneCountryCode` | required, selected calling code | `<select required>` |
| `phone` | required, 7–20 chars | `<input type="tel" minlength maxlength required>` |
| `gender` | optional | `<select>`; defaults to prefer not to say |
| `preferredContact` | optional | `<select>` |
| `modelId` | required, must exist in catalogue | `<select>` options generated from catalogue |
| `date` | required, ≥ today | `<input type="date" min=today>` + JS check |
| `city` | required | `<select required>` |
| `time` | optional | `<select>` |
| `vehicle` | optional, ≤ 60 chars | `maxlength` |
| `message` | optional, ≤ 500 chars, trimmed | `maxlength` + JS trim |
| duplicates | allow re-submission (no idempotency key in v1) | — |

Server-side (future): re-validate all of the above; reject unknown `modelId` with `422`.

## 4. Browser persistence (current)

**Key:** `bmw.bookings` · **Value:** JSON array of `TestDriveRequest` · **Scope:** origin.

```js
// write — js/script.js (wrapped in try/catch: private mode may throw)
const bookings = JSON.parse(localStorage.getItem("bmw.bookings") || "[]");
bookings.push(payload);
localStorage.setItem("bmw.bookings", JSON.stringify(bookings));

// read (debug/admin only in v1)
JSON.parse(localStorage.getItem("bmw.bookings") || "[]");
```

Limits: ~5 MB origin quota; only one browser/device — acceptable for a demo.
If storage is unavailable, the confirmation still shows (persistence is best-effort).

## 5. Future API (appendix — not implemented in v1)

Proposed minimal backend: **Node.js + Express + SQLite** (or serverless equivalent),
JSON over HTTPS, no auth for public endpoints; admin endpoints would add a bearer token.

### 5.1 Endpoints

| Method | Path | Body / Query | Response |
|---|---|---|---|
| `GET` | `/api/models` | `?tag=electric&q=i5` | `{ models: Model[] }` |
| `GET` | `/api/models/:id` | — | `Model` |
| `GET` | `/api/heritage` | — | `{ entries: HeritageEntry[] }` |
| `GET` | `/api/gallery` | — | `{ items: GalleryItem[] }` |
| `POST` | `/api/bookings` | `TestDriveRequest` (no id/status) | `201 { booking }` |
| `GET` | `/api/bookings` | admin only | `{ bookings: … }` |
| `PATCH` | `/api/bookings/:id` | `{ status }` | admin only |

### 5.2 Status codes

| Code | When |
|---|---|
| `200` / `201` | success |
| `400` | malformed JSON / missing field |
| `404` | unknown `modelId` or booking id |
| `409` | duplicate booking (if idempotency added) |
| `422` | validation failure (field-level errors returned) |
| `429` | rate limit on `POST /api/bookings` |
| `500` | unexpected server error |

**Error envelope:**

```jsonc
{ "error": { "code": "VALIDATION_FAILED",
             "details": [{ "field": "date", "message": "must be today or later" }] } }
```

### 5.3 SQL schema (SQLite sketch)

```sql
CREATE TABLE models (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  series       TEXT NOT NULL,
  category     TEXT NOT NULL,
  tags         TEXT NOT NULL,          -- JSON array, or normalize to model_tags
  image        TEXT NOT NULL,
  alt          TEXT NOT NULL,
  power        TEXT NOT NULL,
  acceleration TEXT NOT NULL,
  drive        TEXT NOT NULL,
  description  TEXT NOT NULL,
  year         INTEGER,
  compare      INTEGER NOT NULL DEFAULT 0,
  bookable     INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE heritage (
  year    INTEGER PRIMARY KEY,
  title   TEXT NOT NULL,
  image   TEXT NOT NULL,
  alt     TEXT NOT NULL,
  blurb   TEXT NOT NULL
);

CREATE TABLE gallery (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  src     TEXT NOT NULL,
  alt     TEXT NOT NULL,
  caption TEXT NOT NULL,
  tags    TEXT
);

CREATE TABLE bookings (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL CHECK(length(name) BETWEEN 2 AND 80),
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name  TEXT NOT NULL,
  email      TEXT NOT NULL,
  phone_country_code TEXT NOT NULL,
  phone      TEXT NOT NULL,
  gender     TEXT,
  preferred_contact TEXT,
  model_id   TEXT NOT NULL REFERENCES models(id),
  model_name TEXT NOT NULL,
  date       TEXT NOT NULL,
  time       TEXT,
  city       TEXT NOT NULL,
  vehicle    TEXT,
  message    TEXT CHECK(length(message) <= 500),
  created_at TEXT NOT NULL,
  status     TEXT NOT NULL DEFAULT 'pending'
            CHECK(status IN ('pending','confirmed','cancelled'))
);

CREATE INDEX idx_bookings_date ON bookings(date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

### 5.4 Migration path from v1

1. Keep `js/catalog.js` as the seed; write a one-off script to `POST /api/models`.
2. In `js/script.js`, replace the localStorage write with `fetch("/api/bookings", …)`,
   keeping the existing try/catch + optimistic confirmation (and error rollback).
3. Nothing else changes — the UI reads the same shapes documented in §2.
