## 1. Core Reliability Baseline

- [x] 1.1 Add characterization/regression coverage for onboarding validation, single workout save,
  cold workout detail reload, reset, routing, and language/date behavior.
- [x] 1.2 Fix workout save/update idempotency, cold detail loading, Monday week initialization, and
  the broken workout-generation action.
- [x] 1.3 Fix trimmed onboarding validation, metric ranges, one completion action, full profile
  reset, and truthful home/workout actions.
- [x] 1.4 Correct core English/Russian strings and locale selection, then browser-smoke first launch,
  workout CRUD/reload, reset, and mobile layout.

## 2. Local Date Semantics

- [x] 2.1 Add a typed LocalDate module with parsing, formatting, today, comparison, and Monday-week
  helpers plus extreme-timezone tests.
- [x] 2.2 Migrate workout and plan date writes/queries/navigation to LocalDate while preserving
  legacy ISO compatibility.
- [x] 2.3 Migrate food, metrics, statistics, charts, and import/export date paths and add compatible
  persistence normalization where required.

## 3. Application Data Boundary

- [x] 3.1 Define repository ports and use cases for workout create/update/delete/get-by-id and adapt
  Dexie plus the workout store without breaking public consumers.
- [x] 3.2 Migrate plan generation/application and profile reset through transactional use cases with
  post-commit store synchronization.
- [x] 3.3 Make replace/merge import reload every affected store and enforce symmetric export/import
  size validation.
- [ ] 3.4 Add boundary coverage for failed transactions, stable IDs, cold reads, import recovery,
  and direct-Dexie call-site prevention.

## 4. Unified AI Gateway

- [x] 4.1 Introduce shared AI configuration, request content, provider error, and validated result
  contracts without exposing credentials.
- [x] 4.2 Migrate estimate and workout review to the gateway with mocked success, schema failure,
  auth, rate-limit, timeout, retry, and idempotency coverage.
- [x] 4.3 Migrate body analysis with consented image parts and tests proving images are sent only
  with consent.
- [x] 4.4 Migrate plan generation so selected dates persist once, stores refresh immediately, and
  loading/success/error/fallback UI states are truthful.

## 5. Focused Coaching Experience

- [x] 5.1 Align planned, in-progress, completed, and skipped workout transitions and implement the
  Home mark-done/delete/open-plan actions.
- [x] 5.2 Simplify Home and navigation around today's next action, weekly plan, completion, and
  progress while gating unfinished experimental surfaces.
- [x] 5.3 Add English/Russian component and browser coverage for the focused weekly flow.

## 6. Adaptive Weekly Review

- [x] 6.1 Add WeeklyReview models, Dexie schema/migration, repository/use cases, reset, and canonical
  export/import/Drive bundle coverage.
- [x] 6.2 Implement factual weekly summary plus validated feedback form in English and Russian.
- [x] 6.3 Implement deterministic offline recommendations and optional validated AI recommendations
  with health-safe copy.
- [x] 6.4 Present plan diffs and apply accepted changes transactionally while recording accepted or
  declined decisions.
- [x] 6.5 Add unit/component/browser coverage for no-key, offline, invalid-AI, accept, decline,
  reload, and restore scenarios.

## 7. Backup and Recovery Contract

- [x] 7.1 Consume the canonical `fix-google-drive-sync` export/import contract and label provider UI
  as explicit backup/upload/merge rather than unsupported background sync.
- [x] 7.2 Add backup size preflight, checksum/version preview, and symmetric local/Drive restore
  limits with localized recovery errors.
- [ ] 7.3 Verify malformed, replace, merge, newer-local, photo-heavy, offline, mocked OAuth, and
  mocked Drive provider paths without using real credentials.

## 8. Truthful Accessible UX

- [x] 8.1 Inventory exposed actions and implement missing loading, disabled, success, error,
  confirmation, and double-activation behavior.
- [x] 8.2 Upgrade the shared dialog primitive with semantics, labelled controls, focus containment,
  Escape policy, scroll lock, and focus restoration; migrate custom modals.
- [x] 8.3 Complete Russian/English validation, errors, dates, units, and long-copy responsive checks
  at 320, 375, 768, and desktop widths.

## 9. Privacy, Security, and PWA Performance

- [x] 9.1 Redact credentials, raw prompts/photos, and sensitive profile metadata from persisted and
  exported diagnostics with focused privacy tests.
- [x] 9.2 Implement confirmed full local-data deletion across every Dexie table, application key,
  cache where supported, singleton service, and Zustand mirror.
- [x] 9.3 Upgrade vulnerable runtime dependencies compatibly and verify routing plus production
  behavior.
- [x] 9.4 Remove duplicate manifests and redundant source-size precache assets, align update UX with
  one strategy, and add bundle/precache budget reporting.
- [ ] 9.5 Browser-verify production install/update/offline shell and local CRUD recovery; clearly
  separate mocked and live provider evidence.

## 10. Automation, Documentation, and Review

- [x] 10.1 Repair the repository lint configuration and add a narrow Playwright production-preview
  suite for first launch, workout reload, reset, import recovery, mobile, and timezone behavior.
- [x] 10.2 Add CI-ready scripts for lint, typecheck, Vitest, build, browser smoke, dependency audit,
  and asset budgets without assuming a hosting provider.
- [x] 10.3 Update architecture, privacy, backup, AI, PWA, and QA documentation plus OpenSpec task and
  verification records as implementation discoveries occur.
- [x] 10.4 Run check-agents, OpenSpec validation, targeted and full automated checks, production
  browser QA, and independent Claude cross-review; address blockers and record unavailable live
  OpenAI/OAuth/Drive checks honestly.
