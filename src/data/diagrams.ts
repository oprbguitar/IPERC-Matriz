/**
 * Diagramas de procesos SSOMA (estilo Archify: nodos clicables, detalle y recorridos resaltables).
 * Posición en rejilla: col (0..3) y row (0..n). Plazos y artículos según la norma citada; orientativo.
 */
export type NodeKind = 'inicio' | 'proceso' | 'decision' | 'documento' | 'fin' | 'alerta'

export interface DNode { id: string; label: string; kind: NodeKind; col: number; row: number; detail: string; norm?: string; time?: string }
export interface DEdge { from: string; to: string; label?: string }
export interface Diagram { id: string; title: string; summary: string; cols: number; nodes: DNode[]; edges: DEdge[]; paths?: Array<{ label: string; nodes: string[] }> }

export const DIAGRAMS: Diagram[] = [
  {
    id: 'phva', title: 'Ciclo PHVA del SGSST', summary: 'Cómo se organiza el sistema de gestión de SST.', cols: 3,
    nodes: [
      { id: 'pol', label: 'Política de SST', kind: 'inicio', col: 1, row: 0, detail: 'Compromiso firmado por el empleador, difundido y revisado.', norm: 'Ley 29783, art. 22-23' },
      { id: 'p', label: 'PLANIFICAR', kind: 'proceso', col: 0, row: 1, detail: 'Línea base, IPERC, mapa de riesgos, objetivos, plan y programa anual.', norm: 'Ley 29783, arts. 37-38' },
      { id: 'h', label: 'HACER', kind: 'proceso', col: 2, row: 1, detail: 'Controles, capacitación (4 al año), EMO, EPP, emergencias, comité o supervisor.', norm: 'Ley 29783, arts. 29, 35, 49' },
      { id: 'v', label: 'VERIFICAR', kind: 'proceso', col: 2, row: 2, detail: 'Inspecciones, monitoreos, investigación de accidentes, indicadores y auditoría.', norm: 'Ley 29783, arts. 40-43' },
      { id: 'a', label: 'ACTUAR', kind: 'proceso', col: 0, row: 2, detail: 'Revisión por la dirección, acciones correctivas y mejora continua.', norm: 'Ley 29783, art. 41' },
      { id: 'reg', label: '10 registros obligatorios', kind: 'documento', col: 1, row: 3, detail: 'Evidencia de todo el ciclo: accidentes, EMO, monitoreos, inspecciones, capacitación, auditorías, etc.', norm: 'R.M. 050-2013-TR', time: 'Conservar 5 a 20 años' },
    ],
    edges: [{ from: 'pol', to: 'p' }, { from: 'p', to: 'h' }, { from: 'h', to: 'v' }, { from: 'v', to: 'a' }, { from: 'a', to: 'p', label: 'mejora' }, { from: 'v', to: 'reg' }],
  },
  {
    id: 'iperc', title: 'Proceso IPERC', summary: 'Identificar peligros, evaluar riesgos y controlar.', cols: 3,
    nodes: [
      { id: 'act', label: 'Listar procesos y tareas', kind: 'inicio', col: 1, row: 0, detail: 'Incluye tareas rutinarias, no rutinarias y de emergencia, por puesto.', norm: 'D.S. 005-2012-TR, art. 77' },
      { id: 'pel', label: 'Identificar peligros', kind: 'proceso', col: 1, row: 1, detail: 'Físicos, químicos, biológicos, ergonómicos, psicosociales, mecánicos, eléctricos, locativos.' },
      { id: 'eva', label: 'Evaluar riesgo: P × S', kind: 'proceso', col: 1, row: 2, detail: 'P = personas + procedimientos + capacitación + exposición (1-3 c/u); S = 1-3.', norm: 'R.M. 050-2013-TR', time: 'Trivial 4 · Tolerable 5-8 · Moderado 9-16 · Importante 17-24 · Intolerable 25-36' },
      { id: 'dec', label: '¿Riesgo significativo?', kind: 'decision', col: 1, row: 3, detail: 'Moderado o superior exige controles adicionales; intolerable detiene la tarea.' },
      { id: 'ctrl', label: 'Controles por jerarquía', kind: 'proceso', col: 2, row: 3, detail: 'Eliminación → sustitución → ingeniería → administrativos → EPP.', norm: 'Ley 29783, art. 21' },
      { id: 'res', label: 'Riesgo residual verificado', kind: 'proceso', col: 2, row: 4, detail: 'Se recalcula y se verifica en campo con evidencia y responsable.' },
      { id: 'doc', label: 'Matriz IPERC y mapa de riesgos', kind: 'documento', col: 1, row: 4, detail: 'Se difunde a los trabajadores y se exhibe el mapa de riesgos.', time: 'Actualizar al menos cada año' },
      { id: 'fin', label: 'Monitorear y actualizar', kind: 'fin', col: 1, row: 5, detail: 'Tras accidentes, cambios de proceso o nuevos peligros.' },
    ],
    edges: [{ from: 'act', to: 'pel' }, { from: 'pel', to: 'eva' }, { from: 'eva', to: 'dec' }, { from: 'dec', to: 'ctrl', label: 'Sí' }, { from: 'ctrl', to: 'res' }, { from: 'res', to: 'eva', label: 'reevaluar' }, { from: 'dec', to: 'doc', label: 'No' }, { from: 'res', to: 'doc' }, { from: 'doc', to: 'fin' }],
    paths: [{ label: 'Riesgo significativo', nodes: ['act', 'pel', 'eva', 'dec', 'ctrl', 'res', 'doc', 'fin'] }, { label: 'Riesgo aceptable', nodes: ['act', 'pel', 'eva', 'dec', 'doc', 'fin'] }],
  },
  {
    id: 'accidente', title: 'Accidente de trabajo: notificación e investigación', summary: 'Qué hacer y en qué plazo.', cols: 3,
    nodes: [
      { id: 'ev', label: 'Ocurre el evento', kind: 'alerta', col: 1, row: 0, detail: 'Accidente, incidente peligroso o incidente.' },
      { id: 'pa', label: 'Primeros auxilios y asegurar zona', kind: 'proceso', col: 1, row: 1, detail: 'Atención inmediata, traslado y preservación de evidencias.' },
      { id: 'tipo', label: '¿Mortal o incidente peligroso?', kind: 'decision', col: 1, row: 2, detail: 'Define el plazo y quién notifica.' },
      { id: 'n24', label: 'Notificar al MTPE', kind: 'alerta', col: 0, row: 3, detail: 'El empleador notifica en el aplicativo del MTPE.', norm: 'D.S. 005-2012-TR, art. 110', time: '24 horas' },
      { id: 'nmes', label: 'Notificación por el centro médico', kind: 'documento', col: 2, row: 3, detail: 'Accidente no mortal: lo notifica el centro médico asistencial.', norm: 'D.S. 005-2012-TR, art. 110', time: 'Último día hábil del mes siguiente' },
      { id: 'inv', label: 'Investigación con el comité', kind: 'proceso', col: 1, row: 4, detail: 'Causas inmediatas (actos y condiciones) y básicas (factores personales y del trabajo).', norm: 'Ley 29783, art. 58' },
      { id: 'reg', label: 'Registro de accidentes', kind: 'documento', col: 0, row: 5, detail: 'Formato del registro de accidentes de trabajo.', norm: 'R.M. 050-2013-TR', time: 'Conservar 10 años' },
      { id: 'ac', label: 'Acciones correctivas y actualizar IPERC', kind: 'fin', col: 2, row: 5, detail: 'Con responsables, plazos y verificación de eficacia.' },
    ],
    edges: [{ from: 'ev', to: 'pa' }, { from: 'pa', to: 'tipo' }, { from: 'tipo', to: 'n24', label: 'Sí' }, { from: 'tipo', to: 'nmes', label: 'No' }, { from: 'n24', to: 'inv' }, { from: 'nmes', to: 'inv' }, { from: 'inv', to: 'reg' }, { from: 'inv', to: 'ac' }],
    paths: [{ label: 'Accidente mortal', nodes: ['ev', 'pa', 'tipo', 'n24', 'inv', 'reg', 'ac'] }, { label: 'Accidente no mortal', nodes: ['ev', 'pa', 'tipo', 'nmes', 'inv', 'reg', 'ac'] }],
  },
  {
    id: 'residuos', title: 'Gestión de residuos sólidos no municipales', summary: 'Del punto de generación a la disposición final.', cols: 3,
    nodes: [
      { id: 'gen', label: 'Generación', kind: 'inicio', col: 1, row: 0, detail: 'Prevenir y minimizar en la fuente.', norm: 'D. Leg. 1278' },
      { id: 'seg', label: 'Segregación por colores', kind: 'proceso', col: 1, row: 1, detail: 'Contenedores según NTP 900.058:2019.', norm: 'NTP 900.058:2019' },
      { id: 'pel', label: '¿Es peligroso?', kind: 'decision', col: 1, row: 2, detail: 'Inflamable, corrosivo, reactivo, tóxico, ecotóxico o infeccioso.' },
      { id: 'alm', label: 'Almacén central de peligrosos', kind: 'proceso', col: 0, row: 3, detail: 'Techado, señalizado, piso impermeable y contención.', norm: 'D.S. 014-2017-MINAM' },
      { id: 'val', label: 'Valorización', kind: 'proceso', col: 2, row: 3, detail: 'Reciclaje, reaprovechamiento o compostaje.' },
      { id: 'eors', label: 'EO-RS registrada', kind: 'proceso', col: 0, row: 4, detail: 'Transporte con manifiesto de residuos peligrosos.' },
      { id: 'man', label: 'Manifiesto de peligrosos', kind: 'documento', col: 1, row: 5, detail: 'Se presenta a la autoridad sectorial.', norm: 'D.S. 014-2017-MINAM', time: '15 días hábiles de cada trimestre' },
      { id: 'disp', label: 'Relleno de seguridad', kind: 'fin', col: 0, row: 5, detail: 'Disposición final de residuos peligrosos.' },
      { id: 'dec', label: 'Declaración anual (SIGERSOL)', kind: 'documento', col: 2, row: 5, detail: 'Reporte del generador no municipal.', norm: 'D.S. 014-2017-MINAM', time: 'Anual' },
    ],
    edges: [{ from: 'gen', to: 'seg' }, { from: 'seg', to: 'pel' }, { from: 'pel', to: 'alm', label: 'Sí' }, { from: 'pel', to: 'val', label: 'No' }, { from: 'alm', to: 'eors' }, { from: 'eors', to: 'disp' }, { from: 'eors', to: 'man' }, { from: 'val', to: 'dec' }],
  },
  {
    id: 'sunafil', title: 'Inspección de SUNAFIL', summary: 'Del requerimiento a la multa.', cols: 3,
    nodes: [
      { id: 'orden', label: 'Orden de inspección', kind: 'inicio', col: 1, row: 0, detail: 'Por denuncia, de oficio, operativo o accidente.', norm: 'Ley 28806' },
      { id: 'act', label: 'Actuaciones inspectivas', kind: 'proceso', col: 1, row: 1, detail: 'Visita, comparecencia y revisión documental.' },
      { id: 'inf', label: '¿Incumplimiento?', kind: 'decision', col: 1, row: 2, detail: 'Contrastado con la Ley 29783 y el RLGIT.' },
      { id: 'arch', label: 'Informe y archivo', kind: 'fin', col: 2, row: 3, detail: 'Sin infracciones.' },
      { id: 'req', label: 'Medida de requerimiento', kind: 'alerta', col: 0, row: 3, detail: 'Plazo para subsanar; en riesgo grave e inminente, paralización.', time: 'Plazo fijado por el inspector' },
      { id: 'sub', label: '¿Subsanó?', kind: 'decision', col: 0, row: 4, detail: 'La subsanación oportuna reduce la multa.' },
      { id: 'acta', label: 'Acta de infracción', kind: 'documento', col: 1, row: 5, detail: 'Inicia el procedimiento sancionador.', norm: 'D.S. 019-2006-TR (RLGIT)' },
      { id: 'multa', label: 'Multa según gravedad y trabajadores', kind: 'alerta', col: 2, row: 5, detail: 'Leve, grave o muy grave; tabla en UIT.', norm: 'D.S. 008-2020-TR' },
    ],
    edges: [{ from: 'orden', to: 'act' }, { from: 'act', to: 'inf' }, { from: 'inf', to: 'arch', label: 'No' }, { from: 'inf', to: 'req', label: 'Sí' }, { from: 'req', to: 'sub' }, { from: 'sub', to: 'arch', label: 'Sí' }, { from: 'sub', to: 'acta', label: 'No' }, { from: 'acta', to: 'multa' }],
  },
  {
    id: 'emergencia', title: 'Respuesta ante emergencias y derrames', summary: 'Secuencia de actuación de la brigada.', cols: 3,
    nodes: [
      { id: 'det', label: 'Detección', kind: 'alerta', col: 1, row: 0, detail: 'Incendio, sismo, derrame, fuga o lesionado.' },
      { id: 'alar', label: 'Dar la alarma', kind: 'proceso', col: 1, row: 1, detail: 'Pulsador, sirena o radio. Comunicar al jefe de brigada.' },
      { id: 'ctl', label: '¿Controlable con recursos internos?', kind: 'decision', col: 1, row: 2, detail: 'Según tamaño, producto (FDS) y capacitación.' },
      { id: 'brig', label: 'Brigada controla', kind: 'proceso', col: 0, row: 3, detail: 'Extintor adecuado o kit antiderrames; EPP según FDS.', norm: 'NTP 350.043-1' },
      { id: 'evac', label: 'Evacuar y llamar al 116', kind: 'alerta', col: 2, row: 3, detail: 'Rutas señalizadas hasta el punto de reunión; conteo de personal.', norm: 'Norma A.130 del RNE' },
      { id: 'amb', label: '¿Afectó suelo o agua?', kind: 'decision', col: 1, row: 4, detail: 'Contención y limpieza; residuos como peligrosos.' },
      { id: 'oefa', label: 'Reportar a la autoridad ambiental', kind: 'documento', col: 0, row: 5, detail: 'OEFA o la autoridad sectorial, en los plazos de su reglamento.' },
      { id: 'inv', label: 'Investigar y actualizar el plan', kind: 'fin', col: 2, row: 5, detail: 'Lecciones aprendidas, simulacros y reposición de equipos.', norm: 'D.S. 005-2012-TR, art. 83' },
    ],
    edges: [{ from: 'det', to: 'alar' }, { from: 'alar', to: 'ctl' }, { from: 'ctl', to: 'brig', label: 'Sí' }, { from: 'ctl', to: 'evac', label: 'No' }, { from: 'brig', to: 'amb' }, { from: 'evac', to: 'amb' }, { from: 'amb', to: 'oefa', label: 'Sí' }, { from: 'amb', to: 'inv', label: 'No' }, { from: 'oefa', to: 'inv' }],
  },
]
