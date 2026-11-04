import { findArticle } from './articles'

/**
 * Obligaciones aplicables y motor de aplicabilidad.
 *
 * Cadena de trazabilidad: norma → articulo → obligacion → formato → evidencia → infraccion.
 * Una obligacion solo se marca "articulo verificado" si todos sus articulos se cotejaron con
 * el texto oficial; si no, queda "pendiente de validacion juridica" aunque el enlace funcione.
 */
export type SectorKey =
  | 'general'
  | 'public'
  | 'offices'
  | 'construction'
  | 'mining'
  | 'hydrocarbons'
  | 'health'
  | 'manufacturing'
  | 'transport_logistics'
  | 'warehouses'
  | 'maintenance_services'

export interface OrgProfile {
  ownership: 'privado' | 'publico'
  workers: number
  sector: SectorKey
  highRisk: boolean
  contractors: boolean
  telework: boolean
  remype: boolean
  /** Puestos donde se trabaja de pie tres horas continuas o más (Ley 32721). */
  standingWork?: boolean
  /** Trabajo con exposición directa al sol (D.S. 003-2026-SA). */
  sunExposure?: boolean
}

export const DEFAULT_PROFILE: OrgProfile = {
  ownership: 'privado',
  workers: 35,
  sector: 'offices',
  highRisk: false,
  contractors: false,
  telework: false,
  remype: false,
}

export interface Obligation {
  id: string
  title: string
  requirement: string
  domain: string
  critical: boolean
  normIds: string[]
  articleIds: string[]
  infractionCodes: string[]
  evidence: string[]
  formatIds: string[]
  frequency: string
  responsible: string
  /** Devuelve null si no aplica, o el fundamento de por que aplica. */
  appliesWhen: (profile: OrgProfile) => string | null
  /** Notas de excepcion o regimen especial verificadas. */
  exceptions?: string
}

const always = (reason: string) => () => reason

