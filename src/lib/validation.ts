import type { CompanyProfile, JobPosition, WorkArea, WorkTask } from '../types'

export interface FieldError {
  field: string
  message: string
}

export function isValidRuc(ruc: string): boolean {
  return /^[0-9]{11}$/.test(ruc.trim())
}

/**
 * Validates the company profile + catalog before generating or exporting.
 * Returns a list of human-readable problems (empty = ready).
 */
export function validateRegistration(
  profile: CompanyProfile,
  areas: WorkArea[],
  positions: JobPosition[],
  tasks: WorkTask[],
): FieldError[] {
  const errors: FieldError[] = []

  if (!profile.name.trim()) errors.push({ field: 'name', message: 'Ingrese la razon social.' })
  if (!profile.ruc.trim()) {
    errors.push({ field: 'ruc', message: 'Ingrese el RUC.' })
  } else if (!isValidRuc(profile.ruc)) {
    errors.push({ field: 'ruc', message: 'El RUC debe tener 11 digitos numericos.' })
  }
  if (!profile.businessActivity.trim()) errors.push({ field: 'businessActivity', message: 'Ingrese la actividad economica.' })
  if (!profile.workplace.trim()) errors.push({ field: 'workplace', message: 'Ingrese el centro de trabajo.' })
  if (!profile.workerCount || profile.workerCount < 1) errors.push({ field: 'workerCount', message: 'Indique el numero de trabajadores.' })

  if (areas.length === 0) errors.push({ field: 'areas', message: 'Registre al menos un area.' })
  if (positions.length === 0) errors.push({ field: 'positions', message: 'Registre al menos un puesto.' })
  if (tasks.length === 0) errors.push({ field: 'tasks', message: 'Registre al menos una tarea.' })

  tasks.forEach((task) => {
    if (!task.name.trim()) errors.push({ field: `task-${task.id}`, message: 'Hay una tarea sin nombre.' })
    if (!task.exposedWorkers || task.exposedWorkers < 1) {
      errors.push({ field: `task-${task.id}-exposed`, message: `Indique trabajadores expuestos en "${task.name || 'tarea'}".` })
    }
  })

  return errors
}
