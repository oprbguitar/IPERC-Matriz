import { CalendarClock, CheckCircle2, FileSignature, KeyRound, Loader2, Send, ShieldCheck, Ticket } from 'lucide-react'
import { useState } from 'react'
import { CONSENT_CLAUSES, CONSENT_VERSION } from '../data/consent'
import { api, ApiError, type ApiUser } from '../lib/api'
import { fmtDate } from '../lib/dates'
import { solveGuard } from '../lib/guard'
import '../styles/account.css'


/** Registro de consentimiento (Ley 29733) y aceptación de términos antes de usar la zona premium. */
export function ConsentGate({ onAccepted }: { onAccepted: () => void }) {
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const all = CONSENT_CLAUSES.every((clause) => checks[clause.id])

  async function accept() {
    setBusy(true)
    setError('')
    try {
      await api.consent(CONSENT_VERSION)
      onAccepted()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No se pudo registrar su aceptación.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="panel consent-gate" aria-labelledby="consent-title">
      <h2 id="consent-title"><FileSignature size={19} aria-hidden="true" /> Validación de usuario y consentimiento</h2>
      <p className="ssoma-count">Antes de usar la zona premium lea y acepte cada cláusula. Queda registrada la fecha, la versión ({CONSENT_VERSION}) y una huella anónima de su conexión.</p>
      {CONSENT_CLAUSES.map((clause) => (
        <details key={clause.id} className="consent-clause" open>
          <summary>{clause.title}</summary>
          <ul>{clause.points.map((point) => <li key={point}>{point}</li>)}</ul>
          <label className="sign-check">
            <input type="checkbox" checked={Boolean(checks[clause.id])} onChange={(event) => setChecks((prev) => ({ ...prev, [clause.id]: event.target.checked }))} />
            He leído y acepto: {clause.title.toLowerCase()}
          </label>
        </details>
      ))}
      {error && <p className="form-note error">{error}</p>}
      <button type="button" className="btn-primary" disabled={!all || busy} onClick={accept}>
        {busy ? <Loader2 size={16} className="spin" /> : <ShieldCheck size={16} />} Aceptar y continuar
      </button>
    </section>
  )
}

/** Clave temporal: obliga a cambiarla en el primer ingreso. */
export function ForcedPassword({ onDone }: { onDone: () => void }) {
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [repeat, setRepeat] = useState('')
  const [error, setError] = useState('')
  async function submit(event: React.FormEvent) {
    event.preventDefault()
    if (next !== repeat) return setError('Las claves nuevas no coinciden.')
    try {
      await api.changePassword(current, next)
      onDone()
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : 'No se pudo cambiar la clave.')
    }
  }
  return (
    <section className="panel consent-gate" aria-labelledby="forced-title">
      <h2 id="forced-title"><KeyRound size={19} aria-hidden="true" /> Cree su clave personal</h2>
      <p className="ssoma-count">Ingresó con una clave temporal. Cree una nueva: mínimo 10 caracteres, con letras y números, sin incluir su correo.</p>
      <form className="request-form" onSubmit={submit}>
        <input type="password" placeholder="Clave temporal recibida" autoComplete="current-password" required value={current} onChange={(event) => setCurrent(event.target.value)} />
        <input type="password" placeholder="Nueva clave" autoComplete="new-password" minLength={10} required value={next} onChange={(event) => setNext(event.target.value)} />
        <input type="password" placeholder="Repita la nueva clave" autoComplete="new-password" minLength={10} required value={repeat} onChange={(event) => setRepeat(event.target.value)} />
        <button type="submit" className="btn-primary">Guardar clave</button>
      </form>
      {error && <p className="form-note error">{error}</p>}
    </section>
  )
}

const PLANS = ['1 mes', '3 meses', '6 meses', '12 meses', 'Empresa (varios usuarios)']

/** Estado del acceso premium, canje de código y pedido de extensión. */
export function AccountPanel({ user, onRefresh }: { user: ApiUser; onRefresh: () => void }) {
  const premium = user.premium
  const [code, setCode] = useState('')
  const [plan, setPlan] = useState(PLANS[0])
  const [message, setMessage] = useState('')
  const [note, setNote] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)
  const [startedAt] = useState(() => Date.now())

  async function redeem(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setNote(null)
    try {
      const guard = await solveGuard(startedAt)
      const result = await api.redeem(code, guard)
      setNote({ tone: 'ok', text: `Código activado: +${result.days} días. Premium vigente hasta el ${fmtDate(result.premiumUntil)}.` })
      setCode('')
      onRefresh()
    } catch (caught) {
      setNote({ tone: 'error', text: caught instanceof Error ? caught.message : 'No se pudo activar el código.' })
    } finally {
      setBusy(false)
    }
  }

  async function extension() {
    try {
      await api.requestExtension(plan, message)
      setNote({ tone: 'ok', text: 'Pedido enviado. El administrador le enviará el precio y su código de acceso.' })
      setMessage('')
    } catch (caught) {
      setNote({ tone: 'error', text: caught instanceof ApiError ? caught.message : 'No se pudo enviar el pedido.' })
    }
  }

  const tone = premium?.active ? (premium.daysLeft !== null && premium.daysLeft <= 3 ? 'warn' : 'ok') : 'error'
  const label = !premium
    ? 'Sin información'
    : premium.reason === 'administrador'
      ? 'Administrador: acceso completo'
      : premium.active
        ? `Premium vigente · ${premium.daysLeft} día(s) restantes (hasta el ${fmtDate(premium.until)})`
        : premium.reason === 'vencido'
          ? `Su acceso premium venció el ${fmtDate(premium.until)}`
          : premium.reason === 'deshabilitado'
            ? 'El administrador deshabilitó temporalmente su acceso a la IA'
            : 'Su cuenta aún no tiene periodo de prueba de IA'

  return (
    <section className="panel account-panel" aria-labelledby="account-title">
      <h2 id="account-title"><CalendarClock size={18} aria-hidden="true" /> Mi acceso premium</h2>
      <p className={`form-note ${tone}`}>{premium?.active ? <CheckCircle2 size={15} aria-hidden="true" /> : null} {label}</p>
      {premium?.reason !== 'administrador' && (
        <div className="account-grid">
          <form className="account-box" onSubmit={redeem}>
            <h3><Ticket size={16} aria-hidden="true" /> Activar código</h3>
            <p className="ssoma-count">Ingrese el código que le entregó el administrador (formato OBS-XXXX-XXXX-XXXX).</p>
            <input value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="OBS-XXXX-XXXX-XXXX" autoComplete="off" required minLength={12} maxLength={24} />
            <button type="submit" className="btn-primary small" disabled={busy}>{busy ? 'Verificando…' : 'Activar'}</button>
          </form>
          <div className="account-box">
            <h3><Send size={16} aria-hidden="true" /> Solicitar extensión o precio</h3>
            <select value={plan} onChange={(event) => setPlan(event.target.value)}>{PLANS.map((item) => <option key={item}>{item}</option>)}</select>
            <input value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Comentario (opcional): empresa, número de usuarios…" maxLength={600} />
            <button type="button" className="btn-secondary small" onClick={extension}>Enviar pedido</button>
          </div>
        </div>
      )}
      {note && <p className={`form-note ${note.tone}`} role="status">{note.text}</p>}
    </section>
  )
}

