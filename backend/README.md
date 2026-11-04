# RiverReady (KV6025 Flood Preparedness & Monitoring App)

## 1. Overview
RiverReady lets a user search Environment Agency (EA) monitoring stations, save locations linked to a station, see the latest EA reading and a 24h trend for each, and keep a preparedness checklist per location. The PHP REST API stores locations and actions in its own MySQL/MariaDB tables; EA data is fetched live (never copied into the database) and cached for 5 minutes.

- Deployed URL: **TBD, fill in after deployment**
- Stack: PHP 8.1+ (plain PHP, PDO, cURL) backend; React 18 + Vite + plain CSS installable PWA frontend.
- **Disclaimer:** educational project. Not an official flood warning service and not safety advice. Check the Environment Agency for official information.
- No user authentication (not required by the brief).

## 2. Setup
Requirements: PHP 8.1+ with `pdo_mysql` and `curl`, MariaDB/MySQL, Node 20+ for the frontend (built here with Node 24; Vite 8 needs a recent Node).

1. **Database:** create a database and user, then import the schema (it includes demo seed rows):
   `mysql -u <user> -p <database> < database/schema.sql`
   Warning: `schema.sql` starts with `DROP TABLE IF EXISTS`; do not re-import on a database holding data you want to keep.
2. **Config:** copy `config/config.sample.php` to `config/config.php` and fill in the DB host, name, user and password. `config.php` is gitignored and never shown in errors. The `ea` block holds the EA base URL, timeouts (3s connect, 6s total), cache TTL (300s) and cache directory (must be writable; defaults to the system temp dir).
3. **Run the API locally** (from the repo root):
   `php -S localhost:8000 -t backend/public backend/public/index.php`
   Check: `curl localhost:8000/api/health` returns `{"status":"ok",...}`.
4. **Run the frontend locally:** `cd frontend && npm install && npm run dev` (Vite proxies `/api` to `localhost:8000`).
5. **Production build:** copy `frontend/.env.production.example` to `.env.production`, set `VITE_BASE` and `VITE_API_BASE`, then `npm run build` and upload `dist/`.
6. **Deployment to nuwebspace and installing as a PWA:** PENDING (manual). To be filled in after deployment.

Failure simulation (used in the tests below): the env vars `RIVERREADY_EA_BASE_URL`, `RIVERREADY_EA_TIMEOUT` and `RIVERREADY_EA_CONNECT_TIMEOUT` override the EA config for one server process.

## 3. API endpoints
All requests and responses are JSON. Errors: `{"error":{"code","message","fields?"}}`. Write requests need `Content-Type: application/json`. Unknown JSON fields are ignored. PUT merges the supplied fields over the stored record, then validates the result.

| Method | Endpoint | Purpose | Request data | Responses |
|---|---|---|---|---|
| GET | /api/health | DB health check | none | 200, 503 |
| GET | /api/stations | Search EA stations (normalised) | query `search` (required, max 60), `limit` (1-20, default 20) | 200 `{items, fetchedAt}` (items may be empty), 400, 502, 504 |
| GET | /api/stations/{ref} | Station details + latest readings | path `ref` (`A-Za-z0-9_-`, max 50) | 200 `{station, status}`, 400, 404, 502, 504 |
| GET | /api/measures/{id}/readings | Recent readings for one measure (trend) | query `hours` (1-48, default 24) | 200 `{items, fetchedAt}` (oldest first, may be empty), 400, 502, 504 |
| GET | /api/locations | List saved locations | none | 200 |
| POST | /api/locations | Create location | `name` (required, max 100), `station_reference` (required), optional `station_label` (150), `river_name` (100), `town` (100), `notes` (2000), `risk_note` (255) | 201 + `Location` header, 400, 415, 422 |
| GET | /api/locations/{id} | One stored location | none | 200, 404, 422 (bad id) |
| PUT | /api/locations/{id} | Update location | any location fields above | 200, 400, 404, 415, 422 |
| DELETE | /api/locations/{id} | Delete location (cascades actions) | none | 204, 404, 422 |
| GET | /api/locations/{id}/overview | Location + actions + live EA data | none | 200 (EA failure gives `external.status` of `unavailable`, `timeout` or `empty`, still 200), 404, 422 |
| GET | /api/locations/{id}/actions | List actions | none | 200, 404 |
| POST | /api/locations/{id}/actions | Create action | `title` (required, max 150), optional `description`, `category` (documents, supplies, home, people, evacuation, other), `priority` (low, medium, high), `due_date` (`Y-m-d`), `is_done` (boolean) | 201 + `Location` header, 400, 404, 415, 422 |
| PUT | /api/actions/{id} | Update action (incl. done toggle) | any action fields above | 200, 400, 404, 415, 422 |
| DELETE | /api/actions/{id} | Delete action | none | 204, 404 |

