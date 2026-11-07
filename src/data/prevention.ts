/** Relaciones preventivas: los documentos jurídicos viven únicamente en legalDatabase. */
export interface PreventionTopic {
  id: string
  title: string
  family: string
  sectorIds: string[]
  summary: string
  exposure: string
  consequence: string
  controls: string[]
  verification: string[]
  normIds: string[]
  instruments: string[]
  ppe: string[]
  limits: string
  sourceStatus: string
  sourceUrls: string[]
}

export const PREVENTION_SECTORS: { id: string; label: string; domestic?: boolean }[] = [
  { id: 'offices', label: 'Oficinas, sector público y teletrabajo' },
  { id: 'manufacturing', label: 'Manufactura y producción' },
  { id: 'food', label: 'Plantas de alimentos' },
  { id: 'food-services', label: 'Restaurantes, panaderías y cocinas' },
  { id: 'logistics', label: 'Almacenes, logística y transporte' },
  { id: 'construction', label: 'Construcción y mantenimiento' },
  { id: 'mining', label: 'Minería y metalurgia' },
  { id: 'agriculture', label: 'Agricultura y agroindustria' },
  { id: 'fishing', label: 'Pesca y acuicultura' },
  { id: 'chemical', label: 'Industria química y laboratorios' },
  { id: 'energy', label: 'Energía e hidrocarburos' },
  { id: 'workshops', label: 'Textil, carpintería y metalmecánica' },
  { id: 'health', label: 'Hospitales, clínicas y salud' },
  { id: 'services', label: 'Comercio, limpieza y residuos' },
  { id: 'education', label: 'Educación y comunidad' },
  { id: 'domestic', label: 'Hogar · prevención general', domestic: true },
]

export const PREVENTION_FAMILIES = [
  { id: 'physical', label: 'Físicos' },
  { id: 'mechanical', label: 'Mecánicos' },
  { id: 'electrical', label: 'Eléctricos' },
  { id: 'chemical', label: 'Químicos' },
  { id: 'biological', label: 'Biológicos' },
  { id: 'ergonomic', label: 'Ergonómicos' },
  { id: 'psychosocial', label: 'Psicosociales y salud integral' },
  { id: 'emergency', label: 'Emergencias' },
  { id: 'environmental', label: 'Ambientales e inocuidad' },
]

export const PREVENTION_PROFILES = [
  { id: 'worker', label: 'Trabajador', hint: 'Reconozca el peligro, use los controles y comunique condiciones inseguras sin exponerse.' },
  { id: 'employer', label: 'Empleador', hint: 'Organice la evaluación, asigne responsables y recursos, y compruebe los controles con evidencias.' },
  { id: 'supervisor', label: 'Supervisor', hint: 'Verifique controles antes de la tarea y registre condiciones, responsables y acciones pendientes.' },
  { id: 'professional', label: 'Profesional SST / SSOMA', hint: 'Evalúe exposición, jerarquice controles y contraste normas, instrumentos y trazabilidad.' },
  { id: 'consultant', label: 'Consultor', hint: 'Delimite el alcance sectorial, documente supuestos y entregue hallazgos sustentados y verificables.' },
]

const allSectors = PREVENTION_SECTORS.map((sector) => sector.id)
const occupational = PREVENTION_SECTORS.filter((sector) => !sector.domestic).map((sector) => sector.id)
const catalogStatus = 'Referencias del catálogo existente; verificar vigencia, alcance y aplicación a la tarea.'
const baseNorms = ['law-29783', 'ds-005-2012-tr']

