/**
 * Normas técnicas relacionadas con SST, ambiente y gestión integrada.
 * Son referencias técnicas voluntarias: no sustituyen la legislación peruana ni son
 * obligatorias por sí mismas, salvo que una norma legal las haga exigibles.
 * La adopción nacional (NTP) debe confirmarse en el catálogo de normas técnicas de INACAL.
 */
export interface TechnicalStandard {
  code: string
  title: string
  family: 'SST' | 'Ambiente' | 'Gestión integrada' | 'Norma técnica peruana'
  purpose: string
  howToUse: string
  peru: string
  link?: string
}

export const INACAL_CATALOG = 'https://www.gob.pe/institucion/inacal/tema/normalizacion'

export const ISO_FAMILY: TechnicalStandard[] = [
  {
    code: 'ISO 45001:2018 / Amd 1:2024',
    title: 'Sistemas de gestión de la seguridad y salud en el trabajo — Requisitos',
    family: 'SST',
    purpose: 'Requisitos certificables de un sistema de gestión de SST. La enmienda de 2024 pide considerar el cambio climático como cuestión externa pertinente.',
    howToUse: 'Úsela como estructura del SGSST; la Ley 29783 y su reglamento siguen siendo la obligación legal.',
    peru: 'Adoptada como NTP-ISO 45001. Certificar no exime de cumplir la ley ni de las inspecciones de SUNAFIL.',
  },
  {
    code: 'ISO 45002:2023',
    title: 'Orientación general para la implementación de ISO 45001',
    family: 'SST',
    purpose: 'Explica cómo implementar cada requisito de ISO 45001, con ejemplos para organizaciones de distinto tamaño.',
    howToUse: 'Guía de apoyo al diseñar procedimientos; no es certificable.',
    peru: 'Referencia técnica internacional; confirme adopción nacional en INACAL.',
  },
  {
    code: 'ISO 45003:2021',
    title: 'Salud y seguridad psicológicas en el trabajo — Gestión de los riesgos psicosociales',
    family: 'SST',
    purpose: 'Orienta la identificación y control de riesgos psicosociales (carga, acoso, aislamiento, liderazgo).',
    howToUse: 'Complementa la evaluación psicosocial exigida por el SGSST y el programa de salud mental.',
    peru: 'Se articula con la Ley 30947 de salud mental, el D.S. 007-2020-SA y la Ley 27942 (hostigamiento sexual).',
  },
  {
    code: 'ISO 45004:2024',
    title: 'Directrices para la evaluación del desempeño en SST',
    family: 'SST',
    purpose: 'Cómo elegir indicadores proactivos y reactivos y evaluar el desempeño del sistema.',
    howToUse: 'Úsela para definir los indicadores del programa anual y de la revisión por la dirección.',
    peru: 'Referencia técnica; los índices de frecuencia y severidad del registro de estadísticas siguen siendo obligatorios.',
  },
  {
    code: 'ISO 45006:2023',
    title: 'Directrices para la prevención y control de enfermedades infecciosas',
    family: 'SST',
    purpose: 'Medidas organizacionales frente a enfermedades infecciosas en el lugar de trabajo.',
    howToUse: 'Base para planes de vigilancia y contingencia sanitaria.',
    peru: 'Complementa la Ley 31246 (vigilancia epidemiológica en emergencias sanitarias).',
  },
  {
    code: 'ISO 14001 (2015 / 2026)',
    title: 'Sistemas de gestión ambiental — Requisitos',
    family: 'Ambiente',
    purpose: 'Requisitos para gestionar aspectos ambientales, obligaciones de cumplimiento y la perspectiva de ciclo de vida.',
    howToUse: 'Estructura del sistema ambiental; la matriz de aspectos e impactos es su herramienta central.',
    peru: 'Adoptada como NTP-ISO 14001. Se integra con la Ley 28611, el SEIA y el D. Leg. 1278.',
  },
  {
    code: 'ISO 14004',
    title: 'Sistemas de gestión ambiental — Directrices generales para la implementación',
    family: 'Ambiente',
    purpose: 'Orientación práctica para implementar ISO 14001.',
    howToUse: 'Apoyo al diseñar controles operacionales y preparación ante emergencias ambientales.',
    peru: 'Referencia técnica; confirme adopción en INACAL.',
  },
  {
    code: 'ISO 50001:2018',
    title: 'Sistemas de gestión de la energía',
    family: 'Ambiente',
    purpose: 'Línea base energética, indicadores de desempeño y mejora del uso de la energía.',
    howToUse: 'Útil para metas de consumo de energía y ecoeficiencia.',
    peru: 'Referencia técnica voluntaria.',
  },
  {
    code: 'ISO 9001:2015 / Amd 1:2024',
    title: 'Sistemas de gestión de la calidad — Requisitos',
    family: 'Gestión integrada',
    purpose: 'Comparte con ISO 45001 e ISO 14001 la estructura armonizada (contexto, liderazgo, planificación, apoyo, operación, evaluación, mejora).',
    howToUse: 'Base del sistema integrado: un solo control documental, auditoría y revisión por la dirección.',
    peru: 'Adoptada como NTP-ISO 9001.',
  },
  {
    code: 'ISO 19011:2018',
    title: 'Directrices para la auditoría de sistemas de gestión',
    family: 'Gestión integrada',
    purpose: 'Cómo planificar y ejecutar auditorías internas y combinadas.',
    howToUse: 'Guía para el programa de auditoría interna del sistema integrado.',
    peru: 'La auditoría legal del SGSST la hace un auditor registrado ante el MTPE (D.S. 014-2013-TR).',
  },
  {
    code: 'ISO 31000:2018',
    title: 'Gestión del riesgo — Directrices',
    family: 'Gestión integrada',
    purpose: 'Marco general para gestionar riesgos de cualquier tipo en la organización.',
    howToUse: 'Alinea la IPERC con la gestión de riesgos corporativa.',
    peru: 'Referencia técnica; la IPERC legal se rige por el art. 77 del D.S. 005-2012-TR.',
  },
  {
    code: 'ISO 22301:2019',
    title: 'Sistemas de gestión de la continuidad del negocio',
    family: 'Gestión integrada',
    purpose: 'Preparación para sostener las operaciones críticas ante una interrupción grave.',
    howToUse: 'Complementa el plan de emergencias con la recuperación de operaciones.',
    peru: 'Referencia técnica voluntaria.',
  },
  {
    code: 'NTP 399.010-1',
    title: 'Señales de seguridad — Colores, símbolos, formas y dimensiones',
    family: 'Norma técnica peruana',
    purpose: 'Define cómo deben verse las señales de prohibición, obligación, advertencia y evacuación.',
    howToUse: 'Use sus colores y pictogramas en el mapa de riesgos y en la señalización de planta.',
    peru: 'Confirme la edición vigente en INACAL.',
  },
  {
    code: 'NTP 350.043-1',
    title: 'Extintores portátiles — Selección, distribución, inspección y mantenimiento',
    family: 'Norma técnica peruana',
    purpose: 'Criterios para elegir, ubicar y mantener extintores.',
    howToUse: 'Base del registro de equipos de emergencia y de las inspecciones.',
    peru: 'Confirme la edición vigente en INACAL.',
  },
  {
    code: 'NTP 900.058',
    title: 'Gestión de residuos — Código de colores para el almacenamiento de residuos sólidos',
    family: 'Norma técnica peruana',
    purpose: 'Colores de contenedores para segregar residuos aprovechables, no aprovechables, orgánicos y peligrosos.',
    howToUse: 'Úsela para la segregación en la fuente y la capacitación del personal.',
    peru: 'Se aplica con el D. Leg. 1278 y su reglamento; confirme la edición vigente en INACAL.',
  },
]

export function isoFamilyMarkdown(): string {
  const rows = ISO_FAMILY.map((item) => `| ${item.code} | ${item.title} | ${item.family} | ${item.purpose} | ${item.howToUse} | ${item.peru} |`).join('\n')
  return `# Matriz de normas técnicas relacionadas (ISO, NTP)\n\nReferencias técnicas voluntarias que fortalecen el sistema integrado. No sustituyen la legislación peruana; la adopción nacional se confirma en el catálogo de INACAL.\n\n## Matriz\n\n| Norma | Título | Familia | Para qué sirve | Cómo usarla | Relación con el Perú |\n|---|---|---|---|---|---|\n${rows}\n\n## Cómo leer esta matriz\n\n- **SST:** familia ISO 45000; se integra con la Ley 29783 y su reglamento.\n- **Ambiente:** ISO 14001 y complementarias; se integran con la Ley 28611, el SEIA y la gestión de residuos.\n- **Gestión integrada:** normas que permiten un solo sistema documental, de riesgos y de auditoría.\n- **Normas técnicas peruanas (NTP):** aprobadas por INACAL; algunas se vuelven exigibles cuando una norma legal las cita.`
}
