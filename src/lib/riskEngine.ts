import { hazards } from '../data/hazards'
import { legalArticles, legalNorms, sectorModules } from '../data/legalDatabase'
import type {
  CompanyProfile,
  GeneratedAssessment,
  Hazard,
  JobPosition,
  LegalMatch,
  RiskBand,
  SectorId,
  WorkArea,
  WorkTask,
} from '../types'

export function riskBand(score: number): RiskBand {
  if (score <= 2) return 'Trivial'
  if (score <= 4) return 'Tolerable'
  if (score <= 9) return 'Moderado'
  if (score <= 16) return 'Importante'
  return 'Intolerable'
}

export function matchHazards(task: WorkTask, sector: SectorId): Hazard[] {
  const text = `${task.name} ${task.frequency} ${task.existingControls}`.toLowerCase()
  const sectorModule = sectorModules.find((item) => item.id === sector)
  const matched = hazards
    .map((hazard) => {
      const keywordScore = hazard.keywords.filter((keyword) => text.includes(keyword)).length
      const sectorScore = hazard.sectors?.includes(sector) ? 1 : 0
      const boostScore = sectorModule?.hazardBoostKeywords.filter((keyword) => text.includes(keyword)).length ?? 0
      return { hazard, score: keywordScore * 3 + sectorScore + boostScore }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((item) => item.hazard)

  return matched.length > 0 ? matched.slice(0, 3) : [hazards[0]]
}

export function scoreProbability(task: WorkTask): number {
  let score = task.activityKind === 'routine' ? 3 : 2
  if (task.exposedWorkers >= 10) score += 1
  if (task.frequency.toLowerCase().includes('diaria')) score += 1
  if (task.existingControls.trim().length > 20) score -= 1
  return clamp(score, 1, 5)
}

export function scoreSeverity(hazard: Hazard, task: WorkTask): number {
  let score = hazard.category === 'Ergonomico' || hazard.category === 'Psicosocial' ? 2 : 3
  const severeWords = ['altura', 'electrico', 'quimico', 'biologico', 'ruido']
  if (severeWords.some((word) => `${hazard.name} ${task.name}`.toLowerCase().includes(word))) score += 1
  if (hazard.commonConsequences.some((item) => item.toLowerCase().includes('muerte'))) score += 1
  return clamp(score, 1, 5)
}

export function legalMatchesFor(sector: SectorId, hazard: Hazard): LegalMatch[] {
  const module = sectorModules.find((item) => item.id === sector)
  const normIds = module?.normIds ?? []
  const verifiedArticles = legalArticles.filter((article) => normIds.includes(article.normId))

  if (verifiedArticles.length === 0) {
    return normIds.map((normId) => {
      const norm = legalNorms.find((item) => item.id === normId)
      return {
        normTitle: norm?.title ?? normId,
        articleLabel: 'requires legal validation',
        obligation: `requires legal validation for ${hazard.category.toLowerCase()} hazard`,
        status: 'requires_legal_validation',
      }
    })
  }

  return verifiedArticles.map((article) => {
    const norm = legalNorms.find((item) => item.id === article.normId)
    return {
      normTitle: norm?.title ?? article.normId,
      articleLabel: article.articleLabel,
      obligation: article.obligation,
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
      const initialScore = probability * severity
      const residualProbability = clamp(probability - 1 - Math.floor(hazard.suggestedControls.length / 2), 1, 5)
      const residualSeverity = clamp(severity - (hazard.suggestedControls.some((control) => control.level === 'elimination') ? 1 : 0), 1, 5)
      const evidence = unique(hazard.suggestedControls.flatMap((control) => control.requiredEvidence))

      return {
        id: `${task.id}-${hazard.id}-${index}`,
        area,
        position,
        task,
        hazard,
        riskDescription: `${hazard.name} durante ${task.name.toLowerCase()} en ${profile.workplace || 'sede declarada'}.`,
        consequences: hazard.commonConsequences.join('; '),
        probability,
        severity,
        initialScore,
        initialLevel: riskBand(initialScore),
        existingControls: task.existingControls || 'No declarado',
        proposedControls: hazard.suggestedControls,
        residualProbability,
        residualSeverity,
        residualScore: residualProbability * residualSeverity,
        residualLevel: riskBand(residualProbability * residualSeverity),
        responsible: 'Responsable SST / jefe de area',
        deadline: suggestedDeadline(riskBand(initialScore)),
        requiredEvidence: evidence,
        legalMatches: legalMatchesFor(sector, hazard),
        reviewDate,
        version: 'v1.0-borrador',
      }
    })
  })
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
  return Array.from(new Set(values))
}
