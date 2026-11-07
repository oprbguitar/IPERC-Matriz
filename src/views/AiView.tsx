import { useEffect, useMemo, useState } from 'react'
import { Camera, CheckCircle2, Download, KeyRound, Loader2, ShieldAlert, Sparkles, Trash2, XCircle } from 'lucide-react'
import { SSOMA_NORMS, SSOMA_RISKS } from '../data/ssoma'
import type { ApiUser } from '../lib/api'
import '../styles/ai.css'

interface ModelInfo { id: string; label: string; vision: boolean; cost: string }
interface ProviderInfo { id: string; name: string; kind: string; keyUrl: string; note: string; models: ModelInfo[]; configured: boolean; hint: string | null; updatedAt: string | null }
interface Target { provider: string; model: string }
interface Settings { vision: Target; text: Target; jev: boolean }
interface Hazard { riskId: string | null; name: string; evidence: string; severity: number; probability: number; controls: string[] }
interface Diagnosis {
  vision: { scene: string; hazards: Hazard[]; positives?: string[]; limitations?: string }
  norms: Array<{ name: string; normIds: string[] }>
  probabilities: { motor: 'jev' | 'local'; aviso?: string; nivel?: { choice?: string; probabilities?: Record<string, number> }; paralizacion?: { noul?: number }; observacionSunafil?: { noul?: number } }
  model: Target
  ms: number
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`/api/admin/ai${path}`, { credentials: 'same-origin', ...init, headers: init.body ? { 'Content-Type': 'application/json' } : undefined })
  const data = (await response.json().catch(() => ({}))) as T & { error?: string }
  if (!response.ok) throw new Error(data.error ?? `Error ${response.status}`)
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

type Tab = 'diagnostico' | 'llaves' | 'modelos' | 'historial'

