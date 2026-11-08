import type { SafetySign, SignFamily } from './signs'
import { NTP, s } from './signsExtra'

/**
 * Señales adicionales de uso en Perú (NTP 399.010-1, RNE A.130, minería, construcción, INDECI) y del catálogo
 * internacional ISO 7010. Los códigos ISO son una referencia de equivalencia: valide el código y el pictograma
 * oficial en la norma vigente antes de un uso normativo. Pictogramas ilustrativos.
 */
const P: SignFamily = 'prohibicion'
const O: SignFamily = 'obligacion'
const A: SignFamily = 'advertencia'
const E: SignFamily = 'emergencia'
const F: SignFamily = 'incendios'

const DS011 = 'D.S. 011-2019-TR (construcción civil)'
const DS005 = 'D.S. 005-2012-TR'
const DS024 = 'D.S. 024-2016-EM (minería)'
const A130 = 'Norma A.130 del RNE'
const EXT = 'NTP 350.043-1:2011'
const RESESATE = 'R.M. 111-2013-MEM/DM (RESESATE)'
const INDECI = 'INDECI (señalización de evacuación)'

/** Constructor compacto con "dónde colocarla" antes de riesgos: id, familia, texto, icono, ISO, descripción, dónde, riesgos, controles, EPP, normas. */
const n = (
  id: string, family: SignFamily, text: string, icon: string, iso: string | undefined, description: string,
  where: string[], risks: string[], controls: string[], epp?: string[], norms: string[] = [NTP],
): SafetySign => s(id, family, text, icon, iso, description, risks, controls, norms, epp, where)

