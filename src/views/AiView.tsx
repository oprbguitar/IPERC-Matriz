import { useCallback, useEffect, useMemo, useState } from 'react'
import { Bell, Camera, CheckCircle2, Compass, Crown, Download, ExternalLink, FileText, History, KeyRound, Loader2, MessagesSquare, RefreshCw, Settings2, ShieldAlert, Smartphone, Sparkles, Trash2, XCircle } from 'lucide-react'
import { GuidedTour, tourSeen, type TourStep } from '../components/GuidedTour'
import { AccountPanel, ConsentGate, ForcedPassword, UpgradePrompt } from '../components/PremiumAccount'
import { SSOMA_NORMS, SSOMA_RISKS } from '../data/ssoma'
import { api, type ApiUser } from '../lib/api'
import { hashParam } from '../lib/hashParams'
import { markdownToHtml } from '../lib/markdown'
import '../styles/ai.css'

interface ModelInfo { id: string; label: string; vision: boolean; cost: string }
interface ProviderInfo { id: string; name: string; kind: string; keyUrl: string; note: string; models: ModelInfo[]; configured: boolean; hint: string | null; updatedAt: string | null }
interface Target { provider: string; model: string }
interface Settings { vision: Target; text: Target; jev: boolean }
interface Hazard { riskId: string | null; name: string; evidence: string; severity: number; probability: number; controls: string[] }
interface Diagnosis {
  vision: { scene: string; hazards: Hazard[]; positives?: string[]; limitations?: string }
  norms: Array<{ name: string; normIds: string[] }>
  probabilities: { motor?: 'jev' | 'local'; aviso?: string; nivel?: { choice?: string; probabilities?: Record<string, number> }; paralizacion?: { noul?: number }; observacionSunafil?: { noul?: number } }
  model?: Target
  ms?: number
}

class AiError extends Error {
  upgrade: boolean
  constructor(message: string, upgrade: boolean) {
    super(message)
    this.upgrade = upgrade
  }
}

/** Rutas de administrador (/api/admin/ai) o de usuario premium (/api/ai, prefijo «~»). */
async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const url = path.startsWith('~') ? `/api/ai${path.slice(1)}` : `/api/admin/ai${path}`
  const response = await fetch(url, { credentials: 'same-origin', ...init, headers: init.body ? { 'Content-Type': 'application/json' } : undefined })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string; upgrade?: boolean }
  if (!response.ok) throw new AiError(data.error ?? `Error ${response.status}`, Boolean(data.upgrade))
  return data
}

/** Reduce la foto a 1280 px y JPEG 0,8: menos costo y respuesta más rápida. */
function shrink(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(image.width, image.height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(image.width * scale)
      canvas.height = Math.round(image.height * scale)
      canvas.getContext('2d')?.drawImage(image, 0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(image.src)
      resolve(canvas.toDataURL('image/jpeg', 0.8))
    }
    image.onerror = () => reject(new Error('No se pudo leer la imagen.'))
    image.src = URL.createObjectURL(file)
  })
}

const LEVEL = (score: number) => (score >= 9 ? 'Intolerable' : score >= 6 ? 'Importante' : score >= 4 ? 'Moderado' : score >= 2 ? 'Tolerable' : 'Trivial')
const normCode = (id: string) => SSOMA_NORMS.find((norm) => norm.id === id)?.code ?? id

type Tab = 'consultor' | 'diagnostico' | 'informes' | 'alertas' | 'historial' | 'llaves' | 'modelos'
const TABS: Array<{ id: Tab; label: string; icon: typeof Bell; admin?: boolean }> = [
  { id: 'consultor', label: 'Consultor SSOMA', icon: MessagesSquare },
  { id: 'diagnostico', label: 'Diagnóstico por foto', icon: Camera },
  { id: 'informes', label: 'Informes y formatos', icon: FileText },
  { id: 'alertas', label: 'Alertas normativas', icon: Bell },
  { id: 'historial', label: 'Mi historial', icon: History },
  { id: 'llaves', label: 'Llaves de API', icon: KeyRound, admin: true },
  { id: 'modelos', label: 'Modelos', icon: Settings2, admin: true },
]
const AI_TOUR: TourStep[] = [
  { target: '.ai-hero', title: 'Su espacio de IA', body: 'Aquí ve su plan y cuántas consultas de IA le quedan hoy.' },
  { target: '.ai-tab-consultor', title: 'Consultor SSOMA', body: 'Pregunte lo que necesite: responde con la norma y enlaces directos a las fichas del Observatorio.' },
  { target: '.ai-tab-diagnostico', title: 'Diagnóstico por foto', body: 'Desde el celular se abre la cámara: tome la foto del área y obtenga peligros, nivel de riesgo y controles.' },
  { target: '.ai-tab-informes', title: 'Informes y formatos', body: 'Elija el formato, describa el caso en una línea y descargue el documento en Word o PDF.' },
  { target: '.ai-tab-alertas', title: 'Alertas normativas', body: 'Lo nuevo de las fuentes oficiales; pulse «Explicar con IA» para entender qué cambia.' },
]

