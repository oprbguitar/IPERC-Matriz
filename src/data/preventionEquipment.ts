/** Catálogo técnico de EPP e instrumentos. Los datos numéricos citan su norma o documento de origen. */
export interface EquipmentFact {
  label: string
  value: string
  source: string
}

export interface PreventionEquipment {
  id: string
  kind: 'epp' | 'instrumento'
  title: string
  purpose: string
  limits: string
  inspection: string
  replacement: string
  reference: string
  sourceUrl: string
  status: string
  /** Normas de referencia y qué establece cada una. */
  standards: EquipmentFact[]
  /** Criterios de selección o de uso correcto. */
  selection: string[]
  /** Datos exactos (valores, rangos, alarmas, factores). */
  facts: EquipmentFact[]
  /** Solo instrumentos: calibración, verificación y trazabilidad. */
  calibration?: EquipmentFact[]
}

const PPE_SOURCE = 'https://www.osha.gov/personal-protective-equipment'
const LAB_SOURCE = 'https://www.inacal.gob.pe/acreditacion'
export const HELMET_SOURCE = 'https://www.osha.gov/sites/default/files/publications/SAFETY_HELMET_SHIB.pdf'
export const HELMET_NTP_SOURCE = 'https://servicios.inacal.gob.pe/cidalerta/biblioteca-detalle.aspx?id=34740'

export const HELMET_COMPARISON = [
  { label: 'Tipo I', description: 'Impactos principalmente en la parte superior.' },
  { label: 'Tipo II', description: 'Impactos superiores y laterales.' },
  { label: 'Clase G', description: 'Ensayo eléctrico a 2 200 V.' },
  { label: 'Clase E', description: 'Ensayo eléctrico a 20 000 V.' },
  { label: 'Clase C', description: 'Sin protección eléctrica.' },
]

/** Nota común: la trazabilidad exigible a todo instrumento de medición. */
export const CALIBRATION_NOTE = 'Toda calibración debe ser trazable al SI: certificado vigente emitido por un laboratorio acreditado por INACAL (NTP-ISO/IEC 17025) o con trazabilidad reconocida a un instituto nacional de metrología. Verifique en el certificado: equipo y serie, magnitud y rango, resultados con incertidumbre, fecha y condiciones. La periodicidad la define su programa según uso, historial y criticidad; no es un valor universal.'

const f = (label: string, value: string, source: string): EquipmentFact => ({ label, value, source })
const FAB = 'Instrucciones del fabricante del modelo'

