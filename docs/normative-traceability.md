# Trazabilidad normativa del Explorador

Fecha: 7 de noviembre de 2026. La fuente jurídica continúa en `src/data/legalDatabase.ts`, con sus extensiones existentes. `src/data/prevention.ts` contiene relaciones mediante `normIds`, nunca copias de documentos jurídicos completos.

## Regla de interpretación

Las fichas educativas muestran exposición, controles y evidencias que deben adaptarse al lugar de trabajo. Presencia de peligro no equivale a exposición medida; referencia legal no equivale a obligación aplicable a todos los sectores. En el hogar se ofrece prevención general y no se trasladan automáticamente obligaciones empresariales.

`sourceStatus` y `limits` expresan restricciones o validaciones pendientes; `sourceUrls` aporta recursos oficiales complementarios. Las fechas y el estado jurídico de una norma se consultan en su registro del catálogo. No se presenta la fecha de esta edición como una verificación integral de vigencia de todas las normas.

## Relaciones reutilizadas

| Fichas | Identificadores del catálogo existente | Límite principal |
|---|---|---|
| Electricidad | `law-29783`, `ds-005-2012-tr`, `rm-111-2013-mem-dm` | La norma eléctrica tiene ámbito específico; no autoriza trabajo energizado. |
| EPP y maquinaria | `law-29783`, `ds-005-2012-tr` | Selección según tarea, marcado, compatibilidad y riesgo residual. No certifica productos. |
| Ruido y confort | `rm-375-2008-tr`, marco SST | Distinguir criterio industrial de exigencias de atención intelectual; no inferir estrés térmico con temperatura y humedad aisladas. |
| Ergonomía | `rm-375-2008-tr`, `law-32721` | Revisión del puesto real y requisitos concretos; no un peso universal seguro. |
| Radiación solar | `law-30102`, `ds-003-2026-sa`, `rm-546-2026-minsa` | Diferenciar UV solar, UV artificial y radiación ionizante. |
| Piel | `law-29783`, `rm-312-2011-minsa` | Orientación preventiva, sin diagnóstico ni prescripción. |
| Salud integral y psicosocial | `rm-375-2008-tr`, `law-30947`, `rm-546-2026-minsa` | Documento de promoción de salud no equivale a tipificación automática de infracciones. |
| Químicos y gases | `law-29783`, `ds-005-2012-tr`, `ds-015-2005-sa` | Agente, vía de exposición, método y equipo específicos; un detector no cubre todos los gases. |
| Residuos | `dl-1278`, `ds-014-2017-minam`, `law-28611` | Regímenes municipales, no municipales, peligrosos y sanitarios diferenciados. |
| Agentes biológicos | `law-29783`, `rm-312-2011-minsa`, `rm-826-2024-minsa` | La norma sanitaria sectorial no se atribuye automáticamente a otras industrias. |
| Alturas | `law-29783`, `ds-011-2019-tr`, `rne-g050` | Normas de construcción no equivalen a reglas universales para todos los sectores. |
| Incendios | Marco SST existente | Selección de extintores y diseño de protección requieren normas y evaluación aplicables a la instalación. |
| Alimentos | Marco SST existente para riesgos del trabajador | Normativa sanitaria específica pendiente de integración; no declara certificación de inocuidad. |

## Fuentes y alcance de comprobación

