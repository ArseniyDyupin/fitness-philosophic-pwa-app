## ADDED Requirements

### Requirement: Onboarding accepts only meaningful profile data
The system SHALL require a trimmed non-empty name, a meaningful goal, and numeric metrics within
the documented age, height, and weight ranges before advancing or saving a profile.

#### Scenario: Whitespace name is rejected
- **WHEN** the user enters only whitespace as the name and a valid goal
- **THEN** the next action remains unavailable and a localized validation message is available

#### Scenario: Metric is outside its range
- **WHEN** age, height, or weight is below or above the accepted range
- **THEN** the system prevents advancement and does not persist the invalid metric

### Requirement: Workout mutations are durable and singular
The system SHALL create exactly one workout for one save action, SHALL preserve its stable ID
when estimates or edits are applied, and SHALL show the same workout after direct navigation or
reload.

#### Scenario: Estimated workout is saved
- **WHEN** the user saves a workout and AI estimates are produced
- **THEN** one workout exists and that same record contains the estimates

#### Scenario: Workout details are reloaded
- **WHEN** a user reloads or directly opens an existing workout URL while the in-memory store is cold
- **THEN** the system loads the workout from persistent storage and renders its details

### Requirement: Reset and exposed actions are truthful
The system SHALL make reset scope explicit, clear the selected application state atomically after
confirmation, and ensure every exposed navigation or action leads to implemented behavior.

#### Scenario: User resets onboarding and profile
- **WHEN** the user confirms starting over
- **THEN** the previous profile and onboarding draft are removed and language/onboarding starts cleanly

#### Scenario: User activates an action
- **WHEN** the user selects generate, mark done, delete, save, or navigation controls
- **THEN** the promised state change occurs or a localized recoverable error is shown

### Requirement: Core flows survive unavailable providers
The system SHALL keep manual onboarding, workout CRUD, plans, and statistics usable without an AI
key, Drive authorization, or network access.

#### Scenario: Provider is unavailable
- **WHEN** an external provider is unavailable during a core manual flow
- **THEN** local data remains unchanged and the user can continue the manual flow
