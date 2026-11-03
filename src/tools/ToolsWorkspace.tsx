import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  Boxes,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  ClipboardList,
  Command,
  Copy,
  Download,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Gauge,
  GripVertical,
  LayoutGrid,
  List,
  Paperclip,
  Layers3,
  LayoutDashboard,
  LineChart,
  Menu,
  Plus,
  Radar,
  Save,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  Sparkles,
  Target,
  Trash2,
  UploadCloud,
  X,
  Zap,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { LegalReference } from '../components/LegalReference'
import { findGuide } from '../data/guides'
import { AnalyticsView } from './AnalyticsView'
import { LEGAL_STATUS_LABELS, legalNorms, sectorModules } from '../data/legalDatabase'
import type { ExportContext, ReportKind } from '../lib/exporters'

// xlsx is heavy; load the export module only when the user actually exports.
const loadExporters = () => import('../lib/exporters')
import {
  deleteProject,
  duplicateProject,
  listProjects,
  saveDraftLocal,
  saveProject,
  type ProjectStatus,
  type SavedProject,
} from '../lib/projectStore'
import { buildDashboard, evaluateRisk, generateAssessments, validateBeforeExport } from '../lib/riskEngine'
import { validateRegistration } from '../lib/validation'
import type {
  ActionStatus,
  ActivityKind,
  CompanyProfile,
  GeneratedAssessment,
  JobPosition,
  RiskBand,
  SectorId,
  WorkArea,
  WorkTask,
} from '../types'

type ViewId = 'dashboard' | 'matrix' | 'analysis' | 'analytics' | 'actions' | 'evidence' | 'normative' | 'reports' | 'settings'
type ModalKind = 'projects' | 'quick' | null

interface RowOverride {
  probability?: number
  severity?: number
  exposureFrequency?: number
  residualProbability?: number
  residualSeverity?: number
  residualExposureFrequency?: number
  actionStatus?: ActionStatus
  verificationStatus?: string
}

interface Notice {
  text: string
  tone: 'info' | 'success' | 'warning' | 'error'
}

const navItems: Array<{ id: ViewId; label: string; subtitle: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Resumen', subtitle: 'Vista general del proyecto', icon: LayoutDashboard },
  { id: 'matrix', label: 'Matriz IPERC', subtitle: 'Ver y editar', icon: Boxes },
  { id: 'analysis', label: 'Análisis', subtitle: 'Riesgos e indicadores', icon: LineChart },
  { id: 'analytics', label: 'Analítica', subtitle: 'Multas, organización, IF/IS', icon: Gauge },
  { id: 'actions', label: 'Plan de acción', subtitle: 'Tareas y seguimiento', icon: ClipboardList },
  { id: 'evidence', label: 'Evidencias', subtitle: 'Documentos y fotos', icon: Archive },
  { id: 'normative', label: 'Normativa', subtitle: 'Legal y requisitos', icon: Scale },
  { id: 'reports', label: 'Reportes', subtitle: 'Exportes y tableros', icon: FileText },
  { id: 'settings', label: 'Registro', subtitle: 'Empresa, áreas y tareas', icon: Settings },
]

const ACTION_STATUS_LABELS: Record<ActionStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En ejecución',
  implemented: 'Implementado',
  verified: 'Verificado',
  overdue: 'Vencido',
  not_applicable: 'No aplica',
}

const initialProfile: CompanyProfile = {
  name: 'Constructora Torre Sigma',
  ruc: '20123456789',
  ownership: 'private',
  businessActivity: 'Construcción de edificios y obras civiles',
  ciiu: '4100',
  workplace: 'Edificación Torre Sigma',
  workerCount: 42,
  sgsstResponsible: 'Responsable SST',
  preparedBy: 'Especialista SST',
  reviewedBy: 'Comité SST',
  approvedBy: 'Gerencia de operaciones',
}

const initialAreas: WorkArea[] = [
  { id: 'area-1', name: 'Obra civil', process: 'Estructuras, altura y trabajos de campo' },
  { id: 'area-2', name: 'Almacén de obra', process: 'Recepción, izaje y despacho de materiales' },
  { id: 'area-3', name: 'Mantenimiento', process: 'Instalaciones eléctricas y herramientas' },
]

const initialPositions: JobPosition[] = [
  { id: 'pos-1', areaId: 'area-1', title: 'Operario de altura', workerCount: 8 },
  { id: 'pos-2', areaId: 'area-2', title: 'Auxiliar de almacén', workerCount: 6 },
  { id: 'pos-3', areaId: 'area-3', title: 'Técnico electricista', workerCount: 4 },
]

const initialTasks: WorkTask[] = [
  {
    id: 'task-1',
    positionId: 'pos-1',
    name: 'Trabajo en altura sobre andamio y borde abierto',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 8,
    existingControls: 'Arnés, línea de vida, charla inicial y supervisión del capataz',
    responsiblePerson: 'Jefe de obra',
  },
  {
    id: 'task-2',
    positionId: 'pos-2',
    name: 'Izaje de materiales y descarga de cargas suspendidas',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 6,
    existingControls: 'Señalero, delimitación parcial y checklist visual',
    responsiblePerson: 'Supervisor de almacén',
  },
  {
    id: 'task-3',
    positionId: 'pos-3',
    name: 'Instalación eléctrica temporal y conexion de tableros',
    activityKind: 'non_routine',
    frequency: 'Semanal',
    exposedWorkers: 4,
    existingControls: 'Herramientas aisladas y bloqueo operativo',
    responsiblePerson: 'Técnico lider',
  },
  {
    id: 'task-4',
    positionId: 'pos-3',
    name: 'Uso de taladro, esmeril y herramientas portatiles',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 5,
    existingControls: 'Lentes, guantes y verificación de discos',
    responsiblePerson: 'Supervisor de mantenimiento',
  },
]

const randomCases: Array<{ profile: CompanyProfile; sector: SectorId; áreas: WorkArea[]; positions: JobPosition[]; tasks: WorkTask[] }> = [
  {
    profile: {
      name: 'Minera Andina Norte',
      ruc: '20555111444',
      ownership: 'private',
      businessActivity: 'Operación minera y planta de concentrado',
      ciiu: '0729',
      workplace: 'Unidad San Rafael',
      workerCount: 186,
      sgsstResponsible: 'Responsable SST de unidad',
      preparedBy: 'Equipo SST mina',
      reviewedBy: 'Superintendencia HSE',
      approvedBy: 'Gerencia de unidad',
    },
    sector: 'mining',
    áreas: [
      { id: 'm-area-1', name: 'Planta concentradora', process: 'Chancado, molienda y mantenimiento' },
      { id: 'm-area-2', name: 'Transporte interno', process: 'Acarreo y rutas operativas' },
    ],
    positions: [
      { id: 'm-pos-1', areaId: 'm-area-1', title: 'Operador de planta', workerCount: 24 },
      { id: 'm-pos-2', areaId: 'm-area-2', title: 'Conductor de camion', workerCount: 18 },
    ],
    tasks: [
      { id: 'm-task-1', positionId: 'm-pos-1', name: 'Mantenimiento de faja, chancadora y partes moviles', activityKind: 'non_routine', frequency: 'Semanal', exposedWorkers: 6, existingControls: 'Bloqueo verbal, guardas parciales y EPP', responsiblePerson: 'Supervisor de planta' },
      { id: 'm-task-2', positionId: 'm-pos-2', name: 'Conducción de camion por ruta interna y zona de acarreo', activityKind: 'routine', frequency: 'Diaria continua', exposedWorkers: 18, existingControls: 'Check preuso, radio y límite de velocidad', responsiblePerson: 'Jefe de guardia' },
    ],
  },
  {
    profile: {
      name: 'Clinica Salud Futuro',
      ruc: '20666777888',
      ownership: 'private',
      businessActivity: 'Servicios de salud y laboratorio',
      ciiu: '8610',
      workplace: 'Sede Miraflores',
      workerCount: 95,
      sgsstResponsible: 'Coordinación SST',
      preparedBy: 'Coordinación SST',
      reviewedBy: 'Dirección médica',
      approvedBy: 'Administración general',
    },
    sector: 'health',
    áreas: [
      { id: 'h-area-1', name: 'Emergencia', process: 'Atención asistencial y triaje' },
      { id: 'h-area-2', name: 'Laboratorio', process: 'Muestras y residuos biológicos' },
    ],
    positions: [
      { id: 'h-pos-1', areaId: 'h-area-1', title: 'Técnico de enfermeria', workerCount: 16 },
      { id: 'h-pos-2', areaId: 'h-area-2', title: 'Tecnologo médico', workerCount: 9 },
    ],
    tasks: [
      { id: 'h-task-1', positionId: 'h-pos-1', name: 'Atención de paciente, fluidos y punzocortantes', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 16, existingControls: 'Guantes, contenedores y segregación inicial', responsiblePerson: 'Jefa de enfermeria' },
      { id: 'h-task-2', positionId: 'h-pos-2', name: 'Manipulación de reactivos químicos y muestras biologicas', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 9, existingControls: 'SDS, mascarilla y cabina parcial', responsiblePerson: 'Jefe de laboratorio' },
    ],
  },
  {
    profile: {
      name: 'Logística Pacifico 2040',
      ruc: '20444555666',
      ownership: 'private',
      businessActivity: 'Almacenamiento, transporte y distribución',
      ciiu: '5210',
      workplace: 'Hub Callao',
      workerCount: 74,
      sgsstResponsible: 'Analista SST',
      preparedBy: 'Analista SST',
      reviewedBy: 'Jefatura de operaciones',
      approvedBy: 'Gerencia logística',
    },
    sector: 'transport_logistics',
    áreas: [
      { id: 'l-area-1', name: 'Patio de maniobras', process: 'Rutas internas y carga vehicular' },
      { id: 'l-area-2', name: 'Almacén', process: 'Picking y despacho' },
    ],
    positions: [
      { id: 'l-pos-1', areaId: 'l-area-1', title: 'Operador de montacarga', workerCount: 12 },
      { id: 'l-pos-2', areaId: 'l-area-2', title: 'Auxiliar de picking', workerCount: 20 },
    ],
    tasks: [
      { id: 'l-task-1', positionId: 'l-pos-1', name: 'Movimiento de montacarga, rutas internas y cruce peatonal', activityKind: 'routine', frequency: 'Diaria continua', exposedWorkers: 20, existingControls: 'Licencia, claxon y demarcación parcial', responsiblePerson: 'Coordinador de patio' },
      { id: 'l-task-2', positionId: 'l-pos-2', name: 'Manipulación manual de cajas, carga y despacho', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 20, existingControls: 'Guantes, pausas informales y supervisión', responsiblePerson: 'Jefe de almacén' },
    ],
  },
]

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return `${prefix}-${crypto.randomUUID()}`
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function applyOverride(row: GeneratedAssessment, override?: RowOverride): GeneratedAssessment {
  if (!override) return row
  const probability = override.probability ?? row.probability
  const severity = override.severity ?? row.severity
  const exposure = override.exposureFrequency ?? row.exposureFrequency
  const initial = evaluateRisk(probability, severity, exposure)
  const residualProbability = override.residualProbability ?? row.residualProbability
  const residualSeverity = override.residualSeverity ?? row.residualSeverity
  const residualExposure = override.residualExposureFrequency ?? row.residualExposureFrequency
  const residual = evaluateRisk(residualProbability, residualSeverity, residualExposure)
  return {
    ...row,
    probability,
    severity,
    exposureFrequency: exposure,
    initialScore: initial.score,
    initialLevel: initial.level,
    initialEvaluation: initial,
    riskAcceptability: initial.acceptability,
    residualProbability,
    residualSeverity,
    residualExposureFrequency: residualExposure,
    residualScore: residual.score,
    residualLevel: residual.level,
    residualEvaluation: residual,
    residualAcceptability: residual.acceptability,
    actionStatus: override.actionStatus ?? row.actionStatus,
    verificationStatus: override.verificationStatus ?? row.verificationStatus,
  }
}

