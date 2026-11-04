# DEVLOG

## 2026-11-04, Phase 1
Worked on: Backend foundation. Folder layout from CLAUDE.md section 3, `schema.sql` with seed data, `config.sample.php`, `.gitignore`, `Router`, `Response`, `Validator`, front controller `public/index.php` with a PDO helper, global exception handler and `GET /api/health`. Controllers, repositories and `EaClient` are empty stubs for later phases.
Tools/approach: Claude Code (Sonnet 5.5) generated the files from the Phase 1 spec. PHP built-in server (`php -S`) and curl for checks. Written for PHP 8.1+ (no enums, readonly classes or property hooks) because the nuwebspace PHP version is unconfirmed; local PHP is 8.5.
Decision & why (trade-off):
- A small hand-written autoloader in `index.php` instead of Composer. This avoids a dependency and a `vendor/` folder to upload, but classes must follow the folder/namespace convention.
- Config is read lazily inside `db()`, so routes that don't touch the DB (404/405) still work if `config.php` is missing.
- Router path is taken from the first `/api` in the URL, so the API still routes if nuwebspace serves it from a sub-folder. The exact deployed layout is still to be confirmed (Phase 6).
- `schema.sql` contains `DROP TABLE IF EXISTS` for easy re-import of demo data. This must be removed or avoided on any database holding real data.
- Seed station references (`1029TH`, `2067`, `4009`) are placeholders and are NOT yet verified against the live EA API. To check in Phase 3.
Problem & fix: None recorded yet. Not yet verified: the health route against a real database (needs the student's local `config.php`) and the schema import. Both are in the verification step below.
AI prompt (short) -> what came back -> accepted/rejected/changed -> how verified: "Read CLAUDE.md, do Phase 1 only, plan then build" -> all Phase 1 files -> accepted as generated -> `php -l` on every PHP file (no errors); curl on a missing route returned JSON 404; wrong method returned 405 with `Allow: GET`; health with no config returned a generic 503 with no internals. Still to verify by the student: schema import and health OK with a real DB.
