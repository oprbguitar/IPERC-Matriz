/**
 * Evolucion normativa de la SST/SSOMA en el Peru: eras, hitos, ramas de
 * especializacion y prioridades actuales. Los hitos con `normId` enlazan al
 * catalogo legal; el resto son referencias historicas a verificar en fuente oficial.
 */
export type BranchId = 'base' | 'salud' | 'higiene' | 'sectorial' | 'ambiental' | 'fiscalizacion' | 'digital'

export interface TimelineBranch {
  id: BranchId
  label: string
  color: string
  description: string
  specializations: Array<{
    name: string
    roles: string[]
    priorities: string[]
  }>
}

export interface TimelineEvent {
  year: number
  title: string
  branch: BranchId
  summary: string
  impact: string
  normId?: string
}

export interface TimelineEra {
  id: string
  range: string
  title: string
  summary: string
  from: number
  to: number
}

export const TIMELINE_ERAS: TimelineEra[] = [
  {
    id: 'origen',
    range: '1964 – 2004',
    title: 'Seguridad industrial reactiva',
    summary: 'Reglas técnicas dispersas por sector. La prevención se entendía como inspección de máquinas y reacción ante accidentes.',
    from: 1960,
    to: 2004,
  },
  {
    id: 'primer-reglamento',
    range: '2005 – 2010',
    title: 'Primer reglamento general',
    summary: 'Aparece un reglamento transversal de SST, la Ley General del Ambiente y el sistema moderno de inspección del trabajo.',
    from: 2005,
    to: 2010,
  },
  {
    id: 'sgsst',
    range: '2011 – 2015',
    title: 'Sistema de gestión y deber de prevención',
    summary: 'La Ley N.° 29783 instala el SGSST, el principio de prevención del empleador, el comité paritario y los registros obligatorios. Nace SUNAFIL.',
    from: 2011,
    to: 2015,
  },
  {
    id: 'sectorial',
    range: '2016 – 2019',
    title: 'Especialización sectorial',
    summary: 'Minería, construcción, electricidad y residuos reciben reglamentos propios. Se profesionaliza la salud ocupacional.',
    from: 2016,
    to: 2019,
  },
  {
    id: 'pandemia',
    range: '2020 – 2023',
    title: 'Salud, pandemia y salud mental',
    summary: 'La COVID-19 pone la vigilancia de la salud en el centro. Se endurecen las multas, el empleador asume el costo total del EPP y entra la salud mental.',
    from: 2020,
    to: 2023,
  },
  {
    id: 'datos',
    range: '2024 – 2026',
    title: 'Fiscalización con datos e inteligencia artificial',
    summary: 'Multas indexadas a una UIT creciente, inspección más analítica y adopción de IA para gestionar documentos, indicadores e inspecciones.',
    from: 2024,
    to: 2026,
  },
]

