import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Archive,
  Bell,
  Boxes,
  BrainCircuit,
  Building2,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  ClipboardList,
  Command,
  Download,
  FileSpreadsheet,
  FileText,
  FolderOpen,
  Layers3,
  LayoutDashboard,
  LineChart,
  Menu,
  Radar,
  Save,
  Scale,
  Search,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  UploadCloud,
  UserCircle2,
  X,
  Zap,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'
import { legalNorms, sectorModules } from './data/legalDatabase'
import { exportCsv, exportExcel, exportWord, printPdfReport } from './lib/exporters'
import { buildDashboard, generateAssessments, validateBeforeExport } from './lib/riskEngine'
import { supabase } from './lib/supabaseClient'
import type { ActivityKind, CompanyProfile, GeneratedAssessment, JobPosition, RiskBand, SectorId, WorkArea, WorkTask } from './types'

type ViewId = 'dashboard' | 'matrix' | 'analysis' | 'actions' | 'evidence' | 'normative' | 'reports' | 'settings'
type ModalKind = 'scan' | 'load' | 'quick' | null

const navItems: Array<{ id: ViewId; label: string; subtitle: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', subtitle: 'Resumen ejecutivo', icon: LayoutDashboard },
  { id: 'matrix', label: 'Matriz IPERC', subtitle: 'Ver y editar', icon: Boxes },
  { id: 'analysis', label: 'Analisis', subtitle: 'Riesgos e indicadores', icon: LineChart },
  { id: 'actions', label: 'Plan de accion', subtitle: 'Tareas y seguimiento', icon: ClipboardList },
  { id: 'evidence', label: 'Evidencias', subtitle: 'Documentos y fotos', icon: Archive },
  { id: 'normative', label: 'Normativa', subtitle: 'Legal y requisitos', icon: Scale },
  { id: 'reports', label: 'Reportes', subtitle: 'Exportes y tableros', icon: FileText },
  { id: 'settings', label: 'Configuracion', subtitle: 'Empresa y usuarios', icon: Settings },
]

const initialProfile: CompanyProfile = {
  name: 'Constructora Torre Sigma',
  ruc: '20123456789',
  ownership: 'private',
  businessActivity: 'Construccion de edificios y obras civiles',
  ciiu: '4100',
  workplace: 'Edificacion Torre Sigma',
  workerCount: 42,
  sgsstResponsible: 'Ing. Alex Rivera',
  preparedBy: 'Especialista SST',
  reviewedBy: 'Comite SST',
  approvedBy: 'Gerencia de operaciones',
}

const initialAreas: WorkArea[] = [
  { id: 'area-1', name: 'Obra civil', process: 'Estructuras, altura y trabajos de campo' },
  { id: 'area-2', name: 'Almacen de obra', process: 'Recepcion, izaje y despacho de materiales' },
  { id: 'area-3', name: 'Mantenimiento', process: 'Instalaciones electricas y herramientas' },
]

const initialPositions: JobPosition[] = [
  { id: 'pos-1', areaId: 'area-1', title: 'Operario de altura', workerCount: 8 },
  { id: 'pos-2', areaId: 'area-2', title: 'Auxiliar de almacen', workerCount: 6 },
  { id: 'pos-3', areaId: 'area-3', title: 'Tecnico electricista', workerCount: 4 },
]

const initialTasks: WorkTask[] = [
  {
    id: 'task-1',
    positionId: 'pos-1',
    name: 'Trabajo en altura sobre andamio y borde abierto',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 8,
    existingControls: 'Arnes, linea de vida, charla inicial y supervision del capataz',
    responsiblePerson: 'Jefe de obra',
  },
  {
    id: 'task-2',
    positionId: 'pos-2',
    name: 'Izaje de materiales y descarga de cargas suspendidas',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 6,
    existingControls: 'Senalero, delimitacion parcial y checklist visual',
    responsiblePerson: 'Supervisor de almacen',
  },
  {
    id: 'task-3',
    positionId: 'pos-3',
    name: 'Instalacion electrica temporal y conexion de tableros',
    activityKind: 'non_routine',
    frequency: 'Semanal',
    exposedWorkers: 4,
    existingControls: 'Herramientas aisladas y bloqueo operativo',
    responsiblePerson: 'Tecnico lider',
  },
  {
    id: 'task-4',
    positionId: 'pos-3',
    name: 'Uso de taladro, esmeril y herramientas portatiles',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 5,
    existingControls: 'Lentes, guantes y verificacion de discos',
    responsiblePerson: 'Supervisor de mantenimiento',
  },
]

