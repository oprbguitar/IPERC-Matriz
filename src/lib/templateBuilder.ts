import { ARTICLES, findArticle, findInfraction, FORMATS, OBLIGATIONS, ORGANIZATION_FIELDS, type FormatItem } from '../catalog'
import { findNorm } from '../data/legalDatabase'
import { orgValue, type OrgData } from './orgStore'
import { extraTemplates } from './adaptedTemplates'

/**
 * Plantillas avanzadas descargables (Word, Excel, PDF).
 *
 * Cada plantilla incluye control documental, base legal con articulos cotejados, instrucciones
 * de llenado, tabla con filas en blanco numeradas, conservacion y firmas. Son plantillas PROPIAS
 * del Observatorio: no reemplazan los formatos referenciales oficiales.
 */
export interface AdvancedTemplate {
  id: string
  name: string
  topic: string
  summary: string
  basis: string[]
  /** Documento con secciones (Word/PDF). */
  markdown: string
  /** Hoja de calculo (Excel); opcional para documentos narrativos. */
  sheet?: { columns: string[]; rows: string[][] }
}

const BLANK_ROWS = 15
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']

const controlBlock = `| Control documental | |\n|---|---|\n| Código | |\n| Versión | |\n| Fecha de aprobación | |\n| Elaborado por | |\n| Revisado por (Comité/Supervisor) | |\n| Aprobado por | |`

/** Organización activa al generar: sus datos llenan la cabecera de cada plantilla. */
let ORG: OrgData = {}

const orgBlock = () =>
  `| Organización | |\n|---|---|\n${ORGANIZATION_FIELDS.map((field) => `| ${field.label} | ${orgValue(ORG, field.key, '')} |`).join('\n')}`

const signatures = `\n\n## Firmas\n\n| Elaborado | Revisado | Aprobado |\n|---|---|---|\n| Nombre: | Nombre: | Nombre: |\n| Cargo: | Cargo: | Cargo: |\n| Firma y fecha: | Firma y fecha: | Firma y fecha: |`

export function basisLines(normIds: string[], articleIds: string[]): string[] {
  const articles = articleIds
    .map((id) => findArticle(id))
    .filter(Boolean)
    .map((article) => `${findNorm(article!.normId)?.shortName ?? ''} ${article!.label} — ${article!.title}: ${article!.plainLanguage}`)
  const norms = normIds.filter((id) => !articleIds.some((articleId) => findArticle(articleId)?.normId === id)).map((id) => findNorm(id)?.shortName ?? id)
  return [...articles, ...norms.map((norm) => `${norm} (referencia general; validar artículo aplicable)`)]
}

export function table(columns: string[], rows: string[][]): string {
  return `| ${columns.join(' | ')} |\n|${columns.map(() => '---').join('|')}|\n${rows.map((row) => `| ${row.map((cell) => cell || ' ').join(' | ')} |`).join('\n')}`
}

export function blankRows(columns: string[], count = BLANK_ROWS): string[][] {
  return Array.from({ length: count }, (_, index) => [String(index + 1), ...columns.slice(1).map(() => '')])
}

export function document(name: string, objective: string, basis: string[], body: string, retention?: string): string {
  return `# ${name}\n\n${controlBlock}\n\n${orgBlock()}\n\n## 1. Objetivo\n\n${objective}\n\n## 2. Base legal\n\n${basis.map((line) => `- ${line}`).join('\n')}\n\n${body}${retention ? `\n\n## Conservación\n\n${retention}` : ''}${signatures}\n\n> Plantilla propia del Observatorio Prevenir Perú. No es un formato oficial: contraste los campos mínimos con la norma aplicable antes de usarla.`
}

