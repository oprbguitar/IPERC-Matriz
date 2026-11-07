# Observatorio Prevenir Perú

**https://sst.andesnova.solutions** · Seguridad y Salud en el Trabajo, SSOMA, salud ocupacional, IPERC e ISO para cualquier empresa o institución del Perú.

Plataforma abierta (sin registro) con una zona **Premium** con acceso por correo y clave. Corre en **Cloudflare Workers + D1** y se mantiene vigente con verificación automática mensual de las fuentes oficiales.

## Qué incluye

| Sección | Para qué sirve |
|---|---|
| **Inicio** | Historia en 60 segundos, ruta en 6 pasos, descargas rápidas y el **sistema de seguimiento** con 17 dominios (SST, IPERC, comité, registros, salud ocupacional, higiene, ergonomía, psicosocial, inspecciones SUNAFIL, auditoría, emergencias, incendios, riesgo eléctrico, residuos, ambiente, capacitación/contratistas, SST digital e IA). |
| **Evolución** | Línea de tiempo normativa 1964–2026 por eras y ramas, y **árbol de especialización**: tronco legal → ramas → especialidades → roles → prioridades actuales. Descargable en Word/PDF. |
| **Mi Ruta** | Diagnóstico de 10 preguntas en formato compacto, con resultado, responsables, evidencias y normas. |
| **Obligaciones** | Qué corresponde según tamaño, sector y rol. |
| **Biblioteca** | 12 **guías** (SGSST, IPERC, comité, registros, SUNAFIL 2026, auditoría, salud/EMO, ergonomía, emergencias, residuos, contratistas, panorama 2024–2026), **informes enriquecidos** generados en el navegador (diagnóstico, compendio normativo, expediente SUNAFIL) y **plantillas** con su procedencia. Lectura en línea y descarga en Word, PDF o Markdown. |
| **Normativa** | 40 normas peruanas con **enlaces directos verificados** (fuente oficial, PDF, El Peruano, texto concordado SINIA y SPIJ), vista en lista o cuadros, y pestaña **ISO y sistemas integrados** (ISO 45001, ISO 14001, tronco común SIG y matriz documental). |
| **Herramientas** | Generador IPERC, matriz editable, **Analítica** (calculadora de multas SUNAFIL con la tabla oficial del D.S. 008-2020-TR, organización exigible, IF/IS/IA, riesgo inicial vs. residual), **plan de acción con drag & drop**, evidencias con arrastre de archivos, normativa en cuadros/lista, reportes Excel/Word/CSV y registro compacto por pestañas. El panel lateral es un **índice SST** con guías por herramienta. |
| **Premium** | Login con correo y clave, plan de 22 hitos en 6 fases con **% de avance guardado en la nube** (visible en la barra superior), 6 guías de IA (IA aplicada, sistema de agentes, herramientas open source/pago, seguimiento continuo, prompts, gobernanza de datos), solicitudes de acceso y panel de administración de usuarios. |

## Novedades 2026.11.3 · Visor SSOMA

- **Visor SSOMA** (`#/visor`, espacio Explorar): 20 normas SST, de salud ocupacional, ambientales y de químicos con qué regulan, cómo funcionan, artículos clave, obligaciones, cuadros (ECA aire, agua, suelo y ruido, VMA, colores NTP 900.058, extintores, ergonomía, gestantes), riesgos comunes, línea de tiempo y referentes internacionales. Todo plegable y con búsqueda, pensado para el celular.
- **Contraste de fuentes:** 13 hallazgos entre los textos oficiales, la presentación del curso y el catálogo (plazos de registros, periodicidad de EMO, ediciones de NTP, errores del Anexo 1 del proyecto SGA).
- **Químicos:** pictogramas SGA, 87 códigos H y buscador de 4.441 sustancias del Anexo VI del Reglamento CLP (UE), generado con `scripts/build-clp-json.py`.
- Fuentes en `data/fundamentos ssoma` (Markdown, imágenes y Excel; los PDF originales no se versionan por su tamaño).

## Novedades 2026.11.2

- **Nombre y marca:** Observatorio Prevenir Perú (seguridad, salud, ambiente y gestión integrada), con logo y favicon propios.
- **Navegación guiada:** cada página tiene dirección propia (atrás y adelante del navegador funcionan), barra "Volver · Inicio › Espacio › Página · Paso n de N · Siguiente" y paginador inferior. Implementar queda reservado a cuentas premium.
- **67 normas** (27 nuevas verificadas en gob.pe y El Peruano): Ley 32721 (descanso sentado), D.S. 003-2026-SA (radiación UV), teletrabajo 2023–2026, SCTR, valores límite de agentes químicos, salud mental, datos personales y reglamentos sectoriales.
- **SPIJ directo:** 50 normas abren la página exacta de la edición de normas legales archivada por el SPIJ.
- **Detalle plegable por norma:** propósito, modificatorias, datos clave, cómo aplicarla y artículos cotejados con su fragmento literal.
- **Plantillas adaptadas a su empresa:** los datos de la organización se escriben una vez y llenan todas las plantillas (Word, Excel y PDF): una por plantilla de la Biblioteca, por obligación de "Por tamaño y rol" y por tema SOMA.
- **Manuales descargables:** cada guía descarga un manual completo con portada, índice, procedimiento, ejemplos y listas de verificación.
- **ISO:** normas relacionadas (familia ISO 45000, 14001, 50001, 19011, 31000, 22301) y NTP de INACAL, con matriz descargable.

