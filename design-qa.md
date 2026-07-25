# Design QA — Ruta SST Perú

Resultado final: **aprobado**.

Referencia aprobada: maqueta `dashboard_de_seguridad_y_salud_laboral.png` (portada) e ilustración del héroe entregada como archivo aparte.

## Cómo se reprodujo la maqueta

La maqueta se reconstruyó con componentes React, HTML semántico y CSS reales. **La captura de la maqueta no se usa como fondo ni como imagen de la interfaz.** Lo único que se toma de las imágenes entregadas es la ilustración de los dos profesionales, servida como recurso independiente:

- `public/assets/hero-sst-workers.webp` — 1100 × 733, ~168 KB, con canal alfa.
- `public/assets/hero-sst-workers.png` — alternativa para navegadores sin WebP, ~142 KB.

Se sirve con `<picture>`, `width`/`height` declarados (sin salto de diseño), `object-fit: contain`, `fetchpriority="high"`, precarga en `index.html` y texto alternativo descriptivo. En pantallas de menos de 1080 px se reduce y pasa encima del texto; nunca se elimina.

## Comparación con la referencia

| Elemento | Estado |
| --- | --- |
| Fondo claro y profesional, tarjetas blancas | Coincide |
| Acentos azul, turquesa, verde, ámbar y morado contenido | Coincide |
| Sombras suaves, esquinas redondeadas, iconos claros, aire | Coincide |
| Barra de navegación superior con seis entradas | Coincide |
| Héroe conciso con dos acciones y leyenda de público | Coincide |
| Seis tarjetas de ruta práctica | Coincide |
| Ruta recomendada con indicador de progreso | Coincide |
| Descargas rápidas (Excel, Word, PDF) | Coincide |
| Normativa peruana destacada con «Ver más» | Coincide |
| Franja de cobertura | Coincide |

## Elementos retirados y no reintroducidos

Campana de notificaciones, insignias de notificación, «Hola, Usuario», «Hola, Ingeniero», perfiles ficticios, «Ing. Alex Rivera», nombres de empresa ficticios en la cabecera, controles deshabilitados o decorativos, mensajes técnicos como «Supabase conectado» en la interfaz pública y botones «Próximamente» sin comportamiento útil.

Cada tarjeta, paso y botón visible ejecuta una acción real.

## Portada sin desplazamiento en escritorio

Medido sobre la compilación de producción con Chromium:

| Resolución | Alto del documento | Desplazamiento vertical | Desplazamiento horizontal |
| --- | --- | --- | --- |
| 1366 × 768 | 768 px | No | No |
| 1440 × 900 | 900 px | No | No |
| 1920 × 1080 | 1080 px | No | No |
| 390 × 844 (móvil) | — | Sí (permitido) | No |

El ajuste se logró con `clamp()`, tarjetas compactas y detalle bajo demanda en paneles laterales, no reduciendo el texto: el cuerpo se mantiene en 15 px y los textos explicativos entre 13,5 y 15 px.

## Accesibilidad

- Navegación por teclado en tarjetas, pasos, filtros y panel lateral; el panel se cierra con `Escape` y atrapa el foco mientras está abierto.
- `aria-current` en la entrada activa, `aria-expanded`/`aria-controls` en «¿Qué regula?», `role="progressbar"` con valores en la barra de avance y `aria-label` descriptivo en cada enlace normativo.
- Contraste alto sobre fondo claro; el azul de los enlaces normativos no se usa como decoración en el mismo contexto.
- `prefers-reduced-motion` desactiva las animaciones.

## Verificación funcional

Comprobado sobre la compilación de producción: descarga de plantillas locales, diagnóstico con resultados y progreso reflejado en la portada, búsqueda y filtros de normativa, filtros de plantillas, generación de la matriz IPERC (16 filas del caso base), exportación a Excel, Word y CSV, guardado de proyecto y regreso al sitio público. Sin errores de consola.
