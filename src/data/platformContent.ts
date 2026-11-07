import {
  AlertTriangle,
  BookOpenCheck,
  Building2,
  Camera,
  ClipboardCheck,
  ClipboardList,
  Droplets,
  FileSpreadsheet,
  FileText,
  Flame,
  FolderTree,
  HeartPulse,
  Leaf,
  Recycle,
  Scale,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Stethoscope,
  Users,
  Wind,
} from 'lucide-react'
import type { ComponentType } from 'react'
import type { ObligationKind } from '../types'

export type IconType = ComponentType<{ size?: number | string; className?: string }>

/** Vistas públicas de la plataforma. */
export type SiteViewId =
  | 'inicio'
  | 'evolucion'
  | 'ruta'
  | 'obligaciones'
  | 'diagnostico'
  | 'plantillas'
  | 'formatos'
  | 'herramientas'
  | 'verificar'
  | 'fiscalizacion'
  | 'casos'
  | 'normativa'
  | 'iso'
  | 'soma'
  | 'visor'
  | 'senales'
  | 'glosario'
  | 'simulador'
  | 'rutas'
  | 'premium'

export const NAV_ITEMS: Array<{ id: SiteViewId; label: string; description: string }> = [
  { id: 'inicio', label: 'Inicio', description: 'Vista general del observatorio' },
  { id: 'normativa', label: 'Normas peruanas', description: 'Leyes y reglamentos con artículos cotejados y enlace al SPIJ' },
  { id: 'iso', label: 'ISO y sistemas integrados', description: 'ISO 45001, 14001, SIG, normas relacionadas e INACAL' },
  { id: 'evolucion', label: 'Evolución', description: 'Línea de tiempo normativa, ramas y especialidades' },
  { id: 'casos', label: 'Casuística', description: 'Precedentes del TFL y resoluciones' },
  { id: 'ruta', label: 'Mi Ruta', description: 'Diagnóstico guiado paso a paso' },
  { id: 'diagnostico', label: 'Obligaciones aplicables', description: 'Qué debo cumplir según mi organización' },
  { id: 'obligaciones', label: 'Por tamaño y rol', description: 'Qué corresponde según tamaño, sector y rol' },
  { id: 'visor', label: 'Visor SSOMA', description: 'Normas SST y ambientales en detalle, cuadros, riesgos y químicos' },
  { id: 'glosario', label: 'Glosario y colores', description: 'Términos, siglas, leyes y códigos de colores de la industria' },
  { id: 'senales', label: 'Señales y etiquetas', description: 'Señales de seguridad, stickers con QR y etiquetas SGA para imprimir' },
  { id: 'simulador', label: 'Simulador de ambientes', description: 'Oficina y almacén: identifique peligros y compare el riesgo inicial y residual' },
  { id: 'soma', label: 'SOMA y ambiente', description: 'Residuos, aspectos ambientales, químicos y derrames' },
  { id: 'herramientas', label: 'IPERC y herramientas', description: 'IPERC, analítica, plan de acción y reportes' },
  { id: 'formatos', label: 'Formatos y registros', description: 'Formatos oficiales y editables en línea' },
  { id: 'verificar', label: 'Cumplimiento y evidencias', description: 'Estado, evidencia y responsable por obligación' },
  { id: 'fiscalizacion', label: 'Fiscalización', description: 'Contingencias, expediente y defensa documentada' },
  { id: 'plantillas', label: 'Biblioteca', description: 'Guías, informes y plantillas descargables' },
  { id: 'rutas', label: 'Rutas de especialista', description: 'Cómo formarse en SST, SOMA e IPERC paso a paso' },
  { id: 'premium', label: 'Premium', description: 'Guías de IA, agentes y seguimiento de avance' },
]

export type SpaceId = 'explorar' | 'diagnosticar' | 'implementar' | 'verificar' | 'aprender'

/** Cinco espacios de trabajo: cada vista pertenece a uno. */
export const SPACES: Array<{ id: SpaceId; label: string; hint: string; views: SiteViewId[] }> = [
  { id: 'explorar', label: 'Explorar', hint: 'Normas, ISO, evolución y casos', views: ['normativa', 'visor', 'glosario', 'iso', 'evolucion', 'casos'] },
  { id: 'diagnosticar', label: 'Diagnosticar', hint: 'Qué le aplica y qué falta', views: ['diagnostico', 'ruta', 'obligaciones', 'soma'] },
  { id: 'implementar', label: 'Implementar', hint: 'IPERC, formatos y planes', views: ['herramientas', 'formatos'] },
  { id: 'verificar', label: 'Verificar', hint: 'Evidencias y fiscalización', views: ['verificar', 'fiscalizacion'] },
  { id: 'aprender', label: 'Aprender', hint: 'Guías, plantillas y rutas de especialista', views: ['plantillas', 'senales', 'simulador', 'rutas', 'premium'] },
]

/** Vistas que solo se muestran con sesión premium (Implementar se trabajará después). */
export const PREMIUM_VIEWS: SiteViewId[] = ['herramientas', 'formatos']

/** Recorrido guiado: orden en que se aprende y se avanza por la plataforma. */
export const LEARNING_PATH: SiteViewId[] = [
  'inicio',
  'normativa',
  'visor',
  'evolucion',
  'casos',
  'diagnostico',
  'ruta',
  'obligaciones',
  'herramientas',
  'formatos',
  'verificar',
  'fiscalizacion',
  'plantillas',
  'senales',
  'simulador',
  'premium',
]

export function pathFor(premium: boolean): SiteViewId[] {
  return LEARNING_PATH.filter((view) => premium || !PREMIUM_VIEWS.includes(view))
}

export function spacesFor(premium: boolean) {
  return SPACES.filter((space) => premium || space.id !== 'implementar')
}

export function isSiteView(value: string): value is SiteViewId {
  return NAV_ITEMS.some((item) => item.id === value)
}

export function spaceOf(view: SiteViewId): SpaceId | null {
  return SPACES.find((space) => space.views.includes(view))?.id ?? null
}

export const OBLIGATION_KIND_LABELS: Record<ObligationKind, string> = {
  'obligacion-legal': 'Obligación legal',
  recomendacion: 'Recomendación',
  'buena-practica': 'Buena práctica',
  'requisito-sectorial': 'Requisito sectorial',
  'pendiente-verificacion': 'Requiere verificación',
}

export const OBLIGATION_KIND_HELP: Record<ObligationKind, string> = {
  'obligacion-legal': 'La normativa peruana lo exige.',
  recomendacion: 'No es exigible por si mismo, pero ayuda a cumplir.',
  'buena-practica': 'Práctica útil que mejora la prevención.',
  'requisito-sectorial': 'Solo aplica si su actividad esta comprendida.',
  'pendiente-verificacion': 'Debe confirmarse en la fuente oficial antes de darlo por cierto.',
}

