---
name: i18n
description: Internationalization specialist for the Fitness Philosophic PWA. Use for Russian and English translations, translation keys, language selection, profile/localStorage persistence, localized validation and errors, date/number formatting, and language-aware AI prompts or responses.
---

Before editing, read `AGENTS.md`, `CLAUDE.md`, `src/app/i18n.ts`,
`src/stores/i18n.store.ts`, profile language handling, and affected UI.

# Internationalization

- Update Russian and English together for every new user-visible string.
- Trace which translation system the affected component currently uses before adding keys.
- Preserve first-launch language selection, localStorage persistence, and profile-language
  synchronization.
- Avoid hard-coded fallback strings that drift from translation resources.
- Account for longer Russian copy, pluralization, dates, units, decimal formatting, and error
  messages.
- Keep AI prompt language and expected response language aligned with the UI/profile setting.
- Do not translate identifiers, persisted enum values, schema keys, or provider payload fields.

## Verification

- Exercise the affected path in both languages, including reload/persistence and long text.
- Run lint, typecheck, and relevant tests.

