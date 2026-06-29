import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bell,
  Building2,
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
import './App.css'
import { legalNorms, sectorModules } from './data/legalDatabase'
import { exportCsv, exportExcel, exportWord, printPdfReport } from './lib/exporters'
import { generateAssessments } from './lib/riskEngine'
import { isSupabaseConfigured, supabase } from './lib/supabaseClient'
import type { ActivityKind, CompanyProfile, JobPosition, SectorId, WorkArea, WorkTask } from './types'

const steps = [
  ['Datos de la empresa', 'Informacion general de la organizacion', Building2],
  ['Tareas y actividades', 'Definir actividades y pasos de trabajo', Building2],
  ['Identificacion de peligros', 'Seleccionar peligros por taxonomy', AlertTriangle],
  ['Evaluacion de riesgos', 'Probabilidad, severidad y nivel de riesgo', LineChart],
  ['Controles existentes', 'Controles actuales segun jerarquia', ShieldCheck],
  ['Evaluacion de riesgos residuales', 'Reevaluar riesgo con controles', ClipboardCheck],
  ['Plan de accion', 'Medidas adicionales y responsables', Target],
  ['Revision y aprobacion', 'Verificar y aprobar la matriz', FileText],
  ['Exportar y finalizar', 'Generar documentos y cerrar IPERC', Download],
] as const

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
  { id: 'area-1', name: 'Recepcion y administracion', process: 'Atencion y soporte interno' },
  { id: 'area-2', name: 'Almacen', process: 'Recepcion y despacho' },
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

  const assessments = useMemo(() => generateAssessments(profile, sector, areas, positions, tasks), [profile, sector, areas, positions, tasks])
  const selectedModule = sectorModules.find((item) => item.id === sector) ?? sectorModules[0]
  const pendingLegalCount = assessments.flatMap((row) => row.legalMatches).filter((match) => match.status === 'requires_legal_validation').length

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
      status: 'draft',
      payload: { profile, areas, positions, tasks, assessments },
    })
    setSaveState(error ? 'error' : 'saved')
  }

  const [title, detail] = steps[step]

  return (
    <main className="app-frame">
      <header className="app-topbar">
        <div className="product-lockup"><Shield size={30} /><strong>IPERC Peru</strong></div>
        <div className="topbar-title">Generador de Matriz IPERC</div>
        <div className="topbar-actions"><HelpCircle size={18} /> Ayuda <Bell size={18} /> Notificaciones <span>3</span><b>AD</b></div>
      </header>

      <div className="app-body">
        <aside className="process-sidebar">
          <h2>Pasos del proceso</h2>
          <nav>
            {steps.map(([label, desc, Icon], index) => (
              <button key={label} className={`process-step ${index === step ? 'active' : ''}`} type="button" onClick={() => setStep(index)}>
                <span className="step-number">{index + 1}</span><Icon className="step-icon" size={22} />
                <span><strong>{label}</strong><small>{desc}</small></span>
              </button>
            ))}
          </nav>
        </aside>

        <section className="work-area">
          <div className="main-layout">
            <section className="wizard-card">
              <div className="wizard-heading"><span>Paso {step + 1} de 9</span><h1>{title}</h1><p>{step === 0 ? 'Complete la informacion general de la organizacion para iniciar el IPERC.' : detail}</p></div>
              {step === 0 && <CompanyStep profile={profile} setProfile={setProfile} sector={sector} setSector={setSector} />}
              {step === 1 && <TaskStep positions={positions} tasks={tasks} setTasks={setTasks} />}
              {step >= 2 && step <= 5 && <MatrixPreview rows={assessments} mode={step === 2 ? 'hazard' : step === 3 ? 'risk' : step === 4 ? 'existing' : 'residual'} />}
              {step === 6 && <PlanStep rows={assessments} />}
              {step === 7 && <LegalStep rows={assessments} />}
              {step === 8 && <ExportStep profile={profile} rows={assessments} />}
              <div className="form-note"><span><HelpCircle size={16} /> La informacion registrada sera utilizada en documentos y reportes.</span><span>* Campos obligatorios</span></div>
            </section>

            <aside className="right-rail"><LegalRail normIds={selectedModule.normIds} /><EvidenceRail /></aside>
          </div>

          <footer className="wizard-actions">
            <button className="muted-action" type="button" onClick={() => setStep(Math.max(0, step - 1))}><ArrowLeft size={18} /> Atras</button>
            <button className="outline-action" type="button" onClick={saveDraft}><Save size={18} /> {saveState === 'saving' ? 'Guardando...' : saveState === 'saved' ? 'Guardado' : 'Guardar borrador'}</button>
            <button className="primary-action" type="button" onClick={() => setStep(Math.min(8, step + 1))}>Siguiente <ArrowRight size={18} /></button>
          </footer>

          <Overview areas={areas} tasks={tasks} pendingLegalCount={pendingLegalCount} supabaseReady={isSupabaseConfigured} setAreas={setAreas} />
        </section>
      </div>
    </main>
  )
}

