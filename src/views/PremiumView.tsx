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
  UserPlus,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AdminAccess } from '../components/AdminAccess'
import { DocReader } from '../components/DocReader'
import { AccountPanel, ConsentGate, ForcedPassword } from '../components/PremiumAccount'
import { solveGuard } from '../lib/guard'
import { PREMIUM_ITEM_COUNT, PREMIUM_PLAN } from '../data/premiumPlan'
import {
  api,
  ApiError,
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
  'Diagnóstico por foto con IA: peligros, nivel de riesgo y normas',
  'Generador de informes: inspección, investigación, ATS, PETS, actas',
  'Alertas normativas diarias: MTPE, SUNAFIL, MINAM, MINSA y EU-OSHA',
  'Probabilidades calibradas con Jev: riesgo grave y observación SUNAFIL',
  'Guías premium: agentes de IA, prompts y gobernanza de datos',
  'Plan de implementación con % de avance guardado en la nube',
]

export function computePercent(statuses: Record<string, ProgressStatus>): number {
  const score = Object.values(statuses).reduce((sum, status) => sum + (status === 'hecho' ? 1 : status === 'en-curso' ? 0.5 : 0), 0)
  return Math.round((score / PREMIUM_ITEM_COUNT) * 100)
}

export function PremiumView({ user, authReady, offline, onUserChange, onPercentChange }: PremiumViewProps) {
  if (!authReady) return <div className="view-page"><p className="empty-note">Conectando con el Observatorio…</p></div>
  return (
    <div className="view-page premium">
      {user ? <PremiumHome user={user} onUserChange={onUserChange} onPercentChange={onPercentChange} /> : <PremiumGate offline={offline} onUserChange={onUserChange} />}
    </div>
  )
}

/** Orden de validación tras el ingreso: clave personal → consentimiento → panel. */
function PremiumHome({ user, onUserChange, onPercentChange }: { user: ApiUser; onUserChange: (user: ApiUser | null) => void; onPercentChange?: (percent: number) => void }) {
  const refresh = useCallback(() => {
    api.me().then(({ user: current }) => onUserChange(current)).catch(() => undefined)
  }, [onUserChange])
  const logout = () => api.logout().catch(() => undefined).then(() => onUserChange(null))
  if (user.mustChange || !user.consentOk) {
    return (
      <>
        <header className="premium-head">
          <div>
            <span className="eyebrow"><ShieldCheck size={15} aria-hidden="true" /> Validación de cuenta</span>
            <h1>Bienvenido, {user.name ?? user.email.split('@')[0]}</h1>
            <p>{user.mustChange ? 'Paso 1 de 2: cree su clave personal.' : 'Paso 2 de 2: acepte los términos y el tratamiento de datos.'}</p>
          </div>
          <button type="button" className="btn-secondary small" onClick={logout}><LogOut size={15} aria-hidden="true" /> Salir</button>
        </header>
        {user.mustChange ? <ForcedPassword onDone={refresh} /> : <ConsentGate onAccepted={refresh} />}
      </>
    )
  }
  return <PremiumDashboard user={user} onUserChange={onUserChange} onPercentChange={onPercentChange} onRefresh={refresh} />
}