const randomCases: Array<{ profile: CompanyProfile; sector: SectorId; areas: WorkArea[]; positions: JobPosition[]; tasks: WorkTask[] }> = [
  {
    profile: {
      name: 'Minera Andina Norte',
      ruc: '20555111444',
      ownership: 'private',
      businessActivity: 'Operacion minera y planta de concentrado',
      ciiu: '0729',
      workplace: 'Unidad San Rafael',
      workerCount: 186,
      sgsstResponsible: 'Ing. Valeria Ramos',
      preparedBy: 'Equipo SST mina',
      reviewedBy: 'Superintendencia HSE',
      approvedBy: 'Gerencia de unidad',
    },
    sector: 'mining',
    areas: [
      { id: 'm-area-1', name: 'Planta concentradora', process: 'Chancado, molienda y mantenimiento' },
      { id: 'm-area-2', name: 'Transporte interno', process: 'Acarreo y rutas operativas' },
    ],
    positions: [
      { id: 'm-pos-1', areaId: 'm-area-1', title: 'Operador de planta', workerCount: 24 },
      { id: 'm-pos-2', areaId: 'm-area-2', title: 'Conductor de camion', workerCount: 18 },
    ],
    tasks: [
      { id: 'm-task-1', positionId: 'm-pos-1', name: 'Mantenimiento de faja, chancadora y partes moviles', activityKind: 'non_routine', frequency: 'Semanal', exposedWorkers: 6, existingControls: 'Bloqueo verbal, guardas parciales y EPP', responsiblePerson: 'Supervisor de planta' },
      { id: 'm-task-2', positionId: 'm-pos-2', name: 'Conduccion de camion por ruta interna y zona de acarreo', activityKind: 'routine', frequency: 'Diaria continua', exposedWorkers: 18, existingControls: 'Check preuso, radio y limite de velocidad', responsiblePerson: 'Jefe de guardia' },
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
      sgsstResponsible: 'Lic. Monica Paz',
      preparedBy: 'Coordinacion SST',
      reviewedBy: 'Direccion medica',
      approvedBy: 'Administracion general',
    },
    sector: 'health',
    areas: [
      { id: 'h-area-1', name: 'Emergencia', process: 'Atencion asistencial y triaje' },
      { id: 'h-area-2', name: 'Laboratorio', process: 'Muestras y residuos biologicos' },
    ],
    positions: [
      { id: 'h-pos-1', areaId: 'h-area-1', title: 'Tecnico de enfermeria', workerCount: 16 },
      { id: 'h-pos-2', areaId: 'h-area-2', title: 'Tecnologo medico', workerCount: 9 },
    ],
    tasks: [
      { id: 'h-task-1', positionId: 'h-pos-1', name: 'Atencion de paciente, fluidos y punzocortantes', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 16, existingControls: 'Guantes, contenedores y segregacion inicial', responsiblePerson: 'Jefa de enfermeria' },
      { id: 'h-task-2', positionId: 'h-pos-2', name: 'Manipulacion de reactivos quimicos y muestras biologicas', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 9, existingControls: 'SDS, mascarilla y cabina parcial', responsiblePerson: 'Jefe de laboratorio' },
    ],
  },
  {
    profile: {
      name: 'Logistica Pacifico 2040',
      ruc: '20444555666',
      ownership: 'private',
      businessActivity: 'Almacenamiento, transporte y distribucion',
      ciiu: '5210',
      workplace: 'Hub Callao',
      workerCount: 74,
      sgsstResponsible: 'Ing. Diego Luna',
      preparedBy: 'Analista SST',
      reviewedBy: 'Jefatura de operaciones',
      approvedBy: 'Gerencia logistica',
    },
    sector: 'transport_logistics',
    areas: [
      { id: 'l-area-1', name: 'Patio de maniobras', process: 'Rutas internas y carga vehicular' },
      { id: 'l-area-2', name: 'Almacen', process: 'Picking y despacho' },
    ],
    positions: [
      { id: 'l-pos-1', areaId: 'l-area-1', title: 'Operador de montacarga', workerCount: 12 },
      { id: 'l-pos-2', areaId: 'l-area-2', title: 'Auxiliar de picking', workerCount: 20 },
    ],
    tasks: [
      { id: 'l-task-1', positionId: 'l-pos-1', name: 'Movimiento de montacarga, rutas internas y cruce peatonal', activityKind: 'routine', frequency: 'Diaria continua', exposedWorkers: 20, existingControls: 'Licencia, claxon y demarcacion parcial', responsiblePerson: 'Coordinador de patio' },
      { id: 'l-task-2', positionId: 'l-pos-2', name: 'Manipulacion manual de cajas, carga y despacho', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 20, existingControls: 'Guantes, pausas informales y supervision', responsiblePerson: 'Jefe de almacen' },
    ],
  },
]

