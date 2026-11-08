import { EXTRA_SIGNS } from './signsExtra'
import { WHERE_BACKFILL, WORLD_SIGNS } from './signsWorld'
/**
 * Catálogo de señales de seguridad para el generador de señales y stickers.
 * Geometría y colores según NTP 399.010-1:2016 (concordante con ISO 3864-1). Los pictogramas son
 * ilustrativos (iconos genéricos): para uso oficial utilice el pictograma normalizado de la NTP o de
 * ISO 7010, respetando su licencia de reproducción.
 */
export type SignFamily = 'prohibicion' | 'obligacion' | 'advertencia' | 'emergencia' | 'incendios'

export interface SafetySign {
  id: string
  family: SignFamily
  text: string
  /** Nombre del icono de lucide-react que se usa como pictograma ilustrativo. */
  icon: string
  /** Referencia ISO 7010 equivalente (solo como referencia). */
  iso?: string
  description: string
  where: string[]
  risks: string[]
  controls: string[]
  epp?: string[]
  norms: string[]
}

export const FAMILY_INFO: Record<SignFamily, { label: string; shape: string; colors: string; meaning: string; bg: string; fg: string }> = {
  prohibicion: { label: 'Prohibición', shape: 'Círculo con banda diagonal', colors: 'Rojo, fondo blanco, pictograma negro', meaning: 'Prohíbe un comportamiento que puede causar peligro.', bg: '#C1121C', fg: '#FFFFFF' },
  obligacion: { label: 'Obligación', shape: 'Círculo', colors: 'Azul, pictograma blanco', meaning: 'Obliga a un comportamiento determinado (por ejemplo, usar EPP).', bg: '#0B5CAD', fg: '#FFFFFF' },
  advertencia: { label: 'Advertencia', shape: 'Triángulo equilátero', colors: 'Amarillo, borde y pictograma negros', meaning: 'Advierte de un peligro.', bg: '#F9B700', fg: '#111111' },
  emergencia: { label: 'Emergencia (salvamento)', shape: 'Cuadrado o rectángulo', colors: 'Verde, pictograma blanco', meaning: 'Indica salidas, rutas de evacuación y primeros auxilios.', bg: '#0E7A3E', fg: '#FFFFFF' },
  incendios: { label: 'Equipos contra incendios', shape: 'Cuadrado o rectángulo', colors: 'Rojo, pictograma blanco', meaning: 'Ubica equipos de lucha contra incendios.', bg: '#C1121C', fg: '#FFFFFF' },
}

export const SIGN_NORMS = [
  'NTP 399.010-1:2016 — Señales de seguridad: colores, símbolos, formas y dimensiones (INACAL)',
  'Norma A.130 del RNE — Requisitos de seguridad, evacuación y señalización en edificaciones',
  'ISO 7010 — Catálogo internacional de señales de seguridad registradas (referencia)',
  'ISO 3864-1 e ISO/TS 20559 — Principios de diseño y sistemas de señalización (referencia)',
  'Ley 29783, art. 21 y D.S. 005-2012-TR — La señalización es un control administrativo dentro de la jerarquía',
]