function PremiumGate({ offline, onUserChange }: { offline: boolean; onUserChange: (user: ApiUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [website, setWebsite] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [request, setRequest] = useState({ name: '', email: '', dni: '', phone: '', organization: '', message: '', website: '' })
  const [requestConsent, setRequestConsent] = useState(false)
  const [requestState, setRequestState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [requestMsg, setRequestMsg] = useState('')
  const [forgot, setForgot] = useState({ open: false, email: '', dni: '', msg: '' })

  async function submitLogin(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const guard = await solveGuard(startedAt)
      const { user } = await api.login(email, password, guard, website)
      onUserChange(user)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No se pudo iniciar sesión.')
    } finally {
      setBusy(false)
    }
  }

  async function submitRequest(event: React.FormEvent) {
    event.preventDefault()
    if (!requestConsent) {
      setRequestState('error')
      setRequestMsg('Debe autorizar el tratamiento de sus datos para registrar la solicitud.')
      return
    }
    try {
      const guard = await solveGuard(startedAt)
      await api.requestAccess({ ...request, guard })
      setRequestState('sent')
      setRequestMsg('Solicitud registrada. Tras validar su DNI, el administrador le enviará por correo su acceso de prueba.')
    } catch (caught) {
      setRequestState('error')
      setRequestMsg(caught instanceof Error ? caught.message : 'No se pudo enviar la solicitud.')
    }
  }

  async function submitForgot(event: React.FormEvent) {
    event.preventDefault()
    try {
      const guard = await solveGuard(startedAt)
      await api.resetRequest({ email: forgot.email, dni: forgot.dni, guard, website })
      setForgot({ ...forgot, msg: 'Si los datos coinciden con una cuenta, el administrador le enviará una clave temporal a su correo.' })
    } catch (caught) {
      setForgot({ ...forgot, msg: caught instanceof Error ? caught.message : 'No se pudo enviar el pedido.' })
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
            <li><Bot size={16} aria-hidden="true" /> IA: diagnóstico por foto, informes automáticos y alertas normativas</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Prueba gratuita de 7 a 15 días tras validar su DNI</li>
            <li><ShieldCheck size={16} aria-hidden="true" /> Acceso personal protegido contra bots, con consentimiento (Ley 29733)</li>
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
          <input className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={website} onChange={(event) => setWebsite(event.target.value)} />
          {error && <p className="form-note error" role="alert">{error}</p>}
          <button type="submit" className="btn-primary" disabled={busy || offline}>
            {busy ? 'Verificando…' : 'Ingresar'}
          </button>
          <button type="button" className="link-btn" onClick={() => setForgot({ ...forgot, open: !forgot.open })}>¿Olvidó su clave?</button>
          <p className="form-note">Protegido con verificación anti-bots y límite de intentos.</p>
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

      {forgot.open && (
        <section className="panel request-panel" aria-labelledby="forgot-title">
          <h2 id="forgot-title"><Lock size={18} aria-hidden="true" /> Recuperar acceso</h2>
          {forgot.msg ? <p className="form-note ok">{forgot.msg}</p> : (
            <form className="request-form" onSubmit={submitForgot}>
              <input type="email" placeholder="Correo de su cuenta" required value={forgot.email} onChange={(event) => setForgot({ ...forgot, email: event.target.value })} />
              <input placeholder="DNI registrado" inputMode="numeric" required pattern="[0-9A-Za-z]{8,12}" value={forgot.dni} onChange={(event) => setForgot({ ...forgot, dni: event.target.value })} />
              <button type="submit" className="btn-secondary" disabled={offline}>Pedir clave temporal</button>
            </form>
          )}
        </section>
      )}

      <section className="panel request-panel" aria-labelledby="request-title">
        <h2 id="request-title"><UserPlus size={18} aria-hidden="true" /> Solicitar prueba gratuita de IA</h2>
        <p className="ssoma-count">Indique su DNI para validar su identidad. Si se aprueba, recibirá en su correo una clave temporal y un periodo de prueba de 7 a 15 días.</p>
        {requestState === 'sent' ? (
          <p className="form-note ok">{requestMsg}</p>
        ) : (
          <form className="request-form" onSubmit={submitRequest}>
            <input placeholder="Nombre" required value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} />
            <input type="email" placeholder="Correo" required value={request.email} onChange={(event) => setRequest({ ...request, email: event.target.value })} />
            <input placeholder="DNI (8 dígitos) o documento" inputMode="numeric" required pattern="[0-9A-Za-z]{8,12}" value={request.dni} onChange={(event) => setRequest({ ...request, dni: event.target.value })} />
            <input type="tel" placeholder="Celular (opcional)" value={request.phone} onChange={(event) => setRequest({ ...request, phone: event.target.value })} />
            <input placeholder="Empresa o institución" value={request.organization} onChange={(event) => setRequest({ ...request, organization: event.target.value })} />
            <input placeholder="¿Para qué lo usará?" value={request.message} onChange={(event) => setRequest({ ...request, message: event.target.value })} />
            <input className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={request.website} onChange={(event) => setRequest({ ...request, website: event.target.value })} />
            <label className="sign-check consent-inline">
              <input type="checkbox" checked={requestConsent} onChange={(event) => setRequestConsent(event.target.checked)} />
              Autorizo el tratamiento de mis datos (nombre, correo, DNI) para evaluar mi solicitud, conforme a la Ley 29733.
            </label>
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
  onRefresh,
}: {
  user: ApiUser
  onUserChange: (user: ApiUser | null) => void
  onPercentChange?: (percent: number) => void
  onRefresh: () => void
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

      <AccountPanel user={user} onRefresh={onRefresh} />

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
      {user.role === 'admin' && <AdminAccess currentUserId={user.id} />}

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
        <input type="password" placeholder="Nueva clave (mín. 10, letras y números)" autoComplete="new-password" minLength={10} required value={next} onChange={(event) => setNext(event.target.value)} />
        <button type="submit" className="btn-secondary small">Actualizar</button>
      </form>
      {note && <p className={`form-note ${note.tone}`}>{note.text}</p>}
    </details>
  )
}

export default PremiumView
