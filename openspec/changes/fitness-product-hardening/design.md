## Context

The browser app treats Dexie as canonical persistence while several Zustand stores mirror the
same entities. Today some pages read only the in-memory mirror, some services write Dexie
directly, and some forms perform more than one persistence call for one user action. Calendar
days are represented as generic strings and converted through UTC `Date`, while AI capabilities
use separate key lookup, message, validation, and persistence paths. These boundaries explain the
observed reload, duplicate, timezone, plan, photo, import, and reset failures.

The change spans `src/navigation`, `src/ui`, `src/stores`, `src/services/data`,
`src/services/ai`, `src/services/fitness`, translations, tests, and PWA configuration. Existing
fitness history and the active `fix-google-drive-sync` change must be preserved.

## Goals / Non-Goals

**Goals:**

- Make each user action produce one durable, observable state transition that survives reload.
- Represent local calendar days without implicit UTC conversion and use Monday consistently.
- Route persistent mutations through small use cases/repositories and refresh mirrored stores.
- Present one AI configuration/provider boundary with validated output and multimodal support.
- Deliver an explainable weekly review and a focused plan-to-completion coaching loop.
- Make exposed actions accessible and truthful while reducing sensitive logging and PWA weight.
- Protect behavior with targeted unit/component tests plus a small production-browser suite.

**Non-Goals:**

- A backend, account system, medical decision support, silent OAuth refresh, scheduled Drive sync,
  enterprise state framework, or wholesale UI redesign.
- Reimplementing Google OAuth/Drive provider behavior owned by `fix-google-drive-sync`.
- Replacing all legacy modules in one atomic rewrite; migration is intentionally incremental.

## Decisions

1. **Deliver vertical slices in dependency order.** Core reliability and characterization tests
   land before boundary refactors. Date and repository primitives then migrate Workout first,
   followed by profile/import and plans. This keeps every intermediate revision usable. A single
   big-bang rewrite was rejected because current browser coverage is too thin.

2. **Use an explicit `LocalDate` string for calendar days.** New writes use validated
   `YYYY-MM-DD`; shared helpers parse legacy ISO values and compare dates without UTC round-trips.
   UTC ISO remains correct for event timestamps such as `createdAt` and `updatedAt`. A
   compatibility reader plus a Dexie migration/lazy normalization protects existing data.

3. **Treat repositories as persistence ports and use cases as mutation owners.** UI and AI code
   call operations such as create/update workout, generate-and-save plan, import, and reset. Dexie
   adapters own transactions; stores reload or apply the committed entity only after success.
   Read-only selectors may remain in stores while migration proceeds.

4. **Keep Zustand as a view-state mirror, not a second source of truth.** Direct reload by ID may
   query a repository when the mirror is cold. Import/reset operations explicitly reload or clear
   every affected store before reporting completion.

5. **Wrap existing provider code behind one `AIGateway`.** A shared configuration source updates
   every capability immediately. The gateway accepts text and image parts, validates structured
   output with Zod, classifies provider failures, and never persists. Application use cases own
   idempotent plan/estimate persistence. Existing low-level request code is adapted instead of
   introducing another SDK.

6. **Model weekly review as durable domain data.** A versioned `weekly_reviews` table records
   actual summary inputs, user answers, proposed adjustments, and accepted changes. Applying a
   proposal is a separate confirmed transaction. A deterministic non-AI recommendation keeps the
   feature useful offline or without a key.

7. **Use one accessible dialog primitive and an action contract.** Dialogs provide semantics,
   focus containment/restoration, Escape, and labelled close controls. Async actions expose
   loading, success, error, and disabled reasons. Experimental surfaces remain behind explicit
   flags until their core path is complete.

8. **Add a narrow Playwright layer rather than broad browser coverage.** Vitest remains the main
   fast suite. Playwright covers first launch, workout persistence/reload, reset, import recovery,
   and offline/PWA smoke in production preview at desktop and mobile sizes.

9. **Treat Drive as backup unless conflict-aware sync is proven.** This change consumes the
   canonical versioned export/import contract from `fix-google-drive-sync`; UI wording remains
   backup/merge oriented. Incremental multi-device sync, tombstones, and encryption remain future
   work unless separately specified.

10. **Use explicit privacy and performance budgets.** Diagnostics redact credentials, prompts,
    photos, and health-profile metadata by key and context. Full local deletion covers every Dexie
    table and browser key. PWA precache excludes source-size artwork, uses one manifest, and has a
    measurable asset budget. Dependency advisories are addressed through compatible upgrades and
    verified browser flows.

## Risks / Trade-offs

- [Legacy workout dates contain UTC timestamps] → accept both shapes, test extreme timezones, and
  normalize only inside a transaction with export compatibility.
- [Repository migration temporarily leaves two call styles] → migrate by entity, add boundary
  linting after call sites move, and keep stable store contracts during transition.
- [AI output and image requests vary by provider/model] → validate full responses, mock the wire
  boundary, and show recoverable fallback rather than persisting partial output.
- [Weekly review can overstate health guidance] → use advisory language, include constraints, and
  require confirmation before modifying the plan.
- [Service-worker changes can strand old assets] → retain one rollback-compatible release and
  verify upgrade behavior in a real production browser.
- [Adding Playwright increases install and CI cost] → keep five critical scenarios and reuse a
  single production preview server.
- [Full reset is destructive] → show explicit scope, require confirmation, and complete one
  transaction before clearing stores/navigation state.

## Migration Plan

1. Add characterization tests and narrow fixes for duplicate writes, cold details, reset,
   validation, routes, localization, and no-op actions.
2. Add LocalDate helpers that read legacy values; migrate new writes and comparisons, then
   normalize persisted date-only fields transactionally.
3. Introduce repository/use-case ports and migrate Workout, Profile/Reset, Import, and Plan in
   separate commits while preserving store APIs.
4. Add the unified AI gateway and migrate estimate, review, body photo, and plan callers.
5. Add weekly review schema, export/import coverage, UI, translations, and plan-apply transaction.
6. Complete action/accessibility, privacy, dependency, PWA, and browser-suite hardening.
7. Rollback uses the prior compatible readers and avoids deleting new tables; older builds ignore
   unknown IndexedDB tables but must not receive already-normalized data if they cannot parse it.

## Open Questions

- Whether encrypted Drive backups should be a separate opt-in change after the corrected backup
  flow has live OAuth verification.
- Whether experimental Food tracking remains hidden or graduates after it receives equivalent
  validation, localization, and end-to-end coverage.
- Which CI provider will run Playwright; scripts and configuration remain provider-neutral until
  repository hosting metadata selects one.