/** Plantilla detallada a partir de un formato propio con columnas o campos. */
function fromFormat(format: FormatItem): AdvancedTemplate {
  const basis = basisLines(format.normIds, format.articleIds)
  const retention = format.retentionYears
    ? `Conservar ${format.retentionYears} años posteriores al suceso (D.S. 005-2012-TR, art. 35).`
    : undefined
  if (format.columns) {
    const columns = ['N.°', ...format.columns.map((column) => column.label)]
    const instructions = format.columns
      .map((column) => `- **${column.label}**: ${column.options ? `seleccione una opción (${column.options.join(' / ')})` : column.type === 'date' ? 'fecha en formato dd/mm/aaaa' : column.type === 'number' ? 'valor numérico' : 'texto breve y verificable'}.`)
      .join('\n')
    const rows = blankRows(columns)
    const body = `## 3. Instrucciones de llenado\n\n${instructions}\n- Registre hechos verificables; adjunte o referencie la evidencia (acta, foto, informe).\n- No registre diagnósticos médicos ni datos sensibles innecesarios.\n\n## 4. Registro\n\n${table(columns, rows)}`
    return {
      id: `tpl-${format.id}`,
      name: format.name,
      topic: format.topic,
      summary: `${format.columns.length} columnas, ${BLANK_ROWS} filas numeradas, instrucciones y base legal.`,
      basis,
      markdown: document(format.name, format.description, basis, body, retention),
      sheet: { columns, rows },
    }
  }
  const sections = (format.fields ?? []).map((field, index) => `## ${index + 3}. ${field.label}\n\n${field.options ? `Opciones: ${field.options.join(' / ')}\n\n` : ''}_________________________________________________\n\n_________________________________________________`).join('\n\n')
  return {
    id: `tpl-${format.id}`,
    name: format.name,
    topic: format.topic,
    summary: `${format.fields?.length ?? 0} secciones con control documental y firmas.`,
    basis,
    markdown: document(format.name, format.description, basis, sections, retention),
  }
}