export default function AiView({ user: initialUser }: { user: ApiUser | null }) {
  const [user, setUser] = useState(initialUser)
  useEffect(() => setUser(initialUser), [initialUser])
  const refresh = useCallback(() => { api.me().then(({ user: current }) => setUser(current)).catch(() => undefined) }, [])
  const [tab, setTab] = useState<Tab>(() => {
    const initial = hashParam('tab')
    return TABS.some((item) => item.id === initial) ? (initial as Tab) : 'consultor'
  })
  const [lastDiagnosis, setLastDiagnosis] = useState('')
  const [quota, setQuota] = useState<{ quota: number | null; used: number; planLabel?: string } | null>(null)
  const [upgrade, setUpgrade] = useState('')
  const [tour, setTour] = useState(false)
  const [providers, setProviders] = useState<ProviderInfo[]>([])
  const [status, setStatus] = useState<{ secretReady: boolean; workersAi: boolean } | null>(null)
  const [settings, setSettings] = useState<Settings | null>(null)
  const [message, setMessage] = useState('')

  const reload = () => {
    call<{ providers: ProviderInfo[]; secretReady: boolean; workersAi: boolean }>('/providers')
      .then((data) => {
        setProviders(data.providers)
        setStatus({ secretReady: data.secretReady, workersAi: data.workersAi })
      })
      .catch((error: Error) => setMessage(error.message))
    call<{ settings: Settings }>('/settings').then((data) => setSettings(data.settings)).catch(() => undefined)
  }
  const isAdmin = user?.role === 'admin'
  const ready = Boolean(user?.premium?.active && user.consentOk && !user.mustChange)
  useEffect(() => {
    if (isAdmin) reload()
  }, [isAdmin])
  useEffect(() => {
    if (ready) call<{ quota: number | null; used: number; planLabel: string }>('~/catalog').then(setQuota).catch(() => undefined)
  }, [ready, tab, upgrade])
  useEffect(() => {
    if (ready && !tourSeen('ia-v1')) { const timer = window.setTimeout(() => setTour(true), 700); return () => window.clearTimeout(timer) }
  }, [ready])

  if (!user) return <div className="view-page"><p className="notice-block">Inicie sesión en <b>Premium</b> para usar la IA.</p></div>
  if (user.mustChange) return <div className="view-page ai-view"><ForcedPassword onDone={refresh} /></div>
  if (!user.consentOk) return <div className="view-page ai-view"><ConsentGate onAccepted={refresh} /></div>
  if (!user.premium?.active) {
    return (
      <div className="view-page ai-view">
        <header className="page-head"><div><h1>IA premium</h1><p>Su cuenta no tiene acceso vigente a la IA. Active un código o solicite una extensión.</p></div></header>
        <AccountPanel user={user} onRefresh={refresh} />
      </div>
    )
  }
  const tabs = TABS.filter((item) => !item.admin || isAdmin)
  const onUpgrade = (text: string) => setUpgrade(text)

  return (
    <div className="view-page ai-view">
      <header className="ai-hero">
        <div>
          <span className="ph-crown"><Crown size={16} aria-hidden="true" /> Premium</span>
          <h1>Plataforma de IA SSOMA</h1>
          <p>Consultor especializado, diagnóstico por foto, informes listos para firmar y radar normativo diario.</p>
        </div>
        <div className="ai-hero-side">
          <span className="ph-chip">{isAdmin ? 'Administrador' : (quota?.planLabel ?? 'Premium')}{!isAdmin && user.premium.daysLeft !== null ? ` · ${user.premium.daysLeft} día(s)` : ''}</span>
          {quota && (
            <span className="ph-chip quota">
              {quota.quota === null ? 'Consultas sin límite' : `IA hoy: ${quota.used} de ${quota.quota}`}
              {quota.quota !== null && <i style={{ width: `${Math.min(100, (quota.used / quota.quota) * 100)}%` }} />}
            </span>
          )}
          <button type="button" className="btn-secondary small" onClick={() => setTour(true)}><Compass size={15} aria-hidden="true" /> Ver guía</button>
        </div>
      </header>
      {upgrade && <UpgradePrompt message={upgrade} />}
      {status && !status.secretReady && <p className="notice-block">Falta el secreto <code>AI_KEY_SECRET</code> en el Worker: no se pueden guardar llaves (Cloudflare Workers AI funciona igual).</p>}
      {message && <p className="form-note error">{message}</p>}

      <nav className="ai-tabs" role="tablist" aria-label="Herramientas de IA">
        {tabs.map(({ id, label, icon: Icon, admin }) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={`ai-tab ai-tab-${id} ${tab === id ? 'active' : ''} ${admin ? 'admin' : ''}`} onClick={() => setTab(id)}>
            <Icon size={17} aria-hidden="true" /> <span>{label}</span>
          </button>
        ))}
      </nav>

      {tab === 'consultor' && <ConsultPanel onUpgrade={onUpgrade} />}
      {tab === 'diagnostico' && <DiagnosisPanel isAdmin={isAdmin} settings={settings} providers={providers} onUpgrade={onUpgrade} onReport={(text) => { setLastDiagnosis(text); setTab('informes') }} />}
      {tab === 'informes' && <ReportsPanel diagnosis={lastDiagnosis} onUpgrade={onUpgrade} />}
      {tab === 'alertas' && <AlertsPanel isAdmin={isAdmin} onUpgrade={onUpgrade} />}
      {tab === 'llaves' && isAdmin && <KeysPanel providers={providers} onChange={reload} />}
      {tab === 'modelos' && isAdmin && settings && <ModelsPanel providers={providers} settings={settings} onSaved={setSettings} />}
      {tab === 'historial' && <RunsPanel isAdmin={isAdmin} />}
      <GuidedTour id="ia-v1" steps={AI_TOUR} open={tour} onClose={() => setTour(false)} />
    </div>
  )
}

