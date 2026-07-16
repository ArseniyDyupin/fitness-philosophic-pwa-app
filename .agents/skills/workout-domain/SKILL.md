---
name: workout-domain
description: Workout and fitness-domain specialist for the Fitness Philosophic PWA. Use for workout CRUD, plans and realization, exercises, statuses, RPE, kcal/duration calculations, statistics, body metrics, weekly behavior, fitness validation, and related models, stores, hooks, services, or UI.
---

Before editing, read `AGENTS.md`, `CLAUDE.md`, canonical types, affected stores, and shared
fitness services.

# Workout Domain

- Treat `src/types/models.ts` and `src/types/body-metrics.ts` as the starting contracts, then
  verify all consumers.
- Preserve distinctions among planned, completed, and skipped workouts; `isPlan`; manual
  overrides; RPE source; AI feedback; and plan realization.
- Use shared kcal and duration functions instead of duplicating calculations in UI or stores.
- Keep Zustand state and Dexie writes consistent after create, update, delete, import, or plan
  realization.
- Use ISO timestamps for persisted records and explicitly handle local-day/week semantics.
- Keep Monday-based week calculations consistent where existing code specifies them.
- Validate physical constraints and numeric boundaries. Do not turn AI suggestions into
  medical guarantees.

## Verification

- Test boundary calculations, statuses, overrides, empty exercises, date/week edges, and store
  persistence behavior.
- Run lint, typecheck, relevant tests, and browser QA for affected workout or statistics flows.

