# Evaluación y ampliación — noviembre de 2026

Respuesta a la evaluación externa «Evaluación y ampliación del Observatorio Prevenir Perú» (3 de noviembre de 2026).
Se priorizó corrección jurídica y seguridad antes que funciones visuales.

## Matriz de brechas

| Componente | Existente (antes) | Deficiente / faltante | Acción aplicada | Archivos | Prueba de aceptación |
|---|---|---|---|---|---|
| Riesgo residual IPERC | El residual se calculaba con controles sugeridos y se presentaba como logrado; filas nacían "en ejecución" | Controles propuestos tratados como ejecutados | Se separan **inicial**, **residual proyectado** y **residual verificado**. El riesgo vigente solo baja con estado "verificado" + responsable + evidencia; sin evidencia se degrada a "ejecutado, por verificar". Tablero con columna nueva y formulario de verificación | `src/lib/riskEngine.ts`, `src/types.ts`, `src/tools/ToolsWorkspace.tsx`, `src/lib/exporters.ts` | `tests/riskEngine.test.ts` |
| Base normativa | `legalArticles` vacío | Sin artículos ni obligaciones | 19 artículos cotejados con el PDF oficial (D.S. 005-2012-TR; art. 48 RLGIT), con extracto literal, explicación, fecha y modificatorias a revisar. `legalArticles` alimenta el motor IPERC (arts. 77 y 82) | `src/catalog/articles.ts`, `src/data/legalDatabase.ts` | `catalog.test.ts` (integridad) |
| Vigencia normativa | El workflow solo verificaba que el enlace respondiera | Enlace activo ≠ vigencia | Huella del contenido jurídico relevante (título, fecha, PDF, El Peruano); cambio ⇒ `legalReview: pendiente`, visible en la ficha. La UI dice "enlace activo (no acredita vigencia)" | `scripts/scrape-norms.mjs`, `src/components/NormLinks.tsx` | Ejecución del scraper (40/40) |
| Tipificación | Calculadora por gravedad genérica | Sin numeral ni reglas especiales | Catálogo de infracciones SST (arts. 26-28 RLGIT, texto consolidado) y **ficha de contingencia**: 48.1-C (total de trabajadores solo para 28.10 con muerte/incapacidad permanente y 28.11), 27.15 por trabajador, REMYPE, tope 1 %, grado de certeza | `src/catalog/infractions.ts`, `src/catalog/contingency.ts`, `src/components/ContingencyCalculator.tsx` | `catalog.test.ts` (contingencia) |
| Aplicabilidad | Categorías sectoriales sin reglas; D.S. 011-2019-TR fuera del sector construcción | Resultados incompletos | 25 obligaciones con reglas (público/privado, trabajadores, sector, alto riesgo, contratistas, teletrabajo, REMYPE), fundamento, evidencia, formato e infracción. D.S. 011-2019-TR y RESESATE enlazados a su sector | `src/catalog/obligations.ts`, `src/data/legalDatabase.ts` | `catalog.test.ts` (aplicabilidad) |
| Cumplimiento | Porcentaje por hitos premium | Sin cumplimiento por obligación | % = obligaciones **acreditadas con evidencia** / aplicables; críticas abiertas aparte; sincronización en D1 con sesión | `src/views/ComplianceView.tsx`, `src/lib/complianceStore.ts`, `migrations/0002_compliance.sql` | `catalog.test.ts` (cumplimiento) |
| Formatos | 2 archivos propios y enlaces generales | Sin origen ni exigibilidad | Biblioteca con origen (oficial/propio), naturaleza, versión, base legal, conservación; formularios en línea con exportación Word/Excel/PDF; **plantillas avanzadas** con control documental y firmas | `src/catalog/formats.ts`, `src/views/FormatsView.tsx`, `src/lib/templateBuilder.ts`, `src/views/LibraryView.tsx` | `catalog.test.ts` (formatos, plantillas) |
| Fiscalización | — | Sin expediente ni casuística | Centro de fiscalización: contingencia, expediente (hechos, cronología, observaciones clasificadas, plan correctivo, lista de control) y casuística con carácter vinculante y estado de verificación | `src/views/InspectionView.tsx`, `src/catalog/cases.ts` | `catalog.test.ts` (casuística) |
| Interoperabilidad | Datos dentro de componentes React | Sin API | Catálogo sin dependencias de UI y **API pública `/api/v1`** de solo lectura con CORS | `src/catalog/`, `worker/catalogApi.ts` | `catalog.test.ts` (API) |
| Experiencia | 8 pestañas planas | Menús densos | Cinco espacios (Explorar, Diagnosticar, Implementar, Verificar, Aprender) con subnavegación y búsqueda transversal (Ctrl + K) | `src/components/SiteHeader.tsx`, `src/components/GlobalSearch.tsx` | Revisión en navegador |
| Calidad | Sin pruebas | — | Vitest (22 pruebas) en CI y antes del despliegue | `tests/`, `.github/workflows/ci.yml` | `npm test` |

## Lo que queda pendiente (no se inventó)

- **Ley 29783 artículo por artículo**: el PDF oficial disponible es una imagen escaneada; sus artículos se citan por el reglamento hasta contar con texto verificable.
- **Casos "reportados"** (Sala Plena 003-2024, 005-2023, 005/006/007/008-2025; 557-2024; 0187-2026; Casación 17464-2023): figuran con estado "texto no cotejado" y sin enlace propio hasta leer el documento íntegro.
- **Campos mínimos de la R.M. 050-2013-TR**: los anexos oficiales son imágenes; los formularios propios lo advierten.
- **Teletrabajo (Ley 31572 y reglamentos 2023/2026), Ley 30947, D.S. 007-2020-SA, D.S. 016-2024-JUS**: obligación de teletrabajo creada sin artículo hasta verificar el texto.
- **Persistencia unificada** de proyectos IPERC: ver propuesta abajo.

## Propuesta de persistencia (sin pérdida de datos)

1. **Hoy**: proyectos IPERC en `localStorage` o Supabase opcional; avance premium y cumplimiento en D1.
2. **Paso 1**: tabla D1 `organizations` y `memberships (user_id, org_id, role)`; el cumplimiento pasa de `user_id` a `org_id`.
3. **Paso 2**: endpoint `POST /api/projects/import` que recibe los proyectos de `localStorage` (botón "Subir mis proyectos") y los de Supabase (exportación JSON), conservando `id` y fecha.
4. **Paso 3**: evidencias en R2 con ruta `org/<id>/evidencias/…`, URL firmadas y bitácora de accesos.
5. **Datos médicos**: nunca en las tablas de la organización; solo aptitudes e indicadores colectivos. Datos individuales solo en sistemas del servicio médico (Ley 29733, D.S. 016-2024-JUS).
6. **Respaldos**: exportación diaria de D1 (Time Travel) y copia mensual a R2.
