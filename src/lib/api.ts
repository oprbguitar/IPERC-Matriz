/**
 * Cliente de la API del Observatorio (Cloudflare Worker en /api).
 * En GitHub Pages no hay backend: las funciones devuelven `offline` y la UI lo explica.
 */
export interface ApiUser {
  id: string
  email: string
  name: string | null
  organization: string | null
  role: 'admin' | 'member'
  created_at: string
  last_login: string | null
}

export interface PremiumGuideSummary {
  id: string
  title: string
  summary: string
  minutes: number
  level: string
  tags: string[]
}

export interface PremiumGuide extends PremiumGuideSummary {
  body: string
}

export type ProgressStatus = 'pendiente' | 'en-curso' | 'hecho'

export interface ProgressItem {
  item_id: string
  status: ProgressStatus
  note: string | null
  updated_at: string
}

export interface AccessRequest {
  id: number
  name: string
  email: string
  organization: string | null
  message: string | null
  status: 'pendiente' | 'aprobada' | 'rechazada'
  created_at: string
}

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const API_BASE = `${import.meta.env.BASE_URL.replace(/\/$/, '')}/api`

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      credentials: 'same-origin',
      ...init,
      headers: init.body ? { 'Content-Type': 'application/json', ...init.headers } : init.headers,
    })
  } catch {
    throw new ApiError('Sin conexión con el servidor del Observatorio.', 0)
  }
  const isJson = response.headers.get('Content-Type')?.includes('application/json')
  if (!isJson) throw new ApiError('Servidor del Observatorio no disponible en este despliegue.', 0)
  const data = (await response.json()) as T & { error?: string }
  if (!response.ok) throw new ApiError(data.error ?? 'Error inesperado.', response.status)
  return data
}

export const api = {
  me: () => request<{ user: ApiUser | null }>('/auth/me'),
  login: (email: string, password: string) =>
    request<{ user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  changePassword: (current: string, next: string) =>
    request<{ ok: true }>('/auth/password', { method: 'POST', body: JSON.stringify({ current, next }) }),
  guides: () => request<{ guides: PremiumGuideSummary[] }>('/premium/guides'),
  guide: (id: string) => request<{ guide: PremiumGuide }>(`/premium/guides/${encodeURIComponent(id)}`),
  progress: () => request<{ items: ProgressItem[] }>('/progress'),
  saveProgress: (items: Array<{ item_id: string; status: ProgressStatus; note?: string }>) =>
    request<{ items: ProgressItem[] }>('/progress', { method: 'PUT', body: JSON.stringify({ items }) }),
  requestAccess: (payload: { name: string; email: string; organization?: string; message?: string; website?: string }) =>
    request<{ ok: true }>('/access-requests', { method: 'POST', body: JSON.stringify(payload) }),
  stats: () =>
    request<{ downloads: Array<{ item_id: string; count: number }>; totalDownloads: number; members: number; pendingRequests: number }>(
      '/stats',
    ),
  adminUsers: () => request<{ users: ApiUser[] }>('/admin/users'),
  adminCreateUser: (payload: { email: string; name?: string; organization?: string; role?: 'admin' | 'member' }) =>
    request<{ ok: true; email: string; password: string }>('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  adminDeleteUser: (id: string) => request<{ ok: true }>(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminRequests: () => request<{ requests: AccessRequest[] }>('/admin/requests'),
  adminSetRequest: (id: number, status: AccessRequest['status']) =>
    request<{ ok: true }>(`/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

/** Suma una descarga al contador publico. Nunca bloquea la descarga si falla. */
export function trackDownload(itemId: string): void {
  void request(`/downloads/${encodeURIComponent(itemId)}`, { method: 'POST' }).catch(() => undefined)
}
