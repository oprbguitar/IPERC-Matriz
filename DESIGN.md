# Observatorio Prevenir Perú · Explorador preventivo

## Intención
Modo **explore**: consulta pública por sector, peligro y perfil, con resultado técnico junto a un ambiente ilustrado. Se conserva cabecera, portada y orden de las secciones existentes. Entrada compacta en portada y ruta pública `#/explorador` con carga diferida.

Selector Pierre: buscador con facetas, Archivo/Public Sans/JetBrains Mono, Carbon + lima, geometría de 2px, movimiento mínimo. Desviación funcional: conservar azul y teal de la marca existente, como exige la propuesta; movimiento continuo y escalonado solo para explicar selección y controles, por pedido expreso de una página animada. Comparadas tres estructuras: mosaico de categorías, documento con índice y buscador con facetas/lienzo; elegida la última por acceso directo.

## Tokens antes de componer
Prefijo `--pr-` para aislar estilos. Tinta #17233c; secundaria #47566f; superficie #fff; fondo #f2f7fd; línea #cfdaeb; azul #1857bd; teal #087f75; ámbar #925200; texto de acento blanco. Archivo para títulos, Public Sans para cuerpo con Arial de respaldo; fuente local woff2, sin peticiones externas. Escala 12/13/15/16/20/24 y títulos fluidos 28–42px. Espaciado 4/8/12/16/24/32/48/64px. Geometría 2px; numeración circular funcional. Duración 180/260ms, ease cubic-bezier(.2,.8,.2,1).

## Composición
Buscador y facetas en banda; lista maestra de fichas y detalle editorial. Visor SVG isométrico con inspector, ambientes y puntos numerados equivalentes a controles HTML por teclado. Mapa peligro → exposición → consecuencia → control → verificación → norma. Herramientas educativas separadas de datos observados. Paneles abiertos y separadores, sin tarjetas anidadas. Iconos Lucide para acciones; ilustraciones vectoriales originales para ambientes.

## Accesibilidad y rendimiento
360/768/1280/1600px: lista y detalle apilados en móvil; visor ajustado sin scroll horizontal. Controles táctiles de 44px, foco visible, estado con texto y aria-pressed. Animaciones pausables y prefers-reduced-motion. Sin WebGL ni framework 3D; visor aislado con límite de error. Identidad y 17 dominios previos preservados. Enlaces a normas usan el catálogo único; ninguna simulación acredita cumplimiento.

## Referencias
[Archify](https://github.com/tt-a1i/archify): relaciones seleccionables y explicación junto al diagrama. [Diagram Design](https://github.com/cathrynlavery/diagram-design): jerarquía editorial y SVG ligero. Referencia conceptual, sin instalar dependencias ni copiar bibliotecas.
