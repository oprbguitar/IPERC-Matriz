# Ruta SST Perú

**Seguridad, Salud, Medio Ambiente y Gestión Preventiva.**

Plataforma informativa y práctica de prevención ocupacional para el Perú. Está pensada para empleadores, trabajadores, comités y supervisores de SST, Recursos Humanos, sector público y privado, consultores y estudiantes de cualquier disciplina: no solo para especialistas.

Publicada en <https://oprbguitar.github.io/IPERC-Matriz/>.

> Herramienta informativa y preventiva. Verifique siempre la versión vigente de cada norma en su fuente oficial. Este sitio no es un portal del Estado peruano ni cuenta con respaldo institucional.

## Qué cubre

SST, SOMA, IPERC, salud ocupacional, ergonomía, riesgos psicosociales, inspecciones, emergencias, accidentes e incidentes, aspectos e impactos ambientales, residuos y derrames, obligaciones legales, plazos y registros, y plantillas descargables.

## Estructura de la aplicación

La navegación principal tiene seis entradas, todas funcionales:

| Entrada | Qué hace |
| --- | --- |
| **Inicio** | Portada compacta: héroe, seis tarjetas de ruta, ruta recomendada con progreso, descargas rápidas, normativa destacada y franja de cobertura. |
| **Mi Ruta** | Diagnóstico guiado de diez preguntas en lenguaje llano. Devuelve estado (*Cumple / Pendiente / No aplica / Requiere verificación*), acción requerida, responsable, evidencia esperada, plantilla y sustento normativo. |
| **Obligaciones** | Filtra por tamaño, sector y rol. Incluye la pestaña **SOMA y ambiente** con prácticas ambientales y su advertencia de aplicabilidad sectorial. |
| **Plantillas** | Biblioteca por categoría: los archivos propios se descargan desde la aplicación; el resto enlaza a los formatos oficiales publicados por el Estado. |
| **Herramientas** | Espacio de trabajo avanzado: generador IPERC, matriz editable, análisis, plan de acción, evidencias, normativa aplicable, reportes y proyectos guardados. |
| **Normativa** | Catálogo legal con búsqueda, filtros por categoría, sector y estado, orden por relevancia o fecha, resumen en lenguaje llano y enlace a la fuente oficial. |

La portada está dimensionada para entrar sin desplazamiento vertical en 1366×768, 1440×900 y 1920×1080. En tablet y móvil el desplazamiento es normal y está permitido.

## Regla legal

El contenido legal es un catálogo verificado, no una lista de marcadores de posición.

- `src/data/legalDatabase.ts` es la **fuente única de verdad**: ningún componente escribe una URL legal por su cuenta.
- Cada norma declara `effectiveStatus` (vigente, modificada, derogada o `verification-required`), `sourceStatus`, la autoridad emisora, la fecha de última verificación y un resumen en lenguaje llano.
- Solo se usan dominios oficiales: `gob.pe`, `leyes.congreso.gob.pe`, `busquedas.elperuano.pe`, `spijweb.minjus.gob.pe` y `sinia.minam.gob.pe`.
- **No se cita ningún número de artículo que no aparezca de forma expresa en la fuente oficial consultada.** `legalArticles` se mantiene vacío de forma deliberada para que el motor de riesgos nunca cite un artículo sin respaldo documental.
- Cada afirmación se etiqueta como obligación legal, recomendación, buena práctica, requisito sectorial o pendiente de verificación. Una recomendación nunca se presenta como obligación.
- Cuando la vigencia, el alcance o el plazo no están confirmados, la interfaz muestra «Requiere verificación en la fuente oficial» en lugar de inventar un dato.

El componente `<LegalReference />` (`src/components/LegalReference.tsx`) rinde cualquier mención normativa como enlace azul con subrayado punteado, icono de enlace externo, `rel="noopener noreferrer"`, `aria-label` descriptivo y apertura en pestaña nueva.

### Obligaciones ambientales

Las obligaciones ambientales varían según sector, actividad, permisos, ubicación y autoridad competente (MINAM, OEFA, DIGESA, ANA, OSINERGMIN o el ministerio del sector). El módulo SOMA separa las buenas prácticas generales de los requisitos sectoriales y no presenta ninguno como universalmente obligatorio.

## Motor IPERC y exportaciones

