import {
  ArrowRight,
  BadgeCheck,
  Bell,
  Bot,
  Camera,
  Clock,
  Compass,
  Crown,
  FileText,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  MessagesSquare,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { AdminAccess } from '../components/AdminAccess'
import { DocReader } from '../components/DocReader'
import { GuidedTour, tourSeen, type TourStep } from '../components/GuidedTour'
import { AccountPanel, ConsentGate, ForcedPassword } from '../components/PremiumAccount'
import { api, ApiError, type ApiUser, type PremiumGuideSummary } from '../lib/api'
import { solveGuard } from '../lib/guard'

interface PremiumViewProps {
  user: ApiUser | null
  authReady: boolean
  offline: boolean
  onUserChange: (user: ApiUser | null) => void
}

const LOCKED_PREVIEW = [
  'Diagnóstico por foto con IA: peligros, nivel de riesgo y normas',
  'Generador de informes: inspección, investigación, ATS, PETS, actas',
  'Alertas normativas diarias: MTPE, SUNAFIL, MINAM, MINSA y EU-OSHA',
  'Consultor SSOMA: respuestas con la norma y enlaces a las fichas',
  'Probabilidad de riesgo grave y de observación de SUNAFIL',
  'Guías premium aplicadas a su empresa',
]

export function PremiumView({ user, authReady, offline, onUserChange }: PremiumViewProps) {
  if (!authReady) return <div className="view-page"><p className="empty-note">Conectando con el Observatorio…</p></div>
  return (
    <div className="view-page premium">
      {user ? <PremiumHome user={user} onUserChange={onUserChange} /> : <PremiumGate offline={offline} onUserChange={onUserChange} />}
    </div>
  )
}

/** Orden de validación tras el ingreso: clave personal → consentimiento → panel. */
function PremiumHome({ user, onUserChange }: { user: ApiUser; onUserChange: (user: ApiUser | null) => void }) {
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
  return <PremiumDashboard user={user} onUserChange={onUserChange} onRefresh={refresh} />
}

function PremiumGate({ offline, onUserChange }: { offline: boolean; onUserChange: (user: ApiUser) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [website, setWebsite] = useState('')
  const [startedAt] = useState(() => Date.now())
  const [request, setRequest] = useState({ name: '', email: '', phone: '', organization: '', message: '', website: '' })
  const [requestConsent, setRequestConsent] = useState(false)
  const [requestState, setRequestState] = useState<'idle' | 'sent' | 'error'>('idle')
  const [requestMsg, setRequestMsg] = useState('')
  const [forgot, setForgot] = useState({ open: false, email: '', msg: '' })

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
      setRequestMsg('¡Solicitud registrada! Le enviaremos a su correo el acceso de prueba gratuita.')
    } catch (caught) {
      setRequestState('error')
      setRequestMsg(caught instanceof Error ? caught.message : 'No se pudo enviar la solicitud.')
    }
  }

  async function submitForgot(event: React.FormEvent) {
    event.preventDefault()
    try {
      const guard = await solveGuard(startedAt)
      await api.resetRequest({ email: forgot.email, guard, website })
      setForgot({ ...forgot, msg: 'Si el correo corresponde a una cuenta, le enviaremos una clave temporal.' })
    } catch (caught) {
      setForgot({ ...forgot, msg: caught instanceof Error ? caught.message : 'No se pudo enviar el pedido.' })
    }
  }

  return (
    <>
      <header className="premium-hero">
        <div>
          <span className="eyebrow light"><Sparkles size={15} aria-hidden="true" /> Observatorio Premium</span>
          <h1>Inteligencia artificial para su gestión SSOMA</h1>
          <p>Consultor especializado, diagnóstico por foto, informes listos para firmar y alertas normativas diarias, en una sola plataforma.</p>
          <ul className="premium-perks">
            <li><Bot size={16} aria-hidden="true" /> IA: diagnóstico por foto, informes automáticos y alertas normativas</li>
            <li><BadgeCheck size={16} aria-hidden="true" /> Prueba gratuita de 7 días, sin tarjeta</li>
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
              <button type="submit" className="btn-secondary" disabled={offline}>Pedir clave temporal</button>
            </form>
          )}
        </section>
      )}

      <section className="panel request-panel" aria-labelledby="request-title">
        <h2 id="request-title"><UserPlus size={18} aria-hidden="true" /> Solicitar prueba gratuita de IA</h2>
        <p className="ssoma-count">Déjenos su nombre y correo: le enviaremos una clave temporal para probar la IA gratis durante 7 días.</p>
        {requestState === 'sent' ? (
          <p className="form-note ok">{requestMsg}</p>
        ) : (
          <form className="request-form" onSubmit={submitRequest}>
            <input placeholder="Nombre" required value={request.name} onChange={(event) => setRequest({ ...request, name: event.target.value })} />
            <input type="email" placeholder="Correo" required value={request.email} onChange={(event) => setRequest({ ...request, email: event.target.value })} />
            <input type="tel" placeholder="Celular (opcional)" value={request.phone} onChange={(event) => setRequest({ ...request, phone: event.target.value })} />
            <input placeholder="Empresa o institución" value={request.organization} onChange={(event) => setRequest({ ...request, organization: event.target.value })} />
            <input placeholder="¿Para qué lo usará?" value={request.message} onChange={(event) => setRequest({ ...request, message: event.target.value })} />
            <input className="hp-field" tabIndex={-1} autoComplete="off" aria-hidden="true" value={request.website} onChange={(event) => setRequest({ ...request, website: event.target.value })} />
            <label className="sign-check consent-inline">
              <input type="checkbox" checked={requestConsent} onChange={(event) => setRequestConsent(event.target.checked)} />
              Autorizo el tratamiento de mis datos (nombre y correo) para atender mi solicitud, conforme a la Ley 29733.
            </label>
            <button type="submit" className="btn-secondary" disabled={offline}>Enviar solicitud</button>
            {requestState === 'error' && <p className="form-note error">{requestMsg}</p>}
          </form>
        )}
      </section>
    </>
  )
}

