export type SectorId =
  | 'public'
  | 'construction'
  | 'mining'
  | 'hydrocarbons'
  | 'health'
  | 'manufacturing'
  | 'offices'

export type ActivityKind = 'routine' | 'non_routine'

export type ControlLevel =
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'ppe'

export type RiskBand = 'Trivial' | 'Tolerable' | 'Moderado' | 'Importante' | 'Intolerable'

export interface CompanyProfile {
  name: string
  ruc: string
  ownership: 'public' | 'private'
  businessActivity: string
  ciiu: string
  workplace: string
  workerCount: number
}

export interface WorkArea {
  id: string
  name: string
  process: string
}

export interface JobPosition {
  id: string
  areaId: string
  title: string
  workerCount: number
}

export interface WorkTask {
  id: string
  positionId: string
  name: string
  activityKind: ActivityKind
  frequency: string
  exposedWorkers: number
  existingControls: string
}

export interface Hazard {
  id: string
  category: string
  name: string
  commonConsequences: string[]
  suggestedControls: ControlTemplate[]
  sectors?: SectorId[]
  keywords: string[]
}

export interface ControlTemplate {
  level: ControlLevel
  description: string
  technicalJustification: string
  requiredEvidence: string[]
}

export interface LegalNorm {
  id: string
  title: string
  shortName: string
  jurisdiction: 'Peru'
  module: 'general' | SectorId
  sourceStatus: 'internal_verified' | 'official_uploaded_required'
  notes: string
}

export interface LegalArticle {
  id: string
  normId: string
  articleLabel: string
  obligation: string
  sourceExcerpt?: string
  sourceStatus: 'internal_verified' | 'uploaded_official'
}

export interface LegalMatch {
  normTitle: string
  articleLabel: string
  obligation: string
  status: 'validated' | 'requires_legal_validation'
}

export interface GeneratedAssessment {
  id: string
  area: WorkArea
  position: JobPosition
  task: WorkTask
  hazard: Hazard
  riskDescription: string
  consequences: string
  probability: number
  severity: number
  initialScore: number
  initialLevel: RiskBand
  existingControls: string
  proposedControls: ControlTemplate[]
  residualProbability: number
  residualSeverity: number
  residualScore: number
  residualLevel: RiskBand
  responsible: string
  deadline: string
  requiredEvidence: string[]
  legalMatches: LegalMatch[]
  reviewDate: string
  version: string
}

export interface SectorModule {
  id: SectorId
  label: string
  description: string
  normIds: string[]
  hazardBoostKeywords: string[]
}