/**
 * Espacio de trabajo avanzado: generador IPERC, matriz, análisis, plan de acción,
 * evidencias, normativa aplicable, reportes y registro del proyecto.
 *
 * Se mantiene la logica original de generación, cálculo de riesgo residual,
 * autoguardado, proyectos guardados y exportaciones.
 */
export function ToolsWorkspace({ onBackToSite, onOpenGuide }: { onBackToSite: () => void; onOpenGuide?: (guideId: string) => void }) {
  const [view, setView] = useState<ViewId>('dashboard')
  const [expertMode, setExpertMode] = useState(false)
  const [sector, setSector] = useState<SectorId>('construction')
  const [profile, setProfile] = useState(initialProfile)
  const [áreas, setAreas] = useState(initialAreas)
  const [positions, setPositions] = useState(initialPositions)
  const [tasks, setTasks] = useState(initialTasks)
  const [overrides, setOverrides] = useState<Record<string, RowOverride>>({})
  const [modal, setModal] = useState<ModalKind>(null)
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('todos')
  const [legalFilter, setLegalFilter] = useState('todos')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [notice, setNotice] = useState<Notice | null>(null)
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('draft')
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined)
  const [caseCursor, setCaseCursor] = useState(0)
  const noticeTimer = useRef<number | undefined>(undefined)

  const baseAssessments = useMemo(
    () => generateAssessments(profile, sector, áreas, positions, tasks),
    [profile, sector, áreas, positions, tasks],
  )
  const assessments = useMemo(
    () => baseAssessments.map((row) => applyOverride(row, overrides[row.id])),
    [baseAssessments, overrides],
  )
  const dashboard = useMemo(() => buildDashboard(assessments), [assessments])
  const exportWarnings = useMemo(() => validateBeforeExport(profile, assessments), [profile, assessments])
  const registrationErrors = useMemo(
    () => validateRegistration(profile, áreas, positions, tasks),
    [profile, áreas, positions, tasks],
  )
  const filteredRows = useMemo(
    () => assessments.filter((row) => {
      const text = `${row.task.name} ${row.hazard.name} ${row.área.name}`.toLowerCase()
      const matchesQuery = text.includes(query.toLowerCase())
      const matchesRisk = riskFilter === 'todos' || row.initialLevel === riskFilter
      const matchesLegal = legalFilter === 'todos' || (legalFilter === 'pendiente' ? row.legalValidationMissing : !row.legalValidationMissing)
      return matchesQuery && matchesRisk && matchesLegal
    }),
    [assessments, query, riskFilter, legalFilter],
  )
  const riskIndex = computeRiskIndex(assessments)
  const assistantItems = buildAssistantItems(assessments)
  const activeTitle = navItems.find((item) => item.id === view)?.label ?? 'Dashboard'

  const showNotice = useCallback((next: Notice) => {
    setNotice(next)
    if (noticeTimer.current) window.clearTimeout(noticeTimer.current)
    noticeTimer.current = window.setTimeout(() => setNotice(null), 5000)
  }, [])

  const exportContext = useCallback(
    (rows: GeneratedAssessment[] = assessments, appliedFilters?: string): ExportContext => ({
      profile,
      sector,
      áreas,
      positions,
      tasks,
      rows,
      appliedFilters,
    }),
    [profile, sector, áreas, positions, tasks, assessments],
  )

  // Autosave draft locally whenever the working data changes.
  useEffect(() => {
    const handle = window.setTimeout(() => {
      saveDraftLocal({ profile, sector, áreas, positions, tasks })
    }, 1200)
    return () => window.clearTimeout(handle)
  }, [profile, sector, áreas, positions, tasks])

  const handleManualSave = useCallback(async () => {
    const errors = validateRegistration(profile, áreas, positions, tasks)
    if (errors.length > 0) {
      showNotice({ text: `Complete el registro antes de guardar: ${errors[0].message}`, tone: 'warning' })
      setView('settings')
      return
    }
    setSaveState('saving')
    const result = await saveProject({ profile, sector, áreas, positions, tasks }, projectStatus, currentProjectId)
    if (result.data) setCurrentProjectId(result.data.id)
    setSaveState(result.ok ? 'saved' : 'error')
    showNotice({ text: result.message, tone: result.mode === 'supabase' ? 'success' : 'info' })
  }, [profile, sector, áreas, positions, tasks, projectStatus, currentProjectId, showNotice])

  const loadProject = useCallback((project: SavedProject) => {
    setProfile(project.payload.profile)
    setSector(project.payload.sector)
    setAreas(project.payload.áreas)
    setPositions(project.payload.positions)
    setTasks(project.payload.tasks)
    setOverrides({})
    setProjectStatus(project.status)
    setCurrentProjectId(project.id)
    setModal(null)
    setView('matrix')
    showNotice({ text: `Proyecto "${project.companyName}" cargado.`, tone: 'success' })
  }, [showNotice])

  function generateRandomCase() {
    const next = randomCases[caseCursor % randomCases.length]
    setProfile(next.profile)
    setSector(next.sector)
    setAreas(next.áreas)
    setPositions(next.positions)
    setTasks(next.tasks)
    setOverrides({})
    setCurrentProjectId(undefined)
    setProjectStatus('draft')
    setCaseCursor((value) => value + 1)
    setView('dashboard')
  }

  const handleOverride = useCallback((rowId: string, patch: RowOverride) => {
    setOverrides((prev) => ({ ...prev, [rowId]: { ...prev[rowId], ...patch } }))
  }, [])

  const handleExportExcel = useCallback(
    async (rows: GeneratedAssessment[], filters?: string) => {
      if (rows.length === 0) {
        showNotice({ text: 'No hay filas para exportar.', tone: 'warning' })
        return
      }
      const exporters = await loadExporters()
      exporters.exportExcel(exportContext(rows, filters))
      showNotice({ text: 'Excel (.xlsx) generado.', tone: 'success' })
    },
    [exportContext, showNotice],
  )

  return (
    <div className="app-shell">
      <Sidebar activeView={view} onChange={setView} onBackToSite={onBackToSite} />
      <section className="app-canvas">
        <TopBar
          title={activeTitle}
          profile={profile}
          expertMode={expertMode}
          setExpertMode={setExpertMode}
          saveState={saveState}
          onSave={handleManualSave}
          query={query}
          setQuery={setQuery}
          onSearch={() => setView('matrix')}
        />
        {notice && (
          <div className={`app-notice ${notice.tone}`} role="status">
            <span>{notice.text}</span>
            <button type="button" onClick={() => setNotice(null)} aria-label="Cerrar aviso"><X size={14} /></button>
          </div>
        )}
        <div className="content-grid">
          <section className="view-stage">
            {view === 'dashboard' && (
              <DashboardHome
                profile={profile}
                rows={assessments}
                dashboard={dashboard}
                riskIndex={riskIndex}
                registrationErrors={registrationErrors.length}
                onGenerate={() => setView('matrix')}
                onRandom={generateRandomCase}
                onLoad={() => setModal('projects')}
                onViewMatrix={() => setView('matrix')}
                onStep={setView}
              />
            )}
            {view === 'matrix' && (
              <MatrixView
                rows={filteredRows}
                allRows={assessments}
                expertMode={expertMode}
                query={query}
                setQuery={setQuery}
                riskFilter={riskFilter}
                setRiskFilter={setRiskFilter}
                legalFilter={legalFilter}
                setLegalFilter={setLegalFilter}
                expandedRow={expandedRow}
                setExpandedRow={setExpandedRow}
                onOverride={handleOverride}
                onExport={() => handleExportExcel(filteredRows, describeFilters(query, riskFilter, legalFilter))}
                onExportAll={() => handleExportExcel(assessments)}
              />
            )}
            {view === 'analysis' && <AnalysisView rows={assessments} dashboard={dashboard} riskIndex={riskIndex} />}
            {view === 'analytics' && <AnalyticsView rows={assessments} workerCount={profile.workerCount} onOpenGuide={onOpenGuide} />}
            {view === 'actions' && <ActionPlanBoard rows={assessments} onOverride={handleOverride} />}
            {view === 'evidence' && <EvidencePanel rows={assessments} />}
            {view === 'normative' && <NormativeSection sector={sector} rows={assessments} />}
            {view === 'reports' && (
              <ReportsPanel
                rows={assessments}
                warnings={exportWarnings}
                onReport={async (kind) => {
                  const exporters = await loadExporters()
                  exporters.exportReport(kind, exportContext())
                  showNotice({ text: 'Reporte exportado en Excel (.xlsx).', tone: 'success' })
                }}
                onWord={async () => {
                  const exporters = await loadExporters()
                  exporters.exportWord(exportContext())
                }}
                onCsv={async () => {
                  const exporters = await loadExporters()
                  exporters.exportCsv(exportContext())
                }}
                onPdf={() => window.print()}
              />
            )}
            {view === 'settings' && (
              <RegistrationPanel
                profile={profile}
                setProfile={setProfile}
                sector={sector}
                setSector={setSector}
                áreas={áreas}
                setAreas={setAreas}
                positions={positions}
                setPositions={setPositions}
                tasks={tasks}
                setTasks={setTasks}
                errors={registrationErrors}
                projectStatus={projectStatus}
                setProjectStatus={setProjectStatus}
                onSave={handleManualSave}
                saveState={saveState}
              />
            )}
          </section>
          <AssistantPanel items={assistantItems} rows={assessments} activeView={view} onAction={setView} onOpenGuide={onOpenGuide} />
        </div>
      </section>
      <MobileBottomNav activeView={view} onChange={setView} onQuick={() => setModal('quick')} />
      <Modal
        kind={modal}
        onClose={() => setModal(null)}
        onRandom={generateRandomCase}
        onLoadProject={loadProject}
        onDuplicated={(message) => showNotice({ text: message, tone: 'info' })}
        onExportProject={async (project) => {
          const exporters = await loadExporters()
          exporters.exportExcel({
            profile: project.payload.profile,
            sector: project.payload.sector,
            áreas: project.payload.áreas,
            positions: project.payload.positions,
            tasks: project.payload.tasks,
            rows: generateAssessments(
              project.payload.profile,
              project.payload.sector,
              project.payload.áreas,
              project.payload.positions,
              project.payload.tasks,
            ),
          })
        }}
      />
    </div>
  )
}

