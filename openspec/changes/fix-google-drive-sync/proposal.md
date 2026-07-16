## Why

The current Google Drive sync cannot reliably authenticate or persist data: it sends a Google
One Tap ID credential to the Drive API as if it were an OAuth access token, creates
metadata-only files without JSON content, and merges remote entities through store methods that
replace stable IDs. This risks failed sync, duplicate records, and silent loss of fitness data.

## What Changes

- Replace One Tap authentication with the Google Identity Services OAuth token model and the
  minimum `drive.appdata` scope.
- Keep short-lived OAuth access tokens in memory only and require a user gesture to authorize
  again after expiry.
- Store one versioned JSON backup in the hidden Google Drive application-data folder and use the
  Drive media upload endpoints for create and update.
- Reuse the canonical Dexie export/import bundle so every persisted table participates in sync.
- Validate remote payloads before import, serialize upload/download operations, and preserve the
  newer record for timestamped merge conflicts.
- Refresh Zustand mirrors after a successful remote merge and provide localized, actionable UI
  states for auth, offline, validation, and provider failures.
- Replace the aspirational Google Drive document with an accurate setup, security, conflict, and
  verification guide.

## Capabilities

### New Capabilities

- `google-drive-sync`: Secure browser OAuth authorization, hidden app-data backup storage,
  complete data transfer, validated conflict-aware merge, and recoverable UI behavior.

### Modified Capabilities

None. No living specifications exist yet.

## Impact

- Affected code: Google auth/Drive services, data export/import and sync orchestration, Zustand
  sync/auth stores, settings sync UI, translations, and Google Drive documentation.
- External systems: Google Identity Services and Google Drive API; a configured OAuth web client,
  authorized JavaScript origin, and enabled Drive API remain required.
- Privacy: fitness history, metrics, AI feedback, and user-provided photos are uploaded only after
  explicit authorization. OAuth tokens and OpenAI credentials are excluded from the payload and
  logs.
- Offline/compatibility: sync is explicitly unavailable offline; local-only application behavior
  and schema version 1 backup compatibility remain unchanged.
- Specialists: `data-storage-sync`, `testing`, `i18n`, `ui-components`, and `code-reviewer`.

