## ADDED Requirements

### Requirement: Persistent mutations use one application boundary
The system SHALL route create, update, delete, import, reset, and plan-apply mutations through a
use case backed by a repository transaction rather than issuing competing UI, store, and service
writes.

#### Scenario: Mutation commits
- **WHEN** a persistent mutation succeeds
- **THEN** IndexedDB and each affected Zustand mirror expose the committed entity and stable ID

#### Scenario: Mutation fails
- **WHEN** a transaction fails before commit
- **THEN** no partial persisted or in-memory change is reported as successful

### Requirement: Cold reads recover from canonical storage
The system SHALL query canonical persistence when an entity route cannot find the requested ID in
an uninitialized or stale in-memory mirror.

#### Scenario: Direct entity route is opened
- **WHEN** a valid entity URL is opened in a fresh browser process
- **THEN** the entity is loaded without requiring navigation through its list page first

### Requirement: Import refreshes every affected view state
The system SHALL validate imports before mutation and SHALL reload or clear all affected stores
before reporting replace or merge completion.

#### Scenario: Replace import removes the previous profile
- **WHEN** a valid replacement backup without the previous profile is applied
- **THEN** the old profile is absent from both IndexedDB and the active UI state

### Requirement: Export and import limits are symmetric
The system SHALL prevent creation of a local or Drive backup that exceeds the supported restore
limit, or SHALL support restoring the produced size.

#### Scenario: Photo-heavy backup exceeds the limit
- **WHEN** the encoded export would exceed the supported maximum
- **THEN** export is prevented before download/upload with a localized size explanation
