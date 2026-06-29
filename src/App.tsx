import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  LineChart,
  Save,
  Scale,
  Search,
  Shield,
  ShieldCheck,
  Target,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import './App.css'
import { legalNorms, sectorModules } from './data/legalDatabase'
import { exportCsv, exportExcel, exportWord, printPdfReport } from './lib/exporters'
import { buildDashboard, generateAssessments, validateBeforeExport } from './lib/riskEngine'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import type { ActivityKind, CompanyProfile, JobPosition, SectorId, WorkArea, WorkTask } from './types'

const steps = [
  {
    label: 'Datos de la empresa',
    detail: 'Informacion general de la organizacion',
    icon: Building2,
  },
  {
    label: 'SGSST',
    detail: 'Responsables, version y evidencia base',
    icon: ShieldCheck,
  },
  {
    label: 'Sector y modulo legal',
    detail: 'Seleccionar sector y referencias aplicables',
    icon: Scale,
  },
  {
    label: 'Areas, puestos y tareas',
    detail: 'Procesos, cargos, actividades y expuestos',
    icon: Building2,
  },
  {
    label: 'Identificacion de peligros',
    detail: 'Taxonomia modular por sector y tarea',
    icon: AlertTriangle,
  },
  {
    label: 'Riesgo inicial',
    detail: 'Probabilidad, severidad, exposicion y prioridad',
    icon: LineChart,
  },
  {
    label: 'Controles existentes',
    detail: 'Controles actuales segun jerarquia',
    icon: ShieldCheck,
  },
  {
    label: 'Controles propuestos',
    detail: 'Jerarquia de eliminacion a EPP',
    icon: Target,
  },
  {
    label: 'Riesgo residual',
    detail: 'Reevaluar riesgo con controles',
    icon: ClipboardCheck,
  },
  {
    label: 'Validacion legal',
    detail: 'Reglas, articulos y evidencia requerida',
    icon: FileText,
  },
  {
    label: 'Plan de accion',
    detail: 'Medidas adicionales y responsables',
    icon: Target,
  },
  {
    label: 'Exportes e indicadores',
    detail: 'Excel, PDF, Word, CSV y dashboard',
    icon: Download,
  },
]

const initialProfile: CompanyProfile = {
  name: '',
  ruc: '',
  ownership: 'private',
  businessActivity: '',
  ciiu: '',
  workplace: '',
  workerCount: 0,
}

const initialAreas: WorkArea[] = [
  { id: 'area-1', name: 'Recepcion y administracion', process: 'Atencion, documentos y soporte interno' },
  { id: 'area-2', name: 'Almacen', process: 'Recepcion, ubicacion y despacho' },
]

const initialPositions: JobPosition[] = [
  { id: 'pos-1', areaId: 'area-1', title: 'Asistente administrativo', workerCount: 4 },
  { id: 'pos-2', areaId: 'area-2', title: 'Auxiliar de almacen', workerCount: 3 },
]

const initialTasks: WorkTask[] = [
  {
    id: 'task-1',
    positionId: 'pos-1',
    name: 'Digitacion diaria en computadora y archivo de documentos',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 4,
    existingControls: 'Sillas regulables, induccion basica y pausas no formalizadas',
  },
  {
    id: 'task-2',
    positionId: 'pos-2',
    name: 'Descarga de materiales, ubicacion en almacen y despacho',
    activityKind: 'routine',
    frequency: 'Diaria',
    exposedWorkers: 3,
    existingControls: 'Orden y limpieza, guantes y supervision directa',
  },
]

