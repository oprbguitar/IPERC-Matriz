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

type EquipmentSeed = [id: string, title: string, purpose: string, limits: string, inspection: string, replacement: string, reference: string]
const ppeSeeds: EquipmentSeed[] = [
  ['cabeza','Cascos y protección de cabeza','Seleccionar protección frente a impactos según la tarea, el marcado y la compatibilidad con accesorios.','Las tensiones de ensayo no autorizan trabajar a esas tensiones. El color del casco no establece una función legal universal.','Revisar carcasa, suspensión, ajuste, marcado legible y accesorios autorizados.','Retirar tras un impacto o deterioro; seguir las instrucciones del fabricante, incluso sin daño visible.','ANSI/ISEA Z89.1: tipología explicada por OSHA. NTP 399.018:2022: ficha INACAL; no equivale automáticamente a ANSI.'],
  ['auditiva','Protección auditiva','Tapones y orejeras según exposición evaluada, tarea y compatibilidad con otros equipos.','La atenuación declarada no demuestra por sí sola la protección efectiva individual; verificar ajuste.','Comprobar sellos, almohadillas, limpieza, colocación y compatibilidad con casco o gafas.','Cambiar componentes deteriorados o equipos que no permitan un ajuste adecuado; seguir al fabricante.','EN 352 u otro estándar de producto aplicable: edición y conformidad pendientes de cotejo.'],
  ['ocular','Protección ocular y facial','Distinguir gafas, goggles y pantallas faciales según partículas, salpicaduras o radiaciones del proceso.','Una pantalla facial no reemplaza automáticamente la protección ocular necesaria; verificar prestaciones del conjunto.','Revisar lentes, sujeciones, transparencia, marcado, ajuste y compatibilidad entre piezas.','Retirar ante fisuras, rayaduras que afecten visión o pérdida de integridad y ajuste.','Estándar de protección ocular aplicable al peligro: edición y conformidad pendientes de cotejo.'],
  ['respiratoria','Respiradores y filtros','Elegir protección respiratoria a partir del contaminante, la concentración y las condiciones de trabajo.','Un filtro no sirve para toda sustancia ni para toda atmósfera. No presumir aptitud en deficiencia de oxígeno.','Revisar sello, válvulas, cartuchos, integridad y programa de ajuste y mantenimiento.','Aplicar programa de cambio específico de filtros; retirar equipos dañados o contaminados según procedimiento.','Norma y aprobación del respirador y filtro: referencia técnica pendiente de validación para cada uso.'],
  ['manos','Guantes y protección de manos','Seleccionar resistencia a cortes, agentes químicos, calor u otros peligros de la tarea.','Ningún material de guante protege contra todos los químicos; revisar compatibilidad y tiempo de permeación declarado.','Inspeccionar perforaciones, desgaste, limpieza, talla y datos del fabricante sobre el agente.','Reemplazar por deterioro, contaminación o según límite de uso del producto y procedimiento.','Norma de guantes por peligro mecánico, químico o térmico: edición y conformidad pendientes.'],
  ['pies','Calzado de seguridad','Seleccionar protección frente a impactos, penetración, deslizamiento y condiciones del piso.','No atribuir aislamiento eléctrico ni resistencia química a un calzado sin marcado y evidencia específica.','Revisar suela, puntera, costuras, adherencia, limpieza y talla apropiada.','Retirar cuando el desgaste o un impacto comprometa sus prestaciones; seguir al fabricante.','Norma de calzado de seguridad según prestaciones declaradas: edición y conformidad pendientes.'],
  ['ropa','Ropa de protección','Elegir prendas para calor, químicos, intemperie o radiación UV según la exposición identificada.','Las prendas para un peligro no demuestran protección frente a otro; considerar costuras, cierres y conjunto completo.','Revisar roturas, marcado, compatibilidad, lavado autorizado y cobertura de zonas expuestas.','Retirar por deterioro o contaminación que afecte la protección; respetar restricciones de lavado y uso.','Norma de ropa para el agente específico: referencia técnica y edición pendientes de validación.'],
  ['caidas','Equipos contra caídas','Integrar arnés, conexión, anclaje y plan de rescate mediante un sistema diseñado para la tarea.','El arnés aislado no constituye un sistema completo ni sustituye la protección colectiva del borde.','Revisar cintas, costuras, conectores, anclajes y registros por personal competente.','Retirar tras una caída o daño y aplicar criterios de revisión y retiro del fabricante.','Norma del sistema y sus componentes: referencia técnica pendiente según aplicación y sector.'],
  ['electrica','Protección eléctrica','Seleccionar guantes, ropa y elementos adecuados al contacto o arco eléctrico evaluado.','La protección contra choque y contra arco son prestaciones distintas; el EPP no reemplaza el aislamiento de energía.','Revisar marcado, integridad, ensayos exigibles, conservación y compatibilidad del conjunto.','Retirar elementos dañados o fuera de condiciones de ensayo y servicio establecidas para el producto.','Normas específicas de protección eléctrica: edición, ensayos y alcance pendientes de validación.'],
  ['biologica','Protección biológica y sanitaria','Elegir barreras para contacto, salpicaduras o aerosoles conforme a la evaluación de la tarea.','No asumir que todo equipo sanitario protege frente a todos los agentes biológicos o químicos.','Verificar integridad, talla, colocación y retiro, higiene y condición de reutilización autorizada.','Eliminar los desechables según protocolo; reprocesar solo productos y procesos autorizados.','Norma y protocolo del establecimiento para barreras biológicas: referencia técnica pendiente.'],
]