Se conserva íntegra la lógica previa: taxonomía de peligros, coincidencia por sector, evaluación `probabilidad × severidad × exposición`, bandas Bajo/Moderado/Importante/Intolerable, jerarquía de controles, riesgo residual, plan de acción, evidencias y validación previa a la exportación.

`src/lib/exporters.ts` genera el libro `.xlsx` con `xlsx-js-style` (hojas Resumen, Matriz IPERC, Plan de Acción, Evidencias, Normativa y Catálogos), además de Word, CSV y PDF por impresión. El nombre del archivo sigue el formato `IPERC_[RUC|Empresa]_[Sector]_[YYYY-MM-DD].xlsx`.

> Nota: el escritor de la versión community de SheetJS no escribe paneles congelados; se usa autofiltro + encabezado en negrita como equivalente práctico.

## Recursos estáticos

Todas las rutas internas usan `import.meta.env.BASE_URL` a través de `assetUrl()` (`src/lib/assets.ts`), para que la aplicación funcione bajo la base `/IPERC-Matriz/` de GitHub Pages.

- `public/templates/IPERC_Generador_Normativo_Peru.xlsx`
- `public/templates/IPERC_Informe_Guia.docx`
- `public/assets/hero-sst-workers.webp` (imagen principal, con `hero-sst-workers.png` como alternativa)

La ilustración del héroe se sirve con `<picture>`, ancho y alto declarados para evitar saltos de diseño, `object-fit: contain` y texto alternativo descriptivo.

## Supabase

El frontend lee estas variables de entorno:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Para desarrollo local cree un archivo `.env` (ignorado por git) con esas dos variables. Para GitHub Pages, configúrelas en `Settings > Secrets and variables > Actions > Variables`. El frontend solo usa la **anon/publishable key**; nunca el `service_role`.

Si las variables faltan, la aplicación funciona en **modo local**: los proyectos se guardan en `localStorage` y «Mis proyectos» sigue operativo. El estado técnico de la conexión no se muestra en la interfaz pública; solo aparece en el aviso que confirma dónde se guardó el proyecto.

### Migraciones

- `supabase/migrations/001_iperc_schema.sql`: esquema completo + RLS. La tabla `iperc_snapshots` solo permite `insert` anónimo.
- `supabase/migrations/002_snapshot_access.sql`: agrega políticas `select/update/delete` para `iperc_snapshots`. **Ejecute esta migración** en el editor SQL de Supabase para habilitar el guardado y la carga remotos.

## Ejecutar

```bash
npm install
npm run dev
```

## Verificar

```bash
npm run build       # tsc -b + vite build
npm run lint        # oxlint
npm run check:links # URLs oficiales, plantillas locales, referencias cruzadas y navegación
```

`check:links` valida además que cada `normId` y `templateId` referenciado exista realmente en el catálogo, y que ninguna entrada de navegación quede sin vista.

## GitHub Pages

El proyecto usa Vite con `base: /IPERC-Matriz/` y el workflow `.github/workflows/deploy-pages.yml`. Si el sitio devuelve 404, active GitHub Pages con fuente `GitHub Actions` y vuelva a ejecutar el workflow.

## Archivos principales

- `src/App.tsx`: cascarón del sitio público, navegación y panel de detalle.
- `src/components/LegalReference.tsx`: enlace normativo reutilizable.
- `src/components/SiteHeader.tsx`, `src/components/SideDrawer.tsx`: cabecera y panel lateral accesibles.
- `src/views/`: `HomeView`, `RouteView` (diagnóstico), `ObligationsView` (+ SOMA), `TemplatesView`, `NormativeView`.
- `src/tools/ToolsWorkspace.tsx`: espacio de trabajo IPERC completo.
- `src/data/legalDatabase.ts`: catálogo legal verificado y módulos sectoriales.
- `src/data/platformContent.ts`: tarjetas de ruta, diagnóstico, obligaciones, plantillas y contenido SOMA.
- `src/data/hazards.ts`: taxonomía de peligros y plantillas de control.
- `src/lib/riskEngine.ts`, `src/lib/exporters.ts`, `src/lib/projectStore.ts`, `src/lib/validation.ts`, `src/lib/assets.ts`.
- `scripts/check-links.mjs`: verificación de enlaces, plantillas, referencias y navegación.