const FEATURES: Array<{ id: string; tab: string; icon: typeof Bot; title: string; text: string; badge?: string }> = [
  { id: 'consultor', tab: 'consultor', icon: MessagesSquare, title: 'Consultor SSOMA', text: 'Pregunte como a un especialista: responde con la norma y le lleva a la ficha exacta del Observatorio.', badge: 'Nuevo' },
  { id: 'diagnostico', tab: 'diagnostico', icon: Camera, title: 'Diagnóstico por foto', text: 'Tome una foto del área: peligros, nivel de riesgo, controles y normas en segundos.', badge: 'Mejor desde el celular' },
  { id: 'informes', tab: 'informes', icon: FileText, title: 'Informes y formatos', text: 'Elija el formato, describa el caso en una línea y descargue el documento completo.', badge: 'Nuevo' },
  { id: 'alertas', tab: 'alertas', icon: Bell, title: 'Alertas normativas', text: 'Normas y noticias nuevas de MTPE, SUNAFIL, MINAM, MINSA y EU-OSHA, explicadas en simple.' },
]

const PREMIUM_TOUR: TourStep[] = [
  { target: '.ph-hero', title: 'Bienvenido a su plataforma Premium', body: 'Aquí ve su plan, los días que le quedan y cuántas consultas de IA puede hacer hoy.' },
  { target: '.ph-tile-consultor', title: 'Consultor SSOMA', body: 'Escriba su duda (por ejemplo: «¿cada cuánto debo hacer el examen médico ocupacional?») y reciba la respuesta con la norma y enlaces a las fichas internas.' },
  { target: '.ph-tile-diagnostico', title: 'Diagnóstico por foto', body: 'Ábralo desde su celular: la cámara se activa sola. Obtiene peligros, nivel de riesgo y controles.' },
  { target: '.ph-tile-informes', title: 'Informes y formatos', body: 'Elija un formato (inspección, ATS, PETS, charla, acta…), describa el caso y la plantilla se completa sola para descargar en Word o PDF.' },
  { target: '.ph-tile-alertas', title: 'Alertas normativas', body: 'Cada mañana revisamos las fuentes oficiales. Pulse «Explicar» para ver qué cambia y qué debe hacer su empresa.' },
  { target: '.ph-news', title: 'Novedades de la semana', body: 'Las últimas alertas aparecen también aquí, para que no se le pase ninguna.' },
  { target: '.account-panel', title: 'Su plan', body: 'Active códigos, pida una extensión o cambie de plan. Puede solicitar boleta o factura.' },
]

interface AlertLite { id: number; title: string; source: string; published: string | null; tags: string | null }

function goIa(tab: string, extra = '') {
  window.location.hash = `#/ia?tab=${tab}${extra}`
}