/* -------------------------------------------------------------------------- */
/* Seis tarjetas de la ruta práctica (página de inicio)                       */
/* -------------------------------------------------------------------------- */

export type RouteCardId = 'obligaciones' | 'organiza' | 'iperc' | 'soma' | 'plazos' | 'reportes'

export interface RouteCardPoint {
  text: string
  kind: ObligationKind
}

export interface RouteCard {
  id: RouteCardId
  order: number
  title: string
  summary: string
  icon: IconType
  accent: 'green' | 'blue' | 'amber' | 'teal' | 'violet' | 'sky'
  detailIntro: string
  points: RouteCardPoint[]
  normIds: string[]
  templateIds: string[]
  primaryAction: { label: string; view: SiteViewId }
}

export const ROUTE_CARDS: RouteCard[] = [
  {
    id: 'obligaciones',
    order: 1,
    title: 'Conoce tus obligaciones',
    summary: 'Requisitos legales y normativos aplicables.',
    icon: ShieldCheck,
    accent: 'green',
    detailIntro:
      'Antes de llenar formatos conviene saber que le exige la normativa peruana. Depende de si es entidad pública o empresa privada, de cuantas personas trabajan y de la actividad económica.',
    points: [
      { text: 'Todo empleador debe prevenir los riesgos de su actividad.', kind: 'obligacion-legal' },
      { text: 'Debe implementar un Sistema de Gestión de Seguridad y Salud en el Trabajo (SGSST).', kind: 'obligacion-legal' },
      { text: 'Si su actividad tiene reglamento propio (minería, construcción), además aplica ese reglamento.', kind: 'requisito-sectorial' },
    ],
    normIds: ['law-29783', 'ds-005-2012-tr', 'law-30222'],
    templateIds: ['politica-sst'],
    primaryAction: { label: 'Ver obligaciones', view: 'obligaciones' },
  },
  {
    id: 'organiza',
    order: 2,
    title: 'Organiza tu SST',
    summary: 'Política, roles, comité o supervisor y planificación.',
    icon: Users,
    accent: 'blue',
    detailIntro:
      'Organizar la SST significa dejar por escrito quien responde por que, con que recursos y en que plazos. Es lo que sostiene todo lo demas.',
    points: [
      { text: 'Política de seguridad y salud en el trabajo aprobada y difundida.', kind: 'obligacion-legal' },
      {
        text: 'Con 20 o mas trabajadores corresponde constituir un comité de SST; con menos, los trabajadores eligen un supervisor.',
        kind: 'obligacion-legal',
      },
      { text: 'Plan y programa anual de SST con responsables y fechas.', kind: 'obligacion-legal' },
      { text: 'Definir un responsable operativo del sistema aunque no sea especialista.', kind: 'buena-practica' },
    ],
    normIds: ['ds-005-2012-tr', 'sunafil-guia-comite', 'ds-001-2021-tr'],
    templateIds: ['politica-sst', 'plan-anual-sst', 'acta-comite', 'convocatoria-eleccion'],
    primaryAction: { label: 'Ver plantillas base', view: 'plantillas' },
  },
  {
    id: 'iperc',
    order: 3,
    title: 'IPERC y mapa de riesgos',
    summary: 'Identifica peligros, evalúa riesgos y prioriza controles.',
    icon: AlertTriangle,
    accent: 'amber',
    detailIntro:
      'IPERC significa Identificación de Peligros, Evaluación de Riesgos y determinación de Controles. Es el corazon de la prevención: primero se ve que puede danar, luego cuan grave sería y por último que se hace para evitarlo.',
    points: [
      { text: 'Identificar peligros por área, puesto y tarea, incluidas las tareas no rutinarias.', kind: 'obligacion-legal' },
      { text: 'Evaluar el riesgo y definir controles siguiendo la jerarquía: eliminar antes que usar EPP.', kind: 'obligacion-legal' },
      { text: 'Considerar ergonomía y factores psicosociales, no solo riesgos mecanicos.', kind: 'obligacion-legal' },
      { text: 'Publicar un mapa de riesgos visible para los trabajadores.', kind: 'obligacion-legal' },
    ],
    normIds: ['law-29783', 'ds-005-2012-tr', 'rm-375-2008-tr'],
    templateIds: ['iperc-generador', 'evaluacion-ergonomica'],
    primaryAction: { label: 'Abrir el generador IPERC', view: 'herramientas' },
  },
  {
    id: 'soma',
    order: 4,
    title: 'SOMA y ambiente',
    summary: 'Aspectos ambientales, residuos y control operacional.',
    icon: Leaf,
    accent: 'teal',
    detailIntro:
      'SOMA significa Seguridad Ocupacional y Medio Ambiente. Aquí se revisa que efectos tiene su actividad sobre el ambiente: residuos, derrames, consumo de agua y energía, químicos.',
    points: [
      { text: 'Identificar los aspectos ambientales de cada actividad y sus impactos.', kind: 'buena-practica' },
      { text: 'Segregar residuos y manejar por separado los residuos peligrosos.', kind: 'requisito-sectorial' },
      { text: 'Prevenir derrames y tener respuesta ante emergencias ambientales.', kind: 'buena-practica' },
      {
        text: 'Las obligaciones ambientales varían por sector, permiso y autoridad competente.',
        kind: 'pendiente-verificacion',
      },
    ],
    normIds: ['law-28611', 'dl-1278', 'ds-014-2017-minam'],
    templateIds: ['registro-residuos', 'aspectos-ambientales'],
    primaryAction: { label: 'Ver módulo SOMA', view: 'obligaciones' },
  },
  {
    id: 'plazos',
    order: 5,
    title: 'Plazos y registros',
    summary: 'Cumplimientos, evidencias y seguimiento.',
    icon: ClipboardCheck,
    accent: 'violet',
    detailIntro:
      'Cumplir sin evidencia es difícil de demostrar. Los registros del sistema de gestión son la memoria de lo que si se hizo.',
    points: [
      { text: 'Mantener los registros obligatorios del sistema de gestión.', kind: 'obligacion-legal' },
      { text: 'Realizar al menos cuatro capacitaciones de SST al año para cada trabajador.', kind: 'obligacion-legal' },
      { text: 'Notificar accidentes de trabajo, incidentes peligrosos y enfermedades ocupacionales.', kind: 'obligacion-legal' },
      { text: 'Los exámenes médicos ocupacionales dependen del puesto y del riesgo.', kind: 'pendiente-verificacion' },
    ],
    normIds: ['rm-050-2013-tr', 'ds-012-2014-tr', 'ds-006-2022-tr', 'ds-016-2016-tr'],
    templateIds: ['registro-accidentes', 'registro-capacitacion', 'registro-inspecciones', 'registro-epp'],
    primaryAction: { label: 'Ver registros y plazos', view: 'obligaciones' },
  },
  {
    id: 'reportes',
    order: 6,
    title: 'Reportes y mejora',
    summary: 'Formatos, indicadores y mejora continua.',
    icon: FileText,
    accent: 'sky',
    detailIntro:
      'Con la información ordenada se puede medir. Los reportes sirven para decidir donde invertir esfuerzo el próximo período.',
    points: [
      { text: 'Revisar periodicamente el sistema de gestión y dejar constancia.', kind: 'obligacion-legal' },
      { text: 'Usar indicadores simples: riesgos críticos, controles cerrados, capacitaciones cumplidas.', kind: 'buena-practica' },
      { text: 'Exportar la matriz y el plan de acción para reuniones y auditorias.', kind: 'buena-practica' },
    ],
    normIds: ['law-29783', 'ds-020-2019-tr'],
    templateIds: ['iperc-generador', 'informe-guia'],
    primaryAction: { label: 'Abrir reportes', view: 'herramientas' },
  },
]

