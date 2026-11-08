/**
 * Cuentas premium: periodo de prueba, códigos de extensión, consentimiento y defensas anti-bots.
 *
 * Defensas:
 * - Prueba de trabajo (proof of work) firmada con HMAC: el navegador debe calcular un hash antes de
 *   enviar login, solicitudes o códigos. Es invisible para una persona y caro para un bot masivo;
 *   la dificultad sube si la IP acumula fallos.
 * - Límite de intentos por IP (huella SHA-256, no se guarda la IP) y por correo.
 * - Campo trampa y tiempo mínimo de llenado del formulario.
 * - Mensajes genéricos (no revelan si un correo existe) y bitácora de auditoría.
 */
import { CONSENT_VERSION } from '../src/data/consent'
import { generatePassword, hashPassword, hmacHex, sha256, sha256Bytes } from './crypto'

export interface AccEnv {
  DB: D1Database
  AI_KEY_SECRET?: string
}

export interface AccountRow {
  id: string
  email: string
  name: string | null
  organization: string | null
  role: 'admin' | 'member'
  dni?: string | null
  premium_until?: string | null
  premium_enabled?: number | null
  must_change?: number | null
  consent_version?: string | null
  consent_at?: string | null
  suspended?: number | null
  plan?: string | null
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } })

const secretOf = (env: AccEnv) => env.AI_KEY_SECRET ?? 'observatorio-dev-secret'
export const TRIAL_DEFAULT_DAYS = 7
export const TRIAL_MAX_DAYS = 30

/* ---------- Esquema (se crea al primer uso; ALTER solo si falta la columna) ---------- */