Wrong method on a known path returns 405 with an `Allow` header; unknown path returns JSON 404. Body over 64 KB returns 413 (from DEVLOG Phase 2, not re-run).

**EA endpoints used** (base `https://environment.data.gov.uk/flood-monitoring`, no key):
- `/id/stations?search={term}&_limit={n}` station search
- `/id/stations/{ref}` station details, with the embedded latest reading and typical range
- `/id/measures/{id}/readings?since={now-hours}&_sorted&_limit=100` trend data

## 4. Testing
Tests marked "this session" were run with curl against the local PHP server and local MariaDB on 2026-11-04. Rows tagged "DEVLOG" come from earlier phases' recorded results. Rows marked PENDING (manual) are for me to fill in. The "Fix made" column is "None" where no bug was found.

### 4.1 Core requirements through the UI
| What tested | Input/action | Expected | Actual | Fix made |
|---|---|---|---|---|
| 1. Search and select station, see latest reading | PENDING (manual) | | PENDING (manual) | |
| 2. Monitoring info shown in React | PENDING (manual) | | PENDING (manual) | |
| 3. Create location linked to station | PENDING (manual) | | PENDING (manual) | |
| 4. View, update, delete location | PENDING (manual) | | PENDING (manual) | |
| 5. Create, view, update, delete actions | PENDING (manual) | | PENDING (manual) | |
| 6. Detail view = stored info + actions + live EA data | PENDING (manual) | | PENDING (manual) | |
| EA failure in UI shows stored data + "Retry" | PENDING (manual) | | PENDING (manual) | |
| Desktop and phone layout (320px up) | PENDING (manual) | | PENDING (manual) | |
| Deployed on nuwebspace (desktop + phone) | PENDING (manual) | | PENDING (manual) | |
| PWA install on phone | PENDING (manual) | | PENDING (manual) | |
| PWA install on desktop Chrome | Install from address bar | Installs | DEVLOG 6a: install works | None |
| Offline reload | Go offline, reload | App shell with "Could not reach server" + Retry | DEVLOG 6a: as expected | None |
| Lighthouse | Desktop run | Good scores | DEVLOG 6a: Accessibility 100, Best Practices 100, SEO 82 (fixed with meta description + robots.txt); Performance 69 skewed by extensions, to re-run | Meta description added |

