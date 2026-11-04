import { MANUALS_PART_2 } from './guideManuals2'

/**
 * Manuales ampliados que se descargan desde cada guía (Word / PDF).
 *
 * La guía en línea es la lectura rápida; el manual es el documento de trabajo: explica cada
 * paso con su fundamento, quién lo hace, qué evidencia deja, cuánto toma y en qué suele fallar.
 * Las citas de artículos corresponden a textos cotejados en el catálogo (src/catalog).
 */
const SGSST = `# Implementa tu SGSST en 10 pasos — Manual de implementación

Este manual acompaña a quien tiene el encargo de poner en marcha el Sistema de Gestión de Seguridad y Salud en el Trabajo (SGSST) en una empresa o entidad pública. No supone experiencia previa, pero tampoco simplifica lo que la norma exige: cada paso indica qué hacer, con qué base legal, quién participa, qué evidencia debe quedar y los tropiezos más comunes que vemos en las inspecciones.

Una advertencia antes de empezar: el SGSST no es un archivo de documentos. Es una forma de organizar el trabajo para que las personas no se lesionen ni enfermen. Los documentos son la huella de que eso ocurre; si se elaboran solo para mostrarlos, el sistema se cae en la primera visita del inspector o, peor, en el primer accidente.

## 1. Alcance y cómo usar este manual

El manual sirve para organizaciones de cualquier tamaño y sector, públicas o privadas. La obligación de contar con un SGSST nace con el primer trabajador; lo que cambia con el tamaño es la forma (supervisor o comité, registros completos o simplificados, RISST obligatorio o no).

Recomendamos leerlo completo una vez y luego usar cada sección como guía de trabajo. Al final encontrará una lista de verificación y un cronograma tipo de 12 semanas.

## 2. Base legal de cada paso

| Paso | Norma y artículo | Qué exige |
|---|---|---|
| Enfoque de sistema | Ley 29783, art. 17 | Gestionar la SST como sistema, conforme a la legislación y directrices internacionales |
| Liderazgo | Ley 29783, art. 26 (mod. Ley 30222) | El empleador lidera; puede contratar apoyo externo, pero no traslada su responsabilidad |
| Política | Ley 29783, art. 22 | Escrita, específica, fechada, firmada por la máxima autoridad y difundida |
| Comité o supervisor | Ley 29783, arts. 29, 30 y 31; R.M. 245-2021-TR | Comité paritario con 20 o más trabajadores; supervisor con menos de 20; elección por los trabajadores |
| Documentos del sistema | D.S. 005-2012-TR, art. 32 | Política, RISST, IPERC, mapa de riesgos, planificación y programa anual |
| IPERC | Ley 29783, art. 57; D.S. 005-2012-TR, art. 77 (texto del D.S. 002-2020-TR) | Por puesto, con participación, actualizada sin exceder un año |
| Jerarquía de controles | Ley 29783, art. 21 | Eliminar, controlar o aislar, minimizar y, al final, EPP |
| Capacitación | Ley 29783, art. 35 b; D.S. 005-2012-TR, art. 27 | No menos de cuatro capacitaciones al año, centradas en el puesto |
| Exámenes médicos | Ley 29783, art. 49 d (mod. Ley 30222) | Cada dos años; en alto riesgo, al ingreso, durante y al cese |
| Registros | D.S. 005-2012-TR, arts. 33 y 35 | Ocho registros y plazos de conservación |
| Auditoría | D.S. 014-2013-TR, art. 15 | Cada 2 años con actividad de riesgo; cada 3 en los demás casos |

## 3. Procedimiento paso a paso

### Paso 1. Compromiso de la dirección y política de SST

**Qué hacer.** Reúna a la máxima autoridad (gerente general, titular de la entidad) y acuerde por escrito tres cosas: que la SST es parte de la gestión, quién será responsable de conducirla y con qué presupuesto inicial cuenta. Con eso redacte la política.

**Cómo redactar la política.** Debe ser propia de la organización: mencione la actividad real (no "empresa dedicada a diversas actividades"), los riesgos principales y los compromisos mínimos que la ley pide: proteger la seguridad y salud de todos los miembros, cumplir la normativa, garantizar la consulta y participación de los trabajadores y mejorar continuamente. Una página es suficiente.

**Quién participa.** La máxima autoridad la firma; antes debe consultarse con los trabajadores o sus representantes (art. 22 de la Ley).

**Evidencia.** Política fechada y firmada; constancia de difusión (correo, mural fotografiado, firma de toma de conocimiento).

**Tiempo estimado.** Una a dos semanas, contando la consulta.

> Consejo de campo: publique la política donde la gente la vea (ingreso, comedor, intranet). El inspector suele preguntar a un trabajador al azar si la conoce.

### Paso 2. Línea base o diagnóstico inicial

**Qué hacer.** Compare lo que existe con lo que la norma exige. Use la lista de obligaciones aplicables de la plataforma o el formato de línea base y marque cada punto como cumple, cumple parcialmente o no cumple, siempre con la evidencia a la vista.

**Quién participa.** El responsable de SST junto con el comité o supervisor; si aún no existen, con representantes de los trabajadores.

**Evidencia.** Informe de línea base firmado, con brechas priorizadas.

**Tiempo estimado.** Dos semanas en una organización mediana.

> Consejo de campo: no maquille la línea base. Un diagnóstico honesto es la mejor defensa ante una inspección: demuestra que la organización conocía sus brechas y tenía un plan para cerrarlas.

### Paso 3. Organización: comité o supervisor

**Qué hacer.** Cuente a los trabajadores del centro de trabajo. Con 20 o más corresponde un comité paritario de 4 a 12 miembros; con menos de 20, un supervisor elegido por los trabajadores. Siga el procedimiento electoral de la R.M. 245-2021-TR: convocatoria, junta electoral, candidaturas, votación secreta y acta.

**Quién participa.** Los trabajadores eligen a sus representantes; el empleador designa a los suyos. Si hay sindicato mayoritario, se incorpora un observador.

**Evidencia.** Convocatoria, padrón, acta de elección, acta de instalación y libro de actas.

**Tiempo estimado.** Tres a cuatro semanas.

### Paso 4. Identificación de peligros y evaluación de riesgos (IPERC)

**Qué hacer.** Elabore la IPERC por puesto de trabajo, incluyendo tareas rutinarias y no rutinarias y posibles emergencias. Recorra cada área con quienes hacen la tarea: ellos conocen los atajos y los riesgos que no figuran en ningún procedimiento.

**Requisitos mínimos (art. 77 del Reglamento, texto vigente).** Considerar trabajadores especialmente sensibles, discapacidad, procreación y enfoque de género; usar los resultados de monitoreos de agentes, las investigaciones de accidentes y la estadística de vigilancia de la salud.

**Quién participa.** Personal competente, los trabajadores del puesto y el comité o supervisor.

**Evidencia.** Matriz IPERC versionada, lista de participantes y mapa de riesgos.

**Plazo.** Actualizarla sin exceder un año, y antes si cambian las condiciones o hay un daño a la salud (Ley 29783, art. 57).

### Paso 5. Planificación: objetivos y programa anual

**Qué hacer.** Convierta las brechas de la línea base y los riesgos altos de la IPERC en objetivos medibles. Para cada objetivo, defina actividades, responsable, fecha, recursos e indicador. El programa anual es la versión calendarizada de esa planificación.

**Evidencia.** Programa anual aprobado por el comité o supervisor, con presupuesto.

> Consejo de campo: un programa con 80 actividades que nadie ejecuta es peor que uno con 20 cumplidas. Priorice lo que reduce riesgos altos y lo que la ley exige expresamente.

### Paso 6. Documentación: RISST y procedimientos

**Qué hacer.** Si tiene 20 o más trabajadores, elabore el RISST con la estructura del art. 74 del Reglamento y entréguelo bajo cargo a todos, incluidos los trabajadores de intermediación, tercerización y modalidades formativas (art. 75). Redacte procedimientos escritos de trabajo seguro (PETS) para las tareas de riesgo alto.

**Novedad 2026.** Si hay puestos en los que se trabaja de pie tres horas continuas o más, el RISST debe incluir las reglas de descanso sentado y ubicación de sillas (Ley 32721, art. 4 c).

### Paso 7. Capacitación

**Qué hacer.** Programe al menos cuatro capacitaciones al año (Ley 29783, art. 35 b), además de la inducción al ingreso y las que exijan los cambios de puesto o tecnología. Deben estar centradas en el puesto específico (art. 27 del Reglamento).

**Evidencia.** Registro con tema, fecha, duración, capacitador, lista de asistentes con firma y evaluación.

### Paso 8. Salud ocupacional

**Qué hacer.** Organice los exámenes médicos ocupacionales según el protocolo del puesto (R.M. 312-2011-MINSA y su modificatoria). La periodicidad mínima es de dos años; en alto riesgo se hacen al ingreso, durante y al término de la relación laboral.

**Confidencialidad.** El empleador recibe la aptitud (apto, apto con restricciones, no apto), no el diagnóstico. Los resultados son datos sensibles (Ley 29733 y D.S. 016-2024-JUS).

### Paso 9. Registros, inspecciones y seguimiento

**Qué hacer.** Implemente los ocho registros del art. 33 y llévelos al día. Programe inspecciones internas, mida indicadores (accidentabilidad, cumplimiento del programa, capacitaciones) y revise los resultados en el comité cada mes.

**Conservación.** Enfermedades ocupacionales, 20 años; accidentes e incidentes peligrosos, 10 años; los demás registros, 5 años.

### Paso 10. Auditoría y revisión por la dirección

**Qué hacer.** Contrate a un auditor registrado ante el MTPE con la periodicidad que le corresponda (D.S. 014-2013-TR, art. 15). Una vez al año, la alta dirección revisa el desempeño, los resultados de la auditoría y decide los cambios necesarios.

**Evidencia.** Informe de auditoría, plan de acción y acta de revisión por la dirección.

## 4. Adaptación según el tamaño de la organización

| Situación | Organización | Documentos clave | Observación |
|---|---|---|---|
| 1 a 19 trabajadores | Supervisor de SST | Política, IPERC, mapa de riesgos, programa anual, registros | MIPYME sin alto riesgo pueden usar registros simplificados (Ley 29783, art. 28) |
| 20 o más trabajadores | Comité paritario de 4 a 12 miembros | Todo lo anterior y RISST | Reunión ordinaria mensual con acta |
| Actividad de alto riesgo | Comité o supervisor y servicio de SST | Permisos de trabajo, PETS, monitoreos | SCTR obligatorio; auditoría cada 2 años |
| Entidad pública | Comité o supervisor según el número de servidores | Igual que el sector privado | Use como referencia los modelos de SERVIR |

## 5. Ejemplo resuelto

Una empresa de distribución con 48 trabajadores (almacén, reparto y oficina) empezó con una política genérica copiada de internet y sin comité. En la línea base detectó 14 brechas. Priorizó cinco: elección del comité, IPERC del almacén (montacargas y estanterías), capacitación en manejo defensivo para reparto, exámenes médicos vencidos y registro de accidentes. En doce semanas instaló el comité, aprobó la IPERC con participación de los operarios, dictó la primera de cuatro capacitaciones anuales y reprogramó los exámenes médicos. Cuando SUNAFIL la visitó, no tenía todo cerrado, pero pudo demostrar un plan en ejecución con avance verificable.

## 6. Errores frecuentes en inspección

- Política genérica, sin fecha ni firma, o que nadie conoce.
- IPERC hecha en escritorio, sin participación de los trabajadores ni validación en campo.
- Comité elegido a dedo, sin voto secreto, o que no se reúne cada mes.
- Capacitaciones sin registro firmado ni evaluación.
- Exámenes médicos vencidos o resultados con diagnósticos guardados por Recursos Humanos.
- Registros incompletos o llenados el día anterior a la inspección.
- Programa anual sin presupuesto ni seguimiento.

## 7. Lista de verificación

| N.° | Pregunta | Sí | No | Evidencia |
|---|---|---|---|---|
| 1 | ¿La política está firmada, fechada y difundida? | | | |
| 2 | ¿Existe línea base con brechas priorizadas? | | | |
| 3 | ¿El comité o supervisor fue elegido conforme a la R.M. 245-2021-TR? | | | |
| 4 | ¿La IPERC es por puesto y tiene menos de un año? | | | |
| 5 | ¿Hay mapa de riesgos publicado? | | | |
| 6 | ¿El programa anual tiene responsables, fechas y presupuesto? | | | |
| 7 | ¿El RISST fue entregado bajo cargo (si corresponde)? | | | |
| 8 | ¿Se programaron al menos cuatro capacitaciones al año? | | | |
| 9 | ¿Los exámenes médicos están vigentes? | | | |
| 10 | ¿Los ocho registros están al día? | | | |
| 11 | ¿Se definió la fecha de la próxima auditoría? | | | |
| 12 | ¿Hubo revisión por la dirección en los últimos doce meses? | | | |

## 8. Cronograma tipo de 12 semanas

| Semana | Actividad principal | Producto |
|---|---|---|
| 1–2 | Compromiso de la dirección y política | Política firmada y difundida |
| 2–3 | Línea base | Informe de brechas |
| 3–6 | Elección e instalación del comité o supervisor | Actas |
| 4–8 | IPERC por puesto y mapa de riesgos | Matriz y mapa aprobados |
| 7–9 | Programa anual y programa de capacitación | Programas aprobados |
| 8–10 | RISST y PETS críticos | Documentos aprobados y entregados |
| 9–12 | Registros, exámenes médicos e inspecciones | Registros operativos |
| 12 | Primera revisión del avance con la dirección | Acta |

## 9. Glosario breve

- **SGSST:** conjunto de elementos que permiten establecer una política, objetivos y los mecanismos para alcanzarlos en materia de SST.
- **IPERC:** identificación de peligros, evaluación de riesgos y determinación de controles.
- **PETS:** procedimiento escrito de trabajo seguro.
- **Línea base:** diagnóstico inicial del estado de la SST en la organización.
- **Comité paritario:** órgano con igual número de representantes del empleador y de los trabajadores.
`

