# Arquitectura y continuidad entre agentes

Documento vivo. Actualícelo al cerrar cada intervención para evitar auditorías completas repetidas.

## Capas

```
src/catalog/        Catálogo jurídico sin dependencias de UI (normas → artículos → obligaciones →
                    formatos → infracciones → casos). Lo usan la app, el Worker y otros repos.
src/data/           Catálogo de normas (legalDatabase + legalExtensions), enlaces scrapeados
                    (normSources.json), guías, línea de tiempo, ISO.
src/lib/            Motores: riesgo IPERC, contingencia/multas, plantillas, documentos, API cliente.
src/views/          Vistas por espacio (Explorar, Diagnosticar, Implementar, Verificar, Aprender).
src/tools/          Espacio de trabajo IPERC (matriz, analítica, plan de acción, evidencias, reportes).
worker/             Cloudflare Worker: /api (auth, premium, progreso, cumplimiento) y /api/v1 público.
migrations/         Esquema D1.
scripts/            scrape-norms, import-iso, create-user.
tests/              Vitest.
```

## API pública de solo lectura

`https://sst.andesnova.solutions/api/v1/` — CORS abierto, caché 1 h, sin cookies.

| Recurso | Ejemplo |
|---|---|
| Índice | `GET /api/v1` |
| Normas | `GET /api/v1/normas`, `GET /api/v1/normas/ds-005-2012-tr` |
| Artículos verificados | `GET /api/v1/articulos` |
| Obligaciones (con perfil) | `GET /api/v1/obligaciones?trabajadores=35&tipo=publico&sector=offices&contratistas=true` |
| Formatos | `GET /api/v1/formatos?tema=registros` |
| Infracciones RLGIT | `GET /api/v1/infracciones?tema=iperc` |
| Jurisprudencia | `GET /api/v1/jurisprudencia?tema=accidentes` |
| Sectores | `GET /api/v1/sectores` |
| Actualizaciones | `GET /api/v1/actualizaciones` |

## Decisiones

| Fecha | Decisión | Motivo |
|---|---|---|
| 2026-11-03 | Residual verificado exige responsable + evidencia | Un control sugerido no reduce el riesgo real |
| 2026-11-03 | "Artículo verificado" solo tras cotejar el PDF oficial | Un enlace activo no prueba vigencia ni interpretación |
| 2026-11-03 | Casos sin texto cotejado se publican marcados, sin enlace inventado | No fabricar precedentes |
| 2026-11-03 | Cumplimiento % = obligaciones acreditadas con evidencia | No premiar documentos sin acreditar |
| 2026-11-03 | Formatos propios rotulados "no oficial" | No presentar plantillas propias como oficiales |
| 2026-11-03 | API pública separada de datos de usuario | Interoperabilidad sin exponer datos privados |

## Estado al cierre (2026-11-03)

- Pruebas: 22/22 (`npm test`).
- Normas: 40 con enlaces activos y huella de contenido; ningún cambio pendiente de validación.
- Artículos cotejados: 19. Obligaciones: 25. Infracciones SST: 33. Casos: 15 (6 con ficha oficial). Formatos: 24. Plantillas avanzadas: 25 (7 compuestas + 18 derivadas de formatos).
- Pendientes: ver `docs/EVALUACION-2026-11.md`.

## Ampliación preventiva (2026-11-07)

La inspección de la aplicación identificó rutas públicas por hash en `App.tsx`, navegación declarada en `platformContent.ts`, buscador transversal en `GlobalSearch.tsx`, vistas diferidas con React `lazy`, catálogo normativo en `legalDatabase.ts` y sus extensiones, visor SSOMA y simulador 2D isométrico ya existentes. Los estilos se distribuyen entre `App.css` y hojas por módulo. El despliegue configurado es Cloudflare Workers con assets Vite y D1, en `sst.andesnova.solutions`; el remoto del proyecto es `oprbguitar/IPERC-Matriz`.

El Explorador amplía esas capas sin reconstruir el portal. `prevention.ts` añade 16 fichas, 16 sectores, 9 familias y 5 perfiles; `preventionScenes.ts` define ocho ambientes y relaciona puntos con fichas únicas. `lib/prevention.ts` encapsula búsqueda y cálculos educativos. Las fichas resuelven normas mediante los identificadores del catálogo existente, sin duplicar texto legal ni crear una API paralela.

Se conserva el simulador previo y su método IPERC. El nuevo visor SVG explica peligros y controles; su estado visual no es evidencia de implementación ni recalcula riesgo acreditado. La portada ofrece una entrada compacta, la navegación conserva sus espacios, y las nuevas fichas se conectan a búsqueda, normativa, documentos y seguimiento existentes. No se eliminan los 17 dominios ni las 67 referencias declaradas en la versión previa por introducir estas nuevas taxonomías.

No se añaden dependencias 3D, servicios de pago, migraciones ni cambios de credenciales. `docgen.ts` mantiene la generación de Word compatible `.doc`, Markdown e impresión a PDF. Las recomendaciones de equipo no son un catálogo certificado ni acreditación metrológica. El estado de implementación y los pendientes están en [implementation-status.md](implementation-status.md); las fuentes en [normative-traceability.md](normative-traceability.md) y las decisiones del visor en [visual-risk-viewer.md](visual-risk-viewer.md).
