import { toPercent, type Point3 } from '../lib/preventionScene'

export interface SceneFact {
  label: string
  value: string
  source: string
}

export interface PreventionHotspot {
  id: string
  label: string
  topicId: string
  /** Posición porcentual sobre el lienzo 860 × 460, calculada desde la posición 3D `at`. */
  x: number
  y: number
  /** Posición del objeto en el espacio de la escena (10 × 10). */
  at: Point3
  /** Peligro y mecanismo de daño, en lenguaje técnico. */
  summary: string
  /** Valores límite o criterios normativos, cada uno con su fuente. */
  facts: SceneFact[]
  /** Controles ilustrados en la vista «con controles». */
  controls: string[]
}

export interface PreventionSceneData {
  id: string
  label: string
  description: string
  /** Contexto técnico del ambiente. */
  overview: string
  domestic?: boolean
  hotspots: PreventionHotspot[]
}

const f = (label: string, value: string, source: string): SceneFact => ({ label, value, source })
const spot = (id: string, label: string, topicId: string, at: Point3, summary: string, facts: SceneFact[], controls: string[]): PreventionHotspot => ({ id, label, topicId, ...toPercent(at), at, summary, facts, controls })

const R375 = 'R.M. 375-2008-TR'
const R375_NOTE = `${R375} (cotejar el texto oficial)`