Detalle de verificación y pendientes: [docs/AMPLIACION-NORMATIVA-2026-11.md](docs/AMPLIACION-NORMATIVA-2026-11.md).

## Cumplimiento normativo (versión 2026.11.1)

La plataforma se organiza en **cinco espacios** con búsqueda transversal (Ctrl + K):

| Espacio | Qué encontrará |
|---|---|
| **Explorar** | Normativa e ISO, evolución normativa y **casuística** (precedentes del TFL marcados como vinculantes o no, y como cotejados o reportados) |
| **Diagnosticar** | **Obligaciones aplicables** según tipo de organización, trabajadores, actividad, alto riesgo, contratistas, teletrabajo y REMYPE; cada una con artículo, evidencia, formato e infracción RLGIT |
| **Implementar** | IPERC con **residual proyectado vs. verificado** (el riesgo vigente solo baja con responsable y evidencia) y **formatos** oficiales o editables en línea (Word, Excel, PDF) |
| **Verificar** | **Seguimiento de cumplimiento** (% de obligaciones acreditadas con evidencia, críticas abiertas aparte) y **Centro de fiscalización**: ficha de contingencia por numeral tipificado, expediente con cronología y plan correctivo |
| **Aprender** | Biblioteca con **25 plantillas avanzadas** (control documental, base legal, instrucciones, filas numeradas, firmas), guías, informes y Premium |

- **Catálogo jurídico** en `src/catalog/` (sin dependencias de UI): 19 artículos cotejados con el PDF oficial, 25 obligaciones, 33 infracciones SST (arts. 26-28 RLGIT), 24 formatos, 15 casos.
- **API pública** de solo lectura: `https://sst.andesnova.solutions/api/v1` (normas, artículos, obligaciones por perfil, formatos, infracciones, jurisprudencia, sectores, actualizaciones). Ver `docs/ARQUITECTURA.md`.
- **Vigencia**: el scraper guarda una huella del contenido jurídico de cada fuente; un cambio queda "pendiente de validación jurídica". Un enlace activo no acredita vigencia.
- **Evaluación y pendientes**: `docs/EVALUACION-2026-11.md`.

## Procedencia del contenido

- **Normas**: catálogo propio con enlaces a gob.pe, El Peruano, SUNAFIL, SINIA y Congreso. `npm run scrape:norms` visita cada fuente, verifica el estado HTTP y extrae el PDF oficial y el enlace a El Peruano en `src/data/normSources.json`. El workflow `refresh-norms.yml` lo repite cada mes y abre un PR si algo cambió.
- **SPIJ**: su buscador exige sesión, por eso cada norma abre el SPIJ de acceso libre y copia el número; cuando se conoce el ID `detallenorma` se registra en `src/data/normLinks.ts` para enlace directo.
- **Plantillas**: cada tarjeta indica si es un **formato oficial** (MTPE, SUNAFIL, SERVIR, MINSA, MINAM) o una **plantilla propia** del Observatorio (Excel IPERC y guía Word en `public/templates`).
- **Guías e informes**: generados por la plataforma a partir del catálogo verificado, `alcances.md` y el informe *Mercado peruano de SST 2024–2026*.
- **ISO**: `npm run import:iso <carpeta>` importa la interpretación cláusula por cláusula de los cursos [cursoma2026](https://github.com/oprbguitar/cursoma2026) y [sistemas-integrados-curso](https://github.com/oprbguitar/sistemas-integrados-curso). No se reproduce texto ISO.
- **Multas**: tabla del art. 48 del RLGIT transcrita del PDF oficial del D.S. N.° 008-2020-TR; UIT 2024–2026.

Todo es orientativo: verifique el texto vigente de cada norma en la fuente oficial antes de citarlo.

## Arquitectura

```
Navegador (React 19 + Vite)
   │  /api/*                         resto: archivos estáticos (dist/)
   ▼
Cloudflare Worker  worker/index.ts ──► D1 "observatorio-sst"
   ├─ /api/auth/*      login PBKDF2 + cookie HttpOnly, cambio de clave, límite de intentos
   ├─ /api/premium/*   guías premium (solo en el servidor)
   ├─ /api/progress    avance por usuario
   ├─ /api/access-requests, /api/admin/*   solicitudes y usuarios
   └─ /api/stats, /api/downloads/:id       contador de descargas
```

Tablas D1 en `migrations/0001_init.sql`: `users`, `sessions`, `progress`, `access_requests`, `download_stats`, `login_attempts`.

GitHub Pages (`/IPERC-Matriz/`) sigue publicando la versión estática; ahí la zona Premium indica que debe usarse el dominio de Cloudflare.

## Desarrollo

```bash
npm install
npm run dev                 # frontend en http://localhost:5173 (proxy /api -> 8787)
npm run cf:dev              # build + Worker local con D1 local en http://localhost:8787
npx wrangler d1 migrations apply observatorio-sst --local
node scripts/create-user.mjs --email tu@correo.com --name "Tu nombre" --role admin
```

## Despliegue en Cloudflare

```bash
npm run cf:migrate          # aplica migraciones en D1 remoto (0001 y 0002)
npm run deploy              # build + wrangler deploy (dominio sst.andesnova.solutions)
node scripts/create-user.mjs --email tu@correo.com --role admin --remote
```

## Verificación

```bash
npm test                    # vitest: catálogo, aplicabilidad, multas, residual, plantillas, API
npm run build               # tsc + vite build
npm run build:worker        # typecheck del Worker
npm run lint                # oxlint
npm run check:links         # URLs externas, plantillas y referencias cruzadas
npm run scrape:norms        # re-verifica fuentes oficiales
```