function App() {
  const [view, setView] = useState<ViewId>('dashboard')
  const [expertMode, setExpertMode] = useState(false)
  const [sector, setSector] = useState<SectorId>('construction')
  const [profile, setProfile] = useState(initialProfile)
  const [areas, setAreas] = useState(initialAreas)
  const [positions, setPositions] = useState(initialPositions)
  const [tasks, setTasks] = useState(initialTasks)
  const [modal, setModal] = useState<ModalKind>(null)
  const [query, setQuery] = useState('')
  const [riskFilter, setRiskFilter] = useState('todos')
  const [legalFilter, setLegalFilter] = useState('todos')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [caseCursor, setCaseCursor] = useState(0)

  const assessments = useMemo(
    () => generateAssessments(profile, sector, areas, positions, tasks),
    [profile, sector, areas, positions, tasks],
  )
  const dashboard = useMemo(() => buildDashboard(assessments), [assessments])
  const exportWarnings = useMemo(() => validateBeforeExport(profile, assessments), [profile, assessments])
  const filteredRows = useMemo(
    () => assessments.filter((row) => {
      const text = `${row.task.name} ${row.hazard.name} ${row.area.name}`.toLowerCase()
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

  async function saveDraft() {
    if (!supabase) {
      setSaveState('error')
      return
    }
    setSaveState('saving')
    const { error } = await supabase.from('iperc_snapshots').insert({
      company_name: profile.name || 'Sin razon social',
      ruc: profile.ruc || null,
      sector,
      payload: { profile, areas, positions, tasks, assessments },
      status: 'draft',
    })
    setSaveState(error ? 'error' : 'saved')
  }

  function generateRandomCase() {
    const next = randomCases[caseCursor % randomCases.length]
    setProfile(next.profile)
    setSector(next.sector)
    setAreas(next.areas)
    setPositions(next.positions)
    setTasks(next.tasks)
    setCaseCursor((value) => value + 1)
    setView('dashboard')
  }

  return (
    <main className="app-shell">
      <div className="orb orb-purple" />
      <div className="orb orb-cyan" />
      <Sidebar activeView={view} onChange={setView} />
      <section className="app-canvas">
        <TopBar
          title={activeTitle}
          profile={profile}
          expertMode={expertMode}
          setExpertMode={setExpertMode}
          saveState={saveState}
          onSave={saveDraft}
        />
        <div className="content-grid">
          <section className="view-stage">
            {view === 'dashboard' && (
              <DashboardHome
                profile={profile}
                rows={assessments}
                dashboard={dashboard}
                riskIndex={riskIndex}
                onGenerate={() => setView('matrix')}
                onRandom={generateRandomCase}
                onLoad={() => setModal('load')}
                onScan={() => setModal('scan')}
                onViewMatrix={() => setView('matrix')}
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
                onExport={() => exportExcel(profile, assessments)}
              />
            )}
            {view === 'analysis' && <AnalysisView rows={assessments} dashboard={dashboard} riskIndex={riskIndex} />}
            {view === 'actions' && <ActionPlanBoard rows={assessments} />}
            {view === 'evidence' && <EvidencePanel rows={assessments} />}
            {view === 'normative' && <NormativeSection sector={sector} />}
            {view === 'reports' && (
              <ReportsPanel profile={profile} rows={assessments} warnings={exportWarnings} />
            )}
            {view === 'settings' && (
              <SettingsPanel
                profile={profile}
                setProfile={setProfile}
                sector={sector}
                setSector={setSector}
                tasks={tasks}
                setTasks={setTasks}
                positions={positions}
              />
            )}
          </section>
          <AssistantPanel items={assistantItems} rows={assessments} />
        </div>
      </section>
      <MobileBottomNav activeView={view} onChange={setView} onQuick={() => setModal('quick')} />
      <Modal kind={modal} onClose={() => setModal(null)} onRandom={generateRandomCase} />
    </main>
  )
}

function Sidebar({ activeView, onChange }: { activeView: ViewId; onChange: (view: ViewId) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Shield size={24} /></div>
        <strong>IPERC <span>2040</span></strong>
      </div>
      <nav className="side-nav" aria-label="Navegacion principal">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <button type="button" key={item.id} className={`nav-item ${activeView === item.id ? 'active' : ''}`} onClick={() => onChange(item.id)}>
              <Icon size={20} />
              <span><b>{item.label}</b><small>{item.subtitle}</small></span>
            </button>
          )
        })}
      </nav>
      <div className="assistant-status">
        <div className="pulse-ring"><CircleDot size={24} /></div>
        <strong>Asistente SST</strong>
        <span>Activo 24/7</span>
      </div>
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
}: {
  title: string
  profile: CompanyProfile
  expertMode: boolean
  setExpertMode: (value: boolean) => void
  saveState: string
  onSave: () => void
}) {
  return (
    <header className="topbar">
      <button type="button" className="icon-button mobile-menu" aria-label="Abrir menu"><Menu size={20} /></button>
      <div>
        <span className="view-label">Vista general</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-tools">
        <label className="plant-selector">
          <Building2 size={16} />
          <select value={profile.workplace || 'Principal'} aria-label="Seleccionar planta" onChange={() => undefined}>
            <option>{profile.workplace || 'Planta principal'}</option>
          </select>
        </label>
        <label className="search-box">
          <Search size={16} />
          <input aria-label="Buscar en IPERC" placeholder="Buscar riesgo, tarea o area" />
        </label>
        <button type="button" className={`expert-toggle ${expertMode ? 'on' : ''}`} onClick={() => setExpertMode(!expertMode)} aria-pressed={expertMode}>
          <span>Modo experto</span><i />
        </button>
        <button type="button" className="icon-button" aria-label="Notificaciones"><Bell size={19} /><em /></button>
        <button type="button" className="icon-button" aria-label="Guardar borrador" onClick={onSave}><Save size={19} /></button>
        <div className="user-profile"><UserCircle2 size={34} /><span>Ing. Alex Rivera<small>{saveState === 'saved' ? 'Borrador guardado' : 'Especialista SST'}</small></span><ChevronDown size={16} /></div>
      </div>
    </header>
  )
}