function PremiumDashboard({ user, onUserChange, onRefresh }: { user: ApiUser; onUserChange: (user: ApiUser | null) => void; onRefresh: () => void }) {
  const [guides, setGuides] = useState<PremiumGuideSummary[]>([])
  const [reader, setReader] = useState<{ id: string; title: string; markdown: string } | null>(null)
  const [message, setMessage] = useState('')
  const [alerts, setAlerts] = useState<AlertLite[]>([])
  const [usage, setUsage] = useState<{ quota: number | null; used: number; planLabel: string } | null>(null)
  const [tour, setTour] = useState(false)
  const premium = user.premium
  const active = Boolean(premium?.active)

  useEffect(() => {
    api.guides().then(({ guides: list }) => setGuides(list)).catch(() => undefined)
    if (!active) return
    fetch('/api/ai/alerts', { credentials: 'same-origin' }).then((response) => response.json()).then((data: { alerts?: AlertLite[] }) => setAlerts((data.alerts ?? []).slice(0, 4))).catch(() => undefined)
    fetch('/api/ai/catalog', { credentials: 'same-origin' }).then((response) => response.json()).then((data) => setUsage(data)).catch(() => undefined)
    if (!tourSeen('premium-v1')) window.setTimeout(() => setTour(true), 600)
  }, [active])

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

  const weekAgo = Date.now() - 7 * 86_400_000
  const fresh = alerts.filter((alert) => alert.published && new Date(alert.published).getTime() > weekAgo).length
  const planText = premium?.plan === 'admin' ? 'Administrador' : premium?.plan === 'pagado' ? 'Plan Profesional' : 'Periodo de prueba'

  return (
    <>
      <header className={`ph-hero ${active ? 'on' : 'off'}`}>
        <div className="ph-hero-main">
          <span className="ph-crown"><Crown size={18} aria-hidden="true" /> {active ? 'Premium activo' : 'Premium inactivo'}</span>
          <h1>Hola, {user.name ?? user.email.split('@')[0]}</h1>
          <p>{active ? 'Su plataforma de IA para seguridad, salud ocupacional y ambiente está lista.' : 'Su acceso a la IA no está vigente. Active un código o solicite su plan abajo.'}</p>
          <div className="ph-chips">
            <span className="ph-chip"><BadgeCheck size={14} aria-hidden="true" /> {planText}</span>
            {premium?.daysLeft !== null && premium?.daysLeft !== undefined && <span className="ph-chip"><Clock size={14} aria-hidden="true" /> {premium.daysLeft} día(s) restantes</span>}
            {usage && <span className="ph-chip"><Sparkles size={14} aria-hidden="true" /> {usage.quota === null ? 'Consultas ilimitadas' : `IA hoy: ${usage.used} de ${usage.quota}`}</span>}
          </div>
        </div>
        <div className="ph-hero-side">
          <span><Mail size={14} aria-hidden="true" /> {user.email}</span>
          <div className="issued-actions">
            {active && <button type="button" className="btn-secondary small" onClick={() => setTour(true)}><Compass size={15} aria-hidden="true" /> Ver guía</button>}
            <button type="button" className="btn-secondary small" onClick={logout}><LogOut size={15} aria-hidden="true" /> Salir</button>
          </div>
        </div>
      </header>

      {message && <p className="form-note warn" role="status">{message}</p>}

      <section className="ph-tiles" aria-label="Herramientas premium">
        {FEATURES.map(({ id, tab, icon: Icon, title, text, badge }) => (
          <button key={id} type="button" className={`ph-tile ph-tile-${id} ${active ? 'pulse' : 'locked'}`} disabled={!active} onClick={() => goIa(tab)}>
            <span className="ph-tile-icon"><Icon size={22} aria-hidden="true" /></span>
            <span className="ph-tile-body">
              <b>{title}</b>
              <small>{text}</small>
            </span>
            {id === 'alertas' && fresh > 0 ? <em className="ph-badge blink">{fresh} nuevas</em> : badge ? <em className="ph-badge">{badge}</em> : null}
            {active ? <ArrowRight size={18} className="ph-go" aria-hidden="true" /> : <Lock size={16} className="ph-go" aria-hidden="true" />}
          </button>
        ))}
      </section>

      {active && (
        <section className="panel ph-news" aria-labelledby="news-title">
          <div className="ph-news-head">
            <h2 id="news-title"><Bell size={18} aria-hidden="true" /> Novedades normativas</h2>
            <button type="button" className="btn-ghost small" onClick={() => goIa('alertas')}>Ver todas <ArrowRight size={14} aria-hidden="true" /></button>
          </div>
          {alerts.length === 0 ? (
            <p className="empty-note">La revisión diaria de fuentes oficiales irá llenando esta lista.</p>
          ) : (
            <ul className="ph-news-list">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <button type="button" onClick={() => goIa('alertas', `&id=${alert.id}`)}>
                    <span className="role-chip">{alert.source}</span>
                    <b>{alert.title}</b>
                    <small>{alert.published ? new Date(alert.published).toLocaleDateString('es-PE') : ''} {(alert.tags ?? '').split(',').filter(Boolean).slice(0, 2).join(' · ')}</small>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <AccountPanel user={user} onRefresh={onRefresh} />

      <section className="premium-guides" aria-labelledby="pg-title">
        <h2 id="pg-title"><Bot size={20} aria-hidden="true" /> Guías premium aplicadas</h2>
        <p className="ssoma-count">Cada guía se puede llevar a la práctica: ábrala o pida al consultor que la aplique a su empresa.</p>
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
              <footer className="issued-actions">
                <button type="button" className="btn-secondary small" onClick={() => openGuide(guide.id)}>Abrir guía</button>
                {active && (
                  <button type="button" className="btn-primary small" onClick={() => goIa('consultor', `&q=${encodeURIComponent(`¿Cómo aplico en mi empresa: ${guide.title}?`)}`)}>
                    <MessagesSquare size={14} aria-hidden="true" /> Aplicar con el consultor
                  </button>
                )}
              </footer>
            </article>
          ))}
        </div>
      </section>

      <PasswordPanel />
      {user.role === 'admin' && <AdminAccess currentUserId={user.id} />}

      {reader && <DocReader id={reader.id} title={reader.title} subtitle="Guía premium" markdown={reader.markdown} onClose={() => setReader(null)} />}
      <GuidedTour id="premium-v1" steps={PREMIUM_TOUR} open={tour} onClose={() => setTour(false)} />
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