export const WORLD_SIGNS: SafetySign[] = [
  // ---------------- Prohibición (P0xx) ----------------
  n('prohibicion-general', P, 'PROHIBIDO (PROHIBICIÓN GENERAL)', 'Ban', 'P001', 'Prohibición general; se acompaña de un texto que explica qué está prohibido.', ['Cualquier área con una conducta restringida'], ['Incumplimiento de reglas de seguridad'], ['Texto complementario claro', 'Supervisión', 'Inducción']),
  n('agua-no-potable', P, 'AGUA NO POTABLE', 'Droplet', 'P005', 'Advierte que el agua no es apta para el consumo humano.', ['Grifos industriales', 'Lavaderos de taller', 'Líneas de agua de proceso'], ['Intoxicación', 'Enfermedades gastrointestinales'], ['Agua potable señalizada aparte', 'Rotulado de tuberías'], undefined, [NTP, 'D.S. 031-2010-SA (agua para consumo humano)']),
  n('no-implantes-metalicos', P, 'PROHIBIDO EL ACCESO CON IMPLANTES METÁLICOS', 'Magnet', 'P007', 'Impide el ingreso de personas con implantes metálicos a zonas con campos magnéticos intensos.', ['Salas de resonancia magnética', 'Zonas de imanes industriales'], ['Desplazamiento o calentamiento del implante'], ['Control de acceso', 'Cuestionario de ingreso']),
  n('no-marcapasos', P, 'PROHIBIDO EL ACCESO CON MARCAPASOS', 'HeartPulse', 'P014', 'Impide el paso de portadores de dispositivos cardíacos implantados.', ['Subestaciones de alta tensión', 'Equipos de soldadura por inducción', 'Imanes de gran potencia'], ['Interferencia con el marcapasos', 'Arritmia'], ['Control de acceso', 'Evaluación médica ocupacional']),
  n('no-objetos-metalicos', P, 'PROHIBIDO OBJETOS METÁLICOS Y RELOJES', 'Anvil', 'P008', 'Prohíbe ingresar con objetos metálicos.', ['Salas de resonancia', 'Áreas con detectores de metales', 'Cercanías de campos magnéticos'], ['Proyección de objetos', 'Interferencia en equipos'], ['Casilleros previos al ingreso']),
  n('no-carga-pesada', P, 'PROHIBIDO CARGAS PESADAS', 'Weight', 'P012', 'Limita la carga a la capacidad de la estructura.', ['Entrepisos y mezanines', 'Estantes', 'Plataformas y pasarelas'], ['Colapso de estructura', 'Caída de personas y materiales'], ['Rótulo con carga máxima admisible', 'Cálculo estructural']),
  n('no-bajo-carga', P, 'PROHIBIDO PASAR BAJO CARGAS SUSPENDIDAS', 'Package', undefined, 'Prohíbe permanecer o transitar bajo cargas izadas.', ['Zona de izaje', 'Patio de maniobras', 'Nave con puente grúa'], ['Golpe por caída de carga', 'Aplastamiento'], ['Delimitar radio de izaje', 'Rigger y señalero', 'Inspección de aparejos'], ['Casco'], [NTP, DS011]),
  n('no-bajo-altura', P, 'PROHIBIDO PASAR BAJO ZONA DE TRABAJO EN ALTURA', 'Construction', undefined, 'Evita transitar donde puedan caer herramientas u objetos.', ['Andamios', 'Bordes de losa', 'Fachadas en trabajo'], ['Golpe por caída de objetos'], ['Mallas y rodapiés', 'Cerco perimétrico', 'Amarre de herramientas'], ['Casco'], [NTP, DS011]),
  n('no-ingreso-sin-epp', P, 'PROHIBIDO INGRESAR SIN EQUIPO DE PROTECCIÓN', 'HardHat', undefined, 'Condiciona el ingreso al uso de los EPP básicos.', ['Ingreso a planta, obra o mina', 'Portería de almacenes'], ['Lesiones por falta de protección'], ['Control en portería', 'Dotación y reposición de EPP'], ['Casco, lentes, calzado y chaleco'], [NTP, DS005]),
  n('no-armas', P, 'PROHIBIDO EL INGRESO CON ARMAS', 'Swords', undefined, 'Impide ingresar con armas de fuego o blancas.', ['Garitas', 'Accesos a instalaciones', 'Polvorines (salvo personal autorizado)'], ['Lesiones graves', 'Violencia'], ['Revisión en el acceso', 'Personal de vigilancia'], undefined, ['Ley 30299 (SUCAMEC)']),
  n('no-alcohol-drogas', P, 'PROHIBIDO INGRESAR EN ESTADO DE EBRIEDAD O CON LICOR', 'Wine', undefined, 'Prohíbe ingresar bajo efectos de alcohol o drogas, y portarlos.', ['Accesos a obra, mina o planta', 'Campamentos'], ['Accidentes por disminución de reflejos'], ['Pruebas de alcoholemia', 'Programa de prevención de drogas'], undefined, [NTP, DS024]),
  n('no-chispas', P, 'PROHIBIDO PRODUCIR CHISPAS', 'Zap', undefined, 'Prohíbe herramientas o acciones que produzcan chispas.', ['Atmósferas explosivas', 'Almacén de inflamables', 'Zonas clasificadas'], ['Ignición de vapores o polvos'], ['Herramientas antichispa', 'Permiso de trabajo en caliente', 'Calzado antiestático']),
  n('no-estacionar', P, 'PROHIBIDO ESTACIONAR', 'Car', undefined, 'Mantiene libres accesos, salidas y equipos de emergencia.', ['Frente a hidrantes y salidas', 'Rutas de evacuación', 'Rampas'], ['Obstrucción de emergencia', 'Atropello'], ['Demarcación en piso', 'Control vehicular']),
  n('no-exceso-velocidad', P, 'PROHIBIDO EXCEDER 20 km/h', 'Gauge', undefined, 'Limita la velocidad en áreas con peatones o maniobras.', ['Patios', 'Accesos a planta', 'Vías internas de mina'], ['Atropello', 'Colisión'], ['Reductores de velocidad', 'Control de velocidad (GPS)']),
  n('no-correr', P, 'PROHIBIDO CORRER', 'PersonStanding', undefined, 'Evita correr en áreas de riesgo de caída o choque.', ['Escaleras', 'Pasillos con equipos', 'Piso resbaloso'], ['Caídas', 'Choques'], ['Orden y limpieza', 'Piso antideslizante']),
  n('no-menores', P, 'PROHIBIDO EL INGRESO DE MENORES DE EDAD', 'Baby', undefined, 'Restringe el ingreso de menores a áreas productivas.', ['Obras', 'Plantas', 'Talleres'], ['Lesiones por exposición a peligros'], ['Control de acceso', 'Cercos'], undefined, [NTP, 'Ley 27337 (Código de los Niños y Adolescentes)']),
  n('no-manipular', P, 'PROHIBIDO MANIPULAR SIN AUTORIZACIÓN', 'Wrench', undefined, 'Solo personal autorizado puede operar o intervenir el equipo.', ['Máquinas', 'Válvulas', 'Paneles de control'], ['Arranque inesperado', 'Atrapamiento', 'Contacto eléctrico'], ['Llaves y candados', 'Autorización documentada']),
  n('no-anular-protecciones', P, 'PROHIBIDO ANULAR O PUENTEAR DISPOSITIVOS DE SEGURIDAD', 'Unplug', undefined, 'Prohíbe retirar guardas o puentear enclavamientos y sensores.', ['Máquinas con guardas', 'Líneas de producción', 'Prensas y cortadoras'], ['Atrapamiento', 'Amputación'], ['Enclavamientos', 'Inspección de guardas', 'Sanción disciplinaria'], undefined, [NTP, DS005]),
  n('no-guantes-rotativos', P, 'PROHIBIDO USAR GUANTES CERCA DE PARTES ROTATIVAS', 'HandMetal', undefined, 'Evita el atrapamiento del guante por partes en movimiento.', ['Taladros de columna', 'Tornos', 'Fresadoras'], ['Atrapamiento de la mano'], ['Procedimiento de operación segura', 'Guardas']),
  n('no-joyas', P, 'PROHIBIDO USAR JOYAS Y ROPA SUELTA', 'Gem', undefined, 'Evita engancharse con maquinaria o conducir electricidad.', ['Talleres', 'Líneas de producción', 'Cercanías a rodillos'], ['Atrapamiento', 'Contacto eléctrico'], ['Inducción', 'Uniforme ajustado', 'Cabello recogido']),
  n('no-bloquear-acceso', P, 'NO BLOQUEAR SALIDAS NI EQUIPOS DE EMERGENCIA', 'DoorOpen', undefined, 'Mantiene libres puertas, extintores, tableros y duchas.', ['Salidas', 'Frente a extintores', 'Tableros eléctricos'], ['Demora en la evacuación', 'Imposibilidad de operar equipos'], ['Demarcación de áreas libres', 'Inspecciones'], undefined, [NTP, A130]),
  n('no-apilar', P, 'PROHIBIDO APILAR POR ENCIMA DEL LÍMITE', 'Boxes', undefined, 'Limita la altura de estiba.', ['Almacenes', 'Patios de materiales'], ['Caída de carga', 'Aplastamiento'], ['Altura máxima demarcada', 'Estantería certificada'], undefined, [NTP, DS005]),
  n('no-trabajar-solo', P, 'PROHIBIDO TRABAJAR SOLO', 'User', undefined, 'Exige acompañante o vigía en tareas críticas.', ['Espacios confinados', 'Trabajos en altura', 'Trabajos eléctricos'], ['Falta de auxilio ante accidente'], ['Vigía o compañero asignado', 'Comunicación por radio'], undefined, [NTP, DS011]),
  n('no-transportar-personas', P, 'PROHIBIDO TRANSPORTAR PERSONAS EN LA CARGA', 'Users', undefined, 'Las personas no pueden viajar sobre horquillas, volquetes o plataformas de carga.', ['Montacargas', 'Camiones de obra', 'Cargadores'], ['Caída', 'Aplastamiento'], ['Transporte de personal en unidades homologadas'], undefined, [NTP, DS011]),

  // ---------------- Obligación (M0xx) ----------------
  n('obligacion-general', O, 'OBLIGACIÓN GENERAL', 'CircleAlert', 'M001', 'Obligación general; se acompaña de un texto que indica la acción exigida.', ['Cualquier área con una conducta obligatoria'], ['Incumplimiento de reglas'], ['Texto complementario claro', 'Supervisión']),
  n('uso-autonomo', O, 'USO OBLIGATORIO DE EQUIPO DE RESPIRACIÓN AUTÓNOMO', 'Wind', 'M005', 'Exige aire suministrado o autónomo (SCBA) en atmósferas peligrosas.', ['Espacios confinados', 'Emergencias con gases', 'Rescate'], ['Asfixia', 'Intoxicación'], ['Monitoreo de atmósfera', 'Entrenamiento y prueba de ajuste'], ['Equipo autónomo (SCBA) o línea de aire'], [NTP, DS024]),
  n('uso-mascarilla', O, 'USO OBLIGATORIO DE MASCARILLA', 'ScanLine', 'M016', 'Exige mascarilla contra polvo, aerosoles o agentes biológicos.', ['Tópicos y laboratorios', 'Zonas de polvo', 'Áreas limpias'], ['Inhalación de polvo', 'Contagio por vía aérea'], ['Ventilación', 'Higiene respiratoria'], ['Mascarilla quirúrgica o respirador N95/FFP2']),
  n('uso-mandil', O, 'USO OBLIGATORIO DE MANDIL O DELANTAL', 'Shirt', undefined, 'Protege el cuerpo de salpicaduras y suciedad.', ['Laboratorios', 'Cocinas industriales', 'Plantas de alimentos'], ['Quemaduras químicas', 'Contaminación'], ['Lavandería institucional'], ['Mandil de PVC, algodón o desechable']),
  n('uso-casco-barbiquejo', O, 'USO OBLIGATORIO DE CASCO CON BARBIQUEJO', 'HardHat', 'M014', 'Exige el casco asegurado con barbiquejo en trabajo en altura o con riesgo de pérdida.', ['Trabajos en altura', 'Izaje', 'Mina subterránea'], ['Pérdida del casco y golpe en la cabeza'], ['Inspección del casco', 'Reposición según fabricante'], ['Casco con barbiquejo de 3 puntos'], [NTP, DS011]),
  n('uso-gafas-quimicas', O, 'USO OBLIGATORIO DE GAFAS ANTISALPICADURAS', 'Glasses', 'M004', 'Protección hermética contra salpicaduras de líquidos.', ['Trasvase de químicos', 'Baterías', 'Laboratorio'], ['Lesión ocular química'], ['Lavaojos cercano', 'Sistemas cerrados de trasvase'], ['Gafas de seguridad tipo monogafa'], [NTP, 'D.S. 005-2026-MINAM']),
  n('uso-guantes-dielectricos', O, 'USO OBLIGATORIO DE GUANTES DIELÉCTRICOS', 'Zap', 'M009', 'Protección en maniobras sobre equipos energizados.', ['Subestaciones', 'Tableros', 'Líneas de media tensión'], ['Electrocución', 'Arco eléctrico'], ['Prueba dieléctrica periódica', 'Personal calificado'], ['Guantes dieléctricos clase según tensión'], [NTP, RESESATE]),
  n('uso-guantes-anticorte', O, 'USO OBLIGATORIO DE GUANTES ANTICORTE', 'HandMetal', 'M009', 'Protección ante filos y herramientas cortantes.', ['Manejo de planchas', 'Vidrio', 'Mataderos'], ['Cortes', 'Laceraciones'], ['Herramientas de sujeción'], ['Guantes con nivel de corte EN 388']),
  n('uso-botas-jebe', O, 'USO OBLIGATORIO DE BOTAS DE JEBE', 'Footprints', 'M008', 'Calzado impermeable y antideslizante en áreas húmedas.', ['Plantas de pescado', 'Lavado de equipos', 'Lodo en obras'], ['Resbalones', 'Infecciones por humedad', 'Contacto químico'], ['Drenaje del piso'], ['Botas de jebe con puntera de acero']),
  n('uso-botas-dielectricas', O, 'USO OBLIGATORIO DE CALZADO DIELÉCTRICO', 'Footprints', 'M008', 'Calzado aislante para riesgo eléctrico.', ['Subestaciones', 'Tableros'], ['Electrocución por paso'], ['Pisos aislantes', 'Prueba de calzado'], ['Calzado dieléctrico sin partes metálicas'], [NTP, RESESATE]),
  n('doble-proteccion-auditiva', O, 'DOBLE PROTECCIÓN AUDITIVA OBLIGATORIA', 'Ear', 'M003', 'Tapones y orejeras combinados en ruido muy alto (> 105 dB(A)).', ['Cabinas de prueba', 'Chancado y molienda', 'Turbinas'], ['Hipoacusia severa'], ['Cabina acústica', 'Rotación', 'Audiometría anual'], ['Tapones más orejeras'], [NTP, 'R.M. 375-2008-TR']),
  n('enganchar-linea-vida', O, 'ENGANCHE OBLIGATORIO A LA LÍNEA DE VIDA', 'Link', 'M018', 'Exige anclar el arnés al punto o cable de vida.', ['Cubiertas', 'Estructuras metálicas', 'Torres'], ['Caída de altura'], ['Anclajes certificados', 'Inspección diaria'], ['Arnés y doble eslinga con absorbedor'], [NTP, DS011]),
  n('bloquear-etiquetar', O, 'BLOQUEE Y ETIQUETE ANTES DE INTERVENIR', 'Lock', undefined, 'Exige aplicar LOTO antes del mantenimiento.', ['Máquinas', 'Tableros', 'Válvulas de aislamiento'], ['Arranque inesperado', 'Energía residual'], ['Procedimiento LOTO', 'Candado y tarjeta personales'], undefined, [NTP, DS005]),
  n('verificar-tension', O, 'VERIFIQUE AUSENCIA DE TENSIÓN', 'Zap', undefined, 'Obliga a comprobar que el circuito está sin tensión.', ['Tableros', 'Líneas', 'Transformadores'], ['Electrocución'], ['Detector de tensión', 'Cinco reglas de oro'], ['Guantes dieléctricos'], [NTP, RESESATE]),
  n('puesta-tierra', O, 'PUESTA A TIERRA OBLIGATORIA', 'Cable', undefined, 'Exige conectar el equipo a tierra antes de operar.', ['Camiones cisterna', 'Equipos eléctricos portátiles', 'Trasvase de inflamables'], ['Descarga electrostática', 'Electrocución'], ['Pinzas de tierra', 'Medición del pozo a tierra'], undefined, [NTP, RESESATE]),
  n('monitorear-atmosfera', O, 'MONITOREE LA ATMÓSFERA ANTES DE INGRESAR', 'Gauge', undefined, 'Exige medir O₂, gases tóxicos y explosividad.', ['Espacios confinados', 'Alcantarillas', 'Tanques'], ['Asfixia', 'Intoxicación', 'Explosión'], ['Detector multigás calibrado', 'Permiso de ingreso', 'Vigía'], undefined, [NTP, DS024]),
  n('proteccion-soldadura', O, 'USO OBLIGATORIO DE PROTECCIÓN OCULAR DE SOLDADURA', 'ScanEye', 'M013', 'Filtro adecuado contra radiación del arco.', ['Talleres de soldadura', 'Obras metálicas'], ['Fotoqueratitis', 'Quemaduras de arco'], ['Biombos', 'Extracción de humos'], ['Careta con filtro DIN 10–13']),
  n('uso-cinturon-vehicular', O, 'USE EL CINTURÓN DE SEGURIDAD', 'Car', undefined, 'Obligatorio en vehículos y maquinaria.', ['Camionetas', 'Montacargas', 'Volquetes'], ['Lesiones graves en colisión o vuelco'], ['Inspección de cinturones', 'Alarma de cinturón'], undefined, [NTP, 'D.S. 016-2009-MTC (Reglamento nacional de tránsito)']),
  n('velocidad-maxima', O, 'VELOCIDAD MÁXIMA 20 km/h', 'Gauge', undefined, 'Obliga a respetar el límite de velocidad interno.', ['Vías internas', 'Patios de maniobra'], ['Colisión', 'Atropello'], ['Plan de gestión de tránsito', 'Reductores'], undefined, [NTP, DS024]),
  n('pare', O, 'PARE: CEDA EL PASO A PEATONES Y MAQUINARIA', 'OctagonX', undefined, 'Detención obligatoria en cruces internos.', ['Cruces de vías', 'Salida de almacenes'], ['Atropello', 'Colisión'], ['Espejos convexos', 'Señalero']),
  n('ropa-ignifuga', O, 'USO OBLIGATORIO DE ROPA IGNÍFUGA', 'Flame', 'M010', 'Ropa resistente a llama y arco eléctrico.', ['Fundiciones', 'Trabajos en caliente', 'Subestaciones'], ['Quemaduras'], ['Procedimiento de trabajo en caliente'], ['Ropa FR / arco eléctrico según cal/cm²'], [NTP, RESESATE]),
  n('proteccion-solar', O, 'USE PROTECTOR SOLAR Y ROPA CONTRA RADIACIÓN UV', 'Sun', undefined, 'Protege de la radiación ultravioleta (alta en costa y sierra).', ['Obras a cielo abierto', 'Minería de altura', 'Agroindustria'], ['Quemaduras solares', 'Cáncer de piel'], ['Pausas en sombra', 'Programa de radiación UV'], ['Bloqueador FPS 50+, legionario, ropa manga larga'], [NTP, 'R.M. 375-2008-TR']),
  n('segregar-residuos', O, 'SEGREGUE LOS RESIDUOS', 'Recycle', undefined, 'Obliga a depositar los residuos en el contenedor correcto.', ['Puntos de acopio', 'Comedores'], ['Contaminación cruzada'], ['Código de colores NTP 900.058'], undefined, ['NTP 900.058:2019 (código de colores)', 'D. Leg. 1278']),
  n('apagar-motor', O, 'APAGUE EL MOTOR AL ABASTECER COMBUSTIBLE', 'Fuel', undefined, 'Elimina la fuente de ignición durante el abastecimiento.', ['Grifos', 'Tanques de combustible'], ['Incendio', 'Explosión'], ['Procedimiento de abastecimiento', 'Extintor a la mano'], undefined, [NTP, 'D.S. 054-93-EM (almacenamiento de hidrocarburos)']),

  // ---------------- Advertencia (W0xx) ----------------
  n('peligro-general', A, 'ADVERTENCIA: PELIGRO EN GENERAL', 'TriangleAlert', 'W001', 'Advertencia general; se acompaña de texto que explica el peligro.', ['Cualquier área con peligro no cubierto por otra señal'], ['Lesiones diversas'], ['Texto complementario', 'Control del peligro específico']),
  n('laser', A, 'RADIACIÓN LÁSER', 'ScanEye', 'W004', 'Haces láser de clase 3B o 4.', ['Laboratorios', 'Equipos de corte láser', 'Topografía'], ['Lesión ocular permanente', 'Quemaduras'], ['Cerramiento del haz', 'Interbloqueo de puertas'], ['Gafas láser según longitud de onda']),
  n('radiacion-no-ionizante', A, 'RADIACIÓN NO IONIZANTE', 'RadioTower', 'W005', 'Antenas, radiofrecuencia y campos electromagnéticos.', ['Torres de telecomunicaciones', 'Hornos de microondas industriales', 'Soldadura por inducción'], ['Calentamiento de tejidos', 'Interferencia con dispositivos implantados'], ['Distancias de seguridad', 'Apagado antes de trabajar en la antena']),
  n('obstaculos-piso', A, 'CUIDADO: OBSTÁCULOS EN EL PISO', 'Footprints', 'W007', 'Cables, mangueras o desniveles en el suelo.', ['Talleres', 'Obras', 'Pasillos con mangueras'], ['Tropiezos y caídas'], ['Canaletas pasacables', 'Orden y limpieza']),
  n('caida-objetos', A, 'CAÍDA DE OBJETOS', 'Package', undefined, 'Riesgo de caída de herramientas o materiales desde altura.', ['Bajo andamios', 'Estantes altos', 'Cercanías a grúas'], ['Golpes en la cabeza', 'Aplastamiento'], ['Mallas y rodapiés', 'Amarre de herramientas'], ['Casco', 'Calzado con puntera']),
  n('peligro-muerte', A, 'PELIGRO DE MUERTE', 'Skull', 'W016', 'Peligro mortal inminente; se usa con otra señal que indica el tipo.', ['Alta tensión', 'Atmósferas tóxicas', 'Zonas de voladura'], ['Muerte', 'Lesiones graves'], ['Acceso restringido', 'Procedimientos críticos']),
  n('alta-tension', A, 'PELIGRO ALTA TENSIÓN', 'Zap', 'W012', 'Equipos o líneas de tensión mayor a 1 kV.', ['Subestaciones', 'Transformadores', 'Celdas de media tensión', 'Postes y líneas aéreas'], ['Electrocución', 'Arco eléctrico', 'Quemaduras'], ['Distancias de seguridad', 'LOTO', 'Puesta a tierra'], ['Ropa para arco eléctrico', 'Guantes dieléctricos'], [NTP, RESESATE]),
  n('linea-energizada', A, 'LÍNEA ENERGIZADA', 'Cable', 'W012', 'Conductores con tensión; trabajos solo por personal calificado.', ['Tendidos eléctricos', 'Cables de obra', 'Zona de grúas cercana a líneas'], ['Electrocución', 'Incendio'], ['Distancia mínima de seguridad', 'Aislamiento', 'Señalero'], undefined, [NTP, RESESATE]),
  n('aplastamiento', A, 'RIESGO DE APLASTAMIENTO', 'Hand', 'W019', 'Partes que se cierran o comprimen (prensas, puertas, rodillos).', ['Prensas', 'Plataformas elevadoras', 'Compactadoras'], ['Aplastamiento', 'Amputación'], ['Dispositivos bimanuales', 'Parada de emergencia', 'LOTO'], undefined, [NTP, DS005]),
  n('punzocortante', A, 'OBJETOS PUNZOCORTANTES', 'Scissors', 'W022', 'Filos, agujas, vidrio o varillas expuestas.', ['Tópicos', 'Laboratorios', 'Obras (fierro corrugado)'], ['Cortes', 'Pinchazos', 'Infecciones'], ['Contenedores rígidos para punzocortantes', 'Protectores de varillas'], ['Guantes anticorte']),
  n('obstaculo-cabeza', A, 'CUIDADO: OBSTÁCULO A LA ALTURA DE LA CABEZA', 'TriangleAlert', 'W020', 'Vigas, tuberías o techos bajos.', ['Pasadizos con tuberías', 'Sótanos', 'Cisternas'], ['Golpes en la cabeza'], ['Acolchado y pintura amarilla-negra'], ['Casco']),
  n('alarma-sonora', A, 'ALARMA SONORA: PUEDE ACTIVARSE SIN AVISO', 'Megaphone', undefined, 'Zona con parlantes, sirenas o alarmas de alto nivel sonoro.', ['Cercanías de sirenas', 'Salas de máquinas', 'Plantas con alarma de proceso'], ['Sobresalto', 'Trauma acústico'], ['Plan de alarmas', 'Protección auditiva'], ['Protección auditiva'], [NTP, 'R.M. 375-2008-TR']),
  n('zona-ruido', A, 'ZONA DE RUIDO MAYOR A 85 dB(A)', 'Volume2', undefined, 'Área donde el nivel de ruido supera el límite de acción.', ['Compresores', 'Chancado', 'Generadores y turbinas'], ['Hipoacusia inducida por ruido'], ['Mapa de ruido', 'Cabinas', 'Audiometrías'], ['Orejeras o tapones (NRR adecuado)'], [NTP, 'R.M. 375-2008-TR']),
  n('oxigeno', A, 'OXÍGENO: GAS COMBURENTE A PRESIÓN', 'Cylinder', 'W028', 'Cilindros de oxígeno que avivan el fuego.', ['Soldadura oxiacetilénica', 'Tópicos y hospitales'], ['Incendio acelerado', 'Explosión'], ['Sin grasas ni aceites', 'Cilindros asegurados']),
  n('acetileno', A, 'ACETILENO: GAS INFLAMABLE', 'Flame', 'W021', 'Cilindros de acetileno disueltos a presión.', ['Talleres de soldadura', 'Obras'], ['Incendio', 'Explosión'], ['Cilindros verticales y asegurados', 'Válvulas antirretorno'], ['Guantes de cuero', 'Careta'], [NTP, 'NFPA 51']),
  n('gas-toxico', A, 'PRESENCIA DE GASES TÓXICOS', 'Skull', 'W016', 'Posible CO, H₂S u otros gases tóxicos.', ['Minería subterránea', 'Alcantarillado', 'Plantas de gas'], ['Intoxicación aguda', 'Muerte'], ['Detector de gases', 'Ventilación forzada'], ['Respirador o SCBA según medición'], [NTP, DS024]),
  n('h2s', A, 'ÁCIDO SULFHÍDRICO (H₂S): GAS MORTAL', 'Biohazard', 'W016', 'Gas incoloro que paraliza el olfato en altas concentraciones.', ['Refinerías', 'Plantas de aguas residuales', 'Pozos petroleros'], ['Muerte súbita', 'Daño respiratorio'], ['Monitor personal H₂S', 'Plan de evacuación'], ['Equipo autónomo en emergencias']),
  n('deficiencia-oxigeno', A, 'ATMÓSFERA DEFICIENTE EN OXÍGENO', 'Wind', undefined, 'Concentración de oxígeno menor a 19,5 %.', ['Espacios confinados', 'Bodegas de barcos', 'Sótanos cerrados'], ['Asfixia', 'Pérdida de conocimiento'], ['Medición continua', 'Ventilación', 'Vigía'], ['Línea de aire o SCBA'], [NTP, DS024]),
  n('rayos-x', A, 'ZONA DE RAYOS X', 'ScanLine', 'W003', 'Equipos de radiodiagnóstico o inspección con rayos X.', ['Salas de radiología', 'Inspección de soldaduras', 'Control de equipaje'], ['Exposición a radiación ionizante'], ['Blindaje de plomo', 'Dosímetro', 'Luz roja de exposición'], ['Mandil plomado'], [NTP, 'Ley 28028 (IPEN)']),
  n('trabajos-altura', A, 'TRABAJOS EN ALTURA', 'TriangleAlert', 'W008', 'Labores a más de 1,80 m sobre el nivel inferior.', ['Frentes de obra', 'Estructuras', 'Cubiertas'], ['Caída de altura'], ['PETAR', 'Línea de vida', 'Barandas'], ['Arnés de cuerpo entero'], [NTP, DS011]),
  n('trabajos-caliente', A, 'TRABAJOS EN CALIENTE', 'Flame', 'W021', 'Soldadura, corte u operaciones con chispa o llama.', ['Talleres', 'Obras', 'Plantas'], ['Incendio', 'Quemaduras'], ['Permiso de trabajo en caliente', 'Vigía de fuego', 'Extintor'], ['Ropa ignífuga', 'Careta de soldar'], [NTP, 'NFPA 51B']),
  n('soldadura', A, 'SOLDADURA: RADIACIÓN Y HUMOS METÁLICOS', 'Zap', 'W005', 'Arco de soldadura con emisión UV y humos.', ['Talleres de soldadura'], ['Fotoqueratitis', 'Fiebre de humos metálicos'], ['Biombos', 'Extracción localizada'], ['Careta, respirador, guantes de cuero']),
  n('excavacion', A, 'EXCAVACIÓN ABIERTA: RIESGO DE CAÍDA', 'Shovel', 'W008', 'Zanjas, pozos y huecos abiertos.', ['Zanjas de obra', 'Cimentaciones', 'Pozos'], ['Caída de personas', 'Derrumbe de talud'], ['Cercos, barandas y señal luminosa nocturna', 'Entibado'], ['Casco', 'Calzado de seguridad'], [NTP, DS011]),
  n('caida-rocas', A, 'CAÍDA DE ROCAS / TALUD INESTABLE', 'Mountain', undefined, 'Taludes, frentes y laderas con desprendimientos.', ['Carreteras de acceso', 'Tajos abiertos', 'Frentes de mina'], ['Aplastamiento', 'Golpes por rocas'], ['Desatado de rocas', 'Mallas y bermas', 'Monitoreo geotécnico'], ['Casco'], [NTP, DS024]),
  n('zona-voladura', A, 'ZONA DE VOLADURA', 'Bomb', 'W002', 'Área con explosivos o detonaciones programadas.', ['Minas a tajo abierto', 'Canteras', 'Obras de roca'], ['Proyección de fragmentos', 'Onda aérea'], ['Radio de evacuación', 'Horario y alarmas de voladura', 'Guardias en accesos'], undefined, [NTP, DS024, 'Ley 30299 (SUCAMEC)']),
  n('locomotora', A, 'CRUCE DE LOCOMOTORAS Y FERROCARRIL', 'Train', undefined, 'Vías férreas de uso industrial o minero.', ['Cruces de vía', 'Patios de maniobra', 'Minería subterránea'], ['Atropello', 'Arrastre'], ['Barreras y alarma', 'Señaleros'], ['Chaleco reflectivo'], [NTP, DS024]),
  n('radio-giro-grua', A, 'RADIO DE GIRO DE GRÚA', 'Construction', 'W015', 'Zona en la que opera el brazo o contrapeso de una grúa.', ['Obras con grúa torre', 'Patios con grúa móvil'], ['Golpe', 'Aplastamiento'], ['Barreras físicas', 'Señalero y rigger'], ['Casco', 'Chaleco'], [NTP, DS011]),
  n('maquinaria-pesada', A, 'TRÁNSITO DE MAQUINARIA PESADA', 'Tractor', 'W014', 'Excavadoras, cargadores y volquetes en operación.', ['Obras civiles', 'Minas', 'Canteras'], ['Atropello', 'Atrapamiento', 'Vuelco'], ['Vigía', 'Distancia mínima de seguridad', 'Alarma de retroceso'], ['Chaleco reflectivo'], [NTP, DS011, DS024]),
  n('inundacion', A, 'RIESGO DE INUNDACIÓN O HUAYCO', 'Waves', undefined, 'Zonas de quebradas o cauces con crecida.', ['Quebradas', 'Campamentos cercanos a ríos', 'Obras en temporada de lluvia'], ['Arrastre', 'Ahogamiento'], ['Sistema de alerta temprana', 'Rutas de evacuación'], undefined, [NTP, INDECI]),
  n('animales-ponzonosos', A, 'ANIMALES PONZOÑOSOS', 'Bug', undefined, 'Serpientes, arácnidos o insectos venenosos.', ['Selva y ceja de selva', 'Campamentos rurales', 'Depósitos de materiales'], ['Mordeduras y picaduras', 'Envenenamiento'], ['Suero antiofídico disponible', 'Limpieza y desmalezado'], ['Botas altas', 'Guantes']),
  n('estres-termico', A, 'ALTAS TEMPERATURAS: ESTRÉS TÉRMICO', 'Sun', undefined, 'Trabajo en calor extremo.', ['Hornos', 'Calderos', 'Obras a pleno sol'], ['Golpe de calor', 'Deshidratación'], ['Pausas de recuperación', 'Hidratación', 'Aclimatación'], ['Ropa ligera', 'Sombrero'], [NTP, 'R.M. 375-2008-TR']),
  n('atex-polvo', A, 'ATMÓSFERA EXPLOSIVA POR POLVO', 'Wind', 'W002', 'Polvos combustibles en suspensión (harina, azúcar, carbón).', ['Molinos', 'Silos', 'Carpinterías'], ['Explosión de polvo'], ['Aspiración localizada', 'Equipos ATEX', 'Control de ignición'], undefined, [NTP, 'NFPA 652']),
  n('partes-moviles', A, 'PARTES MÓVILES Y ENGRANAJES', 'Cog', 'W024', 'Poleas, correas, cadenas y engranajes en movimiento.', ['Motores', 'Transmisiones', 'Reductores'], ['Atrapamiento', 'Amputación'], ['Guardas fijas', 'LOTO'], undefined, [NTP, DS005]),
  n('faja-transportadora', A, 'FAJA TRANSPORTADORA EN MOVIMIENTO', 'Cog', 'W024', 'Fajas y rodillos que pueden arrancar sin aviso.', ['Minas', 'Plantas de procesamiento', 'Almacenes'], ['Atrapamiento', 'Arrastre'], ['Cable de parada de emergencia', 'Alarma previa al arranque'], undefined, [NTP, DS024]),
  n('alta-presion', A, 'LÍNEAS A ALTA PRESIÓN', 'Gauge', undefined, 'Tuberías hidráulicas o neumáticas presurizadas.', ['Sistemas hidráulicos', 'Compresores', 'Hidrolavadoras'], ['Inyección de fluidos', 'Latigazo de manguera'], ['Despresurizar antes de intervenir', 'Mangueras certificadas'], ['Careta', 'Guantes'], [NTP, DS005]),

  // ---------------- Evacuación y primeros auxilios (E0xx) ----------------
  n('salida-izquierda', E, 'SALIDA DE EMERGENCIA (IZQUIERDA)', 'DoorOpen', 'E001', 'Dirección a la salida de emergencia hacia la izquierda.', ['Pasillos', 'Rutas de evacuación'], ['Desorientación'], ['Iluminación de emergencia', 'Señal fotoluminiscente'], undefined, [NTP, A130]),
  n('salida-derecha', E, 'SALIDA DE EMERGENCIA (DERECHA)', 'DoorOpen', 'E002', 'Dirección a la salida de emergencia hacia la derecha.', ['Pasillos', 'Rutas de evacuación'], ['Desorientación'], ['Iluminación de emergencia', 'Señal fotoluminiscente'], undefined, [NTP, A130]),
  n('salida-empujar', E, 'EMPUJE PARA ABRIR (SALIDA DE EMERGENCIA)', 'DoorOpen', undefined, 'Puertas con barra antipánico.', ['Puertas de evacuación'], ['Atrapamiento en pánico'], ['Barra antipánico', 'Puerta que abre hacia afuera'], undefined, [NTP, A130]),
  n('escalera-evacuacion', E, 'ESCALERA DE EVACUACIÓN', 'Footprints', undefined, 'Escalera protegida o de emergencia.', ['Cajas de escalera', 'Niveles superiores'], ['Caídas en la evacuación', 'Congestión'], ['Iluminación', 'Pasamanos', 'Libre de obstáculos'], undefined, [NTP, A130]),
  n('ruta-izquierda', E, 'RUTA DE EVACUACIÓN A LA IZQUIERDA', 'ArrowBigLeft', undefined, 'Indica el sentido de evacuación.', ['Pasillos', 'Cambios de dirección'], ['Desorientación'], ['Señales en cada giro y a 1,50–2,00 m de altura'], undefined, [NTP, A130]),
  n('ruta-adelante', E, 'RUTA DE EVACUACIÓN HACIA ADELANTE', 'ArrowBigUp', undefined, 'Indica continuar de frente.', ['Pasillos largos'], ['Desorientación'], ['Señales en cada giro y en tramos largos'], undefined, [NTP, A130]),
  n('ruta-abajo', E, 'RUTA DE EVACUACIÓN HACIA ABAJO', 'ArrowBigDown', undefined, 'Indica descenso por escalera.', ['Cajas de escalera'], ['Desorientación'], ['Señales en cada rellano'], undefined, [NTP, A130]),
  n('zona-insegura-sismo', E, 'ZONA INSEGURA EN CASO DE SISMO', 'TriangleAlert', undefined, 'Zonas con caída de vidrios, ventanas, lámparas o estantes.', ['Junto a ventanas', 'Bajo lámparas y estantes altos'], ['Golpes', 'Cortes por vidrio'], ['Evaluación de zonas', 'Simulacros'], undefined, [INDECI, A130]),
  n('zona-tsunami', E, 'ZONA DE EVACUACIÓN POR TSUNAMI', 'Waves', undefined, 'Señal INDECI para zonas costeras: lugar elevado seguro.', ['Litoral', 'Puertos', 'Plantas pesqueras'], ['Arrastre', 'Ahogamiento'], ['Rutas señalizadas', 'Simulacros costeros'], undefined, [INDECI]),
  n('ruta-tsunami', E, 'RUTA DE EVACUACIÓN POR TSUNAMI', 'ArrowBigRight', undefined, 'Dirección hacia zona alta segura.', ['Calles costeras', 'Accesos de puertos'], ['Desorientación'], ['Señalización continua', 'Iluminación'], undefined, [INDECI]),
  n('zona-externa', E, 'ZONA DE SEGURIDAD EXTERNA', 'Users', 'E007', 'Espacio abierto seguro fuera de la edificación.', ['Patios', 'Estacionamientos', 'Parques cercanos'], ['Congestión', 'Colapso de estructuras'], ['Conteo de personal', 'Brigadistas'], undefined, [INDECI, A130]),
  n('ducha-emergencia', E, 'DUCHA DE EMERGENCIA', 'ShowerHead', 'E012', 'Ubica la ducha para descontaminación.', ['Almacén de químicos', 'Laboratorios', 'Zona de baterías'], ['Quemaduras químicas'], ['Probar semanalmente', 'Acceso libre de 1 m', 'Agua tibia de ser posible'], undefined, [NTP, 'ANSI/ISEA Z358.1']),
  n('topico', E, 'TÓPICO / ENFERMERÍA', 'Cross', 'E003', 'Ubica el consultorio de salud ocupacional.', ['Pasillos de acceso', 'Recepción'], ['Demora en la atención'], ['Personal de salud', 'Equipo de reanimación']),
  n('ambulancia', E, 'AMBULANCIA / ZONA DE EVACUACIÓN MÉDICA', 'Ambulance', undefined, 'Punto de ingreso y espera de la ambulancia.', ['Accesos vehiculares', 'Campamentos'], ['Demora en el traslado'], ['Vía libre', 'Contacto SAMU 106']),
  n('ruta-accesible', E, 'RUTA ACCESIBLE PARA PERSONAS CON DISCAPACIDAD', 'Accessibility', undefined, 'Evacuación accesible o refugio para personas con movilidad reducida.', ['Rampas', 'Ascensores de evacuación', 'Áreas de refugio'], ['Imposibilidad de evacuar'], ['Plan de evacuación inclusivo', 'Sillas de evacuación'], undefined, [A130, 'Norma A.120 del RNE (accesibilidad)']),
  n('area-refugio', E, 'ÁREA DE REFUGIO', 'Tent', undefined, 'Espacio protegido temporal durante evacuaciones.', ['Rellanos de escalera', 'Pisos altos'], ['Humo', 'Fuego'], ['Compartimentación', 'Comunicación de emergencia'], undefined, [A130]),
  n('corte-energia', E, 'CORTE GENERAL DE ENERGÍA ELÉCTRICA', 'PowerOff', undefined, 'Ubica el interruptor general de emergencia.', ['Tablero general', 'Sala eléctrica'], ['Electrocución en emergencias'], ['Acceso libre', 'Personal capacitado'], undefined, [NTP, RESESATE]),
  n('corte-gas', E, 'VÁLVULA DE CORTE DE GAS', 'Fuel', undefined, 'Ubica la llave general de cierre de gas.', ['Cocinas', 'Calderos', 'Casetas de GLP/GN'], ['Fuga de gas', 'Explosión'], ['Acceso libre', 'Detectores de gas']),
  n('kit-derrames', E, 'KIT ANTIDERRAMES', 'Droplets', undefined, 'Contención y absorción de derrames.', ['Almacén de químicos', 'Zona de combustibles', 'Taller'], ['Contaminación', 'Resbalones', 'Incendio'], ['Inspección mensual', 'Reposición tras uso'], ['Guantes de nitrilo', 'Lentes'], [NTP, 'D.S. 005-2026-MINAM']),
  n('agachese-cubrase', E, 'SISMO: AGÁCHESE, CÚBRASE Y AGÁRRESE', 'Shield', undefined, 'Recordatorio de conducta durante un sismo.', ['Aulas', 'Oficinas', 'Áreas comunes'], ['Golpes por caída de objetos'], ['Simulacros de sismo', 'Capacitación a brigadas'], undefined, [INDECI]),

  // ---------------- Equipos contra incendios (F0xx) ----------------
  n('carrete-manguera', F, 'CARRETE DE MANGUERA CONTRA INCENDIOS', 'Waves', 'F002', 'Manguera enrollable conectada a la red de agua.', ['Gabinetes de pasillos', 'Zonas industriales'], ['Propagación del fuego'], ['Prueba hidrostática', 'Capacitación'], undefined, [A130, 'NFPA 14']),
  n('escalera-incendio', F, 'ESCALERA CONTRA INCENDIOS', 'Layers', 'F003', 'Escalera de acceso para bomberos.', ['Fachadas', 'Techos'], ['Acceso tardío'], ['Inspección anual'], undefined, [A130]),
  n('extintor-co2', F, 'EXTINTOR DE CO₂ (CLASE B Y C)', 'FireExtinguisher', 'F001', 'Para líquidos inflamables y equipos energizados.', ['Salas eléctricas', 'Servidores', 'Laboratorios'], ['Incendio eléctrico', 'Congelamiento por contacto'], ['Inspección mensual', 'Recarga según NTP'], undefined, [EXT, A130]),
  n('extintor-pqs', F, 'EXTINTOR PQS ABC', 'FireExtinguisher', 'F001', 'Polvo químico seco multipropósito.', ['Oficinas', 'Almacenes', 'Vehículos'], ['Incendio clase A, B y C'], ['Inspección mensual', 'Mantenimiento anual'], undefined, [EXT, A130]),
  n('extintor-agua', F, 'EXTINTOR DE AGUA PRESURIZADA (CLASE A)', 'FireExtinguisher', 'F001', 'Para fuegos de sólidos combustibles.', ['Zonas de madera y papel', 'Archivos'], ['Incendio clase A'], ['No usar en equipos energizados'], undefined, [EXT, A130]),
  n('extintor-k', F, 'EXTINTOR CLASE K (COCINAS)', 'FireExtinguisher', 'F001', 'Para grasas y aceites de cocina.', ['Cocinas industriales', 'Freidoras'], ['Incendio por aceite caliente'], ['Instalar cerca de la freidora, con acceso libre'], undefined, [EXT, A130]),
  n('extintor-rodante', F, 'EXTINTOR RODANTE', 'FireExtinguisher', 'F001', 'Equipo móvil de gran capacidad (50 a 150 kg).', ['Estaciones de combustible', 'Patios'], ['Incendio de gran magnitud'], ['Acceso libre', 'Personal capacitado'], undefined, [EXT, A130]),
  n('rociadores', F, 'VÁLVULA DE ROCIADORES (SPRINKLERS)', 'Droplets', undefined, 'Ubica la válvula de control del sistema de rociadores.', ['Cuartos de válvulas', 'Pisos técnicos'], ['Falla del sistema'], ['Válvula abierta y precintada', 'Inspección mensual'], undefined, [A130, 'NFPA 13']),
  n('panel-alarma', F, 'PANEL DE ALARMA CONTRA INCENDIOS', 'Siren', undefined, 'Central de detección y alarma.', ['Recepción', 'Sala de control'], ['Detección tardía'], ['Mantenimiento', 'Panel visible'], undefined, [A130, 'NFPA 72']),
  n('detector-humo', F, 'DETECTOR DE HUMO', 'Bell', undefined, 'Dispositivo de detección temprana.', ['Techos de oficinas', 'Salas técnicas'], ['Detección tardía'], ['Pruebas semestrales', 'Limpieza'], undefined, [A130, 'NFPA 72']),
  n('manta-ignifuga', F, 'MANTA IGNÍFUGA', 'Shield', undefined, 'Para sofocar fuegos pequeños y envolver personas.', ['Cocinas', 'Laboratorios', 'Talleres'], ['Quemaduras de personas', 'Incendio incipiente'], ['Capacitación en uso'], undefined, [A130]),
  n('puerta-cortafuego', F, 'PUERTA CORTAFUEGO: MANTENER CERRADA', 'DoorClosed', undefined, 'Puerta resistente al fuego; no debe calzarse abierta.', ['Cajas de escalera', 'Cuartos eléctricos'], ['Propagación del fuego y humo'], ['Cierrapuertas operativo', 'Prohibido calzarla'], undefined, [A130]),
]

