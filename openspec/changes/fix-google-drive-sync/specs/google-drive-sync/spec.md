## ADDED Requirements

### Requirement: OAuth authorization uses a Drive access token
The system SHALL request a short-lived OAuth access token through Google Identity Services using
the `drive.appdata` scope, SHALL keep the token in memory only, and SHALL never treat an ID
credential as a Drive access token.

#### Scenario: User authorizes Drive access
- **WHEN** the user activates the Google sign-in control and grants the requested scope
- **THEN** the system marks Drive sync as authorized and enables sync controls

#### Scenario: Authorization popup is cancelled
- **WHEN** the user closes or cancels the Google authorization popup
- **THEN** the system leaves sync unauthorized and presents a recoverable localized error

#### Scenario: Access token expires
- **WHEN** a sync operation starts after the in-memory access token has expired
- **THEN** the system clears authorization state and asks the user to authorize again

### Requirement: Sync file is private application data
The system SHALL store a single JSON sync file in Google Drive `appDataFolder` using the
`drive.appdata` scope and SHALL upload actual media content for both create and update operations.

#### Scenario: First upload creates the backup
- **WHEN** no sync file exists and the user uploads data
- **THEN** the system creates `ai-trainer-sync.json` in `appDataFolder` with the complete JSON
  payload and returns its metadata

#### Scenario: Later upload replaces backup content
- **WHEN** the sync file already exists and the user uploads data
- **THEN** the system replaces that file's media without creating a duplicate

#### Scenario: File lookup fails
- **WHEN** Google Drive rejects or times out the lookup request
- **THEN** the system reports the provider failure and does not assume the file is absent

### Requirement: Sync covers the canonical export bundle
The system SHALL upload and validate the canonical versioned Dexie export bundle, including
profile, workouts, food, check-ins, AI messages, plans, AI feedback, metrics, photos, body
evaluations, and exercise estimates.

#### Scenario: Upload includes all persisted tables
- **WHEN** the user uploads a backup
- **THEN** the payload is produced by the canonical database export path and excludes OAuth and
  OpenAI credentials

#### Scenario: Remote payload is malformed or unsupported
- **WHEN** the downloaded JSON does not match a supported backup schema version and structure
- **THEN** the system rejects it before any local database mutation

### Requirement: Remote merge preserves stable IDs and newer local data
The system SHALL merge remote data in one database transaction, SHALL preserve entity IDs, and
SHALL update a local entity only when the remote entity is newer according to its canonical
timestamp.

#### Scenario: Remote record is new
- **WHEN** a valid remote entity ID does not exist locally
- **THEN** the system inserts it with the same ID

#### Scenario: Local record is newer
- **WHEN** local and remote entities share an ID and the local canonical timestamp is newer or
  equal
- **THEN** the system keeps the local entity unchanged

#### Scenario: Remote record is newer
- **WHEN** local and remote entities share an ID and the remote canonical timestamp is newer
- **THEN** the system replaces the local entity with the remote entity and preserves its ID

#### Scenario: Merge succeeds
- **WHEN** the transactional merge completes
- **THEN** Zustand stores that mirror imported tables reload from IndexedDB before the UI reports
  completion

### Requirement: Sync operations are serialized and recoverable
The system SHALL prevent upload and download from running concurrently, SHALL fail fast while
offline, and SHALL classify auth, permission, validation, file-not-found, timeout, and network
errors without exposing tokens or sensitive payloads.

#### Scenario: Concurrent operation is requested
- **WHEN** a second upload or download starts while another sync operation is active
- **THEN** the system rejects the second operation without changing data

#### Scenario: Device is offline
- **WHEN** the user starts a sync operation while `navigator.onLine` is false
- **THEN** the system makes no provider request and shows a localized offline error

#### Scenario: Provider returns unauthorized
- **WHEN** Drive returns HTTP 401
- **THEN** the system clears authorization state and prompts for authorization again

### Requirement: Sync UI is truthful and localized
The system SHALL describe the hidden backup, explicit upload/merge behavior, and token/session
limitations in both English and Russian, with accessible controls and no unsupported encryption
claims.

#### Scenario: Sync is available
- **WHEN** a valid client ID is configured
- **THEN** the settings page presents localized authorization and backup controls

#### Scenario: Sync is not configured
- **WHEN** no valid Google client ID is configured
- **THEN** the settings page presents a localized configuration message and disables sync

