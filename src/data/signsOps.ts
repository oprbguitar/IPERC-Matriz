/**
 * Etiquetas operativas imprimibles (tarjetas y stickers de control). Son formatos de gestión interna:
 * no sustituyen las señales normativas ni los registros exigidos por la Ley 29783 y el D.S. 005-2012-TR.
 */
export type OpGroup = 'Inspección periódica' | 'Estado del equipo' | 'Bloqueo y permisos' | 'Control de personal'

export interface OpField {
  key: string
  label: string
  /** 'wide' ocupa toda la fila; por defecto, media fila. */
  wide?: boolean
  type?: 'text' | 'date' | 'select'
  options?: string[]
}

export interface OpSpec {
  group: OpGroup
  short: string
  title: string
  subtitle: string
  /** Texto de la franja de estado (parte superior). */
  status: string
  color: string
  /** Color del texto sobre la franja (por defecto blanco). */
  statusFg?: string
  icon: string
  fields: OpField[]
  checks?: string[]
  months?: boolean
  quarters?: boolean
  /** Etiqueta del recuadro destacado de fecha ("Próxima inspección"). */
  due?: string
  signatures: string[]
  hole?: boolean
  note: string
}

export const QUARTERS = [
  { label: 'T1 · ENE–MAR', color: '#1B7F3B', fg: '#fff' },
  { label: 'T2 · ABR–JUN', color: '#F2C200', fg: '#111' },
  { label: 'T3 · JUL–SET', color: '#0B5CAD', fg: '#fff' },
  { label: 'T4 · OCT–DIC', color: '#E07B00', fg: '#fff' },
]

const text = (key: string, label: string, wide = false): OpField => ({ key, label, wide })
const date = (key: string, label: string): OpField => ({ key, label, type: 'date' })
const pick = (key: string, label: string, options: string[], wide = false): OpField => ({ key, label, type: 'select', options, wide })

const ENERGIAS = ['Eléctrica', 'Mecánica', 'Hidráulica', 'Neumática', 'Térmica', 'Química', 'Gravitacional', 'Múltiple']

