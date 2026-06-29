#!/usr/bin/env node
/**
 * Lightweight link & navigation checker (no browser required).
 *
 * - Scans src/ for external http(s) URLs and verifies they respond (HEAD/GET).
 * - Verifies every internal ViewId used by the sidebar/nav has a matching
 *   render branch in App.tsx (catches "dead" navigation buttons).
 *
 * Usage: npm run check:links
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'src')

function walk(dir) {
  const out = []
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else if (['.ts', '.tsx', '.css'].includes(extname(full))) out.push(full)
  }
  return out
}

const files = walk(SRC)
const urls = new Set()
const urlRegex = /https?:\/\/[^\s"'`)<>]+/g

for (const file of files) {
  const text = readFileSync(file, 'utf8')
  for (const match of text.matchAll(urlRegex)) {
    const url = match[0].replace(/[.,;]+$/, '')
    // skip schema/namespace URLs that are not navigable resources
    if (url.includes('schemas.') || url.includes('w3.org') || url.includes('example.')) continue
    urls.add(url)
  }
}

console.log(`Found ${urls.size} external URL(s) to check.`)
let failures = 0

for (const url of urls) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(15000) })
    if (res.status >= 400) {
      console.error(`  BROKEN (${res.status}): ${url}`)
      failures += 1
    } else {
      console.log(`  OK (${res.status}): ${url}`)
    }
  } catch (error) {
    console.error(`  UNREACHABLE: ${url} -> ${error.message}`)
    failures += 1
  }
}

// Internal navigation sanity check.
const appSource = readFileSync(join(SRC, 'App.tsx'), 'utf8')
const navIds = [...appSource.matchAll(/id:\s*'([a-z_]+)'[^}]*icon:/g)].map((m) => m[1])
const missing = navIds.filter((id) => !appSource.includes(`view === '${id}'`))
if (missing.length) {
  console.error(`Navigation items without a render branch: ${missing.join(', ')}`)
  failures += missing.length
} else if (navIds.length) {
  console.log(`All ${navIds.length} navigation views resolve to a render branch.`)
}

if (failures > 0) {
  console.error(`\n${failures} problem(s) found.`)
  process.exit(1)
}
console.log('\nLink & navigation check passed.')
