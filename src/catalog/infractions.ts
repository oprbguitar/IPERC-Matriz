import type { Severity } from '../lib/sunafil'

/**
 * Infracciones de SST tipificadas en los articulos 26, 27 y 28 del Reglamento de la
 * Ley General de Inspeccion del Trabajo (D.S. N.° 019-2006-TR), segun el texto
 * consolidado publicado en gob.pe (incluye D.S. 004-2011-TR y D.S. 008-2020-TR).
 * Se omiten numerales derogados. Verificado el 2026-11-03.
 */
export type AffectedRule =
  /** Regla ordinaria: numero de trabajadores afectados por el incumplimiento. */
  | 'afectados'
  /** Art. 48.1-C: total de trabajadores de la empresa (en 28.10 solo si hay muerte o incapacidad permanente). */
  | 'total-empresa'
  /** 27.15: una infraccion por cada trabajador afectado. */
  | 'por-trabajador'

export interface Infraction {
  code: string
  severity: Severity
  text: string
  affectedRule: AffectedRule
  /** Condicion que activa la regla especial, cuando aplica solo en ciertos hechos. */
  specialCondition?: string
  topics: string[]
}

const T = (code: string, severity: Severity, text: string, topics: string[], extra: Partial<Infraction> = {}): Infraction => ({
  code,
  severity,
  text,
  topics,
  affectedRule: 'afectados',
  ...extra,
})

export const INFRACTIONS_SOURCE = 'https://cdn.www.gob.pe/uploads/document/file/2845244/DS%20019-2006-TR%20-%20Aprueban%20Reglamento%20de%20la%20Ley%20General%20de%20Inspecci%C3%B3n%20del%20Trabajo.pdf'

