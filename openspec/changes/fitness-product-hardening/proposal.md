## Why

The application already offers a broad local-first fitness experience, but core workout,
onboarding, date, AI, and recovery flows can diverge across reloads, languages, timezones, and
direct database writes. Stabilizing these foundations now lets the project grow into a reliable
personal coach instead of adding more features on top of inconsistent state.

## What Changes

- Stabilize onboarding, workout CRUD/details, plan generation, reset, import, routing, and home
  actions so persisted state and visible state remain consistent.
- Introduce explicit local-calendar date semantics and one application/repository boundary for
  persistent mutations and store refreshes.
- Consolidate AI configuration and provider calls behind one validated gateway with multimodal
  support, idempotent persistence, safe fallback behavior, and truthful UI states.
- Focus the primary product loop on weekly plans, planned/completed workouts, progress, and a new
  adaptive weekly review that proposes explainable plan changes for user confirmation.
- Expand regression and browser-flow coverage, accessibility, privacy controls, diagnostics
  redaction, dependency security, and PWA performance/update behavior.
- Treat the existing `fix-google-drive-sync` change as the source for corrected Drive backup
  behavior; this change only consumes its canonical backup/import contract and does not duplicate
  OAuth or provider work.

## Capabilities

### New Capabilities

- `core-fitness-flow`: Reliable onboarding, workout, plan, navigation, reset, and action behavior
  across persistence and reload boundaries.
- `local-date-semantics`: Timezone-safe local day and Monday-based week behavior for fitness data.
- `application-data-consistency`: Transactional repository/use-case mutations with synchronized
  IndexedDB and Zustand state, including import and reset recovery.
- `unified-ai-coaching`: One AI gateway for estimates, reviews, plans, and consented photos with
  shared key configuration, response validation, error handling, and idempotent persistence.
- `adaptive-weekly-review`: A review flow that summarizes the completed week and proposes
  explainable, user-approved adjustments to the next plan.
- `truthful-accessible-ux`: Every exposed action has real loading/success/error behavior and
  dialogs, forms, navigation, languages, and responsive layouts meet the accessibility contract.
- `privacy-pwa-hardening`: Sensitive-data redaction/deletion, secure dependency posture, lean PWA
  assets, coherent update behavior, and explicit offline verification.

### Modified Capabilities

None. No living specifications currently cover these behaviors. Google Drive requirements remain
owned by the active `fix-google-drive-sync` change.

## Impact

- Affected code: navigation, onboarding, workout/plan pages and stores, Dexie data services,
  import/reset, date utilities, AI services and settings, translations, shared dialogs, tests,
  lint/CI configuration, PWA configuration, assets, and diagnostics.
- Persistence: existing fitness data must remain readable; schema or date migrations require
  backward-compatible parsing, transactionality, and export/import coverage.
- Privacy and health safety: photos, profile constraints, prompts, credentials, and health data
  must not leak into logs, backups, or provider errors. AI output remains advisory and validated.
- Offline and compatibility: local CRUD must continue without a provider connection; real service
  worker, install/update, OAuth, Drive, and live OpenAI behavior require explicit browser/provider
  verification rather than build-only claims.
- Dependencies: Playwright may be added for critical browser flows; no backend or enterprise state
  framework is introduced.
- Specialists: `workout-domain`, `data-storage-sync`, `ai-integration`, `ui-components`, `i18n`,
  `pwa-offline`, `testing`, and `code-reviewer`.