const instrumentSeeds: EquipmentSeed[] = [
  ['sonometro','Sonómetro integrador','Medir niveles sonoros según el propósito del estudio y el procedimiento de evaluación.','Una lectura puntual no describe toda una jornada; ajustar ponderaciones, integración y ubicación.','Identificar equipo, micrófono, rango, configuración y verificaciones acústicas operativas.','Reparar o retirar de servicio ante daño, deriva o resultados fuera de tolerancia; recalibrar según evaluación.','IEC 61672-1: referencia técnica; clase, edición y conformidad del modelo pendientes de cotejo.'],
  ['dosimetro','Dosímetro personal de ruido','Registrar la exposición sonora personal durante periodos representativos de la tarea.','El resultado depende de posición, duración, umbral y criterio configurado; no mezclar metodologías.','Revisar micrófono, batería, configuración, identificación y verificación operativa antes y después.','Revisar o reparar por desviaciones; determinar recalibración según uso, historial y procedimiento.','IEC 61252: referencia técnica; edición y conformidad del equipo pendientes de validación.'],
  ['calibrador','Calibrador acústico','Generar una referencia acústica para verificar un sistema de medición compatible.','La verificación de campo no sustituye por sí sola una calibración trazable del instrumento completo.','Comprobar compatibilidad, adaptador, batería, identificación y certificado aplicable.','Retirar de servicio ante desviaciones o daño y someter a revisión o calibración según procedimiento.','IEC 60942: referencia técnica; edición, clase y compatibilidad pendientes de cotejo.'],
  ['luxometro','Luxómetro','Evaluar iluminancia en el plano de trabajo con un protocolo de muestreo adecuado.','Una cifra aislada no evalúa uniformidad, deslumbramiento ni todas las condiciones de iluminación.','Revisar sensor limpio, rango, orientación, identificación y trazabilidad de calibración.','Revisar por daño o deriva; fijar calibración según uso, criticidad y procedimiento.','Método e instrumento para iluminancia: referencia técnica específica pendiente de validación.'],
  ['termohigrometro','Termohigrómetro','Registrar temperatura y humedad relativa según las condiciones del lugar y el estudio.','No existe un porcentaje universal obligatorio para cualquier actividad; no sustituye un análisis de estrés térmico.','Comprobar sensor, estabilización, ubicación, identificación, rango y certificado de calibración.','Revisar sensores degradados o resultados inconsistentes y determinar recalibración según historial.','Método de temperatura y humedad: referencia técnica y parámetros aplicables pendientes de cotejo.'],
  ['detector-gases','Detector de gases','Detectar gases objetivo con sensores y rangos adecuados a la evaluación de la tarea.','No detecta sustancias ajenas a sus sensores; considerar interferencias, saturación y atmósferas especiales.','Verificar gas patrón, prueba funcional, sensores, alarmas, batería y procedimiento autorizado.','Sustituir sensores o retirar equipos que fallen las verificaciones; calibrar según el fabricante y procedimiento.','Norma y especificación del detector según gas y ambiente: referencia técnica pendiente.'],
  ['multimetro','Multímetro de seguridad','Medir magnitudes eléctricas con personal competente y equipo apropiado al circuito.','Elegir categoría de medición, tensión y accesorios adecuados; no autoriza intervenir instalaciones energizadas.','Revisar puntas, aislamiento, fusibles, marcado, categoría y comprobación funcional segura.','Retirar por daño, aislamiento comprometido o lectura anómala; reparar y verificar antes de reutilizar.','IEC 61010 y requisitos particulares: referencia técnica; edición y conformidad pendientes de cotejo.'],
  ['wbgt','Medidor de estrés térmico WBGT','Caracterizar condiciones térmicas mediante un método de evaluación apropiado a la actividad.','El índice requiere interpretar carga de trabajo, ropa, aclimatación y duración; no es diagnóstico médico.','Revisar sensores, estabilización, ubicación, identificación, método y trazabilidad metrológica.','Revisar sensores dañados y establecer calibración según historial, uso y procedimiento.','Método WBGT y norma aplicable: referencia técnica y edición pendientes de validación.'],
]

function fromSeed(seed: EquipmentSeed, kind: PreventionEquipment['kind']): PreventionEquipment {
  const [id,title,purpose,limits,inspection,replacement,reference] = seed
  return { id,kind,title,purpose,limits,inspection,replacement,reference,sourceUrl: kind === 'epp' ? id === 'cabeza' ? HELMET_SOURCE : PPE_SOURCE : LAB_SOURCE, status: id === 'cabeza' ? 'Tipología contrastada con OSHA; referencia NTP contrastada en ficha INACAL. Aplicabilidad peruana por evaluar.' : 'Orientación de selección; referencia técnica específica y conformidad pendientes de validación.' }
}

export const PREVENTION_EQUIPMENT: PreventionEquipment[] = [...ppeSeeds.map(seed => fromSeed(seed,'epp')), ...instrumentSeeds.map(seed => fromSeed(seed,'instrumento'))]

export function filterEquipment(kind: string, query: string): PreventionEquipment[] {
  const normalize = (value: string) => value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean)
  return PREVENTION_EQUIPMENT.filter(item => (!kind || item.kind === kind) && terms.every(term => normalize(`${item.title} ${item.purpose} ${item.limits} ${item.reference}`).includes(term)))
}
