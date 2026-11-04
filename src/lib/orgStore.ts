/**
 * Datos de la organización que se reutilizan en todas las plantillas descargables.
 * Se guardan solo en este navegador (localStorage); nada se envía al servidor.
 */
export interface OrgData {
  razonSocial?: string
  ruc?: string
  actividad?: string
  centro?: string
  direccion?: string
  trabajadores?: string
  responsable?: string
  cargoResponsable?: string
  gerente?: string
  [key: string]: string | undefined
}

export const ORG_KEY = 'observatorio-sst:organizacion'
const EVENT = 'observatorio:org-change'

export const ORG_FIELDS: Array<{ key: keyof OrgData & string; label: string; placeholder: string }> = [
  { key: 'razonSocial', label: 'Razón social o entidad', placeholder: 'Ej.: Constructora Andina S.A.C.' },
  { key: 'ruc', label: 'RUC', placeholder: '20xxxxxxxxx' },
  { key: 'actividad', label: 'Actividad económica (CIIU)', placeholder: 'Ej.: 4100 Construcción de edificios' },
  { key: 'centro', label: 'Centro de trabajo / sede', placeholder: 'Ej.: Obra Los Olivos' },
  { key: 'direccion', label: 'Dirección', placeholder: 'Distrito, provincia, región' },
  { key: 'trabajadores', label: 'N.° de trabajadores', placeholder: 'Ej.: 45' },
  { key: 'gerente', label: 'Máxima autoridad (nombre y cargo)', placeholder: 'Ej.: Ana Ríos, Gerente General' },
  { key: 'responsable', label: 'Responsable de SST', placeholder: 'Nombre' },
  { key: 'cargoResponsable', label: 'Cargo del responsable', placeholder: 'Ej.: Jefe de SSOMA' },
]

export function readOrg(): OrgData {
  try {
    return JSON.parse(window.localStorage.getItem(ORG_KEY) ?? '{}') as OrgData
  } catch {
    return {}
  }
}

export function saveOrg(data: OrgData): void {
  try {
    window.localStorage.setItem(ORG_KEY, JSON.stringify(data))
  } catch {
    // Sin almacenamiento: los datos se usan solo en esta sesión.
  }
  window.dispatchEvent(new CustomEvent(EVENT))
}

export function onOrgChange(listener: () => void): () => void {
  window.addEventListener(EVENT, listener)
  return () => window.removeEventListener(EVENT, listener)
}

/** Texto a mostrar: el dato real o una línea para llenar a mano. */
export function orgValue(org: OrgData, key: string, blank = '____________________'): string {
  const value = org[key]?.trim()
  return value ? value : blank
}