function DiagnosisPanel({ isAdmin, settings, providers, onReport, onUpgrade }: { isAdmin: boolean; settings: Settings | null; providers: ProviderInfo[]; onReport: (text: string) => void; onUpgrade: (message: string) => void }) {
  const [image, setImage] = useState<string | null>(null)
  const [area, setArea] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Diagnosis | null>(null)
  const modelLabel = useMemo(() => {
    const provider = providers.find((item) => item.id === settings?.vision.provider)
    return provider ? `${provider.name} · ${provider.models.find((model) => model.id === settings?.vision.model)?.label ?? settings?.vision.model}` : 'elegido por el administrador'
  }, [providers, settings])

  const run = async () => {
    if (!image) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await call<Diagnosis>('~/diagnose', { method: 'POST', body: JSON.stringify({ image, area, note }) }))
    } catch (failure) {
      if (failure instanceof AiError && failure.upgrade) onUpgrade(failure.message)
      else setError(failure instanceof Error ? failure.message : 'Error')
    } finally {
      setBusy(false)
    }
  }

  const lines = () => {
    if (!result) return []
    return [
      `# Diagnóstico preliminar SSOMA`, '', `Fecha: ${new Date().toLocaleString('es-PE')}`, `Área: ${area || '—'}`, ...(isAdmin && result.model ? [`Modelo: ${result.model.provider} / ${result.model.model}`] : []), '',
      `## Escena`, result.vision.scene, '', `## Peligros`,
      ...result.vision.hazards.flatMap((hazard, index) => [
        `### ${index + 1}. ${hazard.name} — ${LEVEL(hazard.severity * hazard.probability)} (P${hazard.probability} × S${hazard.severity})`,
        `Evidencia: ${hazard.evidence}`, `Normas: ${result.norms[index]?.normIds.map(normCode).join(', ') || 'revisar con especialista'}`,
        ...hazard.controls.map((control) => `- ${control}`), '',
      ]),
      `## Probabilidades`,
      `Nivel global: ${result.probabilities.nivel?.choice ?? '—'}`,
      `Riesgo grave e inminente: ${Math.round((result.probabilities.paralizacion?.noul ?? 0) * 100)} %`,
      `Observación probable de SUNAFIL: ${Math.round((result.probabilities.observacionSunafil?.noul ?? 0) * 100)} %`, '',
      `Limitaciones: ${result.vision.limitations ?? '—'}`, '', '_Diagnóstico preliminar generado con IA: debe validarlo un profesional en campo._',
    ]
  }
  const report = () => {
    if (!result) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([lines().join('\n')], { type: 'text/markdown' }))
    link.download = `diagnostico-ssoma-${Date.now()}.md`
    link.click()
  }

  return (
    <section className="ai-grid">
      <div className="ai-card">
        <label className="ai-camera">
          <input type="file" accept="image/*" capture="environment" onChange={async (event) => { const file = event.target.files?.[0]; if (file) setImage(await shrink(file)) }} />
          {image ? <img src={image} alt="Foto a diagnosticar" /> : <span><Camera size={36} aria-hidden="true" /> Tomar o subir foto</span>}
        </label>
        <label className="sign-field"><span>Área o actividad (opcional)</span><input value={area} onChange={(event) => setArea(event.target.value)} placeholder="Ej.: almacén de químicos, obra, oficina" /></label>
        <label className="sign-field"><span>Nota del inspector (opcional)</span><input value={note} onChange={(event) => setNote(event.target.value)} placeholder="Ej.: trabajo en altura sin línea de vida" /></label>
        <button type="button" className="btn-primary" disabled={!image || busy} onClick={run}>
          {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? 'Analizando…' : 'Diagnosticar'}
        </button>
        <p className="ai-mobile-tip"><Smartphone size={15} aria-hidden="true" /> Funciona mejor desde el celular: la cámara se abre sola. Tome la foto con buena luz y a 2–4 m del área.</p>
        {isAdmin && <p className="ssoma-count">Administrador · visor: {modelLabel}; probabilidades: {settings?.jev ? 'Jev (o motor local sin llave)' : 'motor local'}.</p>}
        {error && <p className="form-note error">{error}</p>}
      </div>

      {result && (
        <div className="ai-card ai-result">
          <div className="ai-result-head">
            <h2>{result.vision.scene}</h2>
            <span className="issued-actions">
              <button type="button" className="btn-ghost small" onClick={report}><Download size={15} /> .md</button>
              <button type="button" className="btn-primary small" onClick={() => onReport(lines().join('\n'))}><FileText size={15} /> Redactar informe con IA</button>
            </span>
          </div>
          <div className="ai-probs">
            <div><b>{result.probabilities.nivel?.choice ?? '—'}</b><span>nivel global</span></div>
            <div><b>{Math.round((result.probabilities.paralizacion?.noul ?? 0) * 100)} %</b><span>riesgo grave e inminente</span></div>
            <div><b>{Math.round((result.probabilities.observacionSunafil?.noul ?? 0) * 100)} %</b><span>observación SUNAFIL</span></div>
          </div>
          {isAdmin && result.ms !== undefined && <p className="ssoma-count">Administrador · motor: {result.probabilities.motor === 'jev' ? 'Jev' : 'local'} · {(result.ms / 1000).toFixed(1)} s{result.probabilities.aviso ? ` · ${result.probabilities.aviso}` : ''}</p>}
          {result.vision.hazards.map((hazard, index) => {
            const score = hazard.severity * hazard.probability
            const risk = SSOMA_RISKS.find((item) => item.id === hazard.riskId)
            return (
              <details key={index} className={`ai-hazard lvl-${LEVEL(score).toLowerCase()}`} open={index === 0}>
                <summary><ShieldAlert size={16} aria-hidden="true" /> <b>{hazard.name}</b> <em>{LEVEL(score)} · P{hazard.probability} × S{hazard.severity}</em></summary>
                <p><b>Qué se ve:</b> {hazard.evidence}</p>
                {risk && <p><b>Riesgo del catálogo:</b> {risk.name}</p>}
                <p><b>Normas:</b> {result.norms[index]?.normIds.length ? result.norms[index].normIds.map(normCode).join(' · ') : 'No vinculada al catálogo: revisar con especialista.'}</p>
                {hazard.controls.length > 0 && <ol>{hazard.controls.map((control) => <li key={control}>{control}</li>)}</ol>}
              </details>
            )
          })}
          {result.vision.positives && result.vision.positives.length > 0 && <p className="ssoma-count"><b>Buenas prácticas visibles:</b> {result.vision.positives.join('; ')}</p>}
          {result.vision.limitations && <p className="ssoma-count"><b>Limitaciones:</b> {result.vision.limitations}</p>}
          <p className="site-disclaimer">Diagnóstico preliminar generado con IA a partir de una sola imagen. No reemplaza el IPERC ni la inspección en campo por un profesional.</p>
        </div>
      )}
    </section>
  )
}

