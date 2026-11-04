import type { LegalCategory, LegalNorm, ObligationKind, SectorId } from '../types'
import { UPDATE_SEEDS } from './legalUpdate2026'

/**
 * Ampliacion del catalogo (corte 2026-11-03): normas sectoriales, de fiscalizacion,
 * auditoria, salud ocupacional y datos personales usadas por el Observatorio.
 * Cada enlace apunta a gob.pe, El Peruano, SUNAFIL o el Congreso.
 */
const VERIFIED_AT = '2026-11-03'

interface Seed {
  id: string
  shortName: string
  officialTitle: string
  category: LegalCategory
  module?: 'general' | SectorId
  authority: string
  publicationDate?: string
  url: string
  documentUrl?: string
  summary: string
  regulates: string[]
  appliesTo: string[]
  topics: string[]
  kind: ObligationKind
  related?: string[]
  notes?: string
  modified?: boolean
}

const seeds: Seed[] = [
  {
    id: 'law-28806',
    shortName: 'Ley N.° 28806',
    officialTitle: 'Ley N.° 28806, Ley General de Inspección del Trabajo',
    category: 'inspection',
    authority: 'Congreso de la República',
    publicationDate: '2006-07-22',
    url: 'https://cdn.www.gob.pe/uploads/document/file/2845243/Ley%20N%C2%B0%2028806%20-%20Ley%20General%20de%20Inspecci%C3%B3n%20del%20Trabajo.pdf',
    summary:
      'Regula el sistema de inspección del trabajo: cómo se inicia una inspección, qué puede pedir el inspector y cómo se tipifican y sancionan las infracciones laborales, incluidas las de SST.',
    regulates: ['Facultades de los inspectores de trabajo.', 'Procedimiento inspectivo y sancionador.', 'Tipos de infracción: leve, grave y muy grave.'],
    appliesTo: ['Todos los empleadores', 'Trabajadores y sus representantes'],
    topics: ['SUNAFIL', 'inspección', 'infracciones', 'multas'],
    kind: 'obligacion-legal',
    related: ['ds-019-2006-tr', 'law-29981'],
    modified: true,
  },
  {
    id: 'ds-019-2006-tr',
    shortName: 'D.S. N.° 019-2006-TR',
    officialTitle: 'D.S. N.° 019-2006-TR, Reglamento de la Ley General de Inspección del Trabajo',
    category: 'inspection',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2006-10-29',
    url: 'https://cdn.www.gob.pe/uploads/document/file/2845244/DS%20019-2006-TR%20-%20Aprueban%20Reglamento%20de%20la%20Ley%20General%20de%20Inspecci%C3%B3n%20del%20Trabajo.pdf',
    summary:
      'Reglamento que lista las infracciones de SST (leves, graves y muy graves) y contiene en su artículo 48 la tabla de multas en UIT según tamaño de empresa y trabajadores afectados.',
    regulates: ['Catálogo de infracciones en seguridad y salud en el trabajo.', 'Tabla de multas en UIT (art. 48).', 'Plazo de prescripción de infracciones.'],
    appliesTo: ['Todos los empleadores fiscalizados por SUNAFIL'],
    topics: ['multas', 'UIT', 'infracciones SST', 'REMYPE'],
    kind: 'obligacion-legal',
    related: ['law-28806', 'ds-008-2020-tr'],
    modified: true,
    notes: 'Modificado entre otros por los D.S. N.° 012-2013-TR, 015-2017-TR, 008-2020-TR y 014-2021-TR. Use el texto consolidado.',
  },
  {
    id: 'ds-008-2020-tr',
    shortName: 'D.S. N.° 008-2020-TR',
    officialTitle: 'D.S. N.° 008-2020-TR, modifica el Reglamento de la Ley General de Inspección del Trabajo',
    category: 'inspection',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2020-02-10',
    url: 'https://www.gob.pe/institucion/mtpe/normas-legales/436782-008-2020-tr',
    summary:
      'Actualizó la tabla de multas del artículo 48, endureció las sanciones por accidentes mortales y reguló el cierre temporal de áreas tras un accidente mortal.',
    regulates: ['Nueva tabla de multas por gravedad y número de afectados.', 'Beneficio para MYPE inscritas en el REMYPE.', 'Cierre temporal de áreas (máximo 30 días).'],
    appliesTo: ['Todos los empleadores'],
    topics: ['multas', 'accidente mortal', 'cierre temporal'],
    kind: 'obligacion-legal',
    related: ['ds-019-2006-tr'],
  },
  {
    id: 'law-29981',
    shortName: 'Ley N.° 29981',
    officialTitle: 'Ley N.° 29981, Ley que crea la Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)',
    category: 'inspection',
    authority: 'Congreso de la República',
    publicationDate: '2013-01-15',
    url: 'https://www.sunafil.gob.pe/portal/images/docs/normatividad/LEY-29981-Creacion-SUNAFIL.pdf',
    summary: 'Crea la SUNAFIL como autoridad central del sistema de inspección del trabajo, encargada de fiscalizar el cumplimiento de la normativa laboral y de SST.',
    regulates: ['Creación y funciones de SUNAFIL.', 'Rectoría del sistema de inspección del trabajo.'],
    appliesTo: ['Sistema de inspección del trabajo'],
    topics: ['SUNAFIL', 'fiscalización'],
    kind: 'obligacion-legal',
    related: ['law-28806'],
  },
  {
    id: 'ds-014-2013-tr',
    shortName: 'D.S. N.° 014-2013-TR',
    officialTitle: 'D.S. N.° 014-2013-TR, Reglamento del Registro de Auditores autorizados para la evaluación periódica del SGSST',
    category: 'general-sst',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2013-12-24',
    url: 'https://busquedas.elperuano.pe/dispositivo/NL/1031708-2',
    summary:
      'Regula quién puede auditar el SGSST (auditores inscritos ante la autoridad de trabajo), los requisitos de independencia y la periodicidad de la auditoría externa obligatoria.',
    regulates: ['Registro de auditores autorizados.', 'Independencia del auditor (sin consultoría previa reciente).', 'Periodicidad de la auditoría del SGSST.'],
    appliesTo: ['Empleadores obligados a auditar su SGSST', 'Auditores de SST'],
    topics: ['auditoría', 'auditor MINTRA', 'periodicidad'],
    kind: 'obligacion-legal',
    related: ['law-29783', 'ds-005-2012-tr'],
  },
  {
    id: 'ds-011-2019-tr',
    shortName: 'D.S. N.° 011-2019-TR',
    officialTitle: 'D.S. N.° 011-2019-TR, Reglamento de Seguridad y Salud en el Trabajo para el Sector Construcción',
    category: 'sectoral',
    module: 'construction',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2019-07-11',
    url: 'https://www.gob.pe/institucion/mtpe/normas-legales/284237-011-2019-tr',
    summary:
      'Reglamento de SST para obras de construcción: exige un Plan de SST de la obra con partida presupuestal propia, subcomité o supervisor por obra y lineamientos para contratistas.',
    regulates: ['Plan de SST de la obra con partida en el presupuesto.', 'Subcomité o supervisor de SST por obra (umbral de 20 trabajadores).', 'Obligaciones de contratistas y subcontratistas.'],
    appliesTo: ['Empleadores privados del sector construcción', 'Contratistas y subcontratistas'],
    topics: ['construcción', 'plan de obra', 'prevencionista', 'contratistas'],
    kind: 'requisito-sectorial',
    related: ['rne-g050', 'law-29783'],
  },
  {
    id: 'rm-111-2013-mem-dm',
    shortName: 'R.M. N.° 111-2013-MEM/DM (RESESATE)',
    officialTitle: 'R.M. N.° 111-2013-MEM/DM, Reglamento de Seguridad y Salud en el Trabajo con Electricidad',
    category: 'sectoral',
    module: 'maintenance_services',
    authority: 'Ministerio de Energía y Minas',
    publicationDate: '2013-03-27',
    url: 'https://www.gob.pe/institucion/osinergmin/normas-legales/738504-111-2013-mem-dm',
    summary: 'Reglamento de seguridad para trabajos con electricidad: distancias mínimas, bloqueo y etiquetado (LOTO), puesta a tierra y EPP dieléctrico.',
    regulates: ['Reglas de oro: corte, bloqueo, verificación de ausencia de tensión y puesta a tierra.', 'Distancias mínimas de seguridad.', 'Competencias del personal electricista.'],
    appliesTo: ['Empresas eléctricas', 'Contratistas y personal que trabaja con electricidad'],
    topics: ['riesgo eléctrico', 'LOTO', 'EPP dieléctrico'],
    kind: 'requisito-sectorial',
    related: ['law-29783'],
  },
  {
    id: 'rm-021-2016-minsa',
    shortName: 'R.M. N.° 021-2016/MINSA',
    officialTitle: 'R.M. N.° 021-2016/MINSA, aprueba el perfil de competencias del médico ocupacional',
    category: 'occupational-health',
    authority: 'Ministerio de Salud',
    publicationDate: '2016-01-22',
    url: 'https://busquedas.elperuano.pe/dispositivo/NL/1333375-5',
    summary: 'Define el perfil y las competencias exigidas al médico ocupacional que lidera la vigilancia de la salud de los trabajadores.',
    regulates: ['Formación requerida del médico ocupacional.', 'Competencias para la vigilancia de la salud.'],
    appliesTo: ['Servicios de seguridad y salud en el trabajo', 'Médicos ocupacionales'],
    topics: ['médico ocupacional', 'vigilancia de la salud', 'EMO'],
    kind: 'obligacion-legal',
    related: ['rm-312-2011-minsa'],
  },
  {
    id: 'law-31110',
    shortName: 'Ley N.° 31110',
    officialTitle: 'Ley N.° 31110, Ley del Régimen Laboral Agrario y de Incentivos para el Sector Agrario y Riego, Agroexportador y Agroindustrial',
    category: 'sectoral',
    module: 'manufacturing',
    authority: 'Congreso de la República',
    publicationDate: '2020-12-31',
    url: 'https://cdn.www.gob.pe/uploads/document/file/1535274/Ley%2031110.pdf',
    summary: 'Régimen laboral agrario. Junto a su reglamento fija condiciones mínimas de trabajo en el agro, como transporte de personal y servicios higiénicos.',
    regulates: ['Régimen laboral del sector agrario y agroindustrial.', 'Condiciones mínimas de trabajo desarrolladas por reglamento.'],
    appliesTo: ['Empleadores agrarios y agroindustriales'],
    topics: ['agro', 'agroexportación', 'condiciones de trabajo'],
    kind: 'requisito-sectorial',
    related: ['ds-005-2021-midagri'],
  },
  {
    id: 'ds-005-2021-midagri',
    shortName: 'D.S. N.° 005-2021-MIDAGRI',
    officialTitle: 'D.S. N.° 005-2021-MIDAGRI, Reglamento de la Ley N.° 31110',
    category: 'sectoral',
    module: 'manufacturing',
    authority: 'Ministerio de Desarrollo Agrario y Riego',
    publicationDate: '2021-03-30',
    url: 'https://www.gob.pe/institucion/midagri/normas-legales/1793115-005-2021-midagri',
    summary: 'Reglamento de la Ley N.° 31110 para el sector agrario y agroindustrial.',
    regulates: ['Aplicación del régimen agrario.', 'Condiciones de trabajo en campo y planta.'],
    appliesTo: ['Empleadores agrarios y agroindustriales'],
    topics: ['agro', 'reglamento'],
    kind: 'requisito-sectorial',
    related: ['law-31110'],
  },
  {
    id: 'law-29733',
    shortName: 'Ley N.° 29733',
    officialTitle: 'Ley N.° 29733, Ley de Protección de Datos Personales',
    category: 'data-ai',
    authority: 'Congreso de la República',
    publicationDate: '2011-07-03',
    url: 'https://www.gob.pe/institucion/indecopi/normas-legales/3462259-ley-29733',
    summary:
      'Protege los datos personales. Los datos de salud de los trabajadores (exámenes médicos, diagnósticos) son sensibles: no deben cargarse en herramientas externas ni de IA sin base legal y medidas de seguridad.',
    regulates: ['Principios de tratamiento de datos personales.', 'Datos sensibles, incluidos los de salud.', 'Derechos del titular y sanciones.'],
    appliesTo: ['Todo empleador que trate datos de trabajadores', 'Servicios de salud ocupacional'],
    topics: ['datos personales', 'datos de salud', 'IA', 'confidencialidad'],
    kind: 'obligacion-legal',
    notes: 'Su reglamento vigente es el D.S. N.° 016-2024-JUS (en vigor desde el 31 de marzo de 2025).',
    modified: true,
  },
  // --- Ambiente (SOMA). Enlaces SINIA tomados del curso cursoma2026. ---
  ...[
    ['law-27446', 'Ley N.° 27446', 'Ley N.° 27446, Ley del Sistema Nacional de Evaluación del Impacto Ambiental (SEIA)', '2001-04-23', 'https://sinia.minam.gob.pe/normas/ley-sistema-nacional-evaluacion-impacto-ambiental', 'Todo proyecto de inversión con impactos ambientales significativos requiere certificación ambiental antes de ejecutarse.', ['Certificación ambiental previa', 'Categorías de estudios (DIA, EIA-sd, EIA-d)'], ['certificación ambiental', 'EIA', 'SEIA']],
    ['ds-019-2009-minam', 'D.S. N.° 019-2009-MINAM', 'D.S. N.° 019-2009-MINAM, Reglamento de la Ley del SEIA', '2009-09-25', 'https://www.gob.pe/institucion/minam/normas-legales/317422-019-2009-minam', 'Desarrolla el procedimiento de evaluación de impacto ambiental, participación ciudadana y seguimiento de compromisos.', ['Procedimiento de evaluación ambiental', 'Participación ciudadana', 'Seguimiento de compromisos'], ['SEIA', 'reglamento', 'compromisos ambientales']],
    ['law-29325', 'Ley N.° 29325', 'Ley N.° 29325, Ley del Sistema Nacional de Evaluación y Fiscalización Ambiental (SINEFA)', '2009-03-05', 'https://sinia.minam.gob.pe/normas/ley-sistema-nacional-evaluacion-fiscalizacion-ambiental', 'Crea el sistema de fiscalización ambiental liderado por el OEFA, que supervisa y sanciona incumplimientos ambientales.', ['Rol del OEFA', 'Supervisión y sanción ambiental'], ['OEFA', 'fiscalización ambiental']],
    ['ds-003-2017-minam', 'D.S. N.° 003-2017-MINAM', 'D.S. N.° 003-2017-MINAM, Estándares de Calidad Ambiental (ECA) para Aire', '2017-06-07', 'https://sinia.minam.gob.pe/normas/aprueban-estandares-calidad-ambiental-eca-aire-establecen-disposiciones', 'Fija concentraciones de contaminantes en el aire ambiente que no deben superarse.', ['Parámetros y valores ECA aire'], ['ECA', 'aire', 'monitoreo ambiental']],
    ['ds-004-2017-minam', 'D.S. N.° 004-2017-MINAM', 'D.S. N.° 004-2017-MINAM, Estándares de Calidad Ambiental (ECA) para Agua', '2017-06-07', 'https://www.gob.pe/institucion/minam/normas-legales/3671-004-2017-minam', 'Fija los valores de calidad del agua según categoría de uso.', ['Categorías de agua', 'Parámetros ECA agua'], ['ECA', 'agua', 'efluentes']],
    ['ds-011-2017-minam', 'D.S. N.° 011-2017-MINAM', 'D.S. N.° 011-2017-MINAM, Estándares de Calidad Ambiental (ECA) para Suelo', '2017-12-02', 'https://sinia.minam.gob.pe/normas/aprueban-estandares-calidad-ambiental-eca-suelo', 'Fija valores de calidad del suelo según uso (agrícola, residencial, industrial).', ['Parámetros ECA suelo'], ['ECA', 'suelo', 'sitios contaminados']],
    ['ds-085-2003-pcm', 'D.S. N.° 085-2003-PCM', 'D.S. N.° 085-2003-PCM, Reglamento de Estándares Nacionales de Calidad Ambiental para Ruido', '2003-10-30', 'https://sinia.minam.gob.pe/normas/reglamento-estandares-nacionales-calidad-ambiental-ruido', 'Fija niveles máximos de ruido ambiental por zona y horario (no confundir con ruido ocupacional).', ['Zonas de aplicación', 'Niveles diurnos y nocturnos'], ['ruido ambiental', 'ECA ruido']],
  ].map(([id, shortName, officialTitle, publicationDate, url, summary, regulates, topics]) => ({
    id: id as string,
    shortName: shortName as string,
    officialTitle: officialTitle as string,
    category: 'environmental' as LegalCategory,
    authority: 'Ministerio del Ambiente / Poder Legislativo',
    publicationDate: publicationDate as string,
    url: url as string,
    summary: summary as string,
    regulates: regulates as string[],
    appliesTo: ['Titulares de proyectos y actividades con impacto ambiental'],
    topics: topics as string[],
    kind: 'obligacion-legal' as ObligationKind,
    related: ['law-28611'],
  })),
]

export const extendedLegalNorms: LegalNorm[] = [...seeds, ...UPDATE_SEEDS].map((seed) => ({
  id: seed.id,
  shortName: seed.shortName,
  officialTitle: seed.officialTitle,
  title: seed.officialTitle,
  category: seed.category,
  jurisdiction: 'Peru',
  module: seed.module ?? 'general',
  authority: seed.authority,
  publicationDate: seed.publicationDate,
  effectiveStatus: seed.modified ? 'modificada' : 'vigente',
  sourceStatus: 'official-verified',
  officialPageUrl: seed.url,
  officialDocumentUrl: seed.documentUrl,
  sourceUrl: seed.url,
  plainLanguageSummary: seed.summary,
  whatItRegulates: seed.regulates,
  appliesTo: seed.appliesTo,
  keyTopics: seed.topics,
  obligationKind: seed.kind,
  relatedNormIds: seed.related,
  relatedRouteId: 'obligaciones',
  lastVerifiedAt: VERIFIED_AT,
  notes: seed.notes ?? 'Verifique el texto consolidado vigente en la fuente oficial antes de citar un artículo.',
}))
