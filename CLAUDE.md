# CLAUDE.md: KV6025 Flood Preparedness & Monitoring App ("RiverReady")

> Project spec for Claude Code. Read this file fully once per session. Do NOT re-read the whole repo; use Grep/Glob and read only files you are editing.
> The assessment is the source of truth. If anything here conflicts with the brief rules in section 1, the brief wins.

## 0. How to work (token-efficient rules)
- Work in the PHASES in section 9, one phase per session. Finish a phase, run its checks, append to DEVLOG.md, then stop and wait.
- Plan briefly (max 10 lines), then code. Do not paste large files back to me. Show diffs/summaries only.
- Never read `node_modules/`, `dist/`, `vendor/`, lockfiles or the PDF. Everything needed from the brief is in section 1.
- Prefer small, single-purpose files (<150 lines). Edit with targeted changes, not full rewrites.
- Do not add libraries not listed in section 3 without asking. Every extra dependency must be explainable by the student.
- After each phase, append a DEVLOG.md entry (format in section 10), including the key prompt I gave and how output was verified.
- Explain non-obvious code in 1-2 comment lines. The student must be able to explain every file (academic integrity requirement).

### Dev environment (persistent; applies to every session)
- OS: Fedora. Backend dev server: `php -S localhost:8000 -t backend/public backend/public/index.php`.
- Database: local MariaDB, database `riverready`, user `riverready`. The password lives only in `backend/config/config.php` (gitignored). Never ask for it in chat, never print or commit it.
- PHP target: write code compatible with PHP 8.1+ (university server version unconfirmed). Avoid readonly classes, enums, property hooks and other newer-only features.
- Frontend dev server (Phase 4+): Vite, proxying `/api` to `localhost:8000`.
- Assignment PDFs are intentionally not in this repo. Everything needed from them is in section 1.

### Skills and design effort
- Only invoke the `frontend-design` skill in Phases 4-5 (UI work). Do not load it in any other phase.
- When using it: "Use frontend-design for the components, keep plain CSS, mobile-first."
- Phases 4-5 (functionality) were built with a deliberately plain look. That restriction no longer applies: core functionality is complete and tested, so **Phase 5b (visual redesign) is explicitly allowed to be bold, creative and distinctive.**
- Phase 5b direction: modern and bold, earthy river identity (see section 2b). Light AND dark mode. Custom inline-SVG icon set. Memorable but never at the cost of the guardrails below.
- Guardrails that still apply to any visual work: no behaviour/API/route/backend changes; WCAG AA contrast; visible focus; 44px tap targets; status never by colour alone; honour prefers-reduced-motion; no external requests (fonts, CDNs, images); original artwork only (nothing copied from Google Flood Hub, the Red Cross app or other brands); the disclaimer stays visible; production build must pass with no noticeable bundle-size growth; PWA manifest colours and icons must match the final palette.

### 2b. Visual identity (Phase 5b)
- Concept: a river seen from above, flowing through earth. Palette from natural pigments: deep river teal/blue-green, clay/terracotta, ochre/sand, moss/olive, slate, warm off-white (light mode) and deep umber/charcoal-brown (dark mode). Define all colours as tokens in `src/styles/tokens.css` with light and dark sets, so restyling means editing tokens only.
- Status colours (normal/elevated/high/no data) must stay distinguishable and always paired with text + icon/shape.
- Bold typographic hierarchy using system fonts, or ONE self-hosted open-licence (OFL) variable font under ~60KB if it clearly adds value; no font CDNs.
- Signature elements welcome: flowing wave/contour SVG shapes, layered organic backgrounds, strong large numerals for readings, expressive cards, tasteful micro-interactions (CSS only, reduced-motion safe).
- Keep the CSS organised (tokens, base, components); components stay under ~150 lines; no new dependencies.

## 1. Brief constraints (pass/fail items marked ★)
- ★ Backend: **PHP REST API** (JSON over HTTP). No framework required; plain PHP 8.x with PDO.
- ★ DB: **MySQL/MariaDB**, own tables. NOT a copy of Environment Agency (EA) data.
- ★ Frontend: **JavaScript + React + Vite**, styled with **CSS** (library optional; we use plain CSS).
- ★ **Installable PWA** configured via Vite.
- ★ Deployed to **nuwebspace** (university server): frontend + backend reachable at one submitted URL.
- External service: **EA Flood Monitoring API** (no key). Used to support app features, not just display EA data.
- No user authentication required (do not build it).
- App must NOT claim to give safety-critical flood advice or replace official EA information. Show a visible disclaimer.
- Extra features earn credit only if all core requirements are complete and well built.
- Submission: deployed URL, backend zip (all PHP, `.sql` schema, top-level `README.md`), frontend zip (source, no `node_modules`), coversheet with AI declaration.

