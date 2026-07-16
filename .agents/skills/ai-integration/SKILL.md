---
name: ai-integration
description: OpenAI integration specialist for the Fitness Philosophic PWA. Use for prompts, structured AI responses, workout/body analysis, API-key handling, rate limiting, abort/retry behavior, model configuration, and AI safety or privacy changes under src/services/ai, src/stores/ai.store.ts, src/types/ai.ts, or related UI.
---

Before editing, read `AGENTS.md`, `CLAUDE.md`, and the current AI service, types, constants,
and caller code.

# AI Integration

- Keep provider boundaries in `src/services/ai/`; keep UI and stores focused on state and
  presentation.
- Treat model output as untrusted input. Parse JSON defensively and validate its full shape
  before persistence or rendering.
- Preserve API-key lookup, abort signals, timeouts, rate limiting, and provider-specific error
  mapping unless the change explicitly replaces them.
- Never log, export, sync, or place API keys, bearer tokens, authorization headers, raw
  credentials, or sensitive photos in diagnostic metadata.
- Keep Russian and English prompts/output aligned with the selected language.
- Include profile goals, constraints, recent activity, and consent only when the feature needs
  them. Avoid medical diagnosis or guaranteed-safety claims.
- Keep model names and request limits centralized where the existing source does so.

## Verification

- Add focused tests with mocked `fetch` for success, invalid JSON/schema, 401, 429, 5xx,
  timeout/abort, and rate-limit behavior as applicable.
- Run lint, typecheck, and relevant tests.
- Describe live-provider verification separately; never require or expose a real key in tests.