/** Plantillas compuestas que cruzan el catalogo (no existen como formato simple). */
function composite(): AdvancedTemplate[] {
  const legalColumns = ['N.°', 'Obligación', 'Norma y artículo', 'Requisito', 'Evidencia', 'Infracción RLGIT', 'Responsable', 'Frecuencia', 'Estado', 'Fecha de verificación']
  const legalRows = OBLIGATIONS.map((item, index) => [
    String(index + 1),
    item.title,
    item.articleIds.map((id) => `${findNorm(findArticle(id)?.normId ?? '')?.shortName ?? ''} ${findArticle(id)?.label ?? ''}`).join('; ') || item.normIds.map((id) => findNorm(id)?.shortName ?? id).join('; ') || 'Por validar',
    item.requirement,
    item.evidence.join('; '),
    item.infractionCodes.map((code) => `${code} (${findInfraction(code)?.severity ?? ''})`).join(', '),
    item.responsible,
    item.frequency,
    '',
    '',
  ])

  const ipercColumns = ['N.°', 'Proceso', 'Actividad', 'Tarea', 'Rutinaria (S/N)', 'Puesto', 'Peligro', 'Riesgo', 'Consecuencia', 'P', 'S', 'E', 'Nivel inicial', 'Controles existentes', 'Control propuesto', 'Jerarquía', 'Residual proyectado', 'Residual verificado', 'Evidencia de verificación', 'Responsable', 'Plazo']

  const programColumns = ['N.°', 'Objetivo', 'Actividad', 'Responsable', 'Recursos / presupuesto', 'Indicador', ...MONTHS, 'Estado']
  const programSeed = [
    'Actualizar IPERC por puesto con participación',
    'Inspecciones internas planificadas',
    'Capacitaciones según programa anual',
    'Exámenes médicos ocupacionales',
    'Monitoreo de agentes ocupacionales',
    'Simulacros de emergencia',
    'Reuniones mensuales del Comité/Supervisor',
    'Verificación de contratistas',
    'Auditoría del SGSST',
    'Revisión por la dirección',
  ]
  const programRows = programSeed.map((activity, index) => [String(index + 1), '', activity, '', '', '', ...MONTHS.map(() => ''), ''])

  const trainingColumns = ['N.°', 'Tema', 'Dirigido a (puesto)', 'Tipo (inducción/capacitación/entrenamiento/simulacro)', 'Horas', 'Capacitador', ...MONTHS, 'Evaluación de eficacia']
  const healthColumns = ['N.°', 'Puesto / grupo de exposición', 'Agentes o factores de riesgo', 'Protocolo EMO aplicable', 'Periodicidad', 'N.° trabajadores', 'N.° con EMO vigente', '% cobertura', 'Aptos con restricciones (cantidad)', 'Acciones colectivas']

  const risstBody = `## 3. Estructura mínima (D.S. 005-2012-TR, art. 74)\n\n### a) Objetivos y alcances\n\n_________________________________________________\n\n### b) Liderazgo, compromisos y la política de seguridad y salud\n\n_________________________________________________\n\n### c) Atribuciones y obligaciones del empleador, de los supervisores, del comité de seguridad y salud, de los trabajadores y de los empleadores que les brindan servicios\n\n_________________________________________________\n\n### d) Estándares de seguridad y salud en las operaciones\n\n_________________________________________________\n\n### e) Estándares de seguridad y salud en los servicios y actividades conexas\n\n_________________________________________________\n\n### f) Preparación y respuesta a emergencias\n\n_________________________________________________\n\n## 4. Entrega bajo cargo (art. 75)\n\n${table(['N.°', 'Trabajador / personal', 'Régimen (planilla, intermediación, tercerización, formativa)', 'Medio (físico/digital)', 'Fecha', 'Firma'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e'], 10))}`

  const emergencyBody = `## 3. Disposiciones mínimas (D.S. 005-2012-TR, art. 83)\n\n${table(['Literal', 'Disposición', 'Cómo se cumple en la organización', 'Responsable', 'Evidencia'], [
    ['a)', 'Información, comunicación interna y coordinación en emergencias', '', '', ''],
    ['b)', 'Comunicación a autoridades, vecindad y servicios de intervención', '', '', ''],
    ['c)', 'Primeros auxilios, asistencia médica, extinción de incendios y evacuación', '', '', ''],
    ['d)', 'Información, formación y ejercicios periódicos (simulacros)', '', '', ''],
  ])}\n\n## 4. Escenarios de emergencia\n\n${table(['N.°', 'Escenario', 'Área', 'Procedimiento de respuesta', 'Brigada', 'Recursos'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e'], 8))}\n\n## 5. Brigadas\n\n${table(['Brigada', 'Integrantes', 'Teléfono', 'Capacitación vigente'], [['Evacuación', '', '', ''], ['Primeros auxilios', '', '', ''], ['Contra incendios', '', '', ''], ['Comunicaciones', '', '', '']])}\n\n## 6. Programa de simulacros\n\n${table(['N.°', 'Escenario', 'Fecha programada', 'Fecha ejecutada', 'Tiempo de evacuación', 'Observaciones'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e'], 4))}`

  const ds005 = (ids: string[]) => basisLines(['ds-005-2012-tr'], ids)

  return [
    {
      id: 'tpl-matriz-legal',
      name: 'Matriz de requisitos legales SST (precargada)',
      topic: 'cumplimiento',
      summary: `${OBLIGATIONS.length} obligaciones precargadas con artículo, evidencia, infracción y responsable.`,
      basis: basisLines([], ARTICLES.map((article) => article.id)).slice(0, 6),
      markdown: document('Matriz de requisitos legales SST', 'Identificar las obligaciones legales aplicables, su fundamento y la evidencia que demuestra su cumplimiento.', ds005(['ds005-art25', 'ds005-art32', 'ds005-art33']), `## 3. Matriz\n\n${table(legalColumns, legalRows)}`),
      sheet: { columns: legalColumns, rows: legalRows },
    },
    {
      id: 'tpl-iperc-detallada',
      name: 'Matriz IPERC detallada (residual proyectado y verificado)',
      topic: 'iperc',
      summary: `${ipercColumns.length - 1} columnas: proceso a plazo, con residual proyectado y verificado separados.`,
      basis: basisLines(['ds-005-2012-tr'], ['ley29783-art57', 'ds005-art77-2020', 'ley29783-art21', 'ds005-art82']),
      markdown: document('Matriz IPERC detallada', 'Identificar peligros, evaluar riesgos por puesto y definir controles; el residual verificado solo se completa con evidencia.', basisLines(['ds-005-2012-tr'], ['ley29783-art57', 'ds005-art77-2020', 'ley29783-art21']), `## 3. Instrucciones\n\n- P (probabilidad), S (severidad) y E (exposición) en escala 1 a 5; nivel = P × S × E.\n- Jerarquía: eliminación, sustitución, ingeniería, administrativos, EPP.\n- **Residual proyectado**: estimación si se ejecuta el control. **Residual verificado**: solo tras ejecución y evidencia.\n\n## 4. Matriz\n\n${table(ipercColumns, blankRows(ipercColumns))}`, 'Conservar como sustento de gestión preventiva (versiones históricas incluidas).'),
      sheet: { columns: ipercColumns, rows: blankRows(ipercColumns, 25) },
    },
    {
      id: 'tpl-programa-anual',
      name: 'Programa anual de SST (cronograma mensual)',
      topic: 'planificacion',
      summary: '10 actividades base, cronograma Ene–Dic, recursos e indicadores.',
      basis: ds005(['ds005-art32']),
      markdown: document('Programa anual de SST', 'Planificar las actividades preventivas del año con responsables, recursos, indicadores y cronograma.', ds005(['ds005-art32']), `## 3. Programa\n\n${table(programColumns, programRows)}`),
      sheet: { columns: programColumns, rows: programRows },
    },
    {
      id: 'tpl-programa-capacitacion',
      name: 'Programa anual de capacitación',
      topic: 'capacitacion',
      summary: 'Temas por puesto, tipo, horas, cronograma y evaluación de eficacia.',
      basis: ds005(['ds005-art27']),
      markdown: document('Programa anual de capacitación', 'Planificar la capacitación en prevención centrada en el puesto de trabajo.', ds005(['ds005-art27']), `## 3. Programa\n\n${table(trainingColumns, blankRows(trainingColumns, 12))}`),
      sheet: { columns: trainingColumns, rows: blankRows(trainingColumns, 12) },
    },
    {
      id: 'tpl-vigilancia-colectiva',
      name: 'Matriz de vigilancia de la salud colectiva (sin datos individuales)',
      topic: 'salud',
      summary: 'Cobertura de EMO por grupo de exposición; indicadores colectivos, no diagnósticos.',
      basis: [...ds005(['ds005-art101']), 'Ley N.° 29733: los datos de salud individuales son sensibles y no se registran aquí.'],
      markdown: document('Matriz de vigilancia de la salud colectiva', 'Seguir la cobertura de exámenes médicos y la exposición por grupo, sin datos médicos individuales.', ds005(['ds005-art101']), `## 3. Matriz\n\n${table(healthColumns, blankRows(healthColumns, 10))}`),
      sheet: { columns: healthColumns, rows: blankRows(healthColumns, 10) },
    },
    {
      id: 'tpl-risst',
      name: 'Reglamento Interno de SST (estructura mínima art. 74)',
      topic: 'sgsst',
      summary: 'Esqueleto con los literales a)–f) del art. 74 y control de entrega bajo cargo (art. 75).',
      basis: ds005(['ds005-art74', 'ds005-art75']),
      markdown: document('Reglamento Interno de Seguridad y Salud en el Trabajo', 'Establecer las reglas internas de SST para empleadores con 20 o más trabajadores.', ds005(['ds005-art74', 'ds005-art75']), risstBody),
    },
    {
      id: 'tpl-plan-emergencias',
      name: 'Plan de preparación y respuesta ante emergencias',
      topic: 'emergencias',
      summary: 'Disposiciones del art. 83, escenarios, brigadas y programa de simulacros.',
      basis: ds005(['ds005-art83']),
      markdown: document('Plan de preparación y respuesta ante emergencias', 'Prevenir, prepararse y responder ante emergencias en el centro de trabajo.', ds005(['ds005-art83']), emergencyBody),
    },
  ]
}

export function advancedTemplates(org: OrgData = {}): AdvancedTemplate[] {
  ORG = org
  const fromCatalog = FORMATS.filter((format) => format.origin === 'propio' && (format.columns || format.fields)).map(fromFormat)
  return [...composite(), ...extraTemplates(org), ...fromCatalog]
}
