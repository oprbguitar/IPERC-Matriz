import type { SafetySign, SignFamily } from './signs'

/** Constructor compacto: id, familia, texto, icono, ref. ISO 7010, descripción, riesgos, controles, normas, EPP. */
const s = (
  id: string, family: SignFamily, text: string, icon: string, iso: string | undefined, description: string,
  risks: string[], controls: string[], norms: string[], epp?: string[], where: string[] = [],
): SafetySign => ({ id, family, text, icon, iso, description, risks, controls, norms, epp, where })

const NTP = 'NTP 399.010-1:2016'

/** Señales adicionales (Perú y referencia internacional ISO 7010). Pictogramas ilustrativos. */
export const EXTRA_SIGNS: SafetySign[] = [
  // Prohibición
  s('no-peatones', 'prohibicion', 'PROHIBIDO EL PASO DE PEATONES', 'Footprints', 'P004', 'Zona exclusiva de vehículos o maquinaria.', ['Atropello'], ['Pasillo peatonal alternativo demarcado'], [NTP], undefined, ['Rampas y vías de montacargas']),
  s('no-tocar', 'prohibicion', 'NO TOCAR', 'Hand', 'P010', 'Prohíbe tocar equipos o superficies.', ['Contacto eléctrico', 'Quemaduras', 'Atrapamiento'], ['Guardas', 'Aislamiento'], [NTP]),
  s('no-comer', 'prohibicion', 'PROHIBIDO COMER Y BEBER', 'UtensilsCrossed', 'P022', 'Prohíbe ingerir alimentos en el área.', ['Ingestión de contaminantes químicos o biológicos'], ['Comedor separado', 'Lavado de manos'], [NTP, 'D.S. 015-2005-SA']),
  s('no-fotos', 'prohibicion', 'PROHIBIDO TOMAR FOTOGRAFÍAS', 'CameraOff', 'P029', 'Áreas restringidas o con riesgo de ignición por flash.', ['Ignición', 'Distracción'], ['Control de acceso'], [NTP]),
  s('no-encender', 'prohibicion', 'NO ENCENDER: PERSONAL TRABAJANDO', 'Power', undefined, 'Equipo en mantenimiento; complementa el bloqueo LOTO.', ['Arranque inesperado', 'Atrapamiento', 'Electrocución'], ['Bloqueo y etiquetado (LOTO)', 'Prueba de energía cero'], [NTP, 'R.M. 111-2013-MEM/DM']),
  s('no-ascensor-incendio', 'prohibicion', 'NO USAR EL ASCENSOR EN CASO DE INCENDIO O SISMO', 'Flame', 'P020', 'Indica usar escaleras durante emergencias.', ['Atrapamiento en emergencia'], ['Rutas de evacuación por escaleras'], ['Norma A.130 del RNE', NTP]),
  s('no-montacargas', 'prohibicion', 'PROHIBIDO EL PASO DE MONTACARGAS', 'Forklift', 'P006', 'Zona peatonal o de piso de baja capacidad.', ['Atropello', 'Colapso de piso'], ['Bolardos', 'Demarcación'], [NTP]),
  s('no-aerosol', 'prohibicion', 'PROHIBIDO ROCIAR AEROSOLES', 'SprayCan', undefined, 'Zonas con fuentes de ignición o equipos sensibles.', ['Incendio', 'Inhalación'], ['Ventilación', 'Productos alternativos'], [NTP]),
  // Obligación
  s('uso-respirador', 'obligacion', 'USO OBLIGATORIO DE PROTECCIÓN RESPIRATORIA', 'Wind', 'M017', 'Obliga a usar respirador.', ['Inhalación de polvo, humos o vapores'], ['Ventilación local', 'Monitoreo de agentes'], [NTP, 'D.S. 015-2005-SA'], ['Respirador con filtro según contaminante']),
  s('uso-careta', 'obligacion', 'USO OBLIGATORIO DE CARETA FACIAL', 'ScanLine', 'M013', 'Protección de cara completa.', ['Proyección de partículas', 'Radiación de soldadura'], ['Pantallas', 'Biombos'], [NTP], ['Careta o máscara de soldar']),
  s('uso-arnes', 'obligacion', 'USO OBLIGATORIO DE ARNÉS DE SEGURIDAD', 'PersonStanding', 'M018', 'Trabajos a más de 1,80 m de altura.', ['Caída de altura'], ['Barandas', 'Línea de vida', 'PETAR'], [NTP, 'D.S. 011-2019-TR'], ['Arnés de cuerpo entero con doble línea']),
  s('lavarse-manos', 'obligacion', 'LÁVESE LAS MANOS', 'Droplet', 'M011', 'Higiene obligatoria.', ['Contaminación biológica o química'], ['Lavaderos con jabón'], [NTP]),
  s('desconectar', 'obligacion', 'DESCONECTE ANTES DE REALIZAR MANTENIMIENTO', 'PowerOff', 'M014', 'Aislar la energía antes de intervenir.', ['Electrocución', 'Arranque inesperado'], ['LOTO', 'Verificación de ausencia de tensión'], [NTP, 'R.M. 111-2013-MEM/DM']),
  s('uso-ropa', 'obligacion', 'USO OBLIGATORIO DE ROPA DE PROTECCIÓN', 'Shirt', 'M010', 'Ropa adecuada al riesgo.', ['Contacto químico', 'Quemaduras'], ['Sustitución de productos'], [NTP], ['Mameluco, mandil o traje químico']),
  s('pasillo-peatonal', 'obligacion', 'USE EL PASILLO PEATONAL', 'Footprints', 'M024', 'Obliga a circular por la vía peatonal.', ['Atropello'], ['Separación física de vías'], [NTP]),
  s('consulte-manual', 'obligacion', 'CONSULTE EL MANUAL O PROCEDIMIENTO', 'Eye', 'M002', 'Leer instrucciones antes de operar.', ['Error de operación'], ['Capacitación', 'PETS'], [NTP]),
  // Advertencia
  s('inflamable', 'advertencia', 'MATERIAL INFLAMABLE', 'Flame', 'W021', 'Productos que arden con facilidad.', ['Incendio', 'Explosión'], ['Almacén ventilado', 'Sin fuentes de ignición'], [NTP, 'D.S. 005-2026-MINAM']),
  s('explosivo', 'advertencia', 'MATERIAL EXPLOSIVO', 'Bomb', 'W002', 'Sustancias o atmósferas explosivas.', ['Explosión'], ['Distancias de seguridad', 'Control de ignición'], [NTP, 'Ley 30299 (SUCAMEC)']),
  s('corrosivo', 'advertencia', 'SUSTANCIAS CORROSIVAS', 'Droplets', 'W023', 'Ácidos y álcalis.', ['Quemaduras químicas'], ['Contención secundaria', 'Ducha y lavaojos'], [NTP], ['Guantes y lentes químicos']),
  s('radiacion', 'advertencia', 'RADIACIÓN IONIZANTE', 'Radiation', 'W003', 'Fuentes radiactivas o rayos X.', ['Exposición a radiación'], ['Blindaje', 'Distancia', 'Tiempo', 'Dosimetría'], [NTP, 'Ley 28028 (IPEN)']),
  s('campo-magnetico', 'advertencia', 'CAMPO MAGNÉTICO INTENSO', 'Magnet', 'W006', 'Equipos de resonancia o imanes industriales.', ['Interferencia con marcapasos', 'Proyección de objetos'], ['Control de acceso'], [NTP]),
  s('superficie-caliente', 'advertencia', 'SUPERFICIE CALIENTE', 'ThermometerSun', 'W017', 'Riesgo de quemaduras por contacto.', ['Quemaduras'], ['Aislamiento térmico', 'Guardas'], [NTP], ['Guantes térmicos']),
  s('baja-temperatura', 'advertencia', 'BAJA TEMPERATURA', 'Snowflake', 'W010', 'Cámaras frigoríficas o criogenia.', ['Hipotermia', 'Quemaduras por frío'], ['Tiempo limitado', 'Apertura interior de puertas'], [NTP], ['Ropa térmica']),
  s('atrapamiento', 'advertencia', 'PELIGRO DE ATRAPAMIENTO', 'Wrench', 'W024', 'Partes móviles, rodillos o engranajes.', ['Atrapamiento', 'Amputación'], ['Guardas fijas', 'Parada de emergencia', 'LOTO'], [NTP]),
  s('ruido', 'advertencia', 'NIVEL DE RUIDO ELEVADO', 'Volume2', undefined, 'Zona con más de 85 dB(A).', ['Hipoacusia'], ['Aislamiento', 'Rotación'], [NTP, 'R.M. 375-2008-TR'], ['Protección auditiva']),
  s('arranque-automatico', 'advertencia', 'MAQUINARIA DE ARRANQUE AUTOMÁTICO', 'Fan', 'W018', 'El equipo puede arrancar sin aviso.', ['Golpes', 'Atrapamiento'], ['LOTO', 'Señal sonora previa'], [NTP]),
  s('comburente', 'advertencia', 'SUSTANCIAS COMBURENTES', 'Flame', 'W028', 'Oxidantes que avivan el fuego.', ['Incendio'], ['Separar de inflamables'], [NTP]),
  s('gas-presion', 'advertencia', 'GASES A PRESIÓN', 'Cylinder', 'W029', 'Cilindros y redes de gas.', ['Explosión', 'Proyección', 'Asfixia'], ['Cilindros sujetos con cadena', 'Capuchón'], [NTP]),
  s('espacio-confinado', 'advertencia', 'ESPACIO CONFINADO: INGRESO CON PERMISO', 'TriangleAlert', undefined, 'Tanques, cámaras, pozos.', ['Asfixia', 'Intoxicación', 'Atrapamiento'], ['Monitoreo de atmósfera', 'Vigía', 'PETAR'], [NTP, 'D.S. 024-2016-EM']),
  s('baterias', 'advertencia', 'CARGA DE BATERÍAS', 'BatteryCharging', 'W026', 'Desprendimiento de hidrógeno y ácido.', ['Explosión', 'Quemaduras químicas'], ['Ventilación', 'Lavaojos'], [NTP]),
  s('obras', 'advertencia', 'ZONA DE OBRAS', 'Construction', undefined, 'Área en construcción o mantenimiento.', ['Caídas', 'Golpes'], ['Cerco perimétrico', 'Señalización'], [NTP, 'D.S. 011-2019-TR']),
  s('vehiculos', 'advertencia', 'TRÁNSITO DE VEHÍCULOS PESADOS', 'Truck', 'W014', 'Ingreso y salida de camiones.', ['Atropello'], ['Vigía', 'Velocidad máxima'], [NTP]),
  // Emergencia
  s('punto-reunion', 'emergencia', 'PUNTO DE REUNIÓN', 'Users', 'E007', 'Lugar seguro de concentración tras evacuar.', ['Desorden en la evacuación', 'Personas no ubicadas'], ['Conteo de personal', 'Simulacros'], ['Norma A.130 del RNE', NTP]),
  s('desfibrilador', 'emergencia', 'DESFIBRILADOR (DEA)', 'HeartPulse', 'E010', 'Ubica el desfibrilador externo automático.', ['Paro cardíaco'], ['Personal entrenado en RCP'], [NTP]),
  s('camilla', 'emergencia', 'CAMILLA DE EMERGENCIA', 'Stethoscope', 'E013', 'Ubica la camilla de rescate.', ['Agravamiento de lesiones'], ['Brigada de primeros auxilios'], [NTP]),
  s('botiquin', 'emergencia', 'BOTIQUÍN', 'BriefcaseMedical', 'E003', 'Ubica el botiquín de primeros auxilios.', ['Agravamiento de lesiones'], ['Reposición mensual'], [NTP, 'D.S. 011-2019-TR']),
  s('lavaojos', 'emergencia', 'LAVAOJOS DE EMERGENCIA', 'Eye', 'E011', 'Ubica el lavaojos.', ['Lesión ocular química'], ['Prueba semanal'], [NTP]),
  s('telefono-salvamento', 'emergencia', 'TELÉFONO DE EMERGENCIA Y SALVAMENTO', 'Phone', 'E004', 'Comunicación con brigadas (116 bomberos, 106 SAMU).', ['Demora en la respuesta'], ['Directorio visible'], [NTP]),
  // Incendios
  s('gabinete', 'incendios', 'GABINETE CONTRA INCENDIOS', 'Waves', 'F002', 'Ubica la manguera o gabinete.', ['Propagación del fuego'], ['Inspección y prueba periódica'], ['Norma A.130 del RNE', 'NFPA 14']),
  s('pulsador', 'incendios', 'PULSADOR DE ALARMA', 'Megaphone', 'F005', 'Activa la alarma manual.', ['Detección tardía'], ['Prueba periódica'], ['Norma A.130 del RNE', 'NFPA 72']),
  s('equipos-incendio', 'incendios', 'EQUIPOS CONTRA INCENDIOS', 'FireExtinguisher', 'F004', 'Conjunto de equipos de lucha contra incendios.', ['Propagación'], ['Acceso libre de 1 m'], ['Norma A.130 del RNE']),
  s('hidrante', 'incendios', 'HIDRANTE / CONEXIÓN SIAMESA', 'Fuel', undefined, 'Conexión para bomberos.', ['Demora en el combate'], ['Acceso vehicular libre'], ['Norma A.130 del RNE']),
]
