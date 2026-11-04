import type { SiteViewId } from './platformContent'

/**
 * Rutas de especialización: qué aprender, en qué orden, con qué normas, guías y plantillas.
 * Cada etapa enlaza a contenido real de la plataforma (normas del catálogo, guías,
 * plantillas adaptadas y secciones).
 */
export interface CareerStage {
  title: string
  goal: string
  learn: string[]
  normIds: string[]
  guideIds: string[]
  templateIds: string[]
  view?: { id: SiteViewId; label: string }
  proof: string
}

export interface CareerPath {
  id: string
  title: string
  short: string
  summary: string
  profile: string
  stages: CareerStage[]
}

export const CAREER_PATHS: CareerPath[] = [
  {
    id: 'sst',
    title: 'Especialista en SST',
    short: 'SST',
    summary: 'De la ley a la gestión diaria: organizar el sistema, evaluar riesgos, documentar y defenderse ante una inspección.',
    profile: 'Responsables de SST, supervisores, miembros de comité, recursos humanos y consultores.',
    stages: [
      {
        title: 'Fundamentos legales',
        goal: 'Entender qué exige la ley, a quién y por qué.',
        learn: ['Deber de prevención del empleador', 'Qué es un SGSST y sus documentos (art. 32 del reglamento)', 'Modificaciones de la Ley 30222 y la Ley 31246'],
        normIds: ['law-29783', 'ds-005-2012-tr', 'law-30222', 'law-31246'],
        guideIds: ['guia-sgsst'],
        templateIds: ['tpl-matriz-legal'],
        view: { id: 'normativa', label: 'Leer las normas' },
        proof: 'Puede explicar las obligaciones básicas de cualquier empleador y dónde están escritas.',
      },
      {
        title: 'Organización y participación',
        goal: 'Instalar el comité o supervisor y la política de SST.',
        learn: ['Cuándo corresponde comité y cuándo supervisor', 'Proceso electoral paso a paso', 'Actas y seguimiento de acuerdos'],
        normIds: ['rm-245-2021-tr', 'sunafil-guia-comite', 'ds-001-2021-tr'],
        guideIds: ['guia-comite'],
        templateIds: ['tpl-politica-sst', 'tpl-eleccion-comite', 'tpl-acta-comite-mensual'],
        view: { id: 'obligaciones', label: 'Ver obligaciones por tamaño' },
        proof: 'Condujo una elección y redactó actas con acuerdos verificables.',
      },
      {
        title: 'Gestión de riesgos (IPERC)',
        goal: 'Identificar peligros por puesto y definir controles eficaces.',
        learn: ['IPERC por puesto con participación', 'Jerarquía de controles', 'Actualización sin exceder un año'],
        normIds: ['ds-002-2020-tr', 'law-29783'],
        guideIds: ['guia-iperc'],
        templateIds: ['tpl-iperc-detallada', 'tpl-informe-iperc'],
        view: { id: 'rutas', label: 'Ver la ruta IPERC' },
        proof: 'Elaboró una IPERC validada en campo y aprobada por el comité.',
      },
      {
        title: 'Documentación y registros',
        goal: 'Llevar la evidencia que demuestra que el sistema funciona.',
        learn: ['Los ocho registros obligatorios', 'Programa anual y programa de capacitación', 'RISST y entrega bajo cargo'],
        normIds: ['rm-050-2013-tr', 'ds-005-2012-tr'],
        guideIds: ['guia-registros'],
        templateIds: ['tpl-registros-indice', 'tpl-programa-anual', 'tpl-programa-capacitacion', 'tpl-risst'],
        view: { id: 'plantillas', label: 'Ir a la biblioteca' },
        proof: 'Mantiene los registros al día y el programa anual con avance medible.',
      },
      {
        title: 'Salud ocupacional y riesgos especiales',
        goal: 'Proteger la salud: exámenes, ergonomía, radiación UV y trabajo de pie.',
        learn: ['Exámenes médicos y confidencialidad', 'Ergonomía y Ley 32721', 'Radiación UV (D.S. 003-2026-SA)'],
        normIds: ['rm-312-2011-minsa', 'rm-375-2008-tr', 'law-32721', 'ds-003-2026-sa'],
        guideIds: ['guia-salud', 'guia-ergonomia'],
        templateIds: ['tpl-vigilancia-colectiva', 'tpl-bipedestacion', 'tpl-radiacion-uv'],
        proof: 'Tiene un programa de vigilancia y controles para los riesgos especiales de su organización.',
      },
      {
        title: 'Fiscalización y auditoría',
        goal: 'Prepararse para SUNAFIL y para la auditoría del sistema.',
        learn: ['Infracciones y cálculo de multas', 'Expediente y descargos', 'Periodicidad de la auditoría'],
        normIds: ['law-28806', 'ds-019-2006-tr', 'ds-014-2013-tr'],
        guideIds: ['guia-sunafil', 'guia-auditoria'],
        templateIds: ['tpl-autoevaluacion'],
        view: { id: 'fiscalizacion', label: 'Abrir el centro de fiscalización' },
        proof: 'Simuló una inspección y cerró las brechas encontradas.',
      },
      {
        title: 'Sistema integrado e ISO 45001',
        goal: 'Llevar el SGSST a un estándar internacional e integrarlo con calidad y ambiente.',
        learn: ['Estructura de ISO 45001', 'Matriz documental integrada', 'Auditoría interna con ISO 19011'],
        normIds: [],
        guideIds: [],
        templateIds: [],
        view: { id: 'iso', label: 'Explorar ISO y SIG' },
        proof: 'Puede mapear los requisitos de ISO 45001 con la legislación peruana.',
      },
    ],
  },
  {
    id: 'soma',
    title: 'Especialista en SOMA',
    short: 'SOMA',
    summary: 'Seguridad, salud ocupacional y medio ambiente juntos: aspectos ambientales, residuos, químicos, emergencias e ISO 14001.',
    profile: 'Supervisores SSOMA, jefes de planta y obra, encargados de residuos y consultores ambientales.',
    stages: [
      {
        title: 'Marco legal ambiental',
        goal: 'Conocer las leyes que ordenan la gestión ambiental en el Perú.',
        learn: ['Ley General del Ambiente', 'Certificación ambiental (SEIA)', 'Fiscalización ambiental (OEFA)'],
        normIds: ['law-28611', 'law-27446', 'ds-019-2009-minam', 'law-29325'],
        guideIds: [],
        templateIds: [],
        view: { id: 'normativa', label: 'Leer las normas ambientales' },
        proof: 'Identifica qué instrumentos ambientales aplican a su actividad.',
      },
      {
        title: 'Aspectos e impactos ambientales',
        goal: 'Saber qué hace cada actividad al ambiente y cuáles impactos son significativos.',
        learn: ['Condiciones normales, anormales y de emergencia', 'Criterios de significancia', 'Requisitos legales asociados'],
        normIds: ['law-28611'],
        guideIds: [],
        templateIds: ['tpl-aspectos-ambientales'],
        view: { id: 'soma', label: 'Ver temas SOMA' },
        proof: 'Elaboró la matriz de aspectos e impactos con controles operacionales.',
      },
      {
        title: 'Residuos sólidos',
        goal: 'Segregar, almacenar y entregar los residuos de forma segura y legal.',
        learn: ['Jerarquía de gestión de residuos', 'Residuos peligrosos y empresas operadoras', 'Código de colores (NTP 900.058)'],
        normIds: ['dl-1278', 'ds-014-2017-minam'],
        guideIds: ['guia-residuos'],
        templateIds: ['tpl-residuos'],
        proof: 'Tiene registros de generación y manifiestos de residuos peligrosos.',
      },
      {
        title: 'Químicos, derrames y emergencias',
        goal: 'Controlar productos peligrosos y responder ante emergencias.',
        learn: ['Hojas de seguridad y compatibilidad', 'Valores límite de agentes químicos', 'Plan de emergencias y simulacros'],
        normIds: ['ds-015-2005-sa', 'rm-733-2024-minsa', 'ds-005-2012-tr'],
        guideIds: ['guia-emergencias'],
        templateIds: ['tpl-plan-emergencias'],
        proof: 'Organizó un simulacro de derrame con evaluación y mejoras.',
      },
      {
        title: 'Integración SST y ambiente',
        goal: 'Un solo sistema SSOMA: contratistas, inspecciones y requisitos legales unificados.',
        learn: ['Matriz legal integrada', 'Control de contratistas', 'Inspecciones combinadas'],
        normIds: ['law-29783', 'law-28611'],
        guideIds: ['guia-contratistas'],
        templateIds: ['tpl-matriz-legal'],
        proof: 'Opera una matriz legal y un programa de inspecciones SSOMA.',
      },
      {
        title: 'ISO 14001 y estándares ambientales',
        goal: 'Llevar la gestión ambiental a un sistema certificable.',
        learn: ['ISO 14001 y perspectiva de ciclo de vida', 'Estándares de calidad ambiental (ECA)', 'Gestión de la energía (ISO 50001)'],
        normIds: ['ds-003-2017-minam', 'ds-004-2017-minam'],
        guideIds: [],
        templateIds: [],
        view: { id: 'iso', label: 'Explorar ISO 14001' },
        proof: 'Puede auditar los requisitos de ISO 14001 en su organización.',
      },
    ],
  },
  {
    id: 'iperc',
    title: 'Especialista en IPERC',
    short: 'IPERC',
    summary: 'Dominar la identificación de peligros, la evaluación de riesgos y la verificación de controles, que es la base de todo el sistema.',
    profile: 'Supervisores de campo, prevencionistas, ingenieros de seguridad y miembros de comité.',
    stages: [
      {
        title: 'Base legal de la IPERC',
        goal: 'Saber qué exige la norma: por puesto, con participación y sin exceder un año.',
        learn: ['Art. 57 de la Ley 29783', 'Art. 77 vigente (D.S. 002-2020-TR)', 'Jerarquía de controles (art. 21)'],
        normIds: ['law-29783', 'ds-002-2020-tr'],
        guideIds: ['guia-iperc'],
        templateIds: [],
        view: { id: 'normativa', label: 'Ver los artículos cotejados' },
        proof: 'Explica los requisitos mínimos del art. 77 vigente.',
      },
      {
        title: 'Identificar peligros en campo',
        goal: 'Reconocer peligros por puesto, en tareas rutinarias, no rutinarias y emergencias.',
        learn: ['Peligro frente a riesgo', 'Recorridos con los trabajadores', 'Trabajadores sensibles, gestantes y discapacidad'],
        normIds: ['law-29783'],
        guideIds: ['guia-iperc'],
        templateIds: ['tpl-iperc-detallada'],
        proof: 'Levantó los peligros de un área con participación del personal.',
      },
      {
        title: 'Evaluar y controlar',
        goal: 'Valorar el riesgo y elegir controles de mayor a menor eficacia.',
        learn: ['Probabilidad y severidad', 'Eliminar, sustituir, ingeniería, administrativos, EPP', 'Residual proyectado'],
        normIds: ['law-29783'],
        guideIds: [],
        templateIds: ['tpl-iperc-detallada'],
        proof: 'Cada riesgo importante tiene un control por encima del EPP.',
      },
      {
        title: 'Riesgos especiales',
        goal: 'Evaluar factores que requieren método propio.',
        learn: ['Ergonomía y trabajo de pie', 'Radiación UV', 'Agentes químicos', 'Factores psicosociales'],
        normIds: ['rm-375-2008-tr', 'law-32721', 'ds-003-2026-sa', 'ds-015-2005-sa'],
        guideIds: ['guia-ergonomia'],
        templateIds: ['tpl-bipedestacion', 'tpl-radiacion-uv'],
        proof: 'Incorporó estos factores en la IPERC con sus mediciones.',
      },
      {
        title: 'Verificar controles',
        goal: 'Demostrar con evidencia que los controles existen y funcionan.',
        learn: ['Residual proyectado frente a verificado', 'Evidencia y responsable', 'Seguimiento en el comité'],
        normIds: [],
        guideIds: [],
        templateIds: [],
        view: { id: 'verificar', label: 'Registrar evidencias' },
        proof: 'Sus controles verificados tienen responsable y evidencia.',
      },
      {
        title: 'Informe, mapa de riesgos y actualización',
        goal: 'Presentar resultados y mantener la IPERC vigente.',
        learn: ['Informe IPERC para la dirección', 'Mapa de riesgos', 'Disparadores de actualización'],
        normIds: ['ds-005-2012-tr'],
        guideIds: [],
        templateIds: ['tpl-informe-iperc'],
        proof: 'Tiene una IPERC con fecha de próxima actualización y mapa publicado.',
      },
    ],
  },
]

export function careerPlanMarkdown(path: CareerPath, normName: (id: string) => string, templateName: (id: string) => string, guideName: (id: string) => string): string {
  const stages = path.stages
    .map(
      (stage, index) =>
        `## Etapa ${index + 1}. ${stage.title}\n\n**Objetivo:** ${stage.goal}\n\n**Qué aprender**\n\n${stage.learn.map((item) => `- ${item}`).join('\n')}\n\n${
          stage.normIds.length ? `**Normas:** ${stage.normIds.map(normName).join('; ')}\n\n` : ''
        }${stage.guideIds.length ? `**Guías:** ${stage.guideIds.map(guideName).join('; ')}\n\n` : ''}${
          stage.templateIds.length ? `**Plantillas:** ${stage.templateIds.map(templateName).join('; ')}\n\n` : ''
        }**Evidencia de dominio:** ${stage.proof}\n\n| Fecha de inicio | Fecha de término | Observaciones |\n|---|---|---|\n| | | |`,
    )
    .join('\n\n')
  return `# Ruta de especialización: ${path.title}\n\n${path.summary}\n\n**Dirigida a:** ${path.profile}\n\n${stages}`
}
