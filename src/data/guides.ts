import { fineTableMarkdown } from '../lib/sunafil'

/**
 * Guias publicas del Observatorio. Se leen en linea y se descargan en Word,
 * Markdown o PDF (src/lib/docgen.ts). Son orientativas y citan la norma base;
 * el texto vigente debe verificarse en la fuente oficial.
 */
export interface Guide {
  id: string
  title: string
  summary: string
  audience: string
  minutes: number
  normIds: string[]
  body: string
}

export const GUIDES: Guide[] = [
  {
    id: 'guia-sgsst',
    title: 'Implementa tu SGSST en 10 pasos',
    summary: 'Ruta completa desde la política hasta la revisión por la dirección, adaptable a cualquier empresa o entidad.',
    audience: 'Empleadores, responsables SST, entidades públicas',
    minutes: 12,
    normIds: ['law-29783', 'ds-005-2012-tr'],
    body: `# Implementa tu SGSST en 10 pasos

El Sistema de Gestión de Seguridad y Salud en el Trabajo (SGSST) es obligatorio para todo empleador, público o privado, desde el primer trabajador (Ley N.° 29783 y D.S. N.° 005-2012-TR). El tamaño cambia la **forma**, no la obligación.

## Paso a paso

| # | Paso | Producto | Responsable |
|---|---|---|---|
| 1 | Compromiso de la dirección | Política de SST firmada y difundida | Máxima autoridad |
| 2 | Línea base | Diagnóstico inicial del cumplimiento | Responsable SST |
| 3 | Organización | Comité paritario (≥ 20 trabajadores) o supervisor de SST | Empleador y trabajadores |
| 4 | Identificación de peligros | IPERC por puesto y mapa de riesgos | Responsable SST + trabajadores |
| 5 | Planificación | Objetivos, plan y programa anual con presupuesto | Gerencia y Comité |
| 6 | Documentación | RISST (≥ 20 trabajadores), procedimientos, PETS | Responsable SST |
| 7 | Capacitación | Mínimo 4 capacitaciones al año por trabajador | Responsable SST |
| 8 | Salud ocupacional | Exámenes médicos y programa de vigilancia | Médico ocupacional |
| 9 | Registros y seguimiento | Registros obligatorios, inspecciones, indicadores | Responsable SST |
| 10 | Mejora continua | Auditoría y revisión por la dirección | Alta dirección |

## Adaptación por tamaño

| Tamaño | Organización | Documentos clave | Consejo |
|---|---|---|---|
| 1–19 trabajadores | Supervisor de SST elegido por los trabajadores | Política, IPERC, plan anual, registros | Use formatos simplificados de la R.M. N.° 050-2013-TR |
| 20 o más | Comité paritario (4 a 12 miembros) | Todo lo anterior + RISST | Reunión ordinaria mensual con acta |
| Alto riesgo | Comité + servicio de SST | Permisos de alto riesgo, PETS, monitoreos | Auditoría externa más frecuente |
| Entidad pública | Comité o supervisor según servidores | Igual que el sector privado | Revise los modelos de SERVIR |

## Errores frecuentes en inspección

- Política sin firma o sin difusión.
- IPERC genérico, sin participación de los trabajadores.
- Comité elegido sin voto secreto o sin actas mensuales.
- Capacitaciones sin registro firmado.
- Exámenes médicos vencidos.
`,
  },
  {
    id: 'guia-iperc',
    title: 'Elabora el IPERC paso a paso',
    summary: 'Metodología de identificación de peligros, evaluación de riesgos y controles con jerarquía y riesgo residual.',
    audience: 'Supervisores, jefes de área, comités',
    minutes: 10,
    normIds: ['ds-005-2012-tr', 'rm-050-2013-tr'],
    body: `# Elabora el IPERC paso a paso

La matriz IPERC (Identificación de Peligros, Evaluación de Riesgos y Medidas de Control) se elabora **por puesto de trabajo**, con participación de los trabajadores, y se actualiza al menos una vez al año o cuando cambian las condiciones o tras un accidente.

## 1. Inventario

1. Liste procesos, actividades y tareas (rutinarias y no rutinarias).
2. Identifique a los trabajadores expuestos, incluidos contratistas y visitantes.

## 2. Identificación de peligros

Clasifique: físicos, químicos, biológicos, ergonómicos, psicosociales, mecánicos, eléctricos, locativos, incendio y explosión, tránsito, altura, espacios confinados.

## 3. Evaluación

| Probabilidad × Severidad | Nivel | Decisión |
|---|---|---|
| 1–4 | Bajo / trivial | Mantener controles |
| 5–8 | Moderado | Mejorar controles en plazo definido |
| 9–16 | Importante | No iniciar o detener hasta reducir el riesgo |
| 17–25 | Intolerable | Prohibido trabajar |

## 4. Jerarquía de controles (obligatoria en ese orden)

1. Eliminación
2. Sustitución
3. Controles de ingeniería
4. Controles administrativos (señalización, procedimientos, capacitación)
5. Equipos de protección personal (EPP) — siempre como último recurso

## 5. Riesgo residual y seguimiento

Recalcule el nivel con los controles propuestos, asigne responsable, plazo y evidencia. Use la herramienta **Matriz IPERC** de esta plataforma para generar y exportar a Excel.
`,
  },
  {
    id: 'guia-comite',
    title: 'Comité y supervisor de SST',
    summary: 'Cuándo corresponde cada uno, cómo se eligen, cuántos miembros y qué hacen cada mes.',
    audience: 'Empleadores, trabajadores, sindicatos',
    minutes: 7,
    normIds: ['law-29783', 'ds-005-2012-tr', 'ds-001-2021-tr', 'sunafil-guia-comite'],
    body: `# Comité y supervisor de SST

| Situación | Órgano | Cómo se conforma |
|---|---|---|
| 20 o más trabajadores | Comité paritario de SST | Mitad representantes del empleador (designados) y mitad de los trabajadores (votación secreta) |
| Menos de 20 trabajadores | Supervisor de SST | Elegido por los trabajadores |

## Claves del comité

- Mínimo 4 y máximo 12 miembros.
- Reunión ordinaria **mensual** y extraordinaria ante accidentes graves.
- Libro de actas con acuerdos y seguimiento.
- Aprueba el plan anual, el programa de capacitación y el RISST.
- Participa en investigaciones de accidentes e inspecciones.

## Calendario mensual sugerido

1. Revisión de accidentes e incidentes del mes.
2. Avance del programa anual y capacitaciones.
3. Resultado de inspecciones y acciones vencidas.
4. Indicadores (IF, IS, IA) y acuerdos con responsables.
`,
  },
  {
    id: 'guia-registros',
    title: 'Registros obligatorios y plazos de conservación',
    summary: 'Qué registros exige el SGSST, qué contienen y cuántos años guardarlos.',
    audience: 'Responsables SST, RR. HH., auditores',
    minutes: 6,
    normIds: ['ds-005-2012-tr', 'rm-050-2013-tr'],
    body: `# Registros obligatorios del SGSST

Pueden llevarse en físico o digital. Los formatos referenciales están en la R.M. N.° 050-2013-TR.

| # | Registro | Conservación |
|---|---|---|
| 1 | Accidentes de trabajo, enfermedades ocupacionales, incidentes peligrosos e incidentes | Accidentes e incidentes: 10 años · Enfermedades ocupacionales: 20 años |
| 2 | Exámenes médicos ocupacionales | 5 años (manteniendo la confidencialidad) |
| 3 | Monitoreo de agentes físicos, químicos, biológicos, psicosociales y disergonómicos | 5 años |
| 4 | Inspecciones internas de SST | 5 años |
| 5 | Estadísticas de seguridad y salud | 5 años |
| 6 | Equipos de seguridad o emergencia | 5 años |
| 7 | Inducción, capacitación, entrenamiento y simulacros | 5 años |
| 8 | Auditorías | 5 años |

## Buenas prácticas

- Un responsable y una carpeta (física o digital) por registro.
- Numeración correlativa y firmas.
- Copia de seguridad mensual si el registro es digital.
- Los datos médicos van en un archivo separado bajo custodia del servicio médico.
`,
  },
  {
    id: 'guia-sunafil',
    title: 'Inspección SUNAFIL y multas 2026',
    summary: 'Cómo se calcula una multa, las infracciones más sancionadas y cómo preparar el expediente.',
    audience: 'Gerencia, RR. HH., responsables SST',
    minutes: 9,
    normIds: ['law-28806', 'ds-019-2006-tr', 'ds-008-2020-tr'],
    body: `# Inspección SUNAFIL y multas 2026

La multa se calcula cruzando **tamaño de empresa**, **gravedad** y **número de trabajadores afectados**, en UIT (2024: S/ 5,150 · 2025: S/ 5,350 · 2026: S/ 5,500).

## Tabla referencial (art. 48 del D.S. N.° 019-2006-TR)

${fineTableMarkdown(2026)}

## Reglas que más encarecen la multa

- **Sin REMYPE vigente** antes de la orden de inspección: se aplica la tabla de No MYPE.
- **Accidente mortal**: se consideran afectados todos los trabajadores del centro de trabajo.
- Cada infracción se multa por separado dentro del mismo procedimiento.

## Infracciones más frecuentes

| Gravedad | Ejemplos |
|---|---|
| Leve | Falta de orden y limpieza sin riesgo grave; no comunicar incidentes leves |
| Grave | IPERC ausente o desactualizado; comité o supervisor no constituido; RISST no entregado; menos de 4 capacitaciones al año |
| Muy grave | Sin EMO o vigilancia de salud; sin SGSST; trabajos de alto riesgo sin certificación; incumplimiento que causa accidente mortal |

## Expediente listo para inspección

1. Política, objetivos y plan anual firmados.
2. IPERC por puesto y mapa de riesgos.
3. Actas del comité de los últimos 12 meses.
4. Registros obligatorios al día.
5. Constancias de entrega de RISST y EPP.
6. EMO vigentes (certificados de aptitud, no diagnósticos).
7. Constancia REMYPE, si corresponde.

Use la **calculadora de multas** en Herramientas → Analítica para estimar su contingencia.
`,
  },
  {
    id: 'guia-auditoria',
    title: 'Auditoría del SGSST',
    summary: 'Quién puede auditar, cada cuánto y cómo preparar el plan de acción posterior.',
    audience: 'Gerencia, responsables SST, auditores',
    minutes: 6,
    normIds: ['ds-014-2013-tr', 'ds-005-2012-tr'],
    body: `# Auditoría del SGSST

La auditoría externa la realiza un **auditor registrado** ante la autoridad de trabajo (D.S. N.° 014-2013-TR) que sea independiente: no debe haber prestado consultoría a la empresa en los dos años previos.

## Periodicidad referencial

| Tipo de actividad | Frecuencia |
|---|---|
| Alto riesgo | Cada 2 años |
| Otras actividades | Cada 3 años |
| Hasta 10 trabajadores sin alto riesgo | Exonerada, salvo requerimiento de la autoridad |

## Antes, durante y después

1. **Antes**: autoevaluación con la lista de verificación del reglamento, cierre de pendientes.
2. **Durante**: entrevistas a trabajadores y comité, revisión documental, visita de campo.
3. **Después**: plan de acción con responsables, plazos y evidencia; registro de auditoría.

> La auditoría ISO 45001 es voluntaria y **no reemplaza** la auditoría legal.
`,
  },
  {
    id: 'guia-salud',
    title: 'Salud ocupacional, EMO y salud mental',
    summary: 'Exámenes médicos, perfil del médico ocupacional, vigilancia por riesgo y factores psicosociales.',
    audience: 'Servicios médicos, RR. HH., responsables SST',
    minutes: 8,
    normIds: ['rm-312-2011-minsa', 'rm-021-2016-minsa', 'law-31246', 'law-29733'],
    body: `# Salud ocupacional, EMO y salud mental

## Exámenes médicos ocupacionales (EMO)

| Tipo | Momento | Quién paga |
|---|---|---|
| Preocupacional / de ingreso | Antes de iniciar labores | Empleador |
| Periódico | Según riesgo del puesto | Empleador |
| De retiro | Al cese (a solicitud) | Empleador |

El empleador recibe solo el **certificado de aptitud**; los diagnósticos son confidenciales y son datos sensibles (Ley N.° 29733).

## Médico ocupacional

Según la R.M. N.° 021-2016/MINSA, debe ser médico colegiado y habilitado con especialidad en medicina ocupacional (o del trabajo) o maestría en salud ocupacional.

## Salud mental y factores psicosociales

La Ley N.° 31246 incorpora el riesgo biológico y la salud mental en la vigilancia de la salud, en trabajo presencial o remoto. Acciones mínimas:

- Evaluación de factores psicosociales.
- Canal confidencial de reporte.
- Programa de prevención con seguimiento.
`,
  },
  {
    id: 'guia-ergonomia',
    title: 'Ergonomía e higiene ocupacional',
    summary: 'Límites de carga manual, pantallas, ruido e iluminación de la R.M. N.° 375-2008-TR y monitoreos.',
    audience: 'Supervisores, ergónomos, higienistas',
    minutes: 6,
    normIds: ['rm-375-2008-tr'],
    body: `# Ergonomía e higiene ocupacional

## Valores de referencia de la R.M. N.° 375-2008-TR

| Tema | Referencia |
|---|---|
| Carga manual general | 25 kg varones · 15 kg mujeres |
| Trabajo con pantallas | Pausas periódicas; evitar jornadas continuas de digitación |
| Ruido en oficinas | Confort acústico recomendado ≤ 65 dB |
| Iluminación | ~300 lux tareas administrativas · ~500 lux trabajo con computadora |

## Métodos de evaluación

REBA y RULA (posturas), NIOSH (levantamiento), OWAS (posturas globales).

## Monitoreo de agentes

- Equipos calibrados (sonómetros, luxómetros, dosímetros, bombas de muestreo).
- Laboratorios acreditados ante INACAL para análisis.
- Registro de monitoreo conservado 5 años.
`,
  },
  {
    id: 'guia-emergencias',
    title: 'Plan de respuesta ante emergencias',
    summary: 'Estructura del plan, brigadas, simulacros, extintores y rutas de evacuación.',
    audience: 'Brigadistas, responsables SST, administradores de locales',
    minutes: 6,
    normIds: ['ds-005-2012-tr'],
    body: `# Plan de respuesta ante emergencias

## Contenido mínimo

1. Identificación de escenarios (sismo, incendio, derrame, emergencia médica, tsunami si aplica).
2. Organización: jefe de emergencias y brigadas (evacuación, primeros auxilios, contra incendios).
3. Recursos: extintores, botiquines, camillas, alarmas, señalización.
4. Procedimientos de actuación por escenario.
5. Comunicaciones y números de emergencia.
6. Simulacros programados y su evaluación.

## Indicadores

| Indicador | Meta |
|---|---|
| Simulacros ejecutados / programados | 100 % |
| Tiempo de evacuación | Mejora en cada simulacro |
| Extintores con mantenimiento vigente | 100 % |
`,
  },
  {
    id: 'guia-residuos',
    title: 'Residuos sólidos y SOMA',
    summary: 'Segregación, almacenamiento, operadores autorizados e indicadores ambientales integrados a la SST.',
    audience: 'Supervisores SSOMA, administradores, operaciones',
    minutes: 7,
    normIds: ['law-28611', 'dl-1278', 'ds-014-2017-minam'],
    body: `# Residuos sólidos y SOMA

El componente ambiental de SSOMA se apoya en la Ley General del Ambiente y en el D.L. N.° 1278 de gestión integral de residuos sólidos y su reglamento.

## Ciclo de manejo

1. **Minimizar** en la fuente.
2. **Segregar** en peligrosos y no peligrosos (aprovechables, orgánicos, no aprovechables).
3. **Almacenar** en zona techada, señalizada y con contención si son peligrosos.
4. **Transportar y disponer** con empresas operadoras autorizadas (EO-RS).
5. **Registrar** volúmenes y manifiestos.

## Indicadores

| Indicador | Uso |
|---|---|
| kg de residuos / trabajador / mes | Tendencia de generación |
| % de residuos valorizados | Economía circular |
| Manifiestos de residuos peligrosos completos | Cumplimiento |
`,
  },
  {
    id: 'guia-contratistas',
    title: 'Contratistas, capacitación y trabajos de alto riesgo',
    summary: 'Verificación de contratistas, SCTR, inducción, 4 capacitaciones anuales y certificación de alto riesgo.',
    audience: 'Compras, operaciones, responsables SST',
    minutes: 7,
    normIds: ['law-29783', 'rm-111-2013-mem-dm', 'ds-011-2019-tr'],
    body: `# Contratistas, capacitación y trabajos de alto riesgo

El empleador principal debe **verificar** que sus contratistas cumplan la normativa de SST. Si no lo hace, comparte la responsabilidad ante un accidente.

## Lista de verificación de contratistas

| Requisito | Evidencia |
|---|---|
| SCTR (salud y pensión) vigente | Constancia del mes |
| IPERC y PETS de su actividad | Documentos revisados |
| Inducción en el centro de trabajo | Registro firmado |
| EPP adecuado | Inspección de ingreso |
| Personal certificado para alto riesgo | Certificados vigentes |

## Capacitación

- Mínimo **4 capacitaciones al año** por trabajador, en horario de trabajo y a cargo del empleador.
- Inducción antes de iniciar labores y al cambiar de puesto o tecnología.

## Trabajos de alto riesgo

Altura, espacios confinados, trabajos en caliente, energía eléctrica (bloqueo y etiquetado según RESESATE), izaje y excavaciones requieren **permiso escrito**, personal capacitado y supervisión.
`,
  },
  {
    id: 'guia-panorama-2026',
    title: 'Panorama SST 2024–2026: precedentes, Ley de la Silla, mercado y responsabilidad penal',
    summary: 'Lo que cambió en los últimos tres años: criterios del TFL, nuevas obligaciones ergonómicas, salarios de referencia, costos de consultoría y riesgo penal.',
    audience: 'Gerencia, jefes SSOMA, consultores, profesionales en formación',
    minutes: 14,
    normIds: ['law-29783', 'ds-019-2006-tr', 'rm-375-2008-tr', 'ds-014-2013-tr'],
    body: `# Panorama SST 2024–2026

Síntesis del informe de mercado SST/SSOMA del Perú (2024–2026) incorporado al Observatorio. Los hitos posteriores a 2025 deben verificarse en El Peruano antes de citarlos.

## 1. Precedentes del Tribunal de Fiscalización Laboral (SUNAFIL)

| Resolución | Materia | Criterio práctico |
|---|---|---|
| Sala Plena 011-2022 | Supervisión efectiva | No basta contratar un supervisor: se exigen procedimientos documentados de control en campo |
| Sala Plena 005-2023 | Responsabilidad solidaria | Contratista y empresa principal comparten el deber de prevención |
| 557-2024 (1.ª Sala) | Idoneidad del EPP | El cargo de entrega no prueba que el EPP sea adecuado al riesgo |
| Sala Plena 005-2025 | Casilla electrónica | Requerimientos sin alerta al correo o celular afectan el derecho de defensa |
| Sala Plena 007-2025 | Salud mental | Reincorporar tras un trauma sin EMO de reincorporación ni evaluación mental es infracción muy grave |
| Sala Plena 008-2025 | Quiebre del nexo causal | Exime al empleador diligente ante causa ajena, negligencia del trabajador capacitado o fuerza mayor |

## 2. Ley de la Silla (Ley N.° 32721, julio de 2026)

- Aplica a puestos con **bipedestación prolongada**: 3 horas o más de pie de forma continua.
- Asientos con respaldo, individuales o en esquema rotativo documentado en el **RISST** y aprobado por el Comité.
- Si estar de pie es inherente a la tarea, la exclusión se sustenta en el **IPERC** con pausas activas o rotación.
- Plazos informados: 180 días para el reglamento y 360 días para adecuar el RISST; mientras tanto rige la R.M. N.° 375-2008-TR.
- Sectores priorizados: retail, hostelería, salud, banca presencial, transporte y aeropuertos, educación y vigilancia.

## 3. Habilitaciones legales frente a certificaciones comerciales

| Perfil | Base legal | Lo que no lo reemplaza |
|---|---|---|
| Auditor registrado del SGSST | D.S. N.° 014-2013-TR | Auditor líder ISO 45001 u homologación comercial |
| Médico ocupacional | R.M. N.° 312-2011/MINSA, R.M. N.° 021-2016/MINSA | Médico general o cursos cortos |
| Ingeniero de seguridad minera | D.S. N.° 024-2016-EM (art. 70) | Ingeniería no listada sin experiencia minera |
| Jefe de prevención en obra | D.S. N.° 011-2019-TR (Anexo 3) | Diplomados sin colegiatura |

> La homologación de proveedores (SGS, Bureau Veritas, Hodelpe) es un requisito comercial: no sustituye la auditoría legal del SGSST.

## 4. Remuneraciones de referencia (S/ mensuales)

| Cargo | Rango |
|---|---|
| Gerente SSOMA — gran empresa / minería | 25,000 – 35,000+ |
| Gerente o subgerente SSOMA — mediana empresa | 18,000 – 25,000 |
| Especialista SST — sector público (CAS) | 4,100 – 8,250 |
| Médico ocupacional — jornada completa | 5,000 – 8,000 |
| Médico ocupacional — tiempo parcial (4–5 h/día) | 3,500 – 4,000 por empresa |
| Enfermería ocupacional | ~3,000 |
| Practicante SST — sector público | 1,130 – 1,600 |

## 5. Costos de consultoría observados

| Servicio | Referencia |
|---|---|
| Monitoreo ocupacional por punto | ~S/ 180 |
| Paquete de monitoreo en planta mediana | ~S/ 1,500 |
| Auditoría del SGSST para pyme | desde S/ 1,500 + IGV |
| Capacitación obligatoria | desde S/ 100 + IGV por participante |
| Proyecto de ingeniería de control (3 meses) | ~S/ 45,000 |

## 6. Responsabilidad penal (art. 168-A del Código Penal)

| Modalidad | Pena privativa de libertad |
|---|---|
| Peligro inminente y grave por infracción deliberada | 1 a 4 años |
| Lesión grave | 3 a 6 años |
| Muerte | 4 a 8 años |

Sin una delegación formal de funciones SST con autonomía técnica y presupuesto, la posición de garante recae en el gerente general. La multa administrativa y la condena penal pueden coexistir.
`,
  },
]

export function findGuide(id: string): Guide | undefined {
  return GUIDES.find((guide) => guide.id === id)
}
