/**
 * Casuistica de fiscalizacion.
 *
 * `binding`:
 *  - 'precedente-vinculante': Sala Plena del TFL que declara precedente de observancia obligatoria.
 *  - 'no-vinculante': resolucion de una sala del TFL (criterio orientador para el caso).
 *  - 'judicial': pronunciamiento judicial.
 *  - 'norma-administrativa': resolucion/directiva de SUNAFIL.
 *
 * `verification`:
 *  - 'ficha-oficial-verificada': existe la ficha o PDF en gob.pe (enlace revisado el 2026-11-03).
 *  - 'reportado-sin-cotejar': citado en el informe de mercado o en la evaluacion externa entregados
 *    por el usuario; el texto integro aun no fue cotejado. No usar en un descargo sin leerlo.
 */
export type CaseBinding = 'precedente-vinculante' | 'no-vinculante' | 'judicial' | 'norma-administrativa'
export type CaseVerification = 'ficha-oficial-verificada' | 'reportado-sin-cotejar'

export interface CaseItem {
  id: string
  reference: string
  body: string
  year: number
  topics: string[]
  binding: CaseBinding
  criterion: string
  platformUse: string
  url?: string
  verification: CaseVerification
}

export const SUNAFIL_NORMS_SEARCH = 'https://www.gob.pe/institucion/sunafil/normas-legales'

export const BINDING_LABELS: Record<CaseBinding, string> = {
  'precedente-vinculante': 'Precedente vinculante',
  'no-vinculante': 'Criterio no vinculante',
  judicial: 'Judicial',
  'norma-administrativa': 'Norma administrativa',
}

