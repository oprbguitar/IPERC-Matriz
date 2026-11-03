#!/usr/bin/env node
/**
 * Scraper del catalogo normativo.
 *
 * Recorre cada norma de src/data/legalDatabase.ts y src/data/legalExtensions.ts,
 * visita su pagina oficial (gob.pe, El Peruano, SUNAFIL, SINIA) y guarda en
 * src/data/normSources.json:
 *   - estado HTTP y fecha de verificacion
 *   - titulo y fecha de publicacion detectados en la pagina
 *   - enlaces directos a PDF oficiales (cdn.www.gob.pe) y a El Peruano
 *
 * Se ejecuta a mano (npm run scrape:norms) y cada mes desde GitHub Actions,
 * de modo que el catalogo se mantiene vigente sin intervencion manual.
 */
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'src', 'data', 'normSources.json')
const UA = 'Mozilla/5.0 (compatible; ObservatorioSST/1.0; +https://sst.andesnova.solutions)'

function collect() {
  const entries = []
  const db = readFileSync(join(ROOT, 'src/data/legalDatabase.ts'), 'utf8')
  for (const match of db.matchAll(/id: '([a-z0-9-]+)',[\s\S]*?officialPageUrl:\s*'([^']+)'/g)) {
    if (!entries.some((entry) => entry.id === match[1])) entries.push({ id: match[1], url: match[2] })
  }
  const ext = readFileSync(join(ROOT, 'src/data/legalExtensions.ts'), 'utf8')
  for (const match of ext.matchAll(/id: '([a-z0-9-]+)',[\s\S]*?\burl: '([^']+)'/g)) {
    if (!entries.some((entry) => entry.id === match[1])) entries.push({ id: match[1], url: match[2] })
  }
  for (const match of ext.matchAll(/\['([a-z0-9-]+)', '[^']*', '[^']*', '[^']*', '(https[^']+)'/g)) {
    if (!entries.some((entry) => entry.id === match[1])) entries.push({ id: match[1], url: match[2] })
  }
  return entries
}

function decode(text) {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/\s+/g, ' ')
    .trim()
}

function parse(html, url) {
  const title = decode((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1] ?? html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').replace(/<[^>]+>/g, ''))
  const date =
    html.match(/(\d{1,2} de [a-záéíóú]+ de \d{4})/i)?.[1] ??
    html.match(/datetime="(\d{4}-\d{2}-\d{2})/)?.[1] ??
    null
  const pdfs = [...new Set([...html.matchAll(/https:\/\/cdn\.www\.gob\.pe\/uploads\/document\/file\/[^"'\s<>]+?\.pdf(?:\?v=\d+)?/gi)].map((m) => m[0]))]
  const peruano = [...new Set([...html.matchAll(/https?:\/\/(?:busquedas|diariooficial)\.elperuano\.pe\/[^"'\s<>]+/gi)].map((m) => m[0]))]
  return {
    title: title.slice(0, 220) || null,
    publication: date,
    pdfUrl: url.endsWith('.pdf') ? url : pdfs[0] ?? null,
    extraPdfs: pdfs.slice(1, 4),
    elPeruanoUrl: url.includes('elperuano.pe') ? url : peruano[0] ?? null,
  }
}

async function scrape({ id, url }) {
  const checkedAt = new Date().toISOString().slice(0, 10)
  try {
    const response = await fetch(url, { redirect: 'follow', headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(25000) })
    const type = response.headers.get('content-type') ?? ''
    const base = { id, url, status: response.status, ok: response.ok, checkedAt }
    if (!response.ok || type.includes('pdf')) {
      return { ...base, title: null, publication: null, pdfUrl: type.includes('pdf') ? url : null, extraPdfs: [], elPeruanoUrl: null }
    }
    return { ...base, ...parse(await response.text(), url) }
  } catch (error) {
    return { id, url, status: 0, ok: false, checkedAt, error: String(error.message ?? error) }
  }
}

const entries = collect()
console.log(`Scraping ${entries.length} normas...`)
const previous = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')).norms ?? {} : {}

/**
 * Huella de lo que importa juridicamente (titulo, fecha, PDF oficial y enlace a El Peruano).
 * No se usa el HTML completo: un cambio de diseno de la pagina no es una modificacion legal.
 */
function fingerprint(result) {
  const material = [result.title, result.publication, result.pdfUrl, ...(result.extraPdfs ?? []), result.elPeruanoUrl].join('|')
  return createHash('sha256').update(material).digest('hex').slice(0, 16)
}

const results = {}
for (const entry of entries) {
  const result = await scrape(entry)
  if (result.ok) {
    result.contentHash = fingerprint(result)
    const before = previous[entry.id]
    // Un cambio detectado queda pendiente de validacion juridica hasta que una persona lo revise.
    if (before?.contentHash && before.contentHash !== result.contentHash) {
      result.changeDetectedAt = result.checkedAt
      result.legalReview = 'pendiente'
      result.previousHash = before.contentHash
      console.log(`  CAMBIO DETECTADO en ${entry.id}: requiere validacion juridica`)
    } else if (before?.legalReview === 'pendiente') {
      result.changeDetectedAt = before.changeDetectedAt
      result.legalReview = 'pendiente'
      result.previousHash = before.previousHash
    }
  }
  results[entry.id] = result
  console.log(`${result.ok ? 'OK ' : 'ERR'} ${String(result.status).padStart(3)} ${entry.id}${result.pdfUrl ? ' [pdf]' : ''}`)
}
writeFileSync(OUT, `${JSON.stringify({ generatedAt: new Date().toISOString(), norms: results }, null, 2)}\n`)
const broken = Object.values(results).filter((item) => !item.ok)
console.log(`Listo: ${entries.length - broken.length} OK, ${broken.length} con error. -> src/data/normSources.json`)