let schemaReady = false
export async function ensureAccountSchema(env: AccEnv) {
  if (schemaReady) return
  const columns = async (table: string) =>
    new Set(((await env.DB.prepare(`PRAGMA table_info(${table})`).all<{ name: string }>()).results ?? []).map((row) => row.name))
  const userCols = await columns('users')
  const wantedUser: Array<[string, string]> = [
    ['dni', 'TEXT'],
    ['premium_until', 'TEXT'],
    ['premium_enabled', 'INTEGER NOT NULL DEFAULT 1'],
    ['must_change', 'INTEGER NOT NULL DEFAULT 0'],
    ['consent_version', 'TEXT'],
    ['consent_at', 'TEXT'],
    ['suspended', 'INTEGER NOT NULL DEFAULT 0'],
    ['plan', "TEXT NOT NULL DEFAULT 'prueba'"],
  ]
  const reqCols = await columns('access_requests')
  const wantedReq: Array<[string, string]> = [['dni', 'TEXT'], ['kind', "TEXT NOT NULL DEFAULT 'acceso'"], ['phone', 'TEXT']]
  const statements = [
    ...wantedUser.filter(([name]) => !userCols.has(name)).map(([name, type]) => env.DB.prepare(`ALTER TABLE users ADD COLUMN ${name} ${type}`)),
    ...wantedReq.filter(([name]) => !reqCols.has(name)).map(([name, type]) => env.DB.prepare(`ALTER TABLE access_requests ADD COLUMN ${name} ${type}`)),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS access_codes (
      id TEXT PRIMARY KEY, code_hash TEXT NOT NULL UNIQUE, tail TEXT NOT NULL, days INTEGER NOT NULL, price REAL, currency TEXT,
      note TEXT, for_email TEXT, created_by TEXT, created_at TEXT NOT NULL, expires_at TEXT, redeemed_by TEXT, redeemed_at TEXT,
      revoked INTEGER NOT NULL DEFAULT 0)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, version TEXT NOT NULL, clauses TEXT NOT NULL,
      ip_hash TEXT, user_agent TEXT, accepted_at TEXT NOT NULL)`),
    env.DB.prepare(`CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT, actor TEXT, action TEXT NOT NULL, target TEXT, detail TEXT, ip_hash TEXT, created_at TEXT NOT NULL)`),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS ip_attempts (k TEXT PRIMARY KEY, count INTEGER NOT NULL, window_start INTEGER NOT NULL)'),
    env.DB.prepare('CREATE TABLE IF NOT EXISTS pow_used (nonce TEXT PRIMARY KEY, exp INTEGER NOT NULL)'),
  ]
  await env.DB.batch(statements)
  schemaReady = true
}

/* ---------- Estado premium ---------- */

export function premiumState(user: AccountRow) {
  const until = user.premium_until ?? null
  const msLeft = until ? new Date(until).getTime() - Date.now() : -1
  const enabled = (user.premium_enabled ?? 1) === 1
  const suspended = (user.suspended ?? 0) === 1
  const active = !suspended && (user.role === 'admin' || (enabled && msLeft > 0))
  return {
    active,
    plan: user.role === 'admin' ? 'admin' : user.plan === 'pagado' ? 'pagado' : 'prueba',
    until,
    daysLeft: user.role === 'admin' ? null : msLeft > 0 ? Math.ceil(msLeft / 86_400_000) : 0,
    enabled,
    reason: suspended ? 'suspendida' : user.role === 'admin' ? 'administrador' : !enabled ? 'deshabilitado' : msLeft > 0 ? 'vigente' : until ? 'vencido' : 'sin-prueba',
  }
}

export function accountView(user: AccountRow) {
  return {
    dni: user.dni ? `••••${user.dni.slice(-3)}` : null,
    premium: premiumState(user),
    mustChange: (user.must_change ?? 0) === 1,
    consentOk: user.consent_version === CONSENT_VERSION,
    consentVersion: CONSENT_VERSION,
  }
}

/* ---------- Utilidades de seguridad ---------- */

export async function ipHash(request: Request, env: AccEnv): Promise<string> {
  const ip = request.headers.get('CF-Connecting-IP') ?? 'local'
  return (await sha256(`${secretOf(env)}|ip|${ip}`)).slice(0, 22)
}

/** Ventana deslizante simple. Devuelve false si se superó el límite. */
export async function bump(env: AccEnv, key: string, limit: number, windowMs: number): Promise<boolean> {
  const now = Date.now()
  const row = await env.DB.prepare('SELECT count, window_start FROM ip_attempts WHERE k = ?').bind(key).first<{ count: number; window_start: number }>()
  if (row && now - row.window_start < windowMs) {
    if (row.count >= limit) return false
    await env.DB.prepare('UPDATE ip_attempts SET count = count + 1 WHERE k = ?').bind(key).run()
    return true
  }
  await env.DB.prepare('INSERT INTO ip_attempts (k, count, window_start) VALUES (?1, 1, ?2) ON CONFLICT(k) DO UPDATE SET count = 1, window_start = ?2').bind(key, now).run()
  return true
}

async function failures(env: AccEnv, key: string, windowMs: number): Promise<number> {
  const row = await env.DB.prepare('SELECT count, window_start FROM ip_attempts WHERE k = ?').bind(key).first<{ count: number; window_start: number }>()
  return row && Date.now() - row.window_start < windowMs ? row.count : 0
}

export async function audit(env: AccEnv, actor: string | null, action: string, target: string | null, detail: string, ip: string | null) {
  await env.DB.prepare('INSERT INTO audit_log (actor, action, target, detail, ip_hash, created_at) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(actor, action, target, detail.slice(0, 400), ip, new Date().toISOString())
    .run()
}

/* ---------- Prueba de trabajo ---------- */

const POW_BASE_BITS = 16
const POW_HARD_BITS = 19
const POW_TTL_MS = 5 * 60 * 1000

export async function issueChallenge(request: Request, env: AccEnv): Promise<Response> {
  await ensureAccountSchema(env)
  const ip = await ipHash(request, env)
  if (!(await bump(env, `ch:${ip}`, 60, 10 * 60 * 1000))) return json({ error: 'Demasiadas solicitudes. Espere unos minutos.' }, 429)
  const hard = (await failures(env, `fail:${ip}`, 30 * 60 * 1000)) >= 4
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('')
  const exp = Date.now() + POW_TTL_MS
  const bits = hard ? POW_HARD_BITS : POW_BASE_BITS
  const sig = await hmacHex(secretOf(env), `${nonce}.${exp}.${bits}`)
  return json({ nonce, exp, bits, sig })
}

export interface Guard { nonce?: string; exp?: number; bits?: number; sig?: string; counter?: number; elapsed?: number }

function leadingZeroBits(bytes: Uint8Array): number {
  let bits = 0
  for (const byte of bytes) {
    if (byte === 0) { bits += 8; continue }
    bits += Math.clz32(byte) - 24
    break
  }
  return bits
}

/** Valida la prueba de trabajo, el tiempo de llenado y el campo trampa. Devuelve un mensaje de error o null. */
export async function checkGuard(env: AccEnv, guard: Guard | undefined, honeypot?: string): Promise<string | null> {
  await ensureAccountSchema(env)
  if (honeypot) return 'Solicitud rechazada.'
  if (!guard?.nonce || !guard.sig || typeof guard.exp !== 'number' || typeof guard.bits !== 'number' || typeof guard.counter !== 'number') {
    return 'Falta la verificación de seguridad. Recargue la página.'
  }
  if (typeof guard.elapsed === 'number' && guard.elapsed < 1500) return 'Formulario enviado demasiado rápido. Intente de nuevo.'
  if (guard.exp < Date.now()) return 'La verificación expiró. Intente de nuevo.'
  if (guard.bits < POW_BASE_BITS) return 'Verificación inválida.'
  const expected = await hmacHex(secretOf(env), `${guard.nonce}.${guard.exp}.${guard.bits}`)
  if (expected !== guard.sig) return 'Verificación inválida.'
  if (leadingZeroBits(await sha256Bytes(`${guard.nonce}:${guard.counter}`)) < guard.bits) return 'Verificación inválida.'
  const used = await env.DB.prepare('INSERT OR IGNORE INTO pow_used (nonce, exp) VALUES (?, ?)').bind(guard.nonce, guard.exp).run()
  if (!used.meta.changes) return 'Verificación ya utilizada. Intente de nuevo.'
  if (Math.random() < 0.05) await env.DB.prepare('DELETE FROM pow_used WHERE exp < ?').bind(Date.now()).run()
  return null
}

export async function noteFailure(request: Request, env: AccEnv) {
  await bump(env, `fail:${await ipHash(request, env)}`, 10_000, 30 * 60 * 1000)
}

/* ---------- Política de claves ---------- */

const COMMON = ['password', 'contraseña', '123456', 'qwerty', 'admin', 'observatorio', 'prevenir', 'peru', 'seguridad']
export function passwordProblem(password: string, email: string): string | null {
  if (password.length < 10) return 'La clave debe tener al menos 10 caracteres.'
  if (password.length > 128) return 'La clave es demasiado larga.'
  if (!/[a-záéíóúñ]/i.test(password) || !/\d/.test(password)) return 'Combine letras y números.'
  const lower = password.toLowerCase()
  const local = email.split('@')[0].toLowerCase()
  if (local.length >= 4 && lower.includes(local)) return 'La clave no debe contener su correo.'
  if (COMMON.some((word) => lower.includes(word)) && password.length < 14) return 'La clave es demasiado predecible.'
  return null
}

/* ---------- Usuario ---------- */

const clampDays = (value: unknown, fallback: number) => {
  const days = Math.round(Number(value))
  return Number.isFinite(days) && days >= 0 ? Math.min(days, 366) : fallback
}
const addDays = (fromIso: string | null | undefined, days: number) => {
  const base = Math.max(Date.now(), fromIso ? new Date(fromIso).getTime() || 0 : 0)
  return new Date(base + days * 86_400_000).toISOString()
}
export const validDni = (value: unknown) => (typeof value === 'string' && /^[0-9A-Z]{8,12}$/i.test(value.trim()) ? value.trim().toUpperCase() : null)

export async function adminCreateUser(request: Request, env: AccEnv, adminId: string): Promise<Response> {
  await ensureAccountSchema(env)
  const body = (await request.json().catch(() => null)) as
    | { email?: string; name?: string; organization?: string; role?: string; dni?: string; trialDays?: number; requestId?: number }
    | null
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 160) return json({ error: 'Correo inválido.' }, 400)
  const dni = body?.dni ? validDni(body.dni) : null
  if (body?.dni && !dni) return json({ error: 'DNI o documento inválido (8 a 12 caracteres).' }, 400)
  const role = body?.role === 'admin' ? 'admin' : 'member'
  const trialDays = Math.min(clampDays(body?.trialDays, TRIAL_DEFAULT_DAYS), TRIAL_MAX_DAYS)
  const password = generatePassword()
  const { hash, salt } = await hashPassword(password)
  const premiumUntil = trialDays > 0 ? addDays(null, trialDays) : null
  try {
    await env.DB.prepare(
      `INSERT INTO users (id, email, name, organization, role, pass_hash, pass_salt, dni, premium_until, premium_enabled, must_change)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
    )
      .bind(crypto.randomUUID(), email, body?.name?.slice(0, 120) ?? null, body?.organization?.slice(0, 160) ?? null, role, hash, salt, dni, premiumUntil)
      .run()
  } catch {
    return json({ error: 'Ya existe un usuario con ese correo.' }, 409)
  }
  if (body?.requestId) await env.DB.prepare("UPDATE access_requests SET status = 'aprobada' WHERE id = ?").bind(body.requestId).run()
  await audit(env, adminId, 'crear-usuario', email, `prueba ${trialDays} días`, null)
  return json({ ok: true, email, password, premiumUntil, trialDays }, 201)
}