function DashboardHome({
  profile,
  rows,
  dashboard,
  riskIndex,
  onGenerate,
  onRandom,
  onLoad,
  onScan,
  onViewMatrix,
}: {
  profile: CompanyProfile
  rows: GeneratedAssessment[]
  dashboard: ReturnType<typeof buildDashboard>
  riskIndex: number
  onGenerate: () => void
  onRandom: () => void
  onLoad: () => void
  onScan: () => void
  onViewMatrix: () => void
}) {
  return (
    <div className="dashboard-view">
      <section className="welcome-row">
        <div>
          <h2>Hola, Ingeniero</h2>
          <p>Panel preventivo de riesgos y acciones</p>
        </div>
        <span>{profile.name} · {profile.workplace}</span>
      </section>
      <section className="action-grid">
        <ActionCard title="Generar IPERC" subtitle="Nuevo analisis" icon={Layers3} tone="purple" onClick={onGenerate} />
        <ActionCard title="Caso al azar" subtitle="Generar ejemplo" icon={Sparkles} tone="blue" onClick={onRandom} />
        <ActionCard title="Cargar proyecto" subtitle="Desde plantilla" icon={UploadCloud} tone="green" onClick={onLoad} />
        <ActionCard title="Escanear area" subtitle="Registro de campo" icon={Camera} tone="orange" onClick={onScan} />
      </section>
      <section className="mobile-quick-actions" aria-label="Acciones rapidas">
        <button type="button" onClick={onRandom}><Sparkles size={18} />Caso al azar</button>
        <button type="button" onClick={onScan}><Camera size={18} />Escanear area</button>
        <button type="button" onClick={onLoad}><FolderOpen size={18} />Mis proyectos</button>
        <button type="button" onClick={onGenerate}><Boxes size={18} />Matriz rapida</button>
      </section>
      <section className="kpi-strip">
        <MetricCard label="Riesgos totales" value={String(dashboard.totalRisks)} delta="+12% vs ultima revision" tone="purple" />
        <MetricCard label="Criticos" value={String(rows.filter((row) => row.initialLevel === 'Intolerable').length)} delta="Atencion inmediata" tone="red" />
        <RiskIndexCard value={riskIndex} level={riskIndex > 72 ? 'Intolerable' : riskIndex > 55 ? 'Importante' : 'Moderado'} />
        <MetricCard label="Controles efectivos" value={`${Math.max(0, 100 - dashboard.reductionPercent / 2).toFixed(0)}%`} delta={`-${dashboard.reductionPercent}% riesgo residual`} tone="green" />
        <MetricCard label="Evidencias pendientes" value={String(dashboard.controlsPendingEvidence)} delta="Por subir" tone="yellow" />
      </section>
      <section className="dashboard-lower">
        <RecentMatrixCard rows={rows.slice(0, 5)} onViewMatrix={onViewMatrix} />
        <CompactAssistant rows={rows} />
        <DistributionCard rows={rows} />
        <ProgressCard rows={rows} />
        <NextActions rows={rows} />
      </section>
    </div>
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
      <p>Indice de riesgo</p>
    </article>
  )
}

