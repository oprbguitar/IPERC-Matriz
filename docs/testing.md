# Verificación de la ampliación preventiva

Fecha: 7 de noviembre de 2026. Proyecto: `oprbguitar/IPERC-Matriz`; destino Cloudflare Workers `observatorio-sst`, dominio `sst.andesnova.solutions`.

## Pruebas y herramientas

- `npm run test:coverage`: 74 pruebas aprobadas en seis archivos. Comprende catálogo y API existentes, motor de riesgo, filtros nuevos, ruido, UV, integración de rutas y puntos, equipos y normalización/exportación de práctica.
- Se confirmó RED antes de implementar catálogo, ruta, práctica y equipos. Después se ejecutó GREEN y revisión de código.
- Cobertura V8: 100% de sentencias, ramas, funciones y líneas de `src/lib/prevention.ts` y `src/lib/preventionPractice.ts`; umbral 80% por archivo. Esto no representa cobertura de toda la interfaz ni de todos los módulos heredados.
- `npm run lint`: sin errores; permanecen tres avisos previos `react(only-export-components)` en AdaptedDownload, TemplatesView y PremiumView.
- `npm run build` y `npm run build:worker`: aprobados. El bundle diferido del explorador y la escena no forman un motor 3D. Permanece el aviso previo del exportador de aproximadamente 875 kB, cargado bajo demanda.
- `npm audit` y auditoría sin dependencias de desarrollo: cero vulnerabilidades reportadas al cierre. Vitest/cobertura se actualizaron a 5.1; correcciones compatibles de Vite y transitivas solo afectaron versiones de desarrollo. La auditoría es una comprobación de avisos conocidos, no garantía de ausencia de defectos.
- `node ~/AI-Design-Harness/bin/design-lint.mjs .`: aprobado, 7/20; coincidencias heredadas de radios y tarjetas conservadas por continuidad del portal. La dirección se registró en el harness.
- `npx wrangler deploy --dry-run --outdir output/worker-dry-run`: configuración y bundle aceptados, misma base D1; sin migraciones ni modificación de credenciales.

## Navegador reproducible

La verificación usa Chromium mediante Playwright CLI sobre el bundle de producción servido localmente por Wrangler. No se introdujo Playwright como dependencia de la aplicación.

```powershell
npm run build
npx wrangler dev --ip 127.0.0.1 --port 8787
# En otra terminal:
npx --package @playwright/cli playwright-cli open http://127.0.0.1:8787
npx --package @playwright/cli playwright-cli run-code --filename scripts/verify-prevention.browser.js
npx --package @playwright/cli playwright-cli run-code --filename scripts/verify-routes.browser.js
```

El primer recorrido comprueba búsqueda y ausencia de resultados, todos los sectores, perfil, prevención doméstica, búsqueda global repetida, regreso desde normativa, pausa sin perder legibilidad, ocho escenas y 32 puntos, comparación de controles, equipos/instrumentos, ruido y UV, persistencia y descarga de práctica, Word, SVG QR, PDF y movimiento reducido. Verifica las cinco superficies a 360/768/1280/1600px, tanto ancho del documento como límites de los controles.

El segundo recorrido comprueba las 21 rutas, contando el explorador, con sus accesos públicos o bloqueo premium correspondiente; navegación desde la portada y sus cuatro anchos. Los archivos exportados y capturas de QA se guardan en `output/`, excluido de Git.

Resultado: ambos recorridos completados sobre el build de producción local. Las 21 rutas renderizaron su título principal visible y no se observaron errores JavaScript. El simulador anterior incluye un segundo título reservado al informe de impresión, correctamente excluido del recuento visual. Las cinco superficies nuevas y la portada se comprobaron a los cuatro anchos; los archivos Word, Markdown, SVG QR y PDF fueron generados y abiertos o comprobados durante el recorrido.

Hallazgos corregidos durante QA: foco de búsqueda reutilizado, efectos de historial dentro de un actualizador React, sincronización del permalink, entradas semitransparentes al pausar, coherencia entre ambiente y ficha y representación de ergonomía sin casco en oficina. La versión con controles ajusta silla, pantalla y postura.

Limitaciones: pruebas de navegador automatizadas y revisión visual en escritorio/móvil; no se ha realizado auditoría exhaustiva con lectores de pantalla ni mediciones de campo. La precarga de la imagen de portada produce un aviso del navegador cuando se entra directamente a otras rutas.

## Publicación

Publicación completada y verificada el 7 de noviembre de 2026:

- Código: commit `c811ec84837d259dcfe9d66ce5e3996c23854802` en `main` de [oprbguitar/IPERC-Matriz](https://github.com/oprbguitar/IPERC-Matriz).
- Producción: [Explorador de Riesgos y Controles](https://sst.andesnova.solutions/#/explorador), Worker `observatorio-sst`, versión `08f77de8-c687-49d2-a904-8b7185f8621b`.
- Ambos recorridos de navegador repetidos satisfactoriamente sobre el dominio de producción: explorador completo y 21 rutas. Sin errores JavaScript; API pública de sesión respondió HTTP 200 y `user: null` para la consulta sin cuenta.
- GitHub Pages conserva su publicación secundaria; se comprobó también la compilación con base `/IPERC-Matriz/` y la resolución de las dos fuentes locales en esa base. Su workflow ejecuta pruebas antes de publicar.
- No hubo migraciones de esquema, cambios de acceso ni modificación de credenciales. La versión Cloudflare anterior es `62dcf6d7-f94c-448c-9613-e0c231abb581`, disponible como referencia de reversión del código.
