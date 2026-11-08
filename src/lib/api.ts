/**
 * Cliente de la API del Observatorio (Cloudflare Worker en /api).
 * En GitHub Pages no hay backend: las funciones devuelven `offline` y la UI lo explica.
 */
import type { Guard } from './guard'

export interface ApiUser {
  id: string
  email: string
  name: string | null
  organization: string | null
  role: 'admin' | 'member'
  created_at: string
  last_login: string | null
  dni?: string | null
  premium?: PremiumState
  mustChange?: boolean
  consentOk?: boolean
  consentVersion?: string
}

export interface PremiumState {
  active: boolean
  until: string | null
  daysLeft: number | null
  enabled: boolean
  reason: 'administrador' | 'vigente' | 'vencido' | 'sin-prueba' | 'deshabilitado' | 'suspendida'
}

export interface AdminUser extends Omit<ApiUser, 'dni' | 'premium'> {
  dni: string | null
  premium_until: string | null
  premium_enabled: number
  must_change: number
  consent_at: string | null
  suspended: number
  premium: PremiumState
}

export interface AccessCode {
  id: string
  tail: string
  days: number
  price: number | null
  currency: string | null
  note: string | null
  for_email: string | null
  created_at: string
  expires_at: string | null
  redeemed_at: string | null
  redeemed_email: string | null
  revoked: number
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
  dni?: string | null
  phone?: string | null
  kind?: 'acceso' | 'extension' | 'clave'
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
  login: (email: string, password: string, guard: Guard, website = '') =>
    request<{ user: ApiUser }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password, guard, website }) }),
  resetRequest: (payload: { email: string; dni: string; guard: Guard; website?: string }) =>
    request<{ ok: true }>('/auth/reset-request', { method: 'POST', body: JSON.stringify(payload) }),
  consent: (version: string) =>
    request<{ ok: true; consentAt: string }>('/account/consent', { method: 'POST', body: JSON.stringify({ version, datos: true, terminos: true, ia: true }) }),
  redeem: (code: string, guard: Guard) =>
    request<{ ok: true; premiumUntil: string; days: number }>('/account/redeem', { method: 'POST', body: JSON.stringify({ code, guard }) }),
  requestExtension: (plan: string, message: string) =>
    request<{ ok: true }>('/account/extension', { method: 'POST', body: JSON.stringify({ plan, message }) }),
  logout: () => request<{ ok: true }>('/auth/logout', { method: 'POST' }),
  changePassword: (current: string, next: string) =>
    request<{ ok: true }>('/auth/password', { method: 'POST', body: JSON.stringify({ current, next }) }),
  guides: () => request<{ guides: PremiumGuideSummary[] }>('/premium/guides'),
  guide: (id: string) => request<{ guide: PremiumGuide }>(`/premium/guides/${encodeURIComponent(id)}`),
  progress: () => request<{ items: ProgressItem[] }>('/progress'),
  saveProgress: (items: Array<{ item_id: string; status: ProgressStatus; note?: string }>) =>
    request<{ items: ProgressItem[] }>('/progress', { method: 'PUT', body: JSON.stringify({ items }) }),
  requestAccess: (payload: { name: string; email: string; dni: string; phone?: string; organization?: string; message?: string; website?: string; guard: Guard }) =>
    request<{ ok: true }>('/access-requests', { method: 'POST', body: JSON.stringify(payload) }),
  stats: () =>
    request<{ downloads: Array<{ item_id: string; count: number }>; totalDownloads: number; members: number; pendingRequests: number }>(
      '/stats',
    ),
  compliance: () =>
    request<{ state: { profile: import('../catalog').OrgProfile; entries: Record<string, import('../catalog').ComplianceEntry>; updatedAt: string } | null }>(
      '/compliance',
    ),
  saveCompliance: (state: { profile: unknown; entries: unknown; updatedAt: string }) =>
    request<{ ok: true }>('/compliance', { method: 'PUT', body: JSON.stringify(state) }),
  adminUsers: () => request<{ users: AdminUser[] }>('/admin/users'),
  adminCreateUser: (payload: { email: string; name?: string; organization?: string; role?: 'admin' | 'member'; dni?: string; trialDays?: number; requestId?: number }) =>
    request<{ ok: true; email: string; password: string; premiumUntil: string | null; trialDays: number }>('/admin/users', { method: 'POST', body: JSON.stringify(payload) }),
  adminUpdateUser: (id: string, payload: { premiumEnabled?: boolean; suspended?: boolean; addDays?: number; until?: null; dni?: string }) =>
    request<{ ok: true }>(`/admin/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  adminResetPassword: (id: string) => request<{ ok: true; email: string; password: string }>(`/admin/users/${encodeURIComponent(id)}/reset`, { method: 'POST' }),
  adminCodes: () => request<{ codes: AccessCode[] }>('/admin/codes'),
  adminCreateCode: (payload: { days: number; price?: number; currency?: string; note?: string; forEmail?: string; validDays?: number }) =>
    request<{ ok: true; code: string; days: number; expiresAt: string }>('/admin/codes', { method: 'POST', body: JSON.stringify(payload) }),
  adminRevokeCode: (id: string) => request<{ ok: true }>(`/admin/codes/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminAudit: () => request<{ events: Array<{ actor: string | null; action: string; target: string | null; detail: string; created_at: string }> }>('/admin/audit'),
  adminRefreshAlerts: () => request<{ report: Array<{ source: string; ok: boolean; found: number; kept: number; error?: string }> }>('/admin/alerts/refresh', { method: 'POST' }),
  adminDeleteUser: (id: string) => request<{ ok: true }>(`/admin/users/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  adminRequests: () => request<{ requests: AccessRequest[] }>('/admin/requests'),
  adminSetRequest: (id: number, status: AccessRequest['status']) =>
    request<{ ok: true }>(`/admin/requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
}

/** Suma una descarga al contador publico. Nunca bloquea la descarga si falla. */
export function trackDownload(itemId: string): void {
  void request(`/downloads/${encodeURIComponent(itemId)}`, { method: 'POST' }).catch(() => undefined)
}
