#!/usr/bin/env node
/**
 * Importa el contenido ISO de los cursos del autor y genera src/data/iso.json.
 *
 * Fuentes (repositorios propios):
 *   - https://github.com/oprbguitar/cursoma2026            (ISO 45001 e ISO 14001 clausula por clausula)
 *   - https://github.com/oprbguitar/sistemas-integrados-curso (tronco comun Anexo SL, SIG 9001/14001/45001/37001)
 *
 * Uso: node scripts/import-iso.mjs <carpeta-con-ambos-repos-clonados>
 * El texto de las normas ISO no se reproduce: son parafrasis interpretativas con
 * evidencia, preguntas de auditoria, hallazgos tipicos y correlacion legal peruana.
 */
import { writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const base = resolve(process.argv[2] ?? '.')
const load = (path) => import(pathToFileURL(join(base, path)).href)

const strip = (value) =>
  typeof value === 'string'
    ? value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
    : Array.isArray(value)
      ? value.map(strip)
      : value && typeof value === 'object'
        ? Object.fromEntries(Object.entries(value).map(([key, item]) => [key, strip(item)]))
        : value

const iso45001 = await load('cursoma2026/src/data/iso45001.js')
const iso14001 = await load('cursoma2026/src/data/iso14001.js')
const sig = await load('sistemas-integrados-curso/assets/js/data/normas.js')

const pickClause = (clause) => ({
  id: clause.id,
  num: clause.num,
  title: clause.titulo,
  kind: clause.tipo ?? 'requisito',
  parent: clause.padre ?? null,
  summary: clause.resumen ?? '',
  intent: clause.intencion ?? '',
  evidence: clause.evidencia ?? [],
  questions: clause.preguntas ?? [],
  findings: (clause.hallazgos ?? []).map((item) => (typeof item === 'string' ? { text: item, severity: '' } : { text: item.texto, severity: item.severidad ?? '' })),
  legal: clause.legal ?? [],
  trap: clause.trampa ?? '',
})

const data = strip({
  importedAt: new Date().toISOString().slice(0, 10),
  sources: [
    { label: 'Curso SSOMA 2026', url: 'https://github.com/oprbguitar/cursoma2026' },
    { label: 'Curso de Sistemas Integrados de Gestión', url: 'https://github.com/oprbguitar/sistemas-integrados-curso' },
  ],
  standards: [
    { ...iso45001.META_45001, key: '45001', clauses: iso45001.CLAUSULAS_45001.map(pickClause) },
    { ...iso14001.META_14001, key: '14001', clauses: iso14001.CLAUSULAS_14001.map(pickClause) },
  ],
  sig: {
    norms: Object.values(sig.NORMAS),
    common: sig.COMUNES.map((item) => ({ num: item.cl, title: item.t, requirement: item.req, intent: item.intent, evidence: item.evid ?? [], questions: item.preg ?? [], finding: item.hallazgo ?? '', trap: item.trampa ?? '' })),
    specific: (sig.PROPIAS ?? []).map((item) => ({ num: item.cl, norm: item.norm, title: item.t, requirement: item.req, intent: item.intent, evidence: item.evid ?? [], questions: item.preg ?? [], finding: item.hallazgo ?? '', trap: item.trampa ?? '' })),
    documents: sig.DOCS_OBLIGATORIOS.map(([name, q, e, s, a, note]) => ({ name, iso9001: q, iso14001: e, iso45001: s, iso37001: a, note })),
  },
})

const out = join(resolve('.'), 'src', 'data', 'iso.json')
writeFileSync(out, `${JSON.stringify(data, null, 1)}\n`)
console.log(`ISO importado: ${data.standards.map((std) => `${std.key}=${std.clauses.length}`).join(', ')}, SIG comunes=${data.sig.common.length}, propias=${data.sig.specific.length} -> ${out}`)