/* -------------------------------------------------------------------------- */
/* Ruta recomendada (6 pasos)                                                 */
/* -------------------------------------------------------------------------- */

export interface RecommendedStep {
  id: string
  label: string
  hint: string
  icon: IconType
  view: SiteViewId
}

export const RECOMMENDED_STEPS: RecommendedStep[] = [
  { id: 'diagnostico', label: 'Diagnóstico', hint: 'Evalua tu situación actual.', icon: Stethoscope, view: 'ruta' },
  { id: 'documentos', label: 'Documentos base', hint: 'Política, objetivos y procedimientos.', icon: FolderTree, view: 'plantillas' },
  { id: 'riesgos', label: 'Identificación de riesgos', hint: 'IPERC y evaluación de riesgos.', icon: AlertTriangle, view: 'herramientas' },
  { id: 'controles', label: 'Controles', hint: 'Medidas de control y planificación.', icon: SlidersHorizontal, view: 'herramientas' },
  { id: 'evidencias', label: 'Evidencias', hint: 'Registros, inspecciones y capacitaciones.', icon: Camera, view: 'herramientas' },
  { id: 'exportacion', label: 'Exportación', hint: 'Reportes y formatos listos para usar.', icon: FileSpreadsheet, view: 'herramientas' },
]

/* -------------------------------------------------------------------------- */
/* Franja de cobertura                                                        */
/* -------------------------------------------------------------------------- */

export const COVERAGE_TAGS: Array<{ label: string; icon: IconType }> = [
  { label: 'SST', icon: ShieldCheck },
  { label: 'SOMA', icon: Leaf },
  { label: 'IPERC', icon: AlertTriangle },
  { label: 'Salud ocupacional', icon: HeartPulse },
  { label: 'Ergonomía', icon: Users },
  { label: 'Riesgos psicosociales', icon: BookOpenCheck },
  { label: 'Inspecciones', icon: Search },
  { label: 'Emergencias', icon: Flame },
  { label: 'Residuos', icon: Recycle },
]

/* -------------------------------------------------------------------------- */
/* Biblioteca de plantillas                                                   */
/* -------------------------------------------------------------------------- */

export type TemplateCategoryId =
  | 'organizacion'
  | 'iperc'
  | 'registros'
  | 'salud'
  | 'ambiente'
  | 'emergencias'
  | 'guias'

export const TEMPLATE_CATEGORIES: Array<{ id: TemplateCategoryId; label: string; description: string }> = [
  { id: 'organizacion', label: 'Organización del SST', description: 'Política, plan, programa, comité y capacitación.' },
  { id: 'iperc', label: 'IPERC y riesgos', description: 'Matriz, mapa de riesgos y evaluaciones especificas.' },
  { id: 'registros', label: 'Registros obligatorios', description: 'Accidentes, inspecciones, EPP y capacitaciones.' },
  { id: 'salud', label: 'Salud ocupacional', description: 'Vigilancia de la salud y exámenes ocupacionales.' },
  { id: 'ambiente', label: 'SOMA y ambiente', description: 'Aspectos ambientales, residuos y derrames.' },
  { id: 'emergencias', label: 'Emergencias', description: 'Plan de respuesta, brigadas y simulacros.' },
  { id: 'guias', label: 'Guías oficiales', description: 'Material de orientación publicado por entidades del Estado.' },
]

export type TemplateFormat = 'xlsx' | 'docx' | 'pdf' | 'enlace'

export interface TemplateItem {
  id: string
  name: string
  description: string
  category: TemplateCategoryId
  format: TemplateFormat
  /** Archivo servido por la propia aplicación (relativo a import.meta.env.BASE_URL). */
  file?: string
  /** Recurso oficial externo. */
  externalUrl?: string
  normIds: string[]
  audience: string[]
}

