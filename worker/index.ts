/**
 * Observatorio SST Peru - API en Cloudflare Workers.
 *
 * Sirve el frontend estatico (binding ASSETS) y expone /api/* sobre D1:
 * - autenticacion por correo + clave (PBKDF2) con sesion en cookie HttpOnly
 * - guias premium (el contenido vive solo en el servidor)
 * - avance del plan premium por usuario
 * - solicitudes de acceso y administracion basica de usuarios
 * - contador publico de descargas
 */
import { PREMIUM_GUIDES } from './premiumGuides'

interface Env {
  DB: D1Database
  ASSETS: Fetcher
}

interface UserRow {
  id: string
  email: string
  name: string | null
  organization: string | null
  role: 'admin' | 'member'
  pass_hash: string
  pass_salt: string
  created_at: string
  last_login: string | null
}

type PublicUser = Pick<UserRow, 'id' | 'email' | 'name' | 'organization' | 'role' | 'created_at' | 'last_login'>

const SESSION_COOKIE = 'obs_session'
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7
const PBKDF2_ITERATIONS = 100_000
const MAX_FAILED_LOGINS = 6
const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000
const PROGRESS_STATUSES = new Set(['pendiente', 'en-curso', 'hecho'])

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)
    if (!url.pathname.startsWith('/api/')) return env.ASSETS.fetch(request)
    try {
      return await route(request, env, url)
    } catch (error) {
      console.error('api error', error)
      return json({ error: 'Error interno del servidor.' }, 500)
    }
  },
} satisfies ExportedHandler<Env>