function describeFilters(query: string, riskFilter: string, legalFilter: string): string {
  const parts: string[] = []
  if (query) parts.push(`busqueda "${query}"`)
  if (riskFilter !== 'todos') parts.push(`riesgo ${riskFilter}`)
  if (legalFilter !== 'todos') parts.push(`legal ${legalFilter}`)
  return parts.length ? parts.join(', ') : 'sin filtros (todas las filas)'
}

function Sidebar({
  activeView,
  onChange,
  onBackToSite,
}: {
  activeView: ViewId
  onChange: (view: ViewId) => void
  onBackToSite: () => void
}) {
  return (
    <aside className="sidebar">
      <button type="button" className="tools-back" onClick={onBackToSite}>
        <ChevronLeft size={16} /> Volver a Ruta SST Perú
      </button>
      <div className="brand">
        <div className="brand-mark"><Shield size={22} /></div>
        <strong>Herramientas <span>IPERC</span></strong>
      </div>
      <nav className="side-nav" aria-label="Navegación de herramientas">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button type="button" key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onChange(item.id)}>
              <Icon size={19} />
              <span><b>{item.label}</b><small>{item.subtitle}</small></span>
            </button>
          )
        })}
      </nav>
    </aside>
  )
}

function TopBar({
  title,
  profile,
  expertMode,
  setExpertMode,
  saveState,
  onSave,
  query,
  setQuery,
  onSearch,
}: {
  title: string
  profile: CompanyProfile
  expertMode: boolean
  setExpertMode: (value: boolean) => void
  saveState: string
  onSave: () => void
  query: string
  setQuery: (value: string) => void
  onSearch: () => void
}) {
  return (
    <header className="topbar">
      <button type="button" className="icon-button mobile-menu" aria-label="Abrir menu"><Menu size={20} /></button>
      <div>
        <span className="view-label">Vista general</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-tools">
        <span className="plant-tag"><Building2 size={15} />{profile.workplace || 'Centro de trabajo'}</span>
        <form
          className="search-box"
          onSubmit={(event) => {
            event.preventDefault()
            onSearch()
          }}
        >
          <Search size={16} />
          <input
            aria-label="Buscar en IPERC"
            placeholder="Buscar riesgo, tarea o área"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={onSearch}
          />
        </form>
        <button type="button" className={`expert-toggle ${expertMode ? 'on' : ''}`} onClick={() => setExpertMode(!expertMode)} aria-pressed={expertMode}>
          <span>Modo experto</span><i />
        </button>
        <button type="button" className="primary-neon compact" onClick={onSave} disabled={saveState === 'saving'}>
          <Save size={16} />
          {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado' : 'Guardar proyecto'}
        </button>
      </div>
    </header>
  )
}

function DashboardHome({
  profile,
  rows,
  dashboard,
  riskIndex,
  registrationErrors,
  onGenerate,
  onRandom,
  onLoad,
  onViewMatrix,
  onStep,
}: {
  profile: CompanyProfile
  rows: GeneratedAssessment[]
  dashboard: ReturnType<typeof buildDashboard>
  riskIndex: number
  registrationErrors: number
  onGenerate: () => void
  onRandom: () => void
  onLoad: () => void
  onViewMatrix: () => void
  onStep: (view: ViewId) => void
}) {
  return (
    <div className="dashboard-view">
      <section className="welcome-row">
        <div>
          <h2>Resumen del proyecto</h2>
          <p>Riesgos, controles y acciones en curso</p>
        </div>
        <span>{profile.name} · {profile.workplace}</span>
      </section>
      <TemplateDownloadPanel />
      <StepFlow registrationErrors={registrationErrors} rowCount={rows.length} onStep={onStep} />
      <section className="action-grid">
        <ActionCard title="Generar IPERC" subtitle="Nuevo análisis" icon={Layers3} tone="purple" onClick={onGenerate} />
        <ActionCard title="Caso de ejemplo" subtitle="Cargar un caso completo" icon={Sparkles} tone="blue" onClick={onRandom} />
        <ActionCard title="Mis proyectos" subtitle="Guardados" icon={FolderOpen} tone="green" onClick={onLoad} />
        <ActionCard title="Normativa aplicable" subtitle="Marco legal del sector" icon={Scale} tone="orange" onClick={() => onStep('normative')} />
      </section>
      <section className="mobile-quick-actions" aria-label="Acciones rápidas">
        <button type="button" onClick={onRandom}><Sparkles size={18} />Caso de ejemplo</button>
        <button type="button" onClick={() => onStep('normative')}><Scale size={18} />Normativa</button>
        <button type="button" onClick={onLoad}><FolderOpen size={18} />Mis proyectos</button>
        <button type="button" onClick={onGenerate}><Boxes size={18} />Matriz rápida</button>
      </section>
      <section className="kpi-strip">
        <MetricCard label="Riesgos totales" value={String(dashboard.totalRisks)} delta="Filas generadas" tone="purple" />
        <MetricCard label="Críticos" value={String(rows.filter((row) => row.initialLevel === 'Intolerable').length)} delta="Atención inmediata" tone="red" />
        <RiskIndexCard value={riskIndex} level={riskIndex > 72 ? 'Intolerable' : riskIndex > 55 ? 'Importante' : 'Moderado'} />
        <MetricCard label="Reducción residual" value={`${dashboard.reductionPercent}%`} delta="Tras controles" tone="green" />
        <MetricCard label="Evidencias pendientes" value={String(dashboard.controlsPendingEvidence)} delta="Por subir" tone="yellow" />
      </section>
      <section className="dashboard-lower">
        <RecentMatrixCard rows={rows.slice(0, 5)} profile={profile} onViewMatrix={onViewMatrix} />
        <CompactAssistant rows={rows} onAction={onStep} />
        <DistributionCard rows={rows} />
        <ProgressCard rows={rows} />
        <NextActions rows={rows} />
      </section>
    </div>
  )
}

function TemplateDownloadPanel() {
  const baseUrl = import.meta.env.BASE_URL

  return (
    <section className="template-download-panel" aria-label="Descargar plantillas IPERC">
      <a className="template-download-main" href={`${baseUrl}templates/IPERC_Generador_Normativo_Peru.xlsx`} download>
        <span><Download size={22} /></span>
        <div>
          <strong>Descarga plantilla</strong>
          <small>Word + Excel IPERC</small>
        </div>
      </a>
      <div className="template-download-copy">
        <b>Formatos base listos</b>
        <p>Generador normativo y guía técnica para completar fuera de línea.</p>
      </div>
      <div className="template-download-actions" aria-label="Archivos disponibles">
        <a href={`${baseUrl}templates/IPERC_Generador_Normativo_Peru.xlsx`} download>
          <FileSpreadsheet size={18} /> Excel
        </a>
        <a href={`${baseUrl}templates/IPERC_Informe_Guia.docx`} download>
          <FileText size={18} /> Word
        </a>
      </div>
    </section>
  )
}

function StepFlow({ registrationErrors, rowCount, onStep }: { registrationErrors: number; rowCount: number; onStep: (view: ViewId) => void }) {
  const steps: Array<{ label: string; view: ViewId; done: boolean }> = [
    { label: '1. Registrar empresa', view: 'settings', done: registrationErrors === 0 },
    { label: '2. Áreas y puestos', view: 'settings', done: registrationErrors === 0 },
    { label: '3. Tareas', view: 'settings', done: registrationErrors === 0 },
    { label: '4. Generar IPERC', view: 'matrix', done: rowCount > 0 },
    { label: '5. Revisar controles', view: 'matrix', done: rowCount > 0 },
    { label: '6. Validar legal', view: 'normative', done: false },
    { label: '7. Plan de acción', view: 'actions', done: rowCount > 0 },
    { label: '8. Exportar', view: 'reports', done: false },
  ]
  return (
    <section className="step-flow" aria-label="Flujo de trabajo IPERC">
      {steps.map((step) => (
        <button type="button" key={step.label} className={`step-chip ${step.done ? 'done' : ''}`} onClick={() => onStep(step.view)}>
          {step.done ? <CheckCircle2 size={14} /> : <CircleDot size={14} />} {step.label}
        </button>
      ))}
    </section>
  )
}

function ActionCard({ title, subtitle, icon: Icon, tone, onClick }: { title: string; subtitle: string; icon: typeof Layers3; tone: string; onClick: () => void }) {
  return (
    <button type="button" className={`action-card ${tone}`} onClick={onClick}>
      <span><Icon size={28} /></span>
      <b>{title}</b>
      <small>{subtitle}</small>
    </button>
  )
}

function MetricCard({ label, value, delta, tone }: { label: string; value: string; delta: string; tone: string }) {
  return (
    <article className={`metric-card ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{delta}</small>
      <div className="sparkline"><i /><i /><i /><i /><i /></div>
    </article>
  )
}

function RiskIndexCard({ value, level }: { value: number; level: string }) {
  return (
    <article className="risk-index-card" style={{ '--risk-value': `${value * 3.6}deg` } as React.CSSProperties}>
      <div className="risk-ring">
        <span>{value}<small>/100</small></span>
        <b>{level}</b>
      </div>
      <p>Índice de riesgo</p>
    </article>
  )
}

function RecentMatrixCard({ rows, profile, onViewMatrix }: { rows: GeneratedAssessment[]; profile: CompanyProfile; onViewMatrix: () => void }) {
  return (
    <article className="glass-card recent-matrix">
      <header><div><h3>Matriz IPERC reciente</h3><p>{profile.businessActivity} · {profile.workplace}</p></div></header>
      <div className="matrix-mini">
        <div className="mini-head"><span>Tarea</span><span>Peligro</span><span>Riesgo inicial</span><span>Riesgo residual</span><span>Estado</span></div>
        {rows.map((row) => (
          <div className="mini-row" key={row.id}>
            <span>{shortText(row.task.name, 28)}</span>
            <span>{shortText(row.hazard.name, 24)}</span>
            <RiskBadge level={row.initialLevel} score={row.initialScore} />
            <RiskBadge level={row.residualLevel} score={row.residualScore} />
            <StatusBadge label={row.legalValidationMissing ? 'Pendiente' : 'En control'} tone={row.legalValidationMissing ? 'yellow' : 'green'} />
          </div>
        ))}
      </div>
      <button type="button" className="ghost-button" onClick={onViewMatrix}>Ver matriz completa <ChevronRight size={16} /></button>
    </article>
  )
}

function CompactAssistant({ rows, onAction }: { rows: GeneratedAssessment[]; onAction: (view: ViewId) => void }) {
  const items = buildAssistantItems(rows).slice(0, 4)
  return (
    <article className="glass-card compact-assistant">
      <header><BrainCircuit size={22} /><div><h3>Asistente SST</h3><p>Sugerencias del motor</p></div></header>
      <div className="assistant-list">
        {items.map((item) => (
          <button type="button" key={item.title} onClick={() => onAction(item.view)}>
            <item.icon size={16} />
            <span><b>{item.title}</b><small>{item.text}</small></span>
          </button>
        ))}
      </div>
      <div className="assistant-glow" />
    </article>
  )
}

function DistributionCard({ rows }: { rows: GeneratedAssessment[] }) {
  const categories = Object.entries(countBy(rows, (row) => row.hazardCategory)).slice(0, 5)
  return (
    <article className="glass-card chart-card">
      <h3>Distribución de riesgos</h3>
      <p>Por categoría</p>
      <div className="donut-wrap"><div className="donut-chart"><span>{rows.length}<small>Total</small></span></div>
        <ul>{categories.map(([name, count]) => <li key={name}><i />{name}<b>{Math.round((count / Math.max(1, rows.length)) * 100)}%</b></li>)}</ul>
      </div>
    </article>
  )
}

function ProgressCard({ rows }: { rows: GeneratedAssessment[] }) {
  const total = Math.max(1, rows.length)
  const verified = rows.filter((row) => row.actionStatus === 'verified' || row.actionStatus === 'implemented').length
  const inProgress = rows.filter((row) => row.actionStatus === 'in_progress').length
  const overdue = rows.filter((row) => row.actionStatus === 'overdue').length
  const pending = rows.filter((row) => row.actionStatus === 'pending').length
  const complete = Math.round((verified / total) * 100)
  return (
    <article className="glass-card progress-card">
      <h3>Progreso del plan de acción</h3>
      <div className="progress-layout">
        <div className="progress-ring" style={{ '--progress': `${complete * 3.6}deg` } as React.CSSProperties}><span>{complete}%<small>Completado</small></span></div>
        <ul>
          <li><CheckCircle2 size={15} /> Verificadas <b>{verified}</b></li>
          <li><Activity size={15} /> En progreso <b>{inProgress}</b></li>
          <li><AlertCircle size={15} /> Pendientes <b>{pending}</b></li>
          <li><AlertTriangle size={15} /> Vencidas <b>{overdue}</b></li>
        </ul>
      </div>
    </article>
  )
}

function NextActions({ rows }: { rows: GeneratedAssessment[] }) {
  const priority = [...rows]
    .sort((a, b) => b.initialScore - a.initialScore)
    .slice(0, 4)
  return (
    <article className="glass-card next-actions">
      <h3>Proximas acciones</h3>
      {priority.map((row) => (
        <div className="next-item" key={row.id}>
          <ClipboardCheck size={16} />
          <span><b>{shortText(row.proposedControls[0]?.description ?? 'Revisar control', 36)}</b><small>Plazo: {row.deadline}</small></span>
          <StatusBadge label={row.initialLevel === 'Intolerable' ? 'Alta' : row.initialLevel === 'Importante' ? 'Media' : 'Baja'} tone={row.initialLevel === 'Intolerable' ? 'red' : row.initialLevel === 'Importante' ? 'orange' : 'blue'} />
        </div>
      ))}
    </article>
  )
}

function MatrixView({
  rows,
  allRows,
  expertMode,
  query,
  setQuery,
  riskFilter,
  setRiskFilter,
  legalFilter,
  setLegalFilter,
  expandedRow,
  setExpandedRow,
  onOverride,
  onExport,
  onExportAll,
}: {
  rows: GeneratedAssessment[]
  allRows: GeneratedAssessment[]
  expertMode: boolean
  query: string
  setQuery: (value: string) => void
  riskFilter: string
  setRiskFilter: (value: string) => void
  legalFilter: string
  setLegalFilter: (value: string) => void
  expandedRow: string | null
  setExpandedRow: (value: string | null) => void
  onOverride: (rowId: string, patch: RowOverride) => void
  onExport: () => void
  onExportAll: () => void
}) {
  return (
    <section className="matrix-view">
      <ViewHeader title="Matriz IPERC" text="Gestión técnica con filtros, edición inline y trazabilidad." />
      <div className="filter-bar">
        <label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarea, peligro o área" /></label>
        <select value={riskFilter} onChange={(event) => setRiskFilter(event.target.value)} aria-label="Filtrar por riesgo">
          <option value="todos">Todos los riesgos</option>
          <option value="Bajo">Bajo</option>
          <option value="Moderado">Moderado</option>
          <option value="Importante">Importante</option>
          <option value="Intolerable">Intolerable</option>
        </select>
        <select value={legalFilter} onChange={(event) => setLegalFilter(event.target.value)} aria-label="Filtrar por estado legal">
          <option value="todos">Estado legal</option>
          <option value="pendiente">Validacion legal pendiente</option>
          <option value="validado">Validado</option>
        </select>
        <button type="button" className="ghost-button" onClick={onExportAll}><Download size={16} /> Todas</button>
        <button type="button" className="primary-neon" onClick={onExport}><Download size={16} /> Exportar filtradas</button>
      </div>
      <p className="result-count">{rows.length} de {allRows.length} filas</p>
      <div className="matrix-table glass-card">
        <div className={`table-head ${expertMode ? 'expert' : ''}`}>
          <span>Tarea</span><span>Peligro</span><span>Riesgo inicial</span><span>Riesgo residual</span><span>Estado</span>{expertMode && <><span>P x S x E</span><span>Legal</span></>}
        </div>
        {rows.map((row) => (
          <div key={row.id} className={`table-row ${expandedRow === row.id ? 'open' : ''}`}>
            <button type="button" className={`row-main ${expertMode ? 'expert' : ''}`} onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
              <span><b>{shortText(row.task.name, 34)}</b><small>{row.área.name}</small></span>
              <span>{row.hazard.name}</span>
              <RiskBadge level={row.initialLevel} score={row.initialScore} />
              <RiskBadge level={row.residualLevel} score={row.residualScore} />
              <StatusBadge label={statusLabel(row)} tone={statusTone(row)} />
              {expertMode && <><span className="formula">{row.probability} x {row.severity} x {row.exposureFrequency}</span><span>{row.legalValidationMissing ? 'Validación legal pendiente' : 'Validado'}</span></>}
            </button>
            {expandedRow === row.id && <MatrixDetail row={row} expertMode={expertMode} onOverride={onOverride} />}
          </div>
        ))}
        {rows.length === 0 && <EmptyState text="No hay filas que coincidan con los filtros. Ajuste la busqueda o registre tareas." />}
      </div>
      <div className="matrix-mobile-list">
        {allRows.map((row) => <MatrixRowCard key={row.id} row={row} open={expandedRow === row.id} onToggle={() => setExpandedRow(expandedRow === row.id ? null : row.id)} expertMode={expertMode} onOverride={onOverride} />)}
      </div>
    </section>
  )
}

function MatrixRowCard({ row, open, onToggle, expertMode, onOverride }: { row: GeneratedAssessment; open: boolean; onToggle: () => void; expertMode: boolean; onOverride: (rowId: string, patch: RowOverride) => void }) {
  return (
    <article className="matrix-row-card">
      <button type="button" onClick={onToggle}>
        <span><b>{row.task.name}</b><small>{row.hazard.name}</small></span>
        <ChevronDown size={18} className={open ? 'rotated' : ''} />
      </button>
      <div className="mobile-badges"><RiskBadge level={row.initialLevel} score={row.initialScore} /><RiskBadge level={row.residualLevel} score={row.residualScore} /><StatusBadge label={statusLabel(row)} tone={statusTone(row)} /></div>
      {open && <MatrixDetail row={row} expertMode={expertMode} onOverride={onOverride} />}
    </article>
  )
}

function MatrixDetail({ row, expertMode, onOverride }: { row: GeneratedAssessment; expertMode: boolean; onOverride: (rowId: string, patch: RowOverride) => void }) {
  return (
    <div className="row-detail">
      <Detail label="Controles existentes" value={row.existingControls} />
      <Detail label="Controles propuestos" value={row.proposedControls.map((control) => `${control.level}: ${control.description}`).join(' | ')} />
      <Detail label="Responsable" value={row.responsiblePerson} />
      <Detail label="Plazo" value={row.deadline} />
      <Detail label="Evidencia requerida" value={row.requiredEvidence.join(' | ')} />
      <Detail label="Sustento normativo" value={row.legalValidationMissing ? 'Referencia normativa pendiente de validación.' : row.legalNorm} />
      <Detail label="Observaciones" value={row.observations || 'Sin observaciones'} />
      <div className="row-editor">
        <h4>Ajuste manual del riesgo</h4>
        <div className="row-editor-grid">
          <ScoreInput label="Prob. inicial" value={row.probability} onChange={(value) => onOverride(row.id, { probability: value })} />
          <ScoreInput label="Severidad inicial" value={row.severity} onChange={(value) => onOverride(row.id, { severity: value })} />
          <ScoreInput label="Exp. inicial" value={row.exposureFrequency} onChange={(value) => onOverride(row.id, { exposureFrequency: value })} />
          <ScoreInput label="Prob. residual" value={row.residualProbability} onChange={(value) => onOverride(row.id, { residualProbability: value })} />
          <ScoreInput label="Sev. residual" value={row.residualSeverity} onChange={(value) => onOverride(row.id, { residualSeverity: value })} />
          <ScoreInput label="Exp. residual" value={row.residualExposureFrequency} onChange={(value) => onOverride(row.id, { residualExposureFrequency: value })} />
        </div>
        <label className="field">
          <span>Estado del control</span>
          <select value={row.actionStatus} onChange={(event) => onOverride(row.id, { actionStatus: event.target.value as ActionStatus })}>
            {(Object.keys(ACTION_STATUS_LABELS) as ActionStatus[]).map((status) => (
              <option key={status} value={status}>{ACTION_STATUS_LABELS[status]}</option>
            ))}
          </select>
        </label>
        <p className="recalc-line">Inicial: <b>{row.initialLevel} ({row.initialScore})</b> · Residual: <b>{row.residualLevel} ({row.residualScore})</b></p>
      </div>
      {expertMode && (
        <>
          <Detail label="Formula inicial" value={`${row.probability} x ${row.severity} x ${row.exposureFrequency} = ${row.initialScore}`} />
          <Detail label="Formula residual" value={`${row.residualProbability} x ${row.residualSeverity} x ${row.residualExposureFrequency} = ${row.residualScore}`} />
          <Detail label="Jerarquía principal" value={row.controlHierarchyLevel} />
        </>
      )}
    </div>
  )
}

function ScoreInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="score-input">
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
        {[1, 2, 3, 4, 5].map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
    </label>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return <p><b>{label}</b><span>{value}</span></p>
}

const TOOL_GUIDES: Partial<Record<ViewId, string>> = {
  matrix: 'guia-iperc',
  analytics: 'guia-sunafil',
  actions: 'guia-sgsst',
  evidence: 'guia-registros',
  normative: 'guia-auditoria',
}

/** Indice de herramientas: navegacion, conteos y sugerencias del motor en un solo panel. */
function AssistantPanel({
  items,
  rows,
  activeView,
  onAction,
  onOpenGuide,
}: {
  items: ReturnType<typeof buildAssistantItems>
  rows: GeneratedAssessment[]
  activeView: ViewId
  onAction: (view: ViewId) => void
  onOpenGuide?: (guideId: string) => void
}) {
  const counts: Partial<Record<ViewId, string>> = {
    matrix: `${rows.length} filas`,
    actions: `${rows.filter((row) => row.actionStatus === 'pending' || row.actionStatus === 'overdue').length} abiertas`,
    evidence: `${rows.filter((row) => row.requiredEvidence.length > 0).length} por cargar`,
    normative: `${rows.filter((row) => row.legalValidationMissing).length} por validar`,
  }
  return (
    <aside className="assistant-panel tool-index">
      <header><BrainCircuit size={22} /><div><h2>Índice SST</h2><p>Herramientas y siguientes pasos</p></div></header>
      <ol className="index-list">
        {navItems.map((item, index) => {
          const Icon = item.icon
          const guideId = TOOL_GUIDES[item.id]
          return (
            <li key={item.id} className={activeView === item.id ? 'active' : ''}>
              <button type="button" onClick={() => onAction(item.id)}>
                <span className="index-num">{String(index + 1).padStart(2, '0')}</span>
                <Icon size={16} />
                <span><b>{item.label}</b><small>{counts[item.id] ?? item.subtitle}</small></span>
              </button>
              {guideId && onOpenGuide && (
                <button type="button" className="index-guide" title={findGuide(guideId)?.title} onClick={() => onOpenGuide(guideId)}>Guía</button>
              )}
            </li>
          )
        })}
      </ol>
      <h3 className="index-sub">Sugerencias del motor</h3>
      <div className="assistant-cards">
        {items.slice(0, 3).map((item) => (
          <article key={item.title}>
            <item.icon size={16} />
            <div><h3>{item.title}</h3><p>{item.text}</p><button type="button" onClick={() => onAction(item.view)}>{item.action}</button></div>
          </article>
        ))}
      </div>
    </aside>
  )
}

function AnalysisView({ rows, dashboard, riskIndex }: { rows: GeneratedAssessment[]; dashboard: ReturnType<typeof buildDashboard>; riskIndex: number }) {
  return (
    <section>
      <ViewHeader title="Análisis preventivo" text="Lectura sintética de exposición, severidad y controles residuales." />
      <div className="analysis-grid">
        <RiskIndexCard value={riskIndex} level={riskIndex > 60 ? 'Importante' : 'Moderado'} />
        <MetricCard label="Promedio inicial" value={String(dashboard.averageInitialRisk)} delta="Puntaje técnico" tone="orange" />
        <MetricCard label="Promedio residual" value={String(dashboard.averageResidualRisk)} delta="Después de controles" tone="green" />
        <MetricCard label="Legal pendiente" value={String(dashboard.risksWithoutValidatedLegalSupport)} delta="Requiere revisión" tone="yellow" />
      </div>
      <DistributionCard rows={rows} />
    </section>
  )
}

const BOARD_COLUMNS: Array<{ status: ActionStatus; title: string; tone: string }> = [
  { status: 'pending', title: 'Pendiente', tone: 'slate' },
  { status: 'in_progress', title: 'En ejecución', tone: 'blue' },
  { status: 'verified', title: 'Verificado', tone: 'green' },
  { status: 'overdue', title: 'Vencido', tone: 'red' },
]

function boardColumnOf(row: GeneratedAssessment): ActionStatus {
  if (row.actionStatus === 'implemented' || row.actionStatus === 'not_applicable') return 'verified'
  return row.actionStatus
}

/** Tablero kanban: arrastre una tarjeta entre columnas (o use el selector) para cambiar su estado. */
function ActionPlanBoard({ rows, onOverride }: { rows: GeneratedAssessment[]; onOverride: (rowId: string, patch: RowOverride) => void }) {
  const [dragId, setDragId] = useState<string | null>(null)
  const [overColumn, setOverColumn] = useState<ActionStatus | null>(null)
  const total = Math.max(1, rows.length)
  const verifiedPercent = Math.round((rows.filter((row) => boardColumnOf(row) === 'verified').length / total) * 100)

  function move(rowId: string, status: ActionStatus) {
    onOverride(rowId, { actionStatus: status, ...(status === 'verified' ? { verificationStatus: 'Verificado en campo' } : {}) })
  }

  return (
    <section>
      <ViewHeader title="Plan de acción" text="Arrastre cada control entre columnas para actualizar su estado. El avance se refleja en reportes y Excel." />
      <div className="board-progress">
        <div><i style={{ width: `${verifiedPercent}%` }} /></div>
        <b>{verifiedPercent}% verificado</b>
      </div>
      <div className="board-grid dnd">
        {BOARD_COLUMNS.map((column) => {
          const columnRows = rows.filter((row) => boardColumnOf(row) === column.status)
          return (
            <div
              className={`board-column ${column.tone} ${overColumn === column.status ? 'drop-over' : ''}`}
              key={column.status}
              onDragOver={(event) => {
                event.preventDefault()
                setOverColumn(column.status)
              }}
              onDragLeave={() => setOverColumn((current) => (current === column.status ? null : current))}
              onDrop={(event) => {
                event.preventDefault()
                const id = event.dataTransfer.getData('text/plain') || dragId
                if (id) move(id, column.status)
                setDragId(null)
                setOverColumn(null)
              }}
            >
              <h3>{column.title}<span>{columnRows.length}</span></h3>
              {columnRows.length === 0 && <p className="board-empty">Suelte aquí</p>}
              {columnRows.map((row) => (
                <article
                  className={`task-board-card ${dragId === row.id ? 'dragging' : ''}`}
                  key={row.id}
                  draggable
                  onDragStart={(event) => {
                    event.dataTransfer.setData('text/plain', row.id)
                    event.dataTransfer.effectAllowed = 'move'
                    setDragId(row.id)
                  }}
                  onDragEnd={() => {
                    setDragId(null)
                    setOverColumn(null)
                  }}
                >
                  <GripVertical size={14} className="grip" aria-hidden="true" />
                  <b>{shortText(row.proposedControls[0]?.description ?? 'Control por definir', 58)}</b>
                  <p>{shortText(row.riskDescription, 72)}</p>
                  <div className="card-foot">
                    <RiskBadge level={row.initialLevel} score={row.initialScore} />
                    <small>{row.responsiblePerson} · {row.deadline}</small>
                  </div>
                  <select aria-label="Mover a columna" value={column.status} onChange={(event) => move(row.id, event.target.value as ActionStatus)}>
                    {BOARD_COLUMNS.map((option) => <option key={option.status} value={option.status}>{option.title}</option>)}
                  </select>
                </article>
              ))}
            </div>
          )
        })}
      </div>
    </section>
  )
}

/** Evidencias: arrastre archivos (fotos, PDF, actas) sobre cada requisito. Se listan solo en esta sesión. */
function EvidencePanel({ rows }: { rows: GeneratedAssessment[] }) {
  const [files, setFiles] = useState<Record<string, string[]>>({})
  const [over, setOver] = useState<string | null>(null)
  const withEvidence = rows.filter((row) => row.requiredEvidence.length > 0)
  const attached = withEvidence.filter((row) => (files[row.id]?.length ?? 0) > 0).length

  function attach(rowId: string, list: FileList | null) {
    if (!list || list.length === 0) return
    const names = Array.from(list, (file) => `${file.name} (${Math.max(1, Math.round(file.size / 1024))} KB)`)
    setFiles((prev) => ({ ...prev, [rowId]: [...(prev[rowId] ?? []), ...names] }))
  }

  return (
    <section>
      <ViewHeader title="Evidencias" text="Arrastre fotos, actas o PDF sobre cada requisito para marcar la evidencia como cargada." />
      <div className="board-progress">
        <div><i style={{ width: `${Math.round((attached / Math.max(1, withEvidence.length)) * 100)}%` }} /></div>
        <b>{attached} de {withEvidence.length} con evidencia</b>
      </div>
      {withEvidence.length === 0 && <EmptyState text="No hay evidencias requeridas. Genere la matriz para listar la documentación necesaria." />}
      <div className="evidence-grid">
        {withEvidence.map((row) => {
          const list = files[row.id] ?? []
          return (
            <label
              className={`evidence-card drop ${over === row.id ? 'drop-over' : ''} ${list.length ? 'done' : ''}`}
              key={row.id}
              onDragOver={(event) => {
                event.preventDefault()
                setOver(row.id)
              }}
              onDragLeave={() => setOver(null)}
              onDrop={(event) => {
                event.preventDefault()
                setOver(null)
                attach(row.id, event.dataTransfer.files)
              }}
            >
              <input type="file" multiple className="sr-only" onChange={(event) => attach(row.id, event.target.files)} />
              {list.length ? <Paperclip size={20} /> : <UploadCloud size={20} />}
              <div>
                <h3>{row.requiredEvidence[0] ?? 'Evidencia requerida'}</h3>
                <p>{shortText(row.riskDescription, 74)}</p>
                <span>{row.responsiblePerson} · {row.deadline}</span>
                {list.length > 0 && <ul className="file-list">{list.map((name, index) => <li key={`${name}-${index}`}>{name}</li>)}</ul>}
              </div>
              <StatusBadge label={list.length ? `${list.length} archivo(s)` : 'Arrastre aquí'} tone={list.length ? 'green' : 'yellow'} />
            </label>
          )
        })}
      </div>
    </section>
  )
}

function NormativeSection({ sector, rows }: { sector: SectorId; rows: GeneratedAssessment[] }) {
  const module = sectorModules.find((item) => item.id === sector) ?? sectorModules[0]
  const pending = rows.filter((row) => row.legalValidationMissing).length
  const [layout, setLayout] = useState<'grid' | 'list'>('grid')
  return (
    <section>
      <ViewHeader title="Normativa aplicable" text={`Marco legal considerado para el sector ${module.label.toLowerCase()}.`} />
      <p className="legal-banner">
        {module.validationWarning} La herramienta no cita artículos sin fuente oficial verificada
        {pending > 0 ? `; ${pending} fila(s) de la matriz mantienen el sustento normativo como pendiente.` : '.'}
      </p>
      <div className="layout-toggle" role="group" aria-label="Vista de normas">
        <button type="button" className={layout === 'grid' ? 'active' : ''} onClick={() => setLayout('grid')}><LayoutGrid size={15} /> Cuadros</button>
        <button type="button" className={layout === 'list' ? 'active' : ''} onClick={() => setLayout('list')}><List size={15} /> Lista</button>
      </div>
      <div className={layout === 'grid' ? 'norm-grid' : 'norm-grid as-list'}>
        {module.normIds.map((id) => {
          const norm = legalNorms.find((item) => item.id === id)
          if (!norm) return null
          return (
            <article className="norm-card" key={id}>
              <header>
                <Scale size={20} />
                <span className={`norm-status ${norm.effectiveStatus}`}>{LEGAL_STATUS_LABELS[norm.effectiveStatus]}</span>
              </header>
              <h3>{norm.shortName}</h3>
              <p>{norm.plainLanguageSummary}</p>
              <LegalReference normId={norm.id} label="Ver fuente oficial" />
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ReportsPanel({
  rows,
  warnings,
  onReport,
  onWord,
  onCsv,
  onPdf,
}: {
  rows: GeneratedAssessment[]
  warnings: ReturnType<typeof validateBeforeExport>
  onReport: (kind: ReportKind) => void
  onWord: () => void
  onCsv: () => void
  onPdf: () => void
}) {
  const checks = [
    ['Datos completos', warnings.some((warning) => warning.code === 'company-data') ? 'pendiente' : 'listo'],
    ['Riesgos evaluados', rows.length > 0 ? 'listo' : 'pendiente'],
    ['Controles definidos', rows.every((row) => row.proposedControls.length > 0) ? 'listo' : 'pendiente'],
    ['Riesgo residual calculado', rows.every((row) => row.residualScore > 0) ? 'listo' : 'pendiente'],
    ['Sustento normativo revisado', warnings.some((warning) => warning.code === 'legal-validation') ? 'pendiente' : 'listo'],
  ]
  const reports: Array<{ label: string; icon: typeof FileText; kind: ReportKind }> = [
    { label: 'Resumen ejecutivo', icon: FileText, kind: 'executive' },
    { label: 'Matriz completa', icon: FileSpreadsheet, kind: 'matrix' },
    { label: 'Riesgos críticos', icon: AlertTriangle, kind: 'critical' },
    { label: 'Controles vencidos', icon: Target, kind: 'overdue' },
    { label: 'Evidencia pendiente', icon: UploadCloud, kind: 'pending-evidence' },
    { label: 'Validación legal', icon: Scale, kind: 'legal-pending' },
    { label: 'Plan de acción', icon: ClipboardList, kind: 'action-plan' },
  ]
  return (
    <section>
      <ViewHeader title="Reportes" text="Exportes ejecutivos y técnicos con alertas legales visibles." />
      <div className="report-layout">
        <article className="glass-card checklist-card">
          <h3>Lista de validacion</h3>
          {checks.map(([label, status]) => <p key={label}><CheckCircle2 size={16} className={status === 'listo' ? 'ok' : 'warn'} />{label}<span>{status}</span></p>)}
          <div className="report-extra">
            <button type="button" className="ghost-button" onClick={onWord}>Word técnico</button>
            <button type="button" className="ghost-button" onClick={onCsv}>CSV dataset</button>
            <button type="button" className="ghost-button" onClick={onPdf}>PDF (imprimir)</button>
          </div>
        </article>
        <div className="report-grid">
          {reports.map(({ label, icon: Icon, kind }) => (
            <button type="button" key={label} onClick={() => onReport(kind)}>
              <Icon size={24} /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function RegistrationPanel({
  profile,
  setProfile,
  sector,
  setSector,
  áreas,
  setAreas,
  positions,
  setPositions,
  tasks,
  setTasks,
  errors,
  projectStatus,
  setProjectStatus,
  onSave,
  saveState,
}: {
  profile: CompanyProfile
  setProfile: (profile: CompanyProfile) => void
  sector: SectorId
  setSector: (sector: SectorId) => void
  áreas: WorkArea[]
  setAreas: (áreas: WorkArea[]) => void
  positions: JobPosition[]
  setPositions: (positions: JobPosition[]) => void
  tasks: WorkTask[]
  setTasks: (tasks: WorkTask[]) => void
  errors: ReturnType<typeof validateRegistration>
  projectStatus: ProjectStatus
  setProjectStatus: (status: ProjectStatus) => void
  onSave: () => void
  saveState: string
}) {
  const rucInvalid = profile.ruc.length > 0 && !/^[0-9]{11}$/.test(profile.ruc)
  const [section, setSection] = useState<'empresa' | 'areas' | 'puestos' | 'tareas'>('empresa')
  const sections: Array<{ id: typeof section; label: string; count?: number }> = [
    { id: 'empresa', label: 'Empresa' },
    { id: 'areas', label: 'Áreas', count: áreas.length },
    { id: 'puestos', label: 'Puestos', count: positions.length },
    { id: 'tareas', label: 'Tareas', count: tasks.length },
  ]

  function addArea() {
    setAreas([...áreas, { id: newId('area'), name: 'Nueva área', process: '' }])
  }
  function updateArea(id: string, patch: Partial<WorkArea>) {
    setAreas(áreas.map((área) => (área.id === id ? { ...área, ...patch } : área)))
  }
  function removeArea(id: string) {
    setAreas(áreas.filter((área) => área.id !== id))
    setPositions(positions.filter((position) => position.areaId !== id))
  }
  function duplicateArea(área: WorkArea) {
    setAreas([...áreas, { ...área, id: newId('area'), name: `${área.name} (copia)` }])
  }

  function addPosition() {
    setPositions([...positions, { id: newId('pos'), areaId: áreas[0]?.id ?? '', title: 'Nuevo puesto', workerCount: 1 }])
  }
  function updatePosition(id: string, patch: Partial<JobPosition>) {
    setPositions(positions.map((position) => (position.id === id ? { ...position, ...patch } : position)))
  }
  function removePosition(id: string) {
    setPositions(positions.filter((position) => position.id !== id))
    setTasks(tasks.filter((task) => task.positionId !== id))
  }
  function duplicatePosition(position: JobPosition) {
    setPositions([...positions, { ...position, id: newId('pos'), title: `${position.title} (copia)` }])
  }

  function addTask() {
    setTasks([
      ...tasks,
      { id: newId('task'), positionId: positions[0]?.id ?? '', name: 'Nueva tarea', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 1, existingControls: '', responsiblePerson: '' },
    ])
  }
  function updateTaskField(id: string, patch: Partial<WorkTask>) {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)))
  }
  function removeTask(id: string) {
    setTasks(tasks.filter((task) => task.id !== id))
  }
  function duplicateTask(task: WorkTask) {
    setTasks([...tasks, { ...task, id: newId('task'), name: `${task.name} (copia)` }])
  }

  return (
    <section className="registration compact">
      <ViewHeader title="Registro del proyecto IPERC" text="Complete cada pestaña; la matriz se genera sola." />
      <div className="reg-tabs" role="tablist">
        {sections.map((item, index) => (
          <button type="button" role="tab" key={item.id} aria-selected={section === item.id} className={section === item.id ? 'active' : ''} onClick={() => setSection(item.id)}>
            <span>{index + 1}</span>{item.label}{item.count !== undefined && <em>{item.count}</em>}
          </button>
        ))}
        <button type="button" className="primary-neon small" onClick={onSave} disabled={saveState === 'saving'}>
          <Save size={14} /> {saveState === 'saving' ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {errors.length > 0 ? (
        <div className="reg-alert warning">
          <AlertTriangle size={16} /> Faltan datos: {errors.slice(0, 3).map((error) => error.message).join(' ')}
          {errors.length > 3 ? ` (+${errors.length - 3} mas)` : ''}
        </div>
      ) : (
        <div className="reg-alert ok"><CheckCircle2 size={16} /> Registro completo. Puede generar y exportar la matriz.</div>
      )}

      <div className="settings-grid">
        {section === 'empresa' && (<>
        <div className="glass-card form-card">
          <h3>Empresa</h3>
          <Field label="Razón social" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
          <label className="field">
            <span>RUC (11 digitos)</span>
            <input value={profile.ruc} onChange={(event) => setProfile({ ...profile, ruc: event.target.value.replace(/[^0-9]/g, '').slice(0, 11) })} inputMode="numeric" />
            {rucInvalid && <small className="field-error">El RUC debe tener 11 digitos.</small>}
          </label>
          <label className="field">
            <span>Tipo de propiedad</span>
            <select value={profile.ownership} onChange={(event) => setProfile({ ...profile, ownership: event.target.value as 'public' | 'private' })}>
              <option value="private">Privada</option>
              <option value="public">Pública</option>
            </select>
          </label>
          <Field label="Actividad económica" value={profile.businessActivity} onChange={(businessActivity) => setProfile({ ...profile, businessActivity })} />
          <Field label="CIIU" value={profile.ciiu} onChange={(ciiu) => setProfile({ ...profile, ciiu })} />
          <Field label="Centro de trabajo" value={profile.workplace} onChange={(workplace) => setProfile({ ...profile, workplace })} />
          <label className="field">
            <span>N. de trabajadores</span>
            <input type="number" min={1} value={profile.workerCount} onChange={(event) => setProfile({ ...profile, workerCount: Number(event.target.value) || 0 })} />
          </label>
          <label className="field"><span>Sector</span><select value={sector} onChange={(event) => setSector(event.target.value as SectorId)}>{sectorModules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}</select></label>
        </div>

        <div className="glass-card form-card">
          <h3>Responsables y estado</h3>
          <Field label="Responsable SST" value={profile.sgsstResponsible ?? ''} onChange={(sgsstResponsible) => setProfile({ ...profile, sgsstResponsible })} />
          <Field label="Elaborado por" value={profile.preparedBy ?? ''} onChange={(preparedBy) => setProfile({ ...profile, preparedBy })} />
          <Field label="Revisado por" value={profile.reviewedBy ?? ''} onChange={(reviewedBy) => setProfile({ ...profile, reviewedBy })} />
          <Field label="Aprobado por" value={profile.approvedBy ?? ''} onChange={(approvedBy) => setProfile({ ...profile, approvedBy })} />
          <label className="field">
            <span>Estado del proyecto</span>
            <select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value as ProjectStatus)}>
              <option value="draft">Borrador</option>
              <option value="submitted">Enviado</option>
              <option value="approved">Aprobado</option>
              <option value="archived">Archivado</option>
            </select>
          </label>
        </div>
        </>)}

        {section === 'areas' && (
        <div className="glass-card form-card span-2">
          <div className="card-head"><h3>Áreas y procesos</h3><button type="button" className="ghost-button" onClick={addArea}><Plus size={14} /> Agregar área</button></div>
          {áreas.map((área) => (
            <div className="crud-row" key={área.id}>
              <Field label="Área" value={área.name} onChange={(name) => updateArea(área.id, { name })} />
              <Field label="Proceso" value={área.process} onChange={(process) => updateArea(área.id, { process })} />
              <div className="crud-actions">
                <button type="button" aria-label="Duplicar área" onClick={() => duplicateArea(área)}><Copy size={15} /></button>
                <button type="button" aria-label="Eliminar área" onClick={() => removeArea(área.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
        )}

        {section === 'puestos' && (
        <div className="glass-card form-card span-2">
          <div className="card-head"><h3>Puestos de trabajo</h3><button type="button" className="ghost-button" onClick={addPosition}><Plus size={14} /> Agregar puesto</button></div>
          {positions.map((position) => (
            <div className="crud-row" key={position.id}>
              <Field label="Puesto" value={position.title} onChange={(title) => updatePosition(position.id, { title })} />
              <label className="field"><span>Área</span><select value={position.areaId} onChange={(event) => updatePosition(position.id, { areaId: event.target.value })}>{áreas.map((área) => <option key={área.id} value={área.id}>{área.name}</option>)}</select></label>
              <label className="field"><span>Trabajadores</span><input type="number" min={1} value={position.workerCount} onChange={(event) => updatePosition(position.id, { workerCount: Number(event.target.value) || 1 })} /></label>
              <div className="crud-actions">
                <button type="button" aria-label="Duplicar puesto" onClick={() => duplicatePosition(position)}><Copy size={15} /></button>
                <button type="button" aria-label="Eliminar puesto" onClick={() => removePosition(position.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
        )}

        {section === 'tareas' && (
        <div className="glass-card form-card span-2">
          <div className="card-head"><h3>Tareas operativas</h3><button type="button" className="ghost-button" onClick={addTask}><Plus size={14} /> Agregar tarea</button></div>
          {tasks.map((task) => (
            <div className="task-edit" key={task.id}>
              <Field label="Tarea" value={task.name} onChange={(name) => updateTaskField(task.id, { name })} />
              <label className="field"><span>Puesto</span><select value={task.positionId} onChange={(event) => updateTaskField(task.id, { positionId: event.target.value })}>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
              <label className="field"><span>Tipo</span><select value={task.activityKind} onChange={(event) => updateTaskField(task.id, { activityKind: event.target.value as ActivityKind })}><option value="routine">Rutinaria</option><option value="non_routine">No rutinaria</option><option value="emergency">Emergencia</option></select></label>
              <label className="field"><span>Expuestos</span><input type="number" min={1} value={task.exposedWorkers} onChange={(event) => updateTaskField(task.id, { exposedWorkers: Number(event.target.value) || 1 })} /></label>
              <Field label="Frecuencia" value={task.frequency} onChange={(frequency) => updateTaskField(task.id, { frequency })} />
              <Field label="Controles existentes" value={task.existingControls} onChange={(existingControls) => updateTaskField(task.id, { existingControls })} />
              <Field label="Responsable" value={task.responsiblePerson ?? ''} onChange={(responsiblePerson) => updateTaskField(task.id, { responsiblePerson })} />
              <div className="crud-actions">
                <button type="button" aria-label="Duplicar tarea" onClick={() => duplicateTask(task)}><Copy size={15} /></button>
                <button type="button" aria-label="Eliminar tarea" onClick={() => removeTask(task.id)}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>
    </section>
  )
}

function MobileBottomNav({ activeView, onChange, onQuick }: { activeView: ViewId; onChange: (view: ViewId) => void; onQuick: () => void }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegación móvil">
      <button type="button" className={activeView === 'dashboard' ? 'active' : ''} onClick={() => onChange('dashboard')}><LayoutDashboard size={18} />Inicio</button>
      <button type="button" className={activeView === 'matrix' ? 'active' : ''} onClick={() => onChange('matrix')}><Boxes size={18} />Matriz</button>
      <button type="button" className="mobile-fab" onClick={onQuick} aria-label="Nuevo IPERC"><Zap size={22} /></button>
      <button type="button" className={activeView === 'actions' ? 'active' : ''} onClick={() => onChange('actions')}><ClipboardList size={18} />Acciones</button>
      <button type="button" className={activeView === 'reports' ? 'active' : ''} onClick={() => onChange('reports')}><Command size={18} />Mas</button>
    </nav>
  )
}

function Modal({
  kind,
  onClose,
  onRandom,
  onLoadProject,
  onDuplicated,
  onExportProject,
}: {
  kind: ModalKind
  onClose: () => void
  onRandom: () => void
  onLoadProject: (project: SavedProject) => void
  onDuplicated: (message: string) => void
  onExportProject: (project: SavedProject) => void
}) {
  if (!kind) return null
  if (kind === 'projects') {
    return <ProjectsModal onClose={onClose} onLoadProject={onLoadProject} onDuplicated={onDuplicated} onExportProject={onExportProject} />
  }
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="icon-button close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <Radar size={30} />
        <h2>Nuevo IPERC</h2>
        <p>Cargue un caso de ejemplo completo para explorar la herramienta, o registre su empresa en la sección Registro.</p>
        <div>
          <button type="button" className="primary-neon" onClick={() => { onRandom(); onClose() }}>Cargar caso de ejemplo</button>
          <button type="button" className="ghost-button" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

function ProjectsModal({
  onClose,
  onLoadProject,
  onDuplicated,
  onExportProject,
}: {
  onClose: () => void
  onLoadProject: (project: SavedProject) => void
  onDuplicated: (message: string) => void
  onExportProject: (project: SavedProject) => void
}) {
  const [projects, setProjects] = useState<SavedProject[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'todos'>('todos')

  const refresh = useCallback(async () => {
    setLoading(true)
    const result = await listProjects({ query: search, status: statusFilter })
    setProjects(result.data ?? [])
    setMessage(result.message)
    setLoading(false)
  }, [search, statusFilter])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleDelete(project: SavedProject) {
    const result = await deleteProject(project)
    setMessage(result.message)
    void refresh()
  }

  async function handleDuplicate(project: SavedProject) {
    const result = await duplicateProject(project)
    onDuplicated(result.message)
    void refresh()
  }

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="modal-card projects-modal" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="icon-button close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <FolderOpen size={30} />
        <h2>Mis proyectos</h2>
        <p>{message || 'Proyectos guardados localmente y en Supabase.'}</p>
        <div className="projects-filters">
          <label className="search-box"><Search size={14} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Empresa, RUC o sector" /></label>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProjectStatus | 'todos')}>
            <option value="todos">Todos los estados</option>
            <option value="draft">Borrador</option>
            <option value="submitted">Enviado</option>
            <option value="approved">Aprobado</option>
            <option value="archived">Archivado</option>
          </select>
        </div>
        <div className="projects-list">
          {loading && <p className="board-empty">Cargando...</p>}
          {!loading && projects.length === 0 && <p className="board-empty">Aun no hay proyectos guardados. Use "Guardar proyecto" en Registro.</p>}
          {!loading && projects.map((project) => (
            <article className="project-item" key={project.id}>
              <div>
                <b>{project.companyName}</b>
                <small>{project.ruc ?? 'Sin RUC'} · {project.sector} · {project.status} · {project.updatedAt.slice(0, 10)} · {project.source === 'supabase' ? 'Supabase' : 'Local'}</small>
              </div>
              <div className="project-actions">
                <button type="button" onClick={() => onLoadProject(project)} title="Cargar"><FolderOpen size={15} /></button>
                <button type="button" onClick={() => handleDuplicate(project)} title="Duplicar"><Copy size={15} /></button>
                <button type="button" onClick={() => onExportProject(project)} title="Exportar Excel"><Download size={15} /></button>
                <button type="button" onClick={() => handleDelete(project)} title="Eliminar"><Trash2 size={15} /></button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function ViewHeader({ title, text }: { title: string; text: string }) {
  return <header className="view-header"><div><h2>{title}</h2><p>{text}</p></div></header>
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="empty-state">
      <Layers3 size={28} />
      <p>{text}</p>
    </div>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

function RiskBadge({ level, score }: { level: RiskBand; score: number }) {
  return <span className={`risk-badge ${level.toLowerCase()}`}>{level === 'Intolerable' ? 'Crítico' : level} <b>{score}</b></span>
}

function StatusBadge({ label, tone }: { label: string; tone: string }) {
  return <span className={`status-badge ${tone}`}>{label}</span>
}

function computeRiskIndex(rows: GeneratedAssessment[]) {
  if (!rows.length) return 0
  const maxScore = 125
  const average = rows.reduce((total, row) => total + row.initialScore, 0) / rows.length
  return Math.min(100, Math.max(1, Math.round((average / maxScore) * 100 * 2.1)))
}

function buildAssistantItems(rows: GeneratedAssessment[]): Array<{ title: string; text: string; action: string; icon: typeof AlertTriangle; view: ViewId }> {
  const critical = rows.find((row) => row.initialLevel === 'Intolerable' || row.initialLevel === 'Importante')
  const ppe = rows.find((row) => row.ppeOnlyWarning)
  const evidence = rows.filter((row) => row.requiredEvidence.length > 0)
  const legal = rows.find((row) => row.legalValidationMissing)
  const weak = rows.find((row) => row.proposedControlsInsufficient)
  const overdue = rows.find((row) => new Date(row.deadline).getTime() < Date.now())
  return [
    {
      title: critical ? 'Riesgo crítico sin control suficiente' : 'Riesgo importante detectado',
      text: critical ? 'Este riesgo requiere controles de mayor jerarquía antes de cerrar la matriz.' : 'Mantenga seguimiento preventivo de las tareas principales.',
      action: 'Revisar controles',
      icon: AlertTriangle,
      view: 'matrix',
    },
    {
      title: evidence.length ? `Faltan evidencias en ${Math.min(3, evidence.length)} tareas` : 'Evidencias al dia',
      text: 'Priorice fotos, checklists y registros de capacitación para sustentar controles.',
      action: 'Subir evidencias',
      icon: UploadCloud,
      view: 'evidence',
    },
    {
      title: legal ? 'Validación legal pendiente' : 'Trazabilidad normativa revisada',
      text: legal ? 'No se citan artículos sin fuente oficial validada.' : 'Las referencias cargadas mantienen trazabilidad.',
      action: 'Ver normativa',
      icon: Scale,
      view: 'normative',
    },
    {
      title: ppe || weak ? 'Control preventivo débil' : 'Controles en seguimiento',
      text: ppe ? 'Este riesgo no debería quedar solo con EPP.' : 'Revise eficacia después de implementar medidas.',
      action: 'Ajustar plan',
      icon: ShieldCheck,
      view: 'actions',
    },
    {
      title: overdue ? 'Control vencido' : 'Planifica charla de seguridad',
      text: overdue ? 'Hay acciones fuera de plazo que requieren responsable.' : 'El área operativa necesita refuerzo preventivo semanal.',
      action: 'Programar acción',
      icon: ClipboardCheck,
      view: 'actions',
    },
  ]
}

function countBy(rows: GeneratedAssessment[], getKey: (row: GeneratedAssessment) => string): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = getKey(row)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function statusLabel(row: GeneratedAssessment) {
  if (row.actionStatus === 'verified') return 'Verificado'
  if (row.actionStatus === 'overdue') return 'Vencido'
  if (row.legalValidationMissing) return 'Validación legal pendiente'
  if (row.proposedControlsInsufficient) return 'En revisión'
  return 'En control'
}

function statusTone(row: GeneratedAssessment) {
  if (row.actionStatus === 'verified') return 'green'
  if (row.actionStatus === 'overdue') return 'red'
  if (row.legalValidationMissing) return 'yellow'
  if (row.proposedControlsInsufficient) return 'orange'
  return 'green'
}

function shortText(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value
}

