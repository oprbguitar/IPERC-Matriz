/**
 * Detalle ampliado por norma: historia de modificaciones y datos clave, cotejados con los
 * textos de las ediciones de normas legales archivadas por el SPIJ (corte 2026-11-03).
 * Se muestra plegado en Explorar → Normativa para no saturar la vista.
 */
export interface Amendment {
  normId?: string
  label: string
  date: string
  what: string
}

export interface NormDetail {
  /** Qué problema resuelve, en una frase. */
  purpose: string
  amendments?: Amendment[]
  keyFacts?: string[]
  /** Cómo se usa en la práctica, paso a paso. */
  inPractice?: string[]
}

export const NORM_DETAILS: Record<string, NormDetail> = {
  'law-29783': {
    purpose:
      'Es la ley marco: obliga a todo empleador, público o privado, a prevenir los riesgos de su actividad, con participación de los trabajadores y bajo la fiscalización del Estado.',
    amendments: [
      { normId: 'law-30222', label: 'Ley N.° 30222', date: '11/07/2014', what: 'Modificó los arts. 13, 26 (permite contratar a terceros para gestionar el SGSST sin trasladar la responsabilidad), 28 (registros simplificados para MIPYME; enfermedades ocupacionales se conservan 20 años), 32 (licencia y protección de representantes), 49 d) (exámenes médicos cada dos años; de salida facultativos) y 76, y el art. 168-A del Código Penal.' },
      { normId: 'ds-010-2014-tr', label: 'D.S. N.° 010-2014-TR', date: '2014', what: 'Normas complementarias del periodo de tres años en que la inspección privilegió la prevención (alcance agotado).' },
      { normId: 'law-31246', label: 'Ley N.° 31246', date: '25/06/2021', what: 'Modificó los arts. 49 (vigilancia epidemiológica y pruebas de tamizaje sin costo para el trabajador en emergencia sanitaria) y 60 (EPP conforme a normas técnicas peruanas y costo íntegro del empleador, incluso en trabajo remoto).' },
    ],
    keyFacts: [
      'Comité paritario con 20 o más trabajadores (art. 29); supervisor elegido por los trabajadores con menos de 20 (art. 30).',
      'RISST obligatorio con 20 o más trabajadores (art. 34).',
      'Mínimo cuatro capacitaciones al año y entrega del RISST a cada trabajador (art. 35).',
      'Evaluación de riesgos actualizada una vez al año como mínimo, o antes si cambian las condiciones o hay daños (art. 57).',
      'Exámenes médicos cada dos años; en alto riesgo, antes, durante y al término de la relación laboral (art. 49 d).',
      'Jerarquía de controles: eliminar, controlar o aislar, minimizar y, al final, EPP (art. 21).',
      'Registros de enfermedades ocupacionales: conservación de 20 años (art. 28).',
      'La empresa principal responde por las infracciones de SST que afecten a trabajadores de contratistas en sus instalaciones (art. 103).',
      'Delito de atentado contra las condiciones de SST: art. 168-A del Código Penal (texto de la Ley 30222).',
    ],
    inPractice: [
      'Empiece por la política firmada y la línea base: le dirán qué falta.',
      'Defina si le corresponde comité o supervisor según el número de trabajadores y convoque a elecciones (R.M. 245-2021-TR).',
      'Haga la IPERC por puesto con los trabajadores y prográmela para revisarla antes de que pase un año.',
      'Planifique en el programa anual las cuatro capacitaciones, los exámenes médicos y los monitoreos.',
      'Lleve los registros desde el primer día: son la prueba que pedirá SUNAFIL.',
    ],
  },
  'ds-005-2012-tr': {
    purpose: 'Desarrolla la Ley 29783: cómo se organiza el comité, qué documentos y registros se exigen, cómo se evalúan los riesgos y cómo se notifican los accidentes.',
    amendments: [
      { normId: 'ds-006-2014-tr', label: 'D.S. N.° 006-2014-TR', date: '09/08/2014', what: 'Modificó los arts. 1, 22, 27, 28, 34, 73 y 101 y adecuó el reglamento a la Ley 30222.' },
      { normId: 'ds-016-2016-tr', label: 'D.S. N.° 016-2016-TR', date: '23/12/2016', what: 'Modificó el art. 101: exámenes médicos según las labores y el récord histórico del trabajador, conforme a los documentos técnicos del MINSA.' },
      { normId: 'ds-020-2019-tr', label: 'D.S. N.° 020-2019-TR', date: '24/12/2019', what: 'Modificó el art. 27: capacitación centrada en el puesto, en los cambios de funciones y de tecnología, cualquiera sea el contrato.' },
      { normId: 'ds-002-2020-tr', label: 'D.S. N.° 002-2020-TR', date: '08/01/2020', what: 'Sustituyó el art. 77: la IPERC se elabora y actualiza sin exceder un año, por puesto, con participación y consulta, y con requisitos mínimos.' },
      { normId: 'ds-001-2021-tr', label: 'D.S. N.° 001-2021-TR', date: '29/01/2021', what: 'Modificó los arts. 42, 49, 56, 102 y 103: funciones del comité, investigación y reporte de accidentes.' },
      { normId: 'ds-006-2022-tr', label: 'D.S. N.° 006-2022-TR', date: '28/04/2022', what: 'Modificó el art. 112 del reglamento y el art. 1 del D.S. 012-2014-TR (registro de accidentes, incidentes y enfermedades).' },
    ],
    keyFacts: [
      'Ocho registros obligatorios (art. 33) y plazos de conservación (art. 35): 20 años enfermedades ocupacionales, 10 años accidentes e incidentes peligrosos, 5 años el resto.',
      'Documentos exigibles del SGSST (art. 32): política, RISST, IPERC, mapa de riesgos, planificación y programa anual.',
      'Comité de 4 a 12 miembros con reunión ordinaria mensual.',
      'Contenido mínimo del RISST (art. 74) y entrega bajo cargo (art. 75).',
      'Disposiciones mínimas ante emergencias (art. 83).',
    ],
  },
  'law-32721': {
    purpose: 'Protege a quien trabaja de pie muchas horas: tiene derecho a sentarse y a alternar la postura sin que eso le cueste jornada.',
    keyFacts: [
      'Aplica desde tres horas continuas de trabajo de pie.',
      'Los descansos sentados forman parte de la jornada.',
      'Se admite un sistema rotativo de sillas, documentado en el RISST y aprobado por el Comité.',
      'Incumplir es infracción grave.',
      'El RISST se adecúa en un máximo de 360 días calendario desde la vigencia de la ley.',
    ],
    inPractice: [
      'Liste los puestos donde se trabaja de pie y mida cuánto tiempo seguido.',
      'Decida si aplica una excepción (postura inherente o riesgo objetivo) y documéntelo.',
      'Defina sillas y sistema de rotación, llévelo al Comité y súbalo al RISST.',
      'Verifique en campo con el Comité o Supervisor y deje acta.',
    ],
  },
  'ds-003-2026-sa': {
    purpose: 'Lleva la radiación ultravioleta al sistema de gestión: deja de ser un tema de bloqueador y pasa a ser un riesgo evaluado, controlado y vigilado.',
    keyFacts: [
      'Horario crítico: 10:00 a 16:00 (Sierra: 09:00 a 16:00).',
      'Riesgo alto: índice UV de 6 o más, o exposición igual o mayor al 30 % de la jornada.',
      'Controles mínimos: programación horaria, rotación del personal de riesgo alto e información.',
      'El EPP es complementario; los EMO incluyen evaluación oftalmológica y tamizaje dermatológico.',
      'Carteles obligatorios en zonas expuestas: «La exposición prolongada a la radiación solar produce daño a la salud».',
    ],
    inPractice: [
      'Identifique en la IPERC los puestos al aire libre y sus horarios.',
      'Consulte a diario el índice UV del SENAMHI y ajuste la programación.',
      'Instale sombra y rote al personal; entregue sombrero de ala ancha, manga larga, lentes UV y fotoprotector.',
      'Pida al médico ocupacional incluir piel y ojos en el protocolo de EMO.',
    ],
  },
  'ds-014-2013-tr': {
    purpose: 'Crea el registro de auditores autorizados y fija cada cuánto se audita el SGSST.',
    keyFacts: [
      'Actividades de riesgo (Anexo 5 del D.S. 009-97-SA): auditoría cada 2 años.',
      'Demás actividades: cada 3 años.',
      'Hasta 10 trabajadores y sin actividad de riesgo: solo cuando lo ordene la inspección.',
      'El auditor debe estar registrado y ser independiente de la organización.',
    ],
  },
  'law-31572': {
    purpose: 'Ordena el teletrabajo y deja claro que la SST también aplica en el lugar donde se teletrabaja.',
    amendments: [
      { label: 'Ley N.° 32102', date: '—', what: 'Modificó la ley respecto de los derechos y deberes de los teletrabajadores (según la sumilla oficial del D.S. 009-2026-TR).' },
      { normId: 'ds-002-2023-tr', label: 'D.S. N.° 002-2023-TR', date: '26/02/2023', what: 'Reglamento de la ley.' },
      { normId: 'rm-051-2026-tr', label: 'R.M. N.° 051-2026-TR', date: '20/02/2026', what: 'Actualizó los anexos 1 y 2 del reglamento.' },
      { normId: 'ds-009-2026-tr', label: 'D.S. N.° 009-2026-TR', date: '22/07/2026', what: 'Modificó los arts. 7, 12, 21, 26 y 27 e incorporó el art. 10-A del reglamento.' },
    ],
  },
  'ds-003-98-sa': {
    purpose: 'Asegura a quien trabaja en actividades de riesgo: el SCTR cubre atención de salud y pensión por accidente de trabajo o enfermedad profesional.',
    amendments: [
      { normId: 'ds-008-2022-sa', label: 'D.S. N.° 008-2022-SA', date: '08/06/2022', what: 'Actualizó el Anexo 5 (actividades de riesgo) del D.S. 009-97-SA.' },
      { normId: 'ds-022-2023-sa', label: 'D.S. N.° 022-2023-SA', date: '18/08/2023', what: 'Modificó el art. 20 de las normas técnicas.' },
    ],
    inPractice: [
      'Ubique el código CIIU de su actividad y búsquelo en el Anexo 5 actualizado.',
      'Si figura, contrate SCTR salud y pensión para todo el personal expuesto, incluidos los destacados.',
      'Exija a contratistas su constancia SCTR vigente antes del ingreso.',
    ],
  },
}

export function normDetail(id: string): NormDetail | undefined {
  return NORM_DETAILS[id]
}
