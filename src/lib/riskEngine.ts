import { hazards } from '../data/hazards'
import { legalArticles, legalNorms, sectorModules } from '../data/legalDatabase'
import type {
  CompanyProfile,
  ControlLevel,
  DashboardIndicators,
  GeneratedAssessment,
  Hazard,
  JobPosition,
  LegalMatch,
  RiskBand,
  RiskEvaluation,
  SectorId,
  ValidationWarning,
  WorkArea,
  WorkTask,
} from '../types'

const hierarchyWeight: Record<ControlLevel, number> = {
  elimination: 3,
  substitution: 2,
  engineering: 2,
  administrative: 1,
  training: 1,
  ppe: 0,
}

export function riskBand(score: number): RiskBand {
  if (score <= 8) return 'Bajo'
  if (score <= 24) return 'Moderado'
  if (score <= 48) return 'Importante'
  return 'Intolerable'
}

export function evaluateRisk(probability: number, severity: number, exposure: number): RiskEvaluation {
  const score = probability * severity * exposure
  const level = riskBand(score)
  const colorClass = level.toLowerCase()
  const acceptability = level === 'Bajo' ? 'Aceptable' : 'No aceptable'
  const priority = level === 'Intolerable' ? 'Inmediata' : level === 'Importante' ? 'Alta' : level === 'Moderado' ? 'Media' : 'Baja'
  const requiredAction =
    level === 'Intolerable'
      ? 'Detener o restringir la actividad hasta implementar controles verificables.'
      : level === 'Importante'
        ? 'Implementar controles de mayor jerarquia y verificar evidencia antes de continuar de forma rutinaria.'
        : level === 'Moderado'
          ? 'Mejorar controles y programar seguimiento.'
          : 'Mantener controles y seguimiento periodico.'
  const workDecision =
    level === 'Intolerable' ? 'Detener hasta controlar' : level === 'Bajo' ? 'Continuar con control' : 'Mejorar controles'

  return {
    probability,
    severity,
    exposure,
    score,
    level,
    colorClass,
    acceptability,
    priority,
    requiredAction,
    workDecision,
  }
}