async function route(request: Request, env: Env, url: URL): Promise<Response> {
  const { pathname } = url
  const method = request.method

  if (method !== 'GET' && method !== 'HEAD' && !sameOrigin(request, url)) {
    return json({ error: 'Origen no permitido.' }, 403)
  }

  if (pathname === '/api/health') return json({ ok: true, service: 'observatorio-sst', time: new Date().toISOString() })

  if (pathname === '/api/stats' && method === 'GET') return getStats(env)
  if (pathname.startsWith('/api/downloads/') && method === 'POST') {
    return countDownload(env, decodeURIComponent(pathname.slice('/api/downloads/'.length)))
  }

  if (pathname === '/api/auth/login' && method === 'POST') return login(request, env)
  if (pathname === '/api/auth/logout' && method === 'POST') return logout(request, env)
  if (pathname === '/api/auth/me' && method === 'GET') {
    const user = await currentUser(request, env)
    return json({ user: user ? toPublic(user) : null })
  }
  if (pathname === '/api/access-requests' && method === 'POST') return createAccessRequest(request, env)

  // --- A partir de aqui se requiere sesion ---
  const user = await currentUser(request, env)
  if (!user) return json({ error: 'Inicie sesión para continuar.' }, 401)

  if (pathname === '/api/auth/password' && method === 'POST') return changePassword(request, env, user)

  if (pathname === '/api/premium/guides' && method === 'GET') {
    return json({
      guides: PREMIUM_GUIDES.map(({ id, title, summary, minutes, level, tags }) => ({ id, title, summary, minutes, level, tags })),
    })
  }
  if (pathname.startsWith('/api/premium/guides/') && method === 'GET') {
    const guide = PREMIUM_GUIDES.find((item) => item.id === pathname.slice('/api/premium/guides/'.length))
    return guide ? json({ guide }) : json({ error: 'Guía no encontrada.' }, 404)
  }

  if (pathname === '/api/progress' && method === 'GET') return getProgress(env, user)
  if (pathname === '/api/progress' && method === 'PUT') return putProgress(request, env, user)

  // --- Administracion ---
  if (pathname.startsWith('/api/admin/')) {
    if (user.role !== 'admin') return json({ error: 'Solo administradores.' }, 403)
    if (pathname === '/api/admin/users' && method === 'GET') return listUsers(env)
    if (pathname === '/api/admin/users' && method === 'POST') return createUser(request, env)
    if (pathname.startsWith('/api/admin/users/') && method === 'DELETE') {
      const id = pathname.slice('/api/admin/users/'.length)
      if (id === user.id) return json({ error: 'No puede eliminar su propia cuenta.' }, 400)
      await env.DB.prepare('DELETE FROM users WHERE id = ?').bind(id).run()
      return json({ ok: true })
    }
    if (pathname === '/api/admin/requests' && method === 'GET') {
      const { results } = await env.DB.prepare('SELECT * FROM access_requests ORDER BY created_at DESC LIMIT 200').all()
      return json({ requests: results })
    }
    if (pathname.startsWith('/api/admin/requests/') && method === 'PATCH') {
      const id = Number(pathname.slice('/api/admin/requests/'.length))
      const body = await readJson<{ status?: string }>(request)
      if (!body?.status || !['pendiente', 'aprobada', 'rechazada'].includes(body.status)) {
        return json({ error: 'Estado inválido.' }, 400)
      }
      await env.DB.prepare('UPDATE access_requests SET status = ? WHERE id = ?').bind(body.status, id).run()
      return json({ ok: true })
    }
  }

  return json({ error: 'Ruta no encontrada.' }, 404)
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

async function login(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: string; password?: string }>(request)
  const email = normalizeEmail(body?.email)
  const password = body?.password ?? ''
  if (!email || !password) return json({ error: 'Ingrese correo y clave.' }, 400)

  const now = Date.now()
  const attempt = await env.DB.prepare('SELECT count, window_start FROM login_attempts WHERE email = ?')
    .bind(email)
    .first<{ count: number; window_start: number }>()
  if (attempt && now - attempt.window_start < FAILED_LOGIN_WINDOW_MS && attempt.count >= MAX_FAILED_LOGINS) {
    return json({ error: 'Demasiados intentos. Espere 15 minutos e intente de nuevo.' }, 429)
  }

  const user = await env.DB.prepare('SELECT * FROM users WHERE email = ?').bind(email).first<UserRow>()
  const valid = user ? await verifyPassword(password, user.pass_salt, user.pass_hash) : false
  if (!user || !valid) {
    const fresh = !attempt || now - attempt.window_start >= FAILED_LOGIN_WINDOW_MS
    await env.DB.prepare(
      `INSERT INTO login_attempts (email, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT(email) DO UPDATE SET count = CASE WHEN ?3 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN ?3 THEN ?2 ELSE window_start END`,
    )
      .bind(email, now, fresh ? 1 : 0)
      .run()
    return json({ error: 'Correo o clave incorrectos.' }, 401)
  }

  const token = randomToken()
  const expiresAt = Math.floor(now / 1000) + SESSION_TTL_SECONDS
  await env.DB.batch([
    env.DB.prepare('INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)').bind(await sha256(token), user.id, expiresAt),
    env.DB.prepare("UPDATE users SET last_login = datetime('now') WHERE id = ?").bind(user.id),
    env.DB.prepare('DELETE FROM login_attempts WHERE email = ?').bind(email),
    env.DB.prepare('DELETE FROM sessions WHERE expires_at < ?').bind(Math.floor(now / 1000)),
  ])

  return json({ user: toPublic(user) }, 200, {
    'Set-Cookie': `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`,
  })
}

