import {
  BadgeCheck,
  Bot,
  CheckCircle2,
  Circle,
  CircleDashed,
  Clock,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { DocReader } from '../components/DocReader'
import { PREMIUM_ITEM_COUNT, PREMIUM_PLAN } from '../data/premiumPlan'
import {
  api,
  ApiError,
  type AccessRequest,
  type ApiUser,
  type PremiumGuideSummary,
  type ProgressStatus,
} from '../lib/api'

interface PremiumViewProps {
  user: ApiUser | null
  authReady: boolean
  offline: boolean
  onUserChange: (user: ApiUser | null) => void
  onPercentChange?: (percent: number) => void
}

const STATUS_CYCLE: Record<ProgressStatus, ProgressStatus> = { pendiente: 'en-curso', 'en-curso': 'hecho', hecho: 'pendiente' }
const STATUS_LABEL: Record<ProgressStatus, string> = { pendiente: 'Pendiente', 'en-curso': 'En curso', hecho: 'Hecho' }

const LOCKED_PREVIEW = [
  'Cómo aplicar inteligencia artificial en SST y SSOMA',
  'Diseña un sistema de agentes de IA para tu área SST',
  'Herramientas open source y de pago para gestionar SST',
  'Seguimiento constante: indicadores, alertas y tableros',
  'Biblioteca de prompts listos para SST',
  'Gobernanza, datos personales y uso responsable de IA',
]

export function computePercent(statuses: Record<string, ProgressStatus>): number {
  const score = Object.values(statuses).reduce((sum, status) => sum + (status === 'hecho' ? 1 : status === 'en-curso' ? 0.5 : 0), 0)
  return Math.round((score / PREMIUM_ITEM_COUNT) * 100)
}

export function PremiumView({ user, authReady, offline, onUserChange, onPercentChange }: PremiumViewProps) {
  if (!authReady) return <div className="view-page"><p className="empty-note">Conectando con el Observatorio…</p></div>
  return (
    <div className="view-page premium">
      {user ? <PremiumDashboard user={user} onUserChange={onUserChange} onPercentChange={onPercentChange} /> : <PremiumGate offline={offline} onUserChange={onUserChange} />}
    </div>
  )
}

function PremiumGate({ offline, onUserChange }: { offline: boolean; onUserChange: (user: ApiUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [request, setRequest] = useState({ name: '', email: '', organization: '', message: '', website: '' })
  const [requestState, setRequestState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [requestMsg, setRequestMsg] = useState('')

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const { user } = await api.login(email, password)
      onUserChange(user)
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No se pudo iniciar sesión.')
    } finally {
      setBusy(false)
    }
  }

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault()
    try {
      await api.requestAccess(request)
      setRequestState('sent')
      setRequestMsg('Solicitud registrada. El administrador le enviará sus credenciales.')
    } catch (caught) {
      setRequestState('error')
      setRequestMsg(caught instanceof ApiError ? caught.message : 'No se pudo enviar la solicitud.')
    }
  }

  return (
    <>
      <header className="premium-hero">
        <div>
          <span className="eyebrow light"><Sparkles size={15} aria-hidden="true" /> Observatorio Premium</span>
          <h1>IA, agentes y seguimiento continuo para tu SGSST</h1>
          <p>
            Guías avanzadas para aplicar inteligencia artificial en SST, diseñar un sistema de agentes que atienda solicitudes,
            elegir herramientas open source o de pago y medir tu avance con un porcentaje visible en la plataforma.
          </p>
          <ul className="premium-perks">
            <li><Bot size={16} aria-hidden="true" /> 6 guías premium descargables</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Plan de {PREMIUM_ITEM_COUNT} hitos con % de avance guardado en la nube</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> Acceso personal con correo y clave</li>
          </ul>
        </div>
        <form className="login-card" onSubmit={submitLogin}>
          <h2><Lock size={18} aria-hidden="true" /> Ingresar</h2>
          {offline && (
            <p className="form-note warn">
              Este despliegue no tiene servidor. Ingrese desde <a href="https://sst.andesnova.solutions/">sst.andesnova.solutions</a>.
            </p>
          )}
          <label>
            <span>Correo</span>
            <input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label>
            <span>Clave</span>
            <input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error && <p className="form-note error" role="alert">{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy || offline}>
            {busy ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>
      </header>

      <section className="locked-grid" aria-label="Contenido premium">
        {LOCKED_PREVIEW.map((title, index) => (
          <article key={title} className="locked-card" style={{ '--i': index } as React.CSSProperties}>
            <Lock size={16} aria-hidden="true" />
            <h3>{title}</h3>
          </article>
        ))}
      </section>

      <section className="panel request-panel" aria-labelledby="request-title">
        <h2 id="request-title"><UserPlus size={18} aria-hidden="true" /> Solicitar acceso para su equipo</h2>
        {requestState === 'sent' ? (
          <p className="form-note ok">{requestMsg}</p>
        ) : (
          <form className="request-form" onSubmit={submitRequest}>
            <input placeholder="Nombre" required value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} />
            <input type="email" placeholder="Correo" required value={request.email} onChange={(event) => setRequest({ ...request, email: event.target.value })} />
            <input placeholder="Empresa o institución" value={request.organization} onChange={(event) => setRequest({ ...request, organization: event.target.value })} />
            <input placeholder="¿Para qué lo usará?" value={request.message} onChange={(event) => setRequest({ ...request, message: event.target.value })} />
            <input className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={request.website} onChange={(event) => setRequest({ ...request, website: event.target.value })} />
            <button type="submit" className="btn-secondary" disabled={offline}>Enviar solicitud</button>
            {requestState === 'error' && <p className="form-note error">{requestMsg}</p>}
          </form>
        )}
      </section>
    </>
  )
}

function PremiumDashboard({
  user,
  onUserChange,
  onPercentChange,
}: {
  user: ApiUser
  onUserChange: (user: ApiUser | null) => void
  onPercentChange?: (percent: number) => void
}) {
  const [statuses, setStatuses] = useState<Record<string, ProgressStatus>>({})
  // Copia sincronica del estado: los clics rapidos no deben leer un valor viejo.
  const statusesRef = useRef(statuses)
  const [guides, setGuides] = useState<PremiumGuideSummary[]>([])
  const [reader, setReader] = useState<{ id: string; title: string; markdown: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    api.progress().then(({ items }) => setStatuses(Object.fromEntries(items.map((item) => [item.item_id, item.status])))).catch(() => undefined)
    api.guides().then(({ guides: list }) => setGuides(list)).catch(() => undefined)
  }, [])

  const percent = computePercent(statuses)

  useEffect(() => {
    statusesRef.current = statuses
    onPercentChange?.(percent)
  }, [statuses, percent, onPercentChange])
  const phasePercent = useCallback(
    (itemIds: string[]) =>
      Math.round(
        (itemIds.reduce((sum, id) => sum + (statuses[id] === 'hecho' ? 1 : statuses[id] === 'en-curso' ? 0.5 : 0), 0) / itemIds.length) * 100,
      ),
    [statuses],
  )

  async function toggle(itemId: string) {
    const next = STATUS_CYCLE[statusesRef.current[itemId] ?? 'pendiente']
    statusesRef.current = { ...statusesRef.current, [itemId]: next }
    setStatuses(statusesRef.current)
    setSaving(true)
    try {
      await api.saveProgress([{ item_id: itemId, status: next }])
    } catch {
      setMessage('No se pudo guardar el avance. Revise su conexión.')
    } finally {
      setSaving(false)
    }
  }

  async function openGuide(id: string) {
    try {
      const { guide } = await api.guide(id)
      setReader({ id: guide.id, title: guide.title, markdown: guide.body })
    } catch (caught) {
      setMessage(caught instanceof ApiError ? caught.message : 'No se pudo abrir la guía.')
    }
  }

  async function logout() {
    await api.logout().catch(() => undefined)
    onUserChange(null)
  }

  return (
    <>
      <header className="premium-head">
        <div>
          <span className="eyebrow"><Sparkles size={15} aria-hidden="true" /> Observatorio Premium</span>
          <h1>Hola, {user.name ?? user.email.split('@')[0]}</h1>
          <p>Marque cada hito: pendiente → en curso → hecho. Su avance se guarda en la nube y se refleja en el inicio.</p>
        </div>
        <div className="premium-user">
          <span><Mail size={14} aria-hidden="true" /> {user.email}</span>
          {user.role === 'admin' && <span className="role-chip">Administrador</span>}
          <button type="button" className="btn-secondary small" onClick={logout}><LogOut size={15} aria-hidden="true" /> Salir</button>
        </div>
      </header>

      {message && <p className="form-note warn" role="status">{message}</p>}

      <section className="progress-hub">
        <div className="big-ring" style={{ '--p': percent } as React.CSSProperties} role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Avance total del plan">
          <svg viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r="52" className="ring-bg" />
            <circle cx="60" cy="60" r="52" className="ring-fg" strokeDasharray={`${(percent / 100) * 326.7} 326.7`} />
          </svg>
          <span><b>{percent}%</b><small>{saving ? 'Guardando…' : 'avance total'}</small></span>
        </div>
        <div className="phase-bars">
          {PREMIUM_PLAN.map((phase) => {
            const value = phasePercent(phase.items.map((item) => item.id))
            return (
              <div key={phase.id} className="phase-bar" style={{ '--phase': phase.color } as React.CSSProperties}>
                <span>{phase.title}</span>
                <div><i style={{ width: `${value}%` }} /></div>
                <b>{value}%</b>
              </div>
            )
          })}
        </div>
      </section>

      <section className="phase-grid" aria-label="Hitos del plan">
        {PREMIUM_PLAN.map((phase) => (
          <article key={phase.id} className="phase-card" style={{ '--phase': phase.color } as React.CSSProperties}>
            <h3>{phase.title}</h3>
            <ul>
              {phase.items.map((item) => {
                const status = statuses[item.id] ?? 'pendiente'
                const Icon = status === 'hecho' ? CheckCircle2 : status === 'en-curso' ? CircleDashed : Circle
                return (
                  <li key={item.id}>
                    <button type="button" className={`milestone ${status}`} onClick={() => toggle(item.id)} title={`Estado: ${STATUS_LABEL[status]}. Clic para cambiar.`}>
                      <Icon size={18} aria-hidden="true" />
                      <span><b>{item.label}</b><small>{item.hint}</small></span>
                      <em>{STATUS_LABEL[status]}</em>
                    </button>
                  </li>
                )
              })}
            </ul>
          </article>
        ))}
      </section>

      <section className="premium-guides" aria-labelledby="pg-title">
        <h2 id="pg-title"><Bot size={20} aria-hidden="true" /> Guías premium</h2>
        <div className="guide-grid">
          {guides.map((guide, index) => (
            <article key={guide.id} className="guide-card premium-card" style={{ '--i': index } as React.CSSProperties}>
              <header>
                <span className="guide-index">{guide.level}</span>
                <span className="guide-time"><Clock size={13} aria-hidden="true" /> {guide.minutes} min</span>
              </header>
              <h3>{guide.title}</h3>
              <p>{guide.summary}</p>
              <div className="guide-norms">{guide.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              <footer>
                <button type="button" className="btn-primary small" onClick={() => openGuide(guide.id)}>Abrir guía</button>
              </footer>
            </article>
          ))}
        </div>
      </section>

      <PasswordPanel />
      {user.role === 'admin' && <AdminPanel currentUserId={user.id} />}

      {reader && <DocReader id={reader.id} title={reader.title} subtitle="Guía premium" markdown={reader.markdown} onClose={() => setReader(null)} />}
    </>
  )
}

function PasswordPanel() {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [note, setNote] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    try {
      await api.changePassword(current, next)
      setNote({ tone: 'ok', text: 'Clave actualizada. Las demás sesiones se cerraron.' })
      setCurrent('')
      setNext('')
    } catch (caught) {
      setNote({ tone: 'error', text: caught instanceof ApiError ? caught.message : 'No se pudo cambiar la clave.' })
    }
  }

  return (
    <details className="panel collapsible">
      <summary><KeyRound size={17} aria-hidden="true" /> Cambiar mi clave</summary>
      <form className="inline-form" onSubmit={submit}>
        <input type="password" placeholder="Clave actual" autoComplete="current-password" required value={current} onChange={(event) => setCurrent(event.target.value)} />
        <input type="password" placeholder="Nueva clave (mín. 10)" autoComplete="new-password" minLength={10} required value={next} onChange={(event) => setNext(event.target.value)} />
        <button type="submit" className="btn-secondary small">Actualizar</button>
      </form>
      {note && <p className={`form-note ${note.tone}`}>{note.text}</p>}
    </details>
  )
}