const IPERC = `# Guía IPERC — Manual de elaboración y actualización

La IPERC es el corazón del sistema de gestión: de ella salen los controles, las capacitaciones, los exámenes médicos y buena parte del programa anual. Este manual describe cómo elaborarla por puesto, cómo valorar los riesgos con criterio y cómo demostrar que los controles realmente funcionan.

## 1. Qué exige la norma

| Requisito | Fuente | Detalle |
|---|---|---|
| Por puesto de trabajo | D.S. 005-2012-TR, art. 77 (texto del D.S. 002-2020-TR) | Se elabora en cada puesto, con personal competente |
| Participación | Mismo artículo | En consulta con los trabajadores y con el Comité, Subcomité o Supervisor |
| Actualización | Ley 29783, art. 57 | Una vez al año como mínimo; antes si cambian las condiciones o hay daños |
| Requisitos mínimos | Art. 77 vigente | Tareas rutinarias y no rutinarias, emergencias, trabajadores sensibles, discapacidad, procreación, género, monitoreos, investigaciones y vigilancia de la salud |
| Jerarquía de controles | Ley 29783, arts. 21 y 50 | Eliminar, controlar o aislar, minimizar, EPP |
| Radiación UV | D.S. 003-2026-SA, art. 11 | Debe evaluarse el riesgo por exposición solar en los puestos a la intemperie |

## 2. Preparación

1. Reúna el organigrama, la lista de puestos y el número de trabajadores por puesto.
2. Liste los procesos y, dentro de cada uno, las actividades y tareas. Una tarea es lo que una persona hace de principio a fin (por ejemplo, "cambiar la rueda de un montacargas").
3. Recoja los insumos obligatorios: resultados de monitoreos (ruido, polvo, iluminación, agentes químicos), investigaciones de accidentes del último año y la estadística de vigilancia médica (sin datos individuales).
4. Conforme el equipo: el responsable de SST, una persona competente en el proceso, un trabajador de cada puesto y un representante del comité o el supervisor.

## 3. Identificación de peligros en campo

Recorra el área con el trabajador que hace la tarea y pregúntele qué hace, con qué herramientas, en qué orden y qué ocurre cuando algo sale mal. Anote el peligro (la fuente con potencial de daño) y el riesgo (la combinación de probabilidad y consecuencia de que ese daño ocurra).

| Peligro | Riesgo asociado | Ejemplo de consecuencia |
|---|---|---|
| Trabajo a más de 1,8 m | Caída a distinto nivel | Fracturas, muerte |
| Montacargas en movimiento | Atropello | Lesiones graves |
| Ruido de compresora | Exposición a ruido sobre el límite | Hipoacusia |
| Trabajo de pie continuo | Sobrecarga postural | Trastornos musculoesqueléticos, várices |
| Exposición solar entre 10:00 y 16:00 | Radiación UV | Quemaduras, lesiones oculares y de piel |
| Atención al público | Violencia externa | Lesiones, estrés |

> Consejo de campo: incluya las tareas no rutinarias (limpieza de tanques, mantenimiento de techos) y las emergencias previsibles. Son las que más accidentes graves producen y las que más se olvidan.

## 4. Evaluación del riesgo

La plataforma usa una matriz de probabilidad por severidad. La probabilidad considera las personas expuestas, los procedimientos existentes, la capacitación y la frecuencia de exposición; la severidad, la peor consecuencia razonable.

| Nivel | Puntaje orientativo | Qué significa |
|---|---|---|
| Trivial / tolerable | Bajo | Se mantiene el control actual y se vigila |
| Moderado | Medio | Requiere medidas en un plazo definido |
| Importante | Alto | No se inicia el trabajo sin reducir el riesgo |
| Intolerable | Muy alto | Se detiene la tarea hasta controlarlo |

## 5. Controles: de lo más eficaz a lo menos

1. **Eliminación:** retirar el peligro (por ejemplo, trabajar a nivel de piso en lugar de en altura).
2. **Sustitución:** cambiar por algo menos peligroso (un producto de limpieza no corrosivo).
3. **Controles de ingeniería:** barandas, guardas, ventilación localizada, sillas en puestos de pie.
4. **Controles administrativos:** procedimientos, permisos, rotación, señalización, horarios fuera del pico de radiación solar.
5. **EPP:** el último recurso, nunca el único.

## 6. Riesgo residual: proyectado frente a verificado

El residual que se calcula al proponer un control es una **proyección**. Solo cuando alguien comprueba en campo que el control existe y funciona, con evidencia (acta, foto, medición), el residual pasa a **verificado** y el riesgo vigente baja. La plataforma aplica esa regla: sin responsable y evidencia, el control queda "ejecutado, por verificar".

## 7. Validación, aprobación y difusión

- Valide la matriz en campo con los trabajadores del puesto.
- Preséntela al comité o supervisor y deje constancia en el acta.
- Actualice el mapa de riesgos.
- Comunique a cada trabajador los riesgos de su puesto (Ley 29783, art. 52).

## 8. Cuándo actualizar

| Situación | Acción |
|---|---|
| Se cumplen doce meses desde la última versión | Revisión completa |
| Nuevo proceso, equipo, producto o sede | Evaluar las tareas nuevas antes de iniciarlas |
| Accidente, incidente peligroso o enfermedad ocupacional | Revisar el puesto afectado y los similares |
| Resultado de monitoreo sobre el límite | Reevaluar y ajustar controles |
| Trabajadora gestante o trabajador con discapacidad | Evaluar el puesto específico |

## 9. Errores frecuentes

- Matrices genéricas copiadas de otra empresa.
- Peligros mezclados con riesgos ("caída" como peligro).
- Controles que solo dicen "usar EPP" o "tener cuidado".
- Ninguna tarea no rutinaria ni emergencia.
- Residual "bajo" sin evidencia de que el control exista.
- Más de un año sin actualizar.

## 10. Lista de verificación

| N.° | Pregunta | Sí | No |
|---|---|---|---|
| 1 | ¿Está organizada por puesto de trabajo? | | |
| 2 | ¿Participaron trabajadores de cada puesto? | | |
| 3 | ¿Incluye tareas no rutinarias y emergencias? | | |
| 4 | ¿Considera trabajadores sensibles, gestantes y personas con discapacidad? | | |
| 5 | ¿Usó monitoreos, investigaciones y estadística de salud? | | |
| 6 | ¿Cada riesgo importante tiene control de nivel superior al EPP? | | |
| 7 | ¿Los controles tienen responsable y plazo? | | |
| 8 | ¿El residual verificado tiene evidencia? | | |
| 9 | ¿Tiene menos de un año? | | |
| 10 | ¿Fue aprobada por el comité o supervisor? | | |
`

