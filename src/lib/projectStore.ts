import { isSupabaseConfigured, supabase } from './supabaseClient'
import type { CompanyProfile, JobPosition, SectorId, WorkArea, WorkTask } from '../types'

export type ProjectStatus = 'draft' | 'submitted' | 'approved' | 'archived'
export type StorageMode = 'supabase' | 'local'

export interface ProjectPayload {
  profile: CompanyProfile
  sector: SectorId
  areas: WorkArea[]
  positions: JobPosition[]
  tasks: WorkTask[]
}

export interface SavedProject {
  id: string
  companyName: string
  ruc: string | null
  sector: SectorId
  status: ProjectStatus
  payload: ProjectPayload
  createdAt: string
  updatedAt: string
  source: StorageMode
}

export interface StoreResult<T = void> {
  ok: boolean
  mode: StorageMode
  message: string
  data?: T
}

export interface ProjectFilters {
  query?: string
  sector?: SectorId | 'todos'
  status?: ProjectStatus | 'todos'
  from?: string
  to?: string
}

const LOCAL_KEY = 'iperc.projects.v1'
const DRAFT_KEY = 'iperc.autosave.v1'
const TABLE = 'iperc_snapshots'

// Statuses Supabase RLS accepts (see migration 002). If a project carries a
// status the deployed DB still rejects, the write simply falls back to local.
const SUPABASE_ALLOWED_STATUS: ProjectStatus[] = ['draft', 'submitted', 'approved', 'archived']

function uid(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function readLocal(): SavedProject[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as SavedProject[]
    return Array.isArray(parsed) ? parsed.map((item) => ({ ...item, source: 'local' as const })) : []
  } catch {
    return []
  }
}

function writeLocal(projects: SavedProject[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(projects))
}

function matchesFilters(project: SavedProject, filters: ProjectFilters): boolean {
  const query = (filters.query ?? '').trim().toLowerCase()
  if (query) {
    const haystack = `${project.companyName} ${project.ruc ?? ''} ${project.sector}`.toLowerCase()
    if (!haystack.includes(query)) return false
  }
  if (filters.sector && filters.sector !== 'todos' && project.sector !== filters.sector) return false
  if (filters.status && filters.status !== 'todos' && project.status !== filters.status) return false
  const date = project.updatedAt.slice(0, 10)
  if (filters.from && date < filters.from) return false
  if (filters.to && date > filters.to) return false
  return true
}

// ---------- Autosave draft (local only) ----------

export function saveDraftLocal(payload: ProjectPayload) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ payload, savedAt: new Date().toISOString() }))
  } catch {
    /* storage may be full or unavailable */
  }
}

export function loadDraftLocal(): { payload: ProjectPayload; savedAt: string } | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    return raw ? (JSON.parse(raw) as { payload: ProjectPayload; savedAt: string }) : null
  } catch {
    return null
  }
}

// ---------- Save (manual) ----------

export async function saveProject(
  payload: ProjectPayload,
  status: ProjectStatus,
  existingId?: string,
): Promise<StoreResult<SavedProject>> {
  const now = new Date().toISOString()
  const record: SavedProject = {
    id: existingId ?? uid(),
    companyName: payload.profile.name || 'Sin razon social',
    ruc: /^[0-9]{11}$/.test(payload.profile.ruc) ? payload.profile.ruc : null,
    sector: payload.sector,
    status,
    payload,
    createdAt: now,
    updatedAt: now,
    source: 'local',
  }

  // Always keep a local copy so "Mis proyectos" works offline.
  const local = readLocal()
  const existingIndex = local.findIndex((item) => item.id === record.id)
  if (existingIndex >= 0) {
    record.createdAt = local[existingIndex].createdAt
    local[existingIndex] = record
  } else {
    local.unshift(record)
  }
  writeLocal(local)

  if (!isSupabaseConfigured || !supabase) {
    return { ok: true, mode: 'local', message: 'Guardado localmente en este navegador.', data: record }
  }

  if (!SUPABASE_ALLOWED_STATUS.includes(status)) {
    return {
      ok: true,
      mode: 'local',
      message: `Guardado localmente. El estado "${status}" no se sincroniza con Supabase por politica de seguridad.`,
      data: record,
    }
  }

  try {
    const isLocalId = record.id.startsWith('local-')
    if (existingId && !isLocalId) {
      const { error } = await supabase
        .from(TABLE)
        .update({
          company_name: record.companyName,
          ruc: record.ruc,
          sector: record.sector,
          status: record.status,
          payload: record.payload,
          updated_at: now,
        })
        .eq('id', existingId)
      if (error) throw error
      return { ok: true, mode: 'supabase', message: 'Actualizado en Supabase.', data: { ...record, source: 'supabase' } }
    }

    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        company_name: record.companyName,
        ruc: record.ruc,
        sector: record.sector,
        status: record.status,
        payload: record.payload,
      })
      .select('id, created_at, updated_at')
      .single()
    if (error) throw error

    // Replace the local id with the Supabase id to keep them in sync.
    const synced: SavedProject = {
      ...record,
      id: data.id,
      createdAt: data.created_at ?? now,
      updatedAt: data.updated_at ?? now,
      source: 'supabase',
    }
    const refreshed = readLocal().filter((item) => item.id !== record.id)
    refreshed.unshift(synced)
    writeLocal(refreshed)
    return { ok: true, mode: 'supabase', message: 'Guardado en Supabase.', data: synced }
  } catch (error) {
    return {
      ok: true,
      mode: 'local',
      message: `Guardado localmente. Conexion con Supabase no disponible (${describeError(error)}).`,
      data: record,
    }
  }
}