const ppe: PreventionEquipment[] = [
  {
    id: 'cabeza', kind: 'epp', title: 'Cascos y protección de cabeza',
    purpose: 'Casco industrial contra caída de objetos y golpes. La clase eléctrica y las prestaciones opcionales se eligen según la tarea.',
    limits: 'Las tensiones de ensayo no autorizan trabajar a esas tensiones. El color del casco no establece una función legal universal.',
    inspection: 'Antes de cada turno: carcasa sin fisuras, grietas ni deformación; arnés y cintas sin desgaste; ajuste de cremallera o rueda; marcado y fecha de fabricación legibles; accesorios solo los autorizados por el fabricante.',
    replacement: 'Retirar tras un impacto, aunque no se vea daño, o ante calcinación, resequedad, brillo perdido o fisuras. La vida útil la fija el fabricante desde la fecha de fabricación; los plazos de catálogo (arnés interior cada 12 meses, carcasa 3 a 5 años) varían según fabricante y no son requisito de la norma.',
    reference: 'ANSI/ISEA Z89.1 (tipo I y II; clases G, E y C) y EN 397. NTP 399.018:2022: ficha INACAL; no equivale automáticamente a ANSI.',
    sourceUrl: HELMET_SOURCE,
    status: 'Tipología contrastada con OSHA; referencia NTP contrastada en ficha INACAL. Aplicabilidad peruana por evaluar.',
    standards: [
      f('ANSI/ISEA Z89.1', 'Tipo I (impacto superior) y Tipo II (superior y lateral). Clase G ensayada a 2 200 V, clase E a 20 000 V y clase C sin protección eléctrica.', 'OSHA, boletín SHIB sobre cascos de seguridad'),
      f('EN 397', 'Casco industrial: absorción de impacto, penetración y resistencia a la llama. Opcionales: −20 °C o −30 °C, 440 V c.a., deformación lateral (LD) y metal fundido (MM).', 'EN 397 (CEN)'),
      f('EN 50365', 'Cascos aislantes para baja tensión: hasta 1 000 V c.a. o 1 500 V c.c.', 'EN 50365 (CENELEC)'),
      f('NTP 399.018:2022', 'Norma peruana de cascos; la ficha de INACAL la identifica como no obligatoria por sí misma.', 'Ficha INACAL'),
    ],
    selection: [
      'Tipo II si existe golpe lateral: espacios reducidos, cargas suspendidas, estructuras.',
      'Clase E o G (o EN 50365) cerca de conductores: es un respaldo, nunca autorización para trabajar energizado.',
      'Barbiquejo de cuatro puntos en altura, viento o inclinación del tronco.',
      'Casco sin ventilación para trabajos eléctricos; compatibilidad con orejeras, pantalla y linterna solo del mismo fabricante.',
    ],
    facts: [
      f('Clase G / E', '2 200 V / 20 000 V de ensayo dieléctrico (no de trabajo)', 'ANSI/ISEA Z89.1 vía OSHA'),
      f('EN 50365', '1 000 V c.a. / 1 500 V c.c.', 'EN 50365'),
    ],
  },
  {
    id: 'auditiva', kind: 'epp', title: 'Protección auditiva',
    purpose: 'Tapones y orejeras para reducir el nivel que llega al oído cuando no se logra controlar el ruido en la fuente.',
    limits: 'La atenuación declarada (NRR o SNR) se obtiene en laboratorio y sobreestima la real; verificar el ajuste individual. Evitar sobreprotección que impida oír alarmas o comunicarse.',
    inspection: 'Tapones: limpios, sin endurecimiento ni deformación, con inserción profunda y sello. Orejeras: almohadillas sin grietas, arco con tensión, copas sin fisuras. Verificar compatibilidad con casco y gafas.',
    replacement: 'Reemplazar tapones desechables tras cada uso o ensuciamiento y los reutilizables según fabricante; cambiar almohadillas rígidas o agrietadas (el fabricante indica la frecuencia). Retirar si no logra un ajuste adecuado.',
    reference: 'EN 352 (orejeras, tapones, orejeras sobre casco) con marcado SNR, H, M, L; rotulado NRR según ANSI/ASA S3.19 y EPA 40 CFR 211.',
    sourceUrl: 'https://www.osha.gov/noise',
    status: 'Fórmulas de OSHA y NIOSH contrastadas con sus documentos; referencia de producto y conformidad del modelo pendientes de cotejo.',
    standards: [
      f('EN 352-1/-2/-3', 'Requisitos de orejeras, tapones y orejeras acopladas a casco; marcado SNR y valores H, M, L por banda de frecuencia.', 'EN 352 (CEN)'),
      f('ANSI/ASA S3.19 y 40 CFR 211', 'Método de laboratorio y rotulado del NRR en dB (EE. UU.).', 'EPA 40 CFR Part 211, Subpart B'),
      f('ANSI/ASA S12.6', 'Método de ensayo con sujetos reales del ajuste y la atenuación del protector.', 'ANSI/ASA S12.6'),
      f('R.M. 375-2008-TR', 'Referencia nacional de 85 dB(A) para 8 h usada en este catálogo; revisar el texto oficial para el alcance.', 'R.M. 375-2008-TR'),
    ],
    selection: [
      'Objetivo de nivel efectivo bajo el protector: no más de 85 dB(A) y sin sobreprotección que aísle del entorno.',
      'Orejeras para ruido intermitente y uso corto; tapones para uso prolongado, calor o combinación con casco y gafas.',
      'Doble protección (tapón más orejera) cuando el nivel excede lo que un solo protector controla.',
      'Prueba de ajuste individual (por ejemplo, F-MIRE) en lugar de confiar en el valor de caja.',
    ],
    facts: [
      f('Corrección OSHA del NRR', 'Atenuación estimada = (NRR − 7) × 0,5 cuando el nivel se mide en dB(A). Ejemplo: NRR 25 en 95 dB(A) da 95 − 9 = 86 dB(A) en el oído.', 'OSHA, Technical Manual: Noise'),
      f('Reducción NIOSH del NRR', 'Orejeras 25 %; tapones moldeables 50 %; otros tapones 70 %.', 'NIOSH, Criteria for a Recommended Standard: Occupational Noise Exposure (1998)'),
      f('Referencias de exposición', 'NIOSH: 85 dB(A) en 8 h con intercambio de 3 dB. OSHA: 90 dB(A) en 8 h con intercambio de 5 dB.', 'NIOSH 1998; 29 CFR 1910.95'),
    ],
  },
  {
    id: 'ocular', kind: 'epp', title: 'Protección ocular y facial',
    purpose: 'Distinguir gafas, goggles y pantallas faciales según impacto, salpicaduras, polvo o radiación del proceso.',
    limits: 'La pantalla facial es protección complementaria: debe usarse sobre gafas, no en lugar de ellas, salvo que el fabricante lo permita. El filtro debe ser el del peligro: soldadura, láser y UV no son intercambiables.',
    inspection: 'Lentes sin rayaduras que afecten la visión, sin fisuras ni opacidad; patillas, banda y sellos íntegros; marcado visible; limpieza con el método del fabricante.',
    replacement: 'Retirar ante fisuras, pérdida de transparencia, deformación del marco o pérdida de ajuste. Los lentes con tratamiento antiempañante pierden efecto con la abrasión del limpiado.',
    reference: 'ANSI/ISEA Z87.1 (marca Z87+, D3, D4, D5) y EN 166 (clases de impacto F, B, A; campos de uso 3, 4, 5, 9).',
    sourceUrl: PPE_SOURCE,
    status: 'Marcado contrastado con las normas citadas; conformidad del modelo y edición vigente pendientes de cotejo, según referencia técnica.',
    standards: [
      f('ANSI/ISEA Z87.1', 'Z87 básico; Z87+ alto impacto. Salpicadura y gota D3, polvo grueso D4, polvo fino D5.', 'ANSI/ISEA Z87.1'),
      f('EN 166', 'Impacto: F 45 m/s, B 120 m/s, A 190 m/s. Campos de uso: 3 líquidos, 4 polvo grueso, 5 gas y polvo fino, 9 metal fundido y sólidos calientes.', 'EN 166 (CEN)'),
      f('EN 169 / EN 170 / EN 172', 'Filtros para soldadura, ultravioleta y radiación solar de uso industrial, con números de escala.', 'Normas CEN de filtros'),
    ],
    selection: [
      'Goggles con ventilación indirecta para salpicaduras líquidas; hermético para polvo fino y gases.',
      'Pantalla facial más gafas para esmerilado, corte y proyección de partículas.',
      'Número de escala del filtro según proceso de soldadura y corriente, indicado por el fabricante.',
      'Lente compatible con el respirador y el casco; ajuste que no deje espacios.',
    ],
    facts: [
      f('Energía de impacto EN 166', 'F: 45 m/s; B: 120 m/s; A: 190 m/s', 'EN 166'),
    ],
  },
  {
    id: 'respiratoria', kind: 'epp', title: 'Respiradores y filtros',
    purpose: 'Elegir el respirador a partir del contaminante, su concentración, el límite aplicable y el factor de protección asignado (FPA).',
    limits: 'Un filtro no protege frente a toda sustancia ni a atmósferas con deficiencia de oxígeno (menos de 19,5 %) o inmediatamente peligrosas para la vida (IDLH): allí se requiere aire suministrado. El vello facial impide el sello.',
    inspection: 'Antes de cada uso: sello, válvulas, correas, cartuchos y filtros íntegros; prueba de sello de presión positiva o negativa. Prueba de ajuste cuantitativa o cualitativa antes del primer uso y anualmente (29 CFR 1910.134).',
    replacement: 'Partículas: cambiar al aumentar la resistencia a respirar, daño o contaminación. Gases y vapores: programa de cambio con fecha basada en cálculo del fabricante o indicador de fin de vida; si el contaminante tiene mal olor de aviso insuficiente, no confiar en el olor.',
    reference: 'NIOSH 42 CFR Part 84 (N, R, P; 95, 99, 100); EN 149 (FFP1 a FFP3); EN 143 (filtros P1 a P3); EN 14387 (gas); factores de 29 CFR 1910.134.',
    sourceUrl: 'https://www.osha.gov/respiratory-protection',
    status: 'Cifras contrastadas con 29 CFR 1910.134, 42 CFR 84 y las normas EN citadas; aprobación del modelo y vigencia por cotejar en cada compra, referencia técnica.',
    standards: [
      f('NIOSH 42 CFR Part 84', 'Series N (sin aceite), R (resistente a aceite 8 h), P (a prueba de aceite). Eficiencia 95 %, 99 % o 99,97 % (serie 100).', '42 CFR Part 84'),
      f('EN 149', 'Mascarilla filtrante: FFP1 filtra ≥80 % con fuga total ≤22 %; FFP2 ≥94 % con ≤8 %; FFP3 ≥99 % con ≤2 %.', 'EN 149:2001+A1:2009'),
      f('EN 143', 'Filtros de partículas P1, P2 y P3 para respiradores reutilizables: ≥80 %, ≥94 % y ≥99,95 %.', 'EN 143'),
      f('EN 14387', 'Filtros de gas y vapor: A (orgánicos), B (inorgánicos), E (ácidos), K (amoníaco); clase de capacidad 1, 2 o 3.', 'EN 14387'),
      f('29 CFR 1910.134', 'Programa escrito, evaluación médica, prueba de ajuste anual, selección por FPA y cambio de cartuchos.', 'OSHA 29 CFR 1910.134'),
    ],
    selection: [
      'Concentración estimada ÷ límite = factor de peligro (HR); elegir un respirador cuyo FPA sea mayor que HR.',
      'FPA: media máscara 10; máscara completa 50; PAPR de máscara completa 1 000; SCBA de presión positiva 10 000.',
      'Cartucho por contaminante: confirmar con el fabricante, no por color.',
      'Color de cartuchos (tradicional ANSI/NIOSH): negro orgánicos, blanco ácidos, verde amoníaco, amarillo orgánicos y ácidos, magenta partículas P100. En EN 14387: marrón A, gris B, amarillo E, verde K, blanco P. Los colores difieren entre sistemas.',
    ],
    facts: [
      f('FPA media máscara / completa', '10 / 50', '29 CFR 1910.134, Tabla 1'),
      f('FPA PAPR completa / SCBA', '1 000 / 10 000', '29 CFR 1910.134, Tabla 1'),
      f('Deficiencia de oxígeno', 'Menos de 19,5 % de O₂ en volumen', '29 CFR 1910.134(b)'),
      f('Prueba de ajuste', 'Antes del primer uso y al menos una vez al año', '29 CFR 1910.134(f)'),
    ],
  },
  {
    id: 'manos', kind: 'epp', title: 'Guantes y protección de manos',
    purpose: 'Seleccionar el guante por peligro: corte, abrasión, químicos, calor, frío o electricidad, con su nivel de prestación.',
    limits: 'Ningún material protege contra todos los químicos; el tiempo de permeación depende de la sustancia y de la temperatura. Un guante resistente al corte puede enganchar en máquinas rotativas.',
    inspection: 'Inflar o mirar a contraluz en busca de perforaciones; fisuras, endurecimiento, hinchazón por contacto con el agente, costuras abiertas; talla y limpieza.',
    replacement: 'Cambiar ante desgaste, perforación, contaminación interior o al superar el tiempo de uso derivado de la permeación; para químicos, retirar el guante antes de la ruptura calculada y no reutilizarlo sin aval del fabricante.',
    reference: 'EN 388:2016+A1:2018 (mecánico), EN ISO 374-1:2016 (químico), ANSI/ISEA 105 (corte A1 a A9), EN 407 (calor), EN 511 (frío).',
    sourceUrl: PPE_SOURCE,
    status: 'Niveles contrastados con las normas citadas; conformidad del producto y edición vigente pendientes de cotejo, según referencia técnica.',
    standards: [
      f('EN 388:2016+A1:2018', 'Cuatro cifras: abrasión 0–4, corte por cuchilla 0–5, desgarro 0–4, perforación 0–4. Letra de corte ISO 13997 de A a F; P indica protección contra impacto.', 'EN 388'),
      f('EN ISO 374-1:2016', 'Tipo A: ≥30 min frente a 6 químicos de la lista; tipo B: 3 químicos; tipo C: 1 químico (≥10 min).', 'EN ISO 374-1'),
      f('ANSI/ISEA 105', 'Niveles de corte A1 a A9 (ASTM F2992).', 'ANSI/ISEA 105'),
      f('EN 407 / EN 511', 'Riesgos térmicos (calor, llama, contacto) y frío convectivo, de contacto e impermeabilidad.', 'EN 407, EN 511'),
    ],
    selection: [
      'Identificar el químico por su FDS y comparar con los datos de permeación del fabricante del guante.',
      'Corte alto: niveles C a F (EN 388) o A4 a A9 (ANSI) según tarea.',
      'Evitar guantes sueltos cerca de partes rotativas.',
      'Doble guante cuando lo permita la destreza requerida.',
    ],
    facts: [
      f('Permeación mínima tipo A', '30 minutos frente a 6 químicos de la lista', 'EN ISO 374-1:2016'),
      f('Niveles de corte', 'EN 388: A–F; ANSI/ISEA 105: A1–A9', 'EN 388; ANSI/ISEA 105'),
    ],
  },
  {
    id: 'pies', kind: 'epp', title: 'Calzado de seguridad',
    purpose: 'Seleccionar protección frente a impacto en los dedos, compresión, perforación, deslizamiento y condiciones del piso.',
    limits: 'No atribuir aislamiento eléctrico ni resistencia química a un calzado sin su marcado y evidencia específica. Las punteras no metálicas y metálicas difieren en peso, conducción térmica y detección.',
    inspection: 'Suela y dibujo con desgaste, despegues, puntera visible por rotura del cuero, plantilla, costuras, cordones; limpieza que no degrade el material.',
    replacement: 'Retirar si la puntera se deformó por un impacto o aplastamiento, si hay perforación o si el dibujo de la suela perdió adherencia. El fabricante indica la vida útil; el desgaste manda.',
    reference: 'ISO 20345 (S1 a S3, SB), ASTM F2413 (I/75, C/75, EH, PR), clasificaciones SRA, SRB y SRC de deslizamiento.',
    sourceUrl: PPE_SOURCE,
    status: 'Energías de ensayo contrastadas con las normas citadas; marcado del modelo y edición vigente pendientes de cotejo, referencia técnica.',
    standards: [
      f('EN ISO 20345', 'Puntera 200 J de impacto y 15 kN de compresión. SB básico; S1 antiestático y absorción de energía en talón; S2 más resistencia a penetración de agua; S3 más plantilla antiperforación y suela con tacos.', 'EN ISO 20345'),
      f('ASTM F2413', 'Marcado I/75 y C/75 (impacto y compresión), EH (riesgo eléctrico), PR (perforación), Mt (metatarso).', 'ASTM F2413'),
      f('EH', 'Aislamiento limitado en condiciones secas: ensayo a 18 000 V, 60 Hz, 1 min; corriente de fuga ≤1,0 mA.', 'ASTM F2413'),
      f('SRA / SRB / SRC', 'Resistencia al deslizamiento sobre cerámica con detergente (A), acero con glicerina (B) o ambos (C).', 'EN ISO 20345'),
    ],
    selection: [
      'Piso mojado o con grasa: SRC; contacto con calor: HRO (300 °C); frío: CI.',
      'Trabajo eléctrico: EH solo como respaldo; no sustituye a las reglas de aislamiento.',
      'Metatarso (Mt) en trabajos de caída de piezas pesadas sobre el empeine.',
      'Talla en la tarde y con la media de trabajo.',
    ],
    facts: [
      f('Puntera ISO 20345', '200 J de impacto y 15 kN de compresión', 'EN ISO 20345'),
      f('ASTM F2413 EH', '18 000 V, 60 Hz, 1 min; fuga ≤1,0 mA', 'ASTM F2413'),
    ],
  },
  {
    id: 'ropa', kind: 'epp', title: 'Ropa de protección',
    purpose: 'Elegir prendas para calor y llama, arco eléctrico, químicos, alta visibilidad o radiación UV según el peligro identificado.',
    limits: 'Una prenda ensayada para un peligro no demuestra protección frente a otro. El comportamiento del conjunto depende de costuras, cierres, ajuste y de la ropa interior, que no debe fundirse.',
    inspection: 'Roturas, quemaduras, desgaste de costuras y cierres, pérdida de bandas reflectantes, contaminación; lavado autorizado y registro de ciclos cuando el fabricante lo limite.',
    replacement: 'Retirar por daño o contaminación que afecte la protección, o al exceder los ciclos de lavado del fabricante. Tras un evento de arco, la prenda se retira.',
    reference: 'EN ISO 11612 (calor), IEC 61482-2 y NFPA 70E (arco), EN ISO 20471 (alta visibilidad), EN 14605 y EN 13034 (químicos), UPF 50+ (UV).',
    sourceUrl: PPE_SOURCE,
    status: 'Cifras contrastadas con NFPA 70E y las normas citadas; certificación del producto y edición pendientes de cotejo, según referencia técnica.',
    standards: [
      f('NFPA 70E', 'Categorías de EPP por arco con mínimo de 4, 8, 25 y 40 cal/cm² de capacidad de arco.', 'NFPA 70E'),
      f('IEC 61482-1-2 / EN 61482-2', 'Ensayo de arco en caja con clase 1 (4 kA) y clase 2 (7 kA).', 'IEC 61482-1-2'),
      f('EN ISO 11612', 'Calor y llama con códigos A1/A2, B, C, D, E y F.', 'EN ISO 11612'),
      f('EN 14605 / EN 13034', 'Ropa química tipos 3 y 4 (líquidos) y tipo 6 (salpicaduras limitadas). Tipo 5 para partículas (EN ISO 13982-1).', 'Normas CEN de ropa química'),
      f('EN ISO 20471', 'Alta visibilidad por clases 1 a 3 según áreas de material fluorescente y reflectante.', 'EN ISO 20471'),
    ],
    selection: [
      'Calcular energía incidente del arco y elegir la prenda con capacidad igual o mayor.',
      'Tejidos de fibra natural o inherentemente ignífugos; evitar poliéster y nailon en capas internas.',
      'Ropa química: confirmar permeación frente al agente específico.',
      'Trabajo al sol: UPF 50+ y cobertura de brazos y cuello.',
    ],
    facts: [
      f('Categorías de arco', '4, 8, 25 y 40 cal/cm²', 'NFPA 70E'),
      f('Clases de arco IEC 61482-1-2', 'Clase 1: 4 kA; clase 2: 7 kA', 'IEC 61482-1-2'),
    ],
  },
  {
    id: 'caidas', kind: 'epp', title: 'Equipos contra caídas',
    purpose: 'Integrar arnés, conector, absorbedor o línea retráctil, anclaje y plan de rescate como un sistema calculado para la tarea.',
    limits: 'El arnés aislado no es un sistema completo ni reemplaza la protección colectiva del borde. Sin distancia libre suficiente, el sistema no detiene la caída. Hay que prever el rescate: la suspensión inerte es peligrosa.',
    inspection: 'Antes de cada uso: cintas (cortes, quemaduras, decoloración), costuras, hebillas, argollas, mosquetones con cierre automático, absorbedor sin activar; inspección formal periódica por persona competente con registro.',
    replacement: 'Retirar de inmediato tras una caída o carga de detención, o ante daño; seguir los criterios de retiro y la vida útil del fabricante. No reparar costuras en campo.',
    reference: 'EN 361, EN 355, EN 362, EN 795, ANSI/ASSP Z359.11, 29 CFR 1926.502(d). G.050 y D.S. 011-2019-TR en construcción.',
    sourceUrl: 'https://www.osha.gov/fall-protection',
    status: 'Límites de fuerza y caída libre contrastados con OSHA y EN 355; anclajes y sector peruano por validar con el texto vigente, referencia técnica.',
    standards: [
      f('29 CFR 1926.502(d)', 'Fuerza máxima de detención 8 kN (1 800 lb) con arnés; caída libre máxima 1,8 m (6 pies); desaceleración máxima 1,07 m (3,5 pies); anclaje de 22,2 kN (5 000 lb) por persona.', 'OSHA 29 CFR 1926.502'),
      f('EN 355', 'Absorbedores de energía: fuerza máxima de detención 6 kN.', 'EN 355'),
      f('EN 361 / EN 362 / EN 795', 'Arneses anticaída, conectores y dispositivos de anclaje.', 'Normas CEN'),
      f('ANSI/ASSP Z359', 'Sistema completo, programa de protección y rescate.', 'ANSI/ASSP Z359'),
    ],
    selection: [
      'Prioridad: eliminar el trabajo en altura o proteger el borde antes de usar un sistema personal.',
      'Anclaje por encima del dorsal para limitar la caída libre.',
      'Distancia libre requerida = caída libre + desaceleración del absorbedor + estiramiento del arnés + margen del fabricante. Calcúlela contra el nivel inferior.',
      'Plan de rescate probado: el tiempo en suspensión debe ser mínimo.',
    ],
    facts: [
      f('Caída libre máxima', '1,8 m (6 pies)', '29 CFR 1926.502(d)'),
      f('Fuerza máxima de detención', '8 kN con arnés (OSHA); 6 kN (EN 355)', '29 CFR 1926.502; EN 355'),
      f('Anclaje', '22,2 kN (5 000 lb) por persona', '29 CFR 1926.502(d)'),
    ],
  },
  {
    id: 'electrica', kind: 'epp', title: 'Protección eléctrica',
    purpose: 'Seleccionar guantes aislantes, protectores de cuero, ropa y pantalla para contacto o arco eléctrico evaluado.',
    limits: 'La protección contra choque y contra arco son prestaciones distintas; el EPP no reemplaza el bloqueo ni la ausencia de tensión. El guante se usa con su protector de cuero.',
    inspection: 'Antes de cada uso: prueba de aire (inflado) y examen visual; protector de cuero; fecha del último ensayo dieléctrico y marcado de clase.',
    replacement: 'Retirar ante corte, perforación, ozono, aceites o fuera de la fecha de reensayo. Ensayo dieléctrico periódico: guantes en servicio cada 6 meses y almacenados cada 12 meses.',
    reference: 'ASTM D120 / IEC 60903 (guantes aislantes), ASTM F496 (cuidado), 29 CFR 1910.137, NFPA 70E.',
    sourceUrl: 'https://www.osha.gov/electrical',
    status: 'Clases y plazos contrastados con ASTM D120 y OSHA; ensayo y ficha del producto pendientes de cotejo, según referencia técnica.',
    standards: [
      f('ASTM D120', 'Clases de guantes aislantes por tensión máxima de uso en c.a.: 00 (500 V), 0 (1 000 V), 1 (7 500 V), 2 (17 000 V), 3 (26 500 V), 4 (36 000 V).', 'ASTM D120'),
      f('IEC 60903', 'Guantes y manoplas aislantes; clases 00 a 4 equivalentes.', 'IEC 60903'),
      f('29 CFR 1910.137', 'Ensayos eléctricos periódicos del equipo aislante de hule.', 'OSHA 29 CFR 1910.137'),
      f('NFPA 70E', 'Categorías de arco y selección de EPP por tarea.', 'NFPA 70E'),
    ],
    selection: [
      'Clase del guante con tensión máxima de uso igual o superior a la del circuito.',
      'Guante más protector de cuero; en arco, ropa y pantalla con capacidad en cal/cm².',
      'Nunca usar guantes de uso general como aislantes.',
      'Verificar ausencia de tensión con instrumento adecuado antes de tocar.',
    ],
    facts: [
      f('Tensión de ensayo c.a. (prueba)', 'Clase 00: 2 500 V; 0: 5 000 V; 1: 10 000 V; 2: 20 000 V; 3: 30 000 V; 4: 40 000 V', 'ASTM D120'),
      f('Reensayo', 'En servicio cada 6 meses; almacenados cada 12 meses', '29 CFR 1910.137'),
    ],
  },
  {
    id: 'biologica', kind: 'epp', title: 'Protección biológica y sanitaria',
    purpose: 'Elegir barreras para contacto, salpicaduras o aerosoles: guantes, mascarillas, batas, protección ocular y respiradores.',
    limits: 'Una mascarilla quirúrgica protege al entorno de quien la usa; no es un respirador. No asumir que todo equipo sanitario protege frente a agentes químicos o frente a todos los agentes biológicos.',
    inspection: 'Integridad, talla, colocación y retiro con técnica que evite autocontaminación; contenedor de punzocortantes en el punto de uso, con nivel de llenado.',
    replacement: 'Desechar tras cada paciente o tarea según protocolo; los reutilizables solo con proceso de reprocesamiento validado. Contenedor de punzocortantes: no llenar más allá de la línea.',
    reference: 'EN 14683 (mascarillas), ASTM F2100, EN ISO 374-5 (microorganismos), EN 14126 (ropa para agentes infecciosos), AAMI PB70.',
    sourceUrl: PPE_SOURCE,
    status: 'Eficiencias contrastadas con EN 14683 y las normas citadas; protocolo del establecimiento y vigencia pendientes de cotejo, referencia técnica.',
    standards: [
      f('EN 14683', 'Mascarillas quirúrgicas: tipo I (filtración bacteriana ≥95 %), tipo II (≥98 %), tipo IIR (≥98 % y resistencia a salpicaduras de 16 kPa).', 'EN 14683'),
      f('EN 149 FFP2 / 42 CFR 84 N95', 'Respiradores filtrantes de partículas, con prueba de ajuste.', 'EN 149; 42 CFR 84'),
      f('EN ISO 374-5', 'Guantes frente a bacterias y hongos (y virus si se marca VIRUS).', 'EN ISO 374-5'),
      f('EN 14126', 'Ropa de protección contra agentes infecciosos.', 'EN 14126'),
    ],
    selection: [
      'Vía de transmisión: contacto, gotas o aerosoles definen guantes, mascarilla o respirador.',
      'Punzocortantes: dispositivos con seguridad integrada y contenedor rígido en el punto de uso.',
      'Protección ocular junto a la mascarilla en riesgo de salpicadura.',
      'Higiene de manos antes y después; el guante no la reemplaza.',
    ],
    facts: [
      f('Mascarilla IIR', 'Filtración ≥98 % y salpicadura 16 kPa', 'EN 14683'),
    ],
  },
]

