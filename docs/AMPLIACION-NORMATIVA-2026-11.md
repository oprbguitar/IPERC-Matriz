# Ampliación normativa y de experiencia — noviembre de 2026

Documento de continuidad. Resume qué se verificó, con qué fuente, qué se decidió y qué falta, para que otra persona (o IA) continúe sin repetir la auditoría. Catálogo: versión `2026.11.2`.

## 1. Método de verificación

1. **Página oficial:** cada norma nueva se abrió en gob.pe o El Peruano (`busquedas.elperuano.pe/dispositivo/NL/...`) y se comprobó título, fecha y sumilla.
2. **Texto de artículos:** se cotejó con las ediciones de normas legales que el SPIJ archiva en `https://spij.minjus.gob.pe/Normas/textos/DDMMAAT.pdf`. Estas ediciones son PDF con texto (no escaneados), a diferencia del PDF de la Ley 29783 en gob.pe.
3. **Enlace SPIJ directo:** `scripts/locate-spij.mjs` descarga la edición del día de publicación (±3 días), busca el encabezado en mayúsculas de la norma (`LEY Nº 29783`, `DECRETO SUPREMO Nº 005-2012-TR`) y guarda la página exacta en `src/data/spijLinks.json`. 50 normas quedaron con enlace `...T.pdf#page=N`. Las que no se ubicaron conservan el botón que abre el SPIJ con el número copiado.

```bash
node scripts/locate-spij.mjs src/data/normSources.json scripts/spij-dates.json src/data/spijLinks.json
```

## 2. Normas añadidas (verificadas)

| Id | Norma | Fuente verificada | Tipo |
|---|---|---|---|
| law-32721 | Ley 32721, descanso sentado y alternancia postural | El Peruano NL 2532797-3; SPIJ 08/07/2026 p. 3 | Obligación legal |
| ds-003-2026-sa | Reglamento de la Ley 30102 (radiación UV) | El Peruano NL 2505637-1 (14/04/2026) | Obligación legal |
| law-30102 | Ley 30102 (radiación solar) | SPIJ 06/11/2013 | Obligación legal |
| ds-009-2026-tr | Modifica el reglamento del teletrabajo | gob.pe MTPE 8412124 | Obligación legal |
| rm-051-2026-tr | Anexos 1 y 2 del reglamento del teletrabajo | gob.pe MTPE 7760586 | Obligación legal |
| law-31572 | Ley del Teletrabajo | SPIJ (PDF de la ley) | Obligación legal |
| ds-002-2023-tr | Reglamento de la Ley 31572 | gob.pe MTPE 3980720 | Obligación legal |
| rm-546-2026-minsa | DT Promoción de la Salud en los Lugares de Trabajo | gob.pe MINSA 8223697 | Recomendación técnica |
| ds-008-2026-tr | Adecuación a la Ley 32431 (cáncer) | gob.pe MTPE 8229074 | Régimen conexo |
| rm-613-2026-minsa | NTS 248, incapacidad laboral (origen común) | gob.pe MINSA 8373911 | Referencia |
| ds-002-2020-tr | Sustituye el art. 77 del D.S. 005-2012-TR | gob.pe MTPE 394799; texto en SPIJ 08/01/2020 p. 75 | Obligación legal |
| ds-010-2014-tr | Normas complementarias de la Ley 30222 | gob.pe MTPE 8094745 | Histórico |
| rm-245-2021-tr | Procedimiento de elección de representantes | gob.pe MTPE 2539636 | Obligación legal |
| ds-003-98-sa | Normas técnicas del SCTR | gob.pe MINSA 256505 | Obligación legal |
| ds-008-2022-sa | Actualiza el Anexo 5 (actividades de riesgo) | gob.pe MINSA 3113954 | Obligación legal |
| ds-022-2023-sa | Modifica el art. 20 de las normas del SCTR | gob.pe MINSA 4546699 | Obligación legal |
| rm-480-2008-minsa | Listado de enfermedades profesionales | gob.pe MINSA 247955 | Obligación legal |
| rm-571-2014-minsa | Modifica protocolos de EMO | gob.pe MINSA 198521 | Obligación legal |
| ds-015-2005-sa | Valores límite de agentes químicos | gob.pe MINSA 252380 | Obligación legal |
| rm-733-2024-minsa | Anexos de valores límite | gob.pe MINSA 6130172 | Obligación legal |
| law-30947 / ds-007-2020-sa | Salud mental y su reglamento | SPIJ 23/05/2019; gob.pe MINSA 455147 | Recomendación |
| ds-014-2019-mimp | Reglamento de la Ley 27942 (hostigamiento) | gob.pe MIMP 285411 | Régimen conexo |
| ds-016-2024-jus | Reglamento de la Ley 29733 | gob.pe 6426760 | Obligación legal |
| ds-034-2023-em | Modifica el reglamento de SSO en minería | gob.pe MINEM 4990975 | Sectorial |
| ds-043-2007-em | Reglamento de seguridad en hidrocarburos | gob.pe MINEM 5136203 | Sectorial |
| rm-826-2024-minsa | NTS 215, SST del sistema de salud | gob.pe MINSA 6241075 | Sectorial |

## 3. Artículos cotejados (nuevos)