function App() {
  const [step, setStep] = useState(0)
  const [sector, setSector] = useState<SectorId>('offices')
  const [profile, setProfile] = useState(initialProfile)
  const [areas, setAreas] = useState(initialAreas)
  const [positions, setPositions] = useState(initialPositions)
  const [tasks, setTasks] = useState(initialTasks)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const assessments = useMemo(
    () => generateAssessments(profile, sector, areas, positions, tasks),
    [profile, sector, areas, positions, tasks],
  )
  const selectedModule = sectorModules.find((item) => item.id === sector) ?? sectorModules[0]
  const activeStep = steps[step]
  const dashboard = useMemo(() => buildDashboard(assessments), [assessments])
  const exportWarnings = useMemo(() => validateBeforeExport(profile, assessments), [profile, assessments])
  const pendingLegalCount = assessments.flatMap((row) => row.legalMatches).filter((match) => match.status === 'pending_validation').length

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
      payload: {
        profile,
        areas,
        positions,
        tasks,
        assessments,
      },
      status: 'draft',
    })

    setSaveState(error ? 'error' : 'saved')
  }

  return (
    <main className="app-frame">
      <header className="app-topbar">
        <div className="product-lockup">
          <div className="logo-mark">
            <Shield size={30} />
          </div>
          <strong>IPERC Peru</strong>
        </div>
        <div className="topbar-title">Generador de Matriz IPERC</div>
        <div className="topbar-actions">
          <button type="button" className="topbar-tool"><HelpCircle size={18} /> Ayuda</button>
          <button type="button" className="topbar-tool notification"><Bell size={18} /> Notificaciones <span>3</span></button>
          <div className="user-chip"><b>AD</b><span>Admin Demo<small>Administrador</small></span></div>
        </div>
      </header>

      <div className="app-body">
        <aside className="process-sidebar">
          <h2>Pasos del proceso</h2>
          <nav aria-label="Pasos del proceso">
            {steps.map((item, index) => {
              const Icon = item.icon
              return (
                <button
                  type="button"
                  key={item.label}
                  className={`process-step ${index === step ? 'active' : ''}`}
                  onClick={() => setStep(index)}
                >
                  <span className="step-number">{index + 1}</span>
                  <Icon className="step-icon" size={22} />
                  <span>
                    <strong>{item.label}</strong>
                    <small>{item.detail}</small>
                  </span>
                </button>
              )
            })}
          </nav>
        </aside>

        <section className="work-area">
          <div className="main-layout">
            <section className="wizard-card">
              <div className="wizard-heading">
                <span>Paso {step + 1} de {steps.length}</span>
                <h1>{activeStep.label}</h1>
                <p>{step === 0 ? 'Complete la informacion general de la organizacion para iniciar el IPERC.' : activeStep.detail}</p>
              </div>
              <StatusBadges dashboard={dashboard} warnings={exportWarnings} />

              {step === 0 && <CompanyStep profile={profile} setProfile={setProfile} sector={sector} setSector={setSector} />}
              {step === 1 && <SgsstStep profile={profile} setProfile={setProfile} />}
              {step === 2 && <SectorStep sector={sector} setSector={setSector} />}
              {step === 3 && <TaskStep positions={positions} tasks={tasks} setTasks={setTasks} />}
              {step === 4 && <MatrixPreview rows={assessments} mode="hazard" />}
              {step === 5 && <MatrixPreview rows={assessments} mode="risk" />}
              {step === 6 && <MatrixPreview rows={assessments} mode="existing" />}
              {step === 7 && <MatrixPreview rows={assessments} mode="controls" />}
              {step === 8 && <MatrixPreview rows={assessments} mode="residual" />}
              {step === 9 && <LegalStep rows={assessments} sector={sector} />}
              {step === 10 && <PlanStep rows={assessments} />}
              {step === 11 && <ExportStep profile={profile} rows={assessments} warnings={exportWarnings} />}

              <div className="form-note">
                <span><HelpCircle size={16} /> La informacion registrada sera utilizada en todos los documentos y reportes generados.</span>
                <span>* Campos obligatorios</span>
              </div>
            </section>

            <aside className="right-rail">
              <LegalRail normIds={selectedModule.normIds} />
              <EvidenceRail />
            </aside>
          </div>

          <footer className="wizard-actions">
            <button type="button" className="muted-action" onClick={() => setStep(Math.max(0, step - 1))}>
              <ArrowLeft size={18} /> Atras
            </button>
            <button type="button" className="outline-action" onClick={saveDraft}>
              <Save size={18} /> {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado' : 'Guardar borrador'}
            </button>
            <button type="button" className="primary-action" onClick={() => setStep(Math.min(steps.length - 1, step + 1))}>
              Siguiente <ArrowRight size={18} />
            </button>
          </footer>

          <Overview
            areas={areas}
            positions={positions}
            tasks={tasks}
            pendingLegalCount={pendingLegalCount}
            supabaseReady={isSupabaseConfigured}
            setAreas={setAreas}
            setPositions={setPositions}
          />
        </section>
      </div>
    </main>
  )
}

