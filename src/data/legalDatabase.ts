import type {
  EvidenceRequirement,
  LegalArticle,
  LegalCategory,
  LegalEffectiveStatus,
  LegalNorm,
  SectorId,
  SectorModule,
} from '../types'
import { ARTICLES } from '../catalog/articles'
import { extendedLegalNorms } from './legalExtensions'

/**
 * Catálogo legal peruano: fuente única de verdad de la aplicación.
 *
 * Reglas de mantenimiento:
 * 1. Cada norma apunta a una página oficial (gob.pe, Congreso, El Peruano, SPIJ, SINIA).
 * 2. `sourceStatus: 'official-verified'` solo cuando el enlace y el título oficial fueron
 *    contrastados contra un dominio oficial en la fecha `lastVerifiedAt`.
 * 3. No se cita ningun número de artículo que no aparezca de forma expresa en la fuente
 *    oficial consultada.
 * 4. Ningun componente debe repetir una URL legal: siempre se lee desde aquí.
 */

/** Fecha de la última revisión documental del catálogo. */
export const LEGAL_CATALOGUE_VERIFIED_AT = '2026-07-25'

export const LEGAL_CATEGORY_LABELS: Record<LegalCategory, string> = {
  'general-sst': 'Marco general de SST',
  iperc: 'IPERC y evaluación de riesgos',
  'committee-supervisor': 'Comité y supervisor',
  records: 'Registros y documentación',
  'occupational-health': 'Salud ocupacional',
  'accidents-incidents': 'Accidentes e incidentes',
  ergonomics: 'Ergonomía y factores humanos',
  sectoral: 'Aplicación sectorial',
  environmental: 'Ambiente y residuos',
  inspection: 'Fiscalización y sanciones',
  'data-ai': 'Datos personales e IA',
}

export const LEGAL_STATUS_LABELS: Record<LegalEffectiveStatus, string> = {
  vigente: 'Vigente',
  modificada: 'Vigente con modificaciones',
  derogada: 'Derogada',
  'verification-required': 'Requiere verificación',
}

export const VERIFICATION_NOTICE = 'Requiere verificación en la fuente oficial.'