### 4.2 Locations endpoints (this session)
| What tested | Input/action | Expected | Actual | Fix made |
|---|---|---|---|---|
| List locations | GET /api/locations | 200 list | 200 | None |
| Create valid | POST `{"name":"Test Home","station_reference":"4009","station_label":"Colwick","notes":"n"}` | 201 + Location header | 201, `Location: /api/locations/7` | None |
| Get one | GET /api/locations/7 | 200 | 200 | None |
| Update valid (partial) | PUT `{"name":"Renamed"}` | 200, name changed | 200, name "Renamed", other fields kept | None |
| Create incomplete (no name) | POST `{"station_reference":"4009"}` | 422 + fields.name | 422 `fields.name: required` | None |
| Create incomplete (no station) | POST `{"name":"x"}` | 422 + fields.station_reference | 422 `fields.station_reference: required` | None |
| Invalid station ref | POST station_reference `bad ref!` | 422 | 422 with pattern message | None |
| Name too long | POST 101-char name | 422 | 422 "must be at most 100 characters" | None |
| Update to empty name | PUT `{"name":""}` | 422 | 422 `fields.name: required` | None |
| Non-JSON body | POST `not json` | 400 | 400 BAD_REQUEST | None |
| JSON array not object | POST `[1,2]` | 400 | 400 BAD_REQUEST | None |
| Empty body, JSON content type | POST, no body | 400 | 400 | None |
| Wrong content type | POST with `text/plain` | 415 | 415 | None |
| Unknown id | GET / PUT / DELETE /api/locations/999999 | 404 | 404 on all three | None |
| Bad id format | GET /api/locations/abc and /0 | 422 fields.id | 422 on both | None |
| SQL injection attempt | POST name `a'; DROP TABLE locations;--` | Stored as plain text, table intact | 201, stored literally, list still works | None |
| Delete valid | DELETE /api/locations/7 | 204, then GET gives 404 | 204, then 404 | None |
| Wrong method | PATCH /api/locations/7 | 405 + Allow | 405, `Allow: GET, PUT, DELETE` | None |
| Oversized body (>64 KB) | not re-run | 413 | DEVLOG Phase 2: 413 | None |

### 4.3 Actions endpoints (this session)
| What tested | Input/action | Expected | Actual | Fix made |
|---|---|---|---|---|
| Create valid | POST /api/locations/7/actions `{"title":"Pack bag","category":"supplies","priority":"high","due_date":"2026-12-01"}` | 201 + Location header | 201, `Location: /api/actions/11` | None |
| List actions | GET /api/locations/7/actions | 200 | 200 | None |
| Done toggle | PUT /api/actions/11 `{"is_done":true}` | 200, is_done true | 200, `is_done: true` | None |
| Incomplete (no title) | POST `{"description":"no title"}` | 422 | 422 `fields.title: required` | None |
| Bad category | `"category":"bogus"` | 422 | 422 lists allowed values | None |
| Bad priority | `"priority":"urgent"` | 422 | 422 lists allowed values | None |
| Impossible date | `"due_date":"2026-02-31"` | 422 | 422 | None |
| Wrong date format | `"due_date":"01/12/2026"` | 422 | 422 | None |
| Parent location missing | POST / GET /api/locations/999999/actions | 404 | 404 on both | None |
| Update unknown action | PUT /api/actions/999999 | 404 | 404 | None |
| Update empty title | PUT `{"title":""}` | 422 | 422 | None |
| Non-boolean is_done | PUT `{"is_done":"maybe"}` | 422 | 422 "must be true or false" | None |
| Wrong content type | POST with `text/plain` | 415 | 415 | None |
| Delete valid / unknown | DELETE /api/actions/11, then /999999 | 204 / 404 | 204 / 404 | None |
| Wrong method | GET /api/actions/1 | 405 + Allow | 405, `Allow: PUT, DELETE` | None |
| Cascade delete | Delete a location that has actions | Actions removed | Not re-run this session (DB constraint `ON DELETE CASCADE`) | PENDING (manual) |

### 4.4 System routes (this session)
| What tested | Input/action | Expected | Actual | Fix made |
|---|---|---|---|---|
| Health | GET /api/health | 200 | 200 `database: ok` | None |
| Unknown route | GET /api/nope | JSON 404 | 404 `NOT_FOUND` | None |
| Wrong method | DELETE /api/health | 405 + Allow | 405, `Allow: GET` | None |
| DB down | Health with no config | Generic 503, no internals | DEVLOG Phase 1: generic 503 | None |

