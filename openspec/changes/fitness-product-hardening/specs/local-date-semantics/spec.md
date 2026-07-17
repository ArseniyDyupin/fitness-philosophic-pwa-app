## ADDED Requirements

### Requirement: Calendar days are timezone safe
The system SHALL represent workout, food, plan, metric, and review calendar days as validated
local dates without implicit UTC conversion.

#### Scenario: Same record is opened in a western timezone
- **WHEN** a local-date record is displayed in a timezone west of UTC
- **THEN** the displayed calendar day matches the stored day

#### Scenario: Same record is opened in an eastern timezone
- **WHEN** a local-date record is displayed near local midnight east of UTC
- **THEN** default today and the displayed calendar day match the user's local day

### Requirement: Fitness weeks begin on Monday
The system SHALL use Monday as the week start for navigation, queries, summaries, charts, and plan
generation in every supported locale.

#### Scenario: User opens the workout week
- **WHEN** the workout page initializes without an explicit week
- **THEN** its selected range and URL begin on the current Monday

### Requirement: Legacy persisted dates remain readable
The system SHALL accept supported legacy ISO date values during migration and SHALL preserve their
intended calendar day when normalizing them.

#### Scenario: Legacy backup is imported
- **WHEN** a valid backup contains a legacy workout date representation
- **THEN** import succeeds and the workout appears on its intended calendar day
