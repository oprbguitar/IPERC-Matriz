import { DEFAULT_PROFILE, type ComplianceEntry, type OrgProfile } from '../catalog'
import { api } from './api'

/**
 * Perfil de organizacion y estado de cumplimiento por obligacion.
 * Se guarda siempre en el navegador; si hay sesion premium tambien en D1 (/api/compliance),
 * de modo que el avance no se pierde al cambiar de equipo. No guarda datos de salud.
 */
const KEY = 'observatorio-sst:cumplimiento'

export interface ComplianceState {
  profile: OrgProfile
  entries: Record<string, ComplianceEntry>
  updatedAt: string
}

export function readLocalCompliance(): ComplianceState {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ComplianceState
      return { profile: { ...DEFAULT_PROFILE, ...parsed.profile }, entries: parsed.entries ?? {}, updatedAt: parsed.updatedAt ?? '' }
    }
  } catch {
    // Almacenamiento no disponible: se trabaja en memoria.
  }
  return { profile: DEFAULT_PROFILE, entries: {}, updatedAt: '' }
}

export function writeLocalCompliance(state: ComplianceState): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Sin almacenamiento local.
  }
}

/** Trae la copia remota si es mas reciente que la local. */
export async function syncFromRemote(local: ComplianceState): Promise<ComplianceState> {
  try {
    const { state } = await api.compliance()
    if (state && state.updatedAt > local.updatedAt) return { ...state, profile: { ...DEFAULT_PROFILE, ...state.profile } }
  } catch {
    // Sin sesion o sin servidor: se mantiene la copia local.
  }
  return local
}

export function pushRemote(state: ComplianceState): void {
  void api.saveCompliance(state).catch(() => undefined)
}