const OPS_DATA = {
  extintor: {
    group: 'Inspección periódica', short: 'Extintor', title: 'INSPECCIÓN DE EXTINTOR', subtitle: 'NTP 350.043-1 · Norma A.130 del RNE · Inspección mensual',
    status: 'EXTINTOR · INSPECCIÓN MENSUAL', color: '#C1121C', icon: 'FireExtinguisher',
    fields: [text('codigo', 'N.º de extintor'), pick('agente', 'Agente', ['PQS ABC', 'CO₂', 'Agua presurizada', 'Espuma AFFF', 'Acetato de potasio (K)']), text('ubicacion', 'Ubicación / área', true), text('capacidad', 'Capacidad (kg / L)'), date('recarga', 'Última recarga'), text('responsable', 'Responsable')],
    checks: ['Precinto y pasador de seguridad intactos', 'Manómetro en zona verde', 'Manguera y boquilla sin daños', 'Cilindro sin abolladuras ni corrosión', 'Señal visible y acceso libre', 'Montaje a la altura reglamentaria', 'Etiqueta de recarga vigente'],
    months: true, due: 'Próxima inspección / recarga', signatures: ['Firma del inspector'],
    note: 'Marque cada mes con su inicial. Un extintor con aguja fuera de la zona verde se retira y se reemplaza.',
  },
  fueraServicio: {
    group: 'Estado del equipo', short: 'Fuera de servicio', title: 'EQUIPO FUERA DE SERVICIO', subtitle: 'No usar hasta su reparación y liberación por el responsable',
    status: 'FUERA DE SERVICIO · NO USAR', color: '#B71C1C', icon: 'OctagonX',
    fields: [text('equipo', 'Equipo / herramienta', true), text('codigo', 'N.º de equipo'), text('ubicacion', 'Ubicación / área'), text('motivo', 'Motivo del retiro', true), text('reporta', 'Reportado por'), date('fecha', 'Fecha del reporte'), text('supervisor', 'Supervisor que autoriza', true)],
    due: 'Fecha estimada de reparación', signatures: ['Firma de quien retira'], hole: true,
    note: 'Solo el supervisor o el responsable de mantenimiento puede retirar esta tarjeta tras verificar la reparación.',
  },
  loto: {
    group: 'Bloqueo y permisos', short: 'LOTO personal', title: 'BLOQUEADO · TARJETA PERSONAL LOTO', subtitle: 'Solo quien colocó el candado puede retirarlo',
    status: 'PELIGRO · NO OPERAR', color: '#B71C1C', icon: 'Lock',
    fields: [text('trabajador', 'Nombre del trabajador', true), text('dni', 'DNI'), text('empresa', 'Empresa / área'), text('equipo', 'Equipo o punto de bloqueo', true), pick('energia', 'Energía aislada', ENERGIAS), text('contacto', 'Teléfono de contacto'), date('fecha', 'Fecha de bloqueo'), text('hora', 'Hora'), text('trabajo', 'Trabajo a realizar', true)],
    checks: ['Energía aislada, disipada y verificada', 'Candado personal y tarjeta colocados', 'Prueba de arranque (energía cero) realizada'],
    due: 'Desbloqueo previsto', signatures: ['Firma del trabajador'], hole: true,
    note: 'Prohibido retirar, operar o energizar. Retiro por terceros solo con el procedimiento de bloqueo de emergencia.',
  },
  puntoBloqueo: {
    group: 'Bloqueo y permisos', short: 'Punto de bloqueo', title: 'PUNTO DE BLOQUEO DE ENERGÍA', subtitle: 'Identificación del punto de aislamiento (LOTO)',
    status: 'PUNTO DE AISLAMIENTO', color: '#E07B00', icon: 'PowerOff',
    fields: [text('punto', 'N.º de punto de bloqueo'), pick('energia', 'Tipo de energía', ENERGIAS), text('equipo', 'Equipo que controla', true), text('dispositivo', 'Dispositivo de bloqueo', true), pick('normal', 'Posición normal', ['Abierto', 'Cerrado', 'ON', 'OFF']), pick('bloqueo', 'Posición bloqueada', ['Abierto', 'Cerrado', 'ON', 'OFF']), text('ubicacion', 'Ubicación', true), text('procedimiento', 'N.º de procedimiento LOTO')],
    checks: ['Punto identificado en el diagrama de aislamiento', 'Permite colocar candado múltiple', 'Acceso libre y señalizado'],
    due: 'Próxima revisión del punto', signatures: ['Firma del responsable de mantenimiento'],
    note: 'Cada punto debe figurar en el procedimiento LOTO del equipo y revisarse al menos una vez al año.',
  },
  permisoCaliente: {
    group: 'Bloqueo y permisos', short: 'Permiso en caliente', title: 'PERMISO DE TRABAJO EN CALIENTE', subtitle: 'Soldadura · corte · esmerilado · llama abierta (ref. NFPA 51B)',
    status: 'TRABAJO EN CALIENTE AUTORIZADO', color: '#D84315', icon: 'Flame',
    fields: [text('permiso', 'N.º de permiso'), date('fecha', 'Fecha'), text('ubicacion', 'Área / ubicación', true), text('trabajo', 'Trabajo a realizar', true), text('ejecutor', 'Ejecutor'), text('vigia', 'Vigía de fuego'), text('horario', 'Hora de inicio – fin'), text('supervisor', 'Supervisor que autoriza')],
    checks: ['Área limpia de combustibles (≥ 11 m)', 'Extintor adecuado a la mano', 'Combustibles cubiertos con manta ignífuga', 'Pantallas contra chispas instaladas', 'Atmósfera medida (< 10 % del LIE)', 'Vigía de fuego designado', 'Vigilancia posterior ≥ 60 min'],
    due: 'Vence (fin del turno)', signatures: ['Firma del ejecutor', 'Firma del supervisor'],
    note: 'Válido solo para el trabajo y área indicados. Se anula ante cambios de condición o fin del turno.',
  },
  arnes: {
    group: 'Inspección periódica', short: 'Arnés / eslinga', title: 'INSPECCIÓN DE ARNÉS Y ESLINGA', subtitle: 'Antes de cada uso y mensual · D.S. 011-2019-TR',
    status: 'ARNÉS · ESLINGA · INSPECCIONADO', color: '#E07B00', icon: 'PersonStanding',
    fields: [text('codigo', 'N.º de arnés / eslinga'), text('modelo', 'Marca y modelo'), date('fabricacion', 'Fecha de fabricación'), text('usuario', 'Usuario asignado'), text('inspector', 'Inspector', true)],
    checks: ['Cintas sin cortes, quemaduras ni desgaste', 'Costuras íntegras, sin hilos sueltos', 'Hebillas y anillos D sin deformación', 'Mosquetones con cierre y seguro', 'Absorbedor de impacto sin desplegar', 'Etiquetas legibles y dentro de vida útil'],
    months: true, due: 'Próxima inspección', signatures: ['Firma del inspector competente'],
    note: 'Todo equipo que sufrió una caída se retira de servicio. La vida útil la fija el fabricante.',
  },
  escalera: {
    group: 'Inspección periódica', short: 'Escalera', title: 'INSPECCIÓN DE ESCALERA PORTÁTIL', subtitle: 'Antes de cada uso y mensual',
    status: 'ESCALERA · INSPECCIONADA', color: '#0B5CAD', icon: 'Construction',
    fields: [text('codigo', 'N.º de escalera'), pick('tipo', 'Tipo', ['Tijera', 'Extensible', 'Telescópica', 'Fija (marina)', 'Plataforma']), pick('material', 'Material', ['Aluminio', 'Fibra de vidrio', 'Madera', 'Acero']), text('carga', 'Capacidad (kg)'), text('ubicacion', 'Ubicación / área', true), text('inspector', 'Inspector'), date('fecha', 'Fecha de inspección')],
    checks: ['Peldaños firmes, sin deformaciones', 'Largueros rectos, sin fisuras', 'Zapatas antideslizantes en buen estado', 'Seguros y trabas de extensión operativos', 'Etiqueta de capacidad legible', 'Sin reparaciones improvisadas', 'Fibra de vidrio para trabajos eléctricos'],
    months: true, due: 'Próxima inspección', signatures: ['Firma del inspector'],
    note: 'Prohibido usar escaleras metálicas cerca de energía eléctrica. Retire toda escalera dañada.',
  },
  herramienta: {
    group: 'Inspección periódica', short: 'Herramienta eléctrica', title: 'INSPECCIÓN DE HERRAMIENTA ELÉCTRICA', subtitle: 'Código de color trimestral (ejemplo: defínalo en su procedimiento)',
    status: 'HERRAMIENTA INSPECCIONADA', color: '#0B5CAD', icon: 'Wrench',
    fields: [text('herramienta', 'Herramienta', true), text('codigo', 'Código / serie'), pick('trimestre', 'Trimestre (color)', ['T1 · ENE–MAR', 'T2 · ABR–JUN', 'T3 · JUL–SET', 'T4 · OCT–DIC']), text('inspector', 'Inspector'), date('fecha', 'Fecha de inspección')],
    checks: ['Cable y enchufe sin cortes ni empalmes', 'Carcasa sin fisuras; aislamiento íntegro', 'Interruptor y gatillo funcionando', 'Guardas y protectores instalados', 'Disco o broca adecuados y sin daño', 'Conexión a tierra o doble aislamiento'],
    quarters: true, due: 'Próxima inspección (fin de trimestre)', signatures: ['Firma del inspector'],
    note: 'Pegue la cinta del color del trimestre vigente. Herramienta sin cinta vigente: no usar.',
  },
  andamioOk: {
    group: 'Estado del equipo', short: 'Andamio verde', title: 'ANDAMIO APTO PARA USO', subtitle: 'Inspeccionado por persona competente · D.S. 011-2019-TR',
    status: 'ANDAMIO SEGURO · APTO PARA USO', color: '#1B7F3B', icon: 'Construction',
    fields: [text('codigo', 'N.º de andamio'), pick('tipo', 'Tipo', ['Multidireccional', 'Tubular con marcos', 'Colgante', 'Rodante (móvil)']), text('ubicacion', 'Ubicación', true), text('altura', 'Altura (m)'), text('carga', 'Carga máxima'), text('inspector', 'Inspector competente'), date('fecha', 'Fecha de inspección')],
    checks: ['Base nivelada y firme, con soleras', 'Plataformas completas y aseguradas', 'Barandas superior, intermedia y rodapié', 'Diagonales y arriostres completos', 'Acceso seguro (escalera interna)', 'Amarres según diseño del fabricante'],
    due: 'Válido hasta (reinspección)', signatures: ['Firma del inspector'], hole: true,
    note: 'Inspeccione antes de cada turno y tras viento, sismo o modificaciones. Cualquier cambio anula esta tarjeta.',
  },
  andamioPrec: {
    group: 'Estado del equipo', short: 'Andamio amarillo', title: 'ANDAMIO · USO RESTRINGIDO', subtitle: 'Uso solo bajo las condiciones indicadas',
    status: 'PRECAUCIÓN · USO RESTRINGIDO', color: '#E0A800', statusFg: '#111', icon: 'TriangleAlert',
    fields: [text('codigo', 'N.º de andamio'), text('ubicacion', 'Ubicación'), text('restriccion', 'Restricción de uso', true), text('pendiente', 'Pendiente de corregir', true), text('epp', 'EPP requerido'), text('inspector', 'Inspector competente'), date('fecha', 'Fecha de inspección')],
    checks: ['Restricción comunicada a los usuarios', 'Zona de acceso limitada y señalizada'],
    due: 'Corregir antes de', signatures: ['Firma del inspector'], hole: true,
    note: 'No sobrecargar. Si no se corrige la observación en la fecha indicada, se pasa a «NO USAR».',
  },
  andamioNo: {
    group: 'Estado del equipo', short: 'Andamio rojo', title: 'ANDAMIO · NO USAR', subtitle: 'Incompleto, en armado o con observaciones críticas',
    status: 'NO USAR · PELIGRO', color: '#B71C1C', icon: 'OctagonX',
    fields: [text('codigo', 'N.º de andamio'), text('ubicacion', 'Ubicación'), text('motivo', 'Motivo', true), text('reporta', 'Reportado por'), date('fecha', 'Fecha'), text('supervisor', 'Supervisor responsable', true)],
    due: 'Habilitación prevista', signatures: ['Firma de quien reporta'], hole: true,
    note: 'Prohibido subir. Solo el personal armador autorizado puede intervenir hasta nueva inspección.',
  },
  botiquin: {
    group: 'Inspección periódica', short: 'Botiquín', title: 'CONTROL DE BOTIQUÍN', subtitle: 'Primeros auxilios · revisión mensual y reposición',
    status: 'BOTIQUÍN · VERIFICADO', color: '#0E7A3E', icon: 'BriefcaseMedical',
    fields: [text('codigo', 'N.º de botiquín'), text('ubicacion', 'Ubicación / área'), text('responsable', 'Responsable'), date('reposicion', 'Última reposición'), text('vencidos', 'Productos vencidos o faltantes', true)],
    checks: ['Gasas, vendas y esparadrapo completos', 'Antisépticos y suero fisiológico vigentes', 'Guantes, mascarilla y tijera de punta roma', 'Sin productos vencidos', 'Señalizado y de fácil acceso', 'Lista de contenido y teléfonos de emergencia'],
    months: true, due: 'Próxima revisión', signatures: ['Firma del responsable'],
    note: 'Anote la reposición y retire de inmediato los productos vencidos.',
  },
  antiderrames: {
    group: 'Inspección periódica', short: 'Kit antiderrames', title: 'CONTROL DE KIT ANTIDERRAMES', subtitle: 'Contención y absorción · revisión mensual',
    status: 'KIT ANTIDERRAMES · COMPLETO', color: '#E07B00', icon: 'Droplets',
    fields: [text('codigo', 'N.º de kit'), pick('tipo', 'Tipo', ['Universal', 'Hidrocarburos / aceites', 'Químicos agresivos']), text('ubicacion', 'Ubicación', true), text('capacidad', 'Capacidad de absorción (L)'), text('responsable', 'Responsable')],
    checks: ['Absorbentes (almohadillas, rollos, cordones)', 'Barrera o dique de contención', 'Bolsas para residuos peligrosos', 'Guantes de nitrilo, lentes y respirador', 'Pala antichispa y cinta de peligro', 'Instrucciones y FDS a la mano'],
    months: true, due: 'Próxima inspección', signatures: ['Firma del responsable'],
    note: 'Reponga lo usado el mismo día. Los residuos del derrame se gestionan como peligrosos.',
  },
  montacargas: {
    group: 'Inspección periódica', short: 'Montacargas diario', title: 'CHECK-LIST DIARIO DE MONTACARGAS', subtitle: 'Antes de iniciar el turno · operador autorizado',
    status: 'MONTACARGAS · CHECK-LIST DIARIO', color: '#E0A800', statusFg: '#111', icon: 'Forklift',
    fields: [text('unidad', 'N.º de unidad'), pick('tipo', 'Tipo', ['Eléctrico', 'GLP', 'Diésel']), text('operador', 'Operador', true), pick('turno', 'Turno', ['Mañana', 'Tarde', 'Noche']), date('fecha', 'Fecha'), text('horometro', 'Horómetro'), text('obs', 'Observaciones', true)],
    checks: ['Frenos y freno de estacionamiento', 'Dirección y neumáticos', 'Horquillas sin fisuras ni deformación', 'Mástil, cadenas e hidráulica sin fugas', 'Luces, bocina y alarma de retroceso', 'Cinturón de seguridad y asiento', 'Extintor y batería / GLP en orden', 'Sin fugas de combustible o aceite'],
    signatures: ['Firma del operador', 'V.º B.º supervisor'],
    note: 'Si falla algún punto crítico (frenos, dirección, horquillas), la unidad no opera.',
  },
  tablero: {
    group: 'Inspección periódica', short: 'Tablero eléctrico', title: 'INSPECCIÓN DE TABLERO ELÉCTRICO', subtitle: 'Código Nacional de Electricidad · RESESATE',
    status: 'TABLERO ELÉCTRICO · INSPECCIONADO', color: '#D4A000', statusFg: '#111', icon: 'Zap',
    fields: [text('tablero', 'Tablero N.º'), pick('tension', 'Tensión', ['220 V', '380 V', '440 V', '460 V', 'Otra']), text('ubicacion', 'Ubicación', true), text('alimentado', 'Alimentado desde'), text('corriente', 'Corriente nominal (A)'), text('inspector', 'Inspector (electricista)'), date('fecha', 'Fecha de inspección')],
    checks: ['Puerta con chapa y señal de riesgo eléctrico', 'Circuitos identificados (directorio vigente)', 'Interruptores diferenciales probados', 'Conductores sin recalentamiento ni empalmes', 'Puesta a tierra verificada', 'Frente libre de materiales (1 m)', 'Sin aberturas ni tapas faltantes'],
    months: true, due: 'Próxima inspección', signatures: ['Firma del inspector'],
    note: 'Solo personal calificado abre el tablero. Intervenciones con LOTO y verificación de ausencia de tensión.',
  },
  epp: {
    group: 'Control de personal', short: 'Control de EPP', title: 'CONTROL DE ENTREGA DE EPP', subtitle: 'Registro de entrega y reposición · D.S. 005-2012-TR',
    status: 'EPP · ENTREGADO', color: '#0B5CAD', icon: 'HardHat',
    fields: [text('trabajador', 'Trabajador', true), text('dni', 'DNI'), text('cargo', 'Cargo / área'), text('epp', 'EPP entregado', true), date('entrega', 'Fecha de entrega'), text('talla', 'Talla / modelo')],
    due: 'Próxima revisión / reposición', signatures: ['Firma del trabajador (recepción)', 'Firma de quien entrega'],
    note: 'La entrega de EPP se registra y se capacita en su uso y cuidado.',
  },
  mantenimiento: {
    group: 'Estado del equipo', short: 'Mantenimiento', title: 'MANTENIMIENTO DE EQUIPO', subtitle: 'Control de mantenimiento preventivo y correctivo',
    status: 'MANTENIMIENTO REALIZADO', color: '#E07B00', icon: 'Wrench',
    fields: [text('equipo', 'Equipo', true), text('codigo', 'N.º de equipo'), pick('tipo', 'Tipo', ['Preventivo', 'Correctivo', 'Predictivo']), date('ultimo', 'Último mantenimiento'), text('tecnico', 'Técnico'), pick('estado', 'Estado', ['Operativo', 'En observación', 'Fuera de servicio'], true)],
    months: true, due: 'Próximo mantenimiento', signatures: ['Firma del técnico'],
    note: 'Conserve el registro de mantenimiento junto con el manual del fabricante.',
  },
  acceso: {
    group: 'Control de personal', short: 'Acceso autorizado', title: 'ACCESO AUTORIZADO', subtitle: 'Autorización de ingreso a áreas restringidas',
    status: 'ACCESO AUTORIZADO', color: '#0E7A3E', icon: 'UserCheck',
    fields: [text('nombre', 'Nombre', true), text('dni', 'DNI'), text('empresa', 'Empresa'), text('area', 'Área autorizada', true), text('autoriza', 'Autoriza')],
    due: 'Válido hasta', signatures: ['Firma de quien autoriza'], hole: true,
    note: 'Personal y visitantes deben portar la tarjeta de manera visible.',
  },
} satisfies Record<string, OpSpec>

export type OpKind = keyof typeof OPS_DATA
export const OPS: Record<OpKind, OpSpec> = OPS_DATA
export const OP_GROUPS: OpGroup[] = ['Inspección periódica', 'Estado del equipo', 'Bloqueo y permisos', 'Control de personal']
