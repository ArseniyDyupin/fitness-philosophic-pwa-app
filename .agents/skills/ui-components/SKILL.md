---
name: ui-components
description: React UI specialist for the Fitness Philosophic PWA. Use for Atomic Design components, pages, modals, forms, navigation, Tailwind styling, Framer Motion, responsive behavior, accessibility, loading/error states, and typed UI composition under src/ui, src/templates, src/navigation, or src/hooks.
---

Before editing, read `AGENTS.md`, `CLAUDE.md`, nearby components, barrel exports, and the
relevant store/hook/service boundary.

# UI Components

- Follow atoms → molecules → organisms → templates → pages; place logic at the narrowest
  reusable layer.
- Reuse existing path aliases, atoms, form patterns, toasts, error boundaries, and transitions.
- Keep business logic in hooks/services/stores rather than duplicating it in view components.
- Preserve keyboard navigation, labels, focus-visible rings, semantic controls, readable error
  messages, and touch targets.
- Design mobile-first and verify small screens, long Russian text, loading, empty, error, and
  disabled states.
- Keep async actions idempotent where double taps or rerenders are possible.
- Update barrel exports only when the surrounding folder uses them.

## Verification

- Add React Testing Library coverage for interactions and states when practical.
- Run lint, typecheck, relevant tests, and browser QA at mobile and desktop widths.

