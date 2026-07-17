## ADDED Requirements

### Requirement: Weekly review combines facts and user feedback
The system SHALL prefill a review with the completed week's persisted workout summary and collect
perceived difficulty, energy, pain/discomfort, available days, and optional notes.

#### Scenario: Review opens after a completed week
- **WHEN** the user starts a review for a past or ending week
- **THEN** the form shows accurate workout totals and editable localized feedback fields

### Requirement: Recommendation works with and without AI
The system SHALL produce an advisory next-week recommendation through the AI gateway when
available and a deterministic rules-based recommendation otherwise.

#### Scenario: AI is unavailable
- **WHEN** no AI key or network is available
- **THEN** the user can complete the review and receive a non-AI recommendation

### Requirement: Plan adjustments require informed confirmation
The system SHALL present the proposed difference, rationale, and safety disclaimer and SHALL not
modify the next plan until the user confirms.

#### Scenario: User declines proposal
- **WHEN** the user reviews and declines the suggested changes
- **THEN** the existing plan remains unchanged and the review records the decision

#### Scenario: User accepts proposal
- **WHEN** the user confirms the suggested changes
- **THEN** the plan update commits transactionally and the accepted proposal is recorded

### Requirement: Weekly reviews survive export and reload
The system SHALL persist reviews with stable IDs and timestamps and include them in reset,
export/import, and supported Drive backups.

#### Scenario: Review backup is restored
- **WHEN** a backup containing weekly reviews is restored
- **THEN** review history and accepted decisions remain available
