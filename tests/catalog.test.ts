import { describe, expect, it } from 'vitest'
import {
  applicableObligations,
  ARTICLES,
  CASES,
  computeContingency,
  DEFAULT_PROFILE,
  FORMATS,
  INFRACTIONS,
  OBLIGATIONS,
  summarizeCompliance,
} from '../src/catalog'
import { legalNorms, sectorModules } from '../src/data/legalDatabase'
import { computeFine, FINE_TABLE } from '../src/lib/sunafil'
import { advancedTemplates } from '../src/lib/templateBuilder'
import { handleCatalog } from '../worker/catalogApi'

const normIds = new Set(legalNorms.map((norm) => norm.id))

describe('integridad referencial del catálogo', () => {
  it('cada artículo pertenece a una norma existente y tiene fuente oficial', () => {
    for (const article of ARTICLES) {
      expect(normIds.has(article.normId), article.id).toBe(true)
      expect(article.sourceUrl).toMatch(/^https:\/\/cdn\.www\.gob\.pe\//)
    }
  })

  it('cada obligación referencia normas, artículos, infracciones y formatos existentes', () => {
    const articleIds = new Set(ARTICLES.map((item) => item.id))
    const infractionCodes = new Set(INFRACTIONS.map((item) => item.code))
    const formatIds = new Set(FORMATS.map((item) => item.id))
    for (const obligation of OBLIGATIONS) {
      obligation.normIds.forEach((id) => expect(normIds.has(id), `${obligation.id} → ${id}`).toBe(true))
      obligation.articleIds.forEach((id) => expect(articleIds.has(id), `${obligation.id} → ${id}`).toBe(true))
      obligation.infractionCodes.forEach((code) => expect(infractionCodes.has(code), `${obligation.id} → ${code}`).toBe(true))
      obligation.formatIds.forEach((id) => expect(formatIds.has(id), `${obligation.id} → ${id}`).toBe(true))
    }
  })

  it('los formatos oficiales tienen URL y los propios no se presentan como oficiales', () => {
    for (const format of FORMATS) {
      format.normIds.forEach((id) => expect(normIds.has(id), `${format.id} → ${id}`).toBe(true))
      if (format.origin === 'oficial') expect(format.url, format.id).toBeTruthy()
      if (format.origin === 'propio') expect(format.publisher).toBe('Observatorio SST Perú')
    }
  })

  it('la casuística distingue verificación y solo enlaza fuentes oficiales', () => {
    for (const item of CASES) {
      if (item.verification === 'ficha-oficial-verificada') expect(item.url).toMatch(/gob\.pe/)
      if (item.verification === 'reportado-sin-cotejar') expect(item.url).toBeUndefined()
    }
  })

  it('el sector construcción incluye su reglamento sectorial', () => {
    const construction = sectorModules.find((module) => module.id === 'construction')
    expect(construction?.normIds).toContain('ds-011-2019-tr')
  })
})

describe('motor de aplicabilidad', () => {
  it('menos de 20 trabajadores: supervisor, sin comité ni RISST', () => {
    const ids = applicableObligations({ ...DEFAULT_PROFILE, workers: 12 }).map((item) => item.id)
    expect(ids).toContain('supervisor')
    expect(ids).not.toContain('comite')
    expect(ids).not.toContain('risst')
  })

  it('20 o más trabajadores: comité y RISST', () => {
    const ids = applicableObligations({ ...DEFAULT_PROFILE, workers: 20 }).map((item) => item.id)
    expect(ids).toEqual(expect.arrayContaining(['comite', 'risst']))
    expect(ids).not.toContain('supervisor')
  })

  it('construcción y entidad pública activan reglas sectoriales', () => {
    expect(applicableObligations({ ...DEFAULT_PROFILE, sector: 'construction' }).map((item) => item.id)).toContain('construccion-plan')
    expect(applicableObligations({ ...DEFAULT_PROFILE, ownership: 'publico' }).map((item) => item.id)).toContain('sector-publico')
  })

  it('cada obligación aplicable explica por qué aplica', () => {
    for (const item of applicableObligations(DEFAULT_PROFILE)) expect(item.reason.length).toBeGreaterThan(10)
  })
})

describe('cumplimiento por obligaciones acreditadas', () => {
  it('"acreditada" sin evidencia no suma y las críticas abiertas se cuentan', () => {
    const items = applicableObligations({ ...DEFAULT_PROFILE, workers: 25 })
    const sgsst = { status: 'acreditada' as const, evidence: '', responsible: '', updatedAt: '' }
    const iperc = { status: 'acreditada' as const, evidence: 'Matriz v3 firmada', responsible: '', updatedAt: '' }
    const summary = summarizeCompliance(items, { sgsst, iperc })
    expect(summary.accredited).toBe(1)
    expect(summary.criticalOpen).toBe(items.filter((item) => item.critical).length - 1)
  })
})

describe('contingencia SUNAFIL', () => {
  const base = { size: 'no-mype' as const, affected: 5, totalWorkers: 1200, deathOrPermanentDisability: false, year: 2026, remypeRegistered: true }

  it('usa la tabla oficial del D.S. 008-2020-TR', () => {
    expect(FINE_TABLE['no-mype'].grave[0]).toBe(1.57)
    expect(FINE_TABLE['no-mype']['muy-grave'][9]).toBe(52.53)
    expect(computeFine('no-mype', 'grave', 10, 2026).soles).toBe(8635)
  })

  it('28.11 usa el total de trabajadores (art. 48.1-C)', () => {
    const result = computeContingency({ ...base, infractionCode: '28.11' })!
    expect(result.affectedUsed).toBe(1200)
    expect(result.uitPerInfraction).toBe(52.53)
  })

  it('28.10 sin muerte ni incapacidad permanente usa la regla ordinaria', () => {
    expect(computeContingency({ ...base, infractionCode: '28.10' })!.affectedUsed).toBe(5)
    expect(computeContingency({ ...base, infractionCode: '28.10', deathOrPermanentDisability: true })!.affectedUsed).toBe(1200)
  })

  it('27.15 imputa una infracción por trabajador', () => {
    const result = computeContingency({ ...base, infractionCode: '27.15', affected: 4 })!
    expect(result.infractionsCount).toBe(4)
    expect(result.totalUit).toBeCloseTo(1.57 * 4)
  })

  it('MYPE sin REMYPE pasa a tabla No MYPE y con REMYPE aplica el tope del 1 %', () => {
    expect(computeContingency({ ...base, size: 'pequena', remypeRegistered: false, infractionCode: '27.3' })!.effectiveSize).toBe('no-mype')
    const capped = computeContingency({ ...base, size: 'pequena', affected: 150, infractionCode: '28.9', netIncome: 100000 })!
    expect(capped.capApplied).toBe(true)
    expect(capped.totalSoles).toBe(1000)
  })
})

describe('plantillas avanzadas', () => {
  it('cada plantilla trae base legal, firmas y advertencia de origen', () => {
    const templates = advancedTemplates()
    expect(templates.length).toBeGreaterThan(15)
    for (const template of templates) {
      expect(template.markdown).toContain('## 2. Base legal')
      expect(template.markdown).toContain('## Firmas')
      expect(template.markdown).toContain('No es un formato oficial')
    }
    expect(templates.find((item) => item.id === 'tpl-matriz-legal')?.sheet?.rows.length).toBe(OBLIGATIONS.length)
  })
})

describe('API pública /api/v1', () => {
  it('devuelve obligaciones por perfil sin exponer código de reglas', async () => {
    const url = new URL('https://sst.test/api/v1/obligaciones?trabajadores=50&sector=construction')
    const response = handleCatalog(new Request(url), url)
    const body = (await response.json()) as { obligaciones: Array<Record<string, unknown>> }
    expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*')
    expect(body.obligaciones.some((item) => item.id === 'construccion-plan')).toBe(true)
    expect(body.obligaciones.every((item) => !('appliesWhen' in item))).toBe(true)
  })

  it('rechaza escritura', () => {
    const url = new URL('https://sst.test/api/v1/normas')
    expect(handleCatalog(new Request(url, { method: 'POST' }), url).status).toBe(405)
  })
})
