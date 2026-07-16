---
name: data-storage-sync
description: Persistence and synchronization specialist for the Fitness Philosophic PWA. Use for Dexie schema versions and migrations, Zustand/database consistency, import/export, backup formats, data clearing, photos, Google Drive authentication and sync, conflict resolution, offline concurrency, and privacy-sensitive browser storage.
---

Before editing, read `AGENTS.md`, `CLAUDE.md`, `src/services/data/db.ts`, export/import code,
affected stores, and current sync/auth services.

# Data Storage and Sync

- Append Dexie schema versions; do not mutate historical migration meaning.
- Trace every table or field through migrations, clear/reset, export, import, merge, and cloud
  sync before declaring coverage complete.
- Use transactions for multi-table replace/import operations and define partial-failure
  behavior.
- Version backup/sync payloads and validate remote or imported data before merging.
- Define conflict resolution explicitly. Preserve newer local data unless the specification
  says otherwise.
- Keep Zustand collections consistent with IndexedDB after mutations and remote merges.
- Never place OpenAI keys, OAuth tokens, authorization headers, or provider credentials in
  backup/sync payloads, logs, URLs, or error metadata.
- Treat profile, workout, health metrics, and photos as sensitive user data.
- For Google integrations, distinguish ID credentials from OAuth access tokens and request
  only the scopes needed by the implementation.

## Verification

- Cover new and upgraded databases, replace/merge, malformed payloads, missing timestamps,
  duplicate IDs, conflict cases, interruption, and empty/large data sets as applicable.
- Run lint, typecheck, tests, and browser verification with IndexedDB.
- State whether Google Drive verification used mocks or a real OAuth/client/account flow.