- **Ley 29783** (SPIJ, edición 20/08/2011): arts. 17, 21, 22, 26, 28, 29, 30, 31, 32, 34, 35, 49, 50, 52, 56, 57, 60, 66, 68, 82 y 103. Arts. 26, 28, 32 y 49 d) con el texto de la Ley 30222 (SPIJ 11/07/2014). Arts. 49 y 60 también modificados por la Ley 31246 (SPIJ 25/06/2021).
- **D.S. 005-2012-TR, art. 77:** texto vigente sustituido por el D.S. 002-2020-TR (IPERC sin exceder un año, requisitos mínimos). La ficha original de 2012 se conserva marcada como sustituida.
- **D.S. 014-2013-TR, art. 15:** auditoría cada 2 años con actividad de riesgo, cada 3 años en los demás casos; hasta 10 trabajadores sin riesgo, solo por orden de la inspección.
- **Ley 32721:** arts. 2 a 7 y 3.ª disposición complementaria final.
- **D.S. 003-2026-SA:** arts. 5 q) y r), 10, 11, 12 y 13.

## 4. Cambios en obligaciones (`src/catalog/obligations.ts`)

| Obligación | Cambio |
|---|---|
| iperc | Plazo "sin exceder un año" con arts. 57 de la Ley y 77 vigente |
| capacitacion | Mínimo cuatro al año (Ley 29783, art. 35 b) |
| emo | Cada dos años; alto riesgo al ingreso, durante y al cese (art. 49 d) |
| sctr | Antes sin normas; ahora D.S. 003-98-SA, 008-2022-SA y 022-2023-SA, con indicación de contrastar el CIIU con el Anexo 5 |
| teletrabajo | Antes sin normas; ahora Ley 31572, D.S. 002-2023-TR, D.S. 009-2026-TR y R.M. 051-2026-TR |
| auditoria | Periodicidad calculada por riesgo y número de trabajadores |
| Nuevas | bipedestacion (perfil `standingWork`), radiacion-uv (`sunExposure`), agentes-quimicos, hostigamiento (régimen conexo, no deriva de la Ley 29783) |

## 5. Pendientes y decisiones

| Tema | Estado | Motivo |
|---|---|---|
| Ley 32102 | Pendiente de enlace propio | El enlace propuesto en la auditoría lleva a un informe de SERVIR sobre tardanzas. La ley se cita solo a través de la sumilla oficial del D.S. 009-2026-TR. |
| Detalle artículo por artículo del D.S. 009-2026-TR | Pendiente | Se registró la sumilla (arts. 7, 12, 21, 26, 27 y 10-A) sin cotejar cada texto. |
| R.M. 085-2013-TR (registros simplificados MYPE) | Pendiente | No se ubicó la página oficial en esta revisión. La obligación de registros simplificados se sustenta en el art. 28 de la Ley (texto de la Ley 30222). |
| D.S. 017-2017-TR y R.M. 249-2017-TR (obreros municipales) | Pendiente | Sin verificación de fuente en esta revisión. |
| D.S. 036-2020-EM (hidrocarburos) | Pendiente | Sin verificación de fuente. |
| ISO 45002, 45003, 45004, 45006 y Amd 1:2024 | Incluidas como referencia técnica | iso.org bloqueó la consulta automática; se presentan como normas voluntarias, separadas de las obligaciones legales. |
| Edición vigente de NTP 399.010-1, 350.043-1 y 900.058 | Pendiente en INACAL | Se citan con la indicación de confirmar la edición vigente. |
| 14 normas sin enlace SPIJ directo | Pendiente | Publicación fuera del rango de fechas probado o edición no archivada; conservan el botón de búsqueda. |
| Casos "reportado, texto no cotejado" | Sin cambios | Siguen sin enlace hasta leer su texto íntegro. |

**Corrección propia:** en la versión anterior se asoció la Ley 31246 al art. 32 de la Ley 29783. El texto oficial muestra que modificó los arts. 49 y 60; se corrigió.

## 6. Experiencia de usuario (misma entrega)

- **Desplazamiento lateral:** la "barra que se desliza" era una animación del encabezado (`.site-header::after`) que se desplazaba hasta el 125 % del ancho y generaba desbordamiento horizontal. Se eliminó; además `overflow-x: clip` y entradas de vista solo con opacidad.
- **Navegación:** dirección por vista (`#/normativa`), botones atrás y adelante del navegador, barra "Volver · Inicio › Espacio › Página · Paso n de N · Siguiente" y paginador inferior con anterior y siguiente.
- **Implementar:** oculto sin sesión premium (`PREMIUM_VIEWS`).
- **Guías y formatos:** se abren sobre la página actual; al cerrar, el usuario sigue donde estaba.
- **Plantillas adaptadas:** datos de la organización (`src/lib/orgStore.ts`) que llenan todas las plantillas; una versión adaptada por cada plantilla de la Biblioteca, por cada obligación de "Por tamaño y rol" y por cada tema SOMA (Word, Excel y PDF).
- **Manuales:** cada guía descarga un manual ampliado (`src/data/guideManuals*.ts`) con portada, índice, procedimiento, ejemplos, errores frecuentes y listas de verificación.
- **Marca:** Observatorio Prevenir Perú, con el logo y el favicon entregados.
