# Estado de implementación · ampliación preventiva

Fecha de trabajo: 7 de noviembre de 2026. Este documento describe el alcance de código; no acredita un despliegue ni sustituye el registro de pruebas final.

## Alcance de la entrega

El Explorador de Riesgos y Controles amplía la aplicación React existente. La portada incorpora un acceso compacto y el módulo se integra en la navegación y búsqueda transversal. La consulta pública no necesita cuenta.

| Área | Alcance |
|---|---|
| Catálogo relacionado | 16 sectores, 9 familias de peligros y 16 fichas con exposición, consecuencias posibles, controles, verificación, instrumentos, EPP, límites y referencias. |
| Perfiles | 5 orientaciones de lectura: trabajador, empleador, supervisor, profesional SST/SSOMA y consultor. El perfil no determina automáticamente obligaciones ni filtra personas. |
| Consulta | Búsqueda sin sensibilidad a tildes, facetas por sector y familia; detalle de ficha y enlace a la misma base normativa. |
| Visor educativo | 8 ambientes: oficina, almacén, planta industrial, alimentos, salud, construcción, agricultura y hogar. Puntos seleccionables y comparación ilustrativa con/sin controles. |
| Secuencia de explicación | Peligro → exposición → consecuencia posible → control → verificación → norma. No calcula riesgo residual acreditado. |
| Animación | Transiciones e ilustraciones vectoriales; control de animaciones y respeto por movimiento reducido. Sin motor 3D nuevo. |
| Recursos | Fichas y listas orientativas descargables mediante el generador existente: Word compatible `.doc`, Markdown e impresión para guardar PDF; enlace permanente y QR descargable. |
| Herramientas | Tiempo de referencia de ruido a nivel constante e interpretación educativa de un índice UV elegido por el usuario. |
| EPP y metrología | Catálogo filtrable de 10 familias EPP y 8 instrumentos, límites, inspección, mantenimiento, retiro y referencias; comparación de cascos OSHA y ficha INACAL. |
| Práctica IPERC | Ocho campos: actividad, tarea, peligro, evento, daño, control, responsable y evidencia; jerarquía, tres ejemplos editables, borrador local y documentos. La aceptabilidad queda pendiente de evaluación. |
| Seguimiento | Enlace al módulo de seguimiento existente; no se crea una base de evidencias paralela ni se acredita el control al activar una ilustración. |

Las 16 fichas cubren electricidad, EPP, ruido, incendios, químicos, residuos, ergonomía, UV, piel, salud psicosocial, alimentos, maquinaria, agentes biológicos, alturas, confort ambiental y gases. No constituyen un inventario exhaustivo de peligros.

## Conservación del portal

Se conservan encabezado, identidad y espacios de navegación; rutas previas, diagnóstico, IPERC, seguimiento, biblioteca, señales, visor SSOMA y simulador previo. El módulo usa referencias de `legalDatabase`, no un segundo catálogo jurídico. Los 17 dominios y las 67 referencias declaradas previamente no se eliminan ni se sustituyen por las 16 fichas nuevas.

Las modificaciones de frontend no requieren migraciones, cambios en credenciales ni nuevos servicios de pago. La API, autenticación y datos D1 conservan su responsabilidad existente.

## Límites y trabajo pendiente

- Contrastar e incorporar al catálogo jurídico único el marco sanitario específico de alimentos: D.L. 1062, D.S. 034-2008-AG, D.S. 007-98-SA, R.M. 449-2006-MINSA y R.M. 822-2018-MINSA según proceso y establecimiento. Mientras tanto se indica **PENDIENTE DE VALIDACIÓN**.
- Ampliar fichas de cada producto EPP, normas técnicas y ediciones, certificados de conformidad, laboratorios y alcances de acreditación. Los instrumentos y EPP actuales son orientación por tarea, no productos certificados ni una recomendación de compra.
- Profundizar peligros específicos como vibración, radiaciones artificiales o ionizantes y evaluación sectorial especializada. Una familia o un sector visible no implica cobertura completa.
- Revisar jurídicamente vigencia, modificaciones, alcance y exigibilidad antes de aplicar una referencia a una organización. Una fuente accesible no acredita todos esos extremos.
- No se incorpora evaluación profesional, medición real, pronóstico UV local, diagnóstico clínico, cálculo de cáncer, certificación de cumplimiento ni cálculo de dosis variable de ruido.
- Los resultados de pruebas, cobertura, QA de navegador y publicación se registran en [testing.md](testing.md). No se extrapola la cobertura de las dos bibliotecas nuevas a toda la aplicación heredada.

## Uso básico

1. Abra el Explorador desde la portada o el espacio Explorar.
2. Busque una tarea o peligro y combine sector y familia; elija el perfil para ver su orientación.
3. Seleccione una ficha o un punto del ambiente. Revise controles y evidencias antes de consultar las referencias.
4. Compare la ilustración con y sin controles. Esa comparación no registra implementación ni reduce el riesgo de una evaluación real.
5. Descargue el material orientativo o abra seguimiento para trabajar con responsables y evidencias en el módulo existente.

Véanse [trazabilidad normativa](normative-traceability.md), [visor](visual-risk-viewer.md) y [arquitectura](ARQUITECTURA.md).