### Core functional requirements (must all work through the UI)
1. Search/select an EA station and see latest reading(s).
2. View monitoring info in React.
3. Create/save a location record linked to a station.
4. View, update, delete saved locations.
5. Create, view, update, delete preparedness actions for a saved location.
6. Location detail view = own stored info + its actions + live EA data.

### Core quality requirements
Usability (clear labels, loading/success/error feedback) · Responsiveness (mobile + desktop) · Reliability (survives invalid input, DB errors, slow/failed/empty EA responses; app stays usable without EA data) · Data integrity (server-side validation, prepared statements for ALL queries, no credentials/internals in errors) · Performance (no unnecessary requests, optimised production build) · Maintainability (clear structure, separation of concerns).

## 2. Design inspiration (ideas only; no copying)
We take **UX ideas and information architecture** from two public apps, re-implemented from scratch using only the EA data we have. Do NOT copy logos, icons, wording, colours, or assets from either app (the Red Cross emblem is legally protected). Do NOT imitate forecasting.

| Idea | Inspired by | How we implement it (in scope) |
|---|---|---|
| Clear status at a glance with colour AND text/icon | Google Flood Hub | Reading "status chip" on location cards (e.g. Normal / Elevated / High / No data) derived from the station's typical range where EA provides it (`stageScale`/typical high/low), else "Reading only". Never colour-only (accessibility). |
| Recent trend, not only a single number | Flood Hub | Small trend (last ~24h readings) as a simple inline SVG sparkline + "rising/falling/steady" label. No chart library. |
| "Last updated" and data-source transparency | Flood Hub | Show reading timestamp, "Source: Environment Agency", stale-data warning if reading older than a threshold. |
| Location-centred home screen | Flood Hub | Home = saved locations as cards with latest status. |
| Checklist-driven preparedness | Red Cross Emergency app | Actions as checklists per location with categories (Documents, Supplies, Home, People, Evacuation), priority, optional due date, done toggle, progress bar. |
| One-tap starter checklists | Red Cross Emergency app | "Add suggested actions" button inserts a generic template list (client-side constant, editable afterwards). Generic educational items only. |
| Simple, calm, readable UI | both | Large tap targets, plain language, high contrast, mobile-first. |

**Explicitly out of scope (do not build):** accounts/login, push notifications, map, forecasts/ML, shelter finders, "I'm safe" sharing, first-aid content, multi-language, social features. Optional stretch only after core is done and tested: EA current flood warnings (`/id/floods`) for the location's area, and offline reading of last cached location list.

## 3. Tech stack & structure
Backend: PHP 8.x, PDO (MySQL), cURL for EA calls. No Composer dependencies unless unavoidable.
Frontend: React 18 + Vite + `react-router-dom` + `vite-plugin-pwa`. Plain CSS with CSS variables, mobile-first. State: `useState`/`useReducer` + small custom hooks (no Redux, no TanStack Query).

```
backend/                       (upload to nuwebspace; zip for submission)
  public/index.php             front controller + router
  public/.htaccess             rewrite to index.php
  src/Http/Router.php          method+path matching
  src/Http/Response.php        json(status, body), error(status, code, message)
  src/Controllers/StationController.php
  src/Controllers/LocationController.php
  src/Controllers/ActionController.php
  src/Repositories/LocationRepository.php   (PDO, prepared statements only)
  src/Repositories/ActionRepository.php
  src/Services/EaClient.php    cURL, timeouts, JSON decode, normalise, short cache
  src/Validation/Validator.php
  config/config.sample.php     committed; real config.php gitignored and never in errors
  database/schema.sql
  README.md
frontend/
  vite.config.js               PWA manifest + service worker
  src/api/client.js            fetch wrapper (base URL from env, JSON, error normalisation, AbortController)
  src/hooks/useApi.js          {data, loading, error, reload}
  src/pages/ Home, StationSearch, LocationForm, LocationDetail
  src/components/ StationCard, ReadingPanel, Sparkline, StatusChip, ActionList, ActionForm, Feedback (loading/error/success), Disclaimer
  src/constants/actionTemplates.js
  src/styles/ tokens.css, base.css, components.css
```

