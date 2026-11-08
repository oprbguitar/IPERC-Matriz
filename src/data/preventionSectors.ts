/** Contexto por sector: cambia el orden de las fichas y añade criterios propios de la industria. */
export interface SectorContext {
  focus: string
  /** Fichas prioritarias, por id de tema. */
  priority: string[]
  /** Normas del catálogo jurídico relevantes para el sector. */
  normIds: string[]
  /** Criterio específico del sector para un tema concreto. */
  notes: Record<string, string>
}

const base = ['law-29783', 'ds-005-2012-tr']

export const SECTOR_CONTEXT: Record<string, SectorContext> = {
  offices: { focus: 'Trabajo con pantalla de visualización: predominan los riesgos ergonómicos, visuales y psicosociales; los eléctricos son de instalación.', priority: ['ergonomia', 'confort', 'psicosocial', 'electricidad'], normIds: [...base, 'rm-375-2008-tr'],
    notes: { ergonomia: 'Borde superior de la pantalla a la altura de los ojos o algo por debajo, y distancia ojo–pantalla de unos 45 a 70 cm (R.M. 375-2008-TR; cotejar el texto oficial).', confort: 'Referencia de iluminancia para oficina: 500 lx en lectura y proceso de datos y 100 lx en pasillos (EN 12464-1).' } },
  manufacturing: { focus: 'Máquinas, energías peligrosas y ruido. La prioridad es resguardar y aislar energía antes de proteger a la persona.', priority: ['maquinaria', 'ruido', 'electricidad', 'quimicos'], normIds: base,
    notes: { maquinaria: 'Resguardos según ISO 14120, enclavamientos según ISO 14119 y nivel de desempeño (PL a–e) por función de seguridad según ISO 13849-1.', ruido: 'Referencia de 85 dB(A) en 8 h con intercambio de 3 dB: priorice encapsulado y mantenimiento de la fuente antes de la protección auditiva.' } },
  food: { focus: 'Inocuidad del producto y seguridad del trabajador coexisten: cortes, frío, químicos de limpieza y resbalones, además de contaminación cruzada.', priority: ['alimentos', 'maquinaria', 'piel', 'confort'], normIds: base,
    notes: { alimentos: 'Puntos habituales de control: cocción a 70 °C internos y mantenimiento por debajo de 5 °C o sobre 60 °C (OMS, Cinco claves para la inocuidad).', maquinaria: 'Rebanadoras y mezcladoras se limpian con energía presente: aplique bloqueo y etiquetado antes de limpiar (29 CFR 1910.147).' } },
  'food-services': { focus: 'Cocinas con calor, fuego y grasa: quemaduras, incendios, cortes y manipulación higiénica.', priority: ['alimentos', 'incendios', 'piel', 'maquinaria'], normIds: base,
    notes: { alimentos: 'La zona de peligro térmico está entre 5 °C y 60 °C (OMS, Cinco claves para la inocuidad).', incendios: 'Grasa en campanas y ductos: fuegos clase K (NFPA 10); no se usa agua.' } },
  logistics: { focus: 'Equipos móviles, cargas elevadas y manipulación manual: atropello, caída de carga y sobreesfuerzo.', priority: ['maquinaria', 'ergonomia', 'alturas', 'uv'], normIds: [...base, 'rm-375-2008-tr'],
    notes: { maquinaria: 'Evaluación del operador de montacargas al menos cada 3 años (OSHA 29 CFR 1910.178(l)) y segregación física de peatones y vehículos.', ergonomia: 'Carga manual de 25 kg para varones y 15 kg para mujeres (R.M. 375-2008-TR); constante de 23 kg en la ecuación NIOSH.' } },
  construction: { focus: 'Altura, maquinaria pesada, electricidad provisional y exposición solar. Las caídas de altura concentran los eventos más graves.', priority: ['alturas', 'electricidad', 'maquinaria', 'uv', 'ruido'], normIds: [...base, 'rne-g050', 'ds-011-2019-tr'],
    notes: { alturas: 'Protección desde 1,8 m; baranda con pasamanos a 107 cm ± 8 cm (OSHA 29 CFR 1926.502(b)). Confirme los valores en G.050 y D.S. 011-2019-TR.', electricidad: 'Distancia mínima de 3 m a líneas aéreas de hasta 50 kV para grúas y equipos (OSHA 29 CFR 1926.1408).' } },
  mining: { focus: 'Espacios confinados, ruido de equipos, altura y maquinaria. El reglamento sectorial prevalece sobre las referencias generales.', priority: ['gases', 'ruido', 'alturas', 'maquinaria'], normIds: [...base, 'ds-024-2016-em'],
    notes: { gases: 'Atmósfera de ingreso con O₂ entre 19,5 % y 23,5 %; IDLH de H₂S 100 ppm y de CO 1 200 ppm (NIOSH). Mida antes y durante el trabajo.', ruido: 'Perforación y equipos pesados exigen dosimetría por puesto: no suponga el nivel; use 85 dB(A) en 8 h y 3 dB como referencia comparable.' } },
  agriculture: { focus: 'Sol, agroquímicos y cargas repetitivas. El control combina organización del horario, almacén seguro y respeto de la etiqueta.', priority: ['uv', 'quimicos', 'piel', 'ergonomia'], normIds: [...base, 'law-30102'],
    notes: { uv: 'Con índice UV de 3 o más se recomienda protección; el pico va de 10:00 a 16:00 (OMS). Marco: Ley N.° 30102.', quimicos: 'Clasificación OMS de plaguicidas Ia, Ib, II, III y U; respete el intervalo de reingreso y el periodo de carencia de la etiqueta.' } },
  fishing: { focus: 'Embarcaciones y plantas: bodegas con atmósferas peligrosas, equipos de cubierta, frío y exposición solar.', priority: ['gases', 'maquinaria', 'alimentos', 'uv'], normIds: base,
    notes: { gases: 'Bodegas y tanques pueden tener deficiencia de oxígeno y H₂S por descomposición: no ingrese sin medir O₂ (mínimo 19,5 %).', maquinaria: 'Winches y redes atrapan: proteja los puntos de arrastre y aísle la energía antes de intervenir.' } },
  chemical: { focus: 'La identidad de la sustancia manda: FDS, compatibilidad, ventilación y programa de protección respiratoria.', priority: ['quimicos', 'gases', 'biologicos', 'incendios'], normIds: [...base, 'ds-015-2005-sa'],
    notes: { quimicos: 'Ficha de datos de seguridad de 16 secciones y matriz de compatibilidad de almacenamiento; los límites dependen de cada sustancia.', gases: 'Detector con el gas patrón del analito y prueba funcional antes de cada uso (ISEA).' } },
  energy: { focus: 'Electricidad, atmósferas inflamables y altura. El trabajo energizado y el arco requieren evaluación específica.', priority: ['electricidad', 'gases', 'alturas', 'incendios'], normIds: [...base, 'rm-111-2013-mem-dm'],
    notes: { electricidad: 'Categorías de arco con capacidad mínima de 4, 8, 25 y 40 cal/cm² (NFPA 70E); marco: R.M. 111-2013-MEM/DM.', gases: 'Alarmas típicas de LEL en 10 % y 20 %; el equipo debe ser apto para el área clasificada (IEC 60079).' } },
  workshops: { focus: 'Herramientas de corte, máquinas rotativas, polvo y ruido: atrapamiento, proyecciones y exposición acumulada.', priority: ['maquinaria', 'ruido', 'quimicos', 'electricidad'], normIds: base,
    notes: { maquinaria: 'No use guantes sueltos ni prendas holgadas cerca de partes rotativas; resguardo y parada accesible en cada máquina.', ruido: 'Esmerilado, corte y carpintería: mida con dosímetro y compare con 85 dB(A) en 8 h; no suponga el nivel.' } },
  health: { focus: 'Exposición biológica, punzocortantes y movilización de pacientes; la vía de transmisión define la barrera.', priority: ['biologicos', 'ergonomia', 'piel', 'residuos'], normIds: [...base, 'rm-826-2024-minsa', 'rm-312-2011-minsa'],
    notes: { biologicos: 'Higiene de manos con alcohol 20 a 30 s o con agua y jabón 40 a 60 s en los cinco momentos (OMS).', ergonomia: 'Movilización manual de pacientes: umbral de 16 kg (35 lb); sobre ese valor use equipos (NIOSH, Waters 2007).' } },
  services: { focus: 'Limpieza y residuos: contacto con químicos, residuos mezclados y carga manual en espacios muy variables.', priority: ['quimicos', 'residuos', 'ergonomia', 'piel'], normIds: base,
    notes: { quimicos: 'No mezcle hipoclorito con ácidos ni amoníaco: se libera cloro o cloraminas; envase original y etiqueta siempre.', residuos: 'Segregación por código de colores de la NTP 900.058:2019 (verifique la edición vigente).' } },
  education: { focus: 'Carga emocional, voz, patios al sol y alimentación escolar; riesgos moderados pero constantes.', priority: ['psicosocial', 'ergonomia', 'uv', 'alimentos'], normIds: base,
    notes: { psicosocial: 'Gestión de riesgos psicosociales según ISO 45003:2021: carga, control, apoyo y violencia de terceros.', uv: 'Actividades al aire libre: sombra y horarios con índice UV de 3 o más (OMS).' } },
  domestic: { focus: 'Prevención doméstica general; no traslada obligaciones empresariales al hogar. Predominan gas, electricidad, químicos y fuego.', priority: ['gases', 'electricidad', 'quimicos', 'incendios'], normIds: base,
    notes: { gases: 'GLP inflamable entre 2,1 % y 9,5 % en volumen y más denso que el aire: ventile y mantenga alarma de CO.', electricidad: 'Interruptor diferencial de 30 mA como protección adicional (IEC 60364-4-41).' } },
}