export const INFRACTIONS: Infraction[] = [
  T('26.1', 'leve', 'Falta de orden y limpieza del centro de trabajo que no implique riesgo para la integridad física y salud de los trabajadores.', ['orden-limpieza']),
  T('26.3', 'leve', 'No comunicar la apertura del centro de trabajo o la reanudación tras alteraciones importantes, cuando no es industria de alto riesgo.', ['comunicacion']),
  T('26.4', 'leve', 'Incumplimientos de prevención de riesgos que carezcan de trascendencia grave para la integridad física o salud.', ['prevencion']),
  T('26.5', 'leve', 'Otros incumplimientos de carácter formal o documental no tipificados como graves.', ['documentacion']),
  T('27.1', 'grave', 'Falta de orden y limpieza que implique riesgos para la integridad física y salud de los trabajadores.', ['orden-limpieza']),
  T('27.2', 'grave', 'No notificar accidentes mortales o incidentes peligrosos, no comunicar accidentes al centro médico, o no investigar daños a la salud o indicios de medidas insuficientes.', ['accidentes', 'notificacion', 'investigacion']),
  T('27.3', 'grave', 'No llevar a cabo las evaluaciones de riesgos y controles periódicos de las condiciones de trabajo, o no realizar las actividades de prevención que resulten necesarias.', ['iperc', 'evaluacion-riesgos']),
  T('27.4', 'grave', 'No comunicar los resultados de los exámenes médicos y/o pruebas de vigilancia de la salud de cada trabajador.', ['emo', 'salud']),
  T('27.5', 'grave', 'No comunicar la apertura o reanudación del centro de trabajo tratándose de industria de alto riesgo.', ['comunicacion']),
  T('27.6', 'grave', 'No implementar y mantener actualizados los registros o no disponer de la documentación exigida en SST.', ['registros', 'documentacion']),
  T('27.7', 'grave', 'No planificar la acción preventiva ni elaborar un plan o programa de SST.', ['programa-anual', 'planificacion']),
  T('27.8', 'grave', 'No cumplir las obligaciones de formación e información suficiente y adecuada sobre los riesgos del puesto y las medidas preventivas.', ['capacitacion']),
  T('27.9', 'grave', 'Incumplimientos en lugares de trabajo, máquinas, agentes, riesgos ergonómicos y psicosociales, protección colectiva, EPP, señalización, sustancias peligrosas o higiene, con riesgo grave.', ['epp', 'ergonomia', 'psicosocial', 'higiene', 'maquinas']),
  T('27.10', 'grave', 'No adoptar medidas de primeros auxilios, lucha contra incendios y evacuación.', ['emergencias']),
  T('27.11', 'grave', 'Incumplir la coordinación entre empresas que desarrollan actividades en un mismo centro de trabajo.', ['contratistas']),
  T('27.12', 'grave', 'No constituir o designar al supervisor o miembros del Comité de SST, o no capacitarlos adecuadamente.', ['comite', 'supervisor']),
  T('27.13', 'grave', 'Vulnerar los derechos de información, consulta y participación de los trabajadores.', ['participacion']),
  T('27.14', 'grave', 'Incumplir las obligaciones relativas a la realización de auditorías del SGSST.', ['auditoria']),
  T('27.15', 'grave', 'No cumplir las obligaciones relativas al SCTR, incurriéndose en una infracción por cada trabajador afectado.', ['sctr'], { affectedRule: 'por-trabajador' }),
  T('27.16', 'grave', 'No verificar el cumplimiento de la normativa de SST por parte de contratistas, subcontratistas, empresas de servicios o cooperativas.', ['contratistas']),
  T('28.1', 'muy-grave', 'No observar las normas de protección de trabajadoras en embarazo y lactancia y de trabajadores con discapacidad.', ['grupos-vulnerables']),
  T('28.2', 'muy-grave', 'No observar las normas de protección de la SST de menores trabajadores.', ['grupos-vulnerables']),
  T('28.3', 'muy-grave', 'Designar trabajadores a puestos incompatibles con sus características conocidas o capacidades, derivándose un riesgo grave e inminente.', ['asignacion-puesto']),
  T('28.4', 'muy-grave', 'Incumplir el deber de confidencialidad en el uso de los datos de vigilancia de la salud.', ['salud', 'datos-personales']),
  T('28.5', 'muy-grave', 'Superar los límites de exposición a agentes contaminantes que originen riesgos graves e inminentes.', ['higiene', 'monitoreo']),
  T('28.6', 'muy-grave', 'Impedir el derecho de los trabajadores a paralizar sus actividades ante riesgo grave e inminente.', ['participacion']),
  T('28.7', 'muy-grave', 'No adoptar las medidas preventivas de las que se derive un riesgo grave e inminente para trabajadores y personas en el centro de labores.', ['prevencion']),
  T('28.8', 'muy-grave', 'Incumplir la coordinación entre empresas en un mismo centro de trabajo, en actividades de alto riesgo.', ['contratistas', 'alto-riesgo']),
  T('28.9', 'muy-grave', 'No implementar un sistema de gestión de SST o no tener un reglamento de SST.', ['sgsst', 'risst']),
  T('28.10', 'muy-grave', 'Incumplimiento de la normativa de SST que ocasione un accidente que cause daño al cuerpo o a la salud del trabajador que requiera asistencia o descanso médico.', ['accidentes'], {
    affectedRule: 'total-empresa',
    specialCondition: 'Solo cuando el accidente causa muerte o incapacidad parcial o total permanente (art. 48.1-C). En los demás casos se usa la regla ordinaria.',
  }),
  T('28.11', 'muy-grave', 'Incumplimiento de la normativa de SST que ocasione un accidente de trabajo mortal.', ['accidentes'], {
    affectedRule: 'total-empresa',
    specialCondition: 'Art. 48.1-C: para el cálculo se consideran afectados todos los trabajadores de la empresa.',
  }),
  T('28.12', 'muy-grave', 'Incumplimiento de la normativa de SST que ocasione una enfermedad ocupacional debidamente diagnosticada y acreditada.', ['salud', 'enfermedad-ocupacional']),
  T('28.13', 'muy-grave', 'No realizar los exámenes médicos ocupacionales y/o no realizar la vigilancia de la salud de los trabajadores.', ['emo', 'salud']),
]

export function findInfraction(code: string): Infraction | undefined {
  return INFRACTIONS.find((item) => item.code === code)
}