export const TEMPLATES: TemplateItem[] = [
  {
    id: 'iperc-generador',
    name: 'Generador IPERC normativo (Perú)',
    description: 'Libro Excel para armar la matriz IPERC fuera de línea, con hojas de peligros, evaluación y controles.',
    category: 'iperc',
    format: 'xlsx',
    file: 'templates/IPERC_Generador_Normativo_Peru.xlsx',
    normIds: ['law-29783', 'ds-005-2012-tr'],
    audience: ['Supervisores', 'Comités', 'Consultores', 'Estudiantes'],
  },
  {
    id: 'informe-guia',
    name: 'Guía para el informe IPERC',
    description: 'Documento Word con la estructura sugerida para presentar el informe de la matriz IPERC.',
    category: 'iperc',
    format: 'docx',
    file: 'templates/IPERC_Informe_Guia.docx',
    normIds: ['law-29783'],
    audience: ['Supervisores', 'Consultores', 'Recursos Humanos'],
  },
  {
    id: 'guia-comite-sunafil',
    name: 'Guía del comité o supervisor de SST (SUNAFIL)',
    description: 'Guía oficial en PDF que explica cuándo corresponde comité y cuándo supervisor, y cómo se eligen.',
    category: 'guias',
    format: 'pdf',
    externalUrl:
      'https://cdn.www.gob.pe/uploads/document/file/1348232/Gu%C3%ADa%20del%20Comit%C3%A9%20o%20Supervisor%20de%20Seguridad%20y%20Salud%20en%20el%20Trabajo.pdf',
    normIds: ['sunafil-guia-comite'],
    audience: ['Empleadores', 'Comités', 'Trabajadores'],
  },
  {
    id: 'formatos-rm-050',
    name: 'Formatos referenciales de registros obligatorios',
    description:
      'Anexos oficiales de la R.M. N.° 050-2013-TR: formatos de registros, modelo de reglamento interno y guía básica del SGSST.',
    category: 'registros',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr'],
    audience: ['Empleadores', 'Recursos Humanos', 'Comités'],
  },
  {
    id: 'modelos-servir',
    name: 'Modelos y formatos de SST (SERVIR)',
    description: 'Colección oficial de modelos de documentos de SST, orientada a entidades públicas.',
    category: 'organizacion',
    format: 'enlace',
    externalUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572314-modelos-y-formatos-de-seguridad-y-salud-en-el-trabajo-sst',
    normIds: ['servir-modelos-sst'],
    audience: ['Sector público', 'Comités', 'Recursos Humanos'],
  },
  {
    id: 'politica-sst',
    name: 'Política de SST',
    description: 'Declaración breve de compromiso de la dirección. Puede tomar como base el modelo oficial de SERVIR.',
    category: 'organizacion',
    format: 'enlace',
    externalUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572314-modelos-y-formatos-de-seguridad-y-salud-en-el-trabajo-sst',
    normIds: ['law-29783', 'servir-modelos-sst'],
    audience: ['Empleadores', 'Gerencia'],
  },
  {
    id: 'plan-anual-sst',
    name: 'Plan y programa anual de SST',
    description: 'Actividades del año con responsables, plazos y recursos. Base disponible en los modelos oficiales.',
    category: 'organizacion',
    format: 'enlace',
    externalUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572314-modelos-y-formatos-de-seguridad-y-salud-en-el-trabajo-sst',
    normIds: ['ds-005-2012-tr', 'servir-modelos-sst'],
    audience: ['Supervisores', 'Comités', 'Recursos Humanos'],
  },
  {
    id: 'acta-comite',
    name: 'Acta de reunion del comité de SST',
    description: 'Registro de acuerdos, asistentes y seguimiento de compromisos del comité.',
    category: 'organizacion',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr', 'sunafil-guia-comite'],
    audience: ['Comités', 'Supervisores'],
  },
  {
    id: 'convocatoria-eleccion',
    name: 'Convocatoria y acta de elección',
    description: 'Documentos del proceso de elección del comité o del supervisor de SST.',
    category: 'organizacion',
    format: 'enlace',
    externalUrl:
      'https://cdn.www.gob.pe/uploads/document/file/1348232/Gu%C3%ADa%20del%20Comit%C3%A9%20o%20Supervisor%20de%20Seguridad%20y%20Salud%20en%20el%20Trabajo.pdf',
    normIds: ['sunafil-guia-comite'],
    audience: ['Trabajadores', 'Recursos Humanos'],
  },
  {
    id: 'registro-accidentes',
    name: 'Registro de accidentes e incidentes',
    description: 'Registro de accidentes de trabajo, incidentes peligrosos y enfermedades ocupacionales.',
    category: 'registros',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr', 'ds-012-2014-tr'],
    audience: ['Supervisores', 'Recursos Humanos', 'Salud ocupacional'],
  },
  {
    id: 'investigacion-accidentes',
    name: 'Investigación de accidentes',
    description: 'Análisis de causas, medidas correctivas y verificación de cierre.',
    category: 'registros',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr', 'ds-006-2022-tr'],
    audience: ['Comités', 'Supervisores'],
  },
  {
    id: 'registro-capacitacion',
    name: 'Registro de capacitaciones',
    description: 'Tema, fecha, duración, expositor y firma de asistentes.',
    category: 'registros',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr', 'law-29783'],
    audience: ['Recursos Humanos', 'Supervisores'],
  },
  {
    id: 'registro-inspecciones',
    name: 'Registro de inspecciones internas',
    description: 'Hallazgos, responsables y plazos de levantamiento.',
    category: 'registros',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr'],
    audience: ['Comités', 'Supervisores'],
  },
  {
    id: 'registro-epp',
    name: 'Registro de entrega de EPP',
    description: 'Constancia de entrega de equipos de protección personal y su reposición.',
    category: 'registros',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['rm-050-2013-tr'],
    audience: ['Supervisores', 'Almacén'],
  },
  {
    id: 'evaluacion-ergonomica',
    name: 'Evaluación de riesgo disergonómico',
    description: 'Revisión de posturas, manipulación de cargas y movimientos repetitivos.',
    category: 'salud',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/394457-375-2008-tr',
    normIds: ['rm-375-2008-tr'],
    audience: ['Salud ocupacional', 'Supervisores', 'Recursos Humanos'],
  },
  {
    id: 'vigilancia-salud',
    name: 'Programa de vigilancia de la salud',
    description: 'Planificación de exámenes médicos ocupacionales según los riesgos del puesto.',
    category: 'salud',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/minsa/normas-legales/243792-312-2011-minsa',
    normIds: ['rm-312-2011-minsa', 'ds-016-2016-tr'],
    audience: ['Salud ocupacional', 'Recursos Humanos'],
  },
  {
    id: 'aspectos-ambientales',
    name: 'Matriz de aspectos e impactos ambientales',
    description: 'Relación entre cada actividad, su aspecto ambiental y el impacto que produce.',
    category: 'ambiente',
    format: 'enlace',
    externalUrl: 'https://sinia.minam.gob.pe/normas/ley-general-ambiente',
    normIds: ['law-28611'],
    audience: ['SOMA', 'Supervisores'],
  },
  {
    id: 'registro-residuos',
    name: 'Registro y segregación de residuos',
    description: 'Control de residuos generados, su clasificación y su destino final.',
    category: 'ambiente',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/minam/normas-legales/3610-1278',
    normIds: ['dl-1278', 'ds-014-2017-minam'],
    audience: ['SOMA', 'Almacén', 'Servicios generales'],
  },
  {
    id: 'plan-emergencias',
    name: 'Plan de respuesta ante emergencias',
    description: 'Escenarios, brigadas, rutas de evacuación y simulacros.',
    category: 'emergencias',
    format: 'enlace',
    externalUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    normIds: ['ds-005-2012-tr', 'rm-050-2013-tr'],
    audience: ['Comités', 'Brigadas', 'Supervisores'],
  },
  {
    id: 'elssa-sunafil',
    name: 'ELSSA 2.0 (SUNAFIL)',
    description: 'Herramienta oficial de autoevaluación de prevención de riesgos laborales.',
    category: 'guias',
    format: 'enlace',
    externalUrl:
      'https://www.gob.pe/institucion/sunafil/campa%C3%B1as/125953-elssa-2-0-herramienta-interactiva-para-la-prevencion-de-riesgos-laborales',
    normIds: ['sunafil-elssa-2'],
    audience: ['Micro y pequeñas empresas', 'Empleadores'],
  },
  {
    id: 'compendio-servir',
    name: 'Compendio de normativa SST (SERVIR)',
    description: 'Recopilación oficial de normas de SST, útil para confirmar versiones vigentes.',
    category: 'guias',
    format: 'enlace',
    externalUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572362-normatividad-relacionada-a-la-seguridad-y-salud-en-el-trabajo-sst',
    normIds: ['servir-normatividad-sst'],
    audience: ['Consultores', 'Estudiantes', 'Sector público'],
  },
]

