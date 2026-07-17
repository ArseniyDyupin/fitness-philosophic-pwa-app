export interface BackupIntegrity {
  size: number
  checksum: string
}

export async function getBackupIntegrity(content: string): Promise<BackupIntegrity> {
  const bytes = new TextEncoder().encode(content)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  const checksum = Array.from(new Uint8Array(digest))
    .map(value => value.toString(16).padStart(2, '0'))
    .join('')
  return { size: bytes.byteLength, checksum }
}