export const TIMELINE_EVENTS: TimelineEvent[] = [
  { year: 1964, title: 'Reglamento de Seguridad Industrial (D.S. N.° 42-F)', branch: 'base', summary: 'Primer reglamento técnico de seguridad en establecimientos industriales.', impact: 'Instala la idea de condiciones mínimas en planta.' },
  { year: 1997, title: 'Ley N.° 26790 y el SCTR', branch: 'salud', summary: 'Modernización de la seguridad social en salud y creación del Seguro Complementario de Trabajo de Riesgo.', impact: 'Las actividades de riesgo deben asegurar a sus trabajadores.' },
  { year: 2005, title: 'D.S. N.° 009-2005-TR', branch: 'base', summary: 'Primer Reglamento de Seguridad y Salud en el Trabajo de alcance general.', impact: 'Introduce comité, reglamento interno y registros para todos los sectores.' },
  { year: 2005, title: 'Ley General del Ambiente', branch: 'ambiental', summary: 'Marco general de la gestión ambiental en el Perú.', impact: 'Base del componente "MA" de SSOMA.', normId: 'law-28611' },
  { year: 2006, title: 'Ley General de Inspección del Trabajo', branch: 'fiscalizacion', summary: 'Ley N.° 28806 y su reglamento (D.S. N.° 019-2006-TR) con la tabla de infracciones.', impact: 'Las faltas de SST se tipifican como leves, graves y muy graves.', normId: 'law-28806' },
  { year: 2008, title: 'Norma básica de ergonomía', branch: 'higiene', summary: 'R.M. N.° 375-2008-TR: carga manual, posturas, pantallas y confort.', impact: 'Nace la ergonomía como especialidad exigible.', normId: 'rm-375-2008-tr' },
  { year: 2011, title: 'Ley N.° 29783 de SST', branch: 'base', summary: 'Ley base: deber de prevención, SGSST, participación de los trabajadores.', impact: 'Punto de quiebre: la prevención pasa a ser un sistema de gestión.', normId: 'law-29783' },
  { year: 2011, title: 'Protocolos de exámenes médicos ocupacionales', branch: 'salud', summary: 'R.M. N.° 312-2011/MINSA: protocolos y guías de EMO.', impact: 'Estandariza la vigilancia médica.', normId: 'rm-312-2011-minsa' },
  { year: 2012, title: 'Reglamento de la Ley 29783', branch: 'base', summary: 'D.S. N.° 005-2012-TR: IPERC, comité, registros y auditorías.', impact: 'Define el "cómo" del SGSST.', normId: 'ds-005-2012-tr' },
  { year: 2013, title: 'Formatos referenciales de registros', branch: 'base', summary: 'R.M. N.° 050-2013-TR: modelos de los registros obligatorios.', impact: 'Los registros se vuelven homogéneos y auditables.', normId: 'rm-050-2013-tr' },
  { year: 2013, title: 'Nace SUNAFIL', branch: 'fiscalizacion', summary: 'Ley N.° 29981 crea la Superintendencia Nacional de Fiscalización Laboral.', impact: 'Fiscalización especializada y centralizada.', normId: 'law-29981' },
  { year: 2013, title: 'RESESATE (electricidad)', branch: 'sectorial', summary: 'R.M. N.° 111-2013-MEM/DM: seguridad en trabajos con electricidad.', impact: 'Bloqueo, etiquetado y distancias mínimas obligatorias.', normId: 'rm-111-2013-mem-dm' },
  { year: 2013, title: 'Registro de auditores del SGSST', branch: 'fiscalizacion', summary: 'D.S. N.° 014-2013-TR: auditores autorizados e independencia.', impact: 'La auditoría del SGSST se profesionaliza.', normId: 'ds-014-2013-tr' },
  { year: 2014, title: 'Ley N.° 30222 y ajustes reglamentarios', branch: 'base', summary: 'Modificaciones para facilitar la implementación y precisar la fiscalización.', impact: 'Flexibiliza exámenes y capacitaciones; ajusta sanciones.', normId: 'law-30222' },
  { year: 2016, title: 'Reglamento de SSO en minería', branch: 'sectorial', summary: 'D.S. N.° 024-2016-EM: PETAR, IPERC continuo, ventilación y supervisión.', impact: 'La minería fija el estándar más exigente del país.', normId: 'ds-024-2016-em' },
  { year: 2016, title: 'Perfil del médico ocupacional', branch: 'salud', summary: 'R.M. N.° 021-2016/MINSA: competencias del médico ocupacional.', impact: 'Solo especialistas lideran la vigilancia de la salud.', normId: 'rm-021-2016-minsa' },
  { year: 2016, title: 'Ley de gestión integral de residuos', branch: 'ambiental', summary: 'D.L. N.° 1278 y su reglamento (2017).', impact: 'Segregación, almacenamiento y operadores autorizados.', normId: 'dl-1278' },
  { year: 2019, title: 'Reglamento SST en construcción', branch: 'sectorial', summary: 'D.S. N.° 011-2019-TR: plan de SST con partida presupuestal y prevencionistas.', impact: 'La seguridad entra al presupuesto de obra.', normId: 'ds-011-2019-tr' },
  { year: 2019, title: 'Responsabilidad penal del empleador (art. 168-A)', branch: 'fiscalizacion', summary: 'El D.U. N.° 044-2019 reforma el delito de atentado contra las condiciones de SST: sin requisito de notificación previa ni eximente automática por imprudencia del trabajador.', impact: 'La SST pasa a ser riesgo penal de la gerencia: delegar funciones con autonomía y presupuesto se vuelve clave.' },
  { year: 2020, title: 'IPERC dinámico (D.S. N.° 002-2020-TR)', branch: 'base', summary: 'Modifica el reglamento: la evaluación de riesgos exige medir periódicamente la eficacia de los controles en cada puesto.', impact: 'El IPERC deja de ser un documento estático.' },
  { year: 2020, title: 'Nueva tabla de multas', branch: 'fiscalizacion', summary: 'D.S. N.° 008-2020-TR endurece sanciones por accidentes mortales.', impact: 'El riesgo financiero de no prevenir se multiplica.', normId: 'ds-008-2020-tr' },
  { year: 2020, title: 'Régimen laboral agrario', branch: 'sectorial', summary: 'Ley N.° 31110 y su reglamento (2021) para el agro.', impact: 'Transporte de personal, servicios higiénicos y comedores seguros.', normId: 'law-31110' },
  { year: 2022, title: 'Ley del Teletrabajo (Ley N.° 31572)', branch: 'salud', summary: 'La SST se gestiona también en el domicilio: evaluación ergonómica del puesto remoto y derecho a la desconexión digital.', impact: 'La matriz de riesgos incluye el trabajo remoto.' },
  { year: 2022, title: 'SCTR ampliado (D.S. N.° 008-2022-SA)', branch: 'salud', summary: 'Actualiza el Anexo 5 de actividades de riesgo sujetas a SCTR, sin exoneración por tamaño de empresa.', impact: 'Más MYPE de servicios y logística deben contratar SCTR.' },
  { year: 2021, title: 'EPP a cargo del empleador y salud mental', branch: 'salud', summary: 'Ley N.° 31246: el empleador asume el costo total del EPP; riesgo biológico y salud mental en la vigilancia.', impact: 'La salud psicosocial se vuelve parte del SGSST.', normId: 'law-31246' },
  { year: 2021, title: 'Ajustes al comité y supervisor', branch: 'base', summary: 'D.S. N.° 001-2021-TR precisa elecciones y funcionamiento.', impact: 'Más participación efectiva de los trabajadores.', normId: 'ds-001-2021-tr' },
  { year: 2022, title: 'Notificación de accidentes', branch: 'base', summary: 'D.S. N.° 006-2022-TR ajusta reglas de notificación y registro.', impact: 'Mejor estadística nacional de accidentes.', normId: 'ds-006-2022-tr' },
  { year: 2024, title: 'Megapuerto de Chancay', branch: 'sectorial', summary: 'Inicia operaciones (noviembre de 2024) y crea un polo logístico-portuario con demanda de especialistas SSOMA y seguridad portuaria.', impact: 'Nace un perfil híbrido: Ley 29783 + regulación de la Autoridad Portuaria Nacional.' },
  { year: 2025, title: 'Precedentes del Tribunal de Fiscalización Laboral', branch: 'fiscalizacion', summary: 'Sala Plena 007-2025 (salud mental en la vigilancia de la salud) y 008-2025 (quiebre del nexo causal).', impact: 'De cumplimiento documental a protección sustantiva y diligencia probada.' },
  { year: 2024, title: 'UIT S/ 5,150', branch: 'fiscalizacion', summary: 'Las multas se recalculan cada año con la nueva UIT.', impact: 'Contingencias crecientes.' },
  { year: 2025, title: 'UIT S/ 5,350 y nuevo reglamento de datos personales', branch: 'digital', summary: 'D.S. N.° 016-2024-JUS entra en vigor: más exigencias sobre datos sensibles, incluidos los de salud.', impact: 'La gestión digital de SST debe proteger los datos médicos.', normId: 'law-29733' },
  { year: 2026, title: 'Ley de la Silla (Ley N.° 32721)', branch: 'higiene', summary: 'Derecho al descanso sentado y alternancia de postura en puestos con bipedestación prolongada (3 horas o más); adecuación del RISST.', impact: 'La ergonomía de retail, salud, banca y vigilancia pasa al centro de la fiscalización.' },
  { year: 2026, title: 'UIT S/ 5,500 y SST asistida por IA', branch: 'digital', summary: 'Multa máxima por accidente mortal en gran empresa ~S/ 288,915. Las áreas SST adoptan agentes de IA.', impact: 'La prevención se gestiona con datos, alertas y automatización.' },
]