export const legalNorms: LegalNorm[] = [
  {
    id: 'law-29783',
    shortName: 'Ley N.° 29783',
    officialTitle: 'Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo',
    title: 'Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Congreso de la República',
    publicationDate: '2011-08-20',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/462576-29783',
    sourceUrl: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/462576-29783',
    plainLanguageSummary:
      'Es la ley base de seguridad y salud en el trabajo en el Perú. Establece que el empleador debe prevenir los riesgos de su actividad y que los trabajadores participan en esa prevención.',
    whatItRegulates: [
      'El deber de prevención del empleador.',
      'La implementación del Sistema de Gestión de Seguridad y Salud en el Trabajo (SGSST).',
      'La participación de los trabajadores y de sus representantes.',
      'El rol de fiscalización del Estado.',
    ],
    appliesTo: ['Empleadores del sector privado', 'Entidades públicas', 'Trabajadores de todo régimen laboral'],
    keyTopics: ['SGSST', 'deber de prevención', 'participación de trabajadores', 'política de SST'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-005-2012-tr', 'law-30222', 'law-31246'],
    relatedTemplateIds: ['politica-sst', 'plan-anual-sst'],
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
    notes:
      'Ha sido modificada por normas posteriores, entre ellas la Ley N.° 30222 y la Ley N.° 31246. Revise el texto actualizado antes de citar un artículo.',
  },
  {
    id: 'ds-005-2012-tr',
    shortName: 'D.S. N.° 005-2012-TR',
    officialTitle:
      'Decreto Supremo N.° 005-2012-TR, Reglamento de la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo',
    title: 'Decreto Supremo N.° 005-2012-TR, Reglamento de la Ley N.° 29783',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Presidencia de la República / Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2012-04-25',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/presidencia/normas-legales/462577-005-2012-tr',
    sourceUrl: 'https://www.gob.pe/institucion/presidencia/normas-legales/462577-005-2012-tr',
    plainLanguageSummary:
      'Explica en detalle cómo aplicar la Ley N.° 29783: cómo organizar el sistema de gestión, qué registros se mantienen y cómo participan el comité o el supervisor de SST.',
    whatItRegulates: [
      'La organización del sistema de gestión de SST dentro de la empresa o entidad.',
      'Los registros obligatorios del sistema de gestión.',
      'La elección y las funciones del comité o del supervisor de seguridad y salud en el trabajo.',
      'La vigilancia de la salud de los trabajadores.',
    ],
    appliesTo: ['Empleadores del sector privado', 'Entidades públicas', 'Comités y supervisores de SST'],
    keyTopics: ['reglamento', 'registros obligatorios', 'comité de SST', 'vigilancia de la salud'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['law-29783', 'ds-006-2014-tr', 'ds-016-2016-tr', 'ds-020-2019-tr', 'ds-001-2021-tr'],
    relatedTemplateIds: ['acta-comite', 'registro-capacitacion'],
    relatedRouteId: 'organiza',
    lastVerifiedAt: '2026-07-25',
    notes:
      'Modificado por los D.S. N.° 006-2014-TR, N.° 016-2016-TR, N.° 020-2019-TR, N.° 001-2021-TR y N.° 006-2022-TR, entre otros.',
  },
  {
    id: 'rm-050-2013-tr',
    shortName: 'R.M. N.° 050-2013-TR',
    officialTitle:
      'Resolución Ministerial N.° 050-2013-TR, que aprueba formatos referenciales con la información mínima que deben contener los registros obligatorios del Sistema de Gestión de Seguridad y Salud en el Trabajo',
    title: 'Resolución Ministerial N.° 050-2013-TR, formatos referenciales de registros obligatorios del SGSST',
    category: 'records',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2013-03-14',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    sourceUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/288031-050-2013-tr',
    plainLanguageSummary:
      'Entrega formatos de referencia para los registros obligatorios del sistema de gestión. Los formatos son referenciales: usted puede usar su propio diseño, pero la información mínima si es obligatoria.',
    whatItRegulates: [
      'Formatos referenciales de los registros obligatorios del SGSST (Anexo 1).',
      'Un modelo de reglamento interno de seguridad y salud en el trabajo (Anexo 2).',
      'Una guía básica sobre el sistema de gestión de SST (Anexo 3).',
    ],
    appliesTo: ['Empleadores que deben mantener registros del SGSST', 'Responsables de SST', 'Recursos Humanos'],
    keyTopics: ['formatos', 'registros obligatorios', 'reglamento interno', 'guía básica'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-005-2012-tr', 'law-29783'],
    relatedTemplateIds: ['registro-accidentes', 'registro-capacitacion', 'registro-inspecciones', 'registro-epp'],
    relatedRouteId: 'plazos',
    lastVerifiedAt: '2026-07-25',
    notes:
      'La propia resolución indica que la información mínima de los registros es obligatoria conforme al artículo 33 del Reglamento de la Ley N.° 29783, aprobado por D.S. N.° 005-2012-TR.',
  },
  {
    id: 'law-30222',
    shortName: 'Ley N.° 30222',
    officialTitle: 'Ley N.° 30222, Ley que modifica la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo',
    title: 'Ley N.° 30222, que modifica la Ley N.° 29783',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Congreso de la República',
    publicationDate: '2014-07-11',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/minedu/normas-legales/118483-30222',
    officialDocumentUrl: 'https://www.leyes.congreso.gob.pe/documentos/leyes/30222.pdf',
    sourceUrl: 'https://www.gob.pe/institucion/minedu/normas-legales/118483-30222',
    plainLanguageSummary:
      'Cambia varios artículos de la Ley N.° 29783 para facilitar su aplicación, manteniendo el nivel de protección de la salud y la seguridad de los trabajadores.',
    whatItRegulates: [
      'La modificación de los artículos 13, 26, 28, 32, del inciso d) del artículo 49 y del artículo 76 de la Ley N.° 29783.',
      'Ajustes a la carga documental y al costo de implementación del sistema de gestión.',
    ],
    appliesTo: ['Empleadores alcanzados por la Ley N.° 29783'],
    keyTopics: ['modificatoria', 'registros', 'costos de implementación'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['law-29783', 'ds-006-2014-tr'],
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
    notes:
      'Los artículos modificados que se listan son los que la propia norma declara. Para leer el texto vigente use la versión consolidada del Congreso o del SPIJ.',
  },
  {
    id: 'ds-006-2014-tr',
    shortName: 'D.S. N.° 006-2014-TR',
    officialTitle:
      'Decreto Supremo N.° 006-2014-TR, que modifica el Reglamento de la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo, aprobado por Decreto Supremo N.° 005-2012-TR',
    title: 'Decreto Supremo N.° 006-2014-TR, modifica el Reglamento de la Ley N.° 29783',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2014-08-09',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/1121443-3',
    sourceUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/1121443-3',
    plainLanguageSummary: 'Adecua el reglamento de la Ley N.° 29783 a los cambios introducidos por la Ley N.° 30222.',
    whatItRegulates: ['La actualización del reglamento tras la modificatoria de la Ley N.° 30222.'],
    appliesTo: ['Empleadores alcanzados por el Reglamento de la Ley N.° 29783'],
    keyTopics: ['modificatoria', 'reglamento'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-005-2012-tr', 'law-30222'],
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'ds-012-2014-tr',
    shortName: 'D.S. N.° 012-2014-TR',
    officialTitle:
      'Decreto Supremo N.° 012-2014-TR, que aprueba el Registro Único de Información sobre accidentes de trabajo, incidentes peligrosos y enfermedades ocupacionales',
    title: 'Decreto Supremo N.° 012-2014-TR, Registro Único de Información sobre accidentes de trabajo',
    category: 'accidents-incidents',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2014-10-31',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://busquedas.elperuano.pe/normaslegales/decreto-supremo-que-aprueba-el-registro-unico-de-informacion-ds-n-012-2014-tr-1157929-1/',
    sourceUrl:
      'https://busquedas.elperuano.pe/normaslegales/decreto-supremo-que-aprueba-el-registro-unico-de-informacion-ds-n-012-2014-tr-1157929-1/',
    plainLanguageSummary:
      'Crea el registro único donde se notifican los accidentes de trabajo, los incidentes peligrosos y las enfermedades ocupacionales.',
    whatItRegulates: [
      'El registro único de información de accidentes, incidentes peligrosos y enfermedades ocupacionales.',
      'La notificación a través del sistema informático del sector trabajo.',
    ],
    appliesTo: ['Empleadores', 'Centros médicos asistenciales'],
    keyTopics: ['notificacion', 'accidentes de trabajo', 'incidentes peligrosos', 'enfermedades ocupacionales'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-006-2022-tr', 'ds-005-2012-tr'],
    relatedTemplateIds: ['registro-accidentes', 'investigacion-accidentes'],
    relatedRouteId: 'plazos',
    lastVerifiedAt: '2026-07-25',
    notes: 'Su artículo 1 fue modificado por el Decreto Supremo N.° 006-2022-TR.',
  },
  {
    id: 'ds-016-2016-tr',
    shortName: 'D.S. N.° 016-2016-TR',
    officialTitle:
      'Decreto Supremo N.° 016-2016-TR, que modifica el Reglamento de la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo, aprobado por Decreto Supremo N.° 005-2012-TR',
    title: 'Decreto Supremo N.° 016-2016-TR, modifica el Reglamento de la Ley N.° 29783',
    category: 'occupational-health',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2016-12-23',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/8094744-016-2016-tr',
    sourceUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/8094744-016-2016-tr',
    plainLanguageSummary:
      'Modifica el artículo 101 del Reglamento, referido a los exámenes médicos ocupacionales que el empleador debe realizar según los riesgos del puesto.',
    whatItRegulates: [
      'La modificación del artículo 101 del Reglamento de la Ley N.° 29783, sobre exámenes médicos ocupacionales.',
    ],
    appliesTo: ['Empleadores', 'Servicios de salud ocupacional'],
    keyTopics: ['exámenes médicos ocupacionales', 'vigilancia de la salud'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-005-2012-tr', 'rm-312-2011-minsa'],
    relatedRouteId: 'plazos',
    lastVerifiedAt: '2026-07-25',
    notes: `La periodicidad concreta de los exámenes depende del puesto y del riesgo. ${VERIFICATION_NOTICE}`,
  },
  {
    id: 'ds-020-2019-tr',
    shortName: 'D.S. N.° 020-2019-TR',
    officialTitle:
      'Decreto Supremo N.° 020-2019-TR, que modifica el Reglamento de la Ley N.° 29783, el Reglamento de la Ley N.° 28806, Ley General de Inspección del Trabajo, el Decreto Supremo N.° 017-2012-TR y el Decreto Supremo N.° 007-2017-TR',
    title: 'Decreto Supremo N.° 020-2019-TR, modifica el Reglamento de la Ley N.° 29783 y normas de inspección',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2019-12-22',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/391897-020-2019-tr',
    officialDocumentUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/1840085-4',
    sourceUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/391897-020-2019-tr',
    plainLanguageSummary:
      'Ajusta el reglamento de SST y varias normas de inspección laboral. Es útil revisarlo cuando se prepara una fiscalización.',
    whatItRegulates: [
      'Modificaciones al Reglamento de la Ley N.° 29783.',
      'Modificaciones al Reglamento de la Ley General de Inspección del Trabajo.',
    ],
    appliesTo: ['Empleadores', 'Áreas de cumplimiento y Recursos Humanos'],
    keyTopics: ['inspección del trabajo', 'fiscalizacion', 'modificatoria'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-005-2012-tr'],
    relatedRouteId: 'plazos',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'ds-001-2021-tr',
    shortName: 'D.S. N.° 001-2021-TR',
    officialTitle:
      'Decreto Supremo N.° 001-2021-TR, que modifica diversos artículos del Reglamento de la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo, aprobado por Decreto Supremo N.° 005-2012-TR y sus modificatorias',
    title: 'Decreto Supremo N.° 001-2021-TR, modifica diversos artículos del Reglamento de la Ley N.° 29783',
    category: 'committee-supervisor',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2021-01-29',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/1604628-001-2021-tr',
    officialDocumentUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/1923867-3',
    sourceUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/1604628-001-2021-tr',
    plainLanguageSummary:
      'Actualiza varios artículos del reglamento de SST para adecuar el marco a las necesidades de protección de todos los trabajadores.',
    whatItRegulates: ['Modificaciones a diversos artículos del Reglamento de la Ley N.° 29783.'],
    appliesTo: ['Empleadores', 'Comités y supervisores de SST'],
    keyTopics: ['modificatoria', 'comité de SST', 'reglamento'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-005-2012-tr'],
    relatedTemplateIds: ['acta-comite'],
    relatedRouteId: 'organiza',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'law-31246',
    shortName: 'Ley N.° 31246',
    officialTitle:
      'Ley N.° 31246, Ley que modifica la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo, para garantizar el derecho de los trabajadores a la seguridad y la salud en el trabajo ante riesgo epidemiológico y sanitario',
    title: 'Ley N.° 31246, modifica la Ley N.° 29783 ante riesgo epidemiológico y sanitario',
    category: 'occupational-health',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Congreso de la República',
    publicationDate: '2021-06-25',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/1966676-1',
    officialDocumentUrl: 'https://leyes.congreso.gob.pe/Documentos/2016_2021/ADLP/Normas_Legales/31246-LEY.pdf',
    sourceUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/1966676-1',
    plainLanguageSummary:
      'Refuerza la protección de los trabajadores frente a riesgos epidemiologicos y sanitarios, en el sector público y privado, tanto en trabajo presencial como remoto.',
    whatItRegulates: [
      'La modificación de los artículos 49 y 60 de la Ley N.° 29783.',
      'La protección frente a riesgo epidemiológico y sanitario en cualquier modalidad de trabajo.',
    ],
    appliesTo: ['Empleadores públicos y privados', 'Trabajo presencial y remoto'],
    keyTopics: ['riesgo sanitario', 'salud ocupacional', 'trabajo remoto'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['law-29783'],
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'ds-006-2022-tr',
    shortName: 'D.S. N.° 006-2022-TR',
    officialTitle:
      'Decreto Supremo N.° 006-2022-TR, que modifica el artículo 1 del Decreto Supremo N.° 012-2014-TR y el artículo 112 del Reglamento de la Ley N.° 29783, Ley de Seguridad y Salud en el Trabajo, aprobado por Decreto Supremo N.° 005-2012-TR',
    title: 'Decreto Supremo N.° 006-2022-TR, modifica el D.S. N.° 012-2014-TR y el Reglamento de la Ley N.° 29783',
    category: 'accidents-incidents',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2022-04-28',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/3005450-006-2022-tr',
    officialDocumentUrl: 'https://busquedas.elperuano.pe/dispositivo/NL/2061692-1',
    sourceUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/3005450-006-2022-tr',
    plainLanguageSummary:
      'Actualiza el registro y la notificación de accidentes de trabajo, incidentes peligrosos y enfermedades ocupacionales.',
    whatItRegulates: [
      'La modificación del artículo 1 del D.S. N.° 012-2014-TR.',
      'La modificación del artículo 112 del Reglamento de la Ley N.° 29783.',
    ],
    appliesTo: ['Empleadores', 'Centros médicos asistenciales'],
    keyTopics: ['notificacion', 'registro único', 'accidentes de trabajo'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-012-2014-tr', 'ds-005-2012-tr'],
    relatedTemplateIds: ['investigacion-accidentes'],
    relatedRouteId: 'plazos',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'rm-375-2008-tr',
    shortName: 'R.M. N.° 375-2008-TR',
    officialTitle:
      'Resolución Ministerial N.° 375-2008-TR, que aprueba la Norma Básica de Ergonomía y de Procedimiento de Evaluación de Riesgo Disergonómico',
    title: 'Resolución Ministerial N.° 375-2008-TR, Norma Básica de Ergonomía',
    category: 'ergonomics',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Trabajo y Promoción del Empleo',
    publicationDate: '2008-11-30',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/394457-375-2008-tr',
    sourceUrl: 'https://www.gob.pe/institucion/mtpe/normas-legales/394457-375-2008-tr',
    plainLanguageSummary:
      'Da parámetros para adaptar el puesto de trabajo a las caracteristicas fisicas y mentales de las personas. Es la referencia peruana para evaluar el riesgo disergonómico.',
    whatItRegulates: [
      'Manipulación manual de cargas.',
      'Posturas de trabajo y movimientos repetitivos.',
      'El procedimiento de evaluación del riesgo disergonómico.',
    ],
    appliesTo: ['Oficinas', 'Almacenes', 'Manufactura', 'Cualquier puesto con carga física o postural'],
    keyTopics: ['ergonomia', 'manipulación de cargas', 'posturas', 'movimientos repetitivos'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['law-29783', 'ds-005-2012-tr'],
    relatedTemplateIds: ['evaluacion-ergonomica'],
    relatedRouteId: 'iperc',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'rm-312-2011-minsa',
    shortName: 'R.M. N.° 312-2011/MINSA',
    officialTitle:
      'Resolución Ministerial N.° 312-2011/MINSA, que aprueba el documento técnico "Protocolos de Exámenes Médico Ocupacionales y Guías de Diagnóstico de los Exámenes Médicos Obligatorios por Actividad"',
    title: 'Resolución Ministerial N.° 312-2011/MINSA, protocolos de exámenes médico ocupacionales',
    category: 'occupational-health',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio de Salud',
    publicationDate: '2011-04-25',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/minsa/normas-legales/243792-312-2011-minsa',
    officialDocumentUrl:
      'https://www.gob.pe/institucion/minsa/informes-publicaciones/284791-protocolos-de-examenes-medico-ocupacionales-y-guias-de-diagnostico-de-los-examenes-medicos-obligatorios-por-actividad-documento-tecnico-r-m-n-312-2011-minsa',
    sourceUrl: 'https://www.gob.pe/institucion/minsa/normas-legales/243792-312-2011-minsa',
    plainLanguageSummary:
      'Define cómo se realizan los exámenes médicos ocupacionales y qué se evalúa según la actividad económica.',
    whatItRegulates: [
      'Protocolos de exámenes médico ocupacionales.',
      'Guías de diagnóstico de los exámenes médicos obligatorios por actividad.',
    ],
    appliesTo: ['Servicios de salud ocupacional', 'Empleadores que realizan vigilancia de la salud'],
    keyTopics: ['exámenes médicos', 'vigilancia de la salud', 'salud ocupacional'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['ds-016-2016-tr'],
    relatedRouteId: 'plazos',
    lastVerifiedAt: '2026-07-25',
    notes: 'Fue modificada por la R.M. N.° 571-2014/MINSA. Confirme la versión aplicable antes de usarla.',
  },
  {
    id: 'law-28611',
    shortName: 'Ley N.° 28611',
    officialTitle: 'Ley N.° 28611, Ley General del Ambiente',
    title: 'Ley N.° 28611, Ley General del Ambiente',
    category: 'environmental',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Congreso de la República',
    publicationDate: '2005-10-15',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/3569-28611',
    officialDocumentUrl: 'https://sinia.minam.gob.pe/normas/ley-general-ambiente',
    sourceUrl: 'https://www.gob.pe/institucion/congreso-de-la-republica/normas-legales/3569-28611',
    plainLanguageSummary:
      'Es la norma que ordena la gestión ambiental en el Perú. Fija principios generales; las obligaciones concretas dependen del sector, la actividad y la autoridad competente.',
    whatItRegulates: [
      'Principios de la política ambiental nacional.',
      'Derechos y deberes en materia ambiental.',
      'Instrumentos de gestión ambiental.',
    ],
    appliesTo: ['Organizaciones con aspectos ambientales significativos', 'Áreas de SOMA'],
    keyTopics: ['ambiente', 'gestión ambiental', 'instrumentos de gestión'],
    obligationKind: 'requisito-sectorial',
    relatedNormIds: ['dl-1278'],
    relatedRouteId: 'soma',
    lastVerifiedAt: '2026-07-25',
    notes:
      'Marco general. Verifique con su autoridad sectorial que obligaciones ambientales concretas aplican a su actividad.',
  },
  {
    id: 'dl-1278',
    shortName: 'D.L. N.° 1278',
    officialTitle: 'Decreto Legislativo N.° 1278, que aprueba la Ley de Gestión Integral de Residuos Sólidos',
    title: 'Decreto Legislativo N.° 1278, Ley de Gestión Integral de Residuos Sólidos',
    category: 'environmental',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio del Ambiente',
    publicationDate: '2016-12-23',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/minam/normas-legales/3610-1278',
    officialDocumentUrl: 'https://sinia.minam.gob.pe/normas/ley-gestion-integral-residuos-solidos',
    sourceUrl: 'https://www.gob.pe/institucion/minam/normas-legales/3610-1278',
    plainLanguageSummary:
      'Regula la gestión de los residuos sólidos desde que se generan hasta su disposición final. Es la referencia principal cuando se organiza la segregación de residuos.',
    whatItRegulates: [
      'La gestión y el manejo de residuos sólidos.',
      'Las responsabilidades del generador de residuos.',
      'La valorización y la disposición final.',
    ],
    appliesTo: ['Generadores de residuos sólidos', 'Áreas de SOMA', 'Contratistas de limpieza y disposición'],
    keyTopics: ['residuos solidos', 'segregacion', 'disposición final', 'valorizacion'],
    obligationKind: 'requisito-sectorial',
    relatedNormIds: ['ds-014-2017-minam', 'law-28611'],
    relatedTemplateIds: ['registro-residuos'],
    relatedRouteId: 'soma',
    lastVerifiedAt: '2026-07-25',
    notes: `Ha sido modificado por normas posteriores. Las obligaciones concretas (declaraciones, planes, autorizaciones) dependen del tipo de generador. ${VERIFICATION_NOTICE}`,
  },
  {
    id: 'ds-014-2017-minam',
    shortName: 'Reglamento del D.L. N.° 1278',
    officialTitle: 'Reglamento del Decreto Legislativo N.° 1278, Ley de Gestión Integral de Residuos Sólidos',
    title: 'Reglamento del Decreto Legislativo N.° 1278, Ley de Gestión Integral de Residuos Sólidos',
    category: 'environmental',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Ministerio del Ambiente',
    effectiveStatus: 'verification-required',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://sinia.minam.gob.pe/normas/reglamento-decreto-legislativo-ndeg-1278-decreto-legislativo-que-aprueba',
    sourceUrl:
      'https://sinia.minam.gob.pe/normas/reglamento-decreto-legislativo-ndeg-1278-decreto-legislativo-que-aprueba',
    plainLanguageSummary:
      'Desarrolla la Ley de Gestión Integral de Residuos Sólidos: cómo se clasifican, almacenan, transportan y disponen los residuos.',
    whatItRegulates: [
      'Clasificación y almacenamiento de residuos.',
      'Obligaciones de los generadores según su categoría.',
      'Manejo de residuos peligrosos.',
    ],
    appliesTo: ['Generadores de residuos sólidos no municipales', 'Áreas de SOMA'],
    keyTopics: ['residuos peligrosos', 'almacenamiento', 'manifiestos', 'EO-RS'],
    obligationKind: 'requisito-sectorial',
    relatedNormIds: ['dl-1278'],
    relatedTemplateIds: ['registro-residuos'],
    relatedRouteId: 'soma',
    lastVerifiedAt: '2026-07-25',
    notes: `Este reglamento ha tenido modificaciones posteriores. Confirme la versión vigente y su aplicabilidad sectorial antes de usarlo como sustento. ${VERIFICATION_NOTICE}`,
  },
  {
    id: 'ds-024-2016-em',
    shortName: 'D.S. N.° 024-2016-EM',
    officialTitle:
      'Decreto Supremo N.° 024-2016-EM, que aprueba el Reglamento de Seguridad y Salud Ocupacional en Minería',
    title: 'Decreto Supremo N.° 024-2016-EM, Reglamento de Seguridad y Salud Ocupacional en Minería',
    category: 'sectoral',
    jurisdiction: 'Peru',
    module: 'mining',
    authority: 'Ministerio de Energía y Minas',
    publicationDate: '2016-07-28',
    effectiveStatus: 'modificada',
    sourceStatus: 'official-verified',
    officialPageUrl: 'https://www.gob.pe/institucion/osinergmin/normas-legales/741887-024-2016-em',
    officialDocumentUrl: 'https://cdn.www.gob.pe/uploads/document/file/901782/DS-024-2016-EM.pdf',
    sourceUrl: 'https://www.gob.pe/institucion/osinergmin/normas-legales/741887-024-2016-em',
    plainLanguageSummary:
      'Reglamento específico de seguridad y salud ocupacional para la actividad minera. Solo aplica si su organización realiza actividad minera o presta servicios en una unidad minera.',
    whatItRegulates: [
      'Gestión de la seguridad y salud ocupacional en unidades mineras.',
      'Requisitos operativos propios de la actividad minera.',
    ],
    appliesTo: ['Titulares de actividad minera', 'Empresas contratistas mineras'],
    keyTopics: ['mineria', 'reglamento sectorial', 'seguridad ocupacional'],
    obligationKind: 'requisito-sectorial',
    relatedNormIds: ['law-29783'],
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
    notes:
      'Ha sido modificado, entre otros, por el D.S. N.° 023-2017-EM y el D.S. N.° 034-2023-EM. Use la edición consolidada publicada por el MINEM.',
  },
  {
    id: 'rne-g050',
    shortName: 'Norma técnica G.050',
    officialTitle: 'Norma técnica G.050 "Seguridad durante la construcción" del Reglamento Nacional de Edificaciones',
    title: 'Norma técnica G.050, Seguridad durante la construcción',
    category: 'sectoral',
    jurisdiction: 'Peru',
    module: 'construction',
    authority: 'Ministerio de Vivienda, Construcción y Saneamiento / SENCICO',
    effectiveStatus: 'verification-required',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://www.gob.pe/institucion/sencico/informes-publicaciones/887225-normas-del-reglamento-nacional-de-edificaciones-rne',
    sourceUrl:
      'https://www.gob.pe/institucion/sencico/informes-publicaciones/887225-normas-del-reglamento-nacional-de-edificaciones-rne',
    plainLanguageSummary:
      'Norma técnica de seguridad para obras de construcción civil. Aplica a actividades de construcción; no es exigible a una oficina administrativa.',
    whatItRegulates: [
      'Condiciones minimas de seguridad en obras de construcción.',
      'Protección colectiva y equipos de protección personal en obra.',
    ],
    appliesTo: ['Obras de construcción civil', 'Contratistas y subcontratistas de obra'],
    keyTopics: ['construccion', 'trabajo en altura', 'obra', 'norma técnica'],
    obligationKind: 'requisito-sectorial',
    relatedNormIds: ['law-29783'],
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
    notes: `El Reglamento Nacional de Edificaciones se actualiza por decreto supremo. Confirme la versión vigente de la norma G.050 en el portal oficial antes de citarla. ${VERIFICATION_NOTICE}`,
  },
  {
    id: 'sunafil-elssa-2',
    shortName: 'ELSSA 2.0 (SUNAFIL)',
    officialTitle: 'ELSSA 2.0: herramienta interactiva para la prevención de riesgos laborales',
    title: 'ELSSA 2.0 (SUNAFIL), herramienta interactiva para la prevención de riesgos laborales',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://www.gob.pe/institucion/sunafil/campa%C3%B1as/125953-elssa-2-0-herramienta-interactiva-para-la-prevencion-de-riesgos-laborales',
    sourceUrl:
      'https://www.gob.pe/institucion/sunafil/campa%C3%B1as/125953-elssa-2-0-herramienta-interactiva-para-la-prevencion-de-riesgos-laborales',
    plainLanguageSummary:
      'Herramienta oficial de orientación de SUNAFIL para autoevaluar la prevención de riesgos laborales. Es material de apoyo, no una norma.',
    whatItRegulates: ['Autoevaluación orientativa de condiciones de seguridad y salud.'],
    appliesTo: ['Micro y pequeñas empresas', 'Responsables de SST que recien empiezan'],
    keyTopics: ['orientacion', 'autoevaluacion', 'prevencion'],
    obligationKind: 'recomendacion',
    relatedRouteId: 'diagnostico',
    lastVerifiedAt: '2026-07-25',
    notes: 'Material de orientación oficial. No sustituye el cumplimiento de la normativa.',
  },
  {
    id: 'sunafil-guia-comite',
    shortName: 'Guía del comité o supervisor (SUNAFIL)',
    officialTitle: 'Guía del Comité o Supervisor de Seguridad y Salud en el Trabajo - SUNAFIL',
    title: 'Guía del Comité o Supervisor de Seguridad y Salud en el Trabajo (SUNAFIL)',
    category: 'committee-supervisor',
    jurisdiction: 'Peru',
    module: 'general',
    authority: 'Superintendencia Nacional de Fiscalización Laboral (SUNAFIL)',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://www.gob.pe/institucion/sunafil/noticias/583696-empresas-con-20-o-mas-trabajadores-deben-contar-con-un-comite-de-seguridad-y-salud-en-el-trabajo',
    officialDocumentUrl:
      'https://cdn.www.gob.pe/uploads/document/file/1348232/Gu%C3%ADa%20del%20Comit%C3%A9%20o%20Supervisor%20de%20Seguridad%20y%20Salud%20en%20el%20Trabajo.pdf',
    sourceUrl:
      'https://www.gob.pe/institucion/sunafil/noticias/583696-empresas-con-20-o-mas-trabajadores-deben-contar-con-un-comite-de-seguridad-y-salud-en-el-trabajo',
    plainLanguageSummary:
      'Guía oficial de SUNAFIL que explica cuándo corresponde un comité y cuándo un supervisor de seguridad y salud en el trabajo, cómo se eligen y qué funciones cumplen.',
    whatItRegulates: [
      'Según SUNAFIL, los centros de trabajo con veinte (20) o mas trabajadores constituyen un comité de seguridad y salud en el trabajo.',
      'En centros de trabajo con menos de veinte (20) trabajadores, los propios trabajadores eligen a un supervisor de seguridad y salud en el trabajo.',
      'El proceso de elección y la duración del mandato del comité o supervisor.',
    ],
    appliesTo: ['Empleadores públicos y privados', 'Trabajadores que eligen a sus representantes'],
    keyTopics: ['comité de SST', 'supervisor de SST', 'eleccion', 'representación de trabajadores'],
    obligationKind: 'obligacion-legal',
    relatedNormIds: ['law-29783', 'ds-005-2012-tr', 'ds-001-2021-tr'],
    relatedTemplateIds: ['acta-comite', 'convocatoria-eleccion'],
    relatedRouteId: 'organiza',
    lastVerifiedAt: '2026-07-25',
    notes:
      'Documento de orientación oficial de SUNAFIL. La obligación nace de la Ley N.° 29783 y su reglamento; use la guía para entender el procedimiento.',
  },
  {
    id: 'servir-modelos-sst',
    shortName: 'Modelos y formatos SST (SERVIR)',
    officialTitle:
      'Modelos y formatos de Seguridad y Salud en el Trabajo (SST) - Autoridad Nacional del Servicio Civil',
    title: 'Modelos y formatos de Seguridad y Salud en el Trabajo (SERVIR)',
    category: 'records',
    jurisdiction: 'Peru',
    module: 'public',
    authority: 'Autoridad Nacional del Servicio Civil (SERVIR)',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572314-modelos-y-formatos-de-seguridad-y-salud-en-el-trabajo-sst',
    sourceUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572314-modelos-y-formatos-de-seguridad-y-salud-en-el-trabajo-sst',
    plainLanguageSummary:
      'Colección oficial de modelos y formatos de SST publicada por SERVIR, útil sobre todo para entidades públicas.',
    whatItRegulates: ['Modelos y formatos referenciales de documentos y registros de SST.'],
    appliesTo: ['Entidades públicas', 'Comités de SST del sector público'],
    keyTopics: ['formatos', 'sector público', 'modelos'],
    obligationKind: 'recomendacion',
    relatedRouteId: 'plantillas',
    lastVerifiedAt: '2026-07-25',
  },
  {
    id: 'servir-normatividad-sst',
    shortName: 'Normatividad SST (SERVIR)',
    officialTitle:
      'Normatividad relacionada a la Seguridad y Salud en el Trabajo (SST) - Autoridad Nacional del Servicio Civil',
    title: 'Normatividad relacionada a la Seguridad y Salud en el Trabajo (SERVIR)',
    category: 'general-sst',
    jurisdiction: 'Peru',
    module: 'public',
    authority: 'Autoridad Nacional del Servicio Civil (SERVIR)',
    effectiveStatus: 'vigente',
    sourceStatus: 'official-verified',
    officialPageUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572362-normatividad-relacionada-a-la-seguridad-y-salud-en-el-trabajo-sst',
    sourceUrl:
      'https://www.gob.pe/institucion/servir/informes-publicaciones/3572362-normatividad-relacionada-a-la-seguridad-y-salud-en-el-trabajo-sst',
    plainLanguageSummary:
      'Compendio oficial de normas de SST reunido por SERVIR. Es un buen punto de partida para confirmar que versión de cada norma esta vigente.',
    whatItRegulates: ['Recopilación oficial de la normativa de SST aplicable.'],
    appliesTo: ['Entidades públicas', 'Consultores', 'Estudiantes'],
    keyTopics: ['compendio', 'normativa', 'sector público'],
    obligationKind: 'recomendacion',
    relatedRouteId: 'obligaciones',
    lastVerifiedAt: '2026-07-25',
  },
]

legalNorms.push(...extendedLegalNorms)

export function findNorm(id: string): LegalNorm | undefined {
  return legalNorms.find((norm) => norm.id === id)
}

/** Marco general aplicable a cualquier organización (sin normas ambientales ni sectoriales). */
export const generalNormIds = legalNorms
  .filter((norm) => norm.module === 'general' && norm.category !== 'environmental')
  .map((norm) => norm.id)

export const environmentalNormIds = legalNorms
  .filter((norm) => norm.category === 'environmental')
  .map((norm) => norm.id)

/** Referencias destacadas en la página de inicio. */
export const featuredNormIds = ['law-29783', 'ds-005-2012-tr', 'rm-050-2013-tr']

/**
 * Artículos verificados uno a uno contra el documento oficial completo.
 * Se mantiene vacio de forma deliberada: el motor de riesgos nunca debe citar
 * un artículo sin respaldo documental abierto y contrastado.
 */
/**
 * Articulos cotejados con el texto oficial que sustentan la evaluacion de riesgos de
 * cualquier fila IPERC (D.S. 005-2012-TR arts. 77 y 82). El catalogo completo vive en src/catalog.
 */
export const legalArticles: LegalArticle[] = ARTICLES.filter((article) => article.appliesToIperc).map((article) => ({
  id: article.id,
  normId: article.normId,
  articleLabel: article.label,
  obligation: article.plainLanguage,
  sourceExcerpt: article.excerpt,
  sourceUrl: article.sourceUrl,
  sourceStatus: 'uploaded_official',
}))

export const evidenceRequirements: EvidenceRequirement[] = [
  {
    id: 'sgsst-base',
    label: 'Documentos base del SGSST',
    appliesTo: 'general',
    examples: [
      'Política SST vigente',
      'Mapa de procesos',
      'Organigrama',
      'Registro de capacitaciones',
      'Acta de comité o supervisor SST',
    ],
  },
  {
    id: 'iperc-review',
    label: 'Evidencia de elaboración y revisión IPERC',
    appliesTo: 'general',
    examples: ['Matriz IPERC versionada', 'Lista de participantes', 'Acta de revisión', 'Aprobación de responsable SST'],
  },
  {
    id: 'field-evidence',
    label: 'Evidencia de verificación en campo',
    appliesTo: 'general',
    examples: ['Fotos con fecha', 'Inspecciones planeadas', 'Checklists preuso', 'Registros de mantenimiento'],
  },
  {
    id: 'environmental-evidence',
    label: 'Evidencia ambiental (SOMA)',
    appliesTo: 'general',
    examples: [
      'Registro de residuos generados',
      'Manifiestos de residuos peligrosos',
      'Inspección del almacén de químicos',
      'Simulacro de derrames',
    ],
  },
]

const sectoralWarning =
  'Las normas sectoriales solo aplican si su actividad económica esta comprendida. Verifique si corresponde a su actividad antes de usarlas como sustento.'

const generalOnlyWarning =
  'Este sector se apoya en el marco general. Si su actividad cuenta con un reglamento propio, verifiquelo con su autoridad sectorial.'

interface SectorSeed {
  id: SectorId
  label: string
  description: string
  sectoralNormIds: string[]
  hazardBoostKeywords: string[]
  hazardGroups: string[]
  suggestedEvidence: string[]
  typicalControls: string[]
}

const sectorSeeds: SectorSeed[] = [
  {
    id: 'public',
    label: 'Sector público',
    description: 'Entidades estatales, gobiernos regionales y locales, organismos autónomos y administración pública.',
    sectoralNormIds: ['servir-modelos-sst', 'servir-normatividad-sst'],
    hazardBoostKeywords: ['atención al público', 'archivo', 'campo', 'oficina', 'violencia'],
    hazardGroups: [
      'ergonomic',
      'psychosocial',
      'public safety / violence / third-party aggression',
      'locative / workplace conditions',
    ],
    suggestedEvidence: ['Mapa de procesos', 'Plan anual SST', 'Registros de atención al público', 'Protocolos de emergencia'],
    typicalControls: [
      'Pausas activas',
      'Protocolos de atención difícil',
      'Inspecciones de locales',
      'Señalización y rutas de evacuación',
    ],
  },
  {
    id: 'offices',
    label: 'Oficinas administrativas privadas',
    description: 'Trabajo administrativo, cómputo, archivo, atención, reuniones y servicios internos.',
    sectoralNormIds: [],
    hazardBoostKeywords: ['computadora', 'pantalla', 'postura', 'archivo', 'electricidad', 'estres'],
    hazardGroups: ['ergonomic', 'psychosocial', 'electrical', 'fire', 'locative / workplace conditions'],
    suggestedEvidence: ['Evaluación ergonómica', 'Inspección eléctrica', 'Plan de emergencia', 'Registro de pausas activas'],
    typicalControls: ['Ajuste ergonómico', 'Orden de cableado', 'Extintores operativos', 'Pausas activas'],
  },
  {
    id: 'construction',
    label: 'Construcción',
    description: 'Obras civiles, edificaciones, excavaciones, izaje, altura, demolición y contratistas.',
    sectoralNormIds: ['rne-g050', 'ds-011-2019-tr'],
    hazardBoostKeywords: ['altura', 'excavacion', 'izaje', 'andamio', 'demolicion', 'obra'],
    hazardGroups: ['work at height', 'mechanical', 'manual handling of loads', 'traffic / vehicle movement', 'explosion'],
    suggestedEvidence: ['Permisos de trabajo', 'Checklists de andamios', 'Plan de izaje', 'ATS/JSA', 'Inducción de obra'],
    typicalControls: ['Barandas', 'Líneas de vida', 'Segregación de áreas', 'Permisos de alto riesgo'],
  },
  {
    id: 'mining',
    label: 'Minería',
    description: 'Operación minera, planta, mantenimiento, transporte interno, perforación y voladura.',
    sectoralNormIds: ['ds-024-2016-em'],
    hazardBoostKeywords: ['mina', 'planta', 'voladura', 'perforacion', 'socavon', 'acarreo'],
    hazardGroups: ['explosion', 'confined spaces', 'machinery and tools', 'traffic / vehicle movement', 'chemical'],
    suggestedEvidence: ['Permiso de trabajo', 'Monitoreos ocupacionales', 'Autorización de operador', 'Inspección de equipos'],
    typicalControls: ['Bloqueo de energía', 'Ventilación', 'Control de transito interno', 'Procedimientos de voladura'],
  },
  {
    id: 'hydrocarbons',
    label: 'Hidrocarburos',
    description: 'Exploración, producción, almacenamiento, transporte, estaciones y mantenimiento.',
    sectoralNormIds: [],
    hazardBoostKeywords: ['combustible', 'gas', 'presion', 'tanque', 'inflamable', 'derrame'],
    hazardGroups: ['fire', 'explosion', 'chemical', 'confined spaces', 'traffic / vehicle movement'],
    suggestedEvidence: ['Plan de contingencias', 'Hojas SDS', 'Monitoreo atmosferico', 'Permisos de trabajo en caliente'],
    typicalControls: ['Contención secundaria', 'Detectores de gas', 'Puesta a tierra', 'Control de fuentes de ignición'],
  },
  {
    id: 'manufacturing',
    label: 'Manufactura',
    description: 'Producción industrial, líneas de proceso, maquinaria, almacén y mantenimiento.',
    sectoralNormIds: [],
    hazardBoostKeywords: ['maquina', 'prensa', 'corte', 'ruido', 'quimico', 'energia'],
    hazardGroups: ['machinery and tools', 'mechanical', 'chemical', 'physical', 'ergonomic'],
    suggestedEvidence: ['Mantenimiento preventivo', 'Guardas de máquina', 'Monitoreo de ruido', 'SDS'],
    typicalControls: ['Guardas', 'LOTO', 'Ventilación', 'Rotación de tareas'],
  },
  {
    id: 'health',
    label: 'Servicios de salud',
    description: 'Hospitales, clinicas, laboratorios, servicios asistenciales y actividades sanitarias.',
    sectoralNormIds: ['rm-312-2011-minsa'],
    hazardBoostKeywords: ['paciente', 'biologico', 'punzocortante', 'laboratorio', 'limpieza'],
    hazardGroups: [
      'biological',
      'chemical',
      'psychosocial',
      'ergonomic',
      'public safety / violence / third-party aggression',
    ],
    suggestedEvidence: [
      'Procedimientos de bioseguridad',
      'Registro de incidentes punzocortantes',
      'Segregación de residuos',
      'Capacitación',
    ],
    typicalControls: ['Contenedores rigidos', 'Barreras de bioseguridad', 'Higiene de manos', 'Protocolos de atención'],
  },
  {
    id: 'transport_logistics',
    label: 'Transporte y logística',
    description: 'Transporte, distribución, rutas, carga, descarga y flota.',
    sectoralNormIds: [],
    hazardBoostKeywords: ['vehiculo', 'ruta', 'conductor', 'montacarga', 'carga', 'transito'],
    hazardGroups: ['traffic / vehicle movement', 'manual handling of loads', 'psychosocial', 'fire'],
    suggestedEvidence: ['Checklists vehiculares', 'Licencias', 'Plan de rutas', 'Registro de fatiga'],
    typicalControls: ['Gestión de velocidad', 'Mantenimiento vehicular', 'Segregación peatonal', 'Pausas por fatiga'],
  },
  {
    id: 'warehouses',
    label: 'Almacenes',
    description: 'Recepción, almacenamiento, picking, despacho y uso de equipos de izaje menor.',
    sectoralNormIds: [],
    hazardBoostKeywords: ['almacen', 'estanteria', 'montacarga', 'picking', 'despacho', 'carga'],
    hazardGroups: ['manual handling of loads', 'traffic / vehicle movement', 'locative / workplace conditions', 'fire'],
    suggestedEvidence: [
      'Inspección de estanterias',
      'Layout de transito',
      'Checklists de equipos',
      'Capacitación en manipulación de cargas',
    ],
    typicalControls: ['Límites de carga', 'Rutas peatonales', 'Ayudas mecanicas', 'Orden y limpieza'],
  },
  {
    id: 'maintenance_services',
    label: 'Servicios generales y mantenimiento',
    description: 'Mantenimiento locativo, eléctrico, limpieza, jardineria y soporte operativo.',
    sectoralNormIds: ['rm-111-2013-mem-dm'],
    hazardBoostKeywords: ['mantenimiento', 'limpieza', 'tablero', 'altura', 'herramienta', 'energia'],
    hazardGroups: ['electrical', 'work at height', 'chemical', 'machinery and tools', 'locative / workplace conditions'],
    suggestedEvidence: ['Permisos de trabajo', 'LOTO', 'SDS', 'Checklists de herramientas', 'Ordenes de trabajo'],
    typicalControls: ['Bloqueo y etiquetado', 'Herramientas certificadas', 'Ventilación', 'Procedimientos de limpieza segura'],
  },
]

export const sectorModules: SectorModule[] = sectorSeeds.map((seed) => {
  const normIds = [...generalNormIds, ...seed.sectoralNormIds]
  return {
    id: seed.id,
    label: seed.label,
    description: seed.description,
    normIds,
    hazardBoostKeywords: seed.hazardBoostKeywords,
    hazardGroups: seed.hazardGroups,
    suggestedEvidence: seed.suggestedEvidence,
    typicalControls: seed.typicalControls,
    legalReferences: normIds,
    validationWarning: seed.sectoralNormIds.length ? sectoralWarning : generalOnlyWarning,
  }
})

/** Normas sectoriales por sector, usadas por la vista Normativa y por Obligaciones. */
export const sectoralNormIdsBySector = sectorSeeds.reduce<Record<string, string[]>>((acc, seed) => {
  acc[seed.id] = seed.sectoralNormIds
  return acc
}, {})