export const PREVENTION_TOPICS: PreventionTopic[] = [
  {
    id: 'electricidad', title: 'Electricidad, contacto y arco eléctrico', family: 'electrical', sectorIds: allSectors,
    summary: 'Identifique contacto directo e indirecto, sobrecargas, energía almacenada y exposición al arco antes de intervenir.',
    exposure: 'Acceso a partes energizadas, aislamiento deteriorado o intervención sin aislamiento de todas las fuentes de energía.',
    consequence: 'Choque eléctrico, quemaduras, incendio y lesiones por proyección.',
    controls: ['Eliminar la intervención energizada cuando sea posible; aislar y bloquear fuentes mediante procedimiento autorizado.', 'Comprobar ausencia de tensión con equipo adecuado y personal competente; delimitar el área.', 'Mantener resguardos, puesta a tierra y dispositivos de protección seleccionados para la instalación.'],
    verification: ['Procedimiento de bloqueo y etiquetado, permiso e identificación de fuentes.', 'Registro de inspección, mantenimiento y comprobaciones; personal competente y equipo identificado.'],
    normIds: [...baseNorms, 'rm-111-2013-mem-dm'], instruments: ['Detector de tensión', 'Multímetro con categoría de medición adecuada, puntas y accesorios compatibles'],
    ppe: ['Protección eléctrica y contra arco seleccionada mediante evaluación técnica'],
    limits: 'La R.M. 111-2013-MEM/DM tiene ámbito eléctrico específico. No autoriza labores energizadas ni traslada obligaciones empresariales al hogar. La categoría CAT y la tensión nominal del instrumento deben corresponder a la instalación.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'epp', title: 'Cascos y equipos de protección personal', family: 'mechanical', sectorIds: occupational,
    summary: 'Seleccione protección compatible con el peligro residual, el usuario y las demás piezas del equipo.',
    exposure: 'Impactos, caída de objetos, salpicaduras, partículas y otros agentes que persisten después de aplicar controles colectivos.',
    consequence: 'Lesiones en cabeza, ojos, manos, pies o vías respiratorias, según la exposición.',
    controls: ['Priorizar eliminación, sustitución y protección colectiva antes de depender del EPP.', 'Revisar marcado, norma declarada, talla, ajuste y compatibilidad; capacitar al usuario.', 'Inspeccionar antes del uso y sustituir tras daño, impacto o según instrucciones del fabricante.'],
    verification: ['Ficha de selección por tarea y registro de entrega y capacitación.', 'Marcado legible, instrucciones del fabricante y lista de inspección; trazabilidad de reemplazos.'],
    normIds: baseNorms, instruments: ['Lista de inspección del fabricante', 'Prueba de ajuste cuando corresponda al respirador o protector'],
    ppe: ['Cascos', 'Protección ocular y facial', 'Guantes', 'Respiradores y filtros', 'Calzado de seguridad'],
    limits: 'El color del casco no define una función legal universal. Las clases eléctricas y tipos de impacto pertenecen a estándares y ediciones concretas: no son tensiones de trabajo. NTP 399.018 y equivalencias ANSI/EN: PENDIENTE DE VALIDACIÓN documental específica.',
    sourceStatus: 'Marco SST disponible; normas de producto y ediciones PENDIENTES DE VALIDACIÓN.', sourceUrls: [],
  },
  {
    id: 'ruido', title: 'Ruido y protección auditiva', family: 'physical', sectorIds: allSectors,
    summary: 'Diferencie nivel sonoro, tiempo de exposición y dosis; una lectura aislada no representa toda la jornada.',
    exposure: 'Permanencia cerca de máquinas, herramientas, tránsito o procesos ruidosos durante periodos variables.',
    consequence: 'Daño auditivo, dificultad para comunicarse, fatiga y pérdida de percepción de alarmas.',
    controls: ['Reducir ruido en la fuente con sustitución, mantenimiento y aislamiento acústico.', 'Organizar tiempos y acceso, y medir la exposición representativa de la jornada.', 'Seleccionar protección auditiva compatible y comprobar el ajuste individual.'],
    verification: ['Informe con niveles, tiempos, configuración y estrategia de muestreo.', 'Identificación y calibración de sonómetro, dosímetro y calibrador; verificaciones operativas antes y después.'],
    normIds: ['rm-375-2008-tr', ...baseNorms], instruments: ['Sonómetro integrador', 'Dosímetro personal', 'Calibrador acústico'], ppe: ['Tapones u orejeras con ajuste comprobado'],
    limits: 'La referencia educativa industrial 85 dB(A)/8 h, con intercambio de 3 dB, presupone nivel constante. No evalúa jornadas variables ni ruido impulsivo. Oficinas con alta exigencia intelectual tienen tratamiento específico en la R.M. 375-2008-TR; no aplicarles automáticamente 85 dB(A). NRR no equivale a atenuación real.',
    sourceStatus: catalogStatus, sourceUrls: ['https://www.gob.pe/institucion/mtpe/normas-legales/394457-375-2008-tr'],
  },
  {
    id: 'incendios', title: 'Incendios, evacuación y respuesta', family: 'emergency', sectorIds: allSectors,
    summary: 'Relacione combustible, fuente de ignición, detección, extinción y rutas de salida del ambiente real.',
    exposure: 'Acumulación de combustibles, instalaciones defectuosas, trabajos en caliente o rutas de evacuación obstruidas.',
    consequence: 'Quemaduras, inhalación de humo, atrapamiento y pérdidas materiales.',
    controls: ['Controlar fuentes de ignición y separar materiales incompatibles o inflamables.', 'Mantener salidas despejadas, detección y equipos de respuesta apropiados al riesgo.', 'Practicar evacuación; activar la alarma y pedir ayuda, sin intervenir fuera de la capacitación recibida.'],
    verification: ['Inspección de rutas, equipos y señalización; mantenimiento documentado.', 'Plan de emergencia, responsables, capacitación y registro de simulacros.'],
    normIds: baseNorms, instruments: ['Lista de inspección de extintores', 'Sistema de detección según diseño'], ppe: ['Equipos de intervención solo para brigadistas capacitados'],
    limits: 'El agente extintor y la cantidad de equipos requieren evaluación del riesgo y reglas aplicables a la instalación. No usar agua sobre instalaciones energizadas. La ficha no sustituye ITSE ni diseño de protección contra incendios; edición de NTP de extintores PENDIENTE DE VALIDACIÓN.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'quimicos', title: 'Sustancias químicas, FDS y compatibilidad', family: 'chemical', sectorIds: allSectors,
    summary: 'Use la identidad de la sustancia, su ficha de datos de seguridad y el proceso para decidir controles.',
    exposure: 'Inhalación de vapores, gases, polvos y aerosoles; contacto cutáneo u ocular; trasvase o mezcla incompatible.',
    consequence: 'Irritación, quemaduras, intoxicación, sensibilización e incendio según el agente.',
    controls: ['Sustituir sustancias peligrosas y cerrar o extraer emisiones cuando sea viable.', 'Consultar FDS vigente, etiquetar envases y separar incompatibles; no mezclar productos de limpieza.', 'Preparar respuesta a derrames y seleccionar protección por agente y vía de exposición.'],
    verification: ['Inventario químico, FDS accesibles y compatibilidad documentada.', 'Evaluación de exposición y registro de inspección de ventilación, almacenamiento y respuesta.'],
    normIds: [...baseNorms, 'ds-015-2005-sa'], instruments: ['Muestreador de agentes químicos según método', 'Detector específico del gas o vapor'], ppe: ['Guante compatible según permeación', 'Protección ocular', 'Respirador y filtro seleccionados técnicamente'],
    limits: 'Los límites y métodos dependen del agente y del proceso. Un detector multigás no detecta toda sustancia. Pictogramas no equivalen a una evaluación de exposición; confirme clasificación y FDS del proveedor.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'residuos', title: 'Residuos y trazabilidad ambiental', family: 'environmental', sectorIds: allSectors,
    summary: 'Separe, identifique y gestione residuos según su peligrosidad y el régimen aplicable.',
    exposure: 'Contacto con residuos, recipientes deteriorados, derrames y mezcla de residuos incompatibles.',
    consequence: 'Cortes, infección, exposición química y contaminación de suelo o agua.',
    controls: ['Reducir generación y segregar en el punto de origen.', 'Usar recipientes compatibles, identificados y áreas temporales protegidas.', 'Entregar residuos mediante las vías autorizadas que correspondan y mantener trazabilidad.'],
    verification: ['Inventario de residuos y registros de almacenamiento y entrega.', 'Inspecciones de contenedores, gestores y documentos exigibles según el residuo.'],
    normIds: ['dl-1278', 'ds-014-2017-minam', 'law-28611'], instruments: ['Registro de peso o volumen', 'Lista de inspección de almacenamiento'], ppe: ['Guantes y calzado adecuados al residuo'],
    limits: 'Los residuos municipales, no municipales, peligrosos y sanitarios tienen reglas diferentes. No trasladar automáticamente el régimen empresarial al hogar. El código de colores debe contrastarse con la norma técnica y el ámbito aplicable.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'ergonomia', title: 'Ergonomía, posturas y manipulación de cargas', family: 'ergonomic', sectorIds: allSectors,
    summary: 'Adapte la tarea y el puesto a las personas, considerando esfuerzo, postura, repetición y recuperación.',
    exposure: 'Trabajo sentado o de pie prolongado, alcances forzados, levantamiento de cargas y movimientos repetitivos.',
    consequence: 'Fatiga, molestias y trastornos musculoesqueléticos.',
    controls: ['Rediseñar alturas, alcances y flujo para reducir esfuerzos; usar ayudas mecánicas.', 'Ajustar asiento, apoyo y pantalla a la persona; alternar tareas y posturas.', 'Evaluar fuerza, frecuencia, duración y recuperación con metodología adecuada.'],
    verification: ['Evaluación del puesto real y registro de cambios con participación del trabajador.', 'Observación posterior, mantenimiento de ayudas y seguimiento de molestias sin divulgar datos clínicos.'],
    normIds: ['rm-375-2008-tr', 'law-32721'], instruments: ['Método de evaluación ergonómica pertinente', 'Cinta métrica y observación de tarea'], ppe: ['El EPP no reemplaza el rediseño ergonómico'],
    limits: 'No existe un peso universal seguro para toda persona y tarea. Una ilustración de postura es educativa: la evaluación considera carga, alcance, frecuencia, duración y características individuales. En hogar se presenta prevención general.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'uv', title: 'Radiación UV solar y protección de piel y ojos', family: 'physical', sectorIds: ['construction', 'agriculture', 'mining', 'logistics', 'fishing', 'energy', 'services', 'education', 'domestic'],
    summary: 'Interprete el índice UV y reduzca exposición solar con organización, sombra y barreras de protección.',
    exposure: 'Trabajo al aire libre, superficies reflectantes y exposición acumulada, incluso con nubosidad.',
    consequence: 'Daño cutáneo y ocular agudo o acumulativo; el índice UV no estima un diagnóstico individual.',
    controls: ['Programar tareas y descansos para reducir exposición, y disponer sombra o cubiertas.', 'Usar ropa que cubra, protección ocular y sombrero compatibles con la tarea.', 'Añadir fotoprotección apropiada como complemento; informar y organizar vigilancia según evaluación.'],
    verification: ['IPERC de trabajo exterior, organización de horarios y disponibilidad de sombra.', 'Registro de información, entrega y uso de protección; seguimiento de salud por profesionales competentes.'],
    normIds: ['law-30102', 'ds-003-2026-sa', 'rm-546-2026-minsa'], instruments: ['Índice UV de fuente meteorológica identificada', 'Medidor UV si el procedimiento lo requiere'], ppe: ['Ropa de cobertura', 'Sombrero compatible', 'Protección ocular UV'],
    limits: 'El visor usa un índice UV seleccionado por el usuario: no es medición ni pronóstico local. No calcula minutos seguros ni riesgo de cáncer. Distinguir UV solar, UV artificial y radiación ionizante. Las obligaciones laborales no se atribuyen al hogar.',
    sourceStatus: catalogStatus, sourceUrls: ['https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index'],
  },
  {
    id: 'piel', title: 'Piel, dermatitis y contacto con sustancias', family: 'chemical', sectorIds: ['health', 'food', 'food-services', 'chemical', 'services', 'agriculture', 'manufacturing', 'workshops', 'domestic'],
    summary: 'Identifique trabajo húmedo, irritantes y sensibilizantes; proteja la piel desde el diseño del proceso.',
    exposure: 'Lavado frecuente, inmersión, contacto con productos de limpieza, aceites o sustancias sensibilizantes.',
    consequence: 'Irritación, dermatitis, sensibilización y quemaduras según el agente y la exposición.',
    controls: ['Sustituir irritantes y evitar contacto directo mediante herramientas o procesos cerrados.', 'Seleccionar guantes por sustancia y tarea; cambiar los dañados o contaminados.', 'Facilitar higiene compatible con el proceso y comunicar síntomas a salud ocupacional.'],
    verification: ['FDS y compatibilidad del material del guante; procedimiento de cambio y retiro.', 'Evaluación de contacto y derivación de molestias por personal de salud, con confidencialidad.'],
    normIds: ['law-29783', 'rm-312-2011-minsa'], instruments: ['FDS e inventario de sustancias', 'Registro de condiciones de contacto'], ppe: ['Guantes de material compatible', 'Protección facial y ropa cuando corresponda'],
    limits: 'Ningún guante protege frente a todas las sustancias. Cremas y barreras no sustituyen controles de exposición. El contenido no diagnostica dermatitis ni recomienda tratamiento médico.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'psicosocial', title: 'Salud integral, fatiga y factores psicosociales', family: 'psychosocial', sectorIds: occupational,
    summary: 'Examine organización del trabajo, carga mental, turnos, violencia y oportunidades de recuperación.',
    exposure: 'Demandas sostenidas, jornadas y turnos mal organizados, escaso apoyo, violencia o acoso.',
    consequence: 'Fatiga, malestar psicológico y deterioro de la atención y del bienestar.',
    controls: ['Revisar carga, dotación, horarios y recuperación con participación de los trabajadores.', 'Establecer canales confidenciales y procedimientos ante violencia y acoso.', 'Promover salud física y mental y acceso a atención; actuar también sobre causas organizacionales.'],
    verification: ['Plan con responsables, participación y seguimiento de medidas organizacionales.', 'Evaluación con metodología pertinente y reporte agregado que proteja datos de salud.'],
    normIds: ['rm-375-2008-tr', 'law-30947', 'rm-546-2026-minsa'], instruments: ['Evaluación psicosocial con metodología validada para el contexto'], ppe: ['No existe un EPP que controle los factores psicosociales'],
    limits: 'La R.M. 546-2026-MINSA es documento técnico de promoción de salud; no se presenta como tipificación automática de infracciones. No emitir diagnósticos ni publicar resultados individuales de salud.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'alimentos', title: 'Inocuidad alimentaria y procesos higiénicos', family: 'environmental', sectorIds: ['food', 'food-services', 'agriculture', 'fishing', 'logistics', 'health', 'education', 'domestic'],
    summary: 'Distinga SST del trabajador, inocuidad del alimento y gestión ambiental de la operación.',
    exposure: 'Cruce de operaciones limpias y sucias, pérdida de cadena de frío, alérgenos y limpieza insuficiente.',
    consequence: 'Contaminación del alimento; además, quemaduras, cortes, caídas o exposición química del trabajador.',
    controls: ['Separar flujos y utensilios para evitar contaminación cruzada; identificar alérgenos.', 'Aplicar higiene, limpieza y control de plagas adecuados al proceso; controlar frío y cocción con criterios validados.', 'Analizar peligros del alimento y determinar controles; evaluar por separado riesgos ocupacionales y residuos.'],
    verification: ['Registros de higiene, proveedores, lotes, trazabilidad y temperaturas según procedimiento.', 'Verificación de limpieza y controles de proceso; evaluación SST de cortes, calor, frío y manipulación de cargas.'],
    normIds: baseNorms, instruments: ['Termómetro adecuado al proceso y calibrado', 'Registro de lotes y condiciones de almacenamiento'], ppe: ['Protección para corte, calor, frío o químicos según tarea', 'Indumentaria higiénica según proceso'],
    limits: 'BPM, HACCP, ISO 22000 y SST cumplen objetivos diferentes. Marco sanitario sectorial (D.L. 1062, D.S. 007-98-SA y normas complementarias): PENDIENTE DE VALIDACIÓN e incorporación al catálogo único. No inventar temperaturas universales ni certificar inocuidad.',
    sourceStatus: 'Marco SST disponible; alcance y referencias sanitarias PENDIENTES DE VALIDACIÓN.', sourceUrls: ['https://www.digesa.minsa.gob.pe/DCOVI/alimentos.asp'],
  },
  {
    id: 'maquinaria', title: 'Maquinaria, atrapamientos y tránsito industrial', family: 'mechanical', sectorIds: ['manufacturing', 'food', 'food-services', 'logistics', 'construction', 'mining', 'agriculture', 'fishing', 'workshops', 'energy'],
    summary: 'Reconozca partes móviles, zonas de atrapamiento y cruces entre equipos y personas.',
    exposure: 'Acceso a transmisiones, alimentación de máquinas, limpieza con energía presente o interacción con montacargas.',
    consequence: 'Cortes, aplastamiento, atrapamiento y atropello.',
    controls: ['Resguardar partes móviles y usar enclavamientos apropiados; no anularlos.', 'Aislar y bloquear energías antes de limpieza, ajuste o mantenimiento.', 'Separar rutas peatonales y vehículos, controlar cruces y operar con personal autorizado.'],
    verification: ['Inspección funcional de resguardos y parada; procedimiento de aislamiento.', 'Plan de circulación, autorización de operadores y mantenimiento de equipos.'],
    normIds: baseNorms, instruments: ['Lista de inspección de resguardos', 'Registro de mantenimiento de máquinas y vehículos'], ppe: ['Protección frente a proyecciones y calzado según tarea; evitar prendas que puedan atraparse'],
    limits: 'La parada de emergencia no reemplaza el aislamiento de energía ni un resguardo. Un diagrama educativo no valida una máquina. Respetar instrucciones y evaluación de cada equipo.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'biologicos', title: 'Agentes biológicos y punzocortantes', family: 'biological', sectorIds: ['health', 'chemical', 'food', 'food-services', 'agriculture', 'fishing', 'services', 'education', 'domestic'],
    summary: 'Identifique agente, vía de transmisión y tarea; no toda presencia implica exposición evaluada.',
    exposure: 'Contacto con fluidos, aerosoles, residuos, animales o material punzocortante contaminado.',
    consequence: 'Infección, lesión por punción o reacción alérgica según agente y vía.',
    controls: ['Reducir contacto y aplicar medidas de higiene y barreras según la vía de exposición.', 'Depositar punzocortantes inmediatamente en contenedores apropiados; evitar manipulación innecesaria.', 'Organizar respuesta a incidentes y vigilancia de salud según riesgo y protocolos aplicables.'],
    verification: ['Evaluación por tarea, formación y disponibilidad de barreras y contenedores.', 'Registro confidencial de incidentes, limpieza y gestión de residuos.'],
    normIds: ['law-29783', 'rm-312-2011-minsa', 'rm-826-2024-minsa'], instruments: ['Procedimiento de evaluación de exposición biológica', 'Contenedores identificados'], ppe: ['Guantes, protección ocular y protección respiratoria según evaluación'],
    limits: 'La NTS aprobada por R.M. 826-2024-MINSA corresponde al sector salud; no se aplica automáticamente a otras industrias. No prescribe vacunas, pruebas ni tratamientos individuales.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'alturas', title: 'Trabajo en altura y prevención de caídas', family: 'emergency', sectorIds: ['construction', 'mining', 'energy', 'logistics', 'manufacturing', 'agriculture', 'services', 'fishing'],
    summary: 'Planifique acceso, protección colectiva y rescate antes de exponer a una persona a caída.',
    exposure: 'Trabajo en bordes, cubiertas, plataformas, escaleras o superficies frágiles.',
    consequence: 'Caída de persona o de objetos hacia niveles inferiores.',
    controls: ['Realizar la tarea desde nivel seguro cuando sea viable y proteger bordes y aberturas.', 'Seleccionar acceso y plataforma adecuados; asegurar herramientas y delimitar niveles inferiores.', 'Cuando corresponda sistema personal, verificar anclaje, compatibilidad, distancia libre y plan de rescate.'],
    verification: ['Permiso o procedimiento aplicable, inspección de acceso y protección colectiva.', 'Inspección de equipos, anclajes y compatibilidad; personal formado y rescate practicable.'],
    normIds: ['law-29783', 'ds-011-2019-tr', 'rne-g050'], instruments: ['Lista de inspección de acceso, anclaje y equipos'], ppe: ['Sistema personal contra caídas seleccionado y compatible'],
    limits: 'Los requisitos sectoriales de construcción no se trasladan sin análisis a toda actividad. No existe un anclaje seguro por apariencia ni un arnés que elimine el riesgo; la distancia libre y rescate requieren evaluación específica.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'confort', title: 'Iluminación, ventilación y ambiente térmico', family: 'physical', sectorIds: allSectors,
    summary: 'Evalúe tarea, ambiente y persona: confort térmico y estrés térmico son conceptos distintos.',
    exposure: 'Calor o frío, humedad, ventilación insuficiente, deslumbramiento y niveles de iluminación inadecuados para la tarea.',
    consequence: 'Fatiga visual, incomodidad, menor atención y daño por calor o frío según exposición.',
    controls: ['Mejorar ventilación, fuentes térmicas, sombreado e iluminación según la actividad.', 'Organizar exposición, recuperación e hidratación según evaluación técnica.', 'Mantener luminarias, ventilación y equipos; atender exposiciones combinadas.'],
    verification: ['Medición representativa y documentada, con identificación y calibración de instrumentos.', 'Comparación con criterio aplicable a la tarea y comprobación posterior a los controles.'],
    normIds: ['rm-375-2008-tr', 'law-29783'], instruments: ['Luxómetro', 'Termohigrómetro', 'Equipo de estrés térmico según método, por ejemplo WBGT'], ppe: ['Ropa apropiada al calor o frío sin crear riesgos adicionales'],
    limits: 'Temperatura y humedad aisladas no calculan estrés térmico ni garantizan confort. No se establecen porcentajes universales obligatorios. La clase, método y periodicidad de calibración dependen del instrumento, uso y requisitos aplicables.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
  {
    id: 'gases', title: 'Gases, presión y espacios confinados', family: 'chemical', sectorIds: ['chemical', 'manufacturing', 'food', 'fishing', 'energy', 'mining', 'construction', 'health', 'services', 'domestic'],
    summary: 'Distinga gas tóxico, atmósfera inflamable, falta de oxígeno y energía de recipientes presurizados.',
    exposure: 'Fugas, liberación de presión o ingreso a recintos con atmósfera peligrosa y ventilación limitada.',
    consequence: 'Asfixia, intoxicación, explosión, incendio y lesiones por liberación de energía.',
    controls: ['Evitar ingreso o liberación; aislar líneas y fuentes de energía y asegurar recipientes.', 'Evaluar y medir la atmósfera con detectores apropiados, ventilación y procedimiento autorizado.', 'Planificar vigilancia y rescate competente; ante incidente no ingresar improvisadamente.'],
    verification: ['Identificación de gases, FDS, inspección de conexiones y recipientes.', 'Procedimiento o permiso, registro de mediciones y pruebas operativas; recursos de emergencia disponibles.'],
    normIds: ['law-29783', 'ds-005-2012-tr', 'ds-015-2005-sa'], instruments: ['Detector de oxígeno, inflamabilidad o gas específico según evaluación', 'Prueba funcional y calibración según fabricante y procedimiento'], ppe: ['Protección respiratoria solo dentro de programa técnico apropiado'],
    limits: 'Un respirador filtrante no aporta oxígeno y no resuelve una atmósfera desconocida. El detector debe corresponder al gas, rango y condiciones. En el hogar: prevención general, aislamiento seguro y asistencia competente; sin ingreso ni reparación improvisada.',
    sourceStatus: catalogStatus, sourceUrls: [],
  },
]