function CompanyStep({
  profile,
  setProfile,
  sector,
  setSector,
}: {
  profile: CompanyProfile
  setProfile: (profile: CompanyProfile) => void
  sector: SectorId
  setSector: (sector: SectorId) => void
}) {
  return (
    <div className="company-form">
      <Field required label="Razon social" placeholder="Ingrese la razon social de la empresa" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
      <Field required label="RUC" placeholder="Ej. 20123456789" value={profile.ruc} onChange={(ruc) => setProfile({ ...profile, ruc })} />
      <div className="field full">
        <span>Tipo de organizacion *</span>
        <div className="choice-row">
          <button type="button" className={profile.ownership === 'public' ? 'selected' : ''} onClick={() => setProfile({ ...profile, ownership: 'public' })}>
            <Building2 size={18} /> Sector publico
          </button>
          <button type="button" className={profile.ownership === 'private' ? 'selected' : ''} onClick={() => setProfile({ ...profile, ownership: 'private' })}>
            <Building2 size={18} /> Sector privado
          </button>
        </div>
      </div>
      <label className="field">
        <span>Actividad economica principal *</span>
        <select value={sector} onChange={(event) => setSector(event.target.value as SectorId)}>
          {sectorModules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}
        </select>
      </label>
      <div className="field search-field">
        <span>Codigo CIIU *</span>
        <div>
          <input placeholder="Ej. 4690 - Venta al por mayor no especializada" value={profile.ciiu} onChange={(event) => setProfile({ ...profile, ciiu: event.target.value })} />
          <button type="button"><Search size={18} /></button>
        </div>
      </div>
      <Field required label="Sede / Centro de trabajo" placeholder="Seleccione la sede o centro de trabajo" value={profile.workplace} onChange={(workplace) => setProfile({ ...profile, workplace })} />
      <div className="field icon-field">
        <span>Numero de trabajadores *</span>
        <div>
          <input type="number" min={0} placeholder="Ej. 120" value={profile.workerCount || ''} onChange={(event) => setProfile({ ...profile, workerCount: Number(event.target.value) })} />
          <Users size={18} />
        </div>
      </div>
      <Field label="Direccion" className="full" placeholder="Ingrese la direccion fiscal de la empresa" value={profile.businessActivity} onChange={(businessActivity) => setProfile({ ...profile, businessActivity })} />
      <label className="field">
        <span>Departamento *</span>
        <select defaultValue=""><option value="">Seleccione</option><option>Lima</option><option>Arequipa</option><option>La Libertad</option></select>
      </label>
      <label className="field">
        <span>Provincia *</span>
        <select defaultValue=""><option value="">Seleccione</option><option>Lima</option><option>Callao</option></select>
      </label>
      <label className="field">
        <span>Distrito *</span>
        <select defaultValue=""><option value="">Seleccione</option><option>Miraflores</option><option>San Isidro</option></select>
      </label>
      <Field label="Representante legal" placeholder="Ingrese el nombre del representante legal" value="" onChange={() => undefined} />
      <Field label="Correo electronico" placeholder="Ej. contacto@empresa.com" value="" onChange={() => undefined} />
      <Field label="Telefono" placeholder="Ej. (01) 123-4567" value="" onChange={() => undefined} />
      <div className="field icon-field">
        <span>Fecha de inicio del IPERC *</span>
        <div>
          <input type="date" defaultValue="2026-06-29" />
          <CalendarDays size={18} />
        </div>
      </div>
    </div>
  )
}

