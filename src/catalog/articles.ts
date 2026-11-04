import { ARTICLES_UPDATE } from './articlesUpdate'

/**
 * Articulos verificados contra el texto oficial.
 *
 * Cada entrada se cotejo el 2026-11-03 con el PDF publicado en gob.pe. El texto
 * corresponde a la publicacion original del reglamento; las modificatorias se
 * indican en `amendedBy` y deben revisarse antes de citar el articulo en un descargo.
 * "Verificado" significa: el articulo existe y dice lo resumido. No significa que la
 * interpretacion sea aplicable a un caso concreto (eso exige validacion juridica).
 */
export type ArticleVerification = 'texto-oficial-verificado' | 'pendiente-validacion-juridica'

export interface CatalogArticle {
  id: string
  normId: string
  label: string
  title: string
  /** Fragmento literal breve del texto oficial. */
  excerpt: string
  /** Explicacion en lenguaje claro; no sustituye el texto legal. */
  plainLanguage: string
  topics: string[]
  sourceUrl: string
  verification: ArticleVerification
  verifiedAt: string
  amendedBy?: string[]
  /** Sustento general de la evaluacion de riesgos de cualquier fila IPERC. */
  appliesToIperc?: boolean
}

const DS005 = 'https://cdn.www.gob.pe/uploads/document/file/571763/Decreto_Supremo_N__005-2012-TR.pdf?v=1585259918'
const RLGIT = 'https://cdn.www.gob.pe/uploads/document/file/2845244/DS%20019-2006-TR%20-%20Aprueban%20Reglamento%20de%20la%20Ley%20General%20de%20Inspecci%C3%B3n%20del%20Trabajo.pdf'
const DS008 = 'https://cdn.www.gob.pe/uploads/document/file/519862/Decreto-supremo-n-008-2020-tr-1853904-1.pdf'
const VERIFIED = '2026-11-03'
const DS005_AMENDED = ['ds-006-2014-tr', 'ds-016-2016-tr', 'ds-020-2019-tr', 'ds-001-2021-tr', 'ds-002-2020-tr']