function CompanyStep({ profile, setProfile, sector, setSector }: { profile: CompanyProfile; setProfile: (p: CompanyProfile) => void; sector: SectorId; setSector: (s: SectorId) => void }) {
  return <div className="company-form">
    <Field required label="Razon social" placeholder="Ingrese la razon social de la empresa" value={profile.name} onChange={(name) => setProfile({ ...profile, name })} />
    <Field required label="RUC" placeholder="Ej. 20123456789" value={profile.ruc} onChange={(ruc) => setProfile({ ...profile, ruc })} />
    <div className="field full"><span>Tipo de organizacion *</span><div className="choice-row"><button type="button" className={profile.ownership === 'public' ? 'selected' : ''} onClick={() => setProfile({ ...profile, ownership: 'public' })}><Building2 size={18} /> Sector publico</button><button type="button" className={profile.ownership === 'private' ? 'selected' : ''} onClick={() => setProfile({ ...profile, ownership: 'private' })}><Building2 size={18} /> Sector privado</button></div></div>
    <label className="field"><span>Actividad economica principal *</span><select value={sector} onChange={(event) => setSector(event.target.value as SectorId)}>{sectorModules.map((module) => <option key={module.id} value={module.id}>{module.label}</option>)}</select></label>
    <div className="field search-field"><span>Codigo CIIU *</span><div><input placeholder="Ej. 4690" value={profile.ciiu} onChange={(event) => setProfile({ ...profile, ciiu: event.target.value })} /><button type="button"><Search size={18} /></button></div></div>
    <Field required label="Sede / Centro de trabajo" placeholder="Seleccione la sede" value={profile.workplace} onChange={(workplace) => setProfile({ ...profile, workplace })} />
    <div className="field icon-field"><span>Numero de trabajadores *</span><div><input type="number" min={0} placeholder="Ej. 120" value={profile.workerCount || ''} onChange={(event) => setProfile({ ...profile, workerCount: Number(event.target.value) })} /><Users size={18} /></div></div>
    <Field label="Direccion" className="full" placeholder="Ingrese la direccion fiscal" value={profile.businessActivity} onChange={(businessActivity) => setProfile({ ...profile, businessActivity })} />
    {['Departamento', 'Provincia', 'Distrito'].map((label) => <label key={label} className="field"><span>{label} *</span><select defaultValue=""><option value="">Seleccione</option><option>Lima</option></select></label>)}
    <Field label="Representante legal" placeholder="Ingrese el nombre" value="" onChange={() => undefined} />
    <Field label="Correo electronico" placeholder="contacto@empresa.com" value="" onChange={() => undefined} />
  </div>
}

function TaskStep({ positions, tasks, setTasks }: { positions: JobPosition[]; tasks: WorkTask[]; setTasks: (tasks: WorkTask[]) => void }) {
  return <div className="task-stack">{tasks.map((task, index) => <div className="task-card" key={task.id}>
    <Field label="Actividad / tarea" value={task.name} onChange={(name) => updateTask(tasks, setTasks, index, { name })} />
    <label className="field"><span>Puesto</span><select value={task.positionId} onChange={(event) => updateTask(tasks, setTasks, index, { positionId: event.target.value })}>{positions.map((position) => <option key={position.id} value={position.id}>{position.title}</option>)}</select></label>
    <label className="field"><span>Tipo</span><select value={task.activityKind} onChange={(event) => updateTask(tasks, setTasks, index, { activityKind: event.target.value as ActivityKind })}><option value="routine">Rutinaria</option><option value="non_routine">No rutinaria</option></select></label>
    <Field label="Frecuencia" value={task.frequency} onChange={(frequency) => updateTask(tasks, setTasks, index, { frequency })} />
    <div className="field"><span>Expuestos</span><input type="number" min={1} value={task.exposedWorkers} onChange={(event) => updateTask(tasks, setTasks, index, { exposedWorkers: Number(event.target.value) })} /></div>
    <label className="field full"><span>Controles existentes</span><textarea value={task.existingControls} onChange={(event) => updateTask(tasks, setTasks, index, { existingControls: event.target.value })} /></label>
  </div>)}<button className="link-action" type="button" onClick={() => setTasks([...tasks, { id: `task-${tasks.length + 1}`, positionId: positions[0]?.id ?? 'pos-1', name: 'Nueva actividad', activityKind: 'routine', frequency: 'Diaria', exposedWorkers: 1, existingControls: '' }])}>+ Agregar actividad</button></div>
}

function MatrixPreview({ rows, mode }: { rows: ReturnType<typeof generateAssessments>; mode: 'hazard' | 'risk' | 'existing' | 'residual' }) {
  return <div className="matrix-shell"><table><thead><tr><th>Area</th><th>Puesto</th><th>Tarea</th><th>Peligro</th><th>{mode === 'risk' || mode === 'residual' ? 'Nivel' : mode === 'existing' ? 'Controles existentes' : 'Consecuencias'}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.area.name}</td><td>{row.position.title}</td><td>{row.task.name}</td><td><b>{row.hazard.name}</b><small>{row.hazard.category}</small></td><td>{mode === 'hazard' && row.consequences}{mode === 'risk' && <RiskCell label={row.initialLevel} score={row.initialScore} />}{mode === 'residual' && <RiskCell label={row.residualLevel} score={row.residualScore} />}{mode === 'existing' && row.existingControls}</td></tr>)}</tbody></table></div>
}

