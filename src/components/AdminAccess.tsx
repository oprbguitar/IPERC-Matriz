import { Ban, Copy, History, KeyRound, Mail, Power, RefreshCw, Ticket, Trash2, UserPlus, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { api, ApiError, type AccessCode, type AccessRequest, type AdminUser } from '../lib/api'
import { fmtDate } from '../lib/dates'

const SITE = 'https://sst.andesnova.solutions'
const KIND_LABEL: Record<string, string> = { acceso: 'Acceso nuevo', extension: 'Extensión / precio', clave: 'Olvidó su clave' }

type Issued = { kind: 'cuenta' | 'clave' | 'codigo'; email: string; secret: string; name?: string; until?: string | null; days?: number; price?: string }

/** Arma el correo que el administrador envía desde su propio cliente de correo. */
function mailFor(item: Issued): string {
  const hello = `Hola${item.name ? ` ${item.name}` : ''}:`
  let subject = ''
  let body = ''
  if (item.kind === 'cuenta') {
    subject = 'Su acceso de prueba al Observatorio Prevenir Perú'
    body = `${hello}\n\nSu solicitud fue aprobada. Tiene un periodo de prueba de ${item.days} días${item.until ? ` (hasta el ${fmtDate(item.until)})` : ''} para la zona premium con IA: diagnóstico por foto, informes automáticos y alertas normativas.\n\n1. Ingrese a ${SITE}/v/premium\n2. Correo: ${item.email}\n3. Clave temporal: ${item.secret}\n4. Cree su clave personal y acepte los términos de uso y tratamiento de datos.\n\nLa clave temporal es personal; no la comparta. Si desea continuar al terminar la prueba, solicite la extensión desde «Mi acceso premium».\n\nSaludos,\nObservatorio Prevenir Perú`
  } else if (item.kind === 'clave') {
    subject = 'Restablecimiento de clave - Observatorio Prevenir Perú'
    body = `${hello}\n\nGeneramos una clave temporal para su cuenta ${item.email}: ${item.secret}\n\nIngrese a ${SITE}/v/premium y cree una nueva clave. Si usted no pidió este cambio, avísenos.\n\nObservatorio Prevenir Perú`
  } else {
    subject = 'Su código de acceso premium - Observatorio Prevenir Perú'
    body = `${hello}\n\nGracias por su interés. Su código de extensión es: ${item.secret}\nDa ${item.days} días de acceso premium${item.price ? ` (precio: ${item.price})` : ''}.\n\nPara activarlo: ingrese a ${SITE}/v/premium → «Mi acceso premium» → «Activar código». El código es de un solo uso.\n\nObservatorio Prevenir Perú`
  }
  return `mailto:${encodeURIComponent(item.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}

function IssuedBox({ item, onClose }: { item: Issued; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="form-note ok issued-box" role="status">
      <p>
        {item.kind === 'codigo' ? 'Código' : 'Clave temporal'} para <b>{item.email || 'cualquier usuario'}</b>: <code>{item.secret}</code> — se muestra una sola vez.
      </p>
      <div className="issued-actions">
        <button type="button" className="btn-secondary small" onClick={() => navigator.clipboard?.writeText(item.secret).then(() => setCopied(true))}><Copy size={14} /> {copied ? 'Copiado' : 'Copiar'}</button>
        {item.email && <a className="btn-primary small" href={mailFor(item)}><Mail size={14} /> Redactar correo</a>}
        <button type="button" className="btn-ghost small" onClick={onClose}>Cerrar</button>
      </div>
    </div>
  )
}

export function AdminAccess({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [requests, setRequests] = useState<AccessRequest[]>([])
  const [codes, setCodes] = useState<AccessCode[]>([])
  const [issued, setIssued] = useState<Issued | null>(null)
  const [error, setError] = useState('')
  const [trialDays, setTrialDays] = useState(7)
  const [form, setForm] = useState({ email: '', name: '', organization: '', dni: '' })
  const [codeForm, setCodeForm] = useState({ days: 30, price: '', currency: 'PEN', note: '', forEmail: '' })
  const [filter, setFilter] = useState('')
  const [audit, setAudit] = useState<Awaited<ReturnType<typeof api.adminAudit>>['events']>([])
  const [alertsNote, setAlertsNote] = useState('')

  const reload = useCallback(() => {
    api.adminUsers().then(({ users: list }) => setUsers(list)).catch(() => undefined)
    api.adminRequests().then(({ requests: list }) => setRequests(list)).catch(() => undefined)
    api.adminCodes().then(({ codes: list }) => setCodes(list)).catch(() => undefined)
  }, [])
  useEffect(reload, [reload])

  const pending = useMemo(() => requests.filter((item) => item.status === 'pendiente'), [requests])
  const shownUsers = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return q ? users.filter((item) => `${item.email} ${item.name ?? ''} ${item.dni ?? ''} ${item.organization ?? ''}`.toLowerCase().includes(q)) : users
  }, [users, filter])

  const fail = (caught: unknown, fallback: string) => setError(caught instanceof ApiError ? caught.message : fallback)

  async function createUser(payload: { email: string; name?: string; organization?: string; dni?: string }, requestId?: number) {
    setError('')
    try {
      const result = await api.adminCreateUser({ ...payload, trialDays, requestId })
      setIssued({ kind: 'cuenta', email: result.email, secret: result.password, name: payload.name, until: result.premiumUntil, days: result.trialDays })
      setForm({ email: '', name: '', organization: '', dni: '' })
      reload()
    } catch (caught) {
      fail(caught, 'No se pudo crear el usuario.')
    }
  }

  async function update(user: AdminUser, payload: Parameters<typeof api.adminUpdateUser>[1]) {
    setError('')
    try {
      await api.adminUpdateUser(user.id, payload)
      reload()
    } catch (caught) {
      fail(caught, 'No se pudo actualizar.')
    }
  }

  async function resetPassword(user: AdminUser) {
    if (!window.confirm(`¿Generar una clave temporal para ${user.email}? Se cerrarán sus sesiones.`)) return
    try {
      const result = await api.adminResetPassword(user.id)
      setIssued({ kind: 'clave', email: result.email, secret: result.password, name: user.name ?? undefined })
      reload()
    } catch (caught) {
      fail(caught, 'No se pudo restablecer la clave.')
    }
  }

  async function createCode(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    try {
      const price = codeForm.price ? Number(codeForm.price) : undefined
      const result = await api.adminCreateCode({ days: codeForm.days, price, currency: codeForm.currency, note: codeForm.note, forEmail: codeForm.forEmail || undefined })
      setIssued({ kind: 'codigo', email: codeForm.forEmail, secret: result.code, days: result.days, price: price ? `${codeForm.currency} ${price.toFixed(2)}` : undefined })
      setCodeForm({ ...codeForm, note: '', forEmail: '' })
      reload()
    } catch (caught) {
      fail(caught, 'No se pudo crear el código.')
    }
  }

  async function handleRequest(item: AccessRequest) {
    if (item.kind === 'clave') {
      const target = users.find((user) => user.email === item.email)
      if (target) await resetPassword(target)
      return
    }
    if (item.kind === 'extension') {
      setCodeForm((prev) => ({ ...prev, forEmail: item.email, note: item.message ?? '' }))
      await api.adminSetRequest(item.id, 'aprobada').catch(() => undefined)
      reload()
      document.getElementById('codes-title')?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    await createUser({ email: item.email, name: item.name, organization: item.organization ?? undefined, dni: item.dni ?? undefined }, item.id)
  }

  return (
    <section className="panel admin-panel" aria-labelledby="admin-title">
      <h2 id="admin-title"><Users size={18} aria-hidden="true" /> Administración de accesos premium</h2>
      {issued && <IssuedBox item={issued} onClose={() => setIssued(null)} />}
      {error && <p className="form-note error">{error}</p>}

      <label className="sign-field trial-picker">
        <span>Periodo de prueba al aprobar o crear</span>
        <select value={trialDays} onChange={(event) => setTrialDays(Number(event.target.value))}>
          {[7, 10, 15, 30, 0].map((days) => <option key={days} value={days}>{days ? `${days} días` : 'Sin prueba (solo cuenta)'}</option>)}
        </select>
      </label>

      <h3>Solicitudes pendientes ({pending.length})</h3>
      {pending.length === 0 && <p className="empty-note">Sin solicitudes pendientes.</p>}
      <ul className="admin-list">
        {pending.map((item) => (
          <li key={item.id}>
            <span>
              <em className="role-chip">{KIND_LABEL[item.kind ?? 'acceso']}</em> <b>{item.name}</b> · {item.email}
              <small>DNI {item.dni ?? '—'}{item.phone ? ` · ${item.phone}` : ''} · {item.organization ?? ''} {item.message ? `— ${item.message}` : ''} · {fmtDate(item.created_at)}</small>
            </span>
            <button type="button" className="btn-primary small" onClick={() => handleRequest(item)}>
              {item.kind === 'clave' ? 'Restablecer' : item.kind === 'extension' ? 'Preparar código' : `Aprobar (${trialDays} d)`}
            </button>
            <button type="button" className="btn-secondary small" onClick={() => api.adminSetRequest(item.id, 'rechazada').then(reload)}>Rechazar</button>
          </li>
        ))}
      </ul>

      <details className="collapsible">
        <summary><UserPlus size={16} aria-hidden="true" /> Crear acceso manual</summary>
        <form className="inline-form" onSubmit={(event) => { event.preventDefault(); void createUser(form) }}>
          <input type="email" placeholder="Correo" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
          <input placeholder="DNI" inputMode="numeric" value={form.dni} onChange={(event) => setForm({ ...form, dni: event.target.value })} />
          <input placeholder="Nombre" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          <input placeholder="Organización" value={form.organization} onChange={(event) => setForm({ ...form, organization: event.target.value })} />
          <button type="submit" className="btn-primary small">Crear con {trialDays} días</button>
        </form>
      </details>

      <h3>Usuarios ({users.length})</h3>
      <input className="admin-filter" placeholder="Buscar por correo, nombre, DNI u organización" value={filter} onChange={(event) => setFilter(event.target.value)} />
      <ul className="admin-list users">
        {shownUsers.map((item) => {
          const p = item.premium
          const state = item.suspended ? 'Suspendida' : p.reason === 'administrador' ? 'Admin' : p.active ? `IA activa · ${p.daysLeft} d` : p.reason === 'deshabilitado' ? 'IA deshabilitada' : p.reason === 'vencido' ? 'Vencida' : 'Sin prueba'
          return (
            <li key={item.id} className={item.suspended ? 'is-off' : ''}>
              <span>
                <b>{item.email}</b> <em className={`role-chip ${p.active ? 'ok' : 'off'}`}>{state}</em>
                <small>
                  {item.name ?? ''} · DNI {item.dni ?? '—'} · hasta {fmtDate(item.premium_until)} · último ingreso {item.last_login ? fmtDate(item.last_login) : 'nunca'}
                  {item.must_change ? ' · clave temporal' : ''}{item.consentOk ? ' · consentimiento ✓' : ' · sin consentimiento'}
                </small>
              </span>
              {item.role !== 'admin' && (
                <span className="admin-actions">
                  <button type="button" className="btn-ghost small" title={item.premium_enabled ? 'Deshabilitar IA' : 'Habilitar IA'} onClick={() => update(item, { premiumEnabled: !item.premium_enabled })}>
                    <Power size={14} /> {item.premium_enabled ? 'Deshabilitar IA' : 'Habilitar IA'}
                  </button>
                  {[7, 15, 30].map((days) => <button key={days} type="button" className="btn-ghost small" onClick={() => update(item, { addDays: days })}>+{days} d</button>)}
                  <button type="button" className="btn-ghost small" onClick={() => resetPassword(item)}><KeyRound size={14} /> Clave</button>
                  <button type="button" className="btn-ghost small" onClick={() => update(item, { suspended: !item.suspended })}><Ban size={14} /> {item.suspended ? 'Reactivar' : 'Suspender'}</button>
                </span>
              )}
              {item.id !== currentUserId && (
                <button type="button" className="icon-btn danger" aria-label={`Eliminar ${item.email}`} onClick={() => { if (window.confirm(`¿Eliminar definitivamente la cuenta de ${item.email}? No se puede deshacer.`)) void api.adminDeleteUser(item.id).then(reload) }}>
                  <Trash2 size={15} />
                </button>
              )}
            </li>
          )
        })}
      </ul>

      <h3 id="codes-title"><Ticket size={16} aria-hidden="true" /> Códigos de extensión</h3>
      <form className="inline-form code-form" onSubmit={createCode}>
        <label><span>Días</span><input type="number" min={1} max={366} value={codeForm.days} onChange={(event) => setCodeForm({ ...codeForm, days: Number(event.target.value) })} /></label>
        <label><span>Precio</span><input type="number" min={0} step="0.01" placeholder="0.00" value={codeForm.price} onChange={(event) => setCodeForm({ ...codeForm, price: event.target.value })} /></label>
        <label><span>Moneda</span><select value={codeForm.currency} onChange={(event) => setCodeForm({ ...codeForm, currency: event.target.value })}><option>PEN</option><option>USD</option></select></label>
        <label><span>Solo para el correo (recomendado)</span><input type="email" placeholder="usuario@empresa.pe" value={codeForm.forEmail} onChange={(event) => setCodeForm({ ...codeForm, forEmail: event.target.value })} /></label>
        <label><span>Nota interna</span><input placeholder="Pago Yape 12/11, factura…" value={codeForm.note} onChange={(event) => setCodeForm({ ...codeForm, note: event.target.value })} /></label>
        <button type="submit" className="btn-primary small">Generar código</button>
      </form>
      <ul className="admin-list">
        {codes.slice(0, 30).map((code) => (
          <li key={code.id} className={code.revoked || code.redeemed_at ? 'is-off' : ''}>
            <span>
              <b>…{code.tail}</b> · {code.days} días {code.price ? `· ${code.currency} ${code.price}` : ''}
              <small>
                {code.for_email ? `para ${code.for_email} · ` : ''}{code.redeemed_at ? `canjeado por ${code.redeemed_email ?? '—'} el ${fmtDate(code.redeemed_at)}` : code.revoked ? 'revocado' : `vence ${fmtDate(code.expires_at)}`}{code.note ? ` · ${code.note}` : ''}
              </small>
            </span>
            {!code.redeemed_at && !code.revoked && <button type="button" className="btn-ghost small" onClick={() => api.adminRevokeCode(code.id).then(reload)}>Revocar</button>}
          </li>
        ))}
      </ul>

      <details className="collapsible" onToggle={(event) => { if ((event.target as HTMLDetailsElement).open) api.adminAudit().then(({ events }) => setAudit(events)).catch(() => undefined) }}>
        <summary><History size={16} aria-hidden="true" /> Bitácora de seguridad (últimos 150 eventos)</summary>
        <ul className="ai-runs">
          {audit.map((event, index) => (
            <li key={index}><b>{new Date(event.created_at).toLocaleString('es-PE')}</b> · {event.action} · {event.target ?? ''} <small>{event.detail}</small></li>
          ))}
        </ul>
      </details>

      <div className="issued-actions">
        <button type="button" className="btn-secondary small" onClick={() => { setAlertsNote('Consultando fuentes…'); api.adminRefreshAlerts().then(({ report }) => setAlertsNote(report.map((row) => `${row.source}: ${row.ok ? `${row.kept}/${row.found}` : `error ${row.error}`}`).join(' · '))).catch((caught) => setAlertsNote(caught instanceof Error ? caught.message : 'Error')) }}>
          <RefreshCw size={14} /> Actualizar alertas normativas ahora
        </button>
      </div>
      {alertsNote && <p className="ssoma-count">{alertsNote}</p>}
    </section>
  )
}