function AdminPanel({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [form, setForm] = useState({ email: '', name: '', organization: '' })
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null)
  const [error, setError] = useState('')

  const reload = useCallback(() => {
    api.adminUsers().then(({ users: list }) => setUsers(list)).catch(() => undefined)
    api.adminRequests().then(({ requests: list }) => setRequests(list)).catch(() => undefined)
  }, [])

  useEffect(reload, [reload])

  const pending = useMemo(() => requests.filter((item) => item.status === 'pendiente'), [requests])

  async function createUser(payload: { email: string; name?: string; organization?: string }, requestId?: number) {
    setError('')
    try {
      const result = await api.adminCreateUser(payload)
      setCreated({ email: result.email, password: result.password })
      if (requestId) await api.adminSetRequest(requestId, 'aprobada')
      setForm({ email: '', name: '', organization: '' })
      reload()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No se pudo crear el usuario.')
    }
  }

  return (
    <section className="panel admin-panel" aria-labelledby="admin-title">
      <h2 id="admin-title"><Users size={18} aria-hidden="true" /> Administración de accesos</h2>
      {created && (
        <p className="form-note ok">
          Usuario creado: <b>{created.email}</b> · clave inicial <code>{created.password}</code> — entréguela por un canal seguro; se muestra una sola vez.
        </p>
      )}
      {error && <p className="form-note error">{error}</p>}

      <form
        className="inline-form"
        onSubmit={(event) => {
          event.preventDefault()
          void createUser(form)
        }}
      >
        <input type="email" placeholder="Correo" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
        <input placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
        <input placeholder="Organización" value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} />
        <button type="submit" className="btn-primary small"><UserPlus size={15} aria-hidden="true" /> Crear acceso</button>
      </form>

      <h3>Solicitudes pendientes ({pending.length})</h3>
      {pending.length === 0 && <p className="empty-note">Sin solicitudes pendientes.</p>}
      <ul className="admin-list">
        {pending.map((item) => (
          <li key={item.id}>
            <span><b>{item.name}</b> · {item.email}<small>{item.organization} {item.message ? `— ${item.message}` : ''}</small></span>
            <button type="button" className="btn-primary small" onClick={() => createUser({ email: item.email, name: item.name, organization: item.organization ?? undefined }, item.id)}>Aprobar</button>
            <button type="button" className="btn-secondary small" onClick={() => api.adminSetRequest(item.id, 'rechazada').then(reload)}>Rechazar</button>
          </li>
        ))}
      </ul>

      <h3>Usuarios ({users.length})</h3>
      <ul className="admin-list">
        {users.map((item) => (
          <li key={item.id}>
            <span><b>{item.email}</b> {item.role === 'admin' && <em className="role-chip">admin</em>}<small>{item.name ?? ''} · último ingreso: {item.last_login ?? 'nunca'}</small></span>
            {item.id !== currentUserId && (
              <button
                type="button"
                className="icon-btn danger"
                aria-label={`Eliminar ${item.email}`}
                onClick={() => {
                  if (window.confirm(`¿Eliminar el acceso de ${item.email}?`)) void api.adminDeleteUser(item.id).then(reload)
                }}
              >
                <Trash2 size={15} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default PremiumView