const BASE_ARTICLES: CatalogArticle[] = [
  {
    id: 'ds005-art25',
    normId: 'ds-005-2012-tr',
    label: 'Art. 25',
    title: 'Implementación del SGSST',
    excerpt: 'El empleador debe implementar el Sistema de Gestión de la Seguridad y Salud en el Trabajo […] en función del tipo de empresa u organización, nivel de exposición a peligros y riesgos, y la cantidad de trabajadores expuestos.',
    plainLanguage: 'Todo empleador implementa un SGSST proporcional a su tamaño y riesgos. La acreditación (p. ej. ISO 45001) es voluntaria y no reemplaza esta obligación.',
    topics: ['sgsst'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art26',
    normId: 'ds-005-2012-tr',
    label: 'Art. 26',
    title: 'Obligaciones de organización del empleador',
    excerpt: 'El empleador está obligado a: a) Garantizar que la seguridad y salud en el trabajo sea una responsabilidad conocida y aceptada en todos los niveles de la organización […] c) Disponer de una supervisión efectiva…',
    plainLanguage: 'Define responsabilidades en todos los niveles, comunica qué área gestiona los riesgos y asegura una supervisión efectiva y documentada.',
    topics: ['sgsst', 'supervision'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art27',
    normId: 'ds-005-2012-tr',
    label: 'Art. 27',
    title: 'Capacitación en prevención',
    excerpt: 'El empleador, en cumplimiento del deber de prevención y del artículo 27 de la Ley, garantiza que los trabajadores sean capacitados en materia de prevención.',
    plainLanguage: 'La capacitación se centra en el puesto, en los cambios de funciones o tecnología y se brinda a todo trabajador, cualquiera sea su contrato.',
    topics: ['capacitacion'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art32',
    normId: 'ds-005-2012-tr',
    label: 'Art. 32',
    title: 'Documentación que debe exhibir el empleador',
    excerpt: 'La documentación del Sistema de Gestión […] que debe exhibir el empleador es la siguiente: a) La política y objetivos […] b) El Reglamento Interno […] c) La identificación de peligros, evaluación de riesgos y sus medidas de control. d) El mapa de riesgo. e) La planificación de la actividad preventiva. f) El Programa Anual…',
    plainLanguage: 'Política y objetivos, RISST (cuando corresponda), IPERC, mapa de riesgos, planificación preventiva y programa anual deben estar disponibles para exhibirse.',
    topics: ['documentacion', 'iperc', 'mapa-riesgos', 'politica', 'programa-anual'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art33',
    normId: 'ds-005-2012-tr',
    label: 'Art. 33',
    title: 'Registros obligatorios del SGSST',
    excerpt: 'Los registros obligatorios […] son: a) Registro de accidentes de trabajo, enfermedades ocupacionales, incidentes peligrosos y otros incidentes […] b) Registro de exámenes médicos ocupacionales. c) Registro del monitoreo de agentes físicos, químicos, biológicos, psicosociales y factores de riesgo disergonómicos…',
    plainLanguage: 'Ocho registros: accidentes e incidentes, EMO, monitoreo de agentes, inspecciones internas, estadísticas, equipos de seguridad o emergencia, inducción/capacitación/simulacros y auditorías.',
    topics: ['registros'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art35',
    normId: 'ds-005-2012-tr',
    label: 'Art. 35',
    title: 'Conservación de registros',
    excerpt: 'El registro de enfermedades ocupacionales debe conservarse por un período de veinte (20) años; los registros de accidentes de trabajo e incidentes peligrosos por un periodo de diez (10) años posteriores al suceso; y los demás registros por un periodo de cinco (5) años posteriores al suceso.',
    plainLanguage: 'Enfermedades ocupacionales: 20 años. Accidentes e incidentes peligrosos: 10 años. Demás registros: 5 años.',
    topics: ['registros', 'conservacion'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art38',
    normId: 'ds-005-2012-tr',
    label: 'Art. 38',
    title: 'Funcionamiento del Comité de SST',
    excerpt: 'El empleador debe asegurar, cuando corresponda, el establecimiento y el funcionamiento efectivo de un Comité de Seguridad y Salud en el Trabajo, el reconocimiento de los representantes de los trabajadores y facilitar su participación.',
    plainLanguage: 'Cuando corresponde un comité, el empleador lo constituye, reconoce a los representantes elegidos y facilita su funcionamiento real.',
    topics: ['comite'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art39',
    normId: 'ds-005-2012-tr',
    label: 'Art. 39',
    title: 'Supervisor de SST',
    excerpt: 'El empleador que tenga menos de veinte (20) trabajadores debe garantizar que la elección del Supervisor de Seguridad y Salud en el Trabajo se realice por los trabajadores.',
    plainLanguage: 'Con menos de 20 trabajadores, los propios trabajadores eligen a un Supervisor de SST.',
    topics: ['supervisor'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art43',
    normId: 'ds-005-2012-tr',
    label: 'Art. 43',
    title: 'Número de miembros del Comité',
    excerpt: 'El número de personas que componen el Comité […] es definido por acuerdo de partes no pudiendo ser menor de cuatro (4) ni mayor de doce (12) miembros.',
    plainLanguage: 'Entre 4 y 12 miembros por acuerdo. Sin acuerdo, no menos de 6 en empleadores con más de 100 trabajadores (con incremento según tamaño).',
    topics: ['comite'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art74',
    normId: 'ds-005-2012-tr',
    label: 'Art. 74',
    title: 'Reglamento Interno de SST',
    excerpt: 'Los empleadores con veinte (20) o más trabajadores deben elaborar su Reglamento Interno de Seguridad y Salud en el Trabajo, el que debe contener la siguiente estructura mínima…',
    plainLanguage: 'Con 20 o más trabajadores el RISST es obligatorio y debe seguir la estructura mínima del artículo.',
    topics: ['risst'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art75',
    normId: 'ds-005-2012-tr',
    label: 'Art. 75',
    title: 'Entrega del RISST',
    excerpt: 'El empleador debe poner en conocimiento de todos los trabajadores, mediante medio físico o digital, bajo cargo, el Reglamento Interno […] Esta obligación se extiende a los trabajadores en régimen de intermediación y tercerización, a las personas en modalidad formativa…',
    plainLanguage: 'El RISST se entrega bajo cargo (físico o digital) a trabajadores, intermediados, tercerizados y practicantes.',
    topics: ['risst'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art77',
    normId: 'ds-005-2012-tr',
    label: 'Art. 77 (texto original 2012)',
    title: 'Evaluación inicial de riesgos (sustituido por el D.S. 002-2020-TR)',
    excerpt: 'La evaluación inicial de riesgos debe realizarse en cada puesto de trabajo del empleador, por personal competente, en consulta con los trabajadores y sus representantes ante el Comité o Supervisor…',
    plainLanguage: 'La evaluación de riesgos es por puesto, la hace personal competente y se consulta con los trabajadores y el Comité o Supervisor.',
    topics: ['iperc'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
    appliesToIperc: false,
  },
  {
    id: 'ds005-art82',
    normId: 'ds-005-2012-tr',
    label: 'Art. 82',
    title: 'Identificación periódica de peligros',
    excerpt: 'El empleador debe identificar los peligros y evaluar los riesgos para la seguridad y salud de los trabajadores en forma periódica, de conformidad con lo previsto en el artículo 57 de la Ley.',
    plainLanguage: 'La identificación de peligros y evaluación de riesgos es periódica y se hace en consulta con los trabajadores o el Comité/Supervisor.',
    topics: ['iperc'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
    appliesToIperc: true,
  },
  {
    id: 'ds005-art83',
    normId: 'ds-005-2012-tr',
    label: 'Art. 83',
    title: 'Preparación y respuesta ante emergencias',
    excerpt: 'El empleador debe adoptar las siguientes disposiciones […] c) Ofrecer servicios de primeros auxilios y asistencia médica, de extinción de incendios y de evacuación a todas las personas que se encuentren en el lugar de trabajo. d) Ofrecer información y formación pertinentes […] incluidos ejercicios periódicos…',
    plainLanguage: 'Comunicación interna y con autoridades, primeros auxilios, lucha contra incendios, evacuación y simulacros periódicos para todos los niveles.',
    topics: ['emergencias'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: DS005_AMENDED,
  },
  {
    id: 'ds005-art101',
    normId: 'ds-005-2012-tr',
    label: 'Art. 101',
    title: 'Exámenes médicos ocupacionales',
    excerpt: 'El empleador debe realizar los exámenes médicos comprendidos en el inciso d) del artículo 49 de la Ley, acorde a las labores desempeñadas por el trabajador…',
    plainLanguage: 'Los EMO se realizan según las labores y la exposición histórica del trabajador, conforme a los documentos técnicos de vigilancia de la salud.',
    topics: ['emo', 'salud'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: ['ds-016-2016-tr', 'law-30222'],
  },
  {
    id: 'ds005-art110',
    normId: 'ds-005-2012-tr',
    label: 'Art. 110',
    title: 'Plazos de notificación de accidentes',
    excerpt: 'a) Empleadores: Los Accidentes de Trabajo Mortales y los Incidentes Peligrosos: dentro del plazo máximo de veinticuatro (24) horas de ocurridos.',
    plainLanguage: 'Accidentes mortales e incidentes peligrosos se notifican en un máximo de 24 horas.',
    topics: ['accidentes', 'notificacion'],
    sourceUrl: DS005,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
    amendedBy: ['ds-006-2022-tr'],
  },
  {
    id: 'rlgit-art48-1c',
    normId: 'ds-008-2020-tr',
    label: 'Art. 48.1-C RLGIT',
    title: 'Trabajadores afectados: total de la empresa',
    excerpt: 'Tratándose de las infracciones tipificadas en los numerales 25.16 y 25.17 del artículo 25; el numeral 28.10 y 28.11 del artículo 28, cuando cause muerte o incapacidad parcial o total permanente; y los numerales 46.1, 46.12, 46.13 y 46.14 […] se considera como trabajadores afectados al total de trabajadores de la empresa.',
    plainLanguage: 'Solo para esos numerales (y en 28.10/28.11 solo si hay muerte o incapacidad permanente) la multa se calcula con el total de trabajadores de la empresa.',
    topics: ['multas', 'fiscalizacion'],
    sourceUrl: DS008,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
  },
  {
    id: 'rlgit-art48-remype',
    normId: 'ds-008-2020-tr',
    label: 'Art. 48.1-D RLGIT',
    title: 'Tope para MYPE inscritas en el REMYPE',
    excerpt: 'Las multas impuestas a las microempresas y pequeñas empresas inscritas en el REMYPE no pueden superar, en un mismo procedimiento sancionador, el 1% del total de ingresos netos que hayan percibido dentro del ejercicio fiscal anterior…',
    plainLanguage: 'Para MYPE inscritas en el REMYPE, la suma de multas de un procedimiento no supera el 1 % de sus ingresos netos del ejercicio anterior. La inscripción debe acreditarse hasta antes de la resolución de segunda instancia.',
    topics: ['multas', 'remype'],
    sourceUrl: DS008,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
  },
  {
    id: 'rlgit-art48-min',
    normId: 'ds-019-2006-tr',
    label: 'Art. 48 (montos mínimos) RLGIT',
    title: 'Multa mínima por tamaño de empresa',
    excerpt: 'En ningún caso las multas podrán tener un valor inferior a: a) En el caso de la micro empresa, al valor previsto […] cuando se afecta a 1 trabajador. b) En el caso de la pequeña empresa […] cuando se afecta de 1 a 5 trabajadores.',
    plainLanguage: 'La multa nunca es menor al primer tramo de la tabla de su tamaño de empresa.',
    topics: ['multas'],
    sourceUrl: RLGIT,
    verification: 'texto-oficial-verificado',
    verifiedAt: VERIFIED,
  },
]

export const ARTICLES: CatalogArticle[] = [...BASE_ARTICLES, ...ARTICLES_UPDATE]

export function findArticle(id: string): CatalogArticle | undefined {
  return ARTICLES.find((article) => article.id === id)
}
