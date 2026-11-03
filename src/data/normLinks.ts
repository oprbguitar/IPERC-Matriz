import sources from './normSources.json'

/**
 * Enlaces directos por norma. Combina:
 * - normSources.json: generado por scripts/scrape-norms.mjs (PDF oficial, El Peruano, estado HTTP)
 * - textos concordados y fichas SINIA verificados a mano
 * - SPIJ: el buscador del SPIJ exige sesion, por eso se guarda el ID `detallenorma`
 *   cuando se conoce y, si no, se abre el SPIJ con el numero copiado al portapapeles.
 */
export interface NormSource {
  id: string
  url: string
  status: number
  ok: boolean
  checkedAt: string
  title?: string | null
  publication?: string | null
  pdfUrl?: string | null
  extraPdfs?: string[]
  elPeruanoUrl?: string | null
  contentHash?: string
  changeDetectedAt?: string
  /** Cambio en la fuente oficial pendiente de revision por una persona. */
  legalReview?: 'pendiente'
}

export const SPIJ_HOME = 'https://spij.minjus.gob.pe/spij-ext-web/'

export const SOURCES_GENERATED_AT: string = (sources as { generatedAt: string }).generatedAt

const scraped = (sources as { norms: Record<string, NormSource> }).norms

/** Ediciones concordadas o fichas complementarias (SINIA, MINAM). */
const CONSOLIDATED: Record<string, string> = {
  'law-29783': 'https://sinia.minam.gob.pe/normas/ley-seguridad-salud-trabajo-reglamento-modificatorias-edicion-concordada',
  'ds-019-2009-minam': 'https://sinia.minam.gob.pe/normas/aprueban-reglamento-ley-no-27446-ley-sistema-nacional-evaluacion-0',
  'ds-004-2017-minam': 'https://sinia.minam.gob.pe/normas/aprueban-estandares-calidad-ambiental-eca-agua-establecen-disposiciones',
}

/** IDs `detallenorma` del SPIJ (completar al ubicarlos en el SPIJ de acceso libre). */
const SPIJ_IDS: Record<string, string> = {}

export function normSource(id: string): NormSource | undefined {
  return scraped[id]
}

export function consolidatedUrl(id: string): string | undefined {
  return CONSOLIDATED[id]
}

export function spijUrl(id: string): string | undefined {
  const spijId = SPIJ_IDS[id]
  return spijId ? `${SPIJ_HOME}#/detallenorma/${spijId}` : undefined
}
