# Fitness Philosophic PWA — Ground Truth

This is the local project ground truth for Claude Code, Codex, and project specialists. Read it
with `AGENTS.md`. Current source and user instructions take precedence when this file is stale.

## 1. Application

- React 18 and TypeScript single-page PWA built with Vite.
- Entry point: `src/app/main.tsx`; app shell: `src/app/App.tsx`.
- UI uses Tailwind CSS, Framer Motion, React Router, and an Atomic Design layout under `src/ui/`.
- Global state uses Zustand. Local persistent application data uses Dexie/IndexedDB.
- The app is browser-first and currently calls external AI services directly from the client.

## 2. Boot and Navigation

- `src/app/main.tsx` mounts `BrowserRouter`, imports translations, and registers PWA behavior.
- `src/navigation/useNavigationState.ts` selects `loading`, `language-selection`, `onboarding`,
  or `main-app` from profile/language state and the `ai-trainer:has-launched` localStorage key.
- `src/navigation/AppRouter.tsx` lazy-loads main pages; onboarding routes stay synchronous.
- Preserve the first-launch, incomplete-profile, and language-selection transitions when
  changing navigation or profile initialization.

## 3. Data and State

- `src/services/data/db.ts` defines `AITrainerDB` and versioned Dexie schemas.
- Profile ID is always `me`; entity IDs are strings; persisted timestamps are ISO strings.
- Stores under `src/stores/` often mirror IndexedDB state. Keep database writes and in-memory
  Zustand state consistent.
- Export/import uses schema versioning and Dexie transactions. New tables or fields must be
  considered in migrations, clear/reset, export, import, and cloud sync.
- Merge behavior commonly compares `updatedAt` or `createdAt`; define conflict semantics
  explicitly rather than silently overwriting newer local data.

## 4. AI Integration

- AI services use the shared `src/services/ai/aiGateway.ts`; model/config defaults are in
  `src/constants/`, while feature services own prompt and result validation.
- The OpenAI API key may come from `VITE_OPENAI_API_KEY` or
  `ai-trainer:openai-api-key` in localStorage.
- Never log, export, sync, or include API keys, OAuth tokens, authorization headers, or raw
  provider credentials in error metadata.
- AI responses are expected to be structured JSON. Parse and validate before storing or
  rendering; retain timeout, abort, retry, and rate-limit behavior.
- Prompts and user-visible AI output must respect the selected `ru`/`en` language.
- Fitness guidance must account for user constraints and avoid presenting model output as
  medical diagnosis or guaranteed-safe advice.

## 5. Workout Domain

- Canonical models live in `src/types/models.ts` and `src/types/body-metrics.ts`.
- Workouts distinguish planned/completed/skipped state, plans, manual overrides, RPE source,
  and AI feedback references.
- Use the shared functions under `src/services/fitness/` for kcal and duration totals.
- Week calculations use Monday as the start where specified. Be explicit about local-day
  versus timestamp behavior.
- Preserve links among workouts, plans, exercise estimates, AI feedback, metrics, and photos.

## 6. PWA and Offline

- `vite.config.ts` configures `vite-plugin-pwa` with an explicit user update prompt and a
  bounded Workbox precache.
- `src/services/pwa.ts` registers the service worker and update/offline-ready notifications.
- `src/hooks/useOffline.ts` exposes browser connectivity state.
- Do not cache credentials, authorization responses, or sensitive provider payloads.
- Service-worker and install/update behavior requires browser verification; a successful build
  alone is insufficient.

## 7. UI and Internationalization

- Follow the existing atoms → molecules → organisms → templates → pages structure.
- Reuse path aliases and barrel exports when that matches nearby code.
- Preserve keyboard access, focus-visible styling, readable errors, and touch targets.
- Russian and English are the supported languages. Add both translations for new UI text and
  keep language persistence/profile synchronization intact.
- Prefer validated forms and typed data over ad-hoc casts.

## 8. Errors and Observability

- Central error services live under `src/services/error/`; React boundaries and hooks wrap UI
  and async operations.
- Retry only transient failures. Do not retry validation, permission, authentication, or other
  deterministic failures without a concrete recovery strategy.
- Redact sensitive local data, photos, prompts, tokens, and authorization values from logs and
  exported diagnostics.

## 9. Tests and Tooling

- `npm run lint` — ESLint.
- `npm run typecheck` — TypeScript no-emit.
- `npm test -- --run` — one-shot Vitest.
- `npm run build` — TypeScript and Vite/PWA production build.
- React tests should use Vitest and React Testing Library, with browser APIs, fetch, IndexedDB,
  localStorage, and service workers mocked at the narrowest useful boundary.
- Real OpenAI, OAuth, Drive, installability, and offline scenarios require explicit manual or
  integration verification.

## 10. Gotchas

- Some documentation describes intended architecture and may lag current source; inspect code.
- Browser storage is part of product state. Clearing or migrating it can lose user fitness data.
- API/OAuth work is security-sensitive because provider calls run in the browser.
- Updating a Dexie schema without covering export/import/sync can create silent data loss.
- AI output is untrusted input even when the prompt asks for strict JSON.

## 11. AI-Assisted Development / OpenSpec

- Start uncertain work with `/opsx:explore`.
- Create implementation-ready artifacts with `/opsx:propose <change>`.
- Implement with `/opsx:apply <change>` after reading all returned context files and the
  matching specialist.
- Keep tasks current and revise artifacts when source investigation invalidates assumptions.
- Sync living specs with `/opsx:sync`; archive only after implementation and verification.
- Run `openspec update` after upgrading `@fission-ai/openspec`; generated workflow files are
  managed and should not be edited manually.
