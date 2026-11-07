# Visor Interactivo de Prevención

## Propósito y continuidad

El nuevo visor forma parte del Explorador. Reutiliza React y la navegación por hash de la aplicación. Convive con `#/visor` (SSOMA) y `#/simulador` (evaluación educativa IPERC): no reemplaza sus datos ni sus cálculos.

La inspección previa encontró un simulador 2D isométrico de oficina y almacén. La ampliación mantiene una solución vectorial ligera; no introduce WebGL ni un segundo framework de visualización tridimensional.

## Arquitectura

| Elemento | Responsabilidad |
|---|---|
| `src/data/prevention.ts` | Fichas de peligros, sectores, perfiles y relaciones al catálogo jurídico. |
| `src/data/preventionScenes.ts` | Escenarios y puntos: identificador, etiqueta, referencia `topicId` y coordenadas porcentuales. |
| `src/components/PreventionScene.tsx` | Ilustración vectorial del ambiente, puntos seleccionables y representación de controles. |
| `src/lib/prevention.ts` | Búsqueda y facetas; cálculos educativos independientes de la UI. |
| `src/components/PreventionPractice.tsx` y `src/lib/preventionPractice.ts` | Práctica actividad/tarea/peligro/evento/daño/control; normalización de borradores y exportación, sin cálculo de aceptabilidad. |
| `src/components/PreventionEquipment.tsx` y `src/data/preventionEquipment.ts` | Catálogo público de 10 familias EPP y 8 instrumentos con limitaciones y trazabilidad. |
| Vista del Explorador | Selección de escena, ficha, perfil, controles y animaciones; recursos y navegación al resto del portal. |
| `src/lib/docgen.ts` | Descarga Word compatible y Markdown; impresión a PDF desde el navegador. |

Las coordenadas se expresan sobre un lienzo lógico de 860 × 460 y escalan con el visor. Los puntos vinculan fichas únicas mediante `topicId`: una ficha puede aparecer en varios ambientes sin duplicar contenido normativo.

## Ambientes iniciales

| Ambiente | Ejemplos de puntos |
|---|---|
| Oficina | Puesto y postura, tablero eléctrico, ventilación y organización. |
| Almacén | Cruce peatón–montacargas, cargas, EPP y evacuación. |
| Planta industrial | Resguardos, ruido, aislamiento de energía y residuos. |
| Planta de alimentos | Separación de operaciones, limpieza química, corte y frío. |
| Salud | Exposición biológica, punzocortantes, movilización y piel. |
| Construcción | Bordes, EPP, sol y maquinaria. |
| Agricultura exterior | UV, piel, sustancias y tareas repetitivas. |
| Hogar | Gas, electricidad, limpieza y respuesta a incendios; prevención general. |

## Interacción

Al elegir un punto se abre la explicación en seis pasos: peligro, exposición, consecuencia posible, control, verificación y norma. Los controles se representan visualmente para comparar la organización del ambiente; activarlos no acredita que existan en el establecimiento ni modifica una evaluación IPERC real.

El selector de perfil cambia la orientación de lectura. Los sectores y familias son facetas del catálogo, no una decisión automática sobre la aplicabilidad legal de una obligación.

El enlace permanente y el QR remiten a la ficha informativa. El QR complementa información y no sustituye señalización de seguridad normalizada. La impresión usa el diálogo del navegador para guardar PDF; Word es `.doc` compatible con HTML, no un nuevo generador OOXML `.docx`.

## Diseño, movimiento y accesibilidad

Se toman como referencias conceptuales [Archify](https://github.com/tt-a1i/archify) y [diagram-design](https://github.com/cathrynlavery/diagram-design): explicación visual interactiva, secuencias conectadas y diagramas editoriales legibles. No se añaden como dependencias de ejecución, no se instala un servicio externo ni se afirma que su código haya sido incorporado.

Las escenas deben conservar texto equivalente mediante fichas y lista de puntos. El manejo debe funcionar con teclado; el estado seleccionado se expone a tecnologías de apoyo. Las animaciones son pausables y deben respetar `prefers-reduced-motion`. La verificación final contempla 360, 768, 1280 y 1600 px, lectura móvil, foco y ausencia de desbordamientos; este documento no declara que esa QA ya haya concluido.

Al ser SVG, la visualización no necesita soporte WebGL ni conexión a un motor externo. Se mantiene carga diferida de la vista para que el resto del portal conserve su funcionamiento y la portada no cargue todas las escenas al entrar.

## Extensión y límites

Para añadir un ambiente, cree su registro de escena con identificadores únicos, relacione cada punto con una ficha existente y añada su ilustración al componente. Para añadir un peligro, extienda el catálogo y sus pruebas de integridad; reutilice los identificadores jurídicos existentes o incorpore primero la norma al catálogo único con trazabilidad.

Las ilustraciones son esquemas didácticos originales, no planos certificados de instalaciones ni fotografías de exposición real. No simulan accidentes gráficos ni diagnostican salud. La ampliación inicial no constituye cobertura exhaustiva de industrias ni validación profesional de sus controles.