| Fuente oficial | Qué sustenta | Estado en esta intervención |
|---|---|---|
| [R.M. 375-2008-TR — MTPE](https://www.gob.pe/institucion/mtpe/normas-legales/394457-375-2008-tr) | Norma básica de ergonomía y procedimiento de evaluación disergonómica. | Ficha oficial localizada; registro existente reutilizado. |
| [D.S. 003-2026-SA — ficha oficial MINAM](https://www.gob.pe/institucion/minam/normas-legales/8039697-0003-2026-sa) | Reglamento de la Ley 30102 sobre exposición prolongada a radiación solar. | Enlace oficial identificado; el acceso web automático a esta página no permitió reabrir el contenido completo. Se conserva la referencia del catálogo y no se declara cotejo integral nuevo. |
| [R.M. 546-2026-MINSA — MINSA](https://www.gob.pe/institucion/minsa/normas-legales/8223697-546-2026-minsa) | Documento técnico de promoción de la salud en los lugares de trabajo. | Registro preexistente como recomendación. La página devolvió restricción al lector web; no se declara revisión íntegra nueva. |
| [Índice UV — OMS](https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index) | Interpretación preventiva del índice UV; desde 3 se requieren medidas de protección. | Consulta directa de orientación oficial. No aporta pronóstico ni medición del usuario. |
| [Protección de trabajadores frente a UV — OMS](https://cdn.who.int/media/docs/default-source/radiation/protecting-workers-from-ultraviolet-radiation.pdf) | Categorías UV y controles de exposición ocupacional. | Referencia técnica internacional; no legislación peruana. |
| [Head Protection — OSHA, SHIB 3-6-2024](https://www.osha.gov/sites/default/files/publications/SAFETY_HELMET_SHIB.pdf) | Tipos de impacto I/II, clases eléctricas G/E/C y criterios de inspección y selección. | PDF consultado directamente; boletín orientativo estadounidense, sin traslado automático de exigibilidad a Perú. |
| [NTP 399.018:2022 — INACAL](https://servicios.inacal.gob.pe/cidalerta/biblioteca-detalle.aspx?id=34740) | Identidad, edición 2 y alcance de cascos industriales. | Ficha consultada directamente; indica «Obligatoria: NO». No se redistribuye el texto protegido ni se afirma equivalencia automática con ANSI. |
| [Normativa de alimentos — DIGESA](https://www.digesa.minsa.gob.pe/DCOVI/alimentos.asp) | Punto oficial de consulta para ampliar el marco sanitario por actividad. | Referencia para revisión pendiente; no acredita todas las normas citadas en la propuesta. |

La condición no obligatoria por sí misma de una NTP no elimina el deber de proporcionar protección adecuada ni su posible exigibilidad por remisión normativa o contractual. Los valores de ensayo eléctricos de cascos no autorizan trabajar a esas tensiones.

## Simulaciones: fórmula, unidades y condiciones

### Ruido

`noiseReferenceHours(L) = 8 × 2^((85 − L)/3)`

- `L`: nivel constante en dB(A); resultado en horas.
- Puntos de referencia: 85 → 8 h; 88 → 4 h; 91 → 2 h; 94 → 1 h.
- Intercambio de 3 dB; el cálculo entre puntos es un modelo educativo, no una transcripción de todos los límites jurídicos.
- La función solo admite valores finitos entre 80 y 100 dB(A). Rechaza otros valores con `null`; ese dominio técnico no significa que los extremos representen una jornada legal admisible.
- No calcula dosis acumulada con niveles variables, ruido impulsivo, incertidumbre de medición ni atenuación efectiva del protector. No declara un ambiente seguro.
- Deben distinguirse oficinas y tareas intelectuales del criterio industrial; la R.M. 375-2008-TR no debe reducirse a un único umbral de 85 dB(A).

### Índice UV

`uvBand(UVI)` clasifica un valor finito no negativo en bajo (<3), moderado (3 a <6), alto (6 a <8), muy alto (8 a <11) y extremo (≥11). Para valores enteros, las bandas son 0–2, 3–5, 6–7, 8–10 y 11+.

El índice lo elige el usuario. La herramienta no consulta un sensor ni pronóstico local; no calcula dosis personal, tiempo seguro, cáncer ni diagnóstico. La recomendación preventiva combina organización de la exposición, sombra y barreras; la fotoprotección es complementaria.

## Metrología y equipos

El listado de instrumentos es orientativo. Un certificado de calibración caracteriza la relación metrológica del equipo; no es certificado de producto ni acreditación del laboratorio. Deben comprobarse identificación, método, incertidumbre y alcance cuando correspondan. La acreditación requiere verificar laboratorio y alcance específico; no se infiere por un logotipo. No se impone una periodicidad de calibración universal.

Se mantiene como pendiente la incorporación detallada de ediciones IEC/ISO/EN/ANSI, laboratorios y certificados. Las recomendaciones internacionales no se presentan como obligaciones automáticas en Perú.