export default function AiView({ user }: { user: ApiUser | null }) {
  const [tab, setTab] = useState<Tab>('diagnostico')
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
  useEffect(() => {
    if (user?.role === 'admin') reload()
  }, [user])

  if (!user) return <div className="view-page"><p className="notice-block">Inicie sesión en <b>Premium</b> con una cuenta de administrador para usar el sistema de IA.</p></div>
  if (user.role !== 'admin') return <div className="view-page"><p className="notice-block">El sistema de IA está reservado a administradores.</p></div>

  return (
    <div className="view-page ai-view">
      <header className="page-head">
        <div>
          <h1>IA: diagnóstico y agentes</h1>
          <p>Tome una foto del área de trabajo y obtenga un diagnóstico preliminar: peligros, nivel de riesgo, normas y probabilidades. Usted elige proveedor y modelo.</p>
        </div>
      </header>
      {status && !status.secretReady && <p className="notice-block">Falta el secreto <code>AI_KEY_SECRET</code> en el Worker: no se pueden guardar llaves (Cloudflare Workers AI funciona igual).</p>}
      {message && <p className="form-note error">{message}</p>}

      <div className="tab-switch" role="tablist">
        {([['diagnostico', 'Diagnóstico por foto'], ['llaves', 'Llaves de API'], ['modelos', 'Modelos por tarea'], ['historial', 'Historial']] as Array<[Tab, string]>).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>

      {tab === 'diagnostico' && <DiagnosisPanel settings={settings} providers={providers} />}
      {tab === 'llaves' && <KeysPanel providers={providers} onChange={reload} />}
      {tab === 'modelos' && settings && <ModelsPanel providers={providers} settings={settings} onSaved={setSettings} />}
      {tab === 'historial' && <RunsPanel />}
    </div>
  )
}

function DiagnosisPanel({ settings, providers }: { settings: Settings | null; providers: ProviderInfo[] }) {
  const [image, setImage] = useState<string | null>(null)
  const [area, setArea] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Diagnosis | null>(null)
  const modelLabel = useMemo(() => {
    const provider = providers.find((item) => item.id === settings?.vision.provider)
    return provider ? `${provider.name} · ${provider.models.find((model) => model.id === settings?.vision.model)?.label ?? settings?.vision.model}` : '…'
  }, [providers, settings])

  const run = async () => {
    if (!image) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      setResult(await call<Diagnosis>('/diagnose', { method: 'POST', body: JSON.stringify({ image, area, note }) }))
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Error')
    } finally {
      setBusy(false)
    }
  }

  const report = () => {
    if (!result) return
    const lines = [
      `# Diagnóstico preliminar SSOMA`, '', `Fecha: ${new Date().toLocaleString('es-PE')}`, `Área: ${area || '—'}`, `Modelo: ${result.model.provider} / ${result.model.model}`, '',
      `## Escena`, result.vision.scene, '', `## Peligros`,
      ...result.vision.hazards.flatMap((hazard, index) => [
        `### ${index + 1}. ${hazard.name} — ${LEVEL(hazard.severity * hazard.probability)} (P${hazard.probability} × S${hazard.severity})`,
        `Evidencia: ${hazard.evidence}`, `Normas: ${result.norms[index]?.normIds.map(normCode).join(', ') || 'revisar con especialista'}`,
        ...hazard.controls.map((control) => `- ${control}`), '',
      ]),
      `## Probabilidades (${result.probabilities.motor === 'jev' ? 'Jev' : 'motor local'})`,
      `Nivel global: ${result.probabilities.nivel?.choice ?? '—'}`,
      `Riesgo grave e inminente: ${Math.round((result.probabilities.paralizacion?.noul ?? 0) * 100)} %`,
      `Observación probable de SUNAFIL: ${Math.round((result.probabilities.observacionSunafil?.noul ?? 0) * 100)} %`, '',
      `Limitaciones: ${result.vision.limitations ?? '—'}`, '', '_Diagnóstico preliminar generado con IA: debe validarlo un profesional en campo._',
    ]
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/markdown' }))
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
        <p className="ssoma-count">Agente visor: {modelLabel}. Agente normativo: catálogo interno. Agente probabilístico: {settings?.jev ? 'Jev (o motor local sin llave)' : 'motor local'}.</p>
        {error && <p className="form-note error">{error}</p>}
      </div>

      {result && (
        <div className="ai-card ai-result">
          <div className="ai-result-head">
            <h2>{result.vision.scene}</h2>
            <button type="button" className="btn-ghost small" onClick={report}><Download size={15} /> Informe</button>
          </div>
          <div className="ai-probs">
            <div><b>{result.probabilities.nivel?.choice ?? '—'}</b><span>nivel global</span></div>
            <div><b>{Math.round((result.probabilities.paralizacion?.noul ?? 0) * 100)} %</b><span>riesgo grave e inminente</span></div>
            <div><b>{Math.round((result.probabilities.observacionSunafil?.noul ?? 0) * 100)} %</b><span>observación SUNAFIL</span></div>
          </div>
          <p className="ssoma-count">Motor de probabilidad: {result.probabilities.motor === 'jev' ? 'Jev (TypeSafe AI)' : 'local (reglas transparentes)'} · {(result.ms / 1000).toFixed(1)} s{result.probabilities.aviso ? ` · ${result.probabilities.aviso}` : ''}</p>
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

function RunsPanel() {
  const [runs, setRuns] = useState<Array<{ provider: string; model: string; ok: number; ms: number; summary: string; created_at: string }>>([])
  useEffect(() => { call<{ runs: typeof runs }>('/runs').then((data) => setRuns(data.runs)).catch(() => undefined) }, [])
  return (
    <section className="ai-card">
      {runs.length === 0 && <p className="empty-note">Aún no hay diagnósticos.</p>}
      <ul className="ai-runs">
        {runs.map((run) => (
          <li key={run.created_at}>{run.ok ? '✓' : '✗'} <b>{new Date(run.created_at).toLocaleString('es-PE')}</b> · {run.provider}/{run.model} · {(run.ms / 1000).toFixed(1)} s<br /><small>{run.summary}</small></li>
        ))}
      </ul>
    </section>
  )
}
