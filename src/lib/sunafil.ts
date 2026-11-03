/**
 * Tabla referencial de multas del art. 48 del Reglamento de la Ley General de
 * Inspeccion del Trabajo (D.S. N.° 019-2006-TR, modificado por D.S. N.° 008-2020-TR).
 * Valores en UIT. Para MYPE inscritas en el REMYPE la multa de un mismo procedimiento
 * no supera el 1 % de los ingresos netos del ejercicio anterior.
 */
export type CompanySize = 'micro' | 'pequena' | 'no-mype'
export type Severity = 'leve' | 'grave' | 'muy-grave'

export const UIT_BY_YEAR: Record<number, number> = { 2024: 5150, 2025: 5350, 2026: 5500 }

export const SIZE_LABELS: Record<CompanySize, string> = {
  micro: 'Microempresa (REMYPE)',
  pequena: 'Pequeña empresa (REMYPE)',
  'no-mype': 'No MYPE / gran empresa',
}

export const SEVERITY_LABELS: Record<Severity, string> = { leve: 'Leve', grave: 'Grave', 'muy-grave': 'Muy grave' }

interface Bracket {
  label: string
  max: number
}

export const BRACKETS: Record<CompanySize, Bracket[]> = {
  micro: [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => ({ label: String(n), max: n })).concat({ label: '10 y más', max: Infinity }),
  pequena: [
    { label: '1 a 5', max: 5 },
    { label: '6 a 10', max: 10 },
    { label: '11 a 20', max: 20 },
    { label: '21 a 30', max: 30 },
    { label: '31 a 40', max: 40 },
    { label: '41 a 50', max: 50 },
    { label: '51 a 60', max: 60 },
    { label: '61 a 70', max: 70 },
    { label: '71 a 99', max: 99 },
    { label: '100 y más', max: Infinity },
  ],
  'no-mype': [
    { label: '1 a 10', max: 10 },
    { label: '11 a 25', max: 25 },
    { label: '26 a 50', max: 50 },
    { label: '51 a 100', max: 100 },
    { label: '101 a 200', max: 200 },
    { label: '201 a 300', max: 300 },
    { label: '301 a 400', max: 400 },
    { label: '401 a 500', max: 500 },
    { label: '501 a 999', max: 999 },
    { label: '1000 y más', max: Infinity },
  ],
}

/** Valores transcritos del D.S. N.° 008-2020-TR (El Peruano, 10/02/2020), art. 48.1 del RLGIT. */
export const FINE_TABLE_SOURCE = 'https://cdn.www.gob.pe/uploads/document/file/519862/Decreto-supremo-n-008-2020-tr-1853904-1.pdf'

export const FINE_TABLE: Record<CompanySize, Record<Severity, number[]>> = {
  micro: {
    leve: [0.045, 0.05, 0.07, 0.08, 0.09, 0.11, 0.14, 0.16, 0.18, 0.23],
    grave: [0.11, 0.14, 0.16, 0.18, 0.2, 0.25, 0.29, 0.34, 0.38, 0.45],
    'muy-grave': [0.23, 0.25, 0.29, 0.32, 0.36, 0.41, 0.47, 0.54, 0.61, 0.68],
  },
  pequena: {
    leve: [0.09, 0.14, 0.18, 0.23, 0.32, 0.45, 0.61, 0.83, 1.01, 2.25],
    grave: [0.45, 0.59, 0.77, 0.97, 1.26, 1.62, 2.09, 2.43, 2.81, 4.5],
    'muy-grave': [0.77, 0.99, 1.28, 1.64, 2.14, 2.75, 3.56, 4.32, 4.95, 7.65],
  },
  'no-mype': {
    leve: [0.26, 0.89, 1.26, 2.33, 3.1, 3.73, 5.3, 7.61, 10.87, 15.52],
    grave: [1.57, 3.92, 5.22, 6.53, 7.83, 10.45, 13.06, 18.28, 20.89, 26.12],
    'muy-grave': [2.63, 5.25, 7.88, 11.56, 14.18, 18.39, 23.64, 31.52, 42.03, 52.53],
  },
}

export interface FineResult {
  bracket: string
  uit: number
  soles: number
  uitValue: number
}

export function computeFine(size: CompanySize, severity: Severity, affected: number, year: number): FineResult {
  const brackets = BRACKETS[size]
  const index = Math.max(0, brackets.findIndex((bracket) => Math.max(1, affected) <= bracket.max))
  const uit = FINE_TABLE[size][severity][index]
  const uitValue = UIT_BY_YEAR[year] ?? UIT_BY_YEAR[2026]
  return { bracket: brackets[index].label, uit, soles: Math.round(uit * uitValue * 100) / 100, uitValue }
}

export function formatSoles(value: number): string {
  return `S/ ${value.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

/** Tabla Markdown de una fila de tamaño para guias e informes. */
export function fineTableMarkdown(year = 2026): string {
  const uit = UIT_BY_YEAR[year]
  const rows: string[] = []
  for (const size of Object.keys(FINE_TABLE) as CompanySize[]) {
    const first = BRACKETS[size][0].label
    const last = BRACKETS[size][BRACKETS[size].length - 1].label
    for (const severity of Object.keys(SEVERITY_LABELS) as Severity[]) {
      const values = FINE_TABLE[size][severity]
      rows.push(
        `| ${SIZE_LABELS[size]} | ${SEVERITY_LABELS[severity]} | ${values[0]} UIT (${formatSoles(values[0] * uit)}) — ${first} | ${values[values.length - 1]} UIT (${formatSoles(values[values.length - 1] * uit)}) — ${last} |`,
      )
    }
  }
  return `| Tamaño | Gravedad | Mínimo (afectados) | Máximo (afectados) |\n|---|---|---|---|\n${rows.join('\n')}`
}
