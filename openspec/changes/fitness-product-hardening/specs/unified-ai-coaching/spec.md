## ADDED Requirements

### Requirement: AI capabilities share one configuration source
The system SHALL use the currently configured key, language, model limits, timeout, and provider
error mapping for estimates, reviews, plans, and body analysis without requiring reload.

#### Scenario: User saves a new key
- **WHEN** the user updates the AI key in settings
- **THEN** every subsequent AI capability uses the new key and no previous key is logged or exported

### Requirement: AI inputs preserve required modalities and consent
The system SHALL preserve text and consented image parts for body analysis and SHALL omit images
when consent is absent.

#### Scenario: Consented photos are analyzed
- **WHEN** the user explicitly consents and submits supported photos
- **THEN** the provider request contains those image parts and a localized text prompt

#### Scenario: Consent is absent
- **WHEN** the user does not consent to photo processing
- **THEN** no photo bytes or data URLs are sent to the provider

### Requirement: AI output is validated before persistence
The system SHALL validate the complete structured response and SHALL not persist partial,
malformed, or mismatched AI output.

#### Scenario: Provider returns invalid JSON
- **WHEN** an AI response is not valid for the requested schema
- **THEN** the system preserves existing data and shows a recoverable localized error or safe fallback

### Requirement: AI persistence is idempotent
The system SHALL update the intended stable workout or plan record once even when a request is
retried, a component rerenders, or the user double-activates the action.

#### Scenario: Estimate request is retried
- **WHEN** a transient estimate request retries and later succeeds
- **THEN** one workout record contains one accepted estimate result

#### Scenario: Generated plan is accepted
- **WHEN** the user confirms a generated plan for a selected date
- **THEN** the persisted plan uses that date and becomes visible without page reload