## 4. Database (schema.sql)
```sql
CREATE TABLE locations (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  station_reference VARCHAR(50) NOT NULL,       -- EA stationReference (stable id)
  station_label VARCHAR(150) NULL,              -- cached label for display if EA is down
  river_name VARCHAR(100) NULL,
  town VARCHAR(100) NULL,
  notes TEXT NULL,
  risk_note VARCHAR(255) NULL,                  -- user's own note, not advice
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_station (station_reference)
) ENGINE=InnoDB;

CREATE TABLE actions (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  location_id INT UNSIGNED NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NULL,
  category ENUM('documents','supplies','home','people','evacuation','other') NOT NULL DEFAULT 'other',
  priority ENUM('low','medium','high') NOT NULL DEFAULT 'medium',
  due_date DATE NULL,
  is_done TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_action_location FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE,
  INDEX idx_location (location_id)
) ENGINE=InnoDB;
```
Include a few INSERT seed rows in the `.sql` for demo/testing.

## 5. REST API (all JSON; `Content-Type: application/json`)
Error shape: `{"error":{"code":"VALIDATION_ERROR","message":"...","fields":{"name":"required"}}}`. Never include SQL, stack traces, paths or config. Log details server-side only (`error_log`).

| Method | Endpoint | Purpose | Success | Errors |
|---|---|---|---|---|
| GET | /api/stations?search=&limit= | Proxy EA station search (normalised) | 200 list (may be empty) | 400 bad params, 502/504 EA unreachable/timeout |
| GET | /api/stations/{ref} | Station details + latest readings | 200 | 404 unknown, 502/504 |
| GET | /api/locations | List saved locations | 200 | 500 |
| POST | /api/locations | Create location | 201 + body + Location header | 400/422 validation, 500 |
| GET | /api/locations/{id} | One stored location | 200 | 404 |
| PUT | /api/locations/{id} | Update location | 200 | 404, 422 |
| DELETE | /api/locations/{id} | Delete (cascades actions) | 204 | 404 |
| GET | /api/locations/{id}/overview | Location + actions + EA data in one call | 200 (EA failure => `"external":{"status":"unavailable"}` with 200) | 404 |
| GET | /api/locations/{id}/actions | List actions | 200 | 404 |
| POST | /api/locations/{id}/actions | Create action | 201 | 404, 422 |
| PUT | /api/actions/{id} | Update action (incl. done toggle) | 200 | 404, 422 |
| DELETE | /api/actions/{id} | Delete action | 204 | 404 |

Also: 405 with `Allow` header for wrong method; 404 for unknown route; CORS only if needed in dev (same-origin in production).

**Validation rules (server-side, always):** name 1-100 chars trimmed; station_reference required, `^[A-Za-z0-9_\-]{1,50}$`; notes <= 2000; action title 1-150; category/priority must be in enum; due_date valid `Y-m-d`; ids positive integers; reject non-JSON bodies with 400/415; reject unknown fields silently or with 422 (pick one, be consistent).

## 6. EA API integration (EaClient.php)
Base: `https://environment.data.gov.uk/flood-monitoring`
- Search: `/id/stations?search={term}&_limit=20` (also useful: `parameter=level`)
- Station: `/id/stations/{stationReference}`
- Latest readings: `/id/stations/{stationReference}/readings?latest` (as given in brief)
- Recent trend (for sparkline): `/id/stations/{ref}/readings?_sorted&_limit=96` (verify against docs at /flood-monitoring/doc/reference before use)
- Stretch: `/id/floods` (current warnings)
Rules:
- cURL with `CURLOPT_CONNECTTIMEOUT` 3s, `CURLOPT_TIMEOUT` 6s, follow no redirects, check HTTP status, `json_decode` with error check.
- Defensive parsing: `items` may be empty; station may have no level measure; `measure` may be object or string; **`value` can occasionally be an array** (take first/last numeric); `latestReading`/`dateTime` may be missing. Never assume fields exist.
- Normalise to our own small shape before returning to the frontend (`{reference,label,river,town,measures:[{name,unit,latest:{value,dateTime}}]}`) so the frontend is decoupled from EA's format.
- **Cache** EA responses server-side for ~5 min (file cache in a writable temp dir, keyed by URL; EA data updates roughly every 15 min). This satisfies the "avoid unnecessary requests" requirement. Include `fetchedAt` in responses.
- On failure, return a typed result (`unavailable`, `timeout`, `empty`) and let controllers degrade gracefully (overview endpoint still returns stored data).
- First deployment task: confirm nuwebspace allows outbound cURL to the EA host. If blocked, report immediately (this is a critical risk).