async function logout(request: Request, env: Env): Promise<Response> {
  const token = readCookie(request, SESSION_COOKIE)
  if (token) await env.DB.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(await sha256(token)).run()
  return json({ ok: true }, 200, { 'Set-Cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` })
}

async function currentUser(request: Request, env: Env): Promise<UserRow | null> {
  const token = readCookie(request, SESSION_COOKIE)
  if (!token) return null
  return env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`,
  )
    .bind(await sha256(token), Math.floor(Date.now() / 1000))
    .first<UserRow>()
}

async function changePassword(request: Request, env: Env, user: UserRow): Promise<Response> {
  const body = await readJson<{ current?: string; next?: string }>(request)
  if (!body?.current || !body.next) return json({ error: 'Complete ambas claves.' }, 400)
  if (body.next.length < 10) return json({ error: 'La nueva clave debe tener al menos 10 caracteres.' }, 400)
  if (!(await verifyPassword(body.current, user.pass_salt, user.pass_hash))) {
    return json({ error: 'La clave actual no es correcta.' }, 401)
  }
  const { hash, salt } = await hashPassword(body.next)
  const token = readCookie(request, SESSION_COOKIE) ?? ''
  await env.DB.batch([
    env.DB.prepare('UPDATE users SET pass_hash = ?, pass_salt = ? WHERE id = ?').bind(hash, salt, user.id),
    // Cierra las otras sesiones abiertas con la clave anterior.
    env.DB.prepare('DELETE FROM sessions WHERE user_id = ? AND token_hash <> ?').bind(user.id, await sha256(token)),
  ])
  return json({ ok: true })
}

// ---------------------------------------------------------------------------
// Progreso, descargas y solicitudes
// ---------------------------------------------------------------------------

async function getProgress(env: Env, user: UserRow): Promise<Response> {
  const { results } = await env.DB.prepare('SELECT item_id, status, note, updated_at FROM progress WHERE user_id = ?')
    .bind(user.id)
    .all()
  return json({ items: results })
}

async function putProgress(request: Request, env: Env, user: UserRow): Promise<Response> {
  const body = await readJson<{ items?: Array<{ item_id?: string; status?: string; note?: string }> }>(request)
  const items = (body?.items ?? []).filter(
    (item): item is { item_id: string; status: string; note?: string } =>
      typeof item.item_id === 'string' && item.item_id.length <= 80 && PROGRESS_STATUSES.has(item.status ?? ''),
  )
  if (items.length === 0 || items.length > 100) return json({ error: 'Sin cambios válidos.' }, 400)
  await env.DB.batch(
    items.map((item) =>
      env.DB.prepare(
        `INSERT INTO progress (user_id, item_id, status, note, updated_at) VALUES (?1, ?2, ?3, ?4, datetime('now'))
         ON CONFLICT(user_id, item_id) DO UPDATE SET status = ?3, note = ?4, updated_at = datetime('now')`,
      ).bind(user.id, item.item_id, item.status, (item.note ?? '').slice(0, 500)),
    ),
  )
  return getProgress(env, user)
}

async function getStats(env: Env): Promise<Response> {
  const [downloads, users, requests] = await env.DB.batch([
    env.DB.prepare('SELECT item_id, count FROM download_stats ORDER BY count DESC'),
    env.DB.prepare('SELECT COUNT(*) AS total FROM users'),
    env.DB.prepare("SELECT COUNT(*) AS total FROM access_requests WHERE status = 'pendiente'"),
  ])
  const rows = (downloads.results ?? []) as Array<{ item_id: string; count: number }>
  return json({
    downloads: rows,
    totalDownloads: rows.reduce((sum, row) => sum + row.count, 0),
    members: (users.results?.[0] as { total: number } | undefined)?.total ?? 0,
    pendingRequests: (requests.results?.[0] as { total: number } | undefined)?.total ?? 0,
  })
}

async function countDownload(env: Env, itemId: string): Promise<Response> {
  if (!/^[a-z0-9-]{2,80}$/i.test(itemId)) return json({ error: 'Identificador inválido.' }, 400)
  await env.DB.prepare(
    `INSERT INTO download_stats (item_id, count, updated_at) VALUES (?, 1, datetime('now'))
     ON CONFLICT(item_id) DO UPDATE SET count = count + 1, updated_at = datetime('now')`,
  )
    .bind(itemId)
    .run()
  return json({ ok: true })
}

async function createAccessRequest(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ name?: string; email?: string; organization?: string; message?: string; website?: string }>(request)
  // Campo trampa: los bots suelen rellenarlo.
  if (body?.website) return json({ ok: true })
  const email = normalizeEmail(body?.email)
  const name = (body?.name ?? '').trim()
  if (!email || name.length < 2) return json({ error: 'Indique nombre y un correo válido.' }, 400)
  const recent = await env.DB.prepare(
    "SELECT COUNT(*) AS total FROM access_requests WHERE email = ? AND created_at > datetime('now', '-1 day')",
  )
    .bind(email)
    .first<{ total: number }>()
  if ((recent?.total ?? 0) >= 3) return json({ error: 'Ya registramos su solicitud. Le responderemos pronto.' }, 429)
  await env.DB.prepare('INSERT INTO access_requests (name, email, organization, message) VALUES (?, ?, ?, ?)')
    .bind(name.slice(0, 120), email, (body?.organization ?? '').slice(0, 160), (body?.message ?? '').slice(0, 1000))
    .run()
  return json({ ok: true }, 201)
}

async function listUsers(env: Env): Promise<Response> {
  const { results } = await env.DB.prepare(
    'SELECT id, email, name, organization, role, created_at, last_login FROM users ORDER BY created_at DESC',
  ).all()
  return json({ users: results })
}

async function createUser(request: Request, env: Env): Promise<Response> {
  const body = await readJson<{ email?: string; name?: string; organization?: string; role?: string; password?: string }>(request)
  const email = normalizeEmail(body?.email)
  if (!email) return json({ error: 'Correo inválido.' }, 400)
  const password = body?.password && body.password.length >= 10 ? body.password : generatePassword()
  const role = body?.role === 'admin' ? 'admin' : 'member'
  const { hash, salt } = await hashPassword(password)
  try {
    await env.DB.prepare(
      'INSERT INTO users (id, email, name, organization, role, pass_hash, pass_salt) VALUES (?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(crypto.randomUUID(), email, body?.name ?? null, body?.organization ?? null, role, hash, salt)
      .run()
  } catch {
    return json({ error: 'Ya existe un usuario con ese correo.' }, 409)
  }
  // La clave inicial se devuelve una sola vez para que el administrador la entregue.
  return json({ ok: true, email, password }, 201)
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...headers },
  })
}

async function readJson<T>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T
  } catch {
    return null
  }
}

function sameOrigin(request: Request, url: URL): boolean {
  const origin = request.headers.get('Origin')
  return !origin || origin === url.origin
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const email = value.trim().toLowerCase()
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) && email.length <= 160 ? email : null
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('Cookie') ?? ''
  for (const part of header.split(';')) {
    const [key, ...rest] = part.trim().split('=')
    if (key === name) return rest.join('=') || null
  }
  return null
}

function toPublic(user: UserRow): PublicUser {
  const { id, email, name, organization, role, created_at, last_login } = user
  return { id, email, name, organization, role, created_at, last_login }
}

function toBase64(bytes: ArrayBuffer | Uint8Array): string {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let binary = ''
  for (const byte of view) binary += String.fromCharCode(byte)
  return btoa(binary)
}

function fromBase64(value: string): Uint8Array {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

function randomToken(): string {
  return toBase64(crypto.getRandomValues(new Uint8Array(32))).replace(/[+/=]/g, (c) => ({ '+': '-', '/': '_', '=': '' })[c] ?? '')
}

function generatePassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const bytes = crypto.getRandomValues(new Uint8Array(14))
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('')
}

async function sha256(value: string): Promise<string> {
  return toBase64(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value)))
}

async function pbkdf2(password: string, salt: Uint8Array): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PBKDF2_ITERATIONS }, key, 256)
  return toBase64(bits)
}

async function hashPassword(password: string): Promise<{ hash: string; salt: string }> {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { hash: await pbkdf2(password, salt), salt: toBase64(salt) }
}

async function verifyPassword(password: string, salt: string, expected: string): Promise<boolean> {
  const actual = await pbkdf2(password, fromBase64(salt))
  if (actual.length !== expected.length) return false
  let diff = 0
  for (let index = 0; index < actual.length; index += 1) diff |= actual.charCodeAt(index) ^ expected.charCodeAt(index)
  return diff === 0
}