function RecentMatrixCard({ rows, onViewMatrix }: { rows: GeneratedAssessment[]; onViewMatrix: () => void }) {
  return (
    <article className="glass-card recent-matrix">
      <header><div><h3>Matriz IPERC reciente</h3><p>Construccion · Edificacion Torre Sigma</p></div></header>
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

function CompactAssistant({ rows }: { rows: GeneratedAssessment[] }) {
  const items = buildAssistantItems(rows).slice(0, 4)
  return (
    <article className="glass-card compact-assistant">
      <header><BrainCircuit size={22} /><div><h3>Asistente SST</h3><p>Sugerencias inteligentes</p></div></header>
      <div className="assistant-list">
        {items.map((item) => (
          <button type="button" key={item.title}>
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
      <h3>Distribucion de riesgos</h3>
      <p>Por categoria</p>
      <div className="donut-wrap"><div className="donut-chart"><span>{rows.length}<small>Total</small></span></div>
        <ul>{categories.map(([name, count]) => <li key={name}><i />{name}<b>{Math.round((count / Math.max(1, rows.length)) * 100)}%</b></li>)}</ul>
      </div>
    </article>
  )
}

function ProgressCard({ rows }: { rows: GeneratedAssessment[] }) {
  const complete = Math.max(22, Math.round(rows.filter((row) => row.residualAcceptability === 'Aceptable').length / Math.max(1, rows.length) * 100))
  return (
    <article className="glass-card progress-card">
      <h3>Progreso del plan de accion</h3>
      <div className="progress-layout">
        <div className="progress-ring" style={{ '--progress': `${complete * 3.6}deg` } as React.CSSProperties}><span>{complete}%<small>Completado</small></span></div>
        <ul>
          <li><CheckCircle2 size={15} /> Completadas <b>{Math.floor(rows.length * 0.4)}</b></li>
          <li><Activity size={15} /> En progreso <b>{Math.ceil(rows.length * 0.35)}</b></li>
          <li><AlertCircle size={15} /> Pendientes <b>{Math.ceil(rows.length * 0.25)}</b></li>
          <li><AlertTriangle size={15} /> Vencidas <b>{rows.filter((row) => row.proposedControlsInsufficient).length}</b></li>
        </ul>
      </div>
    </article>
  )
}

function NextActions({ rows }: { rows: GeneratedAssessment[] }) {
  return (
    <article className="glass-card next-actions">
      <h3>Proximas acciones</h3>
      {rows.slice(0, 4).map((row, index) => (
        <div className="next-item" key={row.id}>
          <ClipboardCheck size={16} />
          <span><b>{shortText(row.proposedControls[0]?.description ?? 'Revisar control', 36)}</b><small>{index === 0 ? 'Hoy, 09:00 AM' : 'Manana, 10:00 AM'}</small></span>
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
  onExport,
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
  onExport: () => void
}) {
  return (
    <section className="matrix-view">
      <ViewHeader title="Matriz IPERC" text="Gestion tecnica con filtros, trazabilidad y lectura ejecutiva." />
      <div className="filter-bar">
        <label><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar tarea, peligro o area" /></label>
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
        <button type="button" className="primary-neon" onClick={onExport}><Download size={16} /> Exportar</button>
      </div>
      <div className="matrix-table glass-card">
        <div className={`table-head ${expertMode ? 'expert' : ''}`}>
          <span>Tarea</span><span>Peligro</span><span>Riesgo inicial</span><span>Riesgo residual</span><span>Estado</span>{expertMode && <><span>P x S x E</span><span>Legal</span></>}
        </div>
        {rows.map((row) => (
          <div key={row.id} className={`table-row ${expandedRow === row.id ? 'open' : ''}`}>
            <button type="button" className={`row-main ${expertMode ? 'expert' : ''}`} onClick={() => setExpandedRow(expandedRow === row.id ? null : row.id)}>
              <span><b>{shortText(row.task.name, 34)}</b><small>{row.area.name}</small></span>
              <span>{row.hazard.name}</span>
              <RiskBadge level={row.initialLevel} score={row.initialScore} />
              <RiskBadge level={row.residualLevel} score={row.residualScore} />
              <StatusBadge label={statusLabel(row)} tone={statusTone(row)} />
              {expertMode && <><span className="formula">{row.probability} x {row.severity} x {row.exposureFrequency}</span><span>{row.legalValidationMissing ? 'Validacion legal pendiente' : 'Validado'}</span></>}
            </button>
            {expandedRow === row.id && <MatrixDetail row={row} expertMode={expertMode} />}
          </div>
        ))}
      </div>
      <div className="matrix-mobile-list">
        {allRows.map((row) => <MatrixRowCard key={row.id} row={row} open={expandedRow === row.id} onToggle={() => setExpandedRow(expandedRow === row.id ? null : row.id)} expertMode={expertMode} />)}
      </div>
    </section>
  )
}

function MatrixRowCard({ row, open, onToggle, expertMode }: { row: GeneratedAssessment; open: boolean; onToggle: () => void; expertMode: boolean }) {
  return (
    <article className="matrix-row-card">
      <button type="button" onClick={onToggle}>
        <span><b>{row.task.name}</b><small>{row.hazard.name}</small></span>
        <ChevronDown size={18} className={open ? 'rotated' : ''} />
      </button>
      <div className="mobile-badges"><RiskBadge level={row.initialLevel} score={row.initialScore} /><RiskBadge level={row.residualLevel} score={row.residualScore} /><StatusBadge label={statusLabel(row)} tone={statusTone(row)} /></div>
      {open && <MatrixDetail row={row} expertMode={expertMode} />}
    </article>
  )
}

function MatrixDetail({ row, expertMode }: { row: GeneratedAssessment; expertMode: boolean }) {
  return (
    <div className="row-detail">
      <Detail label="Controles existentes" value={row.existingControls} />
      <Detail label="Controles propuestos" value={row.proposedControls.map((control) => `${control.level}: ${control.description}`).join(' | ')} />
      <Detail label="Responsable" value={row.responsiblePerson} />
      <Detail label="Plazo" value={row.deadline} />
      <Detail label="Evidencia requerida" value={row.requiredEvidence.join(' | ')} />
      <Detail label="Sustento normativo" value={row.legalValidationMissing ? 'Referencia normativa pendiente de validacion.' : row.legalNorm} />
      <Detail label="Observaciones" value={row.observations || 'Sin observaciones'} />
      {expertMode && (
        <>
          <Detail label="Formula inicial" value={`${row.probability} x ${row.severity} x ${row.exposureFrequency} = ${row.initialScore}`} />
          <Detail label="Formula residual" value={`${row.residualProbability} x ${row.residualSeverity} x ${row.residualExposureFrequency} = ${row.residualScore}`} />
          <Detail label="Jerarquia principal" value={row.controlHierarchyLevel} />
        </>
      )}
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return <p><b>{label}</b><span>{value}</span></p>
}

function AssistantPanel({ items, rows }: { items: ReturnType<typeof buildAssistantItems>; rows: GeneratedAssessment[] }) {
  return (
    <aside className="assistant-panel">
      <header><BrainCircuit size={24} /><div><h2>Asistente SST</h2><p>Motor de apoyo tecnico</p></div></header>
      <div className="assistant-score"><RiskIndexCard value={computeRiskIndex(rows)} level="Preventivo" /></div>
      <div className="assistant-cards">
        {items.map((item) => (
          <article key={item.title}>
            <item.icon size={18} />
            <div><h3>{item.title}</h3><p>{item.text}</p><button type="button">{item.action}</button></div>
          </article>
        ))}
      </div>
    </aside>
  )
}

function AnalysisView({ rows, dashboard, riskIndex }: { rows: GeneratedAssessment[]; dashboard: ReturnType<typeof buildDashboard>; riskIndex: number }) {
  return (
    <section>
      <ViewHeader title="Analisis preventivo" text="Lectura sintetica de exposicion, severidad y controles residuales." />
      <div className="analysis-grid">
        <RiskIndexCard value={riskIndex} level={riskIndex > 60 ? 'Importante' : 'Moderado'} />
        <MetricCard label="Promedio inicial" value={String(dashboard.averageInitialRisk)} delta="Puntaje tecnico" tone="orange" />
        <MetricCard label="Promedio residual" value={String(dashboard.averageResidualRisk)} delta="Despues de controles" tone="green" />
        <MetricCard label="Legal pendiente" value={String(dashboard.risksWithoutValidatedLegalSupport)} delta="Requiere revision" tone="yellow" />
      </div>
      <DistributionCard rows={rows} />
    </section>
  )
}

function ActionPlanBoard({ rows }: { rows: GeneratedAssessment[] }) {
  const columns = [
    { title: 'Pendiente', rows: rows.filter((row) => row.legalValidationMissing).slice(0, 5) },
    { title: 'En ejecucion', rows: rows.filter((row) => row.proposedControlsInsufficient).slice(0, 5) },
    { title: 'Verificado', rows: rows.filter((row) => row.residualAcceptability === 'Aceptable').slice(0, 5) },
    { title: 'Vencido', rows: rows.filter((row) => row.initialLevel === 'Intolerable').slice(0, 5) },
  ]
  return (
    <section>
      <ViewHeader title="Plan de accion" text="Tablero operativo de controles, responsables, plazos y evidencias." />
      <div className="board-grid">
        {columns.map((column) => (
          <div className="board-column" key={column.title}>
            <h3>{column.title}<span>{column.rows.length}</span></h3>
            {column.rows.map((row) => (
              <article className="task-board-card" key={row.id}>
                <b>{shortText(row.proposedControls[0]?.description ?? 'Control por definir', 58)}</b>
                <p>{shortText(row.riskDescription, 72)}</p>
                <span>{row.responsiblePerson}</span>
                <small>{row.deadline} · {row.verificationStatus}</small>
              </article>
            ))}
          </div>
        ))}
      </div>
    </section>
  )
}

function EvidencePanel({ rows }: { rows: GeneratedAssessment[] }) {
  return (
    <section>
      <ViewHeader title="Evidencias" text="Registro preparado para documentos, fotos y validacion de campo." />
      <div className="evidence-grid">
        {rows.slice(0, 12).map((row) => (
          <article className="evidence-card" key={row.id}>
            <UploadCloud size={22} />
            <div>
              <h3>{row.requiredEvidence[0] ?? 'Evidencia requerida'}</h3>
              <p>{shortText(row.riskDescription, 74)}</p>
              <span>{row.responsiblePerson} · {row.deadline}</span>
            </div>
            <StatusBadge label="Carga pendiente" tone="yellow" />
          </article>
        ))}
      </div>
    </section>
  )
}

function NormativeSection({ sector }: { sector: SectorId }) {
  const module = sectorModules.find((item) => item.id === sector) ?? sectorModules[0]
  const normCards = [...module.normIds.slice(0, 4), 'sectorial-validation']
  return (
    <section>
      <ViewHeader title="Normativa" text="Trazabilidad legal sin inventar articulos ni obligaciones." />
      <div className="norm-grid">
        {normCards.map((id) => {
          const norm = legalNorms.find((item) => item.id === id)
          return (
            <article className="norm-card" key={id}>
              <Scale size={24} />
              <h3>{norm?.shortName ?? 'Normativa sectorial'}</h3>
              <p>{norm?.title ?? module.label}</p>
              <span>Referencia normativa pendiente de validacion.</span>
            </article>
          )
        })}
      </div>
    </section>
  )
}

function ReportsPanel({ profile, rows, warnings }: { profile: CompanyProfile; rows: GeneratedAssessment[]; warnings: ReturnType<typeof validateBeforeExport> }) {
  const checks = [
    ['Datos completos', warnings.some((warning) => warning.code === 'company-data') ? 'pendiente' : 'listo'],
    ['Riesgos evaluados', rows.length > 0 ? 'listo' : 'pendiente'],
    ['Controles definidos', rows.every((row) => row.proposedControls.length > 0) ? 'listo' : 'pendiente'],
    ['Riesgo residual calculado', rows.every((row) => row.residualScore > 0) ? 'listo' : 'pendiente'],
    ['Evidencias revisadas', warnings.some((warning) => warning.code === 'control-strength') ? 'pendiente' : 'listo'],
    ['Sustento normativo revisado', warnings.some((warning) => warning.code === 'legal-validation') ? 'pendiente' : 'listo'],
  ]
  const reports = [
    ['Resumen ejecutivo', FileText],
    ['Matriz completa', FileSpreadsheet],
    ['Riesgos criticos', AlertTriangle],
    ['Controles vencidos', Target],
    ['Evidencia pendiente', UploadCloud],
    ['Validacion legal', Scale],
    ['Plan de accion', ClipboardList],
  ] as const
  return (
    <section>
      <ViewHeader title="Reportes" text="Exportes ejecutivos y tecnicos con alertas legales visibles." />
      <div className="report-layout">
        <article className="glass-card checklist-card">
          <h3>Lista de validacion</h3>
          {checks.map(([label, status]) => <p key={label}><CheckCircle2 size={16} className={status === 'listo' ? 'ok' : 'warn'} />{label}<span>{status}</span></p>)}
        </article>
        <div className="report-grid">
          {reports.map(([label, Icon]) => (
            <button type="button" key={label} onClick={() => handleReport(label, profile, rows)}>
              <Icon size={24} /><span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

function SettingsPanel({
  profile,
  setProfile,
  sector,
  setSector,
  tasks,
  setTasks,
  positions,
}: {
  profile: CompanyProfile
  setProfile: (profile: CompanyProfile) => void
  sector: SectorId
  setSector: (sector: SectorId) => void
  tasks: WorkTask[]
  setTasks: (tasks: WorkTask[]) => void
  positions: JobPosition[]
}) {
  return (
    <section>
      <ViewHeader title="Configuracion" text="Datos base para generar matrices coherentes y exportables." />
      <div className="settings-grid">
        <div className="glass-card form-card">
          <h3>Empresa y sede</h3>
          <Field label="Razon social" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
          <Field label="RUC" value={profile.ruc} onChange={(ruc) => setProfile({ ...profile, ruc })} />
          <Field label="Centro de trabajo" value={profile.workplace} onChange={(workplace) => setProfile({ ...profile, workplace })} />
          <label className="field"><span>Sector</span><select value={sector} onChange={(event) => setSector(event.target.value as SectorId)}>{sectorModules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}</select></label>
        </div>
        <div className="glass-card form-card">
          <h3>Tareas operativas</h3>
          {tasks.map((task, index) => (
            <div className="task-edit" key={task.id}>
              <Field label="Tarea" value={task.name} onChange={(name) => updateTask(tasks, setTasks, index, { name })} />
              <label className="field"><span>Puesto</span><select value={task.positionId} onChange={(event) => updateTask(tasks, setTasks, index, { positionId: event.target.value })}>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
              <label className="field"><span>Tipo</span><select value={task.activityKind} onChange={(event) => updateTask(tasks, setTasks, index, { activityKind: event.target.value as ActivityKind })}><option value="routine">Rutinaria</option><option value="non_routine">No rutinaria</option><option value="emergency">Emergencia</option></select></label>
              <Field label="Controles existentes" value={task.existingControls} onChange={(existingControls) => updateTask(tasks, setTasks, index, { existingControls })} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function MobileBottomNav({ activeView, onChange, onQuick }: { activeView: ViewId; onChange: (view: ViewId) => void; onQuick: () => void }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="Navegacion movil">
      <button type="button" className={activeView === 'dashboard' ? 'active' : ''} onClick={() => onChange('dashboard')}><LayoutDashboard size={18} />Inicio</button>
      <button type="button" className={activeView === 'matrix' ? 'active' : ''} onClick={() => onChange('matrix')}><Boxes size={18} />Matriz</button>
      <button type="button" className="mobile-fab" onClick={onQuick} aria-label="Nuevo IPERC"><Zap size={22} /></button>
      <button type="button" className={activeView === 'actions' ? 'active' : ''} onClick={() => onChange('actions')}><ClipboardList size={18} />Acciones</button>
      <button type="button" className={activeView === 'reports' ? 'active' : ''} onClick={() => onChange('reports')}><Command size={18} />Mas</button>
    </nav>
  )
}

function Modal({ kind, onClose, onRandom }: { kind: ModalKind; onClose: () => void; onRandom: () => void }) {
  if (!kind) return null
  const content = {
    scan: ['Escanear area', 'Funcion preparada para captura de evidencias. Disponible para integracion futura.'],
    load: ['Cargar proyecto', 'Modulo listo para plantillas y proyectos guardados. Por ahora use Caso al azar o configure la empresa manualmente.'],
    quick: ['Nuevo IPERC', 'Inicia una matriz rapida desde un caso de ejemplo coherente.'],
  }[kind]
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <button type="button" className="icon-button close" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        <Radar size={32} />
        <h2>{content[0]}</h2>
        <p>{content[1]}</p>
        <div>
          {kind === 'quick' && <button type="button" className="primary-neon" onClick={() => { onRandom(); onClose() }}>Generar caso</button>}
          <button type="button" className="ghost-button" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  )
}

function ViewHeader({ title, text }: { title: string; text: string }) {
  return <header className="view-header"><div><h2>{title}</h2><p>{text}</p></div><button type="button" className="ghost-button"><SlidersHorizontal size={16} /> Ajustes</button></header>
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="field"><span>{label}</span><input value={value} onChange={(event) => onChange(event.target.value)} /></label>
}

function RiskBadge({ level, score }: { level: RiskBand; score: number }) {
  return <span className={`risk-badge ${level.toLowerCase()}`}>{level === 'Intolerable' ? 'Critico' : level} <b>{score}</b></span>
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

function buildAssistantItems(rows: GeneratedAssessment[]) {
  const critical = rows.find((row) => row.initialLevel === 'Intolerable' || row.initialLevel === 'Importante')
  const ppe = rows.find((row) => row.ppeOnlyWarning)
  const evidence = rows.filter((row) => row.requiredEvidence.length > 0)
  const legal = rows.find((row) => row.legalValidationMissing)
  const weak = rows.find((row) => row.proposedControlsInsufficient)
  const overdue = rows.find((row) => new Date(row.deadline).getTime() < Date.now())
  return [
    {
      title: critical ? 'Riesgo critico sin control suficiente' : 'Riesgo importante detectado',
      text: critical ? 'Este riesgo requiere controles de mayor jerarquia antes de cerrar la matriz.' : 'Mantenga seguimiento preventivo de las tareas principales.',
      action: 'Revisar controles',
      icon: AlertTriangle,
    },
    {
      title: evidence.length ? `Faltan evidencias en ${Math.min(3, evidence.length)} tareas` : 'Evidencias al dia',
      text: 'Priorice fotos, checklists y registros de capacitacion para sustentar controles.',
      action: 'Subir evidencias',
      icon: UploadCloud,
    },
    {
      title: legal ? 'Validacion legal pendiente' : 'Trazabilidad normativa revisada',
      text: legal ? 'No se citan articulos sin fuente oficial validada.' : 'Las referencias cargadas mantienen trazabilidad.',
      action: 'Ver normativa',
      icon: Scale,
    },
    {
      title: ppe || weak ? 'Control preventivo debil' : 'Controles en seguimiento',
      text: ppe ? 'Este riesgo no deberia quedar solo con EPP.' : 'Revise eficacia despues de implementar medidas.',
      action: 'Ajustar plan',
      icon: ShieldCheck,
    },
    {
      title: overdue ? 'Control vencido' : 'Planifica charla de seguridad',
      text: overdue ? 'Hay acciones fuera de plazo que requieren responsable.' : 'El area operativa necesita refuerzo preventivo semanal.',
      action: 'Programar accion',
      icon: ClipboardCheck,
    },
  ]
}

function handleReport(label: string, profile: CompanyProfile, rows: GeneratedAssessment[]) {
  if (label.includes('Matriz') || label.includes('Excel')) exportExcel(profile, rows)
  else if (label.includes('CSV')) exportCsv(profile, rows)
  else if (label.includes('Informe') || label.includes('Resumen')) exportWord(profile, rows)
  else printPdfReport()
}

function countBy(rows: GeneratedAssessment[], getKey: (row: GeneratedAssessment) => string): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = getKey(row)
    acc[key] = (acc[key] ?? 0) + 1
    return acc
  }, {})
}

function statusLabel(row: GeneratedAssessment) {
  if (row.legalValidationMissing) return 'Validacion legal pendiente'
  if (row.proposedControlsInsufficient) return 'En revision'
  return 'En control'
}

function statusTone(row: GeneratedAssessment) {
  if (row.legalValidationMissing) return 'yellow'
  if (row.proposedControlsInsufficient) return 'orange'
  return 'green'
}

function shortText(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length - 1)}...` : value
}

function updateTask(tasks: WorkTask[], setTasks: (tasks: WorkTask[]) => void, index: number, patch: Partial<WorkTask>) {
  const next = [...tasks]
  next[index] = { ...next[index], ...patch }
  setTasks(next)
}

export default App