## 7. Frontend behaviour
- Routes: `/` (saved locations), `/search` (find station), `/locations/new?station=REF`, `/locations/:id` (overview), `/locations/:id/edit`.
- Every async view shows: loading state, error state with Retry, empty state, and success confirmation (toast/inline). Use `aria-live="polite"` for feedback.
- Location detail: stored info, EA reading panel (value, unit, timestamp, status chip, sparkline), action checklist with progress, add/edit/delete actions. If EA fails, show stored info + actions and an inline "Live data unavailable. Retry" notice.
- Forms: visible `<label>`s, inline field errors from API `fields`, disable submit while pending, confirm before delete.
- Avoid duplicate requests: debounce station search (400ms), abort stale requests, don't refetch EA data on every re-render, use the single `/overview` call for the detail page.
- Responsive: mobile-first CSS grid/flex, min tap target 44px, works from 320px up, tested on desktop and phone.
- Always-visible footer disclaimer: "Educational project. Not an official flood warning service and not safety advice. Check the Environment Agency for official information."
- Accessibility basics: semantic HTML, focus states, contrast, status never by colour alone.

## 8. PWA & deployment (nuwebspace)
- `vite-plugin-pwa`: manifest (name, short_name, `display: standalone`, theme/background colours, 192 + 512 + maskable icons generated by us, original artwork), `registerType: 'autoUpdate'`, precache app shell. Do NOT cache API responses with a cache-first strategy; use network-first or no caching for `/api` so data is not stale.
- Installability needs HTTPS and a valid manifest + service worker; verify with DevTools > Application and Lighthouse, then on a real phone.
- Set Vite `base` and API base URL via `.env.production` to match the nuwebspace path. Verify the exact path/URL layout against the module's nuwebspace instructions (do not guess).
- SPA routing: add `.htaccess` in the frontend folder to rewrite unknown paths to `index.html` (excluding `/api`).
- Build with `npm run build`; upload `dist/` contents. DB config lives only in the server-side `config.php` (not in zip history/screenshots; ship `config.sample.php`).
- Pre-submit: open deployed URL from a different, non-logged-in machine and a phone; install as PWA; exercise every CRUD path.

## 9. Phases (one per session; stop after each)
1. **Foundation**: repo layout, `schema.sql`, config pattern, Router/Response/Validator, health route. Check: Postman GET on unknown route returns JSON 404.
2. **Backend CRUD**: locations + actions repositories/controllers with prepared statements and validation. Check: Postman collection covers valid, invalid, incomplete for every endpoint.
3. **EA integration**: EaClient, cache, `/stations`, `/stations/{ref}`, `/overview`. Check: simulate EA failure/empty/timeout (bad host or tiny timeout flag) and confirm graceful output. **Deploy a hello-world PHP + outbound cURL test to nuwebspace now.**
4. **Frontend core** (use frontend-design skill, plain CSS, mobile-first): Vite app, routing, api client, hooks, Search -> Create location -> list -> detail. Check: all six core requirements through the UI.
5. **Actions UI + design ideas** (use frontend-design skill, no elaborate visual identity): checklist, templates, progress, status chip, sparkline, disclaimer. Check: mobile + desktop.
6. **PWA + production build + deploy**: manifest, SW, `.htaccess`, upload, Lighthouse. Check: install on phone.
7. **Testing & README**: fill test record, polish docs, known limitations, cleanup (remove console.logs, dead code), final submission checklist.

## 10. DEVLOG.md (for Part II evidence; maintained by Claude Code per phase, student edits)
Append after each phase:
```
## YYYY-MM-DD, Phase N
Worked on: ...
Tools/approach: ...
Decision & why (trade-off): ...
Problem & fix: ...
AI prompt (short) -> what came back -> accepted/rejected/changed -> how verified: ...
```
Record real bugs and AI mistakes honestly (they make Part II stronger). Do not invent entries.

## 11. README.md requirements (backend zip, top level; keep concise)
1. Overview: app name, description, deployed URL.
2. Setup & deployment: import `schema.sql`, config, nuwebspace deployment of both parts, installing as PWA.
3. API endpoints: table (method, endpoint, purpose, request data, responses/status codes) + EA endpoints used.
4. Testing: table with columns **What tested | Input/action | Expected | Actual | Fix made**. Cover: core functional requirements via UI; every endpoint (valid + invalid + incomplete); EA unavailable/unsuccessful/empty; deployed app on desktop + mobile incl. PWA install.
5. Known limitations (be honest).
Must match the submitted code exactly. Mark AI-assisted README parts in the AI declaration.

## 12. Definition of done / do-not list
Done = all six core requirements via UI on the deployed URL, every endpoint tested and recorded, EA-failure handling demonstrated, installs as PWA on a phone, README accurate, zips correct (frontend without `node_modules`).
Do NOT: add auth, copy third-party branding/assets, claim official flood advice, expose errors/credentials, concatenate SQL, build features beyond core until core + tests are complete, or leave code the student cannot explain.