export const PREVENTION_SCENES: PreventionSceneData[] = [
  { id: 'oficina', label: 'Oficina', description: 'Puestos con pantalla, instalación eléctrica y ambiente.',
    overview: 'Trabajo sedentario con pantalla de visualización. Los daños dominantes son musculoesqueléticos y visuales por diseño del puesto, contacto eléctrico por instalaciones improvisadas y carga mental por la organización del trabajo.',
    hotspots: [
      spot('oficina-puesto', 'Ajuste del puesto', 'ergonomia', [3.2, 3.9, 62],
        'Pantalla baja o desalineada, silla sin apoyo lumbar y pies sin apoyo producen flexión cervical sostenida y carga en hombros y muñecas durante periodos largos.',
        [f('Altura de la pantalla', 'Borde superior a la altura de los ojos o algo por debajo', R375_NOTE), f('Distancia ojo–pantalla', 'Aproximadamente 45 a 70 cm', R375_NOTE), f('Postura', 'Codos y rodillas cercanos a 90°, pies apoyados, antebrazos sin apoyo en bordes', 'ISO 9241-5 (orientativo)'), f('Pausas', 'Alternar posturas y tareas; pausas activas según evaluación', R375)],
        ['Pantalla elevada a la altura de los ojos', 'Silla regulable con apoyo lumbar y reposapiés', 'Teclado y ratón al mismo nivel que los codos']),
      spot('oficina-tablero', 'Tablero eléctrico', 'electricidad', [8.3, 0.4, 58],
        'Tablero sin espacio libre, con tapa abierta, cables en el piso o regletas en cadena. Riesgo de contacto directo, sobrecalentamiento e incendio.',
        [f('Protección diferencial', 'Corriente diferencial asignada de 30 mA como protección adicional en tomacorrientes', 'IEC 60364-4-41'), f('Espacio de trabajo', 'Al menos 0,9 m de profundidad libre frente al tablero', 'NFPA 70 (NEC) 110.26'), f('Marco peruano', 'Código Nacional de Electricidad – Utilización (R.M. 037-2006-MEM/DM)', 'MINEM'), f('Tableros', 'Conjuntos de aparamenta de baja tensión', 'IEC 61439')],
        ['Zona libre señalizada frente al tablero', 'Canalización fija en lugar de cables en el piso', 'Circuitos rotulados y protección diferencial']),
      spot('oficina-ambiente', 'Ambiente y ventilación', 'confort', [3.2, 0.3, 66],
        'Iluminación insuficiente o con reflejos, ventilación escasa y ruido de fondo reducen el rendimiento visual y la atención.',
        [f('Iluminancia en oficina', '500 lx en lectura, escritura y proceso de datos; 100 lx en pasillos', 'EN 12464-1 / ISO 8995-1'), f('Deslumbramiento', 'UGR máximo de 19 en oficinas', 'EN 12464-1'), f('CO₂', 'Se usa como indicador de ventilación; el PEL de OSHA para exposición es de 5 000 ppm en 8 h', 'OSHA 29 CFR 1910.1000'), f('Confort térmico', 'Método PMV/PPD', 'ISO 7730')],
        ['Luminarias sin reflejos en pantallas', 'Renovación de aire medible', 'Medición con luxómetro calibrado']),
      spot('oficina-organizacion', 'Carga y organización', 'psicosocial', [6.9, 6.5, 62],
        'Plazos, interrupciones y falta de control sobre la tarea elevan la carga mental. Es un riesgo organizacional: no se controla con EPP.',
        [f('Gestión de riesgos psicosociales', 'Guía para identificar peligros y gestionar riesgos psicosociales', 'ISO 45003:2021'), f('Salud mental', 'Marco nacional de salud mental', 'Ley N.° 30947')],
        ['Revisión de carga y plazos con los trabajadores', 'Canales confidenciales de reporte', 'Seguimiento con indicadores agregados']),
    ] },
  { id: 'almacen', label: 'Almacén', description: 'Estanterías, cargas y circulación interna.',
    overview: 'Concentra tres mecanismos de lesión grave: atropello por equipos móviles, caída de carga desde racks y sobreesfuerzo en manipulación manual. Se controlan con segregación de rutas, capacidad de racks rotulada y ayudas mecánicas.',
    hotspots: [
      spot('almacen-cruce', 'Cruce peatón–montacargas', 'maquinaria', [6.8, 6.8, 40],
        'Montacargas y peatones comparten ruta. La carga elevada reduce la visibilidad, y las esquinas ciegas aumentan el riesgo de atropello y aplastamiento.',
        [f('Formación del operador', 'Evaluación del desempeño al menos cada 3 años', 'OSHA 29 CFR 1910.178(l)'), f('Seguridad de carretillas', 'Requisitos de seguridad de carretillas industriales', 'ISO 3691-1'), f('Segregación', 'Rutas peatonales separadas físicamente y cruces controlados', 'Jerarquía de controles, Ley N.° 29783 art. 21')],
        ['Barreras que separan la ruta peatonal', 'Espejos y alarma de retroceso', 'Operadores autorizados y velocidad limitada']),
      spot('almacen-carga', 'Manipulación de cargas', 'ergonomia', [2.8, 3.7, 40],
        'Levantar cajas desde el suelo o por encima del hombro, con torsión y frecuencia alta, genera lesión lumbar y de hombro.',
        [f('Carga máxima', '25 kg para varones y 15 kg para mujeres', R375_NOTE), f('Masa de referencia', '25 kg en condiciones óptimas para la población general', 'ISO 11228-1'), f('Constante de carga', '23 kg en la ecuación de levantamiento (RWL)', 'NIOSH, Applications Manual for the Revised Lifting Equation')],
        ['Apilado a altura media y cajas livianas', 'Carretillas y ayudas mecánicas', 'Rotación de tareas']),
      spot('almacen-casco', 'Caída de objetos y EPP', 'epp', [5.2, 1.0, 118],
        'Cargas en racks mal asentadas, sin protección de columna ni rótulo de capacidad, pueden caer sobre el pasillo.',
        [f('Estanterías', 'Rótulo de capacidad de carga visible por tramo y nivel', 'ANSI MH16.1'), f('Casco', 'Tipo I o II según el riesgo', 'ANSI/ISEA Z89.1'), f('Calzado', 'Puntera de 200 J y 15 kN', 'EN ISO 20345')],
        ['Rótulo de capacidad y protectores de columna', 'Inspección periódica de racks', 'Casco y calzado en zonas de carga']),
      spot('almacen-salida', 'Ruta de evacuación', 'incendios', [0.2, 8.2, 45],
        'Cajas en la ruta o salidas bloqueadas retrasan la evacuación. La carga combustible acelera la propagación del fuego.',
        [f('Extintores', 'Selección, distribución, inspección y mantenimiento', 'NTP 350.043-1'), f('Señales de seguridad', 'Colores y formas de las señales', 'NTP 399.010-1'), f('Edificaciones', 'Requisitos de seguridad en edificaciones', 'RNE A.130 (confirmar edición vigente)')],
        ['Ruta libre y señalizada', 'Extintores accesibles e inspeccionados', 'Simulacros periódicos']),
    ] },
  { id: 'planta', label: 'Planta industrial', description: 'Línea de producción, energía y ruido.',
    overview: 'El peligro principal es el contacto con partes móviles durante operación, limpieza o ajuste. Se controla con resguardos con enclavamiento y con aislamiento de energía; el ruido y los residuos requieren medición y gestión.',
    hotspots: [
      spot('planta-linea', 'Resguardo de maquinaria', 'maquinaria', [7.9, 4.2, 70],
        'Zona de atrapamiento accesible en la prensa o el rodillo. El daño típico es aplastamiento o amputación.',
        [f('Resguardos', 'Requisitos de diseño de resguardos fijos y móviles', 'ISO 14120'), f('Distancias de seguridad', 'Distancia mínima según la abertura del resguardo', 'ISO 13857'), f('Sistema de control', 'Nivel de desempeño PL a–e', 'ISO 13849-1'), f('Enclavamientos', 'Dispositivos de enclavamiento con resguardos', 'ISO 14119')],
        ['Resguardo fijo con enclavamiento', 'Parada de emergencia accesible', 'Prueba funcional documentada']),
      spot('planta-ruido', 'Ruido de proceso', 'ruido', [1.6, 1.6, 48],
        'Compresor o motor sin aislamiento. La exposición diaria equivalente depende del nivel y del tiempo.',
        [f('Referencia nacional', '85 dB(A) en 8 h', R375_NOTE), f('Intercambio de 3 dB', '88 dB(A): 4 h; 91: 2 h; 94: 1 h; 97: 30 min; 100: 15 min', 'NIOSH 98-126, fórmula T = 8 × 2^((85 − L)/3)'), f('Ruido impulsivo', 'Pico de 140 dB como referencia', 'NIOSH; OSHA 1910.95')],
        ['Encapsulado o silenciador', 'Mantenimiento de la fuente', 'Protección auditiva con ajuste comprobado']),
      spot('planta-energia', 'Aislamiento de energía', 'electricidad', [4.7, 0.4, 60],
        'Intervención del equipo sin aislar todas las fuentes: eléctrica, neumática, hidráulica o potencial gravitatoria.',
        [f('Bloqueo y etiquetado', 'Control de energía peligrosa', 'OSHA 29 CFR 1910.147'), f('Arranque inesperado', 'Prevención de arranque inesperado', 'ISO 14118'), f('Secuencia', 'Preparar, apagar, aislar, bloquear y etiquetar, disipar la energía residual y verificar la ausencia de energía', '29 CFR 1910.147')],
        ['Candado y tarjeta personal', 'Verificación de energía cero', 'Procedimiento por máquina']),
      spot('planta-residuo', 'Residuos del proceso', 'residuos', [2.25, 7.35, 40],
        'Residuos mezclados, envases sin identificar y derrames de aceite. Riesgo de resbalones, incendio y contaminación.',
        [f('Marco peruano', 'Ley de Gestión Integral de Residuos Sólidos y su reglamento', 'D.L. 1278; D.S. 014-2017-MINAM'), f('Código de colores', 'Blanco plástico; azul papel y cartón; amarillo metal; verde vidrio; marrón orgánico; rojo peligrosos; negro no aprovechables', 'NTP 900.058:2019 (verificar edición vigente)'), f('Residuos peligrosos', 'Entrega a una empresa operadora autorizada con manifiesto', 'D.S. 014-2017-MINAM')],
        ['Segregación en el punto de origen', 'Contención de derrames', 'Registro y trazabilidad']),
    ] },
  { id: 'alimentos', label: 'Planta de alimentos', description: 'Flujos limpios y sucios, cadena de frío y limpieza.',
    overview: 'Se superponen la inocuidad del producto y la seguridad del trabajador. El mismo lugar presenta cortes, químicos de limpieza, frío y resbalones, además de contaminación cruzada.',
    hotspots: [
      spot('alimentos-mesa', 'Separar crudo y listo', 'alimentos', [3.2, 3.8, 42],
        'Utensilios o superficies compartidas entre alimento crudo y listo para consumo producen contaminación cruzada.',
        [f('Cadena de frío', 'Mantener bajo 5 °C; mantener caliente sobre 60 °C', 'OMS, Cinco claves para la inocuidad'), f('Cocción', 'Temperatura interna de 70 °C', 'OMS, Cinco claves'), f('HACCP', 'Siete principios del análisis de peligros y puntos de control críticos', 'Codex CAC/RCP 1-1969'), f('Marco sanitario peruano', 'D.S. 007-98-SA y R.M. 449-2006/MINSA (confirmar vigencia)', 'MINSA')],
        ['Flujos y tablas separadas por color', 'Registro de temperaturas', 'Verificación de limpieza']),
      spot('alimentos-limpieza', 'Productos de limpieza', 'quimicos', [1.7, 1.2, 52],
        'Concentrados, mezcla de productos incompatibles y trasvase sin etiqueta. El hipoclorito con ácidos o amoníaco libera cloro o cloraminas.',
        [f('Etiquetado y FDS', 'Pictogramas y ficha de datos de seguridad de 16 secciones', 'Sistema Globalmente Armonizado'), f('Cloro', 'ACGIH TLV 0,5 ppm (8 h) y 1 ppm (corto plazo)', 'ACGIH'), f('Marco peruano', 'Reglamento de agentes químicos en el ambiente de trabajo', 'D.S. 015-2005-SA')],
        ['Dosificadores y envases etiquetados', 'Almacén ventilado y separado', 'Duchas y lavaojos cercanos']),
      spot('alimentos-corte', 'Corte y atrapamiento', 'maquinaria', [7.0, 6.2, 46],
        'Rebanadora o cinta sin resguardo durante la limpieza. Riesgo de corte profundo y amputación.',
        [f('Resguardos', 'Resguardos fijos o con enclavamiento', 'ISO 14120'), f('Guante contra corte', 'Niveles A–F (EN 388) o A1–A9 (ANSI/ISEA 105)', 'EN 388; ANSI/ISEA 105'), f('Limpieza', 'Aislar y bloquear la energía antes de limpiar', 'OSHA 29 CFR 1910.147')],
        ['Resguardo con enclavamiento', 'Bloqueo antes de limpiar', 'Guante de malla en operaciones manuales']),
      spot('alimentos-frio', 'Frío y condiciones ambientales', 'confort', [8.4, 0.4, 60],
        'Permanencia en cámaras frías y pisos mojados. Riesgo de hipotermia local, resbalón y quedar atrapado.',
        [f('Almacenamiento de congelados', '−18 °C o menos', 'Codex Alimentarius'), f('Ropa contra frío', 'Aislamiento térmico, resistencia al frío convectivo', 'EN 342; EN 511 (guantes)'), f('Estrés por frío', 'Evaluación del enfriamiento requerido', 'ISO 11079')],
        ['Apertura interior de las puertas con alarma', 'Ropa contra frío y rotación', 'Piso antideslizante']),
    ] },
  { id: 'salud', label: 'Establecimiento de salud', description: 'Pacientes, punzocortantes y movilización.',
    overview: 'La exposición es biológica (sangre, fluidos, aerosoles), por punzocortantes y ergonómica por movilización de pacientes. Se controla con precauciones estándar, dispositivos de seguridad y ayudas mecánicas.',
    hotspots: [
      spot('salud-atencion', 'Exposición biológica', 'biologicos', [4.4, 4.6, 40],
        'Contacto con sangre, fluidos o aerosoles durante la atención. La vía de transmisión determina la barrera.',
        [f('Higiene de manos', 'Con solución alcohólica 20 a 30 s; con agua y jabón 40 a 60 s', 'OMS, Cinco momentos'), f('Mascarilla quirúrgica', 'Filtración bacteriana ≥98 % (tipos II y IIR)', 'EN 14683'), f('Respirador', 'N95 (42 CFR 84) o FFP2 (EN 149) con prueba de ajuste', '42 CFR 84; EN 149'), f('Sector salud', 'Norma técnica de salud sectorial', 'R.M. 826-2024-MINSA')],
        ['Precauciones estándar y barreras por vía', 'Higiene de manos en los cinco momentos', 'Respirador con prueba de ajuste cuando corresponda']),
      spot('salud-punzantes', 'Punzocortantes', 'residuos', [7.9, 2.0, 56],
        'Pinchazos con agujas o hojas contaminadas durante el uso o el descarte. Riesgo de infección por VIH, VHB y VHC.',
        [f('Contenedor', 'Rígido y no punzable; llenar hasta tres cuartos de su capacidad', 'OMS'), f('Clases de residuos', 'A biocontaminado; B especial; C común. Bolsa roja para biocontaminados', 'NTS 144-MINSA/2018/DIGESA'), f('Tras un pinchazo', 'Evaluación inmediata; la profilaxis posexposición se inicia lo antes posible y como máximo en 72 h', 'OMS / CDC')],
        ['Dispositivos con seguridad integrada', 'Contenedor en el punto de uso', 'Prohibido reencapsular']),
      spot('salud-movilizar', 'Movilizar sin sobreesfuerzo', 'ergonomia', [3.0, 6.2, 52],
        'Levantar o reposicionar pacientes sin ayudas produce lesión lumbar acumulativa.',
        [f('Límite de carga manual de pacientes', '16 kg (35 lb); sobre ese valor usar equipos', 'NIOSH, Waters 2007'), f('Carga máxima general', '25 kg varones y 15 kg mujeres', R375_NOTE)],
        ['Grúas y sábanas deslizantes', 'Camas de altura regulable', 'Capacitación en movilización']),
      spot('salud-piel', 'Higiene y cuidado de piel', 'piel', [1.9, 0.3, 54],
        'Lavado frecuente y guantes prolongados causan dermatitis irritativa y favorecen sensibilización.',
        [f('Guantes frente a microorganismos', 'Marcado de resistencia', 'EN ISO 374-5'), f('Higiene alcohólica', 'Menos irritante que el lavado repetido con jabón', 'OMS')],
        ['Guantes sin polvo y cremas barrera', 'Higiene alcohólica como primera opción', 'Seguimiento confidencial de síntomas']),
    ] },
  { id: 'construccion', label: 'Construcción', description: 'Bordes, andamios, maquinaria y sol.',
    overview: 'Obra con trabajo en altura, maquinaria pesada y exposición solar. Las caídas de altura concentran la mayoría de eventos fatales; se controlan con protección colectiva, andamios certificados y rescate planificado.',
    hotspots: [
      spot('obra-borde', 'Bordes y trabajo en altura', 'alturas', [3.25, 3.0, 140],
        'Borde de losa sin protección. Caída de personas y de objetos hacia niveles inferiores.',
        [f('Obligación de protección', 'Desde 1,8 m (6 pies) sobre un nivel inferior', 'OSHA 29 CFR 1926.501; confirmar en G.050 y D.S. 011-2019-TR'), f('Baranda', 'Pasamanos a 107 cm ± 8 cm, barra intermedia y rodapié de 9 cm; resistencia de 890 N (200 lb)', 'OSHA 29 CFR 1926.502(b)'), f('Andamios', 'Soportar el peso propio más 4 veces la carga máxima prevista', 'OSHA 29 CFR 1926.451'), f('Marco peruano', 'Norma G.050 y reglamento de seguridad en construcción', 'RNE G.050; D.S. 011-2019-TR')],
        ['Barandas con rodapié en bordes y huecos', 'Red o línea de vida cuando no hay baranda', 'Plan de rescate y permiso de trabajo']),
      spot('obra-epp', 'Protección personal', 'epp', [5.9, 6.1, 62],
        'EPP incompleto o mal seleccionado frente a golpes, proyecciones y tránsito vehicular.',
        [f('Casco', 'ANSI/ISEA Z89.1 tipo I o II', 'ANSI/ISEA Z89.1'), f('Calzado', 'Puntera 200 J y suela antiperforación (S3)', 'EN ISO 20345'), f('Alta visibilidad', 'Ropa de clases 1 a 3', 'EN ISO 20471; ANSI/ISEA 107')],
        ['Casco, calzado, lentes y chaleco', 'Ajuste y reposición según inspección', 'EPP complementa los controles colectivos']),
      spot('obra-sol', 'Exposición al sol', 'uv', [9.3, 0.3, 198],
        'Radiación UV acumulada en trabajo exterior, incluso con nubosidad. Daño cutáneo y ocular.',
        [f('Índice UV (OMS)', '0–2 bajo; 3–5 moderado; 6–7 alto; 8–10 muy alto; 11 o más extremo', 'OMS'), f('Hora de mayor exposición', '10:00 a 16:00', 'OMS'), f('Ropa', 'Factor de protección UPF 50+', 'AS/NZS 4399; EN 13758'), f('Marco peruano', 'Medidas preventivas por exposición prolongada a radiación solar', 'Ley N.° 30102')],
        ['Sombra y reprogramación de tareas', 'Ropa de cobertura y protección ocular UV', 'Hidratación y descansos']),
      spot('obra-maquina', 'Herramientas y maquinaria', 'maquinaria', [7.2, 3.0, 56],
        'Maquinaria con radio de giro y puntos ciegos. Contacto con líneas eléctricas aéreas.',
        [f('Distancia a líneas aéreas', 'Mínimo 3 m (10 pies) hasta 50 kV', 'OSHA 29 CFR 1926.1408'), f('Señalero', 'Comunicación definida con el operador en maniobras con visibilidad reducida', 'Práctica de seguridad en obra')],
        ['Zona de exclusión y señalero', 'Alarma de retroceso', 'Operadores autorizados']),
    ] },
  { id: 'agricultura', label: 'Agricultura exterior', description: 'Sol, agroquímicos y tareas repetitivas.',
    overview: 'La exposición combina radiación solar, calor, agroquímicos y carga física repetitiva. El control exige organización horaria, almacenamiento seguro de productos y respeto de los tiempos de reingreso.',
    hotspots: [
      spot('campo-sol', 'Radiación UV solar', 'uv', [9.3, 0.3, 198],
        'Jornada exterior con superficie reflectante. La exposición se acumula día tras día.',
        [f('Índice UV (OMS)', '3 o más: protección recomendada', 'OMS'), f('Horas pico', '10:00 a 16:00', 'OMS'), f('Marco peruano', 'Ley de medidas preventivas por radiación solar', 'Ley N.° 30102')],
        ['Sombra móvil en el frente de trabajo', 'Horarios adaptados al índice UV', 'Ropa de cobertura y sombrero']),
      spot('campo-piel', 'Piel y protección complementaria', 'piel', [6.1, 6.5, 60],
        'Contacto con plaguicidas y plantas irritantes. La absorción dérmica es una vía de exposición principal.',
        [f('Clasificación de peligrosidad', 'Ia extremadamente, Ib altamente, II moderadamente, III ligeramente peligroso y U improbable', 'OMS, Recommended Classification of Pesticides'), f('Reingreso', 'El intervalo de reingreso y el periodo de carencia constan en la etiqueta', 'Etiqueta del producto')],
        ['Guantes y ropa según la etiqueta', 'Lavado tras la aplicación', 'Respeto del intervalo de reingreso']),
      spot('campo-quimicos', 'Almacenamiento de productos', 'quimicos', [1.9, 2.8, 56],
        'Agroquímicos sin contención, mezclados con alimentos o sin llave. Riesgo de intoxicación y contaminación.',
        [f('Gestión de plaguicidas', 'Código de conducta sobre almacenamiento y manejo', 'FAO / OMS'), f('Almacén', 'Ventilado, señalizado, bajo llave y con contención de derrames', 'FAO'), f('Marco peruano', 'Agentes químicos en el trabajo', 'D.S. 015-2005-SA')],
        ['Almacén cerrado con contención', 'Separación de incompatibles', 'Inventario con FDS']),
      spot('campo-cargas', 'Tareas repetitivas y cargas', 'ergonomia', [6.0, 7.2, 40],
        'Cosecha con flexión de tronco y cargas repetidas. Fatiga y lesión musculoesquelética.',
        [f('Carga máxima', '25 kg varones y 15 kg mujeres', R375_NOTE), f('Constante de carga', '23 kg', 'NIOSH, ecuación de levantamiento'), f('Calor', 'Evaluar con índice WBGT', 'ISO 7243')],
        ['Ayudas de transporte y contenedores livianos', 'Rotación y pausas', 'Hidratación disponible']),
    ] },
  { id: 'hogar', label: 'Hogar', domestic: true, description: 'Prevención doméstica general.',
    overview: 'Prevención doméstica general; las obligaciones empresariales de SST no se trasladan automáticamente a la vivienda. Los eventos más frecuentes son incendio, intoxicación por monóxido de carbono, electrocución y ingestión de productos de limpieza.',
    hotspots: [
      spot('hogar-cocina', 'Gas, ventilación y calor', 'gases', [7.3, 1.0, 46],
        'Fuga de GLP en el piso, llama sin ventilación o combustión incompleta con producción de CO.',
        [f('GLP (propano)', 'Rango inflamable de 2,1 % a 9,5 % en volumen; más denso que el aire', 'Hojas de datos de seguridad del propano'), f('Monóxido de carbono', 'IDLH de 1 200 ppm', 'NIOSH'), f('Ante una fuga', 'No accionar interruptores, ventilar, cerrar la válvula y pedir asistencia', 'Práctica de seguridad doméstica')],
        ['Ventilación permanente', 'Manguera y conexiones en buen estado', 'Alarma de CO en el hogar']),
      spot('hogar-enchufe', 'Conexiones eléctricas', 'electricidad', [2.4, 0.15, 47],
        'Regletas en cadena, cables dañados y ausencia de protección diferencial.',
        [f('Tensión doméstica', '220 V, 60 Hz', 'Código Nacional de Electricidad'), f('Protección diferencial', '30 mA', 'IEC 60364-4-41'), f('Interruptor termomagnético', 'Protege contra sobrecarga y cortocircuito, no contra contacto', 'IEC 60898')],
        ['Un aparato de potencia alta por tomacorriente', 'Interruptor diferencial de 30 mA', 'Reparación por personal competente']),
      spot('hogar-limpieza', 'Guardar productos separados', 'quimicos', [1.6, 6.3, 48],
        'Envases sin etiqueta o reenvasados en botellas de bebida, al alcance de niños. No mezclar lejía con ácidos ni amoníaco.',
        [f('Etiqueta', 'Conservar en el envase original con pictogramas', 'Sistema Globalmente Armonizado'), f('Lejía y ácidos', 'La mezcla libera cloro', 'Fichas de datos de seguridad de hipoclorito')],
        ['Envase original y cerrado', 'Fuera del alcance de niños', 'No mezclar productos']),
      spot('hogar-incendio', 'Respuesta ante incendio', 'incendios', [5.7, 6.5, 38],
        'Aceite sobrecalentado, cables sobrecargados y vías de salida bloqueadas.',
        [f('Clases de fuego', 'A sólidos, B líquidos, C gases, D metales y K aceites de cocina', 'NFPA 10'), f('Alarmas de humo', 'Probar cada mes y reemplazar cada 10 años', 'NFPA 72'), f('Fuego de aceite', 'Tapar el recipiente; no usar agua', 'NFPA 10')],
        ['Detector de humo', 'Extintor adecuado y rutas libres', 'Plan de evacuación familiar']),
    ] },
]