export function matchHazards(task: WorkTask, sector: SectorId): Hazard[] {
  const text = `${task.name} ${task.frequency} ${task.existingControls}`.toLowerCase()
  const sectorModule = sectorModules.find((item) => item.id === sector)
  const matched = hazards
    .map((hazard) => {
      const keywordScore = hazard.keywords.filter((keyword) => text.includes(keyword)).length
      const sectorScore = hazard.sectors?.includes(sector) ? 1 : 0
      const boostScore = sectorModule?.hazardBoostKeywords.filter((keyword) => text.includes(keyword)).length ?? 0
      const groupScore = sectorModule?.hazardGroups.includes(hazard.category) ? 1 : 0
      return { hazard, score: keywordScore * 3 + sectorScore + boostScore + groupScore }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.hazard)

  return matched.length > 0 ? matched.slice(0, 4) : hazards.filter((hazard) => hazard.sectors?.includes(sector)).slice(0, 3)
}

export function scoreProbability(task: WorkTask): number {
  let score = task.activityKind === 'routine' ? 3 : task.activityKind === 'emergency' ? 4 : 2
  const text = `${task.name} ${task.frequency}`.toLowerCase()
  if (task.exposedWorkers >= 10) score += 1
  if (text.includes('diaria') || text.includes('continu')) score += 1
  if (task.existingControls.trim().length > 30) score -= 1
  return clamp(score, 1, 5)
}

export function scoreSeverity(hazard: Hazard, task: WorkTask): number {
  let score = ['ergonomic', 'psychosocial'].includes(hazard.category) ? 2 : 3
  const severeWords = ['altura', 'electrico', 'explosion', 'confinado', 'incendio', 'atropello', 'muerte']
  const text = `${hazard.name} ${hazard.hazardousEvent} ${task.name}`.toLowerCase()
  if (severeWords.some((word) => text.includes(word))) score += 1
  if (hazard.commonConsequences.some((item) => item.toLowerCase().includes('muerte'))) score += 1
  return clamp(score, 1, 5)
}

export function scoreExposure(task: WorkTask): number {
  const text = task.frequency.toLowerCase()
  if (text.includes('continua') || text.includes('diaria')) return 4
  if (text.includes('semanal')) return 3
  if (text.includes('mensual') || task.activityKind === 'non_routine') return 2
  return task.activityKind === 'emergency' ? 1 : 2
}

export function legalMatchesFor(sector: SectorId, _hazard: Hazard): LegalMatch[] {
  const module = sectorModules.find((item) => item.id === sector)
  const normIds = module?.normIds ?? []
  const verifiedArticles = legalArticles.filter((article) => normIds.includes(article.normId))

  if (verifiedArticles.length === 0) {
    return normIds.map((normId) => {
      const norm = legalNorms.find((item) => item.id === normId)
      return {
        normTitle: norm?.title ?? normId,
        articleLabel: 'Requires legal validation',
        obligation: 'Normative reference pending validation',
        sourceUrl: norm?.sourceUrl ?? '',
        status: 'pending_validation',
      }
    })
  }

  return verifiedArticles.map((article) => {
    const norm = legalNorms.find((item) => item.id === article.normId)
    return {
      normTitle: norm?.title ?? article.normId,
      articleLabel: article.articleLabel,
      obligation: article.obligation,
      sourceUrl: article.sourceUrl ?? norm?.sourceUrl ?? '',
      status: 'validated',
    }
  })
}

export function generateAssessments(
  profile: CompanyProfile,
  sector: SectorId,
  areas: WorkArea[],
  positions: JobPosition[],
  tasks: WorkTask[],
): GeneratedAssessment[] {
  const reviewDate = new Date().toISOString().slice(0, 10)

  return tasks.flatMap((task) => {
    const position = positions.find((item) => item.id === task.positionId) ?? positions[0]
    const area = areas.find((item) => item.id === position?.areaId) ?? areas[0]
    if (!position || !area) return []

    return matchHazards(task, sector).map((hazard, index) => {
      const probability = scoreProbability(task)
      const severity = scoreSeverity(hazard, task)
      const exposure = scoreExposure(task)
      const initialEvaluation = evaluateRisk(probability, severity, exposure)
      const strongestControl = strongestLevel(hazard.suggestedControls.map((control) => control.level))
      const controlReduction = Math.max(1, Math.min(3, hazard.suggestedControls.reduce((total, control) => total + hierarchyWeight[control.level], 0)))
      const residualProbability = clamp(probability - Math.ceil(controlReduction / 2), 1, 5)
      const residualSeverity = clamp(severity - (strongestControl === 'elimination' || strongestControl === 'substitution' ? 1 : 0), 1, 5)
      const residualExposure = clamp(exposure - (hazard.suggestedControls.some((control) => control.level !== 'ppe') ? 1 : 0), 1, 5)
      const residualEvaluation = evaluateRisk(residualProbability, residualSeverity, residualExposure)
      const requiredEvidence = unique([...hazard.evidenceExamples, ...hazard.suggestedControls.flatMap((control) => control.requiredEvidence)])
      const legalMatches = legalMatchesFor(sector, hazard)
      const legalValidationMissing = legalMatches.some((match) => match.status !== 'validated')
      const ppeOnlyWarning = hazard.suggestedControls.length > 0 && hazard.suggestedControls.every((control) => control.level === 'ppe')
      const proposedControlsInsufficient = residualEvaluation.acceptability !== 'Aceptable' || (ppeOnlyWarning && initialEvaluation.level !== 'Bajo')
      const warnings = [
        legalValidationMissing ? 'Requires legal validation' : '',
        ppeOnlyWarning ? 'Advertencia: controles propuestos dependen solo de EPP.' : '',
        proposedControlsInsufficient ? 'Los controles propuestos requieren mejora o verificacion adicional.' : '',
      ].filter(Boolean)

      return {
        id: `${task.id}-${hazard.id}-${index}`,
        companyName: profile.name || 'Sin razon social',
        ruc: profile.ruc || 'Sin RUC',
        workplace: profile.workplace || 'Sede no declarada',
        economicActivity: profile.businessActivity || 'Actividad economica pendiente',
        sector,
        area,
        process: area.process,
        position,
        jobPosition: position.title,
        task,
        routineType: task.activityKind,
        exposedWorkers: task.exposedWorkers,
        vulnerableWorkers: task.vulnerableWorkers || position.vulnerableWorkers || 'No declarado',
        hazardCategory: hazard.category,
        hazard,
        hazardSource: hazard.commonSources.join('; '),
        hazardousEvent: hazard.hazardousEvent,
        possibleDamage: hazard.commonConsequences.join('; '),
        riskDescription: `${hazard.hazardousEvent} durante ${task.name.toLowerCase()} en ${area.name}.`,
        consequences: hazard.commonConsequences.join('; '),
        existingControls: task.existingControls || 'No declarado',
        probability,
        severity,
        exposureFrequency: exposure,
        initialScore: initialEvaluation.score,
        initialLevel: initialEvaluation.level,
        riskAcceptability: initialEvaluation.acceptability,
        initialEvaluation,
        proposedControls: hazard.suggestedControls,
        controlHierarchyLevel: strongestControl,
        responsible: task.responsiblePerson || 'Responsable SST / jefe de area',
        responsiblePerson: task.responsiblePerson || 'Responsable SST / jefe de area',
        deadline: suggestedDeadline(initialEvaluation.level),
        requiredEvidence,
        evidenceRequired: requiredEvidence,
        residualProbability,
        residualSeverity,
        residualExposureFrequency: residualExposure,
        residualScore: residualEvaluation.score,
        residualLevel: residualEvaluation.level,
        residualAcceptability: residualEvaluation.acceptability,
        residualEvaluation,
        legalMatches,
        legalNorm: legalMatches[0]?.normTitle ?? 'Requires legal validation',
        legalArticle: legalMatches[0]?.articleLabel ?? 'Requires legal validation',
        legalSourceUrl: legalMatches[0]?.sourceUrl ?? '',
        legalValidationStatus: legalValidationMissing ? 'pending_validation' : 'validated',
        observations: warnings.join(' '),
        version: 'v1.0-borrador',
        preparedBy: profile.preparedBy || 'Pendiente',
        reviewedBy: profile.reviewedBy || 'Pendiente',
        approvedBy: profile.approvedBy || 'Pendiente',
        reviewDate,
        approvalDate: '',
        warnings,
        legalValidationMissing,
        ppeOnlyWarning,
        proposedControlsInsufficient,
        actionStatus: initialEvaluation.level === 'Bajo' ? 'pending' : 'in_progress',
        verificationStatus: 'Pendiente de evidencia',
      }
    })
  })
}

export function buildDashboard(rows: GeneratedAssessment[]): DashboardIndicators {
  const initialTotal = rows.reduce((total, row) => total + row.initialScore, 0)
  const residualTotal = rows.reduce((total, row) => total + row.residualScore, 0)
  const controlsByHierarchy = rows.reduce(
    (acc, row) => {
      acc[row.controlHierarchyLevel] += 1
      return acc
    },
    { elimination: 0, substitution: 0, engineering: 0, administrative: 0, training: 0, ppe: 0 } as Record<ControlLevel, number>,
  )

  return {
    totalHazards: new Set(rows.map((row) => row.hazard.id)).size,
    totalRisks: rows.length,
    criticalRisks: rows.filter((row) => row.initialLevel === 'Intolerable').length,
    risksWithoutValidatedLegalSupport: rows.filter((row) => row.legalValidationMissing).length,
    controlsByHierarchy,
    overdueControls: rows.filter((row) => row.actionStatus === 'overdue').length,
    averageInitialRisk: rows.length ? Math.round(initialTotal / rows.length) : 0,
    averageResidualRisk: rows.length ? Math.round(residualTotal / rows.length) : 0,
    reductionPercent: initialTotal ? Math.round(((initialTotal - residualTotal) / initialTotal) * 100) : 0,
    risksByArea: countBy(rows, (row) => row.area.name),
    risksByCategory: countBy(rows, (row) => row.hazardCategory),
    controlsPendingEvidence: rows.filter((row) => row.requiredEvidence.length > 0 && row.verificationStatus.includes('Pendiente')).length,
  }
}

export function validateBeforeExport(profile: CompanyProfile, rows: GeneratedAssessment[]): ValidationWarning[] {
  const warnings: ValidationWarning[] = []
  if (!profile.name || !profile.ruc || !profile.workplace) {
    warnings.push({ code: 'company-data', label: 'Complete razon social, RUC y centro de trabajo antes de exportar.', severity: 'critical' })
  }
  if (rows.some((row) => row.legalValidationMissing)) {
    warnings.push({ code: 'legal-validation', label: 'Hay obligaciones marcadas como Requires legal validation.', severity: 'warning' })
  }
  if (rows.some((row) => row.proposedControlsInsufficient)) {
    warnings.push({ code: 'control-strength', label: 'Existen riesgos residuales no aceptables o controles insuficientes.', severity: 'warning' })
  }
  return warnings
}

function strongestLevel(levels: ControlLevel[]): ControlLevel {
  const order: ControlLevel[] = ['elimination', 'substitution', 'engineering', 'administrative', 'training', 'ppe']
  return order.find((level) => levels.includes(level)) ?? 'administrative'
}

function suggestedDeadline(level: RiskBand): string {
  const days = level === 'Intolerable' ? 1 : level === 'Importante' ? 7 : level === 'Moderado' ? 30 : 60
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)))
}

function countBy(rows: GeneratedAssessment[], getKey: (row: GeneratedAssessment) => string): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = getKey(row)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}