TIMELINE_EVENTS.sort((a, b) => a.year - b.year)

export const TIMELINE_BRANCHES: TimelineBranch[] = [
  {
    id: 'base',
    label: 'Gestión SST (tronco)',
    color: '#1f6fe5',
    description: 'El tronco común: SGSST, política, IPERC, comité, registros y mejora continua.',
    specializations: [
      { name: 'Ingeniería de seguridad', roles: ['Supervisor SST', 'Jefe SST/SSOMA'], priorities: ['IPERC por puesto actualizado', 'PETS y permisos de alto riesgo', 'Plan y programa anual'] },
      { name: 'Sistemas de gestión', roles: ['Coordinador SGSST', 'Auditor interno ISO 45001'], priorities: ['Indicadores proactivos', 'Revisión por la dirección', 'Integración ISO 45001/14001'] },
    ],
  },
  {
    id: 'salud',
    label: 'Salud ocupacional',
    color: '#d0342c',
    description: 'Vigilancia médica, aptitud, enfermedades ocupacionales y salud mental.',
    specializations: [
      { name: 'Medicina ocupacional', roles: ['Médico ocupacional', 'Enfermera ocupacional'], priorities: ['EMO vigentes al 100 %', 'Programa de vigilancia por riesgo', 'Confidencialidad de datos médicos'] },
      { name: 'Psicología ocupacional', roles: ['Psicólogo organizacional'], priorities: ['Evaluación psicosocial', 'Prevención de hostigamiento', 'Programa de salud mental'] },
    ],
  },
  {
    id: 'higiene',
    label: 'Higiene y ergonomía',
    color: '#0f9d8f',
    description: 'Medición y control de agentes físicos, químicos, biológicos y disergonómicos.',
    specializations: [
      { name: 'Higiene industrial', roles: ['Higienista ocupacional', 'Laboratorio acreditado'], priorities: ['Monitoreo de ruido, polvo y gases', 'Sílice y vapores orgánicos', 'Equipos calibrados'] },
      { name: 'Ergonomía', roles: ['Ergónomo', 'Fisioterapeuta laboral'], priorities: ['REBA/RULA/NIOSH por puesto', 'Pausas activas y PVD', 'Carga manual dentro de límites'] },
    ],
  },
  {
    id: 'sectorial',
    label: 'Reglamentos sectoriales',
    color: '#d97706',
    description: 'Minería, construcción, electricidad, agro e hidrocarburos con reglas propias.',
    specializations: [
      { name: 'Seguridad minera', roles: ['Ingeniero de seguridad minera', 'Gerente SSOMA'], priorities: ['PETAR y control de energía', 'Ventilación y gases', 'Gestión de contratistas'] },
      { name: 'Prevención en construcción', roles: ['Prevencionista de riesgos', 'Jefe SSOMA de obra'], priorities: ['Plan de SST con partida presupuestal', 'Trabajo en altura e izaje', 'Inducción de obra'] },
      { name: 'Seguridad eléctrica', roles: ['Supervisor eléctrico'], priorities: ['Bloqueo y etiquetado', 'EPP dieléctrico', 'Personal calificado'] },
    ],
  },
  {
    id: 'ambiental',
    label: 'Medio ambiente (SOMA)',
    color: '#12a150',
    description: 'Residuos, efluentes, emisiones y cumplimiento ambiental integrado a la SST.',
    specializations: [
      { name: 'Gestión ambiental', roles: ['Especialista ambiental', 'Supervisor SSOMA'], priorities: ['Plan de manejo de residuos', 'Operadores autorizados (EO-RS)', 'Indicadores de generación'] },
      { name: 'Materiales peligrosos', roles: ['Especialista MATPEL'], priorities: ['Hojas SDS', 'Almacenamiento compatible', 'Respuesta a derrames'] },
    ],
  },
  {
    id: 'fiscalizacion',
    label: 'Fiscalización y auditoría',
    color: '#6d4bd6',
    description: 'Inspección SUNAFIL, tabla de multas, auditorías del SGSST y defensa ante inspecciones.',
    specializations: [
      { name: 'Auditoría del SGSST', roles: ['Auditor registrado', 'Consultor independiente'], priorities: ['Auditoría externa periódica', 'Independencia del auditor', 'Plan de acción post-auditoría'] },
      { name: 'Cumplimiento legal', roles: ['Abogado laboralista', 'Analista de cumplimiento'], priorities: ['Matriz de requisitos legales', 'Inscripción REMYPE vigente', 'Expediente listo para inspección'] },
    ],
  },
  {
    id: 'digital',
    label: 'SST digital e IA',
    color: '#0ea5e9',
    description: 'Datos, tableros, automatización y agentes de inteligencia artificial al servicio de la prevención.',
    specializations: [
      { name: 'Analítica SST', roles: ['Analista de datos SST'], priorities: ['Tablero de IF, IS e IA', 'Alertas de acciones vencidas', 'Fuente única de horas-hombre'] },
      { name: 'Automatización e IA', roles: ['Especialista en IA aplicada', 'Desarrollador low-code'], priorities: ['Agente normativo con citas', 'IPERC asistido con validación humana', 'Protección de datos de salud'] },
    ],
  },
]

export function findBranch(id: BranchId): TimelineBranch {
  return TIMELINE_BRANCHES.find((branch) => branch.id === id) ?? TIMELINE_BRANCHES[0]
}