/** "Dónde colocarla" de las señales del catálogo adicional que no lo traían. */
export const WHERE_BACKFILL: Record<string, string[]> = {
  'no-peatones': ['Rampas y vías de montacargas', 'Patios de maniobra'],
  'no-tocar': ['Equipos calientes o energizados', 'Piezas en movimiento'],
  'no-comer': ['Laboratorios', 'Talleres y áreas con químicos'],
  'no-fotos': ['Áreas restringidas', 'Zonas con riesgo de ignición'],
  'no-encender': ['Equipo en mantenimiento', 'Interruptores y arrancadores'],
  'no-ascensor-incendio': ['Frente a ascensores', 'Vestíbulos'],
  'no-montacargas': ['Zonas peatonales', 'Entrepisos de baja capacidad'],
  'no-aerosol': ['Cuartos de equipos', 'Zonas con ignición'],
  'uso-respirador': ['Pintura y lijado', 'Espacios con polvo o vapores'],
  'uso-careta': ['Esmerilado y soldadura', 'Corte con disco'],
  'uso-arnes': ['Bordes de losa', 'Cubiertas y andamios'],
  'lavarse-manos': ['Baños y comedores', 'Salida de laboratorios'],
  desconectar: ['Máquinas', 'Equipos portátiles'],
  'uso-ropa': ['Manipulación de químicos', 'Plantas de alimentos'],
  'pasillo-peatonal': ['Almacenes con montacargas', 'Patios'],
  'consulte-manual': ['Máquinas complejas', 'Equipos nuevos'],
  inflamable: ['Almacén de inflamables', 'Tanques'],
  explosivo: ['Polvorines', 'Depósitos de pirotecnia'],
  corrosivo: ['Almacén de ácidos y álcalis', 'Zona de baterías'],
  radiacion: ['Fuentes radiactivas', 'Salas de radiología'],
  'campo-magnetico': ['Salas de resonancia', 'Imanes industriales'],
  'superficie-caliente': ['Tuberías de vapor', 'Hornos y calderos'],
  'baja-temperatura': ['Cámaras frigoríficas', 'Almacenes de nitrógeno líquido'],
  atrapamiento: ['Rodillos y engranajes', 'Prensas'],
  ruido: ['Compresores', 'Generadores'],
  'arranque-automatico': ['Ventiladores', 'Bombas', 'Cintas transportadoras'],
  comburente: ['Cilindros de oxígeno', 'Almacén de peróxidos'],
  'gas-presion': ['Cilindros', 'Redes de gas'],
  'espacio-confinado': ['Tanques', 'Cámaras y pozos'],
  baterias: ['Cuartos de carga de baterías', 'Montacargas eléctricos'],
  obras: ['Perímetro de obras', 'Accesos de mantenimiento'],
  vehiculos: ['Ingresos y salidas de camiones', 'Patios'],
  'punto-reunion': ['Patios o zonas abiertas fuera de la edificación'],
  desfibrilador: ['Recepción', 'Pasillos principales'],
  camilla: ['Tópico', 'Cerca de la brigada'],
  botiquin: ['Oficinas', 'Talleres', 'Vehículos'],
  lavaojos: ['Almacén de químicos', 'Laboratorios'],
  'telefono-salvamento': ['Garitas', 'Recepción'],
  gabinete: ['Pasillos', 'Cada nivel'],
  pulsador: ['Salidas', 'Rutas de evacuación'],
  'equipos-incendio': ['Zonas con varios equipos'],
  hidrante: ['Exteriores', 'Perímetro'],
}