export async function adminListUsers(env: AccEnv): Promise<Response> {
  await ensureAccountSchema(env)
  const { results } = await env.DB.prepare(
    `SELECT id, email, name, organization, role, created_at, last_login, dni, premium_until, premium_enabled, must_change, consent_version, consent_at, suspended
     FROM users ORDER BY created_at DESC`,
  ).all<AccountRow & { created_at: string; last_login: string | null }>()
  return json({ users: results.map((row) => ({ ...row, premium: premiumState(row), consentOk: row.consent_version === CONSENT_VERSION })) })
}

export async function adminUpdateUser(request: Request, env: AccEnv, adminId: string, id: string): Promise<Response> {
  await ensureAccountSchema(env)
  const body = (await request.json().catch(() => null)) as { premiumEnabled?: boolean; suspended?: boolean; addDays?: number; until?: string | null; dni?: string; plan?: string } | null
  const user = await env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(id).first<AccountRow>()
  if (!user) return json({ error: 'Usuario no encontrado.' }, 404)
  if (id === adminId && body?.suspended) return json({ error: 'No puede suspender su propia cuenta.' }, 400)
  const sets: string[] = []
  const binds: unknown[] = []
  const changes: string[] = []
  if (typeof body?.premiumEnabled === 'boolean') { sets.push('premium_enabled = ?'); binds.push(body.premiumEnabled ? 1 : 0); changes.push(body.premiumEnabled ? 'premium habilitado' : 'premium deshabilitado') }
  if (typeof body?.suspended === 'boolean') { sets.push('suspended = ?'); binds.push(body.suspended ? 1 : 0); changes.push(body.suspended ? 'suspendida' : 'reactivada') }
  if (body?.addDays) {
    const days = clampDays(body.addDays, 0)
    if (days > 0) { sets.push('premium_until = ?'); binds.push(addDays(user.premium_until, days)); changes.push(`+${days} días`) }
  }
  if (body?.plan === 'prueba' || body?.plan === 'pagado') { sets.push('plan = ?'); binds.push(body.plan); changes.push(`plan ${body.plan}`) }
  if (body?.until === null) { sets.push('premium_until = NULL'); changes.push('sin vigencia') }
  if (body?.dni !== undefined) {
    const dni = validDni(body.dni)
    if (!dni) return json({ error: 'DNI inválido.' }, 400)
    sets.push('dni = ?'); binds.push(dni); changes.push('DNI actualizado')
  }
  if (!sets.length) return json({ error: 'Sin cambios.' }, 400)
  const statements = [env.DB.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`).bind(...binds, id)]
  if (body?.suspended) statements.push(env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id))
  await env.DB.batch(statements)
  await audit(env, adminId, 'editar-usuario', user.email, changes.join(', '), null)
  return json({ ok: true })
}

export async function adminResetPassword(env: AccEnv, adminId: string, id: string): Promise<Response> {
  await ensureAccountSchema(env)
  const user = await env.DB.prepare('SELECT email FROM users WHERE id = ?').bind(id).first<{ email: string }>()
  if (!user) return json({ error: 'Usuario no encontrado.' }, 404)
  const password = generatePassword()
  const { hash, salt } = await hashPassword(password)
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pass_hash = ?, pass_salt = ?, must_change = 1 WHERE id = ?').bind(hash, salt, id),
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ?').bind(id),
    env.DB.prepare("UPDATE access_requests SET status = 'aprobada' WHERE email = ? AND kind = 'clave' AND status = 'pendiente'").bind(user.email),
  ])
  await audit(env, adminId, 'restablecer-clave', user.email, 'clave temporal emitida', null)
  return json({ ok: true, email: user.email, password })
}

/* ---------- Códigos de extensión ---------- */

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
function newCode(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(12))
  const chars = Array.from(bytes, (byte) => CODE_ALPHABET[byte % CODE_ALPHABET.length]).join('')
  return `OBS-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`
}
const normalizeCode = (code: string) => code.toUpperCase().replace(/[^A-Z0-9]/g, '')
const codeHash = (env: AccEnv, code: string) => sha256(`${secretOf(env)}|code|${normalizeCode(code)}`)

export async function adminCodes(request: Request, env: AccEnv, adminId: string, sub: string): Promise<Response> {
  await ensureAccountSchema(env)
  if (request.method === 'GET') {
    const { results } = await env.DB.prepare(
      `SELECT c.id, c.tail, c.days, c.price, c.currency, c.note, c.for_email, c.created_at, c.expires_at, c.redeemed_at, c.revoked, u.email AS redeemed_email
       FROM access_codes c LEFT JOIN users u ON u.id = c.redeemed_by ORDER BY c.created_at DESC LIMIT 200`,
    ).all()
    return json({ codes: results })
  }
  if (request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { days?: number; price?: number; currency?: string; note?: string; forEmail?: string; validDays?: number } | null
    const days = clampDays(body?.days, 30)
    if (days < 1) return json({ error: 'Indique los días de acceso.' }, 400)
    const code = newCode()
    const forEmail = body?.forEmail ? body.forEmail.trim().toLowerCase().slice(0, 160) : null
    const expires = addDays(null, clampDays(body?.validDays, 30) || 30)
    await env.DB.prepare(
      'INSERT INTO access_codes (id, code_hash, tail, days, price, currency, note, for_email, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(crypto.randomUUID(), await codeHash(env, code), code.slice(-4), days, Number(body?.price) || null, (body?.currency ?? 'PEN').slice(0, 3), body?.note?.slice(0, 200) ?? null, forEmail, adminId, new Date().toISOString(), expires)
      .run()
    await audit(env, adminId, 'crear-codigo', forEmail, `${days} días · ${body?.price ?? 0} ${body?.currency ?? 'PEN'}`, null)
    // El código completo solo se muestra una vez.
    return json({ ok: true, code, days, expiresAt: expires }, 201)
  }
  if (request.method === 'DELETE' && sub) {
    await env.DB.prepare('UPDATE access_codes SET revoked = 1 WHERE id = ? AND redeemed_at IS NULL').bind(sub).run()
    await audit(env, adminId, 'revocar-codigo', sub, '', null)
    return json({ ok: true })
  }
  return json({ error: 'Ruta no encontrada.' }, 404)
}

/* ---------- Rutas de la propia cuenta ---------- */

export async function accountRoutes(request: Request, env: AccEnv, sub: string, user: AccountRow): Promise<Response> {
  await ensureAccountSchema(env)
  const ip = await ipHash(request, env)

  if (sub === '/consent' && request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { version?: string; datos?: boolean; terminos?: boolean; ia?: boolean } | null
    if (body?.version !== CONSENT_VERSION) return json({ error: 'La versión de los términos cambió. Recargue la página.' }, 409)
    if (!body.datos || !body.terminos || !body.ia) return json({ error: 'Debe aceptar las tres cláusulas para usar la zona premium.' }, 400)
    const now = new Date().toISOString()
    await env.DB.batch([
      env.DB.prepare('INSERT INTO consents (user_id, version, clauses, ip_hash, user_agent, accepted_at) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(user.id, CONSENT_VERSION, 'datos,terminos,ia', ip, (request.headers.get('User-Agent') ?? '').slice(0, 200), now),
      env.DB.prepare('UPDATE users SET consent_version = ?, consent_at = ? WHERE id = ?').bind(CONSENT_VERSION, now, user.id),
    ])
    return json({ ok: true, consentAt: now })
  }

  if (sub === '/redeem' && request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { code?: string; guard?: Guard } | null
    if (!(await bump(env, `redeem:${user.id}`, 8, 60 * 60 * 1000))) return json({ error: 'Demasiados intentos. Espere una hora.' }, 429)
    const guardError = await checkGuard(env, body?.guard)
    if (guardError) return json({ error: guardError }, 400)
    const row = await env.DB.prepare('SELECT * FROM access_codes WHERE code_hash = ?').bind(await codeHash(env, body?.code ?? '')).first<{
      id: string; days: number; for_email: string | null; expires_at: string | null; redeemed_at: string | null; revoked: number
    }>()
    if (!row || row.revoked || row.redeemed_at || (row.expires_at && row.expires_at < new Date().toISOString()) || (row.for_email && row.for_email !== user.email)) {
      await noteFailure(request, env)
      await audit(env, user.id, 'codigo-invalido', user.email, '', ip)
      return json({ error: 'Código no válido, vencido o ya utilizado.' }, 400)
    }
    const until = addDays(user.premium_until, row.days)
    const claimed = await env.DB.prepare('UPDATE access_codes SET redeemed_by = ?, redeemed_at = ? WHERE id = ? AND redeemed_at IS NULL')
      .bind(user.id, new Date().toISOString(), row.id)
      .run()
    if (!claimed.meta.changes) return json({ error: 'Código ya utilizado.' }, 400)
    await env.DB.prepare("UPDATE users SET premium_until = ?, premium_enabled = 1, plan = 'pagado' WHERE id = ?").bind(until, user.id).run()
    await audit(env, user.id, 'codigo-canjeado', user.email, `+${row.days} días`, ip)
    return json({ ok: true, premiumUntil: until, days: row.days })
  }

  if (sub === '/extension' && request.method === 'POST') {
    const body = (await request.json().catch(() => null)) as { message?: string; plan?: string; invoice?: string; ruc?: string; kind?: string } | null
    if (!(await bump(env, `ext:${user.id}`, 3, 24 * 60 * 60 * 1000))) return json({ error: 'Ya registramos su pedido. El administrador le responderá a su correo.' }, 429)
    const kind = body?.kind === 'plan' ? 'plan' : 'extension'
    const invoice = body?.invoice === 'factura' ? `factura${body.ruc ? ` RUC ${body.ruc.replace(/\D/g, '').slice(0, 11)}` : ''}` : body?.invoice === 'boleta' ? 'boleta' : 'sin comprobante'
    const message = `[${(body?.plan ?? 'Plan').slice(0, 40)}] [${invoice}] ${(body?.message ?? '').slice(0, 600)}`.trim()
    await env.DB.prepare('INSERT INTO access_requests (name, email, organization, message, dni, kind) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(user.name ?? user.email, user.email, user.organization ?? '', message, user.dni ?? null, kind)
      .run()
    await audit(env, user.id, kind === 'plan' ? 'pedido-cambio-plan' : 'pedido-extension', user.email, message, ip)
    return json({ ok: true })
  }

  return json({ error: 'Ruta no encontrada.' }, 404)
}

/** Solicitud pública de restablecimiento: siempre responde lo mismo para no revelar cuentas. */
export async function resetRequest(request: Request, env: AccEnv): Promise<Response> {
  await ensureAccountSchema(env)
  const body = (await request.json().catch(() => null)) as { email?: string; guard?: Guard; website?: string } | null
  const ip = await ipHash(request, env)
  if (!(await bump(env, `reset:${ip}`, 4, 60 * 60 * 1000))) return json({ error: 'Demasiadas solicitudes. Intente en una hora.' }, 429)
  const guardError = await checkGuard(env, body?.guard, body?.website)
  if (guardError) return json({ error: guardError }, 400)
  const email = (body?.email ?? '').trim().toLowerCase()
  const user = email ? await env.DB.prepare('SELECT id, name FROM users WHERE email = ?').bind(email).first<{ id: string; name: string | null }>() : null
  const already = user
    ? await env.DB.prepare("SELECT COUNT(*) AS n FROM access_requests WHERE email = ? AND kind = 'clave' AND status = 'pendiente'").bind(email).first<{ n: number }>()
    : null
  if (user && !already?.n) {
    await env.DB.prepare("INSERT INTO access_requests (name, email, message, kind) VALUES (?, ?, 'Olvidó su clave', 'clave')").bind(user.name ?? email, email).run()
    await audit(env, null, 'pedido-clave', email, '', ip)
  }
  return json({ ok: true })
}

export async function adminAudit(env: AccEnv): Promise<Response> {
  await ensureAccountSchema(env)
  const { results } = await env.DB.prepare('SELECT actor, action, target, detail, created_at FROM audit_log ORDER BY id DESC LIMIT 150').all()
  return json({ events: results })
}