export function findTemplate(id: string): TemplateItem | undefined {
  return TEMPLATES.find((item) => item.id === id)
}

/** Grupos de descarga rápida mostrados en la portada. */
export const QUICK_DOWNLOADS: Array<{
  id: string
  label: string
  hint: string
  format: TemplateFormat
  templateId: string
}> = [
  { id: 'excel', label: 'Plantillas Excel', hint: 'Formatos editables', format: 'xlsx', templateId: 'iperc-generador' },
  { id: 'word', label: 'Documentos Word', hint: 'Informes y procedimientos', format: 'docx', templateId: 'informe-guia' },
  { id: 'pdf', label: 'Guías en PDF', hint: 'Material oficial de orientación', format: 'pdf', templateId: 'guia-comite-sunafil' },
]

/* -------------------------------------------------------------------------- */
/* Diagnóstico guiado                                                         */
/* -------------------------------------------------------------------------- */

export type DiagnosticStatus = 'cumple' | 'pendiente' | 'no-aplica' | 'verificar'

export const DIAGNOSTIC_STATUS_LABELS: Record<DiagnosticStatus, string> = {
  cumple: 'Cumple',
  pendiente: 'Pendiente',
  'no-aplica': 'No aplica',
  verificar: 'Requiere verificación',
}

export interface DiagnosticOption {
  value: string
  label: string
  status?: DiagnosticStatus
}

export interface DiagnosticOutcome {
  action: string
  responsible: string
  evidence: string
  templateIds: string[]
  normIds: string[]
  /** Solo se completa cuando la frecuencia esta confirmada en fuente oficial. */
  frequency?: string
  explanation: string
  kind: ObligationKind
}

export interface DiagnosticQuestion {
  id: string
  question: string
  help: string
  /** 'perfil' define el contexto; 'control' produce un resultado con estado. */
  type: 'perfil' | 'control'
  options: DiagnosticOption[]
  outcome?: DiagnosticOutcome
}

const YES_NO_OPTIONS: DiagnosticOption[] = [
  { value: 'si', label: 'Sí', status: 'cumple' },
  { value: 'no', label: 'No', status: 'pendiente' },
  { value: 'duda', label: 'No estoy seguro', status: 'verificar' },
  { value: 'na', label: 'No aplica', status: 'no-aplica' },
]

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 'ownership',
    question: '¿La organización es pública o privada?',
    help: 'Sirve para mostrarle los modelos y formatos que le corresponden.',
    type: 'perfil',
    options: [
      { value: 'private', label: 'Privada' },
      { value: 'public', label: 'Pública' },
    ],
  },
  {
    id: 'size',
    question: '¿Cuántas personas trabajan en la organización?',
    help: 'El número de trabajadores cambia algunas obligaciones, por ejemplo comité o supervisor de SST.',
    type: 'perfil',
    options: [
      { value: 'micro', label: '1 a 10' },
      { value: 'small', label: '11 a 19' },
      { value: 'medium', label: '20 a 100' },
      { value: 'large', label: 'Más de 100' },
    ],
  },
  {
    id: 'sector',
    question: '¿A qué sector o actividad económica pertenece?',
    help: 'Algunas actividades tienen además un reglamento sectorial propio.',
    type: 'perfil',
    options: [
      { value: 'offices', label: 'Oficinas y servicios' },
      { value: 'construction', label: 'Construcción' },
      { value: 'mining', label: 'Minería' },
      { value: 'health', label: 'Salud' },
      { value: 'manufacturing', label: 'Manufactura' },
      { value: 'transport_logistics', label: 'Transporte y logística' },
      { value: 'warehouses', label: 'Almacenes' },
      { value: 'public', label: 'Administración pública' },
      { value: 'maintenance_services', label: 'Mantenimiento y servicios' },
      { value: 'hydrocarbons', label: 'Hidrocarburos' },
    ],
  },
  {
    id: 'committee',
    question: '¿Cuenta con comité o supervisor de seguridad y salud en el trabajo?',
    help: 'El comité o el supervisor representa a los trabajadores en materia de prevención.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action:
        'Convocar la elección y dejar constancia escrita. Con 20 o mas trabajadores corresponde comité; con menos, un supervisor elegido por los trabajadores.',
      responsible: 'Empleador, con participación de los trabajadores',
      evidence: 'Convocatoria, acta de elección y actas de reunion',
      templateIds: ['convocatoria-eleccion', 'acta-comite', 'guia-comite-sunafil'],
      normIds: ['sunafil-guia-comite', 'ds-005-2012-tr', 'ds-001-2021-tr'],
      explanation:
        'Es la forma en que los trabajadores participan en la prevención. Sin comité ni supervisor, el sistema queda sin contraparte.',
      kind: 'obligacion-legal',
    },
  },
  {
    id: 'iperc',
    question: '¿Tiene una matriz IPERC vigente?',
    help: 'IPERC: Identificación de Peligros, Evaluación de Riesgos y determinación de Controles.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action: 'Elaborar o actualizar la matriz IPERC por área, puesto y tarea, con participación de los trabajadores.',
      responsible: 'Responsable de SST, con el comité o supervisor',
      evidence: 'Matriz IPERC firmada, lista de participantes y acta de revisión',
      templateIds: ['iperc-generador', 'informe-guia'],
      normIds: ['law-29783', 'ds-005-2012-tr'],
      explanation:
        'Sin IPERC no se sabe que controlar. Es la base para el plan anual, la capacitación y la compra de equipos de protección.',
      kind: 'obligacion-legal',
    },
  },
  {
    id: 'risk-map',
    question: '¿Tiene un mapa de riesgos publicado?',
    help: 'Es un plano o esquema del centro de trabajo que muestra donde están los riesgos.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action: 'Elaborar el mapa de riesgos a partir de la matriz IPERC y colocarlo en un lugar visible.',
      responsible: 'Responsable de SST, con el comité o supervisor',
      evidence: 'Mapa de riesgos actualizado y fotografia de su exhibición',
      templateIds: ['iperc-generador'],
      normIds: ['law-29783', 'ds-005-2012-tr'],
      explanation: 'El mapa hace visible el riesgo para todos, incluidos visitantes y personal nuevo.',
      kind: 'obligacion-legal',
    },
  },
  {
    id: 'annual-plan',
    question: '¿Tiene plan y programa anual de SST?',
    help: 'El plan dice qué se hará en el año; el programa detalla actividades, responsables y fechas.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action: 'Elaborar el plan y el programa anual con objetivos, actividades, responsables, plazos y presupuesto.',
      responsible: 'Empleador con el comité o supervisor de SST',
      evidence: 'Plan y programa aprobados, con acta de aprobación',
      templateIds: ['plan-anual-sst', 'modelos-servir'],
      normIds: ['ds-005-2012-tr'],
      explanation: 'Sin plan anual las acciones quedan sueltas y no se puede medir avance.',
      kind: 'obligacion-legal',
    },
  },
  {
    id: 'records',
    question: '¿Mantiene los registros obligatorios del sistema de gestión?',
    help: 'Son los registros de accidentes, capacitaciones, inspecciones, entrega de EPP, entre otros.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action: 'Implementar los registros del SGSST usando como referencia los formatos oficiales.',
      responsible: 'Responsable de SST y Recursos Humanos',
      evidence: 'Registros completos, ordenados y disponibles',
      templateIds: ['formatos-rm-050', 'registro-capacitacion', 'registro-inspecciones', 'registro-epp'],
      normIds: ['rm-050-2013-tr', 'ds-005-2012-tr'],
      explanation:
        'Los formatos publicados por el sector trabajo son referenciales, pero la información mínima que contienen si es obligatoria.',
      kind: 'obligacion-legal',
    },
  },
  {
    id: 'accidents',
    question: '¿Registra e investiga los accidentes e incidentes?',
    help: 'Incluye accidentes de trabajo, incidentes peligrosos y enfermedades ocupacionales.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action: 'Registrar el evento, investigar sus causas, definir medidas correctivas y notificar cuando corresponda.',
      responsible: 'Empleador, comité o supervisor y responsable de SST',
      evidence: 'Registro del evento, informe de investigación y constancia de notificación',
      templateIds: ['registro-accidentes', 'investigacion-accidentes'],
      normIds: ['ds-012-2014-tr', 'ds-006-2022-tr', 'rm-050-2013-tr'],
      explanation:
        'La notificación se realiza en el sistema informático del sector trabajo. Los plazos dependen del tipo de evento: confirmelos en la fuente oficial.',
      kind: 'obligacion-legal',
    },
  },
  {
    id: 'environment',
    question: '¿Gestiona aspectos ambientales, residuos o derrames?',
    help: 'Por ejemplo: segregación de residuos, manejo de químicos o respuesta ante derrames.',
    type: 'control',
    options: YES_NO_OPTIONS,
    outcome: {
      action:
        'Identificar los aspectos ambientales de sus actividades, ordenar la segregación de residuos y preparar la respuesta ante derrames.',
      responsible: 'Responsable de SOMA o de servicios generales',
      evidence: 'Matriz de aspectos e impactos, registro de residuos y evidencia de simulacros',
      templateIds: ['aspectos-ambientales', 'registro-residuos'],
      normIds: ['law-28611', 'dl-1278', 'ds-014-2017-minam'],
      explanation:
        'Las obligaciones ambientales concretas dependen del sector, la actividad, el permiso y la autoridad competente. Verifique cual le corresponde.',
      kind: 'pendiente-verificacion',
    },
  },
]

