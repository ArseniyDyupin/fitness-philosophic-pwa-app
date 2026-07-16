# AI-Assisted Development

The repository includes a shared OpenSpec workflow plus project-specific Claude and Codex
specialists.

## Prerequisites

OpenSpec requires Node.js 20.19 or newer. This requirement applies to the OpenSpec CLI, not
necessarily to the application runtime.

```bash
npm install -g @fission-ai/openspec@latest
openspec --version
```

After upgrading OpenSpec, refresh generated workflow files:

```bash
openspec update
npm run check-agents
```

Do not manually edit generated files under:

- `.codex/skills/openspec-*`
- `.claude/skills/openspec-*`
- `.claude/commands/opsx/`

## Workflow

Use the smallest workflow that matches the change:

1. `/opsx:explore` — investigate an unclear problem without implementing.
2. `/opsx:propose <change>` — create proposal, specs, design, and tasks.
3. `/opsx:apply <change>` — implement tasks from the selected change.
4. `/opsx:sync` — merge delta specs into living specifications.
5. `/opsx:archive <change>` — archive after implementation and verification.

Use a proposal for non-trivial features, Dexie schema changes, external integrations, broad
refactors, and privacy/security-sensitive work. A small bug fix can proceed directly unless a
proposal is requested.

## Project Specialists

`AGENTS.md` routes work to specialists mirrored for both assistants:

- `ai-integration`
- `workout-domain`
- `data-storage-sync`
- `pwa-offline`
- `ui-components`
- `i18n`
- `testing`
- `debugger`
- `code-reviewer`

Codex skills live in `.agents/skills/`; Claude agents live in `.claude/agents/`.
`CLAUDE.md` contains the project ground truth shared by both.

## Verification

Run checks proportional to the change:

```bash
npm run check-agents
npm run lint
npm run typecheck
npm test -- --run
npm run build
openspec validate --all
```

Browser-only paths need explicit browser verification:

- IndexedDB migrations and import/export
- service-worker install, offline reload, and updates
- OpenAI with a real API key
- Google OAuth and Drive synchronization

Report exactly what was exercised. Lint, typecheck, or build alone do not prove provider,
OAuth, IndexedDB migration, installability, or offline behavior.

## Review and Git

- Preserve unrelated staged and unstaged work.
- Do not commit or push unless asked.
- Non-trivial AI-authored changes should receive independent Claude/Codex cross-review before
  merge when the cross-review tooling is available.

