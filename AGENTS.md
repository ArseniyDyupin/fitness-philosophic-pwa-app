# Agent Orchestration

This repository is the Fitness Philosophic PWA: a React, TypeScript, Vite, Zustand, Dexie,
and OpenAI-powered browser application. Use this file as the shared routing and verification
layer for AI-assisted development.

## Authority Order

1. User instructions
2. Current source code and the user's working tree
3. `AGENTS.md`
4. Artifacts for the explicitly selected change under `openspec/changes/`
5. `CLAUDE.md`
6. `.agents/skills/<specialist>/SKILL.md`
7. `.claude/agents/<specialist>.md`

When documentation and source disagree, trust the source and update stale guidance in the same
change. Preserve unrelated staged and unstaged work.

## Before Non-Trivial Work

- Inspect relevant source and nearby tests before editing.
- Read `CLAUDE.md`.
- Select the matching specialist from the routing table.
- Check `openspec list --json` when the user references an OpenSpec change or proposal.
- Keep changes narrow and avoid new dependencies unless the requirement needs one.
- Treat API keys, OAuth credentials/tokens, health data, photos, and exported backups as
  sensitive data.

## OpenSpec Workflow

OpenSpec is the shared planning layer. It complements source inspection, specialists, tests,
and review; it does not override them.

- Use `/opsx:explore` while requirements or solution boundaries are unclear.
- Use `/opsx:propose <change>` before a non-trivial feature, storage/schema change, external
  integration, broad refactor, or security/privacy-sensitive change.
- Small, well-scoped bug fixes and mechanical maintenance do not require a proposal unless
  the user asks for one.
- Use `/opsx:apply <change>` only after reading its proposal, specs, design, and tasks.
- Keep task checkboxes current. Update artifacts when implementation discoveries change the
  intended behavior.
- Use `/opsx:sync` for living specs, then `/opsx:archive <change>` after implementation and
  verification are complete.
- Refresh generated files with `openspec update`; do not hand-edit `.codex/skills/openspec-*`,
  `.claude/skills/openspec-*`, or `.claude/commands/opsx/`.

OpenSpec requires Node.js 20.19 or newer. This is a tooling requirement and does not by itself
change the application's Node support.

## Specialist Routing

| Task shape | Specialist |
|------------|------------|
| OpenAI prompts/responses, JSON validation, API keys, rate limits, AI workout/body feedback | `ai-integration` |
| Workouts, plans, exercises, RPE, kcal/duration, body metrics, statistics | `workout-domain` |
| Dexie schema/migrations, import/export, backups, Google Drive auth/sync, conflict resolution | `data-storage-sync` |
| Service worker, install/update lifecycle, caching, connectivity, offline behavior | `pwa-offline` |
| React components, Atomic Design, Tailwind, forms, routing, responsive and accessible UI | `ui-components` |
| Russian/English translations, language selection, persistence, localized AI/UI behavior | `i18n` |
| Vitest/React Testing Library coverage, mocks, browser-flow test strategy | `testing` |
| Unknown root cause, cross-domain browser/storage/network failures | `debugger` |
| Independent review after implementation | `code-reviewer` |

## Verification Before Done

- Run `npm run lint` for source or configuration changes.
- Run `npm run typecheck` for TypeScript changes.
- Run `npm test -- --run` when changing shared logic or behavior with testable outcomes.
- Run `npm run build` when changing PWA configuration, routing, public assets, imports, or
  production bundling behavior.
- For UI changes, verify the affected path in a browser at relevant mobile and desktop sizes.
- For IndexedDB/import/export changes, exercise migration, replace/merge, malformed input, and
  data preservation as applicable.
- For OpenAI work, state whether verification used mocked fetch, code trace, or a live API key.
- For Google Drive work, state whether verification used mocks, local OAuth, or a real Drive
  account/client configuration.
- Do not claim offline, installability, service-worker update, OAuth, or live-provider behavior
  from lint/typecheck alone.

## Common Commands

- `npm run dev` — Vite development server.
- `npm run lint` — ESLint.
- `npm run typecheck` — TypeScript no-emit check.
- `npm test -- --run` — one-shot Vitest run.
- `npm run build` — TypeScript plus production Vite/PWA build.
- `npm run check-agents` — agent-layer integrity checks.
- `openspec validate --all` — validate active changes and living specs.
- `openspec update` — refresh generated OpenSpec workflows after a CLI upgrade.

## Cross-Review and Git

- Non-trivial AI-authored code should be independently reviewed before merge. When available,
  use `cross-review.sh --working-tree --tool claude|codex` or the staged equivalent.
- Never claim cross-review ran unless it actually did.
- Do not commit, push, discard, or rewrite user changes unless explicitly asked.
- If authoring a commit, include `Co-Authored-By: Codex <noreply@openai.com>`.

