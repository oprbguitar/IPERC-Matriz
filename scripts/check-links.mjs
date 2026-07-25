#!/usr/bin/env node
/**
 * Verificador de enlaces y de coherencia interna (sin navegador).
 *
 * 1. Comprueba que cada norma del catalogo legal responda en su fuente oficial.
 * 2. Comprueba el resto de URLs externas usadas en el codigo.
 * 3. Verifica que las plantillas locales existan en public/.
 * 4. Verifica que cada referencia cruzada (normIds, templateIds) exista.
 * 5. Verifica que cada entrada de navegacion tenga una vista que la renderice.
 *
 * Uso: npm run check:links
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
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
const sources = new Map(files.map((file) => [file, readFileSync(file, 'utf8')]))
let failures = 0

/* --- 1 y 2. URLs externas ------------------------------------------------ */

const urls = new Set()
const urlRegex = /https?:\/\/[^\s"'`)<>]+/g
for (const text of sources.values()) {
  for (const match of text.matchAll(urlRegex)) {
    const url = match[0].replace(/[.,;]+$/, '')
    if (url.includes('schemas.') || url.includes('w3.org') || url.includes('example.')) continue
    urls.add(url)
  }
}

console.log(`Verificando ${urls.size} URL(s) externa(s).`)
for (const url of urls) {
  try {
    const res = await fetch(url, { method: 'GET', redirect: 'follow', signal: AbortSignal.timeout(20000) })
    if (res.status >= 400) {
      console.error(`  ROTO (${res.status}): ${url}`)
      failures += 1
    } else {
      console.log(`  OK (${res.status}): ${url}`)
    }
  } catch (error) {
    console.error(`  INALCANZABLE: ${url} -> ${error.message}`)
    failures += 1
  }
}

/* --- 3. Plantillas servidas por la aplicacion ---------------------------- */

const content = sources.get(join(SRC, 'data', 'platformContent.ts')) ?? ''
const localFiles = [...content.matchAll(/file:\s*'([^']+)'/g)].map((match) => match[1])
for (const file of localFiles) {
  if (existsSync(join(ROOT, 'public', file))) {
    console.log(`  Plantilla presente: public/${file}`)
  } else {
    console.error(`  Plantilla FALTANTE: public/${file}`)
    failures += 1
  }
}

/* --- 4. Referencias cruzadas -------------------------------------------- */

const legal = sources.get(join(SRC, 'data', 'legalDatabase.ts')) ?? ''
const normIds = new Set([...legal.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map((match) => match[1]))
const templateIds = new Set([...content.matchAll(/^\s{4}id:\s*'([^']+)'/gm)].map((match) => match[1]))

function checkReferences(source, label, key, known, knownLabel) {
  for (const [, body] of source.matchAll(new RegExp(`${key}:\\s*\\[([^\\]]*)\\]`, 'g'))) {
    for (const [, id] of body.matchAll(/'([^']+)'/g)) {
      if (!known.has(id)) {
        console.error(`  Referencia rota en ${label}: ${key} -> "${id}" no existe en ${knownLabel}.`)
        failures += 1
      }
    }
  }
}

checkReferences(content, 'platformContent.ts', 'normIds', normIds, 'legalDatabase')
checkReferences(content, 'platformContent.ts', 'templateIds', templateIds, 'platformContent')
checkReferences(legal, 'legalDatabase.ts', 'relatedNormIds', normIds, 'legalDatabase')
checkReferences(legal, 'legalDatabase.ts', 'relatedTemplateIds', templateIds, 'platformContent')

for (const [, body] of legal.matchAll(/featuredNormIds = \[([^\]]*)\]/g)) {
  for (const [, id] of body.matchAll(/'([^']+)'/g)) {
    if (!normIds.has(id)) {
      console.error(`  featuredNormIds contiene un id inexistente: "${id}".`)
      failures += 1
    }
  }
}

/* --- 5. Navegacion sin vistas muertas ----------------------------------- */

const app = sources.get(join(SRC, 'App.tsx')) ?? ''
const navBlock = content.match(/NAV_ITEMS[^=]*=\s*\[([\s\S]*?)\n\]/)?.[1] ?? ''
const siteViews = [...navBlock.matchAll(/\{ id: '([a-z]+)'/g)].map((match) => match[1])
const missingViews = siteViews.filter((id) => id !== 'herramientas' && !app.includes(`view === '${id}'`))
if (missingViews.length) {
  console.error(`  Entradas de navegacion sin vista: ${missingViews.join(', ')}`)
  failures += missingViews.length
} else if (siteViews.length) {
  console.log(`  Las ${siteViews.length} entradas de navegacion resuelven a una vista.`)
}

const tools = sources.get(join(SRC, 'tools', 'ToolsWorkspace.tsx')) ?? ''
const toolViews = [...tools.matchAll(/\{ id: '([a-z]+)', label: '[^']+', subtitle:/g)].map((match) => match[1])
const missingTools = toolViews.filter((id) => !tools.includes(`view === '${id}'`))
if (missingTools.length) {
  console.error(`  Herramientas sin vista: ${missingTools.join(', ')}`)
  failures += missingTools.length
} else if (toolViews.length) {
  console.log(`  Las ${toolViews.length} herramientas resuelven a una vista.`)
}

if (failures > 0) {
  console.error(`\n${failures} problema(s) encontrado(s).`)
  process.exit(1)
}
console.log('\nVerificacion de enlaces y navegacion superada.')