// ---------- List / search ----------

export async function listProjects(filters: ProjectFilters = {}): Promise<StoreResult<SavedProject[]>> {
  const local = readLocal()

  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: true,
      mode: 'local',
      message: local.length ? 'Proyectos cargados desde este navegador.' : 'Aun no hay proyectos guardados.',
      data: local.filter((project) => matchesFilters(project, filters)),
    }
  }

  try {
    let request = supabase
      .from(TABLE)
      .select('id, company_name, ruc, sector, status, payload, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(200)
    if (filters.query) request = request.ilike('company_name', `%${filters.query}%`)
    if (filters.sector && filters.sector !== 'todos') request = request.eq('sector', filters.sector)
    if (filters.status && filters.status !== 'todos') request = request.eq('status', filters.status)

    const { data, error } = await request
    if (error) throw error

    const remote: SavedProject[] = (data ?? []).map((row) => ({
      id: row.id,
      companyName: row.company_name,
      ruc: row.ruc,
      sector: row.sector as SectorId,
      status: (row.status as ProjectStatus) ?? 'draft',
      payload: row.payload as ProjectPayload,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      source: 'supabase',
    }))

    // Merge: remote wins on id, then add local-only projects.
    const remoteIds = new Set(remote.map((item) => item.id))
    const localOnly = local.filter((item) => !remoteIds.has(item.id))
    const merged = [...remote, ...localOnly].filter((project) => matchesFilters(project, filters))
    return { ok: true, mode: 'supabase', message: 'Proyectos cargados desde Supabase.', data: merged }
  } catch (error) {
    return {
      ok: true,
      mode: 'local',
      message: `Conexion con Supabase no disponible (${describeError(error)}). Mostrando proyectos locales.`,
      data: local.filter((project) => matchesFilters(project, filters)),
    }
  }
}

// ---------- Delete ----------

export async function deleteProject(project: SavedProject): Promise<StoreResult> {
  writeLocal(readLocal().filter((item) => item.id !== project.id))

  if (project.source === 'supabase' && isSupabaseConfigured && supabase && !project.id.startsWith('local-')) {
    try {
      const { error } = await supabase.from(TABLE).delete().eq('id', project.id)
      if (error) throw error
      return { ok: true, mode: 'supabase', message: 'Proyecto eliminado de Supabase.' }
    } catch (error) {
      return { ok: true, mode: 'local', message: `Eliminado localmente. Supabase no disponible (${describeError(error)}).` }
    }
  }
  return { ok: true, mode: 'local', message: 'Proyecto eliminado.' }
}

// ---------- Duplicate ----------

export async function duplicateProject(project: SavedProject): Promise<StoreResult<SavedProject>> {
  const copyPayload: ProjectPayload = {
    ...project.payload,
    profile: { ...project.payload.profile, name: `${project.payload.profile.name} (copia)` },
  }
  return saveProject(copyPayload, 'draft')
}

function describeError(error: unknown): string {
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as { message: unknown }).message)
  }
  return 'error desconocido'
}
