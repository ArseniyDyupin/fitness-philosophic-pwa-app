---
name: testing
description: Test specialist for the Fitness Philosophic PWA. Use for Vitest and React Testing Library unit, component, store, hook, service, import/export, browser-API, and integration coverage; for designing mocks around fetch, localStorage, IndexedDB, service workers, OpenAI, or Google Drive; and for flaky-test triage.
---

Before editing tests, read `AGENTS.md`, `CLAUDE.md`, the implementation, package scripts, and
existing test/setup patterns.

# Testing

- Test observable behavior and contracts, not internal implementation details.
- Use Vitest and React Testing Library for new automated coverage.
- Mock at provider/browser boundaries: `fetch`, localStorage, IndexedDB/Dexie, service workers,
  connectivity, timers, OpenAI, and Google APIs.
- Reset singleton services, Zustand stores, timers, storage, and mocks between tests.
- Cover success, validation, permission/auth, network/offline, retry/abort, and recovery paths
  proportional to risk.
- Keep provider credentials and real user data out of fixtures.
- Prefer targeted tests beside affected behavior; avoid broad snapshots as the only assertion.

## Verification

- Run the narrowest relevant test first, then `npm test -- --run` when shared behavior changes.
- Run lint and typecheck for test code. Report browser/provider paths that remain manual.