/* -------------------------------------------------------------------------- */
/* Obligaciones                                                               */
/* -------------------------------------------------------------------------- */

export type AudienceId = 'empleador' | 'trabajador' | 'comite' | 'supervisor' | 'rrhh' | 'consultor'

export const AUDIENCES: Array<{ id: AudienceId; label: string }> = [
  { id: 'empleador', label: 'Empleador o dirección' },
  { id: 'supervisor', label: 'Supervisor de SST' },
  { id: 'comite', label: 'Comité de SST' },
  { id: 'rrhh', label: 'Recursos Humanos' },
  { id: 'trabajador', label: 'Trabajador' },
  { id: 'consultor', label: 'Consultor o estudiante' },
]

export type SizeBandId = 'micro' | 'small' | 'medium' | 'large'

export const SIZE_BANDS: Array<{ id: SizeBandId; label: string }> = [
  { id: 'micro', label: '1 a 10 trabajadores' },
  { id: 'small', label: '11 a 19 trabajadores' },
  { id: 'medium', label: '20 a 100 trabajadores' },
  { id: 'large', label: 'Más de 100 trabajadores' },
]

export interface ObligationItem {
  id: string
  title: string
  plainText: string
  kind: ObligationKind
  responsible: string
  evidence: string
  /** Solo cuando la frecuencia esta confirmada en fuente oficial. */
  frequency?: string
  normIds: string[]
  templateIds: string[]
  audiences: AudienceId[]
  sizes: SizeBandId[]
  /** Vacio = aplica a cualquier sector. */
  sectors?: string[]
}

