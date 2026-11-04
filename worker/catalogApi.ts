/**
 * API publica de solo lectura del catalogo (/api/v1). Reutilizable desde otros repositorios.
 * No expone datos de usuarios ni organizaciones: esos viven en rutas autenticadas aparte.
 */
import {
  applicableObligations,
  ARTICLES,
  CASES,
  CATALOG_CHANGELOG,
  CATALOG_VERSION,
  DEFAULT_PROFILE,
  FORMATS,
  INFRACTIONS,
  legalTrace,
  OBLIGATIONS,
  type Obligation,
  type OrgProfile,
} from '../src/catalog'
import { legalNorms, sectorModules } from '../src/data/legalDatabase'
import spij from '../src/data/spijLinks.json'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=3600',
}

function respond(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({ version: CATALOG_VERSION, ...((data as object) ?? {}) }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...CORS },
  })
}

/** Las reglas de aplicabilidad son funciones: se publica su resultado, no el codigo. */
function serializeObligation(obligation: Obligation, reason?: string) {
  const { appliesWhen: _rule, ...rest } = obligation
  return { ...rest, trace: legalTrace(obligation), ...(reason ? { reason } : {}) }
}

function profileFromQuery(params: URLSearchParams): OrgProfile | null {
  const keys = ['sector', 'trabajadores', 'tipo', 'altoRiesgo', 'contratistas', 'teletrabajo', 'remype', 'dePie', 'sol']
  if (!keys.some((key) => params.has(key))) return null
  const flag = (key: string) => params.get(key) === 'true' || params.get(key) === '1'
  return {
    ...DEFAULT_PROFILE,
    sector: (params.get('sector') as OrgProfile['sector']) ?? DEFAULT_PROFILE.sector,
    workers: Math.max(1, Number(params.get('trabajadores')) || DEFAULT_PROFILE.workers),
    ownership: params.get('tipo') === 'publico' ? 'publico' : 'privado',
    highRisk: flag('altoRiesgo'),
    contractors: flag('contratistas'),
    telework: flag('teletrabajo'),
    remype: flag('remype'),
    standingWork: flag('dePie'),
    sunExposure: flag('sol'),
  }
}

export function handleCatalog(request: Request, url: URL): Response {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS })
  if (request.method !== 'GET') return respond({ error: 'Solo lectura.' }, 405)

  const path = url.pathname.replace(/^\/api\/v1\/?/, '').replace(/\/$/, '')
  const params = url.searchParams
  const tema = params.get('tema')?.toLowerCase()

  if (path === '') {
    return respond({
      recursos: ['normas', 'normas/:id', 'spij', 'articulos', 'obligaciones', 'formatos', 'infracciones', 'jurisprudencia', 'sectores', 'actualizaciones'],
      relacion: 'norma → artículo → obligación → formato → evidencia → infracción → casuística',
      aviso: 'Contenido orientativo. Verifique el texto vigente en la fuente oficial.',
    })
  }
  if (path === 'normas') return respond({ normas: legalNorms })
  if (path.startsWith('normas/')) {
    const id = path.slice('normas/'.length)
    const norma = legalNorms.find((item) => item.id === id)
    if (!norma) return respond({ error: 'Norma no encontrada.' }, 404)
    return respond({
      norma,
      spij: (spij as { links: Record<string, unknown> }).links[id] ?? null,
      articulos: ARTICLES.filter((item) => item.normId === id),
      obligaciones: OBLIGATIONS.filter((item) => item.normIds.includes(id)).map((item) => serializeObligation(item)),
      formatos: FORMATS.filter((item) => item.normIds.includes(id)),
    })
  }
  if (path === 'articulos') return respond({ articulos: ARTICLES })
  if (path === 'spij') return respond({ fuente: 'Ediciones de normas legales archivadas por el SPIJ (Ministerio de Justicia)', enlaces: (spij as { links: unknown }).links })
  if (path === 'obligaciones') {
    const profile = profileFromQuery(params)
    if (profile) return respond({ perfil: profile, obligaciones: applicableObligations(profile).map((item) => serializeObligation(item, item.reason)) })
    return respond({ obligaciones: OBLIGATIONS.map((item) => serializeObligation(item)) })
  }
  if (path === 'formatos') return respond({ formatos: FORMATS.filter((item) => !tema || item.topic.includes(tema) || item.name.toLowerCase().includes(tema)) })
  if (path === 'infracciones') return respond({ infracciones: INFRACTIONS.filter((item) => !tema || item.topics.some((topic) => topic.includes(tema))) })
  if (path === 'jurisprudencia') return respond({ casos: CASES.filter((item) => !tema || item.topics.some((topic) => topic.includes(tema))) })
  if (path === 'sectores') return respond({ sectores: sectorModules.map(({ id, label, description, normIds }) => ({ id, label, description, normIds })) })
  if (path === 'actualizaciones') return respond({ actualizaciones: CATALOG_CHANGELOG })
  return respond({ error: 'Recurso no encontrado.' }, 404)
}
