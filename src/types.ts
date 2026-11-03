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

/** Thematic family used by the "Normativa" filters and by the diagnostic rules. */
export type LegalCategory =
  | 'general-sst'
  | 'iperc'
  | 'committee-supervisor'
  | 'records'
  | 'occupational-health'
  | 'accidents-incidents'
  | 'ergonomics'
  | 'sectoral'
  | 'environmental'
  | 'inspection'
  | 'data-ai'

/** Current standing of the norm itself. */
export type LegalEffectiveStatus = 'vigente' | 'modificada' | 'derogada' | 'verification-required'

/** Confidence on the source we link to, never on the legal interpretation. */
export type LegalSourceStatus = 'official-verified' | 'verification-required'

/**
 * How a statement derived from the norm must be presented to the reader.
 * Keeping this explicit avoids showing a recommendation as if it were mandatory.
 */
export type ObligationKind =
  | 'obligacion-legal'
  | 'recomendacion'
  | 'buena-practica'
  | 'requisito-sectorial'
  | 'pendiente-verificacion'

export interface LegalNorm {
  id: string
  shortName: string
  officialTitle: string
  /** Legacy alias of `officialTitle`, still consumed by the risk engine and the Excel exporters. */
  title: string
  category: LegalCategory
  jurisdiction: 'Peru'
  /** Legacy grouping used by the sector modules of the IPERC engine. */
  module: 'general' | SectorId
  authority: string
  publicationDate?: string
  effectiveStatus: LegalEffectiveStatus
  sourceStatus: LegalSourceStatus
  officialPageUrl: string
  officialDocumentUrl?: string
  /** Legacy alias of `officialPageUrl`. */
  sourceUrl?: string
  plainLanguageSummary: string
  /** Short bullets answering "¿Qué regula?" without copying legal text. */
  whatItRegulates: string[]
  appliesTo: string[]
  keyTopics: string[]
  obligationKind: ObligationKind
  relatedNormIds?: string[]
  relatedTemplateIds?: string[]
  relatedRouteId?: string
  lastVerifiedAt: string
  notes?: string
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
  área: WorkArea
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
  versión: string
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
