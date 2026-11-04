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
import { GUIDES } from '../src/data/guides'
import { guideManual } from '../src/data/guideManuals'
import spij from '../src/data/spijLinks.json'
import { TEMPLATES } from '../src/data/platformContent'
import { ADAPTED_FOR_TEMPLATE } from '../src/lib/adaptedTemplates'

const normIds = new Set(legalNorms.map((norm) => norm.id))

describe('integridad referencial del catálogo', () => {
  it('cada artículo pertenece a una norma existente y tiene fuente oficial', () => {
    for (const article of ARTICLES) {
      expect(normIds.has(article.normId), article.id).toBe(true)
      expect(article.sourceUrl).toMatch(/^https:\/\/(cdn\.www\.gob\.pe|spij\.minjus\.gob\.pe|busquedas\.elperuano\.pe)\//)
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
      if (format.origin === 'propio') expect(format.publisher).toBe('Observatorio Prevenir Perú')
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

describe('ampliación normativa 2026-11', () => {
  it('incorpora las normas verificadas de 2026, SCTR, teletrabajo y salud ocupacional', () => {
    for (const id of ['law-32721', 'ds-003-2026-sa', 'ds-009-2026-tr', 'rm-051-2026-tr', 'rm-546-2026-minsa', 'ds-008-2026-tr', 'rm-613-2026-minsa', 'law-31572', 'ds-002-2023-tr', 'ds-002-2020-tr', 'rm-245-2021-tr', 'ds-003-98-sa', 'ds-008-2022-sa', 'ds-022-2023-sa', 'rm-480-2008-minsa', 'rm-571-2014-minsa', 'ds-015-2005-sa', 'rm-733-2024-minsa', 'ds-016-2024-jus', 'ds-034-2023-em', 'ds-043-2007-em', 'rm-826-2024-minsa']) {
      expect(normIds.has(id), id).toBe(true)
    }
  })

  it('SCTR y teletrabajo ya no tienen normas vacías', () => {
    expect(OBLIGATIONS.find((item) => item.id === 'sctr')?.normIds.length).toBeGreaterThan(0)
    expect(OBLIGATIONS.find((item) => item.id === 'teletrabajo')?.normIds).toContain('ds-009-2026-tr')
  })

  it('la IPERC exige actualización sin exceder un año con artículos cotejados', () => {
    const iperc = OBLIGATIONS.find((item) => item.id === 'iperc')!
    expect(iperc.articleIds).toEqual(expect.arrayContaining(['ley29783-art57', 'ds005-art77-2020']))
    expect(iperc.frequency).toMatch(/un año/)
  })

  it('la periodicidad de auditoría depende del riesgo y del tamaño (D.S. 014-2013-TR, art. 15)', () => {
    const audit = (profile: Partial<typeof DEFAULT_PROFILE>) => applicableObligations({ ...DEFAULT_PROFILE, ...profile }).find((item) => item.id === 'auditoria')?.reason
    expect(audit({ highRisk: true, workers: 5 })).toMatch(/dos años/)
    expect(audit({ highRisk: false, workers: 40 })).toMatch(/tres años/)
    expect(audit({ highRisk: false, workers: 8 })).toBeUndefined()
  })

  it('bipedestación y radiación UV se activan solo cuando el perfil lo declara', () => {
    const ids = (profile: Partial<typeof DEFAULT_PROFILE>) => applicableObligations({ ...DEFAULT_PROFILE, ...profile }).map((item) => item.id)
    expect(ids({})).not.toContain('bipedestacion')
    expect(ids({ standingWork: true })).toContain('bipedestacion')
    expect(ids({ sunExposure: true })).toContain('radiacion-uv')
  })

  it('las normas conexas no se presentan como obligaciones de la Ley 29783', () => {
    expect(OBLIGATIONS.find((item) => item.id === 'hostigamiento')?.normIds).not.toContain('law-29783')
  })
})

describe('enlaces directos al SPIJ', () => {
  const links = (spij as { links: Record<string, { url: string; page: number }> }).links

  it('apuntan a la página de la edición archivada por el SPIJ', () => {
    expect(Object.keys(links).length).toBeGreaterThan(40)
    for (const [id, link] of Object.entries(links)) {
      expect(link.url, id).toMatch(/^https:\/\/spij\.minjus\.gob\.pe\/Normas\/textos\/\d{6}T\.pdf#page=\d+$/)
      expect(normIds.has(id), id).toBe(true)
    }
  })
})

describe('plantillas adaptadas y manuales', () => {
  it('se completan con los datos de la organización', () => {
    const templates = advancedTemplates({ razonSocial: 'Andina Prueba S.A.C.', ruc: '20999999999', centro: 'Sede Lima' })
    const politica = templates.find((item) => item.id === 'tpl-politica-sst')!
    expect(politica.markdown).toContain('Andina Prueba S.A.C.')
    expect(politica.markdown).toContain('20999999999')
  })

  it('cada plantilla adaptada de la biblioteca existe', () => {
    const ids = new Set(advancedTemplates().map((item) => item.id))
    for (const [templateId, adaptedId] of Object.entries(ADAPTED_FOR_TEMPLATE)) {
      expect(TEMPLATES.some((item) => item.id === templateId), templateId).toBe(true)
      expect(ids.has(adaptedId), adaptedId).toBe(true)
    }
  })

  it('las guías principales tienen manual ampliado más extenso que la lectura rápida', () => {
    for (const guide of GUIDES.filter((item) => item.id !== 'guia-panorama-2026')) {
      const manual = guideManual(guide.id)
      expect(manual, guide.id).toBeTruthy()
      expect(manual!.length, guide.id).toBeGreaterThan(guide.body.length * 0.8)
    }
  })
})
