import { OBLIGATIONS as CATALOG_OBLIGATIONS } from '../catalog/obligations'
import { findNorm } from '../data/legalDatabase'
import type { ObligationItem, SomaTopic } from '../data/platformContent'
import { orgValue, type OrgData } from './orgStore'
import { basisLines, blankRows, document, table, type AdvancedTemplate } from './templateBuilder'

/**
 * Plantillas adaptadas a la organización: completan razón social, RUC, actividad, sede y
 * responsables con los datos guardados por el usuario. Cada una cita su base legal cotejada.
 * Son plantillas PROPIAS: mejoran y detallan los modelos oficiales, no los reemplazan.
 */
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic']

const normNames = (ids: string[]) => ids.map((id) => findNorm(id)?.shortName ?? id).join('; ')

export function extraTemplates(org: OrgData): AdvancedTemplate[] {
  const empresa = orgValue(org, 'razonSocial', '[Razón social]')
  const actividad = orgValue(org, 'actividad', '[actividad económica]')
  const sede = orgValue(org, 'centro', '[centro de trabajo]')
  const gerente = orgValue(org, 'gerente', '[Nombre y cargo de la máxima autoridad]')
  const year = new Date().getFullYear()

  const politica = `## 3. Texto de la política

**POLÍTICA DE SEGURIDAD Y SALUD EN EL TRABAJO**

${empresa}, dedicada a ${actividad}, reconoce que las personas que trabajan en ${sede} y en todas sus operaciones son lo más valioso de la organización. Por ello asume, desde la máxima autoridad, los siguientes compromisos:

1. Proteger la seguridad y salud de todos los miembros de la organización, previniendo lesiones, dolencias, enfermedades e incidentes relacionados con el trabajo.
2. Cumplir la Ley N.° 29783, su reglamento, las normas sectoriales aplicables y los demás compromisos que la organización suscriba en materia de seguridad y salud.
3. Garantizar que los trabajadores y sus representantes sean consultados y participen activamente en todos los elementos del sistema de gestión.
4. Identificar los peligros, evaluar los riesgos y aplicar controles siguiendo la jerarquía: eliminar, sustituir, controlar con medidas de ingeniería y administrativas y, como último recurso, proteger con equipos de protección personal.
5. Asignar los recursos necesarios y mejorar de forma continua el desempeño del sistema de gestión, integrándolo con los demás sistemas de la organización.

Esta política se difunde a todo el personal, contratistas y visitantes, se mantiene disponible para las partes interesadas y se revisa al menos una vez al año.

${sede}, ____ de ______________ de ${year}

______________________________
${gerente}

## 4. Requisitos que esta política debe cumplir (Ley 29783, art. 22)

| Requisito | ¿Cumple? | Cómo se evidencia |
|---|---|---|
| Específica para la organización y apropiada a su tamaño y actividad | | |
| Concisa, clara, fechada y firmada por la máxima autoridad | | |
| Difundida y accesible a todas las personas en el lugar de trabajo | | |
| Actualizada periódicamente | | |
| Consultada con los trabajadores y sus representantes | | |

## 5. Registro de difusión

${table(['N.°', 'Nombre', 'Área / puesto', 'Medio (charla, correo, mural)', 'Fecha', 'Firma'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e'], 15))}`

  const eleccion = `## 3. Cronograma electoral (R.M. 245-2021-TR)

${table(['Etapa', 'Actividad', 'Fecha', 'Responsable'], [
    ['1', 'Publicación de la convocatoria', '', ''],
    ['2', 'Conformación de la junta electoral', '', ''],
    ['3', 'Inscripción de candidaturas', '', ''],
    ['4', 'Publicación de la lista de candidatos y periodo de tachas', '', ''],
    ['5', 'Votación', '', ''],
    ['6', 'Escrutinio y proclamación', '', ''],
    ['7', 'Designación escrita de los representantes del empleador', '', ''],
    ['8', 'Instalación del Comité o juramentación del Supervisor', '', ''],
  ])}

## 4. Convocatoria

${empresa} convoca a los trabajadores de ${sede} a elegir a ____ representantes titulares y ____ suplentes ante el **Comité / Supervisor de Seguridad y Salud en el Trabajo** para el periodo ________ a ________.

Requisitos para postular: ser trabajador de la organización, tener 18 años o más y, de preferencia, capacitación en SST. Las candidaturas se reciben del ____ al ____ en __________________. La votación será personal, libre y secreta el ____ de ____ de ${year}, de ____ a ____ horas, en __________________.

## 5. Padrón electoral

${table(['N.°', 'Apellidos y nombres', 'DNI', 'Área', 'Firma al votar'], blankRows(['N.°', 'a', 'b', 'c', 'd'], 20))}

## 6. Acta de elección y escrutinio

En ${sede}, a las ____ horas del ____ de ____ de ${year}, la junta electoral integrada por ____________________ realizó el escrutinio con los siguientes resultados:

${table(['Candidato', 'Votos', 'Condición (titular / suplente)'], blankRows(['a', 'b', 'c'], 8))}

Votos en blanco: ____ Votos nulos: ____ Total de votantes: ____

## 7. Acta de instalación

Reunidos los representantes del empleador y de los trabajadores, se instala el Comité de SST de ${empresa}. Se elige como Presidente a ____________________ y como Secretario a ____________________, y se acuerda sesionar en forma ordinaria una vez al mes.

> Si el centro de trabajo tiene menos de 20 trabajadores, use las secciones 3 a 6 para elegir al Supervisor de SST (Ley 29783, art. 30).`

  const actaMensual = `## 3. Datos de la sesión

| Campo | Detalle |
|---|---|
| Tipo de sesión | Ordinaria / Extraordinaria |
| Fecha y hora | |
| Lugar o medio | |
| Quórum | |

## 4. Asistentes

${table(['N.°', 'Nombre', 'Representación (empleador / trabajadores / observador)', 'Cargo en el comité', 'Firma'], blankRows(['N.°', 'a', 'b', 'c', 'd'], 12))}

## 5. Agenda

1. Lectura y aprobación del acta anterior.
2. Seguimiento de acuerdos pendientes.
3. Revisión de estadísticas de accidentes e incidentes del mes.
4. Resultados de inspecciones internas.
5. Avance del programa anual de SST y de capacitación.
6. Otros temas.

## 6. Seguimiento de acuerdos anteriores

${table(['N.° acuerdo', 'Acuerdo', 'Responsable', 'Plazo', 'Estado', 'Evidencia'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e'], 8))}

## 7. Nuevos acuerdos

${table(['N.°', 'Acuerdo (verbo + qué)', 'Responsable', 'Plazo', 'Cómo se verificará'], blankRows(['N.°', 'a', 'b', 'c', 'd'], 8))}`

  const publico = `## 3. Paquete documental mínimo para una entidad pública

${table(['N.°', 'Documento', 'Base', 'Responsable sugerido', 'Estado', 'Fecha'], [
    ['1', 'Resolución que aprueba la política de SST', 'Ley 29783, art. 22', 'Titular de la entidad', '', ''],
    ['2', 'Designación del responsable o servicio de SST', 'Ley 29783, art. 26', 'Titular / RR. HH.', '', ''],
    ['3', 'Acta de elección e instalación del Comité o Supervisor', 'Ley 29783, arts. 29 a 31; R.M. 245-2021-TR', 'RR. HH.', '', ''],
    ['4', 'Línea base del SGSST', 'D.S. 005-2012-TR', 'Responsable SST', '', ''],
    ['5', 'IPERC por puesto y mapa de riesgos', 'Ley 29783, art. 57; D.S. 005-2012-TR, art. 77', 'Responsable SST', '', ''],
    ['6', 'Programa anual de SST con presupuesto', 'D.S. 005-2012-TR, art. 32', 'Comité / Logística', '', ''],
    ['7', 'RISST (20 o más servidores)', 'Ley 29783, art. 34', 'Comité', '', ''],
    ['8', 'Programa de capacitación (mínimo 4 al año)', 'Ley 29783, art. 35', 'RR. HH.', '', ''],
    ['9', 'Programa de vigilancia de la salud', 'Ley 29783, art. 49', 'RR. HH. / médico ocupacional', '', ''],
    ['10', 'Registros obligatorios del art. 33', 'D.S. 005-2012-TR', 'Responsable SST', '', ''],
    ['11', 'Plan de respuesta ante emergencias', 'D.S. 005-2012-TR, art. 83', 'Comité / Brigadas', '', ''],
    ['12', 'Plan de descanso sentado (puestos de atención al público de pie)', 'Ley 32721', 'RR. HH. / Comité', '', ''],
  ])}

## 4. Responsabilidades sugeridas

| Órgano | Responsabilidad |
|---|---|
| Titular de la entidad | Liderar el SGSST, aprobar la política y asignar presupuesto |
| Oficina de Recursos Humanos | Conducir el SGSST, exámenes médicos, capacitación y registros |
| Oficina de Logística / Administración | Adquirir EPP, señalización y servicios con criterios de SST |
| Comité o Supervisor | Aprobar programas, inspeccionar, investigar accidentes y hacer seguimiento |

> Base de contraste: modelos y compendio normativo de SERVIR. Verifique los formatos vigentes en gob.pe/servir.`

  const autoevaluacion = `## 3. Autoevaluación del SGSST

Marque cada pregunta con evidencia a la vista. Cuente como "Sí" solo lo que pueda demostrar.

${table(['N.°', 'Pregunta', 'Base legal', 'Sí', 'No', 'No aplica', 'Evidencia'], CATALOG_OBLIGATIONS.map((item, index) => [
    String(index + 1),
    `¿${item.title}?`,
    normNames(item.normIds.slice(0, 2)) || 'Por validar',
    '',
    '',
    '',
    item.evidence[0] ?? '',
  ]))}

## 4. Resultado

| Indicador | Valor |
|---|---|
| Preguntas aplicables | |
| Respuestas "Sí" con evidencia | |
| Porcentaje de cumplimiento | |
| Brechas críticas abiertas | |`

  const informeIperc = `## 3. Estructura del informe IPERC

### 3.1 Datos generales
Organización: ${empresa}. Centro de trabajo: ${sede}. Actividad: ${actividad}. Fecha de elaboración o actualización: __________. Versión: ____.

### 3.2 Alcance
Procesos, áreas y puestos evaluados; número de trabajadores por puesto; tareas rutinarias, no rutinarias y emergencias consideradas.

### 3.3 Equipo evaluador y participación
${table(['Nombre', 'Puesto', 'Rol en la evaluación', 'Firma'], blankRows(['a', 'b', 'c', 'd'], 6))}

### 3.4 Metodología
Criterios de probabilidad y severidad, matriz de niveles y criterios de aceptabilidad. Jerarquía de controles aplicada (Ley 29783, art. 21).

### 3.5 Insumos considerados (art. 77 del Reglamento, texto vigente)
- Resultados de monitoreos de agentes físicos, químicos, biológicos, ergonómicos y psicosociales.
- Investigaciones de accidentes y enfermedades del último periodo.
- Estadística de vigilancia de la salud colectiva.
- Trabajadores especialmente sensibles, discapacidad, procreación y enfoque de género.

### 3.6 Resultados
${table(['Nivel de riesgo', 'N.° de riesgos', '% del total', 'Puestos más expuestos'], [['Intolerable', '', '', ''], ['Importante', '', '', ''], ['Moderado', '', '', ''], ['Tolerable / trivial', '', '', '']])}

### 3.7 Plan de control
${table(['Riesgo', 'Control propuesto', 'Jerarquía', 'Responsable', 'Plazo', 'Residual proyectado', 'Residual verificado'], blankRows(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 10))}

### 3.8 Conclusiones y fecha de la próxima actualización
La próxima actualización se realizará a más tardar el __________ (sin exceder un año) o antes si cambian las condiciones de trabajo.`

  const bipedestacion = `## 3. Evaluación de puestos con bipedestación

${table(['N.°', 'Puesto', 'N.° trabajadores', 'Horas continuas de pie', 'Tipo (estática / dinámica)', '¿Aplica excepción? (inherente / riesgo objetivo)', 'Medida (silla, alternancia, pausas, rotación)', 'Sillas disponibles', 'Responsable', 'Fecha de verificación'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 12))}

## 4. Sistema rotativo de sillas (Ley 32721, art. 6)

| Criterio | Respuesta |
|---|---|
| Número de sillas por puesto | |
| Turnos y horario de uso | |
| ¿Permite alternar efectivamente la postura? | |
| ¿Está documentado en el RISST o en su anexo? | |
| Fecha de aprobación por el Comité | |

## 5. Texto sugerido para el RISST

«En los puestos de ${empresa} donde se trabaja de pie por periodos continuos de tres horas o más, la organización provee sillas o asientos con respaldo y garantiza la alternancia de postura o periodos de descanso sentado, que forman parte de la jornada de trabajo. La ubicación de las sillas y el sistema de rotación figuran en el Anexo ___ de este reglamento, aprobado por el Comité de SST.»

## 6. Plazos

| Hito | Fecha límite |
|---|---|
| Adecuación del RISST (360 días calendario desde la vigencia de la ley) | |
| Verificación con el Comité o Supervisor | |`

  const uv = `## 3. Identificación de trabajadores expuestos a radiación UV

${table(['N.°', 'Puesto / tarea', 'Región (Costa, Sierra, Selva)', 'Horario de exposición', '% de la jornada al sol', 'Índice UV típico', 'Clasificación (expuesto / riesgo alto)', 'Controles colectivos', 'EPP', 'Rotación'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 10))}

**Criterio (D.S. 003-2026-SA, art. 5):** expuesto si trabaja al sol entre 10:00 y 16:00 (Sierra: 09:00 a 16:00); riesgo alto si el índice UV es 6 o más o si la exposición alcanza el 30 % de la jornada.

## 4. Controles mínimos (art. 11.2)

| Medida | Implementada | Evidencia |
|---|---|---|
| Programación de tareas fuera del horario crítico | | |
| Rotación del personal de riesgo alto | | |
| Información a los trabajadores sobre el riesgo y sus controles | | |
| Sombra (toldos, techos, arborización) | | |
| Cartel: «La exposición prolongada a la radiación solar produce daño a la salud» | | |

## 5. EPP complementario (art. 12)

${table(['Trabajador (código)', 'Sombrero de ala ancha', 'Ropa de manga larga', 'Lentes con filtro UV', 'Fotoprotector FPS 30 o más', 'Fecha de entrega', 'Firma'], blankRows(['a', 'b', 'c', 'd', 'e', 'f', 'g'], 10))}

## 6. Vigilancia de la salud (art. 13)
Los exámenes médicos ocupacionales de estos puestos incluyen evaluación oftalmológica y tamizaje dermatológico. Registre solo la aptitud; el resultado clínico queda en el servicio de salud ocupacional.`

  const teletrabajo = `## 3. Evaluación del lugar habitual de teletrabajo

Trabajador: ____________________ Dirección del lugar de teletrabajo: ____________________ Fecha: ________

${table(['N.°', 'Aspecto', 'Condición observada', 'Cumple (Sí/No)', 'Medida recomendada'], [
    ['1', 'Superficie de trabajo estable y a altura adecuada', '', '', ''],
    ['2', 'Silla regulable con respaldo', '', '', ''],
    ['3', 'Pantalla a la altura de los ojos y a distancia adecuada', '', '', ''],
    ['4', 'Iluminación suficiente y sin reflejos', '', '', ''],
    ['5', 'Instalación eléctrica sin sobrecarga ni cables sueltos', '', '', ''],
    ['6', 'Ventilación y temperatura confortables', '', '', ''],
    ['7', 'Orden, espacio libre y vías de circulación', '', '', ''],
    ['8', 'Pausas activas programadas', '', '', ''],
    ['9', 'Horario de desconexión digital respetado', '', '', ''],
    ['10', 'Canal para reportar incidentes y molestias', '', '', ''],
  ])}

## 4. Factores psicosociales

| Factor | Observación | Medida |
|---|---|---|
| Carga y ritmo de trabajo | | |
| Aislamiento | | |
| Conciliación con la vida familiar | | |

> Base: Ley 31572 y su reglamento (D.S. 002-2023-TR), modificado por el D.S. 009-2026-TR; anexos actualizados por la R.M. 051-2026-TR. Contraste esta evaluación con los anexos oficiales vigentes.`

  const ambiental = `## 3. Matriz de aspectos e impactos ambientales

${table(['N.°', 'Proceso / actividad', 'Aspecto ambiental', 'Impacto ambiental', 'Condición (normal / anormal / emergencia)', 'Frecuencia (1–5)', 'Severidad (1–5)', 'Significancia (F × S)', '¿Significativo?', 'Requisito legal asociado', 'Control operacional', 'Responsable'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], 15))}

## 4. Ejemplos de aspectos frecuentes

| Actividad | Aspecto | Impacto |
|---|---|---|
| Mantenimiento de equipos | Generación de aceites usados | Contaminación del suelo |
| Oficinas | Consumo de energía eléctrica | Agotamiento de recursos |
| Limpieza | Uso de productos químicos | Contaminación del agua |
| Obra civil | Emisión de material particulado | Afectación de la calidad del aire |

> Criterio sugerido: significativo si la puntuación es 12 o más, o si existe un requisito legal asociado. Base: Ley 28611 y, como referencia técnica, ISO 14001 (NTP-ISO 14001 en el Perú).`

  const residuos = `## 3. Registro mensual de generación de residuos

${table(['Fecha', 'Área', 'Tipo (aprovechable / no aprovechable / orgánico / peligroso)', 'Descripción', 'Cantidad (kg)', 'Contenedor (color)', 'Destino', 'Empresa operadora (registro)', 'Manifiesto / guía'], blankRows(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 20))}

## 4. Verificación del almacén central

| Requisito | Cumple | Observación |
|---|---|---|
| Techado, ventilado y señalizado | | |
| Piso impermeable y contención para peligrosos | | |
| Residuos peligrosos separados y rotulados | | |
| Extintor y kit antiderrames cercanos | | |
| Acceso restringido | | |

## 5. Plan de minimización

${table(['N.°', 'Residuo', 'Meta de reducción', 'Acción', 'Responsable', 'Plazo'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e'], 6))}

> Base: D. Leg. 1278 y D.S. 014-2017-MINAM. Código de colores: NTP 900.058 (verifique la edición vigente en INACAL).`

  const registrosIndice = `## 3. Índice de registros obligatorios (D.S. 005-2012-TR, art. 33)

${table(['N.°', 'Registro', 'Datos mínimos', 'Responsable', 'Conservación', 'Formato de la plataforma'], [
    ['1', 'Accidentes, enfermedades ocupacionales, incidentes peligrosos e incidentes', 'Datos del evento, causas, medidas, responsable y plazo', '', '10 años (enfermedades: 20)', 'Registro de accidentes'],
    ['2', 'Exámenes médicos ocupacionales', 'Tipo, fecha, aptitud y próximo examen (sin diagnósticos)', '', '5 años', 'Registro de EMO'],
    ['3', 'Monitoreo de agentes y factores disergonómicos', 'Agente, método, resultado y valor de referencia', '', '5 años', 'Registro de monitoreo'],
    ['4', 'Inspecciones internas', 'Área, hallazgo, riesgo, acción y cierre', '', '5 años', 'Registro de inspecciones'],
    ['5', 'Estadísticas de seguridad y salud', 'Horas trabajadas, accidentes e índices', '', '5 años', 'Registro de estadísticas'],
    ['6', 'Equipos de seguridad o emergencia', 'Equipo, ubicación o entrega, estado', '', '5 años', 'Registro de equipos'],
    ['7', 'Inducción, capacitación, entrenamiento y simulacros', 'Tema, tipo, fecha, horas, capacitador y asistentes', '', '5 años', 'Registro de capacitación'],
    ['8', 'Auditorías', 'Auditor, no conformidades y acciones', '', '5 años', 'Registro de auditorías'],
  ])}

> Las MIPYME y las organizaciones que no realizan actividades de alto riesgo pueden llevar registros simplificados (Ley 29783, art. 28). Los formatos referenciales oficiales están en la R.M. 050-2013-TR.`

  const entregaEpp = `## 3. Registro de entrega de equipos de protección personal

${table(['N.°', 'Trabajador', 'DNI', 'Puesto', 'EPP entregado', 'Talla / modelo', 'Norma técnica (NTP)', 'Cantidad', 'Fecha de entrega', 'Fecha de reposición', 'Firma'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 20))}

> Desde la Ley 31246, el EPP debe cumplir las normas técnicas peruanas y su costo lo asume íntegramente el empleador, también para quienes trabajan en remoto (Ley 29783, art. 60).`

  const sctr = `## 3. Control de SCTR (salud y pensión)

${table(['N.°', 'Trabajador o contratista', 'DNI', 'Actividad de riesgo (Anexo 5)', 'Aseguradora salud', 'Aseguradora pensión', 'N.° de póliza / constancia', 'Vigencia desde', 'Vigencia hasta', 'Verificado por'], blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 20))}

> Determine si su actividad figura en el Anexo 5 del D.S. 009-97-SA, actualizado por el D.S. 008-2022-SA, usando su código CIIU. Base: D.S. 003-98-SA y modificatorias.`

  const make = (id: string, name: string, topic: string, summary: string, basis: string[], objective: string, body: string, sheet?: { columns: string[]; rows: string[][] }, retention?: string): AdvancedTemplate => ({
    id,
    name,
    topic,
    summary,
    basis,
    markdown: document(name, objective, basis, body, retention),
    ...(sheet ? { sheet } : {}),
  })

  const ipercBasis = basisLines([], ['ley29783-art57', 'ds005-art77-2020', 'ley29783-art21'])

  return [
    make('tpl-politica-sst', 'Política de Seguridad y Salud en el Trabajo', 'sgsst', 'Texto completo con los datos de su empresa, requisitos del art. 22 y registro de difusión.', basisLines([], ['ley29783-art22', 'ds005-art32']), 'Declarar por escrito el compromiso de la máxima autoridad con la seguridad y salud de todos los trabajadores.', politica),
    make('tpl-eleccion-comite', 'Proceso de elección del Comité o Supervisor de SST', 'comite', 'Cronograma, convocatoria, padrón, acta de elección y acta de instalación.', basisLines(['rm-245-2021-tr'], ['ley29783-art29', 'ley29783-art30', 'ley29783-art31']), 'Elegir a los representantes de los trabajadores con un proceso transparente y documentado.', eleccion),
    make('tpl-acta-comite-mensual', 'Acta de reunión del Comité de SST', 'comite', 'Asistentes, agenda tipo, seguimiento de acuerdos y nuevos acuerdos con responsable.', basisLines([], ['ley29783-art29', 'ds005-art43']), 'Dejar constancia de cada sesión del Comité y del seguimiento de sus acuerdos.', actaMensual),
    make('tpl-paquete-publico', 'Paquete documental SST para entidades públicas', 'publico', '12 documentos con base legal, responsable y estado; responsabilidades por órgano.', basisLines(['servir-modelos-sst', 'servir-normatividad-sst'], ['ley29783-art26']), 'Ordenar la documentación del SGSST de una entidad pública tomando como referencia los modelos de SERVIR.', publico),
    make('tpl-autoevaluacion', 'Autoevaluación del SGSST (lista de verificación)', 'cumplimiento', `${CATALOG_OBLIGATIONS.length} preguntas con base legal y evidencia esperada.`, basisLines(['ds-005-2012-tr'], ['ds005-art32', 'ds005-art33']), 'Medir el avance del SGSST con preguntas verificables antes de una inspección o auditoría.', autoevaluacion, {
      columns: ['N.°', 'Pregunta', 'Base legal', 'Sí', 'No', 'No aplica', 'Evidencia'],
      rows: CATALOG_OBLIGATIONS.map((item, index) => [String(index + 1), `¿${item.title}?`, normNames(item.normIds.slice(0, 2)), '', '', '', item.evidence[0] ?? '']),
    }),
    make('tpl-informe-iperc', 'Informe de la evaluación IPERC', 'iperc', 'Estructura completa: alcance, equipo, metodología, insumos del art. 77, resultados y plan de control.', ipercBasis, 'Presentar los resultados de la IPERC y el plan de control a la dirección y al Comité.', informeIperc),
    make('tpl-bipedestacion', 'Evaluación de bipedestación y descanso sentado (Ley 32721)', 'ergonomia', 'Puestos, horas de pie, excepciones, sillas, sistema rotativo y texto para el RISST.', basisLines(['rm-375-2008-tr'], ['ley32721-art2', 'ley32721-art4', 'ley32721-art5', 'ley32721-dcf3']), 'Identificar los puestos con bipedestación prolongada y garantizar el descanso sentado y la alternancia de postura.', bipedestacion, {
      columns: ['N.°', 'Puesto', 'N.° trabajadores', 'Horas continuas de pie', 'Tipo', '¿Excepción?', 'Medida', 'Sillas', 'Responsable', 'Verificación'],
      rows: blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 15),
    }),
    make('tpl-radiacion-uv', 'Evaluación y control de la radiación UV solar', 'salud', 'Expuestos y riesgo alto, controles mínimos, EPP y vigilancia de piel y ojos.', basisLines([], ['ds003-2026-art5', 'ds003-2026-art11', 'ds003-2026-art12']), 'Identificar a los trabajadores expuestos a la radiación UV y aplicar los controles del D.S. 003-2026-SA.', uv, {
      columns: ['N.°', 'Puesto / tarea', 'Región', 'Horario', '% jornada al sol', 'Índice UV', 'Clasificación', 'Controles colectivos', 'EPP', 'Rotación'],
      rows: blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 15),
    }),
    make('tpl-teletrabajo', 'Evaluación del lugar de teletrabajo', 'teletrabajo', '10 condiciones del puesto remoto, factores psicosociales y medidas.', basisLines(['law-31572', 'ds-002-2023-tr', 'ds-009-2026-tr', 'rm-051-2026-tr'], []), 'Identificar y controlar los riesgos del lugar habitual de teletrabajo.', teletrabajo),
    make('tpl-aspectos-ambientales', 'Matriz de aspectos e impactos ambientales', 'ambiente', 'Significancia por frecuencia y severidad, requisito legal y control operacional.', basisLines(['law-28611'], []), 'Identificar los aspectos ambientales de cada actividad y controlar los significativos.', ambiental, {
      columns: ['N.°', 'Proceso', 'Aspecto', 'Impacto', 'Condición', 'F', 'S', 'F × S', '¿Significativo?', 'Requisito legal', 'Control', 'Responsable'],
      rows: blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k'], 20),
    }),
    make('tpl-residuos', 'Registro de residuos sólidos y plan de minimización', 'ambiente', 'Generación mensual, almacén central, empresa operadora y metas de reducción.', basisLines(['dl-1278', 'ds-014-2017-minam'], []), 'Controlar la generación, segregación, almacenamiento y entrega de los residuos del centro de trabajo.', residuos, {
      columns: ['Fecha', 'Área', 'Tipo', 'Descripción', 'Cantidad (kg)', 'Contenedor', 'Destino', 'Empresa operadora', 'Manifiesto'],
      rows: blankRows(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'], 25),
    }),
    make('tpl-registros-indice', 'Índice y control de los registros obligatorios', 'registros', 'Los 8 registros con datos mínimos, responsable, conservación y formato asociado.', basisLines(['rm-050-2013-tr'], ['ds005-art33', 'ds005-art35', 'ley29783-art28']), 'Ordenar los registros obligatorios y su responsable.', registrosIndice),
    make('tpl-entrega-epp', 'Registro de entrega de EPP', 'registros', 'Entrega por trabajador con norma técnica, talla, reposición y firma.', basisLines([], ['ley29783-art60']), 'Dejar constancia de la entrega y reposición de los equipos de protección personal.', entregaEpp, {
      columns: ['N.°', 'Trabajador', 'DNI', 'Puesto', 'EPP', 'Talla / modelo', 'NTP', 'Cantidad', 'Entrega', 'Reposición', 'Firma'],
      rows: blankRows(['N.°', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'], 25),
    }, 'Conservar 5 años (D.S. 005-2012-TR, art. 35).'),
    make('tpl-sctr', 'Control de SCTR de trabajadores y contratistas', 'salud', 'Pólizas de salud y pensión, vigencias y verificación por persona.', basisLines(['ds-003-98-sa', 'ds-008-2022-sa'], []), 'Verificar que todo trabajador en actividades de riesgo cuente con SCTR vigente.', sctr),
  ]
}

/** Plantilla de la Biblioteca (lista general) → plantilla adaptada que la mejora. */
export const ADAPTED_FOR_TEMPLATE: Record<string, string> = {
  'iperc-generador': 'tpl-iperc-detallada',
  'informe-guia': 'tpl-informe-iperc',
  'guia-comite-sunafil': 'tpl-eleccion-comite',
  'formatos-rm-050': 'tpl-registros-indice',
  'modelos-servir': 'tpl-paquete-publico',
  'politica-sst': 'tpl-politica-sst',
  'plan-anual-sst': 'tpl-programa-anual',
  'acta-comite': 'tpl-acta-comite-mensual',
  'convocatoria-eleccion': 'tpl-eleccion-comite',
  'registro-accidentes': 'tpl-reg-accidentes',
  'investigacion-accidentes': 'tpl-investigacion-form',
  'registro-capacitacion': 'tpl-reg-capacitacion',
  'registro-inspecciones': 'tpl-reg-inspecciones',
  'registro-epp': 'tpl-entrega-epp',
  'evaluacion-ergonomica': 'tpl-ergonomia-form',
  'vigilancia-salud': 'tpl-vigilancia-colectiva',
  'aspectos-ambientales': 'tpl-aspectos-ambientales',
  'registro-residuos': 'tpl-residuos',
  'plan-emergencias': 'tpl-plan-emergencias',
  'elssa-sunafil': 'tpl-autoevaluacion',
  'compendio-servir': 'tpl-matriz-legal',
}

/** Contexto elegido por el usuario en «Por tamaño y rol». */
export interface ObligationContext {
  sizeLabel: string
  sectorLabel: string
  audienceLabel: string
}

/**
 * Plantilla Excel/Word por obligación: qué exige, por qué aplica a esta organización,
 * base legal, evidencia, responsable y un plan de seguimiento mensual.
 */
export function obligationTemplate(item: ObligationItem, context: ObligationContext, org: OrgData): AdvancedTemplate {
  const empresa = orgValue(org, 'razonSocial', '[Razón social]')
  const norms = item.normIds.map((id) => findNorm(id)).filter(Boolean)
  const why = `${empresa} (${context.sizeLabel.toLowerCase()}, ${context.sectorLabel.toLowerCase()}) está comprendida porque ${item.plainText.charAt(0).toLowerCase()}${item.plainText.slice(1)}`
  const columns = ['N.°', 'Acción o requisito', 'Base legal', 'Por qué aplica', 'Evidencia esperada', 'Responsable', 'Plazo / frecuencia', 'Estado', 'Fecha de verificación', 'Observaciones']
  const rows: string[][] = [
    ['1', item.title, norms.map((norm) => norm!.shortName).join('; '), why, item.evidence, item.responsible, item.frequency ?? 'Verificar en la fuente oficial', '', '', ''],
    ...item.evidence.split(/,| y /).map((piece) => piece.trim()).filter(Boolean).map((piece, index) => [String(index + 2), `Contar con: ${piece}`, norms[0]?.shortName ?? '', 'Evidencia de cumplimiento', piece, item.responsible, '', '', '', '']),
  ]
  const tracking = MONTHS.map((month, index) => [String(index + 1), month, '', '', '', ''])
  const body = `## 3. Por qué aplica a su organización

${why}

Contexto evaluado: ${context.sizeLabel} · ${context.sectorLabel} · rol: ${context.audienceLabel}.

## 4. Qué dice la normativa

${norms.map((norm) => `- **${norm!.shortName}** — ${norm!.officialTitle}. ${norm!.plainLanguageSummary}`).join('\n')}

## 5. Plan de cumplimiento

${table(columns, rows)}

## 6. Seguimiento mensual

${table(['N.°', 'Mes', 'Avance', 'Evidencia registrada', 'Responsable', 'Comentario'], tracking)}`
  return {
    id: `obl-${item.id}`,
    name: `Plantilla de cumplimiento: ${item.title}`,
    topic: 'obligacion',
    summary: 'Base legal, por qué aplica, evidencia, responsable y seguimiento mensual.',
    basis: norms.map((norm) => norm!.shortName),
    markdown: document(`Plantilla de cumplimiento: ${item.title}`, item.plainText, norms.map((norm) => `${norm!.shortName}: ${norm!.officialTitle}`), body),
    sheet: { columns, rows: [...rows, ...Array.from({ length: 5 }, (_, index) => [String(rows.length + index + 1), '', '', '', '', '', '', '', '', ''])] },
  }
}

/** Plantilla por tema SOMA: pasos prácticos convertidos en plan con base legal. */
export function somaTemplate(topic: SomaTopic, org: OrgData, facts: string[] = []): AdvancedTemplate {
  const norms = topic.normIds.map((id) => findNorm(id)).filter(Boolean)
  const columns = ['N.°', 'Paso / control', 'Base legal o técnica', 'Responsable', 'Fecha programada', 'Fecha ejecutada', 'Evidencia', 'Estado']
  const rows = topic.practicalSteps.map((step, index) => [String(index + 1), step, norms[0]?.shortName ?? '', '', '', '', '', ''])
  const body = `## 3. Qué dice la normativa

${norms.map((norm) => `- **${norm!.shortName}** — ${norm!.plainLanguageSummary}`).join('\n')}
${facts.length ? `\n### Datos clave\n\n${facts.map((fact) => `- ${fact}`).join('\n')}` : ''}

## 4. Plan de implementación en ${orgValue(org, 'centro', '[centro de trabajo]')}

${table(columns, rows)}`
  return {
    id: `soma-${topic.id}`,
    name: `Plantilla SOMA: ${topic.title}`,
    topic: 'ambiente',
    summary: `${topic.practicalSteps.length} pasos con base legal, responsable y evidencia.`,
    basis: norms.map((norm) => norm!.shortName),
    markdown: document(`Plantilla SOMA: ${topic.title}`, topic.description, norms.map((norm) => norm!.officialTitle), body),
    sheet: { columns, rows: [...rows, ...Array.from({ length: 5 }, (_, index) => [String(rows.length + index + 1), '', '', '', '', '', '', ''])] },
  }
}