function PlanStep({ rows }: { rows: ReturnType<typeof generateAssessments> }) {
  return <div className="matrix-shell"><table><thead><tr><th>Riesgo</th><th>Control propuesto</th><th>Responsable</th><th>Plazo</th><th>Evidencia</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id}><td>{row.riskDescription}</td><td>{row.proposedControls.map((control) => `${control.level}: ${control.description}`).join(' ')}</td><td>{row.responsible}</td><td>{row.deadline}</td><td>{row.requiredEvidence.slice(0, 3).join(', ')}</td></tr>)}</tbody></table></div>
}

function LegalStep({ rows }: { rows: ReturnType<typeof generateAssessments> }) {
  return <><div className="validation-banner"><AlertTriangle size={20} /> Solo se citan articulos verificados; lo pendiente queda como requires legal validation.</div><PlanStep rows={rows} /></>
}

function ExportStep({ profile, rows }: { profile: CompanyProfile; rows: ReturnType<typeof generateAssessments> }) {
  return <div className="export-panel"><button type="button" onClick={() => exportExcel(profile, rows)}><FileSpreadsheet /> Excel IPERC</button><button type="button" onClick={printPdfReport}><FileText /> PDF legal</button><button type="button" onClick={() => exportWord(profile, rows)}><FileText /> Word tecnico</button><button type="button" onClick={() => exportCsv(profile, rows)}><Download /> CSV dataset</button></div>
}

function LegalRail({ normIds }: { normIds: string[] }) {
  return <section className="side-card"><h2><Scale size={22} /> Marco legal aplicable</h2>{normIds.map((normId) => { const norm = legalNorms.find((item) => item.id === normId); return <div className="legal-item" key={normId}><FileText size={24} /><div><strong>{norm?.shortName}</strong><span>{norm?.title}</span></div><em>{norm?.module === 'general' ? 'Ley' : 'Modulo'}</em></div> })}<a href="#legal">Ver documentos y enlaces</a></section>
}

function EvidenceRail() {
  return <section className="side-card"><h2><ClipboardCheck size={22} /> Evidencias requeridas</h2><ul className="evidence-list">{['Organigrama de la empresa', 'Mapa de procesos', 'Descripcion de actividades', 'Registros de capacitacion en SST', 'Politica de SST vigente'].map((item) => <li key={item}><CheckCircle2 size={17} /> {item}</li>)}</ul><div className="rail-warning"><AlertTriangle size={18} /> Asegurese de contar con la informacion y evidencias antes de continuar.</div></section>
}

function Overview({ areas, tasks, pendingLegalCount, supabaseReady, setAreas }: { areas: WorkArea[]; tasks: WorkTask[]; pendingLegalCount: number; supabaseReady: boolean; setAreas: (areas: WorkArea[]) => void }) {
  return <section className="overview-card"><h2>Vista general de lo que construiremos</h2><div className="overview-grid"><div className="mini-panel"><h3>1. Tareas / actividades</h3><table><tbody>{tasks.slice(0, 3).map((task, index) => <tr key={task.id}><td>{index + 1}</td><td>{task.name.split(',')[0]}</td></tr>)}</tbody></table><button type="button" onClick={() => setAreas([...areas, { id: `area-${areas.length + 1}`, name: 'Nueva area', process: 'Proceso' }])}>+ Agregar area</button></div><div className="mini-panel"><h3>2. Taxonomia de peligros</h3><div className="taxonomy-tags">{['Fisicos', 'Quimicos', 'Biologicos', 'Ergonomicos', 'Mecanicos', 'Electricos', 'Incendio / Explosion', 'Psicosociales'].map((tag) => <span key={tag}>{tag}</span>)}</div></div><div className="mini-panel risk-map"><h3>3. Matriz de evaluacion de riesgos</h3><div className="heatmap">{Array.from({ length: 25 }).map((_, index) => <span key={index} className={`c${Math.floor(index / 5) + Math.floor(index % 5)}`} />)}</div><p>B: Bajo · M: Medio · A: Alto · E: Extremo</p></div><div className="mini-panel hierarchy"><h3>4. Jerarquia de controles</h3>{['Eliminacion', 'Sustitucion', 'Controles de ingenieria', 'Controles administrativos', 'EPP'].map((item, index) => <span key={item} style={{ width: `${100 - index * 10}%` }}>{index + 1}. {item}</span>)}<p>{pendingLegalCount} citas requieren validacion · Supabase {supabaseReady ? 'conectado' : 'pendiente'}</p></div></div></section>
}

function Field({ label, value, onChange, placeholder, required = false, className = '' }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; required?: boolean; className?: string }) {
  return <label className={`field ${className}`}><span>{label}{required ? ' *' : ''}</span><input placeholder={placeholder} value={value} onChange={(event) => onChange(event.target.value)} /></label>
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