function KeysPanel({ providers, onChange }: { providers: ProviderInfo[]; onChange: () => void }) {
  const [drafts, setDrafts] = useState<Record<string, string>>({})
  const [tests, setTests] = useState<Record<string, string>>({})
  const save = async (id: string) => {
    try {
      await call(`/keys/${id}`, { method: 'PUT', body: JSON.stringify({ key: drafts[id] }) })
      setDrafts((prev) => ({ ...prev, [id]: '' }))
      onChange()
    } catch (error) {
      setTests((prev) => ({ ...prev, [id]: error instanceof Error ? error.message : 'Error' }))
    }
  }
  const remove = async (id: string) => {
    await call(`/keys/${id}`, { method: 'DELETE' }).catch(() => undefined)
    onChange()
  }
  const test = async (id: string) => {
    setTests((prev) => ({ ...prev, [id]: 'Probando…' }))
    const data = await call<{ ok: boolean; reply?: string; error?: string; ms?: number }>(`/test/${id}`, { method: 'POST' }).catch((error: Error) => ({ ok: false, error: error.message } as { ok: boolean; reply?: string; error?: string; ms?: number }))
    setTests((prev) => ({ ...prev, [id]: data.ok ? `✓ ${data.reply ?? 'OK'}${'ms' in data && data.ms ? ` (${data.ms} ms)` : ''}` : `✗ ${data.error}` }))
  }
  return (
    <section className="ai-keys">
      <p className="ssoma-count">Las llaves se guardan cifradas (AES-GCM) en el servidor y nunca vuelven al navegador: solo se muestra una pista.</p>
      {providers.map((provider) => (
        <article className="ai-card ai-key" key={provider.id}>
          <div className="ai-key-head">
            {provider.configured ? <CheckCircle2 size={18} className="ok" /> : <XCircle size={18} className="off" />}
            <b>{provider.name}</b>
            {provider.hint && <code>{provider.hint}</code>}
            <a href={provider.keyUrl} target="_blank" rel="noopener noreferrer">obtener llave</a>
          </div>
          <p className="ssoma-count">{provider.note} Modelos: {provider.models.map((model) => `${model.label} (${model.cost})`).join(', ')}.</p>
          {provider.kind !== 'cloudflare' && (
            <div className="ai-key-row">
              <KeyRound size={16} aria-hidden="true" />
              <input type="password" autoComplete="off" value={drafts[provider.id] ?? ''} placeholder={provider.configured ? 'Reemplazar llave' : 'Pegue la llave de API'} onChange={(event) => setDrafts((prev) => ({ ...prev, [provider.id]: event.target.value }))} />
              <button type="button" className="btn-primary small" disabled={!drafts[provider.id]} onClick={() => save(provider.id)}>Guardar</button>
              {provider.configured && <button type="button" className="btn-ghost small" aria-label="Eliminar llave" onClick={() => remove(provider.id)}><Trash2 size={15} /></button>}
            </div>
          )}
          {provider.configured && <button type="button" className="btn-ghost small" onClick={() => test(provider.id)}>Probar conexión</button>}
          {tests[provider.id] && <p className="ssoma-count">{tests[provider.id]}</p>}
        </article>
      ))}
    </section>
  )
}

