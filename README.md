# IPERC Peru

Generador modular de matriz IPERC para seguridad y salud en el trabajo en Peru. No es una hoja fija: combina datos de empresa, sector, puesto, tarea, peligro, evaluacion de riesgo, jerarquia de controles, evidencia y trazabilidad legal.

## Alcance

- Wizard limpio de 12 pasos: empresa, SGSST, sector legal, areas/puestos/tareas, peligros, riesgo inicial, controles existentes, controles propuestos, riesgo residual, validacion legal, plan de accion, exportes e indicadores.
- Marco general: Ley N. 29783, D.S. N. 005-2012-TR, R.M. N. 050-2013-TR y referencia tecnica SUNAFIL/IPERC como registros pendientes de validacion documental.
- Modulos sectoriales: sector publico, construccion, mineria, hidrocarburos, salud, manufactura, oficinas, transporte/logistica, almacenes y servicios generales/mantenimiento.
- Taxonomia de peligros: fisicos, quimicos, biologicos, ergonomicos, psicosociales, mecanicos, electricos, locativos, incendio, explosion, transito vehicular, altura, espacios confinados, cargas, herramientas, violencia externa y emergencias.
- Motor de riesgo: probabilidad x severidad x exposicion, niveles Bajo/Moderado/Importante/Intolerable, aceptabilidad, prioridad, decision de continuidad y riesgo residual.
- Exportes: Excel real `.xlsx` (libreria `xlsx-js-style`) con hojas Resumen, Matriz IPERC, Plan de Accion, Evidencias, Normativa y Catalogos; ademas PDF por impresion, Word tecnico y CSV dataset.
- Registro y proyectos: alta de empresa con validacion de RUC (11 digitos), CRUD de areas/puestos/tareas, autoguardado de borrador, guardado manual y seccion "Mis proyectos" (cargar, duplicar, eliminar, exportar).
- Edicion de matriz: ajuste manual de probabilidad/severidad/exposicion (inicial y residual) con recalculo automatico y marcado de estado del control (pendiente, en ejecucion, implementado, verificado, vencido, no aplica).
- Supabase/Postgres: esquema para empresas, sedes, areas, puestos, tareas, peligros, riesgos, controles, normas, articulos, evaluaciones, links legales, evidencias, versiones, aprobaciones y plan de accion.

## Excel `.xlsx`

`src/lib/exporters.ts` genera el libro con `xlsx-js-style`. Cada hoja incluye encabezado con estilo, autofiltro y ancho de columnas automatico. La hoja `Matriz IPERC` colorea el nivel de riesgo (Bajo/Moderado/Importante/Intolerable) y usa formulas vivas para el puntaje inicial y residual (`P*S*E`). El nombre del archivo sigue el formato `IPERC_[RUC|Empresa]_[Sector]_[YYYY-MM-DD].xlsx`. Las filas sin sustento legal validado se exportan marcadas como `Requiere validacion legal`. Los reportes de la seccion Reportes exportan solo las filas relevantes (criticos, vencidos, evidencia pendiente, validacion legal, etc.).

> Nota: el escritor de la version community de SheetJS no escribe paneles congelados; se usa autofiltro + encabezado en negrita como equivalente practico.

## Regla Legal

La aplicacion no debe inventar obligaciones legales, articulos ni textos normativos. `src/data/legalDatabase.ts` registra normas y modulos, pero `legalArticles` permanece vacio hasta cargar fuentes oficiales o verificadas internamente. Cuando no hay articulo validado, la UI y los exportes muestran `Requires legal validation` o `Normative reference pending validation`.

## Supabase

El frontend lee estas variables de entorno:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Para desarrollo local cree un archivo `.env` (ignorado por git) con esas dos variables. Para GitHub Pages, configure en el repositorio las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `Settings > Secrets and variables > Actions > Variables`. No se publica ningun `.env` en el repositorio. El frontend solo usa la **anon/publishable key**; nunca el `service_role`.

Si las variables faltan, la app funciona en **modo local**: los proyectos se guardan en `localStorage` del navegador y "Mis proyectos" sigue operativo. La barra lateral muestra "Modo local" o "Supabase conectado" segun corresponda.

Proyecto indicado por el usuario:

```text
https://qxtfzhdoxlgwfwgwpljd.supabase.co
```

### Migraciones

- `supabase/migrations/001_iperc_schema.sql`: esquema completo + RLS. La tabla `iperc_snapshots` solo permite `insert` anonimo.
- `supabase/migrations/002_snapshot_access.sql`: agrega politicas `select/update/delete` para `iperc_snapshots` (necesarias para listar, cargar, actualizar y eliminar proyectos). **Ejecute esta migracion** en el editor SQL de Supabase para habilitar el guardado/carga remoto. No debilita el RLS del resto de tablas operativas, que siguen bloqueadas con `using (false)`.

## Ejecutar

```bash
npm install
npm run dev
```

## Verificar

```bash
npm run build       # tsc -b + vite build
npm run lint        # oxlint
npm run check:links # verifica URLs externas y que cada vista de navegacion exista
```

## GitHub Pages

El proyecto usa Vite con `base: /IPERC-Matriz/` y el workflow `.github/workflows/deploy-pages.yml`. La pagina publicada corresponde a:

```text
https://oprbguitar.github.io/IPERC-Matriz/
```

Si el sitio devuelve 404, active GitHub Pages con fuente `GitHub Actions` en la configuracion del repositorio y vuelva a ejecutar el workflow.

## Archivos Principales

- `src/App.tsx`: wizard, dashboard y flujo de usuario.
- `src/types.ts`: modelo IPERC trazable y modular.
- `src/data/hazards.ts`: taxonomia de peligros y plantillas de controles.
- `src/data/legalDatabase.ts`: normas, modulos sectoriales y evidencias requeridas.
- `src/lib/riskEngine.ts`: motor de coincidencia, evaluacion, residual y validacion.
- `src/lib/exporters.ts`: exportes Excel `.xlsx` multi-hoja, CSV, Word y PDF.
- `src/lib/projectStore.ts`: guardar/listar/cargar/actualizar/eliminar/duplicar proyectos (Supabase + fallback localStorage).
- `src/lib/validation.ts`: validacion de RUC y del registro antes de generar/exportar.
- `scripts/check-links.mjs`: verificacion de enlaces y navegacion.
- `supabase/migrations/001_iperc_schema.sql`: esquema PostgreSQL/Supabase.
