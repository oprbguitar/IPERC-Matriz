import { computeFine, SIZE_LABELS, type CompanySize, UIT_BY_YEAR } from '../lib/sunafil'
import { findInfraction, type Infraction } from './infractions'

/**
 * Ficha de contingencia: parte de la infraccion tipificada y sus hechos, no solo de la gravedad.
 * Es una estimacion para gestion preventiva: no es una multa definitiva.
 */
export interface ContingencyInput {
  size: CompanySize
  infractionCode: string
  /** Trabajadores afectados por el incumplimiento, segun los hechos. */
  affected: number
  /** Total de trabajadores de la empresa (para el art. 48.1-C). */
  totalWorkers: number
  /** Para 28.10: el accidente causo muerte o incapacidad parcial o total permanente. */
  deathOrPermanentDisability: boolean
  year: number
  /** MYPE inscrita en el REMYPE antes de la resolucion de segunda instancia. */
  remypeRegistered: boolean
  /** Ingresos netos del ejercicio anterior (para el tope del 1 %), opcional. */
  netIncome?: number
}

export type Certainty = 'calculo-con-regla-verificada' | 'condicionado-a-hechos' | 'requiere-evaluacion-juridica'

export interface ContingencyResult {
  infraction: Infraction
  effectiveSize: CompanySize
  affectedUsed: number
  affectedCriterion: string
  bracket: string
  uitPerInfraction: number
  infractionsCount: number
  totalUit: number
  totalSoles: number
  capApplied: boolean
  notes: string[]
  certainty: Certainty
  documentsToCheck: string[]
}

export function computeContingency(input: ContingencyInput): ContingencyResult | null {
  const infraction = findInfraction(input.infractionCode)
  if (!infraction) return null
  const notes: string[] = []

  // Sin REMYPE acreditado la autoridad aplica la tabla No MYPE.
  const effectiveSize: CompanySize = input.size !== 'no-mype' && !input.remypeRegistered ? 'no-mype' : input.size
  if (effectiveSize !== input.size) {
    notes.push('Sin inscripción REMYPE acreditada se aplica la tabla No MYPE (art. 48 RLGIT).')
  }

  let affectedUsed = Math.max(1, input.affected)
  let affectedCriterion = 'Trabajadores afectados por el incumplimiento según los hechos constatados.'
  let infractionsCount = 1
  let certainty: Certainty = 'condicionado-a-hechos'

  if (infraction.affectedRule === 'total-empresa') {
    const triggers = infraction.code === '28.11' || input.deathOrPermanentDisability
    if (triggers) {
      affectedUsed = Math.max(1, input.totalWorkers)
      affectedCriterion = 'Art. 48.1-C RLGIT: se considera el total de trabajadores de la empresa.'
      certainty = 'calculo-con-regla-verificada'
    } else {
      notes.push('28.10 sin muerte ni incapacidad permanente: se usa la regla ordinaria de afectados.')
    }
  }

  if (infraction.affectedRule === 'por-trabajador') {
    infractionsCount = Math.max(1, input.affected)
    affectedUsed = 1
    affectedCriterion = '27.15: una infracción por cada trabajador afectado.'
    certainty = 'calculo-con-regla-verificada'
  }

  const fine = computeFine(effectiveSize, infraction.severity, affectedUsed, input.year)
  let totalUit = Math.round(fine.uit * infractionsCount * 100) / 100
  const uitValue = UIT_BY_YEAR[input.year] ?? UIT_BY_YEAR[2026]
  let totalSoles = Math.round(totalUit * uitValue * 100) / 100
  let capApplied = false

  if (effectiveSize !== 'no-mype' && input.netIncome && input.netIncome > 0) {
    const cap = input.netIncome * 0.01
    if (totalSoles > cap) {
      totalSoles = Math.round(cap * 100) / 100
      totalUit = Math.round((totalSoles / uitValue) * 100) / 100
      capApplied = true
      notes.push('Tope REMYPE: no más del 1 % de ingresos netos del ejercicio anterior en un mismo procedimiento (art. 48.1-D).')
    }
  } else if (effectiveSize !== 'no-mype') {
    notes.push('Ingrese los ingresos netos del ejercicio anterior para evaluar el tope del 1 % para MYPE.')
  }

  if (infraction.specialCondition) notes.push(infraction.specialCondition)
  notes.push('Pueden existir reducciones por subsanación, concurrencia de infracciones o criterios de graduación: requiere evaluación jurídica.')
  if (input.size !== effectiveSize || infraction.affectedRule === 'afectados') {
    certainty = certainty === 'calculo-con-regla-verificada' ? certainty : 'condicionado-a-hechos'
  }
  if (['28.3', '28.7', '27.9'].includes(infraction.code)) certainty = 'requiere-evaluacion-juridica'

  return {
    infraction,
    effectiveSize,
    affectedUsed,
    affectedCriterion,
    bracket: fine.bracket,
    uitPerInfraction: fine.uit,
    infractionsCount,
    totalUit,
    totalSoles,
    capApplied,
    notes,
    certainty,
    documentsToCheck: [
      'Planilla electrónica y total de trabajadores a la fecha de los hechos',
      `Constancia REMYPE (${SIZE_LABELS[input.size]})`,
      'Registros, actas y documentos vinculados al numeral imputado',
      'Acta de infracción y requerimientos con sus fechas de notificación',
    ],
  }
}

export const CERTAINTY_LABELS: Record<Certainty, string> = {
  'calculo-con-regla-verificada': 'Regla de cálculo verificada (hechos por confirmar)',
  'condicionado-a-hechos': 'Condicionado a los hechos y al número de afectados',
  'requiere-evaluacion-juridica': 'Requiere evaluación jurídica (tipificación depende de "riesgo grave")',
}
