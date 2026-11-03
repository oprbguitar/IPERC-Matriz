/**
 * Catalogo central del Observatorio SST Peru (sin dependencias de interfaz).
 * Lo consumen la aplicacion, el Worker (API /api/v1) y otros repositorios.
 *
 * Relacion: Norma → Articulo → Obligacion → Formato → Evidencia → Infraccion → Casuistica.
 */
export { ARTICLES, findArticle, type CatalogArticle } from './articles'
export { CASES, BINDING_LABELS, type CaseItem } from './cases'
export { computeContingency, CERTAINTY_LABELS, type ContingencyInput, type ContingencyResult } from './contingency'
export { FORMATS, findFormat, NATURE_LABELS, ORGANIZATION_FIELDS, type FormatField, type FormatItem } from './formats'
export { INFRACTIONS, findInfraction, type Infraction } from './infractions'
export {
  applicableObligations,
  DEFAULT_PROFILE,
  legalTrace,
  OBLIGATIONS,
  summarizeCompliance,
  type ApplicableObligation,
  type ComplianceEntry,
  type ComplianceStatus,
  type Obligation,
  type OrgProfile,
} from './obligations'

export const CATALOG_VERSION = '2026.11.1'

/** Bitacora de cambios del catalogo (alimenta /api/v1/actualizaciones). */
export const CATALOG_CHANGELOG: Array<{ version: string; date: string; summary: string }> = [
  {
    version: '2026.11.1',
    date: '2026-11-03',
    summary:
      'Articulos del D.S. 005-2012-TR y art. 48 RLGIT cotejados con PDF oficial; tipificacion SST (arts. 26-28 RLGIT); 25 obligaciones con reglas de aplicabilidad; biblioteca de formatos con procedencia; casuistica TFL; riesgo residual proyectado vs. verificado.',
  },
  {
    version: '2026.11.0',
    date: '2026-11-03',
    summary: '40 normas con enlaces verificados por scraping; contenido ISO; tabla de multas del D.S. 008-2020-TR.',
  },
]