export const OBLIGATIONS: Obligation[] = [
  {
    id: 'sgsst',
    title: 'Implementar el Sistema de Gestión de SST',
    requirement: 'Implementar un SGSST proporcional al tipo de organización, exposición a peligros y número de trabajadores.',
    domain: 'sst',
    critical: true,
    normIds: ['law-29783', 'ds-005-2012-tr'],
    articleIds: ['ley29783-art17', 'ley29783-art26', 'ds005-art25', 'ds005-art26'],
    infractionCodes: ['28.9'],
    evidence: ['Línea de base o diagnóstico inicial', 'Organigrama con responsabilidades SST', 'Procedimientos del sistema'],
    formatIds: ['mtpe-guia-mype', 'linea-base'],
    frequency: 'Permanente; revisión anual por la dirección',
    responsible: 'Máxima autoridad / empleador',
    appliesWhen: always('Todo empleador, público o privado, desde el primer trabajador.'),
  },
  {
    id: 'politica',
    title: 'Política y objetivos de SST',
    requirement: 'Contar con política y objetivos de SST firmados, disponibles para exhibirse.',
    domain: 'sst',
    critical: false,
    normIds: ['law-29783', 'ds-005-2012-tr'],
    articleIds: ['ley29783-art22', 'ds005-art32'],
    infractionCodes: ['27.6'],
    evidence: ['Política firmada y fechada', 'Constancia de difusión'],
    formatIds: ['politica-sst-form'],
    frequency: 'Revisión periódica',
    responsible: 'Máxima autoridad',
    appliesWhen: always('Documento exigible a todo empleador (art. 32 a).'),
  },
  {
    id: 'comite',
    title: 'Comité de SST paritario',
    requirement: 'Constituir y hacer funcionar un Comité de SST de 4 a 12 miembros, con representantes de los trabajadores elegidos.',
    domain: 'comite',
    critical: true,
    normIds: ['law-29783', 'ds-005-2012-tr', 'ds-001-2021-tr', 'rm-245-2021-tr'],
    articleIds: ['ley29783-art29', 'ley29783-art31', 'ley29783-art32', 'ds005-art38', 'ds005-art43'],
    infractionCodes: ['27.12'],
    evidence: ['Acta de elección', 'Acta de instalación', 'Libro de actas con reuniones mensuales'],
    formatIds: ['acta-comite-form', 'servir-compendio', 'sunafil-guia-comite-fmt'],
    frequency: 'Reunión ordinaria mensual',
    responsible: 'Empleador y trabajadores',
    appliesWhen: (p) => (p.workers >= 20 ? `Tiene ${p.workers} trabajadores (20 o más): corresponde Comité.` : null),
  },
  {
    id: 'supervisor',
    title: 'Supervisor de SST elegido por los trabajadores',
    requirement: 'Garantizar que los trabajadores elijan a un Supervisor de SST.',
    domain: 'comite',
    critical: true,
    normIds: ['law-29783', 'ds-005-2012-tr', 'rm-245-2021-tr'],
    articleIds: ['ley29783-art30', 'ley29783-art31', 'ds005-art39'],
    infractionCodes: ['27.12'],
    evidence: ['Acta de elección del supervisor', 'Constancia de capacitación del supervisor'],
    formatIds: ['acta-comite-form'],
    frequency: 'Según mandato',
    responsible: 'Trabajadores / empleador',
    appliesWhen: (p) => (p.workers < 20 ? `Tiene ${p.workers} trabajadores (menos de 20): corresponde Supervisor.` : null),
  },
  {
    id: 'risst',
    title: 'Reglamento Interno de SST y entrega bajo cargo',
    requirement: 'Elaborar el RISST con la estructura mínima y entregarlo bajo cargo a trabajadores, intermediados, tercerizados y practicantes.',
    domain: 'sst',
    critical: true,
    normIds: ['law-29783', 'ds-005-2012-tr', 'law-32721'],
    articleIds: ['ley29783-art34', 'ley29783-art35', 'ds005-art74', 'ds005-art75'],
    infractionCodes: ['28.9'],
    evidence: ['RISST aprobado por el Comité', 'Cargos de entrega físicos o digitales'],
    formatIds: ['mtpe-guia-mype'],
    frequency: 'Al ingreso y ante cada modificación',
    responsible: 'Empleador / Comité',
    appliesWhen: (p) => (p.workers >= 20 ? `Tiene ${p.workers} trabajadores (20 o más): RISST obligatorio.` : null),
  },
  {
    id: 'iperc',
    title: 'IPERC por puesto con participación',
    requirement: 'Elaborar la IPERC en cada puesto, con personal competente y en consulta con los trabajadores y el Comité o Supervisor, y actualizarla sin exceder un año o antes si cambian las condiciones o hay daños a la salud.',
    domain: 'iperc',
    critical: true,
    normIds: ['law-29783', 'ds-005-2012-tr', 'ds-002-2020-tr'],
    articleIds: ['ley29783-art57', 'ds005-art77-2020', 'ley29783-art21', 'ds005-art82', 'ds005-art32'],
    infractionCodes: ['27.3'],
    evidence: ['Matriz IPERC por puesto versionada', 'Lista de participantes y firmas', 'Evidencia de validación en campo', 'Controles verificados con evidencia'],
    formatIds: ['iperc-excel', 'mtpe-guia-mype'],
    frequency: 'Sin exceder un año (art. 57 de la Ley y art. 77 del Reglamento, modificado por el D.S. 002-2020-TR) y cada vez que cambien las condiciones, ocurra un accidente o se incorpore una tarea',
    responsible: 'Personal competente + trabajadores + Comité/Supervisor',
    appliesWhen: always('Exigible a todo empleador y a cada puesto de trabajo.'),
  },
  {
    id: 'mapa-riesgos',
    title: 'Mapa de riesgos',
    requirement: 'Contar con mapa de riesgo disponible para exhibirse.',
    domain: 'iperc',
    critical: false,
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art32'],
    infractionCodes: ['27.6'],
    evidence: ['Mapa de riesgos actualizado y publicado'],
    formatIds: [],
    frequency: 'Al actualizar el IPERC',
    responsible: 'Responsable SST',
    appliesWhen: always('Documento exigible a todo empleador (art. 32 d).'),
  },
  {
    id: 'programa-anual',
    title: 'Planificación preventiva y programa anual de SST',
    requirement: 'Planificar la actividad preventiva y contar con el programa anual de SST.',
    domain: 'sst',
    critical: true,
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art32'],
    infractionCodes: ['27.7'],
    evidence: ['Programa anual aprobado', 'Presupuesto asignado', 'Seguimiento de avance'],
    formatIds: ['mtpe-guia-mype', 'plan-accion-form'],
    frequency: 'Anual',
    responsible: 'Empleador / Comité',
    appliesWhen: always('Documento exigible a todo empleador (art. 32 e y f).'),
  },
  {
    id: 'registros',
    title: 'Registros obligatorios del SGSST',
    requirement: 'Implementar y mantener actualizados los ocho registros del artículo 33.',
    domain: 'registros',
    critical: true,
    normIds: ['ds-005-2012-tr', 'rm-050-2013-tr'],
    articleIds: ['ds005-art33'],
    infractionCodes: ['27.6'],
    evidence: ['Registros con información mínima de la R.M. 050-2013-TR', 'Numeración y firmas'],
    formatIds: ['rm050-oficial', 'reg-accidentes', 'reg-emo', 'reg-monitoreo', 'reg-inspecciones', 'reg-estadisticas', 'reg-equipos', 'reg-capacitacion', 'reg-auditorias'],
    frequency: 'Continua',
    responsible: 'Responsable SST',
    appliesWhen: (p) =>
      p.remype && !p.highRisk
        ? 'Aplica. Como MYPE sin alto riesgo puede usar el sistema simplificado de registros (R.M. 085-2013-TR, verificar vigencia).'
        : 'Exigible a todo empleador.',
  },
  {
    id: 'conservacion',
    title: 'Conservación de registros',
    requirement: 'Conservar enfermedades ocupacionales 20 años, accidentes e incidentes peligrosos 10 años y demás registros 5 años.',
    domain: 'registros',
    critical: false,
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art35'],
    infractionCodes: ['27.6'],
    evidence: ['Archivo activo y pasivo', 'Política de respaldo de registros digitales'],
    formatIds: [],
    frequency: 'Permanente',
    responsible: 'Responsable SST / archivo',
    appliesWhen: always('Exigible a todo empleador que lleve registros.'),
  },
  {
    id: 'capacitacion',
    title: 'Capacitación en prevención por puesto',
    requirement: 'Capacitar a los trabajadores en el puesto específico, en los cambios de funciones o tecnología, cualquiera sea su contrato.',
    domain: 'capacitacion',
    critical: false,
    normIds: ['law-29783', 'ds-005-2012-tr'],
    articleIds: ['ley29783-art35', 'ley29783-art52', 'ds005-art27'],
    infractionCodes: ['27.8'],
    evidence: ['Programa anual de capacitación', 'Registro firmado de cada sesión', 'Evaluaciones'],
    formatIds: ['reg-capacitacion'],
    frequency: 'No menos de cuatro capacitaciones al año (Ley 29783, art. 35 b), además de la inducción y las de cambio de puesto o tecnología',
    responsible: 'Empleador / Responsable SST',
    appliesWhen: always('Exigible a todo empleador.'),
  },
  {
    id: 'emo',
    title: 'Exámenes médicos ocupacionales y vigilancia de la salud',
    requirement: 'Realizar los EMO y la vigilancia de la salud según las labores y exposición, comunicando resultados a cada trabajador.',
    domain: 'salud',
    critical: true,
    normIds: ['law-29783', 'ds-005-2012-tr', 'rm-312-2011-minsa', 'rm-571-2014-minsa', 'rm-021-2016-minsa', 'rm-480-2008-minsa'],
    articleIds: ['ley29783-art49', 'ds005-art101'],
    infractionCodes: ['28.13', '27.4'],
    evidence: ['Certificados de aptitud', 'Programa de vigilancia médica', 'Constancia de comunicación de resultados'],
    formatIds: ['reg-emo'],
    frequency: 'Cada dos años como mínimo; en actividades de alto riesgo, al ingreso, durante y al término de la relación laboral (Ley 29783, art. 49 d, modificado por la Ley 30222). El examen de salida es facultativo en los demás casos',
    responsible: 'Empleador / médico ocupacional',
    appliesWhen: always('Exigible a todo empleador.'),
    exceptions: 'Los resultados individuales son datos sensibles: el empleador gestiona aptitudes, no diagnósticos.',
  },
  {
    id: 'confidencialidad-salud',
    title: 'Confidencialidad de datos de salud',
    requirement: 'Proteger la confidencialidad de los datos de vigilancia de la salud y tratarlos como datos sensibles.',
    domain: 'salud',
    critical: true,
    normIds: ['law-29733', 'ds-016-2024-jus'],
    articleIds: [],
    infractionCodes: ['28.4'],
    evidence: ['Archivo médico separado bajo custodia', 'Control de accesos', 'Procedimiento de tratamiento de datos'],
    formatIds: [],
    frequency: 'Permanente',
    responsible: 'Servicio de salud ocupacional',
    appliesWhen: always('Aplica a todo empleador que trate datos de salud.'),
  },
  {
    id: 'notificacion',
    title: 'Notificación e investigación de accidentes',
    requirement: 'Notificar accidentes mortales e incidentes peligrosos en 24 horas e investigar todo daño a la salud.',
    domain: 'accidentes',
    critical: true,
    normIds: ['ds-005-2012-tr', 'ds-006-2022-tr'],
    articleIds: ['ds005-art110', 'ds005-art33'],
    infractionCodes: ['27.2'],
    evidence: ['Constancia de notificación', 'Informe de investigación con causas y medidas', 'Registro de accidentes'],
    formatIds: ['reg-accidentes', 'investigacion-form'],
    frequency: 'Ante cada evento (24 h para mortales e incidentes peligrosos)',
    responsible: 'Empleador / Comité',
    appliesWhen: always('Exigible a todo empleador.'),
  },
  {
    id: 'emergencias',
    title: 'Primeros auxilios, lucha contra incendios y evacuación',
    requirement: 'Adoptar medidas de primeros auxilios, contra incendios y evacuación; registrar simulacros.',
    domain: 'emergencias',
    critical: false,
    normIds: ['ds-005-2012-tr'],
    articleIds: ['ds005-art83', 'ds005-art33'],
    infractionCodes: ['27.10'],
    evidence: ['Plan de respuesta ante emergencias', 'Brigadas', 'Registro de simulacros y de equipos de emergencia'],
    formatIds: ['reg-equipos', 'reg-capacitacion'],
    frequency: 'Simulacros según programa',
    responsible: 'Empleador / brigadas',
    appliesWhen: always('Exigible a todo empleador.'),
  },
  {
    id: 'ergonomia',
    title: 'Evaluación de riesgos disergonómicos',
    requirement: 'Identificar y evaluar factores de riesgo disergonómico (carga, posturas, pantallas) y aplicar controles.',
    domain: 'ergonomia',
    critical: false,
    normIds: ['rm-375-2008-tr'],
    articleIds: ['ds005-art33'],
    infractionCodes: ['27.9'],
    evidence: ['Evaluación por puesto (método aplicado)', 'Registro de monitoreo disergonómico', 'Reevaluación tras controles'],
    formatIds: ['ergonomia-form', 'reg-monitoreo'],
    frequency: 'Según exposición; reevaluar tras cambios',
    responsible: 'Responsable SST / ergónomo',
    appliesWhen: always('Aplica a todo puesto con exposición ergonómica.'),
  },
  {
    id: 'psicosocial',
    title: 'Riesgos psicosociales y salud mental',
    requirement: 'Evaluar factores de riesgo psicosocial e incluir la salud mental en la vigilancia de la salud.',
    domain: 'psicosocial',
    critical: false,
    normIds: ['law-31246', 'ds-007-2020-sa'],
    articleIds: ['ds005-art33'],
    infractionCodes: ['27.9'],
    evidence: ['Evaluación psicosocial', 'Plan de intervención', 'Seguimiento'],
    formatIds: ['reg-monitoreo'],
    frequency: 'Periódica',
    responsible: 'Responsable SST / psicólogo ocupacional',
    appliesWhen: always('Aplica a todo empleador (riesgo psicosocial presencial o remoto).'),
  },
  {
    id: 'contratistas',
    title: 'Verificación de contratistas',
    requirement: 'Verificar que contratistas, subcontratistas y empresas de servicios cumplan la normativa de SST y coordinar actividades en el mismo centro.',
    domain: 'contratistas',
    critical: true,
    normIds: ['law-29783'],
    articleIds: ['ley29783-art68', 'ley29783-art103'],
    infractionCodes: ['27.16', '27.11', '28.8'],
    evidence: ['Checklist de ingreso de contratistas', 'SCTR vigente de terceros', 'Inducción registrada'],
    formatIds: ['contratistas-form'],
    frequency: 'Antes del ingreso y periódicamente',
    responsible: 'Empresa principal',
    appliesWhen: (p) => (p.contractors ? 'Declaró contratistas o terceros en su centro de trabajo.' : null),
  },
  {
    id: 'sctr',
    title: 'Seguro Complementario de Trabajo de Riesgo',
    requirement: 'Contratar SCTR (salud y pensión) para trabajadores en actividades de riesgo.',
    domain: 'salud',
    critical: true,
    normIds: ['ds-003-98-sa', 'ds-008-2022-sa', 'ds-022-2023-sa'],
    articleIds: [],
    infractionCodes: ['27.15'],
    evidence: ['Pólizas SCTR vigentes', 'Planilla de asegurados'],
    formatIds: [],
    frequency: 'Mensual (vigencia)',
    responsible: 'Empleador / RR. HH.',
    appliesWhen: (p) =>
      p.highRisk
        ? 'Declaró actividades de riesgo. Contraste su actividad (código CIIU) con el Anexo 5 del D.S. 009-97-SA, actualizado por el D.S. 008-2022-SA.'
        : null,
  },
  {
    id: 'auditoria',
    title: 'Auditoría del SGSST por auditor registrado',
    requirement: 'Someter el SGSST a auditoría por auditor independiente registrado ante la autoridad de trabajo.',
    domain: 'auditoria',
    critical: false,
    normIds: ['law-29783', 'ds-014-2013-tr'],
    articleIds: ['ds014-2013-art15'],
    infractionCodes: ['27.14'],
    evidence: ['Informe de auditoría firmado por auditor registrado', 'Plan de acción posterior'],
    formatIds: ['reg-auditorias'],
    frequency: 'Cada 2 años si realiza actividades de riesgo (Anexo 5 del D.S. 009-97-SA); cada 3 años en los demás casos; con hasta 10 trabajadores y sin actividad de riesgo, solo cuando lo ordene la inspección (D.S. 014-2013-TR, art. 15)',
    responsible: 'Empleador',
    appliesWhen: (p) =>
      p.highRisk
        ? 'Realiza actividades de riesgo: auditoría del SGSST cada dos años.'
        : p.workers > 10
          ? 'Sin actividad de riesgo y con más de 10 trabajadores: auditoría cada tres años.'
          : null,
  },
  {
    id: 'teletrabajo',
    title: 'SST en teletrabajo',
    requirement: 'Identificar y evaluar los riesgos del lugar habitual de teletrabajo (ergonómicos, psicosociales, eléctricos), entregar recomendaciones y respetar el derecho a la desconexión digital.',
    domain: 'teletrabajo',
    critical: false,
    normIds: ['law-31572', 'ds-002-2023-tr', 'ds-009-2026-tr', 'rm-051-2026-tr', 'law-29783'],
    articleIds: [],
    infractionCodes: ['27.9'],
    evidence: ['Autoevaluación del puesto remoto', 'Recomendaciones entregadas', 'Acuerdo de teletrabajo'],
    formatIds: ['teletrabajo-form'],
    frequency: 'Al inicio y ante cambios',
    responsible: 'Empleador / teletrabajador',
    appliesWhen: (p) =>
      p.telework
        ? 'Declaró personal en teletrabajo: Ley 31572, su reglamento (D.S. 002-2023-TR) modificado por el D.S. 009-2026-TR, y anexos actualizados por la R.M. 051-2026-TR.'
        : null,
  },
  {
    id: 'construccion-plan',
    title: 'Plan de SST de la obra con partida presupuestal',
    requirement: 'Elaborar el Plan de SST de la obra desde el presupuesto, con partida específica, y organizar subcomité o supervisor por obra.',
    domain: 'sectorial',
    critical: true,
    normIds: ['ds-011-2019-tr', 'rne-g050'],
    articleIds: [],
    infractionCodes: ['27.7'],
    evidence: ['Plan de SST de obra', 'Partida presupuestal', 'Actas del subcomité o supervisor'],
    formatIds: ['ats-form', 'permiso-alto-riesgo'],
    frequency: 'Por obra',
    responsible: 'Contratista principal / residente de obra',
    appliesWhen: (p) => (p.sector === 'construction' ? 'Sector construcción: aplica el D.S. 011-2019-TR.' : null),
  },
  {
    id: 'mineria-reglamento',
    title: 'Reglamento de SSO en minería',
    requirement: 'Cumplir el reglamento sectorial minero: PETAR, IPERC continuo, supervisión y programa anual de SSO.',
    domain: 'sectorial',
    critical: true,
    normIds: ['ds-024-2016-em', 'ds-034-2023-em'],
    articleIds: [],
    infractionCodes: ['27.3'],
    evidence: ['PETAR', 'IPERC continuo', 'Programa anual de SSO'],
    formatIds: ['permiso-alto-riesgo', 'ats-form'],
    frequency: 'Continua',
    responsible: 'Titular minero / contratistas',
    appliesWhen: (p) => (p.sector === 'mining' ? 'Sector minería: aplica el D.S. 024-2016-EM y modificatorias.' : null),
  },
  {
    id: 'electricidad',
    title: 'Seguridad en trabajos con electricidad',
    requirement: 'Aplicar bloqueo y etiquetado, distancias mínimas y personal calificado en trabajos con electricidad.',
    domain: 'sectorial',
    critical: true,
    normIds: ['rm-111-2013-mem-dm'],
    articleIds: [],
    infractionCodes: ['27.9', '28.7'],
    evidence: ['Procedimiento LOTO', 'Permisos de trabajo eléctrico', 'Certificación del personal'],
    formatIds: ['permiso-alto-riesgo'],
    frequency: 'Por intervención',
    responsible: 'Empleador / supervisor eléctrico',
    appliesWhen: (p) =>
      p.sector === 'maintenance_services' || p.sector === 'hydrocarbons' ? 'Actividad con trabajos eléctricos (RESESATE).' : null,
  },
  {
    id: 'bipedestacion',
    title: 'Descanso sentado y alternancia postural',
    requirement: 'Donde se trabaja de pie tres horas continuas o más: sillas con respaldo, alternancia de postura o descansos sentados dentro de la jornada, disposiciones en el RISST y verificación con el Comité o Supervisor.',
    domain: 'ergonomia',
    critical: false,
    normIds: ['law-32721', 'rm-375-2008-tr'],
    articleIds: ['ley32721-art2', 'ley32721-art4', 'ley32721-art5', 'ley32721-dcf3'],
    infractionCodes: [],
    evidence: ['Evaluación de puestos con bipedestación', 'Inventario de sillas y sistema de rotación', 'RISST adecuado', 'Acta del Comité o Supervisor'],
    formatIds: ['ergonomia-form'],
    frequency: 'Adecuación del RISST en un máximo de 360 días calendario desde la vigencia de la ley; verificación periódica',
    responsible: 'Empleador / Comité o Supervisor / servicio de SST',
    appliesWhen: (p) =>
      p.standingWork ? 'Declaró puestos donde se trabaja de pie tres horas continuas o más (Ley 32721).' : null,
    exceptions: 'No exigible si estar de pie es inherente al puesto o si sentarse crea un riesgo objetivo; en esos casos se garantizan pausas activas, rotación o descansos equivalentes (art. 5). El incumplimiento es infracción grave (art. 7.2).',
  },
  {
    id: 'radiacion-uv',
    title: 'Prevención frente a la radiación UV solar',
    requirement: 'Incluir la radiación UV en la IPERC y el SGSST, evitar programar trabajo al sol entre 10:00 y 16:00 (Sierra: 09:00 a 16:00), rotar al personal de riesgo alto, informar, entregar EPP complementario e incluir evaluación oftalmológica y tamizaje dermatológico en los EMO.',
    domain: 'salud',
    critical: false,
    normIds: ['ds-003-2026-sa', 'rm-312-2011-minsa'],
    articleIds: ['ds003-2026-art5', 'ds003-2026-art11', 'ds003-2026-art12'],
    infractionCodes: [],
    evidence: ['IPERC con el peligro de radiación UV', 'Programación horaria y rotación', 'Registro de entrega de EPP', 'EMO con evaluación de piel y ojos', 'Carteles en zonas expuestas'],
    formatIds: ['reg-monitoreo', 'reg-emo'],
    frequency: 'Permanente; revisar con el índice UV diario del SENAMHI',
    responsible: 'Empleador / servicio de SST / médico ocupacional',
    appliesWhen: (p) => (p.sunExposure ? 'Declaró trabajo con exposición directa al sol (D.S. 003-2026-SA).' : null),
  },
  {
    id: 'agentes-quimicos',
    title: 'Valores límite de agentes químicos',
    requirement: 'Medir la exposición a agentes químicos y compararla con los valores límite permisibles; aplicar controles cuando se superen.',
    domain: 'higiene',
    critical: false,
    normIds: ['ds-015-2005-sa', 'rm-733-2024-minsa'],
    articleIds: [],
    infractionCodes: ['27.9'],
    evidence: ['Informe de monitoreo de agentes químicos', 'Comparación con VLP', 'Plan de control'],
    formatIds: ['reg-monitoreo'],
    frequency: 'Según programa de monitoreo',
    responsible: 'Empleador / higienista ocupacional',
    appliesWhen: (p) =>
      ['manufacturing', 'mining', 'hydrocarbons', 'health'].includes(p.sector) || p.highRisk
        ? 'Su actividad puede exponer a agentes químicos (D.S. 015-2005-SA y anexos de la R.M. 733-2024-MINSA).'
        : null,
  },
  {
    id: 'hostigamiento',
    title: 'Prevención del hostigamiento sexual laboral (norma conexa)',
    requirement: 'Contar con política, canales de queja, procedimiento de investigación y capacitación preventiva frente al hostigamiento sexual.',
    domain: 'conexa',
    critical: false,
    normIds: ['ds-014-2019-mimp'],
    articleIds: [],
    infractionCodes: [],
    evidence: ['Política de prevención', 'Canal de quejas', 'Procedimiento de investigación', 'Registro de capacitaciones'],
    formatIds: [],
    frequency: 'Permanente',
    responsible: 'Empleador / RR. HH.',
    appliesWhen: always('Régimen laboral conexo aplicable a todo empleador (Ley 27942 y su reglamento). No deriva de la Ley 29783.'),
  },
  {
    id: 'sector-publico',
    title: 'Organización SST en la entidad pública',
    requirement: 'Asignar responsabilidades del titular, RR. HH. y logística, presupuesto SST y gestión de sedes; usar como referencia los modelos SERVIR.',
    domain: 'publico',
    critical: false,
    normIds: ['servir-modelos-sst', 'servir-normatividad-sst'],
    articleIds: ['ds005-art26'],
    infractionCodes: [],
    evidence: ['Resolución de designación', 'Presupuesto SST', 'Comité o supervisor por entidad/sede'],
    formatIds: ['servir-modelos', 'servir-compendio'],
    frequency: 'Anual',
    responsible: 'Titular de la entidad',
    appliesWhen: (p) => (p.ownership === 'publico' ? 'Entidad pública: aplica la Ley 29783 con referencias de SERVIR.' : null),
    exceptions: 'La fiscalización y el régimen sancionador de entidades públicas pueden diferir del sector privado: valide el caso concreto.',
  },
]