const BASE_SIGNS: SafetySign[] = [
  // Prohibición
  { id: 'no-fumar', family: 'prohibicion', text: 'PROHIBIDO FUMAR', icon: 'CigaretteOff', iso: 'P002', description: 'Prohíbe fumar en el área.', where: ['Almacenes de combustibles y químicos', 'Oficinas y ambientes cerrados', 'Grifos y talleres'], risks: ['Incendio y explosión', 'Exposición a humo de tabaco'], controls: ['Áreas designadas para fumadores fuera de zonas de riesgo', 'Inspección periódica'], norms: ['Ley 28705 (control del tabaco)', 'NTP 399.010-1:2016'] },
  { id: 'no-llama', family: 'prohibicion', text: 'PROHIBIDO LLAMA ABIERTA', icon: 'Flame', iso: 'P003', description: 'Prohíbe fuego, llamas abiertas y fuentes de ignición.', where: ['Almacén de inflamables', 'Zona de recarga de baterías', 'Tanques de combustible'], risks: ['Incendio', 'Explosión de vapores'], controls: ['Permiso de trabajo en caliente', 'Herramientas antichispa', 'Ventilación'], norms: ['D.S. 005-2012-TR', 'NTP 399.010-1:2016'] },
  { id: 'no-paso', family: 'prohibicion', text: 'PROHIBIDO EL PASO A PERSONAL NO AUTORIZADO', icon: 'Hand', iso: 'P006', description: 'Restringe el acceso a personal autorizado.', where: ['Subestaciones y tableros', 'Salas de máquinas', 'Laboratorios'], risks: ['Contacto eléctrico', 'Atrapamiento', 'Exposición a agentes'], controls: ['Control de acceso', 'Llave o tarjeta', 'Lista de personal autorizado'], norms: ['D.S. 005-2012-TR', 'NTP 399.010-1:2016'] },
  { id: 'no-celular', family: 'prohibicion', text: 'PROHIBIDO USAR CELULAR', icon: 'Smartphone', iso: 'P013', description: 'Prohíbe el uso de teléfonos móviles.', where: ['Zonas de operación de maquinaria', 'Áreas con atmósferas inflamables'], risks: ['Distracción y atropello', 'Ignición'], controls: ['Zonas seguras para llamadas', 'Capacitación'], norms: ['NTP 399.010-1:2016'] },
  { id: 'no-agua', family: 'prohibicion', text: 'NO APAGAR CON AGUA', icon: 'Droplets', iso: 'P011', description: 'Prohíbe usar agua como agente extintor.', where: ['Tableros eléctricos', 'Almacén de metales reactivos'], risks: ['Electrocución', 'Reacción violenta'], controls: ['Extintor CO₂ o PQS adecuado a la clase de fuego'], norms: ['NTP 350.043-1:2011', 'NTP 399.010-1:2016'] },
  // Obligación
  { id: 'uso-casco', family: 'obligacion', text: 'USO OBLIGATORIO DE CASCO', icon: 'HardHat', iso: 'M014', description: 'Obliga al uso de casco de seguridad.', where: ['Obras de construcción', 'Almacenes con estanterías altas', 'Plantas industriales'], risks: ['Golpes por caída de objetos'], controls: ['Redes y rodapiés', 'Orden en altura'], epp: ['Casco con barbiquejo'], norms: ['D.S. 011-2019-TR', 'NTP 399.010-1:2016'] },
  { id: 'uso-lentes', family: 'obligacion', text: 'USO OBLIGATORIO DE LENTES DE SEGURIDAD', icon: 'Glasses', iso: 'M004', description: 'Obliga a proteger los ojos.', where: ['Esmerilado y corte', 'Manipulación de químicos', 'Talleres'], risks: ['Proyección de partículas', 'Salpicaduras'], controls: ['Guardas en máquinas', 'Pantallas'], epp: ['Lentes de seguridad', 'Careta facial'], norms: ['NTP 399.010-1:2016'] },
  { id: 'uso-orejeras', family: 'obligacion', text: 'USO OBLIGATORIO DE PROTECCIÓN AUDITIVA', icon: 'Ear', iso: 'M003', description: 'Obliga a usar protección auditiva.', where: ['Áreas con ruido mayor a 85 dB(A)', 'Compresoras y generadores'], risks: ['Hipoacusia inducida por ruido'], controls: ['Encerramiento de fuentes', 'Rotación de personal', 'Monitoreo de ruido'], epp: ['Tapones u orejeras'], norms: ['R.M. 375-2008-TR', 'NTP 399.010-1:2016'] },
  { id: 'uso-guantes', family: 'obligacion', text: 'USO OBLIGATORIO DE GUANTES', icon: 'Hand', iso: 'M009', description: 'Obliga al uso de guantes de protección.', where: ['Manipulación de químicos', 'Carga y descarga', 'Trabajos con filos'], risks: ['Cortes', 'Quemaduras químicas', 'Dermatitis'], controls: ['Herramientas de sujeción', 'Sustitución de productos'], epp: ['Guantes según el riesgo (nitrilo, cuero, anticorte)'], norms: ['NTP 399.010-1:2016'] },
  { id: 'uso-calzado', family: 'obligacion', text: 'USO OBLIGATORIO DE CALZADO DE SEGURIDAD', icon: 'Footprints', iso: 'M008', description: 'Obliga al uso de calzado de seguridad.', where: ['Almacenes', 'Obras', 'Plantas'], risks: ['Aplastamiento de pies', 'Resbalones'], controls: ['Orden y limpieza', 'Pisos antideslizantes'], epp: ['Calzado con puntera y suela antideslizante'], norms: ['NTP 399.010-1:2016'] },
  { id: 'uso-chaleco', family: 'obligacion', text: 'USO OBLIGATORIO DE CHALECO REFLECTIVO', icon: 'Shirt', iso: 'M015', description: 'Obliga al uso de ropa de alta visibilidad.', where: ['Patios de maniobra', 'Vías y almacenes con montacargas'], risks: ['Atropello'], controls: ['Separación peatonal', 'Límites de velocidad'], epp: ['Chaleco de alta visibilidad'], norms: ['NTP 399.010-1:2016'] },
  // Advertencia
  { id: 'riesgo-electrico', family: 'advertencia', text: 'RIESGO ELÉCTRICO', icon: 'Zap', iso: 'W012', description: 'Advierte de electricidad y tensión peligrosa.', where: ['Tableros', 'Subestaciones', 'Equipos energizados'], risks: ['Electrocución', 'Quemaduras por arco eléctrico'], controls: ['Bloqueo y etiquetado (LOTO)', 'Personal calificado', 'Puesta a tierra'], epp: ['Guantes dieléctricos', 'Ropa ignífuga'], norms: ['R.M. 111-2013-MEM/DM (RESESATE)', 'NTP 399.010-1:2016'] },
  { id: 'caida-nivel', family: 'advertencia', text: 'CUIDADO: PISO RESBALOSO', icon: 'Footprints', iso: 'W011', description: 'Advierte de superficie resbaladiza.', where: ['Zonas en limpieza', 'Cocinas', 'Ingresos con lluvia'], risks: ['Caída al mismo nivel'], controls: ['Limpieza inmediata de derrames', 'Pisos antideslizantes'], norms: ['NTP 399.010-1:2016'] },
  { id: 'montacargas', family: 'advertencia', text: 'CUIDADO: TRÁNSITO DE MONTACARGAS', icon: 'Forklift', iso: 'W014', description: 'Advierte de vehículos de manutención.', where: ['Almacenes', 'Zonas de carga'], risks: ['Atropello', 'Aplastamiento'], controls: ['Pasillos peatonales demarcados', 'Espejos', 'Alarma de retroceso'], epp: ['Chaleco reflectivo'], norms: ['D.S. 005-2012-TR', 'NTP 399.010-1:2016'] },
  { id: 'carga-suspendida', family: 'advertencia', text: 'CUIDADO: CARGA SUSPENDIDA', icon: 'Package', iso: 'W015', description: 'Advierte de cargas izadas.', where: ['Zonas de grúas y polipastos'], risks: ['Golpe por caída de carga'], controls: ['Delimitar el radio de izaje', 'Rigger y señalero', 'Inspección de aparejos'], epp: ['Casco'], norms: ['D.S. 011-2019-TR', 'NTP 399.010-1:2016'] },
  { id: 'riesgo-quimico', family: 'advertencia', text: 'CUIDADO: SUSTANCIAS TÓXICAS', icon: 'FlaskConical', iso: 'W016', description: 'Advierte de sustancias peligrosas.', where: ['Almacén de químicos', 'Laboratorios'], risks: ['Intoxicación', 'Quemaduras químicas'], controls: ['FDS disponible', 'Ventilación', 'Rotulado SGA'], epp: ['Respirador', 'Guantes', 'Lentes'], norms: ['D.S. 005-2026-MINAM (SGA)', 'D.S. 015-2005-SA'] },
  { id: 'riesgo-biologico', family: 'advertencia', text: 'RIESGO BIOLÓGICO', icon: 'Biohazard', iso: 'W009', description: 'Advierte de agentes biológicos.', where: ['Tópicos y laboratorios', 'Manejo de residuos biocontaminados'], risks: ['Infecciones'], controls: ['Bioseguridad', 'Vacunación', 'Gestión de residuos'], epp: ['Guantes', 'Mascarilla'], norms: ['NTP 399.010-1:2016'] },
  { id: 'caida-altura', family: 'advertencia', text: 'CUIDADO: RIESGO DE CAÍDA A DISTINTO NIVEL', icon: 'TriangleAlert', iso: 'W008', description: 'Advierte de desniveles y bordes.', where: ['Bordes de losa', 'Plataformas', 'Escaleras'], risks: ['Caída de altura'], controls: ['Barandas', 'Líneas de vida', 'Permiso de trabajo en altura'], epp: ['Arnés de cuerpo entero'], norms: ['D.S. 011-2019-TR', 'NTP 399.010-1:2016'] },
  // Emergencia
  { id: 'salida', family: 'emergencia', text: 'SALIDA', icon: 'DoorOpen', iso: 'E001', description: 'Indica la salida de emergencia.', where: ['Puertas de salida', 'Rutas de evacuación'], risks: ['Atrapamiento durante una emergencia'], controls: ['Rutas libres de obstáculos', 'Iluminación de emergencia', 'Simulacros'], norms: ['Norma A.130 del RNE', 'NTP 399.010-1:2016'] },
  { id: 'ruta-evacuacion', family: 'emergencia', text: 'RUTA DE EVACUACIÓN', icon: 'ArrowBigRight', iso: 'E002', description: 'Indica el sentido de la ruta de evacuación.', where: ['Pasillos', 'Escaleras'], risks: ['Desorientación en una emergencia'], controls: ['Plano de evacuación', 'Señales fotoluminiscentes'], norms: ['Norma A.130 del RNE', 'NTP 399.010-1:2016'] },
  { id: 'primeros-auxilios', family: 'emergencia', text: 'PRIMEROS AUXILIOS', icon: 'Plus', iso: 'E003', description: 'Ubica el botiquín o el tópico.', where: ['Botiquines', 'Tópicos'], risks: ['Agravamiento de lesiones'], controls: ['Brigada de primeros auxilios capacitada', 'Botiquín completo y vigente'], norms: ['D.S. 005-2012-TR', 'D.S. 011-2019-TR (Anexo de botiquín)'] },
  { id: 'zona-segura', family: 'emergencia', text: 'ZONA SEGURA EN CASO DE SISMO', icon: 'PersonStanding', description: 'Señala zonas seguras internas ante sismos.', where: ['Columnas y muros estructurales'], risks: ['Golpes por caída de objetos durante sismos'], controls: ['Evaluación estructural', 'Simulacros'], norms: ['Norma A.130 del RNE', 'INDECI'] },
  { id: 'ducha', family: 'emergencia', text: 'DUCHA Y LAVAOJOS DE EMERGENCIA', icon: 'ShowerHead', iso: 'E012', description: 'Ubica la ducha y el lavaojos de emergencia.', where: ['Almacén de químicos', 'Laboratorios'], risks: ['Quemaduras químicas'], controls: ['Prueba semanal de funcionamiento', 'Acceso libre'], norms: ['NTP 399.010-1:2016'] },
  // Incendios
  { id: 'extintor', family: 'incendios', text: 'EXTINTOR', icon: 'FireExtinguisher', iso: 'F001', description: 'Ubica un extintor portátil.', where: ['Junto a cada extintor'], risks: ['Propagación de incendio'], controls: ['Inspección mensual', 'Mantenimiento anual', 'Capacitación en uso'], norms: ['NTP 350.043-1:2011', 'Norma A.130 del RNE'] },
  { id: 'alarma', family: 'incendios', text: 'ALARMA CONTRA INCENDIOS', icon: 'BellRing', iso: 'F005', description: 'Ubica el pulsador de alarma.', where: ['Rutas de evacuación', 'Salidas'], risks: ['Demora en la evacuación'], controls: ['Prueba periódica del sistema', 'Simulacros'], norms: ['Norma A.130 del RNE'] },
  { id: 'telefono-emergencia', family: 'incendios', text: 'TELÉFONO DE EMERGENCIA', icon: 'Phone', iso: 'F006', description: 'Ubica el teléfono para emergencias.', where: ['Garitas', 'Recepción'], risks: ['Demora en la respuesta'], controls: ['Directorio de emergencia visible (116 bomberos)'], norms: ['Norma A.130 del RNE'] },
]

export const SIGNS: SafetySign[] = [...BASE_SIGNS, ...EXTRA_SIGNS, ...WORLD_SIGNS].map((sign) =>
  sign.where.length === 0 && WHERE_BACKFILL[sign.id] ? { ...sign, where: WHERE_BACKFILL[sign.id] } : sign,
)

/** Tamaño mínimo de una señal según la distancia de observación (NTP 399.010-1 / ISO 3864-1): S ≥ L² / 2000, para L < 50 m. */
export function minSignArea(distanceMeters: number): { areaM2: number; sideCm: number } {
  const area = (distanceMeters * distanceMeters) / 2000
  return { areaM2: area, sideCm: Math.sqrt(area) * 100 }
}