export const CASES: CaseItem[] = [
  {
    id: 'rs-052-2026-sunafil',
    reference: 'Resolución de Superintendencia N.° 052-2026-SUNAFIL',
    body: 'SUNAFIL',
    year: 2026,
    topics: ['accidentes', 'investigacion'],
    binding: 'norma-administrativa',
    criterion: 'Deja sin efecto la versión 1 de la directiva de actuaciones inspectivas de investigación de accidentes de trabajo e incidentes peligrosos (Directiva 002-2020-SUNAFIL/DINI) y regula su nueva versión.',
    platformUse: 'Base del módulo de accidentes: plazos y pasos de la investigación inspectiva.',
    url: 'https://www.gob.pe/institucion/sunafil/normas-legales/7827743-052-2026-sunafil',
    verification: 'ficha-oficial-verificada',
  },
  {
    id: 'tfl-sp-011-2022',
    reference: 'Resolución de Sala Plena N.° 011-2022-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2022,
    topics: ['supervision', 'prevencion'],
    binding: 'precedente-vinculante',
    criterion: 'Según el informe entregado: la "supervisión efectiva" exige procedimientos y metodologías documentadas de control en campo, no solo contratar a un supervisor.',
    platformUse: 'Exigir evidencia de supervisión (rondas, checklists) en la obligación de organización del SGSST.',
    url: 'https://www.gob.pe/institucion/sunafil/normas-legales/3691159-011-2022-sunafil-tfl',
    verification: 'ficha-oficial-verificada',
  },
  {
    id: 'tfl-sp-008-2024',
    reference: 'Resolución de Sala Plena N.° 008-2024-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2024,
    topics: ['riesgo-grave-inminente', 'prevencion'],
    binding: 'precedente-vinculante',
    criterion: 'Analiza el estándar de "riesgo grave e inminente" en SST, que comprende la integridad física, psíquica y mental.',
    platformUse: 'Clasificar hallazgos de riesgo grave e inminente (28.7) frente a incumplimientos ordinarios.',
    url: 'https://cdn.www.gob.pe/uploads/document/file/6434563/5630216-resolucion-de-sala-plena-n-008-2024-sunafil_tfl.pdf',
    verification: 'ficha-oficial-verificada',
  },
  {
    id: 'tfl-sp-011-2024',
    reference: 'Resolución de Sala Plena N.° 011-2024-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2024,
    topics: ['tipicidad', 'motivacion', 'defensa'],
    binding: 'precedente-vinculante',
    criterion: 'Criterios sobre el principio de tipicidad y la debida motivación para determinar responsabilidad administrativa.',
    platformUse: 'Lista de control del expediente: verificar que el hecho imputado encaje exactamente en el numeral tipificado.',
    url: 'https://www.gob.pe/institucion/sunafil/normas-legales/5639176-011-2024-sunafil-tfl',
    verification: 'ficha-oficial-verificada',
  },
  {
    id: 'tfl-sp-016-2024',
    reference: 'Resolución de Sala Plena N.° 016-2024-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2024,
    topics: ['procedimiento', 'defensa'],
    binding: 'precedente-vinculante',
    criterion: 'Criterios sobre la acumulación de procedimientos administrativos sancionadores.',
    platformUse: 'Revisar concurrencia de procedimientos en el expediente de fiscalización.',
    url: 'https://www.gob.pe/institucion/sunafil/normas-legales/6102185-016-2024-sunafil-tfl',
    verification: 'ficha-oficial-verificada',
  },
  {
    id: 'tfl-sp-019-2024',
    reference: 'Resolución de Sala Plena N.° 019-2024-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2024,
    topics: ['razonabilidad', 'multas', 'defensa'],
    binding: 'precedente-vinculante',
    criterion: 'Principio de razonabilidad y supuestos de exceso de punición administrativa.',
    platformUse: 'Evaluar proporcionalidad de la multa estimada en la ficha de contingencia.',
    url: 'https://www.gob.pe/institucion/sunafil/normas-legales/6248576-019-2024-sunafil-tfl',
    verification: 'ficha-oficial-verificada',
  },
  {
    id: 'tfl-sp-005-2023',
    reference: 'Resolución de Sala Plena N.° 005-2023-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2023,
    topics: ['contratistas', 'responsabilidad-solidaria'],
    binding: 'precedente-vinculante',
    criterion: 'Según el informe entregado: el deber de prevención recae conjuntamente en la contratista y la empresa principal o usuaria respecto del personal destacado.',
    platformUse: 'Obligación de verificación de contratistas (27.16).',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-003-2024',
    reference: 'Resolución de Sala Plena N.° 003-2024-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2024,
    topics: ['subsanacion', 'defensa'],
    binding: 'precedente-vinculante',
    criterion: 'Según la evaluación entregada: precedentes sobre el carácter subsanable de determinadas infracciones.',
    platformUse: 'Distinguir corrección material, evidencia de subsanación y efectos jurídicos en el plan correctivo.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-1s-557-2024',
    reference: 'Resolución N.° 557-2024-SUNAFIL/TFL — Primera Sala',
    body: 'Tribunal de Fiscalización Laboral — Primera Sala',
    year: 2024,
    topics: ['epp'],
    binding: 'no-vinculante',
    criterion: 'Según el informe entregado: el cargo de entrega del EPP no basta; debe acreditarse su idoneidad para el riesgo del puesto.',
    platformUse: 'La evidencia de EPP incluye especificación técnica frente al riesgo, no solo el cargo.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-sp-005-2025',
    reference: 'Resolución de Sala Plena N.° 005-2025-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2025,
    topics: ['procedimiento', 'casilla-electronica', 'defensa'],
    binding: 'precedente-vinculante',
    criterion: 'Según el informe entregado: requerimientos en casilla electrónica sin alertas al correo o celular pueden afectar el derecho de defensa.',
    platformUse: 'Cronología del expediente: registrar fecha y medio de cada notificación.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-sp-006-2025',
    reference: 'Resolución de Sala Plena N.° 006-2025-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2025,
    topics: ['accidentes', 'causalidad'],
    binding: 'precedente-vinculante',
    criterion: 'Según la evaluación entregada: necesidad de verificar la relación causal entre incumplimientos de SST y el accidente investigado.',
    platformUse: 'Ficha de causalidad: tareas, riesgos, omisiones y pruebas, sin confundir incumplimiento formal con causa del daño.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-sp-007-2025',
    reference: 'Resolución de Sala Plena N.° 007-2025-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2025,
    topics: ['salud', 'salud-mental', 'emo'],
    binding: 'precedente-vinculante',
    criterion: 'Según el informe entregado: la vigilancia de la salud comprende la salud mental; reincorporar tras un evento traumático sin EMO de reincorporación ni evaluación mental es infracción.',
    platformUse: 'Protocolo de retorno laboral con EMO de reincorporación.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-sp-008-2025',
    reference: 'Resolución de Sala Plena N.° 008-2025-SUNAFIL/TFL',
    body: 'Tribunal de Fiscalización Laboral — Sala Plena',
    year: 2025,
    topics: ['accidentes', 'causalidad', 'defensa'],
    binding: 'precedente-vinculante',
    criterion: 'Según el informe entregado: quiebre del nexo causal por causa ajena al trabajo, negligencia del trabajador capacitado o fuerza mayor/hecho de tercero.',
    platformUse: 'La ficha de causalidad exige probar capacitación, entrega de EPP y supervisión antes de alegar quiebre del nexo.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'tfl-1s-0187-2026',
    reference: 'Resolución N.° 0187-2026-SUNAFIL/TFL — Primera Sala',
    body: 'Tribunal de Fiscalización Laboral — Primera Sala',
    year: 2026,
    topics: ['iperc', 'accidentes'],
    binding: 'no-vinculante',
    criterion: 'Según la evaluación entregada: valoración conjunta del IPERC, perfil de puesto, contrato y documentación vinculada a un accidente.',
    platformUse: 'El expediente no se basa en un solo documento: cruza IPERC, perfil, contrato y registros.',
    verification: 'reportado-sin-cotejar',
  },
  {
    id: 'cas-17464-2023',
    reference: 'Casación Laboral N.° 17464-2023 Cusco',
    body: 'Corte Suprema de Justicia',
    year: 2023,
    topics: ['multas', 'trabajadores-afectados', 'construccion'],
    binding: 'judicial',
    criterion: 'Según la evaluación entregada: cálculo de trabajadores afectados en una obra de construcción inspeccionada; distinguir de las reglas especiales del art. 48.1-C.',
    platformUse: 'Justificar el número de afectados en la ficha de contingencia.',
    verification: 'reportado-sin-cotejar',
  },
]