function ModelsPanel({ providers, settings, onSaved }: { providers: ProviderInfo[]; settings: Settings; onSaved: (settings: Settings) => void }) {
  const [draft, setDraft] = useState<Settings>(settings)
  const [saved, setSaved] = useState('')
  const options = (vision: boolean) =>
    providers.filter((provider) => provider.configured && provider.kind !== 'jev').flatMap((provider) => provider.models.filter((model) => !vision || model.vision).map((model) => ({ provider, model })))
  const picker = (task: 'vision' | 'text', label: string) => (
    <label className="sign-field">
      <span>{label}</span>
      <select value={`${draft[task].provider}|${draft[task].model}`} onChange={(event) => { const [provider, model] = event.target.value.split('|'); setDraft((prev) => ({ ...prev, [task]: { provider, model } })) }}>
        {options(task === 'vision').map(({ provider, model }) => (
          <option key={provider.id + model.id} value={`${provider.id}|${model.id}`}>{provider.name} · {model.label} — {model.cost}</option>
        ))}
      </select>
    </label>
  )
  return (
    <section className="ai-card ai-models">
      <p className="ssoma-count">Solo aparecen proveedores con llave (Cloudflare no la necesita). Ordene por costo: «gratis» y «muy bajo» primero.</p>
      {picker('vision', 'Agente visor (lee la foto): requiere un modelo con visión')}
      {picker('text', 'Agente redactor (informes y texto)')}
      <label className="sign-check"><input type="checkbox" checked={draft.jev} onChange={(event) => setDraft((prev) => ({ ...prev, jev: event.target.checked }))} /> Usar Jev para las probabilidades (sin llave usa el motor local)</label>
      <label className="sign-field"><span>Modelo personalizado para visión (opcional, si el proveedor lanzó uno nuevo)</span>
        <input placeholder="proveedor|id-del-modelo, p. ej. openrouter|qwen/qwen3-vl" onBlur={(event) => { const [provider, model] = event.target.value.split('|'); if (provider && model) setDraft((prev) => ({ ...prev, vision: { provider: provider.trim(), model: model.trim() } })) }} />
      </label>
      <button type="button" className="btn-primary" onClick={async () => { const data = await call<{ settings: Settings }>('/settings', { method: 'PUT', body: JSON.stringify(draft) }); onSaved(data.settings); setDraft(data.settings); setSaved('Guardado.') }}>Guardar selección</button>
      {saved && <p className="ssoma-count">{saved}</p>}
    </section>
  )
}

const TASK_LABEL: Record<string, string> = { 'diagnostico-foto': 'Diagnóstico por foto', informe: 'Informe', alerta: 'Alerta explicada', consulta: 'Consulta' }

function RunsPanel({ isAdmin }: { isAdmin: boolean }) {
  const [runs, setRuns] = useState<Array<{ task?: string; provider?: string; model?: string; ok: number; ms?: number; summary: string; created_at: string }>>([])
  useEffect(() => { call<{ runs: typeof runs }>('~/runs').then((data) => setRuns(data.runs)).catch(() => undefined) }, [])
  return (
    <section className="ai-card">
      {runs.length === 0 && <p className="empty-note">Aún no hay consultas.</p>}
      <ul className="ai-runs">
        {runs.map((run) => (
          <li key={run.created_at}>{run.ok ? '✓' : '✗'} <b>{TASK_LABEL[run.task ?? ''] ?? 'Consulta'}</b> · {new Date(run.created_at).toLocaleString('es-PE')}{isAdmin && run.provider ? ` · ${run.provider}/${run.model} · ${((run.ms ?? 0) / 1000).toFixed(1)} s` : ''}<br /><small>{run.summary}</small></li>
        ))}
      </ul>
    </section>
  )
}

interface ReportType { id: string; label: string; outline: string; norms: string }

const REPORT_EXAMPLES: Record<string, string> = {
  'informe-inspeccion': 'Inspección del almacén principal: pasillos obstruidos con cajas, extintor sin señalizar, dos operarios sin calzado de seguridad y un tablero eléctrico sin tapa.',
  'investigacion-incidente': 'Operario de 34 años se cortó la mano izquierda al limpiar una cortadora sin bloquear la energía; descanso médico de 3 días.',
  ats: 'Cambio de luminarias a 4 m de altura con escalera de tijera en la nave de producción, 2 electricistas.',
  pets: 'Trasvase de ácido sulfúrico al 98 % desde cilindro de 200 L a envases de 20 L en el laboratorio.',
  'charla-5min': 'Manipulación manual de cargas para operarios de almacén que levantan cajas de 25 kg.',
  'acta-comite': 'Sesión ordinaria de noviembre: revisión de 3 accidentes leves, avance del programa anual y compra de arneses.',
  'plan-accion': 'Hallazgos de la auditoría interna: falta de IPERC actualizado, exámenes médicos vencidos y capacitaciones incompletas.',
  'programa-capacitacion': 'Empresa de servicios de limpieza con 60 trabajadores en 3 sedes; riesgos principales: químicos, caídas al mismo nivel y ergonomía.',
  'informe-ambiental': 'Planta de alimentos que genera cartón, plásticos, residuos orgánicos y aceites usados; 2 t al mes.',
}

