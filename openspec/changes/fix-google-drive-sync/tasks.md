## 1. Contract and Documentation

- [x] 1.1 Replace the inaccurate Google Drive plan with the supported OAuth, app-data, payload,
  conflict, privacy, setup, and manual-verification contract.
- [x] 1.2 Add typed backup parsing and deterministic per-table merge rules to the canonical data
  import path.

## 2. Google Provider Integration

- [x] 2.1 Replace One Tap ID authentication with the GIS OAuth token model, in-memory expiry, and
  revoke/unauthorized handling.
- [x] 2.2 Implement appDataFolder lookup, multipart create, media update, download, request timeout,
  size limit, and typed provider errors.

## 3. Sync Orchestration and UI

- [x] 3.1 Rebuild sync orchestration around canonical Dexie export/import, one operation lock,
  offline checks, and store reload after merge.
- [x] 3.2 Update auth/sync stores and English/Russian UI for accurate session, privacy, progress,
  confirmation, and error states.
- [x] 3.3 Add validated runtime OAuth Client ID save/reset controls, local-only persistence, and
  safe authorization reset when the configured client changes.

## 4. Regression Coverage and Verification

- [x] 4.1 Add focused Vitest coverage for OAuth completion/cancellation, upload create/update,
  unauthorized handling, payload validation, operation locking, and merge orchestration.
- [x] 4.2 Run agent/OpenSpec validation, targeted tests, targeted lint, typecheck, build, and local
  server smoke; record unavailable visual/live-provider checks and whether OAuth/Drive used mocks
  or a real account.
- [x] 4.4 Add service and Settings UI regression coverage for runtime Client ID configuration and
  rerun the relevant verification matrix.
- [ ] 4.3 Run independent Claude cross-review and address blocker findings before handoff.

## Verification Record

- OAuth and Drive API behavior: provider-boundary mocks only; no real client ID/account flow.
- Local runtime: Vite served `http://127.0.0.1:5175/` with HTTP 200.
- Visual browser verification: unavailable because the required browser-control runtime was not
  exposed in this session.
- Full `npm run lint`: blocked before source analysis by the repository's existing Vue/Rushstack
  ESLint config; targeted TypeScript/React hooks lint for changed files passed.
- Independent cross-review: attempted with `cross-review.sh --working-tree --tool claude`, but
  Claude Code returned HTTP 401 for its configured credentials.
- Runtime Client ID coverage: service and Settings component tests cover validation, local
  persistence, environment fallback, token revocation on change, and reset.
- Current verification: `npm run verify` passed with 15 test files / 47 tests, production build,
  build budget, and agent checks. Browser smoke passed save/reload/reset at the default viewport
  and at 320 px with no horizontal overflow.
- Live Google OAuth/Drive account flow remains pending; browser verification used a syntactically
  valid test Client ID only and did not open the provider popup.