const COMITE = `# Comité y supervisor de SST — Manual de conformación y funcionamiento

El comité o el supervisor de SST es el espacio donde trabajadores y empleador se sientan a revisar juntos cómo se previenen los riesgos. Cuando funciona, detecta problemas antes que cualquier auditoría. Este manual explica cuándo corresponde cada figura, cómo se elige, cómo se instala y cómo se sostiene en el tiempo.

## 1. Qué figura le corresponde

| Número de trabajadores | Figura | Base legal |
|---|---|---|
| Menos de 20 | Supervisor de SST elegido por los trabajadores | Ley 29783, art. 30 |
| 20 o más | Comité paritario (de 4 a 12 miembros) | Ley 29783, art. 29 |
| Varias sedes | Comité y subcomités o supervisores por sede | D.S. 005-2012-TR y R.M. 245-2021-TR |

Si existe un sindicato mayoritario, se incorpora un miembro del sindicato como observador (Ley 29783, art. 29).

## 2. Proceso electoral (R.M. 245-2021-TR)

### 2.1 Convocatoria
Convoca la organización sindical más representativa; si no hay sindicato, el empleador (Ley 29783, art. 31). La convocatoria debe publicarse en lugares visibles e indicar el número de representantes, los requisitos, el cronograma y el lugar de votación.

### 2.2 Junta electoral
Se conforma para conducir el proceso con imparcialidad: recibe candidaturas, publica la lista, resuelve tachas y conduce el escrutinio.

### 2.3 Candidaturas
Pueden postular los trabajadores que cumplan los requisitos (mayoría de edad, en planilla, preferentemente con capacitación en SST). Se publica la lista con anticipación para permitir observaciones.

### 2.4 Votación y escrutinio
El voto es personal, libre y secreto. Al cierre, se cuentan los votos en presencia de los personeros y se levanta el acta con resultados, titulares y suplentes.

### 2.5 Designación de los representantes del empleador
El empleador designa por escrito a sus representantes, en igual número que los de los trabajadores.

## 3. Instalación

En la primera reunión se instala el comité, se elige al presidente y al secretario, se aprueba el plan de trabajo y se abre el libro de actas. El supervisor, por su parte, deja constancia de su designación y de la inducción recibida.

## 4. Funciones principales

- Aprobar el programa anual de SST, el RISST y el plan de capacitación.
- Participar en la IPERC y validar el mapa de riesgos.
- Realizar inspecciones periódicas a las áreas de trabajo.
- Investigar accidentes, incidentes peligrosos y enfermedades ocupacionales y verificar que se cumplan las medidas.
- Revisar cada mes la estadística de accidentes e indicadores.
- Promover que los trabajadores conozcan y cumplan las normas.

## 5. Reuniones

| Tipo | Frecuencia | Qué debe quedar |
|---|---|---|
| Ordinaria | Mensual | Acta con asistentes, temas, acuerdos, responsables y plazos |
| Extraordinaria | Ante accidente grave o situación urgente | Acta con la decisión adoptada |
| Seguimiento | En cada ordinaria | Estado de los acuerdos previos |

> Consejo de campo: redacte los acuerdos con verbo, responsable y fecha ("Instalar baranda en mezzanine — Jefe de Mantenimiento — 30/06"). Un acuerdo sin responsable no se cumple.

## 6. Derechos de los representantes

Los miembros del comité y el supervisor tienen licencia con goce de haber para cumplir sus funciones, protección contra el despido incausado y facilidades para desempeñar su labor, desde seis meses antes y hasta seis meses después del término de su función (Ley 29783, art. 32, texto de la Ley 30222).

## 7. Errores frecuentes

- Elección sin voto secreto o sin acta.
- Comité con más representantes del empleador que de los trabajadores.
- Reuniones que solo existen en el papel.
- Acuerdos sin seguimiento.
- Representantes sin capacitación.

## 8. Lista de verificación

| N.° | Pregunta | Sí | No |
|---|---|---|---|
| 1 | ¿La figura corresponde al número de trabajadores? | | |
| 2 | ¿Hubo convocatoria publicada y junta electoral? | | |
| 3 | ¿La votación fue secreta y hay acta de escrutinio? | | |
| 4 | ¿Los representantes del empleador fueron designados por escrito? | | |
| 5 | ¿Existe acta de instalación? | | |
| 6 | ¿Se reúne cada mes con acta? | | |
| 7 | ¿Los acuerdos tienen responsable y plazo? | | |
| 8 | ¿El comité aprobó el programa anual y el RISST? | | |

## 9. Modelos de texto

**Convocatoria (extracto).** «Se convoca a los trabajadores de [razón social], centro de trabajo [sede], a elegir a [número] representantes titulares y [número] suplentes ante el Comité de Seguridad y Salud en el Trabajo para el periodo [fechas]. Las candidaturas se reciben del [fecha] al [fecha] en [lugar]. La votación se realizará el [fecha] de [hora] a [hora] en [lugar].»

**Acuerdo tipo.** «El Comité acuerda que el área de Mantenimiento instale guardas en la cizalla N.° 2 antes del [fecha]. El Secretario verificará la instalación y la informará en la próxima sesión.»
`

export const GUIDE_MANUALS: Record<string, string> = {
  'guia-sgsst': SGSST,
  'guia-iperc': IPERC,
  'guia-comite': COMITE,
  ...MANUALS_PART_2,
}

export function guideManual(id: string): string | undefined {
  return GUIDE_MANUALS[id]
}