function downloadBlob(content: BlobPart, type: string, name: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type }))
  link.download = name
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 2000)
}

function ReportsPanel({ diagnosis, onUpgrade }: { diagnosis: string; onUpgrade: (message: string) => void }) {
  const [types, setTypes] = useState<ReportType[]>([])
  const [type, setType] = useState(diagnosis ? 'informe-inspeccion' : '')
  const [company, setCompany] = useState('')
  const [context, setContext] = useState(diagnosis ? 'Inspección a partir de la foto analizada.' : '')
  const [useDiagnosis, setUseDiagnosis] = useState(Boolean(diagnosis))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [markdown, setMarkdown] = useState('')
  useEffect(() => {
    call<{ reportTypes: ReportType[] }>('~/catalog').then((data) => { setTypes(data.reportTypes); setType((prev) => prev || data.reportTypes[0]?.id || '') }).catch(() => undefined)
  }, [])
  const current = types.find((item) => item.id === type)
  const sections = current ? current.outline.split(';').map((part) => part.trim()).filter(Boolean) : []
  const html = useMemo(() => (markdown ? markdownToHtml(markdown) : ''), [markdown])

  const generate = async () => {
    setBusy(true)
    setError('')
    try {
      const data = await call<{ markdown: string }>('~/report', { method: 'POST', body: JSON.stringify({ type, company, context, diagnosis: useDiagnosis ? diagnosis : undefined }) })
      setMarkdown(data.markdown)
    } catch (failure) {
      if (failure instanceof AiError && failure.upgrade) onUpgrade(failure.message)
      else setError(failure instanceof Error ? failure.message : 'Error')
    } finally {
      setBusy(false)
    }
  }
  const fileName = `${type}-${new Date().toISOString().slice(0, 10)}`
  const wordHtml = () => `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word"><head><meta charset="utf-8"><title>${current?.label ?? 'Documento'}</title><style>body{font-family:Calibri,Arial;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #888;padding:4px 6px}h1,h2{color:#0b3d6e}</style></head><body>${html}</body></html>`
  const print = () => {
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(wordHtml().replace('</head>', '<style>@page{margin:18mm}</style></head>'))
    win.document.close()
    win.focus()
    win.print()
  }

  return (
    <section className="rep-studio">
      <div className="rep-picker" role="radiogroup" aria-label="Formato">
        {types.map((item) => (
          <button key={item.id} type="button" role="radio" aria-checked={type === item.id} className={`rep-type ${type === item.id ? 'on' : ''}`} onClick={() => { setType(item.id); setMarkdown('') }}>
            <FileText size={16} aria-hidden="true" /> {item.label}
          </button>
        ))}
      </div>
      <div className="rep-grid">
        <div className="ai-card rep-form">
          <h2>1. Describa el caso</h2>
          <p className="ssoma-count">Una o dos frases bastan: la plantilla se completa sola con la estructura de la norma.</p>
          <textarea rows={5} value={context} onChange={(event) => setContext(event.target.value)} maxLength={3000} placeholder={REPORT_EXAMPLES[type] ?? 'Qué pasó o qué se hará, dónde y quiénes participan…'} />
          <button type="button" className="btn-ghost small" onClick={() => setContext(REPORT_EXAMPLES[type] ?? '')}><Sparkles size={14} aria-hidden="true" /> Usar un ejemplo</button>
          <input value={company} onChange={(event) => setCompany(event.target.value)} maxLength={160} placeholder="Empresa (opcional)" />
          {diagnosis && <label className="sign-check"><input type="checkbox" checked={useDiagnosis} onChange={(event) => setUseDiagnosis(event.target.checked)} /> Incluir el diagnóstico por foto como evidencia</label>}
          <button type="button" className="btn-primary" disabled={busy || !type || context.trim().length < 15} onClick={generate}>
            {busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? 'Redactando su documento…' : '2. Generar documento completo'}
          </button>
          {error && <p className="form-note error">{error}</p>}
          {current && <p className="ssoma-count"><b>Base normativa:</b> {current.norms}</p>}
        </div>
        <div className={`ai-card rep-sheet ${markdown ? 'done' : ''} ${busy ? 'busy' : ''}`}>
          <div className="rep-sheet-head">
            <b>{current?.label ?? 'Plantilla'}</b>
            {markdown && (
              <span className="issued-actions">
                <button type="button" className="btn-primary small" onClick={() => downloadBlob(wordHtml(), 'application/msword', `${fileName}.doc`)}><Download size={14} /> Word</button>
                <button type="button" className="btn-secondary small" onClick={print}><Download size={14} /> PDF</button>
                <button type="button" className="btn-ghost small" onClick={() => downloadBlob(markdown, 'text/markdown', `${fileName}.md`)}>.md</button>
              </span>
            )}
          </div>
          {markdown ? (
            <div className="rep-doc doc-body" dangerouslySetInnerHTML={{ __html: html }} />
          ) : (
            <ol className="rep-skeleton">
              {sections.map((section, index) => (
                <li key={section} style={{ '--i': index } as React.CSSProperties}>
                  <b>{section}</b>
                  <span /><span />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  )
}

interface Source { ref: string; kind: string; title: string; detail: string; href: string }

const CONSULT_EXAMPLES = [
  '¿Cada cuánto debo hacer los exámenes médicos ocupacionales?',
  '¿Cuándo necesito un Comité de SST y cuándo basta un supervisor?',
  '¿Qué debo hacer en las primeras 24 horas tras un accidente mortal?',
  '¿Qué colores de contenedores exige la norma para residuos?',
  '¿Qué señal debo poner en un almacén de inflamables?',
]

/** Convierte las citas [F1] de la respuesta en enlaces a las fichas internas del Observatorio. */
function linkCitations(html: string, sources: Source[]): string {
  return html.replace(/\[(F\d{1,2})\]/g, (match, ref: string) => {
    const source = sources.find((item) => item.ref === ref)
    return source ? `<a class="cite" href="${source.href}" title="${source.title.replace(/"/g, '&quot;')}">${ref}</a>` : match
  })
}

function ConsultPanel({ onUpgrade }: { onUpgrade: (message: string) => void }) {
  const [question, setQuestion] = useState(() => hashParam('q') ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ question: string; answer: string; sources: Source[] } | null>(null)
  const [preview, setPreview] = useState<Source[]>([])

  useEffect(() => {
    const q = question.trim()
    if (q.length < 4) { setPreview([]); return }
    const timer = setTimeout(() => {
      call<{ sources: Source[] }>(`~/search?q=${encodeURIComponent(q)}`).then((data) => setPreview(data.sources)).catch(() => undefined)
    }, 350)
    return () => clearTimeout(timer)
  }, [question])

  const ask = async (event?: React.FormEvent) => {
    event?.preventDefault()
    setBusy(true)
    setError('')
    try {
      const data = await call<{ answer: string; sources: Source[] }>('~/consult', { method: 'POST', body: JSON.stringify({ question }) })
      setResult({ question, answer: data.answer, sources: data.sources })
    } catch (failure) {
      if (failure instanceof AiError && failure.upgrade) onUpgrade(failure.message)
      else setError(failure instanceof Error ? failure.message : 'Error')
    } finally {
      setBusy(false)
    }
  }
  const sources = result?.sources ?? preview
  const answerHtml = useMemo(() => (result ? linkCitations(markdownToHtml(result.answer), result.sources) : ''), [result])

  return (
    <section className="consult">
      <form className="ai-card consult-box" onSubmit={ask}>
        <h2><MessagesSquare size={19} aria-hidden="true" /> Consultor SSOMA</h2>
        <p className="ssoma-count">Haga su consulta técnica. La respuesta se basa en las normas y fichas del Observatorio y le lleva directo a cada una.</p>
        <textarea rows={3} value={question} onChange={(event) => setQuestion(event.target.value)} maxLength={1200} placeholder="Ej.: ¿Qué EPP necesita un soldador y qué norma lo exige?" />
        <div className="consult-examples">{CONSULT_EXAMPLES.map((example) => <button key={example} type="button" onClick={() => setQuestion(example)}>{example}</button>)}</div>
        <button type="submit" className="btn-primary" disabled={busy || question.trim().length < 8}>{busy ? <Loader2 size={16} className="spin" /> : <Sparkles size={16} />} {busy ? 'Consultando…' : 'Consultar'}</button>
        {error && <p className="form-note error">{error}</p>}
      </form>
      <div className="consult-grid">
        {result && (
          <article className="ai-card consult-answer">
            <p className="consult-q">{result.question}</p>
            <div className="doc-body" dangerouslySetInnerHTML={{ __html: answerHtml }} />
            <p className="site-disclaimer">Respuesta orientativa. Verifique el texto vigente en la fuente oficial antes de decidir.</p>
          </article>
        )}
        {sources.length > 0 && (
          <aside className="ai-card consult-sources">
            <h3>{result ? 'Fuentes y accesos directos' : 'Encontrado en el Observatorio'}</h3>
            <ul>
              {sources.map((source) => (
                <li key={source.ref + source.href}>
                  <a href={source.href}>
                    <span className="role-chip">{result ? `${source.ref} · ` : ''}{source.kind}</span>
                    <b>{source.title}</b>
                    <small>{source.detail.length > 140 ? `${source.detail.slice(0, 140)}…` : source.detail}</small>
                  </a>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </section>
  )
}

interface Alert { id: number; url: string; source: string; scope: string; title: string; summary: string | null; published: string | null; tags: string | null; ai_summary: string | null }
interface AlertRun { source: string; ok: number; found: number; kept: number; error: string | null; ran_at: string }

function AlertsPanel({ isAdmin, onUpgrade }: { isAdmin: boolean; onUpgrade: (message: string) => void }) {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [runs, setRuns] = useState<AlertRun[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [scope, setScope] = useState('')
  const [tag, setTag] = useState('')
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState(false)
  const [openId, setOpenId] = useState<number | null>(() => Number(hashParam('id')) || null)
  const [summaries, setSummaries] = useState<Record<number, string>>({})
  const [loading, setLoading] = useState<number | null>(null)

  const load = useCallback(() => {
    const params = new URLSearchParams()
    if (scope) params.set('scope', scope)
    if (tag) params.set('tag', tag)
    if (q.trim()) params.set('q', q.trim())
    call<{ alerts: Alert[]; runs: AlertRun[]; tags: string[] }>(`~/alerts?${params}`).then((data) => { setAlerts(data.alerts); setRuns(data.runs); setTags(data.tags) }).catch(() => undefined)
  }, [scope, tag, q])
  useEffect(() => { const timer = setTimeout(load, 250); return () => clearTimeout(timer) }, [load])

  const explain = async (id: number) => {
    setOpenId(id)
    setLoading(id)
    try {
      const data = await call<{ summary: string }>(`~/alerts/${id}/summary`, { method: 'POST' })
      setSummaries((prev) => ({ ...prev, [id]: data.summary }))
    } catch (failure) {
      if (failure instanceof AiError && failure.upgrade) onUpgrade(failure.message)
      else setSummaries((prev) => ({ ...prev, [id]: failure instanceof Error ? failure.message : 'Error' }))
    } finally {
      setLoading(null)
    }
  }
  const weekAgo = Date.now() - 7 * 86_400_000

  return (
    <section className="ai-alerts">
      <div className="alert-hero">
        <Bell size={22} aria-hidden="true" />
        <div>
          <b>Radar normativo diario</b>
          <small>Cada mañana revisamos MTPE, SUNAFIL, MINAM, MINSA, MINEM, OEFA, PRODUCE y EU-OSHA, y guardamos solo lo que toca seguridad, salud y ambiente.</small>
        </div>
        {isAdmin && (
          <button type="button" className="btn-secondary small" disabled={busy} onClick={async () => { setBusy(true); await api.adminRefreshAlerts().catch(() => undefined); setBusy(false); load() }}>
            <RefreshCw size={14} className={busy ? 'spin' : ''} /> Actualizar ahora
          </button>
        )}
      </div>
      <div className="alert-filters">
        <div className="tab-switch">
          {[['', 'Todas'], ['peru', 'Perú'], ['internacional', 'Internacional']].map(([id, label]) => (
            <button key={id} type="button" className={scope === id ? 'active' : ''} onClick={() => setScope(id)}>{label}</button>
          ))}
        </div>
        <div className="alert-tags">
          <button type="button" className={tag === '' ? 'on' : ''} onClick={() => setTag('')}>Todos los temas</button>
          {tags.map((item) => <button key={item} type="button" className={tag === item ? 'on' : ''} onClick={() => setTag(item)}>{item}</button>)}
        </div>
        <input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar en alertas…" />
      </div>
      {alerts.length === 0 && <p className="empty-note">Aún no hay alertas con este filtro. {isAdmin ? 'Pulse «Actualizar ahora» para la primera recolección.' : 'La revisión diaria las irá agregando.'}</p>}
      <div className="alert-list">
        {alerts.map((alert) => {
          const summary = summaries[alert.id] ?? (alert.ai_summary && alert.ai_summary.length > 450 ? alert.ai_summary : null)
          const isNew = alert.published && new Date(alert.published).getTime() > weekAgo
          return (
            <article key={alert.id} className={`alert-card scope-${alert.scope} ${openId === alert.id ? 'open' : ''}`}>
              <header>
                <span className="role-chip">{alert.source}</span>
                {isNew && <em className="ph-badge blink">Nuevo</em>}
                <time>{alert.published ? new Date(alert.published).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }) : ''}</time>
              </header>
              <h3>{alert.title}</h3>
              {alert.summary && <p>{alert.summary.length > 220 ? `${alert.summary.slice(0, 220)}…` : alert.summary}</p>}
              <div className="guide-norms">{(alert.tags ?? '').split(',').filter(Boolean).map((item) => <span key={item}>{item}</span>)}</div>
              {loading === alert.id && <div className="alert-ai loading"><Loader2 size={16} className="spin" /> Preparando la explicación…</div>}
              {summary && openId === alert.id && <div className="alert-ai doc-body" dangerouslySetInnerHTML={{ __html: markdownToHtml(summary) }} />}
              <footer className="issued-actions">
                {summary ? (
                  <button type="button" className="btn-secondary small" onClick={() => setOpenId(openId === alert.id ? null : alert.id)}>{openId === alert.id ? 'Ocultar explicación' : 'Ver explicación'}</button>
                ) : (
                  <button type="button" className="btn-primary small" disabled={loading !== null} onClick={() => explain(alert.id)}><Sparkles size={14} /> Explicar con IA</button>
                )}
                <a className="btn-ghost small" href={alert.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Fuente oficial</a>
              </footer>
            </article>
          )
        })}
      </div>
      {isAdmin && runs.length > 0 && (
        <details className="collapsible">
          <summary>Estado de las fuentes (solo administrador)</summary>
          <ul className="ai-runs">{runs.map((run) => <li key={run.source}>{run.ok ? '✓' : '✗'} {run.source}: {run.kept} de {run.found} · {new Date(run.ran_at).toLocaleString('es-PE')} {run.error ?? ''}</li>)}</ul>
        </details>
      )}
    </section>
  )
}
