## ADDED Requirements

### Requirement: Diagnostics redact sensitive data
The system SHALL remove credentials, authorization data, photos, raw prompts, and sensitive health
profile values from persisted or exported diagnostic records.

#### Scenario: AI request fails
- **WHEN** a provider request fails with sensitive input in context
- **THEN** persisted diagnostics contain an error classification but not the sensitive values

### Requirement: User can delete all local application data
The system SHALL provide a confirmed operation that clears every application Dexie table,
credential/configuration key, service state, cache owned by the app where supported, and in-memory
mirror before returning to first launch.

#### Scenario: User confirms full deletion
- **WHEN** the deletion transaction completes
- **THEN** reload reveals no previous profile, fitness record, photo, AI configuration, or review

### Requirement: PWA metadata and cache policy are coherent
The system SHALL expose one manifest, avoid precaching redundant source-size artwork, and use one
explicit service-worker update strategy consistent with the UI.

#### Scenario: Production build is installed
- **WHEN** the browser reads application metadata and precache entries
- **THEN** one manifest defines the app and only runtime-required assets are precached

### Requirement: Security and performance gates are measurable
The system SHALL run dependency audit and bundle/precache budget checks and SHALL not ship known
high-severity runtime advisories without an explicit documented exception.

#### Scenario: Production verification runs
- **WHEN** the release checks complete
- **THEN** runtime advisories, initial bundle size, precache size, and unsupported live-provider
  checks are reported honestly

### Requirement: Offline core behavior is verified in a browser
The system SHALL verify installed production behavior for cached shell loading, local workout CRUD,
offline indication, and recovery after connectivity returns.

#### Scenario: Installed app loses connectivity
- **WHEN** the user opens the cached shell and records a manual workout offline
- **THEN** the local operation succeeds, external actions explain their offline state, and data
  remains after connectivity returns
