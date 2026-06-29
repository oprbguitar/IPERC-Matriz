# IPERC Peru

Generador modular de matriz IPERC para seguridad y salud en el trabajo en Peru. No es una hoja fija: combina datos de empresa, sector, puesto, tarea, peligro, evaluacion de riesgo, jerarquia de controles, evidencia y trazabilidad legal.

## Alcance

- Wizard limpio de 12 pasos: empresa, SGSST, sector legal, areas/puestos/tareas, peligros, riesgo inicial, controles existentes, controles propuestos, riesgo residual, validacion legal, plan de accion, exportes e indicadores.
- Marco general: Ley N. 29783, D.S. N. 005-2012-TR, R.M. N. 050-2013-TR y referencia tecnica SUNAFIL/IPERC como registros pendientes de validacion documental.
- Modulos sectoriales: sector publico, construccion, mineria, hidrocarburos, salud, manufactura, oficinas, transporte/logistica, almacenes y servicios generales/mantenimiento.
- Taxonomia de peligros: fisicos, quimicos, biologicos, ergonomicos, psicosociales, mecanicos, electricos, locativos, incendio, explosion, transito vehicular, altura, espacios confinados, cargas, herramientas, violencia externa y emergencias.
- Motor de riesgo: probabilidad x severidad x exposicion, niveles Bajo/Moderado/Importante/Intolerable, aceptabilidad, prioridad, decision de continuidad y riesgo residual.
- Exportes: Excel compatible, PDF por impresion, Word tecnico y CSV dataset.
- Supabase/Postgres: esquema para empresas, sedes, areas, puestos, tareas, peligros, riesgos, controles, normas, articulos, evaluaciones, links legales, evidencias, versiones, aprobaciones y plan de accion.

## Regla Legal

La aplicacion no debe inventar obligaciones legales, articulos ni textos normativos. `src/data/legalDatabase.ts` registra normas y modulos, pero `legalArticles` permanece vacio hasta cargar fuentes oficiales o verificadas internamente. Cuando no hay articulo validado, la UI y los exportes muestran `Requires legal validation` o `Normative reference pending validation`.

## Supabase

El frontend lee estas variables de entorno:

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Para GitHub Pages, configure en el repositorio las variables `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en `Settings > Secrets and variables > Actions > Variables`. No se publica ningun `.env` en el repositorio.

Proyecto indicado por el usuario:

```text
https://qxtfzhdoxlgwfwgwpljd.supabase.co
```

## Ejecutar

```bash
npm install
npm run dev
```

## Verificar

```bash
npm run build
npm run lint
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
- `src/lib/exporters.ts`: exportes Excel, CSV, Word y PDF.
- `supabase/migrations/001_iperc_schema.sql`: esquema PostgreSQL/Supabase.