export type LegalTrace = 'articulo-verificado' | 'pendiente-validacion-juridica'

export interface ApplicableObligation extends Obligation {
  reason: string
  trace: LegalTrace
}

export function legalTrace(obligation: Obligation): LegalTrace {
  return obligation.articleIds.length > 0 &&
    obligation.articleIds.every((id) => findArticle(id)?.verification === 'texto-oficial-verificado')
    ? 'articulo-verificado'
    : 'pendiente-validacion-juridica'
}

export function applicableObligations(profile: OrgProfile): ApplicableObligation[] {
  return OBLIGATIONS.flatMap((obligation) => {
    const reason = obligation.appliesWhen(profile)
    return reason ? [{ ...obligation, reason, trace: legalTrace(obligation) }] : []
  })
}

/** Estado de cumplimiento registrado por el usuario para cada obligacion. */
export type ComplianceStatus = 'sin-evaluar' | 'acreditada' | 'parcial' | 'incumplida' | 'no-aplica'

export interface ComplianceEntry {
  status: ComplianceStatus
  evidence: string
  responsible: string
  updatedAt: string
}

export interface ComplianceSummary {
  applicable: number
  accredited: number
  partial: number
  failed: number
  unevaluated: number
  criticalOpen: number
  /** Obligaciones acreditadas con evidencia sobre obligaciones aplicables (sin "no aplica" justificados). */
  percent: number
}

/**
 * El porcentaje cuenta obligaciones acreditadas CON evidencia, no documentos presentes.
 * "Parcial" no suma: una obligacion a medias no esta acreditada.
 */
export function summarizeCompliance(items: ApplicableObligation[], entries: Record<string, ComplianceEntry>): ComplianceSummary {
  let accredited = 0
  let partial = 0
  let failed = 0
  let unevaluated = 0
  let notApplicable = 0
  let criticalOpen = 0
  for (const item of items) {
    const entry = entries[item.id]
    const status = entry?.status ?? 'sin-evaluar'
    const isAccredited = status === 'acreditada' && Boolean(entry?.evidence.trim())
    if (status === 'no-aplica') notApplicable += 1
    else if (isAccredited) accredited += 1
    else if (status === 'parcial') partial += 1
    else if (status === 'incumplida') failed += 1
    else unevaluated += 1
    if (item.critical && status !== 'no-aplica' && !isAccredited) criticalOpen += 1
  }
  const applicable = items.length - notApplicable
  return {
    applicable,
    accredited,
    partial,
    failed,
    unevaluated,
    criticalOpen,
    percent: applicable > 0 ? Math.round((accredited / applicable) * 100) : 0,
  }
}