function SgsstStep({
  profile,
  setProfile,
}: {
  profile: CompanyProfile
  setProfile: (profile: CompanyProfile) => void
}) {
  return (
    <div className="company-form">
      <Field label="Responsable SGSST" placeholder="Nombre del responsable o supervisor SST" value={profile.sgsstResponsible ?? ''} onChange={(sgsstResponsible) => setProfile({ ...profile, sgsstResponsible })} />
      <Field label="Elaborado por" placeholder="Profesional que prepara la matriz" value={profile.preparedBy ?? ''} onChange={(preparedBy) => setProfile({ ...profile, preparedBy })} />
      <Field label="Revisado por" placeholder="Responsable que revisa la matriz" value={profile.reviewedBy ?? ''} onChange={(reviewedBy) => setProfile({ ...profile, reviewedBy })} />
      <Field label="Aprobado por" placeholder="Representante que aprueba la matriz" value={profile.approvedBy ?? ''} onChange={(approvedBy) => setProfile({ ...profile, approvedBy })} />
      <div className="validation-banner full">
        <ClipboardCheck size={20} />
        <span>Registre organigrama, politica SST, mapa de procesos, comite o supervisor SST y capacitaciones como evidencia base del SGSST.</span>
      </div>
    </div>
  )
}

function SectorStep({ sector, setSector }: { sector: SectorId; setSector: (sector: SectorId) => void }) {
  const selected = sectorModules.find((item) => item.id === sector) ?? sectorModules[0]
  return (
    <div className="sector-grid">
      {sectorModules.map((module) => (
        <button type="button" key={module.id} className={`sector-option ${module.id === sector ? 'selected' : ''}`} onClick={() => setSector(module.id)}>
          <strong>{module.label}</strong>
          <span>{module.description}</span>
        </button>
      ))}
      <div className="validation-banner full">
        <Scale size={20} />
        <span>{selected.validationWarning} Las obligaciones especificas no se inventan: se muestran como Requires legal validation hasta cargar fuente oficial validada.</span>
      </div>
    </div>
  )
}

function TaskStep({ positions, tasks, setTasks }: { positions: JobPosition[]; tasks: WorkTask[]; setTasks: (tasks: WorkTask[]) => void }) {
  return (
    <div className="task-stack">
      {tasks.map((task, index) => (
        <div className="task-card" key={task.id}>
          <Field label="Actividad / tarea" value={task.name} onChange={(name) => updateTask(tasks, setTasks, index, { name })} />
          <label className="field">
            <span>Puesto</span>
            <select value={task.positionId} onChange={(event) => updateTask(tasks, setTasks, index, { positionId: event.target.value })}>
              {positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}
            </select>
          </label>
          <label className="field">
            <span>Tipo</span>
            <select value={task.activityKind} onChange={(event) => updateTask(tasks, setTasks, index, { activityKind: event.target.value as ActivityKind })}>
              <option value="routine">Rutinaria</option>
              <option value="non_routine">No rutinaria</option>
              <option value="emergency">Emergencia</option>
            </select>
          </label>
          <Field label="Frecuencia" value={task.frequency} onChange={(frequency) => updateTask(tasks, setTasks, index, { frequency })} />
          <div className="field">
            <span>Expuestos</span>
            <input type="number" min={1} value={task.exposedWorkers} onChange={(event) => updateTask(tasks, setTasks, index, { exposedWorkers: Number(event.target.value) })} />
          </div>
          <label className="field full">
            <span>Controles existentes</span>
            <textarea value={task.existingControls} onChange={(event) => updateTask(tasks, setTasks, index, { existingControls: event.target.value })} />
          </label>
        </div>
      ))}
      <button type="button" className="link-action" onClick={() => setTasks([...tasks, {
        id: `task-${tasks.length + 1}`,
        positionId: positions[0]?.id ?? 'pos-1',
        name: 'Nueva actividad',
        activityKind: 'routine',
        frequency: 'Diaria',
        exposedWorkers: 1,
        existingControls: '',
      }])}>+ Agregar actividad</button>
    </div>
  )
}

