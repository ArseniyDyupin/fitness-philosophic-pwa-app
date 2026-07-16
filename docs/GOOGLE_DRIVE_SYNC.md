# Google Drive Backup and Merge

The application provides an explicit, user-triggered Google Drive backup. It is not continuous
background synchronization: the user chooses when to upload the local database and when to
download and merge a remote backup.

## Supported behavior

- Google Identity Services OAuth token model (`google.accounts.oauth2.initTokenClient`)
- least-privilege `https://www.googleapis.com/auth/drive.appdata` scope
- one hidden `ai-trainer-sync.json` file in Google Drive `appDataFolder`
- complete canonical schema-versioned Dexie export
- transactional merge that preserves stable entity IDs
- newer-record conflict resolution with newer local data preserved
- English and Russian UI states
- no OAuth or OpenAI credentials in the backup

The hidden application-data folder is accessible only to this OAuth application and is not shown
in the normal Google Drive file list. It is still stored by Google and can contain sensitive
fitness data and user-provided photos.

## Google Cloud setup

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable the [Google Drive API](https://console.cloud.google.com/apis/library/drive.googleapis.com).
3. Configure the OAuth consent screen.
4. Create an OAuth 2.0 Client ID with application type **Web application**.
5. Add every deployed app origin under **Authorized JavaScript origins**, for example:

   - `http://localhost:5173`
   - `https://fitness.example.com`

6. The popup token model does not use an application redirect endpoint, so an authorized redirect
   URI is not required for this implementation.
7. Set the client ID in the environment:

```env
VITE_GOOGLE_CLIENT_ID=123456789-example.apps.googleusercontent.com
```

The Google Identity Services script is loaded from `index.html`:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

Official references:

- [Google Identity Services token model](https://developers.google.com/identity/oauth2/web/guides/use-token-model)
- [Google Drive application data folder](https://developers.google.com/workspace/drive/api/guides/appdata)
- [Google Drive media uploads](https://developers.google.com/workspace/drive/api/guides/manage-uploads)

## Authorization lifecycle

1. The user clicks **Authorize Google Drive**.
2. Google opens its OAuth account/consent popup.
3. Google returns a short-lived OAuth access token for `drive.appdata`.
4. The token is held only in JavaScript memory.
5. Reloading the page, closing the tab, token expiry, sign-out, or HTTP 401 clears authorization.
6. The user must authorize again from a user gesture.

The implementation does not:

- use a Google One Tap ID credential as a Drive token;
- store access tokens in localStorage, IndexedDB, Zustand persistence, backup files, URLs, or
  logs;
- request profile/email scopes just to decorate the UI;
- implement refresh tokens or silent background authorization.

A backend authorization-code model is required if silent refresh or scheduled sync becomes a
product requirement.

## Backup payload

Cloud backup reuses `exportAll()` and the `ExportBundle` schema used by local export/import:

```ts
interface ExportBundle {
  schemaVersion: 1
  exportedAt: string
  profile?: Profile
  workouts: Workout[]
  food: FoodLog[]
  checkins: WeeklyCheckin[]
  weeklyData: unknown[]
  ai: AiMessage[]
  plans: PlanSuggestion[]
  ai_feedback: unknown[]
  metric_defs: unknown[]
  metric_entries: unknown[]
  photo_assets: unknown[]
  ai_body_evals: unknown[]
  exercise_estimates: unknown[]
}
```

OpenAI API keys, OAuth tokens, authorization headers, local configuration, service-worker state,
and provider credentials are not part of the Dexie export and must never be added to it.

The upload limit is 20 MB. Photo `dataUrl` values count toward that limit.

## Drive file operations

### Lookup

The service calls `files.list` with:

- `spaces=appDataFolder`
- `name = 'ai-trainer-sync.json' and trashed = false`
- newest `modifiedTime` first
- one result

A provider or network error is propagated. It is not converted into “file not found,” because
that could cause duplicate backups.

### First upload

The service calls the Drive upload endpoint with `uploadType=multipart`. The first part contains
metadata:

```json
{
  "name": "ai-trainer-sync.json",
  "mimeType": "application/json",
  "parents": ["appDataFolder"]
}
```

The second part contains the complete JSON backup.

### Later upload

The service updates the existing file ID with `PATCH` and `uploadType=media`, replacing its JSON
content without creating a new file.

### Download

The service reads the file with `alt=media`, parses JSON, validates schema version and collection
shape, and only then starts a local transaction.

## Merge rules

`importData(bundle, 'merge')` performs the merge in one Dexie transaction.

- A remote ID missing locally is inserted unchanged.
- An existing local ID is replaced only when the remote canonical timestamp is strictly newer.
- Equal or missing remote timestamps preserve the local record.
- Profile ID is normalized to `me`.
- No store “add” method is used for remote entities because those methods generate new IDs.

Timestamp priority:

| Table | Timestamp order |
|---|---|
| profile | `updatedAt`, `createdAt` |
| workouts | `updatedAt`, `createdAt`, `date` |
| food | `updatedAt`, `createdAt`, `date` |
| check-ins | `createdAt`, `weekStart` |
| AI messages | `createdAt` |
| plans | `createdAt`, `forDate` |
| AI feedback | `createdAt` |
| metric definitions | `updatedAt`, `createdAt` |
| metric entries | `updatedAt`, `createdAt`, `date` |
| photos | `createdAt`, `date` |
| body evaluations | `createdAt`, `weekStart` |
| exercise estimates | `updatedAt`, `createdAt` |

After the transaction completes, profile, workout, food, weekly, and language Zustand mirrors
reload from IndexedDB before the UI reports success.

## Concurrency and failure behavior

- Only one upload or download may run at a time.
- Offline operations fail before a Drive request.
- Provider requests abort after 30 seconds.
- Invalid or unsupported backup JSON is rejected before local mutation.
- HTTP 401 clears authorization and requires a new user gesture.
- HTTP 403 is reported as a permission error.
- File lookup, provider, timeout, and network errors remain distinguishable.
- Provider response bodies and backup contents are not copied into user-facing errors or logs.

There is no offline upload queue. A queued background request would risk sending stale or
unexpected sensitive data after the original user gesture.

## Manual QA

Use a dedicated test OAuth client and non-production Google account.

1. Start the app with a valid `VITE_GOOGLE_CLIENT_ID`.
2. Open Settings and authorize Google Drive.
3. Cancel the popup and verify the app remains unauthorized with a recoverable message.
4. Authorize, upload an empty/small database, and verify backup metadata appears.
5. Change local data, upload again, and verify the same Drive file ID is updated.
6. On another browser profile/device, create newer local and remote records with the same IDs.
7. Download and verify newer local records remain while newer remote records replace older local
   records.
8. Verify photos, metrics, AI feedback, plans, and exercise estimates survive the round trip.
9. Corrupt the remote JSON and verify no local table changes.
10. Test offline, denied permission, expired/revoked token, timeout, and a backup above 20 MB.
11. Reload the page and verify authorization is not restored from browser storage.
12. Verify English and Russian copy, keyboard operation, mobile layout, and error announcements.

Automated provider mocks do not prove the real OAuth consent screen, Google account policy, Drive
API enablement, or deployed-origin configuration. Report those separately as live manual
verification.