export const OBLIGATIONS: ObligationItem[] = [
  {
    id: 'sgsst',
    title: 'Implementar el sistema de gestión de SST',
    plainText:
      'Toda organización con trabajadores debe contar con un sistema de gestión de seguridad y salud en el trabajo, proporcional a su tamaño y a sus riesgos.',
    kind: 'obligacion-legal',
    responsible: 'Empleador o maxima autoridad',
    evidence: 'Política de SST, plan anual y documentos del sistema',
    normIds: ['law-29783', 'ds-005-2012-tr'],
    templateIds: ['politica-sst', 'plan-anual-sst'],
    audiences: ['empleador', 'rrhh', 'consultor'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'comite',
    title: 'Constituir comité de SST (20 o mas trabajadores)',
    plainText:
      'En centros de trabajo con veinte (20) o mas trabajadores corresponde constituir un comité de seguridad y salud en el trabajo, con igual número de representantes del empleador y de los trabajadores.',
    kind: 'obligacion-legal',
    responsible: 'Empleador con participación de los trabajadores',
    evidence: 'Convocatoria, acta de elección y actas de reunion',
    frequency: 'Reunión ordinaria mensual; mandato según el reglamento (Ley 29783, art. 29; D.S. 005-2012-TR)',
    normIds: ['sunafil-guia-comite', 'ds-005-2012-tr', 'ds-001-2021-tr'],
    templateIds: ['convocatoria-eleccion', 'acta-comite', 'guia-comite-sunafil'],
    audiences: ['empleador', 'comite', 'rrhh', 'trabajador'],
    sizes: ['medium', 'large'],
  },
  {
    id: 'supervisor',
    title: 'Elegir supervisor de SST (menos de 20 trabajadores)',
    plainText:
      'En centros de trabajo con menos de veinte (20) trabajadores son los propios trabajadores quienes eligen a su supervisor de seguridad y salud en el trabajo.',
    kind: 'obligacion-legal',
    responsible: 'Trabajadores, con facilidades del empleador',
    evidence: 'Acta de elección del supervisor',
    normIds: ['sunafil-guia-comite', 'ds-005-2012-tr'],
    templateIds: ['convocatoria-eleccion', 'guia-comite-sunafil'],
    audiences: ['empleador', 'supervisor', 'trabajador'],
    sizes: ['micro', 'small'],
  },
  {
    id: 'iperc',
    title: 'Identificar peligros y evaluar riesgos (IPERC)',
    plainText:
      'El empleador debe identificar los peligros de cada actividad, evaluar los riesgos y definir controles, con participación de los trabajadores.',
    kind: 'obligacion-legal',
    responsible: 'Empleador y responsable de SST',
    evidence: 'Matriz IPERC vigente y acta de revisión',
    frequency: 'Actualizar sin exceder un año, y antes si cambian las condiciones o hay daños a la salud (Ley 29783, art. 57; D.S. 005-2012-TR, art. 77, texto del D.S. 002-2020-TR)',
    normIds: ['law-29783', 'ds-005-2012-tr', 'rm-375-2008-tr'],
    templateIds: ['iperc-generador'],
    audiences: ['empleador', 'supervisor', 'comite', 'consultor'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'capacitacion',
    title: 'Capacitar en seguridad y salud en el trabajo',
    plainText:
      'Los trabajadores deben recibir al menos cuatro (4) capacitaciones al año en materia de seguridad y salud en el trabajo. El costo no recae sobre el trabajador.',
    kind: 'obligacion-legal',
    responsible: 'Empleador y Recursos Humanos',
    evidence: 'Registro de capacitaciones con firma de asistentes',
    frequency: 'No menos de cuatro capacitaciones al año, además de la inducción (Ley 29783, art. 35 b)',
    normIds: ['law-29783', 'rm-050-2013-tr'],
    templateIds: ['registro-capacitacion'],
    audiences: ['empleador', 'rrhh', 'supervisor', 'trabajador'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'registros',
    title: 'Mantener los registros obligatorios del SGSST',
    plainText:
      'Se deben mantener los registros del sistema de gestión. Los formatos publicados por el sector trabajo son referenciales, pero la información mínima si es obligatoria.',
    kind: 'obligacion-legal',
    responsible: 'Responsable de SST y Recursos Humanos',
    evidence: 'Registros completos y disponibles para consulta',
    frequency: 'Continua. Conservación: 20 años enfermedades ocupacionales, 10 años accidentes e incidentes peligrosos, 5 años los demás (D.S. 005-2012-TR, art. 35)',
    normIds: ['rm-050-2013-tr', 'ds-005-2012-tr'],
    templateIds: ['formatos-rm-050', 'registro-inspecciones', 'registro-epp'],
    audiences: ['empleador', 'rrhh', 'supervisor', 'comite'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'notificacion',
    title: 'Notificar accidentes, incidentes peligrosos y enfermedades ocupacionales',
    plainText:
      'Los accidentes de trabajo, los incidentes peligrosos y las enfermedades ocupacionales se registran y se notifican en el sistema informático del sector trabajo.',
    kind: 'obligacion-legal',
    responsible: 'Empleador y centro médico asistencial, según el caso',
    evidence: 'Constancia de notificación e informe de investigación',
    normIds: ['ds-012-2014-tr', 'ds-006-2022-tr'],
    templateIds: ['registro-accidentes', 'investigacion-accidentes'],
    audiences: ['empleador', 'rrhh', 'supervisor', 'comite'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'salud',
    title: 'Realizar la vigilancia de la salud de los trabajadores',
    plainText:
      'El empleador realiza exámenes médicos ocupacionales según el trabajo que desempena cada persona y los riesgos a los que esta expuesta.',
    kind: 'obligacion-legal',
    responsible: 'Empleador y servicio de salud ocupacional',
    evidence: 'Programa de vigilancia y constancias de aptitud',
    frequency: 'Exámenes médicos cada dos años; en alto riesgo, al ingreso, durante y al término (Ley 29783, art. 49 d, modificado por la Ley 30222)',
    normIds: ['ds-016-2016-tr', 'rm-312-2011-minsa'],
    templateIds: ['vigilancia-salud'],
    audiences: ['empleador', 'rrhh'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'ergonomia',
    title: 'Evaluar el riesgo disergonómico',
    plainText:
      'Adaptar el puesto a la persona: revisar posturas, manipulación de cargas y movimientos repetitivos con la norma básica de ergonomía.',
    kind: 'obligacion-legal',
    responsible: 'Responsable de SST y salud ocupacional',
    evidence: 'Evaluación ergonómica y medidas implementadas',
    normIds: ['rm-375-2008-tr'],
    templateIds: ['evaluacion-ergonomica'],
    audiences: ['empleador', 'supervisor', 'rrhh'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'emergencias',
    title: 'Preparar la respuesta ante emergencias',
    plainText:
      'Definir que hacer ante incendio, sismo, derrame o accidente grave: brigadas, rutas de evacuación, señalización y simulacros.',
    kind: 'obligacion-legal',
    responsible: 'Empleador con el comité o supervisor',
    evidence: 'Plan de emergencias, registro de simulacros y señalización',
    normIds: ['ds-005-2012-tr'],
    templateIds: ['plan-emergencias'],
    audiences: ['empleador', 'comite', 'supervisor', 'trabajador'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'inspecciones',
    title: 'Realizar inspecciones internas planificadas',
    plainText:
      'Revisar periodicamente las condiciones de trabajo y registrar hallazgos con responsable y plazo de levantamiento.',
    kind: 'buena-practica',
    responsible: 'Comité o supervisor de SST',
    evidence: 'Registro de inspecciones y cierre de hallazgos',
    normIds: ['rm-050-2013-tr'],
    templateIds: ['registro-inspecciones'],
    audiences: ['comite', 'supervisor'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'residuos',
    title: 'Manejar los residuos sólidos que genera',
    plainText:
      'Segregar los residuos y darles un destino adecuado. Las obligaciones concretas dependen del tipo de generador y de la autoridad competente.',
    kind: 'requisito-sectorial',
    responsible: 'Responsable de SOMA o servicios generales',
    evidence: 'Registro de residuos y comprobantes de disposición',
    normIds: ['dl-1278', 'ds-014-2017-minam'],
    templateIds: ['registro-residuos'],
    audiences: ['empleador', 'supervisor'],
    sizes: ['micro', 'small', 'medium', 'large'],
  },
  {
    id: 'sector-construccion',
    title: 'Cumplir la norma técnica de seguridad en construcción',
    plainText:
      'Las obras de construcción civil se rigen además por la norma técnica G.050 del Reglamento Nacional de Edificaciones.',
    kind: 'requisito-sectorial',
    responsible: 'Residente de obra y prevencionista',
    evidence: 'Plan de seguridad de obra y registros de campo',
    normIds: ['rne-g050'],
    templateIds: [],
    audiences: ['empleador', 'supervisor', 'consultor'],
    sizes: ['micro', 'small', 'medium', 'large'],
    sectors: ['construction'],
  },
  {
    id: 'sector-mineria',
    title: 'Cumplir el reglamento de seguridad y salud ocupacional en minería',
    plainText:
      'La actividad minera cuenta con un reglamento propio, adicional al marco general de SST.',
    kind: 'requisito-sectorial',
    responsible: 'Titular minero y gerencia de seguridad',
    evidence: 'Documentación exigida por el reglamento sectorial',
    normIds: ['ds-024-2016-em'],
    templateIds: [],
    audiences: ['empleador', 'supervisor', 'consultor'],
    sizes: ['micro', 'small', 'medium', 'large'],
    sectors: ['mining'],
  },
  {
    id: 'sector-publico',
    title: 'Usar los modelos de SST del sector público',
    plainText:
      'Las entidades públicas cuentan con modelos y formatos oficiales publicados por SERVIR para ordenar su sistema de gestión.',
    kind: 'recomendacion',
    responsible: 'Oficina de Recursos Humanos de la entidad',
    evidence: 'Documentos adaptados a la entidad',
    normIds: ['servir-modelos-sst', 'servir-normatividad-sst'],
    templateIds: ['modelos-servir', 'compendio-servir'],
    audiences: ['empleador', 'rrhh', 'comite'],
    sizes: ['micro', 'small', 'medium', 'large'],
    sectors: ['public'],
  },
]

/* -------------------------------------------------------------------------- */
/* Módulo SOMA                                                                */
/* -------------------------------------------------------------------------- */

export interface SomaTopic {
  id: string
  title: string
  description: string
  icon: IconType
  kind: ObligationKind
  practicalSteps: string[]
  normIds: string[]
}

export const SOMA_TOPICS: SomaTopic[] = [
  {
    id: 'aspectos',
    title: 'Aspectos e impactos ambientales',
    description:
      'Un aspecto es lo que su actividad hace al ambiente (por ejemplo, generar residuos). El impacto es la consecuencia (por ejemplo, contaminar el suelo).',
    icon: Leaf,
    kind: 'buena-practica',
    practicalSteps: [
      'Liste sus actividades por área.',
      'Anote qué entra y qué sale de cada actividad.',
      'Marque cuáles tienen impacto significativo.',
    ],
    normIds: ['law-28611'],
  },
  {
    id: 'residuos',
    title: 'Segregación de residuos',
    description: 'Separar en origen facilita la valorización y evita mezclar residuos peligrosos con los comunes.',
    icon: Recycle,
    kind: 'requisito-sectorial',
    practicalSteps: [
      'Defina puntos de acopio señalizados.',
      'Capacite al personal en qué va en cada contenedor.',
      'Registre cantidades y destino final.',
    ],
    normIds: ['dl-1278', 'ds-014-2017-minam'],
  },
  {
    id: 'peligrosos',
    title: 'Residuos peligrosos',
    description:
      'Requieren almacenamiento, transporte y disposición diferenciados. Las condiciones exactas dependen del tipo de generador.',
    icon: AlertTriangle,
    kind: 'pendiente-verificacion',
    practicalSteps: [
      'Identifique qué residuos son peligrosos en su operación.',
      'Almacénelos separados, señalizados y con contención.',
      'Confirme con la autoridad competente los requisitos que le aplican.',
    ],
    normIds: ['dl-1278', 'ds-014-2017-minam'],
  },
  {
    id: 'derrames',
    title: 'Prevención y respuesta ante derrames',
    description: 'Un derrame pequeño bien atendido evita un incidente ambiental mayor.',
    icon: Droplets,
    kind: 'buena-practica',
    practicalSteps: [
      'Coloque kits antiderrame cerca de los puntos de riesgo.',
      'Entrene al personal en el uso del kit.',
      'Realice simulacros y registre la práctica.',
    ],
    normIds: ['law-28611'],
  },
  {
    id: 'quimicos',
    title: 'Almacenamiento de químicos',
    description: 'Guardar productos incompatibles juntos es una causa frecuente de incidentes.',
    icon: Flame,
    kind: 'buena-practica',
    practicalSteps: [
      'Tenga la hoja de datos de seguridad (SDS) de cada producto.',
      'Separe incompatibles y mantenga ventilación.',
      'Rotule todos los envases, incluidos los trasvasados.',
    ],
    normIds: ['law-28611'],
  },
  {
    id: 'consumo',
    title: 'Consumo de agua y energía',
    description: 'Medir el consumo permite fijar metas realistas de reducción.',
    icon: Wind,
    kind: 'buena-practica',
    practicalSteps: ['Registre consumos mensuales.', 'Identifique fugas y equipos ineficientes.', 'Fije una meta anual simple.'],
    normIds: ['law-28611'],
  },
  {
    id: 'controles',
    title: 'Controles operacionales y contratistas',
    description: 'Los contratistas deben cumplir sus mismas reglas ambientales dentro de sus instalaciones.',
    icon: ClipboardList,
    kind: 'buena-practica',
    practicalSteps: [
      'Incluya requisitos ambientales en el contrato.',
      'Realice inducción ambiental al ingreso.',
      'Inspeccione y registre hallazgos.',
    ],
    normIds: ['law-28611'],
  },
  {
    id: 'mejora',
    title: 'Evidencia y mejora continua',
    description: 'La evidencia ambiental funciona igual que la de SST: sin registro, no se puede demostrar.',
    icon: Building2,
    kind: 'buena-practica',
    practicalSteps: [
      'Archive registros de residuos e inspecciones.',
      'Revise resultados cada trimestre.',
      'Ajuste controles según lo observado.',
    ],
    normIds: ['law-28611'],
  },
]

export const SOMA_DISCLAIMER =
  'Las obligaciones ambientales varían según el sector, la actividad, los permisos, la ubicación y la autoridad competente (MINAM, OEFA, DIGESA, ANA, OSINERGMIN o el ministerio del sector). Este módulo reúne buenas prácticas generales y enlaza solo normas oficiales verificadas.'

export const PLATFORM_DISCLAIMER =
  'Herramienta informativa y preventiva. Verifique siempre la versión vigente de cada norma en su fuente oficial.'

export const HERRAMIENTAS_ICON = Scale