function MatrixPreview({ rows, mode }: { rows: ReturnType<typeof generateAssessments>; mode: 'hazard' | 'risk' | 'existing' | 'controls' | 'residual' }) {
  return (
    <div className="matrix-shell">
      <table>
        <thead>
          <tr>
            <th>Area</th>
            <th>Puesto</th>
            <th>Tarea</th>
            <th>Peligro</th>
            <th>{mode === 'risk' || mode === 'residual' ? 'Nivel' : mode === 'existing' ? 'Controles existentes' : mode === 'controls' ? 'Controles propuestos' : 'Consecuencias'}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.area.name}</td>
              <td>{row.position.title}</td>
              <td>{row.task.name}</td>
              <td><b>{row.hazard.name}</b><small>{row.hazard.category}</small></td>
              <td>
                {mode === 'hazard' && row.consequences}
                {mode === 'risk' && <RiskCell label={row.initialLevel} score={row.initialScore} />}
                {mode === 'residual' && <RiskCell label={row.residualLevel} score={row.residualScore} />}
                {mode === 'existing' && row.existingControls}
                {mode === 'controls' && row.proposedControls.map((control) => `${control.level}: ${control.description}`).join(' ')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function PlanStep({ rows }: { rows: ReturnType<typeof generateAssessments> }) {
  return (
    <div className="matrix-shell">
      <table>
        <thead><tr><th>Riesgo</th><th>Control propuesto</th><th>Responsable</th><th>Plazo</th><th>Evidencia</th></tr></thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.riskDescription}</td>
              <td>{row.proposedControls.map((control) => `${control.level}: ${control.description}`).join(' ')}</td>
              <td>{row.responsible}</td>
              <td>{row.deadline}</td>
              <td>{row.requiredEvidence.slice(0, 3).join(', ')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function LegalStep({ rows, sector }: { rows: ReturnType<typeof generateAssessments>; sector: SectorId }) {
  const module = sectorModules.find((item) => item.id === sector)
  return (
    <div className="legal-review">
      <div className="validation-banner">
        <AlertTriangle size={20} />
        <span>{module?.label}: solo se citan articulos verificados. Lo pendiente queda marcado como Requires legal validation.</span>
      </div>
      <div className="matrix-shell">
        <table>
          <thead><tr><th>Riesgo</th><th>Norma</th><th>Articulo</th><th>Obligacion</th><th>Evidencia</th></tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <td>{row.riskDescription}</td>
                <td>{row.legalNorm}</td>
                <td>{row.legalArticle}</td>
                <td>{row.legalMatches[0]?.obligation ?? 'Normative reference pending validation'}</td>
                <td>{row.requiredEvidence.slice(0, 3).join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function ExportStep({ profile, rows, warnings }: { profile: CompanyProfile; rows: ReturnType<typeof generateAssessments>; warnings: ReturnType<typeof validateBeforeExport> }) {
  return (
    <div className="export-panel">
      {warnings.length > 0 && (
        <div className="validation-banner full">
          <AlertTriangle size={20} />
          <span>{warnings.map((warning) => warning.label).join(' ')}</span>
        </div>
      )}
      <button type="button" onClick={() => exportExcel(profile, rows)}><FileSpreadsheet /> Excel IPERC</button>
      <button type="button" onClick={printPdfReport}><FileText /> PDF legal</button>
      <button type="button" onClick={() => exportWord(profile, rows)}><FileText /> Word tecnico</button>
      <button type="button" onClick={() => exportCsv(profile, rows)}><Download /> CSV dataset</button>
    </div>
  )
}

function StatusBadges({ dashboard, warnings }: { dashboard: ReturnType<typeof buildDashboard>; warnings: ReturnType<typeof validateBeforeExport> }) {
  return (
    <div className="status-badges">
      <span>Riesgos: {dashboard.totalRisks}</span>
      <span>Criticos: {dashboard.criticalRisks}</span>
      <span>Reduccion residual: {dashboard.reductionPercent}%</span>
      <span>Validacion legal pendiente: {dashboard.risksWithoutValidatedLegalSupport}</span>
      <span>Evidencia pendiente: {dashboard.controlsPendingEvidence}</span>
      {warnings.map((warning) => <span key={warning.code} className={warning.severity}>{warning.label}</span>)}
    </div>
  )
}

function LegalRail({ normIds }: { normIds: string[] }) {
  return (
    <section className="side-card">
      <h2><Scale size={22} /> Marco legal aplicable</h2>
      {normIds.map((normId) => {
        const norm = legalNorms.find((item) => item.id === normId)
        return (
          <div className="legal-item" key={normId}>
            <FileText size={24} />
            <div>
              <strong>{norm?.shortName}</strong>
              <span>{norm?.title.replace(`${norm.shortName}, `, '')}</span>
            </div>
            <em>{norm?.module === 'general' ? 'Ley' : 'Modulo'}</em>
          </div>
        )
      })}
      <a href="#legal">Ver documentos y enlaces</a>
    </section>
  )
}

function EvidenceRail() {
  const evidence = ['Organigrama de la empresa', 'Mapa de procesos', 'Descripcion de actividades', 'Registros de capacitacion en SST', 'Politica de SST vigente']
  return (
    <section className="side-card">
      <h2><ClipboardCheck size={22} /> Evidencias requeridas</h2>
      <ul className="evidence-list">
        {evidence.map((item) => <li key={item}><CheckCircle2 size={17} /> {item}</li>)}
      </ul>
      <div className="rail-warning"><AlertTriangle size={18} /> Asegurese de contar con la informacion y evidencias antes de continuar con el proceso.</div>
    </section>
  )
}

function Overview({
  areas,
  positions,
  tasks,
  pendingLegalCount,
  supabaseReady,
  setAreas,
  setPositions,
}: {
  areas: WorkArea[]
  positions: JobPosition[]
  tasks: WorkTask[]
  pendingLegalCount: number
  supabaseReady: boolean
  setAreas: (areas: WorkArea[]) => void
  setPositions: (positions: JobPosition[]) => void
}) {
  return (
    <section className="overview-card">
      <h2>Vista general de lo que construiremos</h2>
      <div className="overview-grid">
        <div className="mini-panel">
          <h3>1. Tareas / actividades</h3>
          <table><tbody>{tasks.slice(0, 3).map((task, index) => <tr key={task.id}><td>{index + 1}</td><td>{task.name.split(',')[0]}</td></tr>)}</tbody></table>
          <button type="button" onClick={() => setAreas([...areas, { id: `area-${areas.length + 1}`, name: 'Nueva area', process: 'Proceso' }])}>+ Agregar area</button>
          <button type="button" onClick={() => setPositions([...positions, { id: `pos-${positions.length + 1}`, areaId: areas[0]?.id ?? 'area-1', title: 'Nuevo puesto', workerCount: 1 }])}>+ Agregar puesto</button>
        </div>
        <div className="mini-panel">
          <h3>2. Taxonomia de peligros</h3>
          <div className="taxonomy-tags">
            {['Fisicos', 'Quimicos', 'Biologicos', 'Ergonomicos', 'Mecanicos', 'Electricos', 'Incendio / Explosion', 'Psicosociales'].map((tag) => <span key={tag}>{tag}</span>)}
          </div>
          <button type="button">+ Catalogo SUNAFIL</button>
        </div>
        <div className="mini-panel risk-map">
          <h3>3. Matriz de evaluacion de riesgos</h3>
          <div className="heatmap">{Array.from({ length: 25 }).map((_, index) => <span key={index} className={`c${Math.floor(index / 5) + Math.floor(index % 5)}`} />)}</div>
          <p>B: Bajo · M: Medio · A: Alto · E: Extremo</p>
        </div>
        <div className="mini-panel hierarchy">
          <h3>4. Jerarquia de controles</h3>
          {['Eliminacion', 'Sustitucion', 'Controles de ingenieria', 'Controles administrativos', 'EPP'].map((item, index) => <span key={item} style={{ width: `${100 - index * 10}%` }}>{index + 1}. {item}</span>)}
          <p>{pendingLegalCount} citas requieren validacion · Supabase {supabaseReady ? 'conectado' : 'pendiente'}</p>
        </div>
      </div>
    </section>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  className?: string
}) {
  return (
    <label className={`field ${className}`}>
      <span>{label}{required ? ' *' : ''}</span>
      <input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function RiskCell({ label, score }: { label: string; score: number }) {
  return <span className={`risk-token ${label.toLowerCase()}`}>{label} · {score}</span>
}

function updateTask(tasks: WorkTask[], setTasks: (tasks: WorkTask[]) => void, index: number, patch: Partial<WorkTask>) {
  const next = [...tasks]
  next[index] = { ...next[index], ...patch }
  setTasks(next)
}

export default App
