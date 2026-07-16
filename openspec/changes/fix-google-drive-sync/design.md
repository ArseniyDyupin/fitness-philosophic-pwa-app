## Context

The PWA stores canonical user data in Dexie and mirrors selected tables in Zustand. The current
Drive implementation uses One Tap identity credentials, persists them in localStorage, writes to
the Drive metadata endpoint, and implements a second incomplete export/merge path. Google Drive
sync therefore crosses authentication, network, persistence, privacy, and UI boundaries.

## Goals / Non-Goals

**Goals:**

- Use the supported Google Identity Services browser token model with least-privilege Drive
  access.
- Upload a complete, versioned, valid backup and merge it without duplicate IDs or newer-local
  data loss.
- Keep provider credentials out of durable browser storage, backups, URLs, logs, and UI errors.
- Make failure and recovery states deterministic and testable at provider boundaries.

**Non-Goals:**

- Background or automatic sync without a user gesture.
- Refresh tokens, a backend OAuth code exchange, end-to-end encryption, Drive file history UI, or
  incremental/delta sync.
- Synchronizing local app configuration such as OpenAI API keys.

## Decisions

1. **Use the GIS token model and `drive.appdata`.** `initTokenClient()` returns an OAuth access
   token suitable for Drive calls. The hidden application-data folder limits access to files
   created by this app. One Tap remains inappropriate because its ID credential proves identity
   but does not authorize Drive.

2. **Keep access tokens in memory.** The service records an expiry deadline and clears auth on
   expiry or HTTP 401. Reauthorization requires a user gesture, matching browser token-model
   constraints. No access token or auth header is persisted.

3. **Do not depend on profile scopes.** Drive authorization does not need the user's name, email,
   or picture. The UI shows an authorized-session state instead of requesting extra identity
   scopes and calling UserInfo.

4. **Use Drive media endpoints.** First upload uses `uploadType=multipart` to send metadata
   (`name`, `parents: ['appDataFolder']`) and JSON content atomically. Updates use
   `uploadType=media` against the existing file ID. Lookup searches only `appDataFolder`, excludes
   trashed files, orders by modified time, and never converts a provider error into “not found.”

5. **Reuse canonical export/import.** `exportAll()` is the only sync payload producer.
   `parseExportBundle()` validates downloaded objects before mutation. `importData(..., 'merge')`
   remains the transactional merge engine and is corrected so each table uses a stable canonical
   timestamp and profile merge no longer blindly overwrites newer local data.

6. **Reload store mirrors after merge.** Profile, workout, food, and weekly stores reload from
   Dexie after a successful transaction. Plans are rendered from Dexie elsewhere and the current
   AI configuration store is not used as a persistence source.

7. **Use one operation lock.** `DataSyncService` exposes one active operation rather than
   independent upload/download flags. Provider requests use an abort timeout and check online
   status before starting.

8. **Map stable error codes in the UI.** Services throw typed codes while stores preserve the
   code. Components translate known codes and use a generic fallback without embedding remote
   response bodies or user backup content.

## Risks / Trade-offs

- [Browser token model requires reauthorization after reload/expiry] → explain the session
  behavior in the UI and documentation; a backend code model is deferred.
- [Large photo-heavy JSON can approach Drive/simple-upload limits] → enforce the existing 20 MB
  backup limit before upload and return a specific error; resumable upload is deferred.
- [Legacy root-folder files are not visible through `appDataFolder`] → the corrected integration
  creates a new hidden backup; the broken implementation did not reliably upload content, so
  automatic migration is unsafe.
- [Timestamp quality varies by table] → define a per-table timestamp order with deterministic
  fallback; equal or missing timestamps preserve local records.
- [Live OAuth cannot be automated without credentials/account state] → cover provider boundaries
  with mocks and report live Drive verification separately.

## Migration Plan

1. Deploy the corrected token flow and hidden app-data storage.
2. Existing local data remains untouched until the user explicitly uploads or merges.
3. The first corrected upload creates the canonical hidden backup; no destructive migration of
   root Drive files occurs.
4. Rollback removes the UI integration but does not mutate local Dexie data or delete Drive data.

## Open Questions

- A backend authorization-code model may be considered later if silent refresh or scheduled sync
  becomes a requirement.
- Resumable uploads may be needed if the product intentionally supports backups above 20 MB.

