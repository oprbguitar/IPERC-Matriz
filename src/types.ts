export type SectorId =
  | 'public'
  | 'construction'
  | 'mining'
  | 'hydrocarbons'
  | 'health'
  | 'manufacturing'
  | 'offices'
  | 'transport_logistics'
  | 'warehouses'
  | 'maintenance_services'

export type ActivityKind = 'routine' | 'non_routine' | 'emergency'

export type ControlLevel =
  | 'elimination'
  | 'substitution'
  | 'engineering'
  | 'administrative'
  | 'training'
  | 'ppe'

export type RiskBand = 'Bajo' | 'Moderado' | 'Importante' | 'Intolerable'

export type LegalValidationStatus = 'validated' | 'pending_validation'

export type ActionStatus = 'pending' | 'in_progress' | 'implemented' | 'verified' | 'overdue' | 'not_applicable'

export interface CompanyProfile {
  name: string
  ruc: string
  ownership: 'public' | 'private'
  businessActivity: string
  ciiu: string
  workplace: string
  workerCount: number
  sgsstResponsible?: string
  preparedBy?: string
  reviewedBy?: string
  approvedBy?: string
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
  vulnerableWorkers?: string
}

export interface WorkTask {
  id: string
  positionId: string
  name: string
  activityKind: ActivityKind
  frequency: string
  exposedWorkers: number
  vulnerableWorkers?: string
  existingControls: string
  responsiblePerson?: string
}

export interface Hazard {
  id: string
  category: string
  name: string
  commonSources: string[]
  commonConsequences: string[]
  affectedRoles: string[]
  suggestedExistingControls: string[]
  suggestedControls: ControlTemplate[]
  evidenceExamples: string[]
  sectors?: SectorId[]
  keywords: string[]
  recommendedControlLevel: ControlLevel
  hazardousEvent: string
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
  sourceUrl?: string
  notes: string
}

export interface LegalArticle {
  id: string
  normId: string
  articleLabel: string
  obligation: string
  sourceExcerpt?: string
  sourceUrl?: string
  sourceStatus: 'internal_verified' | 'uploaded_official'
}

export interface LegalMatch {
  normTitle: string
  articleLabel: string
  obligation: string
  sourceUrl: string
  status: LegalValidationStatus
}

export interface RiskEvaluation {
  probability: number
  severity: number
  exposure: number
  score: number
  level: RiskBand
  colorClass: string
  acceptability: 'Aceptable' | 'No aceptable'
  priority: 'Baja' | 'Media' | 'Alta' | 'Inmediata'
  requiredAction: string
  workDecision: 'Continuar con control' | 'Mejorar controles' | 'Detener hasta controlar'
}

export interface GeneratedAssessment {
  id: string
  companyName: string
  ruc: string
  workplace: string
  economicActivity: string
  sector: SectorId
  area: WorkArea
  process: string
  position: JobPosition
  jobPosition: string
  task: WorkTask
  routineType: ActivityKind
  exposedWorkers: number
  vulnerableWorkers: string
  hazardCategory: string
  hazard: Hazard
  hazardSource: string
  hazardousEvent: string
  possibleDamage: string
  riskDescription: string
  consequences: string
  existingControls: string
  probability: number
  severity: number
  exposureFrequency: number
  initialScore: number
  initialLevel: RiskBand
  riskAcceptability: string
  initialEvaluation: RiskEvaluation
  proposedControls: ControlTemplate[]
  controlHierarchyLevel: ControlLevel
  responsible: string
  responsiblePerson: string
  deadline: string
  requiredEvidence: string[]
  evidenceRequired: string[]
  residualProbability: number
  residualSeverity: number
  residualExposureFrequency: number
  residualScore: number
  residualLevel: RiskBand
  residualAcceptability: string
  residualEvaluation: RiskEvaluation
  legalMatches: LegalMatch[]
  legalNorm: string
  legalArticle: string
  legalSourceUrl: string
  legalValidationStatus: LegalValidationStatus
  observations: string
  version: string
  preparedBy: string
  reviewedBy: string
  approvedBy: string
  reviewDate: string
  approvalDate: string
  warnings: string[]
  legalValidationMissing: boolean
  ppeOnlyWarning: boolean
  proposedControlsInsufficient: boolean
  actionStatus: ActionStatus
  verificationStatus: string
}

export interface SectorModule {
  id: SectorId
  label: string
  description: string
  normIds: string[]
  hazardBoostKeywords: string[]
  hazardGroups: string[]
  suggestedEvidence: string[]
  typicalControls: string[]
  legalReferences: string[]
  validationWarning: string
}

export interface EvidenceRequirement {
  id: string
  label: string
  appliesTo: 'general' | SectorId
  examples: string[]
}

export interface DashboardIndicators {
  totalHazards: number
  totalRisks: number
  criticalRisks: number
  risksWithoutValidatedLegalSupport: number
  controlsByHierarchy: Record<ControlLevel, number>
  overdueControls: number
  averageInitialRisk: number
  averageResidualRisk: number
  reductionPercent: number
  risksByArea: Record<string, number>
  risksByCategory: Record<string, number>
  controlsPendingEvidence: number
}

export interface ValidationWarning {
  code: string
  label: string
  severity: 'info' | 'warning' | 'critical'
}
