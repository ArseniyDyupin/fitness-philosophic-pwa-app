## ADDED Requirements

### Requirement: Async actions expose complete states
The system SHALL provide a visible loading or disabled state during an action, a truthful success
state after commit, and a localized recoverable error after failure.

#### Scenario: User double-activates save
- **WHEN** save is already in progress and the user activates it again
- **THEN** no second mutation starts and the control communicates its busy state

### Requirement: Dialogs are keyboard and screen-reader accessible
The system SHALL expose dialog semantics, an accessible name, contained focus, Escape close where
safe, and focus restoration to the opening control.

#### Scenario: Keyboard user opens workout form
- **WHEN** the dialog opens and the user navigates with Tab
- **THEN** focus remains within the dialog until it closes and returns to the opener

### Requirement: Supported languages remain complete
The system SHALL render new and existing core-flow text, validation, dates, errors, and units in
the selected Russian or English language without mixed-locale fallback content.

#### Scenario: English workout flow is used
- **WHEN** English is selected and the user opens workout details and weekly charts
- **THEN** visible dates, labels, days, validation, and actions are English

### Requirement: Core UI supports small mobile layouts
The system SHALL preserve readable text, reachable controls, and no horizontal page overflow at a
320 CSS-pixel viewport, including long Russian strings and dialogs.

#### Scenario: Long localized dialog is opened on mobile
- **WHEN** a Russian dialog opens at 320 pixels width
- **THEN** content scrolls within the viewport and primary actions remain reachable