const instruments: PreventionEquipment[] = [
  {
    id: 'sonometro', kind: 'instrumento', title: 'Sonómetro integrador',
    purpose: 'Medir niveles de presión sonora con ponderación A o C e integración (Leq) para caracterizar el ruido.',
    limits: 'Una lectura puntual no describe la jornada; use medición por tarea o dosimetría. Para ruido impulsivo se requiere medir el pico en C.',
    inspection: 'Micrófono sin golpes ni humedad, pantalla de viento, batería, configuración (ponderación, respuesta lenta o rápida, rango) y verificación acústica antes y después de la serie de medidas.',
    replacement: 'Retirar de servicio ante daño en el micrófono, deriva persistente o falla de verificación; reparar y calibrar en laboratorio antes de reutilizar.',
    reference: 'IEC 61672-1 (clases 1 y 2); verificación con calibrador acústico IEC 60942; R.M. 375-2008-TR: 85 dB(A) en 8 h.',
    sourceUrl: LAB_SOURCE,
    status: 'Datos contrastados con IEC 61672, IEC 60942 y R.M. 375-2008-TR; clase y edición del modelo pendientes de cotejo, referencia técnica.',
    standards: [
      f('IEC 61672-1', 'Sonómetros clase 1 (referencia, mayor rango de frecuencia) y clase 2 (uso general), con tolerancias distintas.', 'IEC 61672-1'),
      f('IEC 61672-3', 'Ensayos periódicos de verificación en laboratorio.', 'IEC 61672-3'),
      f('R.M. 375-2008-TR', 'Referencia nacional: 85 dB(A) en 8 h.', 'R.M. 375-2008-TR'),
      f('ISO 9612', 'Método de medición de la exposición a ruido laboral.', 'ISO 9612'),
    ],
    selection: [
      'Clase 1 para evaluaciones de referencia o discutibles; clase 2 para tamizaje.',
      'Ponderación A para exposición; C para pico y ruido impulsivo.',
      'Posición del micrófono a la altura del oído, sin el cuerpo interponiéndose.',
    ],
    facts: [
      f('Exposición de referencia', '85 dB(A) en 8 h, intercambio de 3 dB', 'R.M. 375-2008-TR'),
    ],
    calibration: [
      f('Verificación de campo', 'Calibrador acústico a 94 dB o 114 dB y 1 kHz, antes y después de cada serie de mediciones. Registrar la lectura y la desviación.', 'IEC 60942'),
      f('Calibración en laboratorio', 'Del sonómetro completo y del calibrador, con certificado trazable.', 'IEC 61672-3; INACAL'),
      f('Corrección', 'Aplicar presión barométrica y temperatura según el manual del calibrador.', FAB),
    ],
  },
  {
    id: 'dosimetro', kind: 'instrumento', title: 'Dosímetro personal de ruido',
    purpose: 'Registrar la exposición individual durante un periodo representativo y expresarla como dosis y nivel equivalente de 8 h.',
    limits: 'El resultado depende de la posición del micrófono, la duración, el umbral y el criterio configurado. No mezclar configuraciones OSHA (90/5) con NIOSH (85/3).',
    inspection: 'Micrófono en el hombro, a unos 10 cm del oído, cable fijo, batería, memoria y configuración registrada; verificación antes y después con calibrador.',
    replacement: 'Reparar o recalibrar ante deriva. El uso de la configuración equivocada invalida la medición; descartar.',
    reference: 'IEC 61252 (medidores personales de exposición sonora); calibrador IEC 60942; R.M. 375-2008-TR.',
    sourceUrl: LAB_SOURCE,
    status: 'Configuración NIOSH contrastada con el documento de criterios; modelo y edición pendientes de cotejo, referencia técnica.',
    standards: [
      f('IEC 61252', 'Requisitos de medidores personales de exposición sonora.', 'IEC 61252'),
      f('NIOSH 1998', 'Criterio 85 dB(A), intercambio 3 dB, umbral 80 dB(A), respuesta lenta, ponderación A.', 'NIOSH 98-126'),
      f('29 CFR 1910.95', 'Criterio 90 dB(A), intercambio 5 dB, umbral 80 dB(A) para el cumplimiento OSHA.', 'OSHA 29 CFR 1910.95'),
    ],
    selection: [
      'Configurar criterio 85 dB(A) y 3 dB para comparar con la referencia peruana.',
      'Muestrear toda la jornada o tareas representativas; anotar actividades.',
      'Pico: 140 dB como referencia de ruido impulsivo.',
    ],
    facts: [
      f('Dosis', 'D(%) = 100 × Σ(C ÷ T). 100 % equivale a 85 dB(A) durante 8 h', 'NIOSH 98-126'),
      f('Nivel de 8 h', 'LAeq,8h = 85 + 10 log₁₀(D ÷ 100)', 'NIOSH 98-126'),
      f('Pico', '140 dB como referencia para ruido impulsivo', 'NIOSH; OSHA 1910.95'),
    ],
    calibration: [
      f('Verificación', 'Con calibrador a 94 dB o 114 dB y 1 kHz antes y después de cada jornada medida.', 'IEC 60942'),
      f('Descarte', 'Si la desviación supera el criterio de su método (habitualmente ±1 dB; confirmar), la medición no es válida.', 'Método aplicado; confirmar'),
    ],
  },
  {
    id: 'calibrador', kind: 'instrumento', title: 'Calibrador acústico',
    purpose: 'Generar una señal conocida para verificar la sensibilidad de un sistema de medición acústica.',
    limits: 'La verificación de campo no sustituye la calibración trazable del sistema completo. El calibrador debe ser compatible con el micrófono y adaptador.',
    inspection: 'Adaptador correcto, cavidad limpia, batería, indicador de estabilidad, certificado vigente.',
    replacement: 'Retirar ante desviaciones o daño y calibrar en laboratorio.',
    reference: 'IEC 60942 (clases LS, 1 y 2): señal habitual de 94 dB o 114 dB a 1 kHz.',
    sourceUrl: LAB_SOURCE,
    status: 'Niveles de referencia contrastados con IEC 60942; clase y compatibilidad pendientes de cotejo, referencia técnica.',
    standards: [
      f('IEC 60942', 'Calibradores acústicos clases LS, 1 y 2.', 'IEC 60942'),
    ],
    selection: [
      'Clase igual o mejor que la del instrumento que verifica.',
      'Nivel 94 dB (1 Pa) para sistemas normales y 114 dB para ambientes ruidosos.',
    ],
    facts: [
      f('Señales', '94 dB (1 Pa) y 114 dB (10 Pa) a 1 kHz', 'IEC 60942'),
    ],
    calibration: [
      f('Calibración', 'Certificado trazable del propio calibrador; periodicidad según su programa.', 'INACAL'),
    ],
  },
  {
    id: 'luxometro', kind: 'instrumento', title: 'Luxómetro',
    purpose: 'Medir iluminancia en el plano de trabajo con un protocolo de puntos para evaluar el cumplimiento por tarea.',
    limits: 'Una cifra aislada no evalúa uniformidad, deslumbramiento ni reproducción cromática. El sensor debe tener corrección coseno y respuesta espectral V(λ).',
    inspection: 'Sensor limpio, orientación horizontal en el plano de trabajo, sin sombra del operador, lámparas estabilizadas, cuadrícula de puntos.',
    replacement: 'Revisar por daño o deriva; recalibrar. Las lámparas de descarga requieren tiempo de estabilización antes de medir.',
    reference: 'DIN 5032-7 e ISO/CIE 19476 (clases del fotómetro); niveles por tarea en EN 12464-1 e ISO 8995-1.',
    sourceUrl: LAB_SOURCE,
    status: 'Referencias normativas citadas; tabla peruana aplicable por confirmar, referencia técnica.',
    standards: [
      f('DIN 5032-7 / ISO/CIE 19476', 'Clasificación de luxómetros por calidad: respuesta espectral y corrección coseno.', 'DIN 5032-7; ISO/CIE 19476'),
      f('EN 12464-1 / ISO 8995-1', 'Iluminancia mantenida por tarea: oficina 500 lx; pasillos 100 lx; dibujo técnico 750 lx; trabajo de precisión 1 000 lx. Confirmar la tabla peruana aplicable (RNE EM.010 o reglamento sectorial).', 'EN 12464-1; ISO 8995-1'),
    ],
    selection: [
      'Equipo de clase adecuada al propósito.',
      'Medir en la cuadrícula del plano de trabajo.',
    ],
    facts: [
      f('Oficina (lectura, escritura)', '500 lx', 'EN 12464-1'),
      f('Pasillos', '100 lx', 'EN 12464-1'),
    ],
    calibration: [
      f('Calibración', 'Calibración anual trazable (INACAL) es la práctica habitual; no es un valor fijado por la norma.', 'Práctica habitual; INACAL'),
      f('Comprobación', 'Revisar el cero con el sensor cubierto y comparar con un luxómetro patrón del programa.', FAB),
    ],
  },
  {
    id: 'termohigrometro', kind: 'instrumento', title: 'Termohigrómetro',
    purpose: 'Registrar temperatura y humedad relativa para caracterizar el ambiente en un estudio.',
    limits: 'No existe un porcentaje universal obligatorio para cualquier actividad; no sustituye un análisis de estrés térmico.',
    inspection: 'Sensor estabilizado, sin radiación directa, ubicación representativa, rango adecuado y certificado vigente.',
    replacement: 'Revisar sensores degradados o inconsistentes y recalibrar.',
    reference: 'ISO 7726 (instrumentos para medir magnitudes físicas del ambiente).',
    sourceUrl: LAB_SOURCE,
    status: 'Referencia ISO 7726 citada; parámetros aplicables por confirmar, referencia técnica.',
    standards: [
      f('ISO 7726', 'Instrumentos y métodos para medir temperatura, humedad y velocidad del aire.', 'ISO 7726'),
    ],
    selection: ['Proteger el sensor de la radiación y esperar la estabilización.'],
    facts: [
      f('Humedad de referencia a 25 °C', 'Sales saturadas: LiCl ≈11 %, MgCl₂ ≈33 %, NaCl ≈75 %', 'OIML R 121'),
    ],
    calibration: [
      f('Calibración', 'En puntos de temperatura y de humedad con patrones trazables; el certificado informa corrección e incertidumbre por punto.', 'ISO 7726; INACAL'),
    ],
  },
  {
    id: 'detector-gases', kind: 'instrumento', title: 'Detector de gases (multigás)',
    purpose: 'Medir oxígeno, inflamabilidad (% LEL), H₂S y CO en espacios confinados y trabajos con atmósferas peligrosas.',
    limits: 'No detecta sustancias ajenas a sus sensores; considerar interferencias, envenenamiento por silicona y saturación. El sensor catalítico requiere oxígeno.',
    inspection: 'Prueba funcional (bump test) antes de cada día de uso con gas, batería, filtro y alarmas; calibración completa si falla o según el fabricante.',
    replacement: 'Sustituir sensores o retirar el equipo si no pasa la prueba funcional o la calibración.',
    reference: 'ISEA, declaración sobre verificación de detectores portátiles; IEC 60079-29-1 y 29-2; OSHA 29 CFR 1910.146.',
    sourceUrl: LAB_SOURCE,
    status: 'Alarmas y gases según prácticas habituales y OSHA 1910.146; parámetros del equipo según fabricante, referencia técnica.',
    standards: [
      f('ISEA', 'Prueba funcional (bump test) antes de cada uso diario; calibración completa si falla.', 'ISEA, declaración vigente'),
      f('IEC 60079-29-1/-2', 'Desempeño y selección de detectores de gas inflamable.', 'IEC 60079-29'),
      f('29 CFR 1910.146', 'Atmósfera deficiente en O₂ <19,5 %; enriquecida >23,5 %.', 'OSHA 29 CFR 1910.146'),
    ],
    selection: [
      'Orden de lectura en espacios confinados: oxígeno, combustibles y luego tóxicos.',
      'Muestrear a varios niveles; usar bomba con sonda si es remoto.',
    ],
    facts: [
      f('Alarmas típicas O₂', '19,5 % bajo / 23,5 % alto', '29 CFR 1910.146'),
      f('Alarmas típicas H₂S', '10 ppm baja / 15 ppm alta', 'Ajuste habitual de fabricantes'),
      f('Alarmas típicas CO', '25 ppm baja / 35 ppm alta', 'Ajuste habitual de fabricantes'),
      f('Alarmas típicas LEL', '10 % baja / 20 % alta', 'Ajuste habitual de fabricantes'),
      f('Gas patrón de calibración', '50 % LEL metano, 25 ppm H₂S, 100 ppm CO, 18 % O₂', 'Mezclas habituales de fabricantes'),
      f('IDLH', 'H₂S 100 ppm; CO 1 200 ppm', 'NIOSH'),
    ],
    calibration: [
      f('Prueba funcional', 'Exponer a gas patrón antes de cada día de uso y comprobar que alarma y lectura responden.', 'ISEA'),
      f('Calibración con gas', 'Con mezcla certificada del fabricante, con trazabilidad y vigencia.', FAB),
    ],
  },
  {
    id: 'multimetro', kind: 'instrumento', title: 'Multímetro de seguridad',
    purpose: 'Medir magnitudes eléctricas con categoría de medición adecuada a la instalación.',
    limits: 'Elegir categoría y tensión; no autoriza intervenir instalaciones energizadas.',
    inspection: 'Puntas, aislamiento, fusibles, categoría marcada; comprobación en una fuente conocida antes y después de medir.',
    replacement: 'Retirar por daño en el aislamiento o lectura anómala.',
    reference: 'IEC 61010-1 y IEC 61010-2-033: categorías CAT II, III y IV.',
    sourceUrl: LAB_SOURCE,
    status: 'Categorías contrastadas con IEC 61010; modelo y edición pendientes de cotejo, referencia técnica.',
    standards: [
      f('IEC 61010-1', 'Categorías de sobretensión: CAT II receptáculos; CAT III distribución; CAT IV origen de la instalación.', 'IEC 61010-1'),
    ],
    selection: [
      'CAT III 600 V o 1 000 V para tableros; CAT IV para acometida.',
      'Puntas con protección y fusibles de alta capacidad.',
    ],
    facts: [
      f('Soporte a transitorios', 'CAT III 600 V: 6 kV; CAT III 1 000 V: 8 kV; CAT IV 600 V: 8 kV', 'IEC 61010-1'),
    ],
    calibration: [
      f('Calibración', 'Con patrón eléctrico trazable; verificación del equipo en fuente conocida.', 'INACAL'),
    ],
  },
  {
    id: 'wbgt', kind: 'instrumento', title: 'Medidor de estrés térmico (WBGT)',
    purpose: 'Calcular el índice WBGT con bulbo húmedo natural, globo y temperatura del aire.',
    limits: 'El índice requiere interpretar carga de trabajo, ropa, aclimatación y duración; no es diagnóstico médico.',
    inspection: 'Mecha limpia con agua destilada, globo negro, sensores estabilizados, altura de medición correcta.',
    replacement: 'Cambiar la mecha periódicamente y revisar sensores dañados.',
    reference: 'ISO 7243 (WBGT) e ISO 7726.',
    sourceUrl: LAB_SOURCE,
    status: 'Fórmulas contrastadas con ISO 7243; límites aplicables por confirmar según sector, referencia técnica.',
    standards: [
      f('ISO 7243', 'Índice WBGT para evaluar estrés térmico.', 'ISO 7243'),
    ],
    selection: ['Medir en el lugar y a las alturas de cabeza, abdomen y tobillos.'],
    facts: [
      f('WBGT interior o sin sol', '0,7 Tnw + 0,3 Tg', 'ISO 7243'),
      f('WBGT exterior con sol', '0,7 Tnw + 0,2 Tg + 0,1 Ta', 'ISO 7243'),
      f('Alturas', 'De pie: 0,1, 1,1 y 1,7 m; sentado: 0,1, 0,6 y 1,1 m', 'ISO 7726'),
    ],
    calibration: [
      f('Calibración', 'Sensores con certificado trazable.', 'INACAL'),
    ],
  },
  {
    id: 'vibraciones', kind: 'instrumento', title: 'Medidor de vibraciones',
    purpose: 'Medir aceleración mano-brazo o de cuerpo entero con ponderación en frecuencia y expresarla como exposición A(8) en m/s².',
    limits: 'El resultado depende del acoplamiento del acelerómetro y del tiempo de exposición real; la cifra del fabricante de la herramienta no sustituye la medición en el puesto.',
    inspection: 'Acelerómetro triaxial bien fijado (adaptador en la empuñadura o asiento), cable sin daño, rango sin saturación y verificación con calibrador antes y después de la serie.',
    replacement: 'Retirar si el acelerómetro recibió golpes o si la verificación se desvía; recalibrar en laboratorio.',
    reference: 'ISO 8041 y ISO 5349-1.',
    sourceUrl: LAB_SOURCE,
    status: 'Referencias citadas; límites peruanos por confirmar, referencia técnica.',
    standards: [
      f('ISO 8041-1', 'Instrumentos de medición de respuesta humana a vibración: ponderaciones, rangos y tolerancias.', 'ISO 8041-1'),
      f('ISO 5349-1 / -2', 'Medición y evaluación de la vibración mano-brazo (ponderación Wh) y guía práctica de medición.', 'ISO 5349'),
      f('ISO 2631-1', 'Vibración de cuerpo entero (ponderaciones Wk y Wd).', 'ISO 2631-1'),
    ],
    selection: [
      'Medir en tres ejes y combinar el vector suma; para mano-brazo, cerca de la empuñadura.',
      'Registrar el tiempo real de contacto con la herramienta, no solo la jornada.',
      'Acelerómetro con rango y masa adecuados para no alterar la medición.',
    ],
    facts: [
      f('Mano-brazo, Directiva 2002/44/CE', 'Valor de acción 2,5 m/s²; límite 5 m/s² (A(8))', 'Directiva 2002/44/CE'),
      f('Cuerpo entero, Directiva 2002/44/CE', 'Valor de acción 0,5 m/s²; límite 1,15 m/s² (A(8))', 'Directiva 2002/44/CE'),
      f('Aplicación en Perú', 'Referencia técnica extranjera; el valor exigible lo fija la norma sectorial aplicable.', 'Confirmar en el reglamento sectorial'),
    ],
    calibration: [
      f('Verificación de campo', 'Calibrador de vibración portátil, típicamente 10 m/s² a 159,2 Hz (ω = 1 000 rad/s).', 'Manuales de calibradores comerciales; ISO 16063'),
      f('Calibración en laboratorio', 'Cadena completa (acelerómetro, cable y analizador) con certificado trazable.', 'ISO 16063; INACAL'),
    ],
  },
  {
    id: 'bomba', kind: 'instrumento', title: 'Bomba de muestreo personal',
    purpose: 'Captar aire a flujo controlado a través de un filtro, tubo adsorbente o ciclón para cuantificar polvo y contaminantes químicos.',
    limits: 'El flujo debe calibrarse con el tren de muestreo completo y el medio de captación en línea; si cambia, la concentración calculada pierde validez.',
    inspection: 'Batería cargada, mangueras sin pliegues ni fugas, medio de captación correcto, flujo medido antes y después de cada muestra y registro del tiempo.',
    replacement: 'Reparar o retirar la bomba que no sostiene el flujo; descartar la muestra si el flujo final se desvía más de la tolerancia del método.',
    reference: 'ISO 13137 y NIOSH NMAM.',
    sourceUrl: LAB_SOURCE,
    status: 'Referencias citadas; método analítico aplicable por confirmar, referencia técnica.',
    standards: [
      f('ISO 13137', 'Requisitos y ensayos de bombas para muestreo personal de agentes químicos y biológicos.', 'ISO 13137'),
      f('NIOSH NMAM', 'Cada método fija flujo, volumen y medio de captación (p. ej., método 0600, polvo respirable, 1,7 L/min con ciclón de nailon de 10 mm).', 'NIOSH Manual of Analytical Methods'),
    ],
    selection: [
      'Flujo y volumen de aire según el método analítico y el laboratorio que analizará la muestra.',
      'Bombas de bajo flujo para tubos adsorbentes; de alto flujo para filtros y ciclones.',
      'Colocar la toma en la zona de respiración, cerca del hombro.',
    ],
    facts: [
      f('Tolerancia de flujo', '±5 % entre el flujo de calibración y el recomendado por el método', 'NIOSH NMAM; práctica de OSHA'),
      f('Calibración', 'Antes y después de cada muestra con el medio en línea', 'NIOSH NMAM'),
    ],
    calibration: [
      f('Calibrador primario', 'Calibrador de flujo primario (burbuja o pistón) con certificado trazable; el patrón no es el rotámetro de la bomba.', 'NIOSH NMAM; INACAL'),
      f('Criterio de validez', 'Si el flujo final difiere del inicial más de la tolerancia del método (±5 %), la muestra se descarta o se corrige según el método.', 'NIOSH NMAM'),
    ],
  },
]

export const PREVENTION_EQUIPMENT: PreventionEquipment[] = [...ppe, ...instruments]

export function filterEquipment(kind: string, query: string): PreventionEquipment[] {
  const normalize = (value: string) => value.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase()
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean)
  return PREVENTION_EQUIPMENT.filter(item => (!kind || item.kind === kind) && terms.every(term => normalize(`${item.title} ${item.purpose} ${item.limits} ${item.reference}`).includes(term)))
}
