export const PRACTICE_HIERARCHY = [
  { id: 'eliminacion', label: '1. Eliminación', description: 'Retirar el peligro o suprimir la tarea peligrosa cuando sea viable.' },
  { id: 'sustitucion', label: '2. Sustitución', description: 'Cambiar el agente, equipo o proceso por una alternativa menos peligrosa.' },
  { id: 'ingenieria', label: '3. Controles de ingeniería', description: 'Separar físicamente a las personas del peligro: resguardos, barreras o extracción.' },
  { id: 'administrativos', label: '4. Controles administrativos', description: 'Organizar el trabajo: procedimientos, permisos, formación y supervisión.' },
  { id: 'epp', label: '5. Equipos de protección personal', description: 'Última barrera complementaria: seleccionar, ajustar, mantener y verificar el EPP.' },
] as const

export interface PracticeData {
  activity: string
  task: string
  hazard: string
  risk: string
  harm: string
  measure: string
  owner: string
  evidence: string
  hierarchy: typeof PRACTICE_HIERARCHY[number]['id']
}

export const PRACTICE_FIELDS = [
  { key: 'activity', label: 'Actividad', placeholder: 'Ej.: recepción de mercancías' },
  { key: 'task', label: 'Tarea concreta', placeholder: 'Ej.: mover un pallet desde la zona de descarga' },
  { key: 'hazard', label: 'Peligro identificado', placeholder: 'Fuente o situación con potencial de daño' },
  { key: 'risk', label: 'Evento peligroso / riesgo', placeholder: 'Ej.: atropello al cruzar una ruta vehicular; aún sin valoración' },
  { key: 'harm', label: 'Daño posible', placeholder: 'Consecuencia posible; no un diagnóstico médico' },
  { key: 'measure', label: 'Medida de control propuesta', placeholder: 'Qué cambiaría para actuar sobre el peligro' },
  { key: 'owner', label: 'Responsable propuesto', placeholder: 'Rol o área que implementará y verificará' },
  { key: 'evidence', label: 'Evidencia para verificar', placeholder: 'Qué registro o comprobación demostraría el control' },
] as const

/** Frontera para borradores locales: descarta objetos, claves desconocidas y saltos estructurales. */
export function normalizePractice(value: unknown): PracticeData {
  const input = value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
  const field = (key: string) => typeof input[key] === 'string' ? input[key].replace(/[\p{Cc}]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0,800) : ''
  const hierarchy = PRACTICE_HIERARCHY.find(item => item.id === input.hierarchy)?.id ?? 'ingenieria'
  return { activity: field('activity'), task: field('task'), hazard: field('hazard'), risk: field('risk'), harm: field('harm'), measure: field('measure'), owner: field('owner'), evidence: field('evidence'), hierarchy }
}

export const PRACTICE_EXAMPLES: Array<{ id: string; label: string; value: PracticeData }> = [
  { id: 'almacen', label: 'Almacén', value: normalizePractice({ activity: 'Recepción de mercancías', task: 'Trasladar pallets en una zona con paso peatonal', hazard: 'Interacción entre montacargas y peatones', risk: 'Atropello al cruzar una ruta vehicular', harm: 'Lesión traumática o aplastamiento', hierarchy: 'ingenieria', measure: 'Separar físicamente las rutas peatonales y vehiculares; controlar los cruces', owner: 'Responsable de operaciones', evidence: 'Plano de segregación e inspección en campo de las barreras' }) },
  { id: 'oficina', label: 'Oficina', value: normalizePractice({ activity: 'Atención administrativa', task: 'Registrar información frente a una pantalla', hazard: 'Puesto desajustado y postura sostenida', risk: 'Sobrecarga musculoesquelética durante la tarea prolongada', harm: 'Molestias y trastornos musculoesqueléticos', hierarchy: 'ingenieria', measure: 'Ajustar silla, mesa y pantalla a la persona; complementar con organización de pausas', owner: 'Responsable de área con participación del trabajador', evidence: 'Evaluación del puesto y registro de ajustes verificados' }) },
  { id: 'maquinaria', label: 'Maquinaria', value: normalizePractice({ activity: 'Producción', task: 'Retirar producto junto a elementos móviles', hazard: 'Punto de atrapamiento accesible', risk: 'Atrapamiento de la mano al alcanzar la zona móvil', harm: 'Lesión traumática de manos', hierarchy: 'ingenieria', measure: 'Instalar y verificar resguardo adecuado; aplicar aislamiento de energía para intervenir el equipo', owner: 'Responsable de mantenimiento', evidence: 'Registro de inspección del resguardo y prueba funcional autorizada' }) },
]

export function buildPracticeMarkdown(value: unknown): string {
  const data = normalizePractice(value)
  const level = PRACTICE_HIERARCHY.find(item => item.id === data.hierarchy)!
  return `# Práctica preventiva: de la actividad al control

Borrador educativo. Estado: Pendiente de evaluación y verificación.

${PRACTICE_FIELDS.map(field => `## ${field.label}\n\n> ${data[field.key] || 'Por completar'}`).join('\n\n')}

## Nivel de control propuesto

${level.label}. ${level.description}

## Evaluación pendiente

No se ha calculado probabilidad, severidad ni aceptabilidad. El evento peligroso describe cómo podría producirse el daño; no expresa un nivel de riesgo evaluado. La IPERC requiere un método definido, exposición real, participación de trabajadores y verificación técnica en el lugar. Una medida propuesta no demuestra reducción del riesgo.

## Precisiones de aplicación

- Tercerizar no sustituye por sí solo el peligro. Cambiar de ejecutor exige coordinación y controles, y no transfiere automáticamente el deber de prevención.
- La pirámide de cinco niveles es didáctica. El art. 21 de la Ley N.° 29783 establece su propio orden: eliminación; control o aislamiento; minimización con sistemas de trabajo seguro; sustitución progresiva; EPP como última medida. Consulte el texto aplicable.
- La línea base revisa la situación inicial del sistema de gestión; no equivale a la matriz IPERC de actividades y tareas.
- La R.M. N.° 050-2013-TR contiene formatos referenciales. No impone un único método IPERC para toda actividad.
- Los PETS responden a requisitos sectoriales cuando correspondan; no son una obligación universal con ese nombre.

## Fuentes y revisión

Ley N.° 29783, art. 21: https://www.leyes.congreso.gob.pe/Documentos/Leyes/29783.pdf

R.M. N.° 050-2013-TR: https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr

Contenido educativo revisado: 07/11/2026. Antes de su aplicación, verificar vigencia, alcance sectorial y eficacia de cada control.
`
}
