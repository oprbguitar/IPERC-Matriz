// Uso: node scripts/locate-spij.mjs src/data/normSources.json scripts/spij-dates.json salida.json
// Requiere pdftotext (poppler). Cachea las ediciones en .spij-cache/ (ignorado por git).
// Localiza cada norma en la edición de normas legales archivada por el SPIJ
// (https://spij.minjus.gob.pe/Normas/textos/DDMMAAT.pdf) y devuelve la página exacta.
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'

const DIR = new URL('../.spij-cache/', import.meta.url).pathname.replace(/^\/(\w:)/, '$1')
if (!existsSync(DIR)) mkdirSync(DIR, { recursive: true })
const PDFTOTEXT = process.env.PDFTOTEXT ?? 'pdftotext'

const sources = JSON.parse(readFileSync(process.argv[2], 'utf8')).norms
const extra = JSON.parse(readFileSync(process.argv[3], 'utf8'))

const MONTHS = { enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12 }
function parseDate(text) {
  if (!text) return null
  const m = text.match(/(\d{1,2}) de ([a-z]+) de (\d{4})/i)
  if (m) return new Date(Date.UTC(+m[3], MONTHS[m[2].toLowerCase()] - 1, +m[1]))
  const d = text.match(/(\d{4})-(\d{2})-(\d{2})/)
  if (d) return new Date(Date.UTC(+d[1], +d[2] - 1, +d[3]))
  return null
}
const fmt = (date) => `${String(date.getUTCDate()).padStart(2, '0')}${String(date.getUTCMonth() + 1).padStart(2, '0')}${String(date.getUTCFullYear()).slice(2)}`
const shift = (date, days) => new Date(date.getTime() + days * 86400000)

/** Patrón del encabezado de la norma a partir de su id. */
function heading(id) {
  const m = id.match(/^(law|ley)-(\d+)$/)
  if (m) return { kind: 'LEY', num: m[2] }
  const ds = id.match(/^(ds|dl|rm|rs)-(.+)$/)
  if (!ds) return null
  const kind = { ds: 'DECRETO SUPREMO', dl: 'DECRETO LEGISLATIVO', rm: 'RESOLUCI[OÓ]N MINISTERIAL', rs: 'RESOLUCI[OÓ]N SUPREMA' }[ds[1]]
  const num = ds[2].toUpperCase().replace(/-MEM-DM$/, '-MEM/DM')
  return { kind, num }
}

async function edition(code) {
  const pdf = `${DIR}${code}.pdf`
  const txt = `${DIR}${code}.txt`
  if (!existsSync(txt)) {
    if (!existsSync(pdf)) {
      const res = await fetch(`https://spij.minjus.gob.pe/Normas/textos/${code}T.pdf`)
      if (!res.ok) return null
      const buf = Buffer.from(await res.arrayBuffer())
      if (buf.length < 5000 || buf.slice(0, 4).toString() !== '%PDF') return null
      writeFileSync(pdf, buf)
    }
    try {
      execFileSync(PDFTOTEXT, ['-enc', 'UTF-8', pdf, txt], { stdio: 'ignore' })
    } catch {
      if (!existsSync(txt)) return null
    }
  }
  return readFileSync(txt, 'utf8').split('\f')
}

const results = {}
const ids = [...new Set([...Object.keys(sources), ...Object.keys(extra)])]
for (const id of ids) {
  const head = heading(id)
  if (!head) continue
  const dates = []
  if (extra[id]) dates.push(parseDate(extra[id]))
  const base = parseDate(sources[id]?.publication)
  if (base) dates.push(base)
  const candidates = []
  for (const date of dates.filter(Boolean)) for (const delta of [0, 1, 2, -1, 3]) candidates.push(fmt(shift(date, delta)))
  const num = head.num.replace(/[-/]/g, '\\s*[-/]\\s*')
  const re = new RegExp(`${head.kind}\\s+N[º°o]?\\.?\\s*${num}\\b`)
  let found = null
  for (const code of [...new Set(candidates)]) {
    const pages = await edition(code)
    if (!pages) continue
    const page = pages.findIndex((text) => re.test(text.replace(/\s+/g, ' ')))
    if (page >= 0) {
      found = { url: `https://spij.minjus.gob.pe/Normas/textos/${code}T.pdf#page=${page + 1}`, edition: code, page: page + 1 }
      break
    }
  }
  results[id] = found
  console.error(id, found ? `${found.edition} p.${found.page}` : 'NO')
}
writeFileSync(process.argv[4], JSON.stringify(results, null, 1))
