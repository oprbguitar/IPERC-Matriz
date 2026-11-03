/**
 * Biblioteca documental.
 *
 * - `oficial`: documento publicado por la entidad (se enlaza, no se copia).
 * - `propio`: formulario del Observatorio, editable en linea. Usa como referencia la norma
 *   indicada pero NO es un formato oficial: los campos minimos exigibles de los registros
 *   estan en los anexos de la R.M. 050-2013-TR, que deben contrastarse.
 */
export type FormatOrigin = 'oficial' | 'propio'
export type FormatNature = 'registro-obligatorio' | 'documento-obligatorio' | 'referencial' | 'recomendado'

export interface FormatField {
  key: string
  label: string
  type?: 'text' | 'date' | 'number' | 'textarea' | 'select'
  options?: string[]
}

export interface FormatItem {
  id: string
  name: string
  topic: string
  origin: FormatOrigin
  nature: FormatNature
  publisher: string
  version: string
  description: string
  normIds: string[]
  articleIds: string[]
  /** Documento oficial enlazado. */
  url?: string
  /** Archivo propio servido por la aplicacion. */
  file?: string
  /** Columnas del registro (una fila por evento) para el formulario en linea. */
  columns?: FormatField[]
  /** Campos de cabecera especificos (ademas de los automaticos de organizacion). */
  fields?: FormatField[]
  retentionYears?: number
}

export const NATURE_LABELS: Record<FormatNature, string> = {
  'registro-obligatorio': 'Registro obligatorio (art. 33)',
  'documento-obligatorio': 'Documento exigible',
  referencial: 'Formato referencial oficial',
  recomendado: 'Recomendado (buena práctica)',
}

/** Cabecera automatica de todo formulario propio. */
export const ORGANIZATION_FIELDS: FormatField[] = [
  { key: 'razonSocial', label: 'Razón social / entidad' },
  { key: 'ruc', label: 'RUC' },
  { key: 'centro', label: 'Centro de trabajo / sede' },
  { key: 'responsable', label: 'Responsable del registro' },
  { key: 'fecha', label: 'Fecha', type: 'date' },
  { key: 'version', label: 'Versión' },
]

const OWN = 'Observatorio SST Perú'
const V = '1.0 (2026-11)'
const RM050 = ['rm-050-2013-tr', 'ds-005-2012-tr']

