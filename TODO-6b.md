# Phase 6b / deployment TODO (placeholders to replace before submission)

- [ ] `frontend/public/.well-known/ard.json` and `ai-catalog.json` (identical copies, the second is for the older Chrome Lighthouse): replace the placeholder publisher `riverready.example` in `identifier` (`urn:air:<deployed-domain>:app:riverready`) and the placeholder `data` note (or use a real `url`). Keep both files in sync.
- [ ] `frontend/.env.production`: copy from `.env.production.example`; set `VITE_BASE` (nuwebspace sub-path, starts and ends with `/`) and `VITE_API_BASE`.
- [ ] `frontend/public/.htaccess`: untested; set `RewriteBase` to the real path (must match `VITE_BASE`), test deep-link refresh and that `/api` is not rewritten.
- [ ] `frontend/public/llms.txt`: add the deployed URL if wanted.
- [ ] Re-check `/robots.txt`, `/llms.txt`, `/.well-known/*.json` return real files (not index.html) on nuwebspace.
- [ ] Phone install on HTTPS; Lighthouse re-run in a clean profile (extensions skew Performance).
- [ ] Confirm outbound cURL to the EA host works on nuwebspace.
