/**
 * Guias premium. Viven solo en el Worker: el bundle publico del frontend no las contiene.
 * El cuerpo usa el mismo subconjunto de Markdown que renderiza el frontend.
 */
export interface PremiumGuide {
  id: string
  title: string
  summary: string
  minutes: number
  level: 'Inicial' | 'Intermedio' | 'Avanzado'
  tags: string[]
  body: string
}

export const PREMIUM_GUIDES: PremiumGuide[] = [
  {
    id: 'ia-aplicada-sst',
    title: 'Cómo aplicar inteligencia artificial en SST y SSOMA',
    summary: 'Casos de uso reales, qué tareas automatizar primero, límites legales y una hoja de ruta de 90 días.',
    minutes: 14,
    level: 'Inicial',
    tags: ['IA', 'Hoja de ruta', 'Casos de uso'],
    body: `# Cómo aplicar inteligencia artificial en SST y SSOMA

La IA no reemplaza al responsable del SGSST ni al Comité de SST: **acelera** la lectura normativa, la redacción de documentos y el análisis de datos, pero las decisiones (aprobar un IPERC, paralizar un trabajo, calificar una aptitud médica) siguen siendo humanas y firmadas.

## 1. Dónde aporta valor hoy

| Proceso SST | Qué hace la IA | Ahorro típico | Riesgo a controlar |
|---|---|---|---|
| IPERC por puesto | Propone peligros, consecuencias y controles a partir de la descripción de la tarea | 50–70 % del tiempo de redacción | Validación en campo con los trabajadores (obligatoria) |
| Investigación de accidentes | Ordena la línea de tiempo, sugiere causas inmediatas y básicas, redacta el informe | 40 % | Sesgo de culpar al trabajador; revisar con el Comité |
| Inspecciones | Clasifica hallazgos de fotos y listas de verificación, genera el plan de acción | 30–50 % | Fotos con rostros: datos personales |
| Normativa | Resume normas, compara versiones, arma matrices de requisitos legales | 60 % | Verificar siempre en El Peruano / gob.pe |
| Capacitación | Genera material, preguntas de evaluación y microcursos por puesto | 50 % | Mantener el registro firmado de asistencia |
| Indicadores | Calcula IF, IS, IA y tendencias; redacta el informe mensual | 70 % | Calidad de las horas-hombre reportadas |
| SOMA / residuos | Clasifica residuos, calcula indicadores de generación y prepara la declaración | 40 % | Cifras deben venir del registro real |

## 2. Qué automatizar primero (matriz esfuerzo / impacto)

1. **Redacción de documentos repetitivos** (PETS, ATS, charlas de 5 minutos, actas): bajo esfuerzo, alto impacto.
2. **Asistente normativo interno** con las normas descargadas de fuentes oficiales: esfuerzo medio, alto impacto.
3. **Tablero de indicadores** alimentado por los registros obligatorios: esfuerzo medio, impacto alto y sostenido.
4. **Inspecciones con visión artificial** (detección de EPP): esfuerzo alto; empiece solo con piloto acotado.

## 3. Reglas de oro

- **Fuente primero**: toda respuesta normativa debe citar la norma y el enlace oficial. Si la IA no tiene la fuente, la respuesta es "requiere verificación".
- **Humano en el circuito**: ningún documento generado se publica ni se firma sin revisión del responsable SST.
- **Datos de salud fuera**: los resultados de EMO y diagnósticos son datos sensibles (Ley N.° 29733). No los cargue en herramientas públicas.
- **Trazabilidad**: guarde el prompt, la versión del modelo y quién aprobó el resultado.

## 4. Hoja de ruta de 90 días

| Semana | Entregable | Indicador de éxito |
|---|---|---|
| 1–2 | Inventario de documentos y registros; elegir 3 casos de uso | Lista priorizada aprobada |
| 3–4 | Biblioteca normativa oficial en una carpeta controlada | 100 % de normas con enlace oficial |
| 5–6 | Plantillas de prompts para IPERC, ATS y charlas | 10 documentos generados y revisados |
| 7–8 | Tablero de indicadores conectado a registros | IF, IS, IA mensuales automáticos |
| 9–10 | Piloto de asistente normativo con 5 usuarios | 80 % de respuestas útiles con cita |
| 11–12 | Procedimiento de uso de IA aprobado por el Comité | Procedimiento firmado y difundido |

> Consejo: marque cada hito en el panel de avance premium. El porcentaje se actualiza al instante y queda guardado en su cuenta.
`,
  },
  {
    id: 'sistema-agentes-ia',
    title: 'Diseña un sistema de agentes de IA para tu área SST',
    summary: 'Arquitectura de agentes coordinados: orquestador, agente normativo, IPERC, inspecciones y reportes, con flujos de solicitud.',
    minutes: 22,
    level: 'Avanzado',
    tags: ['Agentes', 'Arquitectura', 'Automatización'],
    body: `# Diseña un sistema de agentes de IA para tu área SST

Un **agente** es un modelo de lenguaje con un objetivo, instrucciones, herramientas (buscar, leer archivos, escribir en una hoja, enviar un correo) y memoria. Un **sistema de agentes** reparte el trabajo entre especialistas coordinados por un orquestador, igual que un área SST real.

## 1. Arquitectura recomendada

\`\`\`
Solicitud (correo, formulario, chat, WhatsApp)
        │
        ▼
┌──────────────────────┐
│  Agente orquestador  │  clasifica la solicitud, elige especialista, controla calidad
└─────────┬────────────┘
          │
 ┌────────┼──────────┬──────────────┬──────────────┐
 ▼        ▼          ▼              ▼              ▼
Normativo IPERC   Inspecciones   Salud ocup.    Reportes
(cita     (matriz  (hallazgos →   (calendario    (IF/IS/IA,
fuentes)  y        plan de        EMO, sin       informe
          controles) acción)      datos sensib.) mensual)
          │
          ▼
  Revisión humana (responsable SST / Comité)  →  Registro y archivo versionado
\`\`\`

## 2. Ficha de cada agente

| Agente | Objetivo | Herramientas | Entrada | Salida | Aprobador |
|---|---|---|---|---|---|
| Orquestador | Enrutar y verificar | Clasificador, cola de tareas | Solicitud libre | Ticket con prioridad | — |
| Normativo | Responder con cita | Búsqueda en biblioteca oficial | Pregunta | Respuesta + norma + enlace | Responsable SST |
| IPERC | Proponer matriz por puesto | Catálogo de peligros, plantilla Excel | Puesto, tareas, sector | Filas IPERC con P×S | Comité SST |
| Inspecciones | Convertir hallazgos en acciones | Fotos, checklist, hoja de plan | Hallazgos | Plan de acción con responsables y plazos | Supervisor de área |
| Salud ocupacional | Programar vigilancia | Calendario, padrón (sin diagnósticos) | Ingresos, ceses, periodicidad | Programación EMO | Médico ocupacional |
| Reportes | Indicadores y tendencias | Hoja de registros, gráficos | Registros del mes | Informe mensual y alertas | Gerencia |

## 3. Flujo de solicitudes (ejemplos)

1. **"Necesito el IPERC del nuevo puesto de soldador"** → Orquestador detecta tipo *IPERC* → Agente IPERC genera borrador → Agente normativo añade sustento → tarea de validación en campo para el supervisor → Comité aprueba → se versiona.
2. **"¿Cada cuánto debo auditar mi SGSST?"** → Agente normativo responde con la norma de auditores y el enlace oficial; si no hay fuente cargada responde "requiere verificación".
3. **"Resumen de accidentes del trimestre"** → Agente reportes calcula IF, IS e IA, compara con el trimestre anterior y redacta conclusiones.

## 4. Instrucciones base (prompt de sistema) del agente normativo

\`\`\`
Eres el agente normativo del área SST de {EMPRESA}, Perú.
Respondes SOLO con base en los documentos de la biblioteca oficial adjunta.
Cada respuesta incluye: norma, artículo si consta en el texto, enlace oficial y fecha de verificación.
Si la biblioteca no contiene la respuesta, dices "Requiere verificación en la fuente oficial" y propones dónde buscar.
Distingue: obligación legal, requisito sectorial, recomendación y buena práctica.
Nunca inventes artículos, plazos ni montos de multas.
\`\`\`

## 5. Opciones de implementación

| Nivel | Stack sugerido | Costo aprox. | Para quién |
|---|---|---|---|
| Básico (sin código) | Asistente con proyectos/carpetas + formularios + hoja de cálculo | Suscripción de 1–3 usuarios | Pymes, supervisores |
| Intermedio (low-code) | n8n o Make + modelo vía API + Google Sheets / Airtable | API por uso + servidor pequeño | Áreas SST de 2–10 personas |
| Avanzado (código) | Agents SDK / LangGraph + base vectorial + Cloudflare Workers o servidor propio | Desarrollo + infraestructura | Corporativos y consultoras |

## 6. Controles obligatorios del sistema

- Registro de cada ejecución (quién pidió, qué agente respondió, qué fuentes usó).
- Lista blanca de herramientas: los agentes no envían correos externos ni borran archivos sin aprobación.
- Revisión mensual de calidad con 20 respuestas al azar.
- Procedimiento aprobado por el Comité de SST y comunicado a los trabajadores.
`,
  },
  {
    id: 'herramientas-open-source-pago',
    title: 'Herramientas open source y de pago para gestionar SST',
    summary: 'Comparativa práctica de software libre y comercial para formularios, inspecciones, automatización, tableros e IA.',
    minutes: 16,
    level: 'Intermedio',
    tags: ['Herramientas', 'Open source', 'Comparativa'],
    body: `# Herramientas open source y de pago para gestionar SST

Elija por **proceso**, no por moda. Una buena pila para una pyme puede costar casi cero; un corporativo minero necesitará trazabilidad, permisos y soporte.

## 1. Mapa por proceso

| Proceso | Open source / gratuito | De pago | Cuándo pasar a pago |
|---|---|---|---|
| Formularios e inspecciones en campo | KoboToolbox, ODK Collect, LimeSurvey | SafetyCulture (iAuditor), Microsoft Forms + Power Apps | Muchos inspectores, firmas y fotos masivas |
| Automatización de flujos | n8n (autoalojado), Node-RED, Activepieces | Make, Zapier, Power Automate | Necesita SLA y conectores corporativos |
| Tableros e indicadores | Metabase, Apache Superset, Grafana, Looker Studio (gratuito) | Power BI Pro, Tableau | Seguridad por filas y gobierno de datos |
| Documentos y versiones | Nextcloud, Git + Markdown, LibreOffice | SharePoint, Google Workspace | Auditoría de accesos corporativa |
| Gestión de tareas / plan de acción | Kanboard, Taiga, Planka, Focalboard | Jira, Asana, Monday, Planner | Integración con RR. HH. y compras |
| Modelos de IA | Ollama + Llama / Mistral / Qwen (local), Open WebUI | Claude, ChatGPT, Gemini, Copilot | Calidad de razonamiento y contexto largo |
| Agentes y RAG | LangGraph, Flowise, Dify, LlamaIndex | Plataformas de agentes gestionadas, Claude Agent SDK, Azure AI Foundry | Volumen y requisitos de seguridad |
| Software EHS integral | — (no hay equivalente maduro) | Cority, Intelex, Enablon, Sphera, Isotools | Multisede, auditorías ISO 45001/14001 |

## 2. Pila recomendada por tamaño

**Microempresa (1–10 trabajadores)**: Google Sheets o Excel + KoboToolbox para inspecciones + un asistente de IA de suscripción individual. Costo: casi cero.

**Pequeña y mediana (11–200)**: n8n autoalojado o Make + Metabase + Nextcloud/SharePoint + asistente de IA por equipo. Tablero mensual automático.

**Grande / alto riesgo**: software EHS integral o desarrollo propio con base de datos, control de accesos, firmas, integración con planillas y agentes de IA con auditoría.

## 3. Criterios de selección (puntúe de 1 a 5)

| Criterio | Peso |
|---|---|
| Cumple registros obligatorios del SGSST y conservación por los plazos legales | 25 % |
| Protección de datos personales y de salud | 20 % |
| Funciona sin conexión en campo | 15 % |
| Facilidad de uso para supervisores y trabajadores | 15 % |
| Costo total a 3 años | 15 % |
| Soporte local / comunidad | 10 % |

## 4. Errores comunes

- Comprar software antes de ordenar los procesos y registros.
- Cargar datos médicos en herramientas sin contrato de tratamiento de datos.
- Tableros bonitos sin una fuente única de verdad (horas-hombre, planilla, accidentes).
- No definir quién mantiene la herramienta cuando el implementador se va.
`,
  },
  {
    id: 'seguimiento-continuo',
    title: 'Seguimiento constante: indicadores, alertas y tableros',
    summary: 'Cómo medir el SGSST todos los meses con indicadores reactivos y proactivos, umbrales, alertas y un tablero vivo.',
    minutes: 15,
    level: 'Intermedio',
    tags: ['Indicadores', 'Tablero', 'Mejora continua'],
    body: `# Seguimiento constante: indicadores, alertas y tableros

Lo que no se mide no se mejora, y lo que se mide una vez al año llega tarde. Este esquema convierte los registros obligatorios en un tablero mensual con alertas.

## 1. Indicadores reactivos (lo que ya pasó)

| Indicador | Fórmula | Frecuencia |
|---|---|---|
| Índice de frecuencia (IF) | N.° de accidentes incapacitantes × 1 000 000 / horas-hombre trabajadas | Mensual y acumulado |
| Índice de severidad (IS) | Días perdidos × 1 000 000 / horas-hombre trabajadas | Mensual y acumulado |
| Índice de accidentabilidad (IA) | IF × IS / 1000 | Mensual |
| Tasa de enfermedad ocupacional | Casos diagnosticados / trabajadores expuestos × 100 | Anual |

## 2. Indicadores proactivos (lo que previene)

| Indicador | Meta sugerida |
|---|---|
| % de cumplimiento del programa anual de SST | ≥ 90 % |
| % de inspecciones planificadas ejecutadas | ≥ 95 % |
| % de acciones correctivas cerradas en plazo | ≥ 85 % |
| Capacitaciones por trabajador al año | ≥ 4 (mínimo legal general) |
| % de puestos con IPERC actualizado | 100 % |
| % de trabajadores con EMO vigente | 100 % |
| Reportes de actos y condiciones subestándar por cada 100 trabajadores | En aumento |

## 3. Umbrales y alertas

- **Verde**: indicador en meta.
- **Ámbar**: desvío menor al 10 % o una acción vencida menos de 15 días.
- **Rojo**: desvío mayor al 10 %, acción crítica vencida o accidente incapacitante.

Automatice: cuando una acción del plan pasa su fecha sin evidencia, el sistema notifica al responsable y al Comité; a los 15 días escala a gerencia.

## 4. Ritmo de gestión

| Frecuencia | Reunión / producto | Participantes |
|---|---|---|
| Diaria | Charla de 5 minutos + ATS | Supervisores y cuadrillas |
| Semanal | Revisión de acciones abiertas | Responsable SST |
| Mensual | Reunión ordinaria del Comité + informe de indicadores | Comité SST |
| Trimestral | Revisión de objetivos y presupuesto | Gerencia |
| Anual | Revisión por la dirección e informe anual | Alta dirección |

## 5. Cómo usar el porcentaje de avance de esta plataforma

El panel premium agrupa los hitos en fases (base legal, IPERC, salud, SOMA, seguimiento e IA). Cada hito marcado como *hecho* suma; *en curso* suma la mitad. Use el porcentaje como indicador proactivo de implementación y repórtelo en la reunión mensual del Comité.
`,
  },
  {
    id: 'prompts-sst',
    title: 'Biblioteca de prompts listos para SST',
    summary: 'Instrucciones probadas para IPERC, ATS, investigación de accidentes, charlas, auditorías y SOMA.',
    minutes: 10,
    level: 'Inicial',
    tags: ['Prompts', 'Plantillas', 'Productividad'],
    body: `# Biblioteca de prompts listos para SST

Copie, reemplace lo que está entre llaves y revise siempre el resultado. Ningún prompt sustituye la validación en campo.

## IPERC de un puesto

\`\`\`
Actúa como especialista SST en Perú. Elabora una matriz IPERC para el puesto {PUESTO}
en una empresa del sector {SECTOR} con {N} trabajadores.
Tareas: {LISTA DE TAREAS}.
Para cada tarea indica: peligro, riesgo, consecuencia, probabilidad (1-4), severidad (1-4),
nivel de riesgo, controles existentes y controles propuestos siguiendo la jerarquía
(eliminación, sustitución, ingeniería, administrativos, EPP).
Entrega una tabla. Marca como "requiere validación en campo" todo lo que dependa de condiciones reales.
\`\`\`

## Análisis de Trabajo Seguro (ATS)

\`\`\`
Genera un ATS para la tarea "{TAREA}" con pasos secuenciales, peligros por paso,
controles y EPP. Incluye verificación previa, condiciones para detener el trabajo
y firmas requeridas. Lenguaje simple para cuadrillas de campo.
\`\`\`

## Investigación de accidente

\`\`\`
Con los hechos siguientes: {HECHOS}, arma la línea de tiempo, identifica causas inmediatas
(actos y condiciones), causas básicas (factores personales y de trabajo) y fallas del sistema
de gestión. Propón acciones correctivas con responsable sugerido y plazo.
No atribuyas culpa individual sin evidencia.
\`\`\`

## Charla de 5 minutos

\`\`\`
Redacta una charla de 5 minutos sobre {TEMA} para trabajadores de {ACTIVIDAD}.
Incluye: un caso real breve, 3 mensajes clave, 2 preguntas para el grupo y un compromiso final.
\`\`\`

## Preparación para inspección SUNAFIL

\`\`\`
Elabora una lista de verificación de documentos SST que una empresa de {N} trabajadores
del sector {SECTOR} debe tener disponibles ante una inspección. Agrupa en: documentos del
SGSST, registros obligatorios, comité o supervisor, capacitación, salud ocupacional y contratistas.
Indica para cada uno si es obligación legal o buena práctica y la norma base.
\`\`\`

## Residuos sólidos (SOMA)

\`\`\`
Clasifica estos residuos: {LISTA} en peligrosos y no peligrosos, sugiere color de contenedor,
almacenamiento temporal y tipo de operador autorizado requerido para su disposición.
\`\`\`
`,
  },
  {
    id: 'gobernanza-datos-ia',
    title: 'Gobernanza, datos personales y uso responsable de IA en SST',
    summary: 'Qué datos nunca subir, cómo redactar el procedimiento interno de uso de IA y cómo auditarlo.',
    minutes: 12,
    level: 'Intermedio',
    tags: ['Datos personales', 'Gobernanza', 'Procedimiento'],
    body: `# Gobernanza, datos personales y uso responsable de IA en SST

La información de SST incluye **datos de salud** (resultados de exámenes médicos, diagnósticos, descansos médicos), que la Ley N.° 29733 de Protección de Datos Personales trata como datos sensibles. Use IA sin exponerlos.

## 1. Clasificación de la información

| Nivel | Ejemplos | ¿Se puede usar con IA externa? |
|---|---|---|
| Público | Normas, guías oficiales, formatos referenciales | Sí |
| Interno | IPERC, PETS, planes, actas sin nombres | Sí, en cuentas corporativas con no-entrenamiento |
| Confidencial | Investigaciones de accidentes con nombres, contratos | Solo anonimizado o en entorno controlado |
| Sensible | EMO, diagnósticos, datos psicosociales individuales | No. Solo en sistemas del servicio médico |

## 2. Procedimiento interno de uso de IA (estructura mínima)

1. Objetivo y alcance.
2. Herramientas autorizadas y tipo de cuenta.
3. Información permitida y prohibida (tabla anterior).
4. Revisión humana obligatoria y responsables.
5. Registro de uso (fecha, usuario, propósito, resultado aprobado).
6. Capacitación a usuarios.
7. Gestión de incidentes (fuga de datos, respuesta errónea usada).
8. Revisión anual por el Comité de SST.

## 3. Anonimización práctica

- Reemplace nombres por códigos (T-001, T-002).
- Elimine DNI, teléfonos y direcciones.
- Agregue edades en rangos y no en cifras exactas cuando no sean necesarias.
- Use fotos sin rostros o difumine antes de subirlas.

## 4. Auditoría del sistema de IA

| Pregunta | Evidencia |
|---|---|
| ¿Existe procedimiento aprobado? | Documento firmado y acta del Comité |
| ¿Se capacitó a los usuarios? | Registro de capacitación |
| ¿Hay registro de uso? | Bitácora |
| ¿Se revisó la calidad? | Muestreo mensual documentado |
| ¿Se reportaron incidentes? | Registro de incidentes de información |
`,
  },
]