export const FORMATS: FormatItem[] = [
  {
    id: 'rm050-oficial',
    name: 'R.M. 050-2013-TR: formatos referenciales de registros obligatorios',
    topic: 'registros',
    origin: 'oficial',
    nature: 'referencial',
    publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    version: 'R.M. 050-2013-TR (14/03/2013)',
    description: 'Anexos oficiales con la información mínima que deben contener los registros del SGSST. Úselos como base para validar cualquier formato propio.',
    normIds: RM050,
    articleIds: ['ds005-art33'],
    url: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
  },
  {
    id: 'mtpe-guia-mype',
    name: 'Guía del SGSST para MYPES (modelos editables)',
    topic: 'sgsst',
    origin: 'oficial',
    nature: 'referencial',
    publisher: 'Ministerio de Trabajo y Promoción del Empleo',
    version: 'Publicación MTPE (verificar última versión)',
    description: 'Modelos de línea base, política, matriz IPERC, programa anual, RISST y registros simplificados para micro y pequeñas empresas.',
    normIds: ['law-29783', 'ds-005-2012-tr'],
    articleIds: ['ds005-art32'],
    url: 'https://www.gob.pe/institucion/mtpe/informes-publicaciones/1942399-guia-del-sistema-de-gestion-de-seguridad-y-salud-en-el-trabajo-para-mypes',
  },
  {
    id: 'servir-modelos',
    name: 'Modelos y formatos de SST (SERVIR)',
    topic: 'publico',
    origin: 'oficial',
    nature: 'referencial',
    publisher: 'Autoridad Nacional del Servicio Civil',
    version: 'Publicación SERVIR',
    description: 'Modelos aplicables como referencia en entidades públicas.',
    normIds: ['servir-modelos-sst'],
    articleIds: [],
    url: 'https://www.gob.pe/institucion/servir/informes-publicaciones/3572314-modelos-y-formatos-de-seguridad-y-salud-en-el-trabajo-sst',
  },
  {
    id: 'servir-compendio',
    name: 'Compendio normativo SST (SERVIR)',
    topic: 'publico',
    origin: 'oficial',
    nature: 'referencial',
    publisher: 'Autoridad Nacional del Servicio Civil',
    version: 'Publicación SERVIR',
    description: 'Recopilación oficial de normas y documentos de SST para el sector público.',
    normIds: ['servir-normatividad-sst'],
    articleIds: [],
    url: 'https://www.gob.pe/institucion/servir/informes-publicaciones/3572362-normatividad-relacionada-a-la-seguridad-y-salud-en-el-trabajo-sst',
  },
  {
    id: 'sunafil-guia-comite-fmt',
    name: 'Guía del Comité o Supervisor de SST (SUNAFIL)',
    topic: 'comite',
    origin: 'oficial',
    nature: 'referencial',
    publisher: 'SUNAFIL',
    version: 'Publicación SUNAFIL',
    description: 'Procedimiento de elección, funciones y funcionamiento del comité o supervisor.',
    normIds: ['sunafil-guia-comite'],
    articleIds: ['ds005-art38', 'ds005-art39'],
    url: 'https://cdn.www.gob.pe/uploads/document/file/1348232/Gu%C3%ADa%20del%20Comit%C3%A9%20o%20Supervisor%20de%20Seguridad%20y%20Salud%20en%20el%20Trabajo.pdf',
  },
  {
    id: 'iperc-excel',
    name: 'Generador IPERC normativo (Excel)',
    topic: 'iperc',
    origin: 'propio',
    nature: 'documento-obligatorio',
    publisher: OWN,
    version: V,
    description: 'Matriz IPERC con fórmulas P×S×E, jerarquía de controles y riesgo residual proyectado vs. verificado.',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art77', 'ds005-art82'],
    file: 'templates/IPERC_Generador_Normativo_Peru.xlsx',
  },
  {
    id: 'linea-base',
    name: 'Diagnóstico de línea base',
    topic: 'sgsst',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Lista de verificación inicial del SGSST; genere el informe desde Diagnosticar → Obligaciones.',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art25'],
    columns: [
      { key: 'requisito', label: 'Requisito' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Cumple', 'Parcial', 'No cumple', 'No aplica'] },
      { key: 'evidencia', label: 'Evidencia' },
      { key: 'accion', label: 'Acción' },
    ],
  },
  {
    id: 'politica-sst-form',
    name: 'Política de SST',
    topic: 'sgsst',
    origin: 'propio',
    nature: 'documento-obligatorio',
    publisher: OWN,
    version: V,
    description: 'Borrador de política firmada por la máxima autoridad (art. 32 a).',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art32'],
    fields: [
      { key: 'compromisos', label: 'Compromisos (prevención, cumplimiento legal, participación, mejora continua)', type: 'textarea' },
      { key: 'objetivos', label: 'Objetivos de SST', type: 'textarea' },
      { key: 'firmante', label: 'Máxima autoridad que firma' },
    ],
  },
  ...(
    [
      ['reg-accidentes', 'Registro de accidentes, enfermedades ocupacionales, incidentes peligrosos e incidentes', 'accidentes', 10, [['fechaEvento', 'Fecha y hora', 'date'], ['tipo', 'Tipo de evento', 'select', ['Accidente leve', 'Accidente incapacitante', 'Accidente mortal', 'Incidente peligroso', 'Incidente', 'Enfermedad ocupacional']], ['trabajador', 'Trabajador (código)'], ['descripcion', 'Descripción', 'textarea'], ['causas', 'Causas identificadas', 'textarea'], ['medidas', 'Medidas correctivas', 'textarea'], ['responsable', 'Responsable'], ['plazo', 'Plazo', 'date']]],
      ['reg-emo', 'Registro de exámenes médicos ocupacionales (aptitud, sin diagnósticos)', 'salud', 5, [['trabajador', 'Trabajador (código)'], ['tipo', 'Tipo de EMO', 'select', ['Preocupacional', 'Periódico', 'De retiro', 'Reincorporación / cambio de puesto']], ['fecha', 'Fecha', 'date'], ['aptitud', 'Aptitud', 'select', ['Apto', 'Apto con restricciones', 'No apto']], ['proximo', 'Próximo examen', 'date']]],
      ['reg-monitoreo', 'Registro de monitoreo de agentes y factores de riesgo disergonómico', 'higiene', 5, [['agente', 'Agente / factor'], ['puesto', 'Puesto o área'], ['metodo', 'Método e instrumento'], ['resultado', 'Resultado'], ['referencia', 'Valor de referencia'], ['medida', 'Medida de control', 'textarea']]],
      ['reg-inspecciones', 'Registro de inspecciones internas de SST', 'inspecciones', 5, [['area', 'Área inspeccionada'], ['hallazgo', 'Hallazgo', 'textarea'], ['riesgo', 'Nivel de riesgo', 'select', ['Bajo', 'Moderado', 'Importante', 'Intolerable']], ['accion', 'Acción correctiva'], ['responsable', 'Responsable'], ['cierre', 'Fecha de cierre', 'date']]],
      ['reg-estadisticas', 'Registro de estadísticas de seguridad y salud', 'estadisticas', 5, [['mes', 'Mes'], ['hht', 'Horas-hombre trabajadas', 'number'], ['accidentes', 'Accidentes incapacitantes', 'number'], ['dias', 'Días perdidos', 'number'], ['if', 'Índice de frecuencia'], ['is', 'Índice de severidad']]],
      ['reg-equipos', 'Registro de equipos de seguridad o emergencia', 'emergencias', 5, [['equipo', 'Equipo / EPP'], ['entregadoA', 'Entregado a / ubicación'], ['fecha', 'Fecha', 'date'], ['estado', 'Estado / mantenimiento'], ['firma', 'Firma de recepción']]],
      ['reg-capacitacion', 'Registro de inducción, capacitación, entrenamiento y simulacros', 'capacitacion', 5, [['tema', 'Tema'], ['tipo', 'Tipo', 'select', ['Inducción', 'Capacitación', 'Entrenamiento', 'Simulacro']], ['fecha', 'Fecha', 'date'], ['horas', 'Horas', 'number'], ['capacitador', 'Capacitador'], ['participantes', 'N.° participantes', 'number']]],
      ['reg-auditorias', 'Registro de auditorías', 'auditoria', 5, [['fecha', 'Fecha', 'date'], ['auditor', 'Auditor (registro)'], ['noConformidad', 'No conformidad', 'textarea'], ['accion', 'Acción correctiva'], ['cierre', 'Fecha de cierre', 'date']]],
    ] as Array<[string, string, string, number, Array<[string, string, FormatField['type']?, string[]?]>]>
  ).map(([id, name, topic, retentionYears, columns]) => ({
    id,
    name,
    topic,
    origin: 'propio' as FormatOrigin,
    nature: 'registro-obligatorio' as FormatNature,
    publisher: OWN,
    version: V,
    description: 'Formulario propio con columnas de trabajo. Contraste los campos mínimos con el anexo correspondiente de la R.M. 050-2013-TR antes de usarlo como registro oficial.',
    normIds: RM050,
    articleIds: ['ds005-art33', 'ds005-art35'],
    retentionYears,
    columns: columns.map(([key, label, type, options]) => ({ key, label, type, options })),
  })),
  {
    id: 'investigacion-form',
    name: 'Informe de investigación de accidente o incidente',
    topic: 'accidentes',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Cronología, causas inmediatas y básicas, fallas del sistema y medidas. Separa hechos verificados de hipótesis.',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art33', 'ds005-art110'],
    fields: [
      { key: 'hechos', label: 'Hechos verificados (qué, cuándo, dónde, quién)', type: 'textarea' },
      { key: 'cronologia', label: 'Cronología', type: 'textarea' },
      { key: 'inmediatas', label: 'Causas inmediatas (actos y condiciones)', type: 'textarea' },
      { key: 'basicas', label: 'Causas básicas (factores personales y de trabajo)', type: 'textarea' },
      { key: 'sistema', label: 'Fallas del sistema de gestión', type: 'textarea' },
      { key: 'medidas', label: 'Medidas correctivas, responsables y plazos', type: 'textarea' },
    ],
  },
  {
    id: 'acta-comite-form',
    name: 'Acta de reunión del Comité o Supervisor',
    topic: 'comite',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Asistentes, agenda, acuerdos y seguimiento de acuerdos anteriores.',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art38'],
    columns: [
      { key: 'acuerdo', label: 'Acuerdo' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'plazo', label: 'Plazo', type: 'date' },
      { key: 'estado', label: 'Estado', type: 'select', options: ['Pendiente', 'En curso', 'Cumplido'] },
    ],
  },
  {
    id: 'ats-form',
    name: 'Análisis de Trabajo Seguro (ATS)',
    topic: 'seguridad-industrial',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Pasos de la tarea, peligros por paso, controles y firmas del equipo.',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art82'],
    columns: [
      { key: 'paso', label: 'Paso de la tarea' },
      { key: 'peligro', label: 'Peligro / riesgo' },
      { key: 'control', label: 'Control' },
      { key: 'responsable', label: 'Responsable' },
    ],
  },
  {
    id: 'permiso-alto-riesgo',
    name: 'Permiso escrito de trabajo de alto riesgo',
    topic: 'seguridad-industrial',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Altura, caliente, espacios confinados, energía peligrosa, izaje y excavaciones. Los reglamentos sectoriales pueden exigir formatos propios.',
    normIds: ['ds-024-2016-em', 'ds-011-2019-tr', 'rm-111-2013-mem-dm'],
    articleIds: [],
    fields: [
      { key: 'tipo', label: 'Tipo de trabajo', type: 'select', options: ['Altura', 'En caliente', 'Espacio confinado', 'Energía peligrosa (LOTO)', 'Izaje', 'Excavación'] },
      { key: 'verificaciones', label: 'Verificaciones previas', type: 'textarea' },
      { key: 'equipo', label: 'Personal autorizado y certificaciones', type: 'textarea' },
      { key: 'autoriza', label: 'Autoriza (supervisor)' },
      { key: 'cierre', label: 'Cierre del permiso', type: 'textarea' },
    ],
  },
  {
    id: 'contratistas-form',
    name: 'Verificación de contratistas',
    topic: 'contratistas',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Control previo de SCTR, IPERC, inducción, EPP y certificaciones de terceros (27.16 RLGIT).',
    normIds: ['law-29783'],
    articleIds: [],
    columns: [
      { key: 'contratista', label: 'Contratista' },
      { key: 'sctr', label: 'SCTR vigente', type: 'select', options: ['Sí', 'No'] },
      { key: 'iperc', label: 'IPERC/PETS revisado', type: 'select', options: ['Sí', 'No'] },
      { key: 'induccion', label: 'Inducción', type: 'select', options: ['Sí', 'No'] },
      { key: 'observaciones', label: 'Observaciones' },
    ],
  },
  {
    id: 'ergonomia-form',
    name: 'Evaluación de riesgo disergonómico por puesto',
    topic: 'ergonomia',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Exposición, método (REBA, RULA, NIOSH u OWAS según la tarea), resultado, controles y reevaluación.',
    normIds: ['rm-375-2008-tr'],
    articleIds: ['ds005-art33'],
    columns: [
      { key: 'puesto', label: 'Puesto / tarea' },
      { key: 'factor', label: 'Factor (postura, carga, repetitividad, pantalla)' },
      { key: 'metodo', label: 'Método' },
      { key: 'resultado', label: 'Resultado / nivel' },
      { key: 'control', label: 'Control implementado' },
      { key: 'reevaluacion', label: 'Reevaluación', type: 'date' },
    ],
  },
  {
    id: 'teletrabajo-form',
    name: 'Autoevaluación del puesto de teletrabajo',
    topic: 'teletrabajo',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Condiciones ergonómicas, iluminación, pausas y desconexión. Verifique el formato vigente que exija la norma de teletrabajo.',
    normIds: ['rm-375-2008-tr'],
    articleIds: [],
    columns: [
      { key: 'item', label: 'Aspecto evaluado' },
      { key: 'cumple', label: 'Cumple', type: 'select', options: ['Sí', 'No', 'Parcial'] },
      { key: 'recomendacion', label: 'Recomendación' },
    ],
  },
  {
    id: 'plan-accion-form',
    name: 'Plan de acción correctiva',
    topic: 'mejora',
    origin: 'propio',
    nature: 'recomendado',
    publisher: OWN,
    version: V,
    description: 'Hallazgo, causa, acción, responsable, plazo, evidencia de cierre y verificación de eficacia.',
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art32'],
    columns: [
      { key: 'hallazgo', label: 'Hallazgo' },
      { key: 'causa', label: 'Causa' },
      { key: 'accion', label: 'Acción' },
      { key: 'responsable', label: 'Responsable' },
      { key: 'plazo', label: 'Plazo', type: 'date' },
      { key: 'evidencia', label: 'Evidencia de cierre' },
      { key: 'eficacia', label: 'Eficacia verificada', type: 'select', options: ['Pendiente', 'Sí', 'No'] },
    ],
  },
]

export function findFormat(id: string): FormatItem | undefined {
  return FORMATS.find((item) => item.id === id)
}
