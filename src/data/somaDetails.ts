/**
 * Detalle normativo de cada tema SOMA (seguridad, salud ocupacional y medio ambiente).
 * Se muestra plegado en Diagnosticar → Por tamaño y rol → SOMA y ambiente.
 * Lo que es buena práctica o norma técnica se identifica como tal; las normas técnicas
 * peruanas (NTP) se citan para confirmar su edición vigente en INACAL.
 */
export interface SomaDetail {
  facts: string[]
  /** Plantilla adaptada específica (si existe) además de la plantilla del tema. */
  templateId?: string
  /** Guía del Observatorio relacionada. */
  guideId?: string
}

export const SOMA_DETAILS: Record<string, SomaDetail> = {
  aspectos: {
    facts: [
      'La Ley General del Ambiente (Ley 28611) impone a quien desarrolla una actividad el deber de prevenir, vigilar y evitar la degradación ambiental, y de asumir el costo de los daños que cause.',
      'Los proyectos con impactos significativos requieren certificación ambiental antes de ejecutarse (Ley 27446, SEIA, y D.S. 019-2009-MINAM).',
      'La identificación debe cubrir condiciones normales, anormales (arranques, mantenimientos) y de emergencia.',
      'ISO 14001 (adoptada en el Perú como NTP-ISO 14001) pide considerar la perspectiva de ciclo de vida: compras, uso del producto y disposición final.',
      'Un aspecto es significativo cuando su impacto es relevante o cuando está asociado a un requisito legal.',
    ],
    templateId: 'tpl-aspectos-ambientales',
  },
  residuos: {
    facts: [
      'El D. Leg. 1278 ordena la gestión con una jerarquía: primero prevenir y minimizar, luego valorizar (reciclar, reaprovechar) y, al final, la disposición segura.',
      'El generador es responsable de segregar en la fuente y de entregar los residuos a una empresa operadora registrada (D.S. 014-2017-MINAM).',
      'Los generadores de residuos no municipales deben cumplir obligaciones de gestión y reporte ante la autoridad competente de su sector; verifique las vigentes para su actividad.',
      'El código de colores de los contenedores está en la NTP 900.058 (confirme la edición vigente en INACAL).',
      'La segregación también es un tema de SST: quien manipula residuos debe tener capacitación, EPP y el peligro registrado en su IPERC.',
    ],
    templateId: 'tpl-residuos',
    guideId: 'guia-residuos',
  },
  peligrosos: {
    facts: [
      'Un residuo es peligroso por sus características: inflamable, corrosivo, reactivo, tóxico, ecotóxico o infeccioso.',
      'Se almacenan separados de los no peligrosos, en un almacén techado, señalizado, con piso impermeable y sistema de contención.',
      'Su transporte y disposición se hacen solo con empresas operadoras de residuos sólidos registradas, con manifiesto de residuos peligrosos.',
      'Los trapos, envases y filtros contaminados con aceites o químicos también son residuos peligrosos.',
      'Las condiciones exactas dependen del tipo de generador y del sector: confírmelas con la autoridad competente.',
    ],
    templateId: 'tpl-residuos',
  },
  derrames: {
    facts: [
      'La Ley 28611 obliga a adoptar medidas de prevención y de respuesta ante sucesos que puedan afectar el ambiente.',
      'Un plan de contingencia identifica qué puede derramarse, dónde, en qué cantidad y cómo se contiene.',
      'El kit antiderrames debe ser adecuado al producto (hidrocarburos, químicos) y estar a pocos metros del punto de riesgo.',
      'Las emergencias ambientales relevantes se reportan a la autoridad de fiscalización ambiental competente (OEFA o la sectorial) en los plazos de su reglamento.',
      'Los derrames también son escenarios del plan de emergencias de SST (D.S. 005-2012-TR, art. 83).',
    ],
    templateId: 'tpl-plan-emergencias',
    guideId: 'guia-emergencias',
  },
  quimicos: {
    facts: [
      'Cada producto debe tener su hoja de datos de seguridad (SDS) disponible para quien lo usa.',
      'La exposición de los trabajadores se compara con los valores límite permisibles del D.S. 015-2005-SA y los anexos de la R.M. 733-2024-MINSA.',
      'Los productos incompatibles (oxidantes con inflamables, ácidos con bases) se almacenan separados.',
      'Todo envase, incluido el trasvasado, debe estar rotulado con el nombre del producto y sus peligros.',
      'El almacenamiento de químicos es un peligro que debe figurar en la IPERC del área.',
    ],
  },
  consumo: {
    facts: [
      'Medir el consumo mensual de agua y energía es la base para cualquier meta de reducción.',
      'En el sector público existen medidas de ecoeficiencia obligatorias; verifique la norma vigente que aplica a su entidad.',
      'ISO 50001 (gestión de la energía) ofrece un método para establecer líneas base e indicadores de desempeño energético.',
      'Las fugas y los equipos ineficientes suelen explicar la mayor parte del consumo evitable.',
    ],
  },
  controles: {
    facts: [
      'La empresa principal responde por la SST de los contratistas en sus instalaciones (Ley 29783, arts. 68 y 103); el mismo criterio de control conviene aplicarlo a los requisitos ambientales.',
      'Los requisitos ambientales deben estar en el contrato: manejo de residuos, uso de químicos y respuesta ante derrames.',
      'La inducción de ingreso debe incluir las reglas ambientales del centro de trabajo.',
    ],
    guideId: 'guia-contratistas',
  },
  mejora: {
    facts: [
      'Sin registro no hay evidencia: archive manifiestos, registros de residuos, inspecciones y mediciones.',
      'Revise los resultados cada trimestre y ajuste los controles.',
      'Las auditorías internas (ISO 19011 como guía) ayudan a detectar brechas antes de una fiscalización ambiental.',
    ],
  },
}