### 4.5 EA endpoints (this session, live EA)
| What tested | Input/action | Expected | Actual | Fix made |
|---|---|---|---|---|
| Search valid | GET /api/stations?search=Colwick&limit=3 | 200 items | 200 with station 4009 | None |
| Search, no matches (empty) | search=Zzzzqqxx | 200, empty list | 200 `items: []` | None |
| Search missing / array term | no `search`; `search[]=x` | 400 | 400 `fields.search: required` on both | None |
| Search bad limit | limit=99, limit=abc | 400 | 400 `fields.limit` on both | None |
| Station details | GET /api/stations/4009 and /1029TH | 200 | 200 on both | None |
| Unknown station | GET /api/stations/NOSUCHSTATION | 404 | 404 | None |
| Bad station ref | GET /api/stations/bad%20ref | 400 | 400 | None |
| Readings valid | GET /api/measures/4009-level-stage-i-15_min-mASD/readings | 200 sorted points | 200 with points (third try, see below) | None |
| Readings bad hours | hours=999 | 400 | 400 `fields.hours` | None |
| Readings unknown measure (empty) | /api/measures/nosuchmeasure/readings | 200 empty | 200 `items: []` (EA returns an empty list, not 404) | None |
| Overview OK | GET /api/locations/2/overview | 200, `external.status` ok | 200, `ok`, location + actions + EA data | None |
| Overview unknown / bad id | /999999/overview, /abc/overview | 404 / 422 | 404 / 422 | None |
| Overview, EA has no such station (empty) | Location with station_reference `NOSUCH999` | 200, `external.status` empty, stored data intact | 200, `"status":"empty"`; test row deleted afterwards | None |
| Cache | Repeat the same search | Fast second response | 0.0009 s for the repeat call (DEVLOG Phase 3 recorded 470 ms uncached vs 1 ms cached) | None |
| Real EA slowness | Same requests on a first attempt | n/a | Search, and twice the readings call, returned 504 `EA_TIMEOUT` because EA took longer than the 6s timeout (a direct curl to EA took 6.6 s); a retry succeeded | None needed; the timeout handling worked, and this is why the UI has Retry |

### 4.6 EA unavailable / timeout (this session, simulated)
| What tested | Input/action | Expected | Actual | Fix made |
|---|---|---|---|---|
| EA unreachable | Server with `RIVERREADY_EA_BASE_URL=https://nonexistent.invalid`: GET /api/stations?search=Colwick, /api/stations/4009, /api/measures/x/readings | 502 EA_UNAVAILABLE | 502 on all three, generic message | None |
| Overview with EA unreachable | GET /api/locations/2/overview on that server | 200, stored data + `external.status` unavailable | 200, `"status":"unavailable"`, `data: null`, actions present | None |
| EA timeout | Server with 1s timeouts and unroutable host `10.255.255.1`: GET /api/stations?search=Colwick | 504 EA_TIMEOUT | 504 | None |
| Overview with EA timeout | GET /api/locations/2/overview on that server | 200, `external.status` timeout | 200, `"status":"timeout"`, actions present | None |
| Locations list with EA down | GET /api/locations on the bad-host server | 200 (no EA dependency) | 200 | None |
| `curl_close` crash | Early Phase 3 run | EA calls work | DEVLOG Phase 3: every EA call returned 500 because `curl_close()` is deprecated in PHP 8.5 and the error handler turns warnings into exceptions | Removed `curl_close` |
| nuwebspace outbound cURL to EA | Upload and run `tools/nuwebspace-check.php` | EA reachable | PENDING (manual) | |

## 5. Known limitations
- No authentication: anyone with the URL can see and change all saved locations (the brief says not to build auth).
- EA station search is case-sensitive upstream. The server capitalises a term only when it was typed all lowercase, so some multi-word or hyphenated names may not match.
- EA can be slow (6+ seconds seen during testing). The API gives up at 6s and returns 504; the UI offers Retry. Caching only helps repeat requests within 5 minutes.
- Typical range (used for the High/Normal/Low chip) exists only for each station's "Stage" measure; other measures show "Reading only".
- The trend label ("rising/falling/steady") uses my own thresholds, not an EA rule. It is not a forecast.
- Home page makes one station request per saved location (fine for a small list, would need a batch endpoint to scale).
- PUT merges fields instead of strictly replacing the record; an empty `{}` body is a valid no-op.
- Offline: only the app shell loads; saved data and readings are not cached (API responses are deliberately network-only).
- `schema.sql` drops tables on import (demo convenience).
- Tested on PHP 8.5 locally; the nuwebspace PHP version is unconfirmed (code avoids 8.2+ only features).
- Some test rows above are still PENDING (manual): UI, phone and nuwebspace checks, cascade delete.
