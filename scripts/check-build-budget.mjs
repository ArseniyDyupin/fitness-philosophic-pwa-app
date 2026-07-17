import { readdir, stat } from 'node:fs/promises'
import { join, relative } from 'node:path'

const DIST = new URL('../dist/', import.meta.url).pathname
const MAX_JS_CHUNK = 800 * 1024
const MAX_TOTAL = 3.5 * 1024 * 1024

async function collect(directory) {
  const files = []
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collect(path))
    else files.push({ path, size: (await stat(path)).size })
  }
  return files
}

const files = await collect(DIST)
const jsFiles = files.filter(file => file.path.endsWith('.js'))
const largestJs = jsFiles.sort((a, b) => b.size - a.size)[0]
const total = files.reduce((sum, file) => sum + file.size, 0)
const failures = []

if (largestJs && largestJs.size > MAX_JS_CHUNK) {
  failures.push(`Largest JS chunk ${relative(DIST, largestJs.path)} is ${(largestJs.size / 1024).toFixed(1)} KiB (budget 800 KiB)`)
}
if (total > MAX_TOTAL) {
  failures.push(`dist is ${(total / 1024 / 1024).toFixed(2)} MiB (budget 3.50 MiB)`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exit(1)
}

console.log(`Build budget OK: ${(total / 1024 / 1024).toFixed(2)} MiB total, largest JS ${(largestJs?.size ?? 0) / 1024 | 0} KiB`)
