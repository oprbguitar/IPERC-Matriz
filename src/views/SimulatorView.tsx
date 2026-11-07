import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { BookOpen, Check, Download, Eye, Printer, RotateCcw, TriangleAlert } from 'lucide-react'
import '../styles/simulator.css'

/* ------------------------------------------------------------------ */
/* Tipos y metodología (Anexo 3, R.M. 050-2013-TR / D.S. 005-2012-TR)  */
/* ------------------------------------------------------------------ */

type IdxKey = 'personas' | 'procedimientos' | 'capacitacion' | 'exposicion'
type EffectKey = IdxKey | 'severidad'
type Hier = 'eliminacion' | 'sustitucion' | 'ingenieria' | 'administrativo' | 'epp'
type SignFamily = 'prohibicion' | 'obligacion' | 'advertencia' | 'emergencia' | 'incendios'
type V3 = [number, number, number]
type On = (controlId: string) => boolean

interface Control {
  id: string
  hier: Hier
  label: string
  detail: string
  /** Delta aplicado sólo a los índices que este control realmente afecta (negativo = reduce). */
  effects: Partial<Record<EffectKey, number>>
  /** Por qué afecta (o no) a esos índices. */
  why: string
}

interface Hazard {
  id: string
  name: string
  hazard: string
  risk: string
  consequences: string
  base: Record<IdxKey, number>
  sev: number
  controls: Control[]
  refs: string[]
  signal: { family: SignFamily; text: string }
  anchor: V3
  depth: number
  draw: (on: On) => ReactNode
}

interface Scenario {
  id: string
  name: string
  blurb: string
  soon?: boolean
  hazards: Hazard[]
  statics: { depth: number; node: ReactNode }[]
}

const IDX: Record<IdxKey, { label: string; levels: string[] }> = {
  personas: { label: 'Personas expuestas', levels: ['1 a 3 personas', '4 a 12 personas', 'Más de 12 personas'] },
  procedimientos: {
    label: 'Procedimientos / controles existentes',
    levels: ['Existen y son satisfactorios y suficientes', 'Existen parcialmente o no son satisfactorios', 'No existen'],
  },
  capacitacion: {
    label: 'Capacitación',
    levels: ['Personal entrenado: conoce el peligro y lo previene', 'Personal parcialmente entrenado', 'Personal no entrenado'],
  },
  exposicion: {
    label: 'Exposición al riesgo',
    levels: ['Al menos una vez al año (poco frecuente)', 'Al menos una vez al mes (eventual)', 'Al menos una vez al día (permanente)'],
  },
}
const IDX_KEYS = Object.keys(IDX) as IdxKey[]
const SEV_LEVELS = ['Ligeramente dañino', 'Dañino', 'Extremadamente dañino']
const EFFECT_LABEL: Record<EffectKey, string> = {
  personas: 'Personas',
  procedimientos: 'Procedimientos',
  capacitacion: 'Capacitación',
  exposicion: 'Exposición',
  severidad: 'Severidad',
}
const HIER: Record<Hier, string> = {
  eliminacion: 'Eliminación',
  sustitucion: 'Sustitución',
  ingenieria: 'Ingeniería',
  administrativo: 'Administrativo',
  epp: 'EPP',
}
const FAMILY: Record<SignFamily, string> = {
  prohibicion: 'Prohibición',
  obligacion: 'Obligación',
  advertencia: 'Advertencia',
  emergencia: 'Emergencia',
  incendios: 'Incendios',
}
const LEVELS = [
  { max: 4, key: 'trivial', label: 'Trivial' },
  { max: 8, key: 'tolerable', label: 'Tolerable' },
  { max: 16, key: 'moderado', label: 'Moderado' },
  { max: 24, key: 'importante', label: 'Importante' },
  { max: 36, key: 'intolerable', label: 'Intolerable' },
] as const

const levelOf = (r: number) => LEVELS.find(l => r <= l.max) ?? LEVELS[LEVELS.length - 1]
const probLevel = (p: number) => (p <= 6 ? 'Baja' : p <= 9 ? 'Media' : 'Alta')

function calc(h: Hazard, applied: string[]) {
  const idx = { ...h.base }
  let sev = h.sev
  for (const c of h.controls) {
    if (!applied.includes(c.id)) continue
    for (const k of IDX_KEYS) idx[k] += c.effects[k] ?? 0
    sev += c.effects.severidad ?? 0
  }
  // Nunca por debajo de 1: el riesgo residual jamás es cero (mínimo P=4 × S=1 = 4).
  for (const k of IDX_KEYS) idx[k] = Math.min(3, Math.max(1, idx[k]))
  sev = Math.min(3, Math.max(1, sev))
  const p = IDX_KEYS.reduce((s, k) => s + idx[k], 0)
  const r = p * sev
  return { idx, sev, p, r, level: levelOf(r) }
}

/* ------------------------------------------------------------------ */
/* Geometría isométrica                                                */
/* ------------------------------------------------------------------ */

const OX = 320
const OY = 120
const P = (x: number, y: number, z = 0): [number, number] => [OX + (x - y) * 24, OY + (x + y) * 13.5 - z]
const pts = (a: V3[]) => a.map(([x, y, z]) => P(x, y, z).join(',')).join(' ')

const TONES = {
  white: 'var(--surface)',
  wood: 'color-mix(in srgb, var(--amber) 38%, var(--surface))',
  metal: 'color-mix(in srgb, var(--text-muted) 45%, var(--surface))',
  dark: 'color-mix(in srgb, var(--text) 62%, var(--surface))',
  blue: 'color-mix(in srgb, var(--blue) 55%, var(--surface))',
  green: 'color-mix(in srgb, var(--green) 60%, var(--surface))',
  red: 'color-mix(in srgb, var(--red) 65%, var(--surface))',
  cardboard: 'color-mix(in srgb, var(--amber) 62%, var(--surface))',
  yellow: 'color-mix(in srgb, var(--amber) 85%, #ffffff)',
  glass: 'color-mix(in srgb, var(--sky) 30%, var(--surface))',
} as const
type Tone = keyof typeof TONES

function Box({ x, y, z = 0, w, d, h, tone }: { x: number; y: number; z?: number; w: number; d: number; h: number; tone: Tone }) {
  return (
    <g style={{ '--c': TONES[tone] } as CSSProperties}>
      <polygon className="sf-l" points={pts([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} />
      <polygon className="sf-r" points={pts([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} />
      <polygon className="sf-t" points={pts([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} />
    </g>
  )
}

const ln = (a: V3[], cls: string) => <polyline className={cls} points={pts(a)} />

function ell(cx: number, cy: number, rx: number, ry: number, z = 0, n = 16): V3[] {
  return Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2
    return [cx + Math.cos(t) * rx, cy + Math.sin(t) * ry, z] as V3
  })
}

function Person({ x, y, z = 0, bent, hv }: { x: number; y: number; z?: number; bent?: boolean; hv?: boolean }) {
  const [sx, sy] = P(x, y, z)
  return (
    <g transform={`translate(${sx} ${sy})`}>
      <g className={hv ? 'sim-person hv' : 'sim-person'} transform={bent ? 'rotate(26)' : undefined}>
        <line x1="0" y1="0" x2="0" y2="-22" />
        <circle cx="0" cy="-30" r="5" />
      </g>
    </g>
  )
}

function WallSign({ plane, a, w, z, h, kind, label }: { plane: 'R' | 'L'; a: number; w: number; z: number; h: number; kind: SignFamily; label: string }) {
  const c: V3[] =
    plane === 'R'
      ? [[a, 0, z], [a + w, 0, z], [a + w, 0, z + h], [a, 0, z + h]]
      : [[0, a, z], [0, a + w, z], [0, a + w, z + h], [0, a, z + h]]
  const [cx, cy] = plane === 'R' ? P(a + w / 2, 0, z + h / 2) : P(0, a + w / 2, z + h / 2)
  return (
    <g>
      <polygon className={`sim-sign sg-${kind}`} points={pts(c)} />
      <text x={cx} y={cy} className="sim-sign-t">{label}</text>
    </g>
  )
}

const Bolt = ({ x, y, z }: { x: number; y: number; z: number }) => {
  const [sx, sy] = P(x, y, z)
  return <path className="sim-bolt" transform={`translate(${sx} ${sy})`} d="M0 -9 L-5 1 L-1 1 L-3 9 L5 -2 L1 -2 Z" />
}

/* ------------------------------------------------------------------ */
/* Escenario 1: Oficina administrativa                                 */
/* ------------------------------------------------------------------ */

const Desk = ({ x, y, w, d }: { x: number; y: number; w: number; d: number }) => (
  <g>
    <Box x={x + 0.1} y={y + 0.1} w={0.2} d={d - 0.2} h={24} tone="metal" />
    <Box x={x + w - 0.3} y={y + 0.1} w={0.2} d={d - 0.2} h={24} tone="metal" />
    <Box x={x} y={y} z={24} w={w} d={d} h={3} tone="wood" />
  </g>
)

const Chair = ({ x, y, seat = 14, back = 26 }: { x: number; y: number; seat?: number; back?: number }) => (
  <g>
    <Box x={x + 0.3} y={y + 0.3} w={0.2} d={0.2} h={seat} tone="dark" />
    <Box x={x} y={y} z={seat} w={0.8} d={0.8} h={3} tone="blue" />
    <Box x={x} y={y + 0.7} z={seat} w={0.8} d={0.12} h={back} tone="blue" />
  </g>
)

const officeHazards: Hazard[] = [
  {
    id: 'cable',
    name: 'Cable atravesando la zona de paso',
    hazard: 'Cable de alimentación tendido sobre el piso, cruzando el pasillo entre el escritorio y el tomacorriente de pared.',
    risk: 'Caída a un mismo nivel por tropiezo (y daño del cable por pisadas).',
    consequences: 'Contusiones, esguinces, fracturas de muñeca o cadera; daño de equipos conectados.',
    base: { personas: 2, procedimientos: 3, capacitacion: 2, exposicion: 3 },
    sev: 2,
    anchor: [3.7, 3.6, 6],
    depth: 3,
    refs: ['Ley 29783, art. 21 (jerarquía de medidas de prevención)', 'D.S. 005-2012-TR (Reglamento de la Ley 29783)', 'NTP 399.010-1:2016 (señales de seguridad)'],
    signal: { family: 'advertencia', text: 'Advertencia: «Cuidado, tropiezo / piso irregular».' },
    controls: [
      {
        id: 'cab-reubicar', hier: 'eliminacion', label: 'Reubicar el puesto o instalar un tomacorriente junto al escritorio',
        detail: 'El cable ya no cruza el pasillo.', effects: { personas: -1, exposicion: -1 },
        why: 'Al retirar el cable del paso, menos personas y con menor frecuencia se exponen al tropiezo.',
      },
      {
        id: 'cab-canaleta', hier: 'ingenieria', label: 'Canaleta cubrecable de piso',
        detail: 'Protege el cable y elimina el desnivel brusco.', effects: { exposicion: -1 },
        why: 'El cable sigue en el paso, pero el tropiezo es menos frecuente. No cambia a las personas expuestas.',
      },
      {
        id: 'cab-orden', hier: 'administrativo', label: 'Procedimiento de orden y limpieza e inspecciones semanales',
        detail: 'Regla de cableado y verificación periódica.', effects: { procedimientos: -1 },
        why: 'Mejora el procedimiento existente; no cambia la exposición física.',
      },
    ],
    draw: on => {
      const elim = on('cab-reubicar')
      const can = on('cab-canaleta')
      return (
        <g>
          {!elim && <Box x={0} y={5.4} z={6} w={0.12} d={0.4} h={10} tone="white" />}
          {elim ? (
            <>
              <Box x={3.6} y={0} z={8} w={0.35} d={0.12} h={10} tone="white" />
              {ln([[3.78, 0.15, 9], [3.78, 0.3, 1], [3.78, 1.7, 1]], 'sim-cable')}
            </>
          ) : can ? (
            <>
              <Box x={3.55} y={1.7} w={0.3} d={3.9} h={3} tone="yellow" />
              <Box x={0.12} y={5.45} w={3.43} d={0.3} h={3} tone="yellow" />
            </>
          ) : (
            ln([[3.7, 1.7, 1], [3.9, 2.8, 1], [3.5, 4, 1], [3.8, 5.6, 1], [2, 5.9, 1], [0.8, 5.5, 1], [0.15, 5.6, 1]], 'sim-cable')
          )}
        </g>
      )
    },
  },
  {
    id: 'regleta',
    name: 'Regleta sobrecargada',
    hazard: 'Calefactor, impresora y otros equipos conectados en una misma regleta, sin protección diferencial.',
    risk: 'Contacto eléctrico y sobrecalentamiento con inicio de incendio.',
    consequences: 'Quemaduras, electrocución, incendio de oficina y pérdida de información o equipos.',
    base: { personas: 2, procedimientos: 3, capacitacion: 2, exposicion: 2 },
    sev: 3,
    anchor: [5, 0.95, 24],
    depth: 7,
    refs: ['Código Nacional de Electricidad – Utilización (R.M. 037-2006-MEM/DM)', 'D.S. 005-2012-TR', 'NTP 350.043-1 (extintores portátiles)'],
    signal: { family: 'advertencia', text: 'Advertencia: «Peligro, riesgo eléctrico». Complementar con prohibición de conexiones en cadena.' },
    controls: [
      {
        id: 'reg-retirar', hier: 'eliminacion', label: 'Retirar el calefactor de la regleta (equipos de alta carga en circuito dedicado)',
        detail: 'Se elimina la carga que causa el sobrecalentamiento.', effects: { procedimientos: -1, exposicion: -1 },
        why: 'Sin la carga excesiva, la condición insegura desaparece de forma permanente.',
      },
      {
        id: 'reg-dif', hier: 'ingenieria', label: 'Interruptor diferencial y térmico + tomacorrientes suficientes',
        detail: 'Corta la corriente ante fuga o sobrecarga.', effects: { severidad: -1 },
        why: 'No evita la sobrecarga, pero limita el contacto eléctrico y el calentamiento: reduce la severidad.',
      },
      {
        id: 'reg-adm', hier: 'administrativo', label: 'Prohibir conexiones en cadena y capacitar en seguridad eléctrica',
        detail: 'Regla clara y personal informado.', effects: { capacitacion: -1, procedimientos: -1 },
        why: 'Actúa sobre la conducta y el procedimiento, no sobre la instalación.',
      },
    ],
    draw: on => {
      const elim = on('reg-retirar')
      const dif = on('reg-dif')
      return (
        <g>
          <Box x={4.4} y={0.45} w={1} d={0.3} h={3} tone="white" />
          {on('reg-adm') && <Box x={4.55} y={0.5} z={3} w={0.3} d={0.2} h={2} tone="yellow" />}
          <Box x={4.1} y={0.95} w={0.6} d={0.6} h={14} tone="metal" />
          {ln([[4.6, 0.6, 2], [4.4, 1.1, 2]], 'sim-cable')}
          {!elim && (
            <>
              <Box x={5} y={1} w={0.6} d={0.5} h={16} tone="red" />
              {ln([[5.2, 0.6, 2], [5.3, 1.1, 2]], 'sim-cable')}
              <g className="sim-flicker"><Bolt x={4.9} y={0.6} z={14} /></g>
            </>
          )}
          {dif && (
            <>
              <Box x={4.9} y={0} z={50} w={0.8} d={0.12} h={12} tone="white" />
              {(() => {
                const [sx, sy] = P(5.3, 0, 56)
                return <circle cx={sx} cy={sy} r="2.2" className="sim-led" />
              })()}
            </>
          )}
        </g>
      )
    },
  },
  {
    id: 'ergonomia',
    name: 'Silla y monitor mal regulados',
    hazard: 'Monitor elevado sobre una pila de documentos y silla baja sin soporte lumbar.',
    risk: 'Posturas forzadas del cuello y la espalda en trabajo con pantalla de visualización.',
    consequences: 'Dolor cervical y lumbar, trastornos musculoesqueléticos, fatiga y ausentismo.',
    base: { personas: 2, procedimientos: 3, capacitacion: 3, exposicion: 3 },
    sev: 2,
    anchor: [7.2, 1.9, 58],
    depth: 11,
    refs: ['R.M. 375-2008-TR (Norma Básica de Ergonomía)', 'Ley 29783, art. 21', 'D.S. 005-2012-TR'],
    signal: { family: 'obligacion', text: 'Obligación / información: cartel de pausas activas y ajuste del puesto de trabajo.' },
    controls: [
      {
        id: 'erg-silla', hier: 'sustitucion', label: 'Sustituir por silla ergonómica regulable',
        detail: 'Altura, respaldo y soporte lumbar ajustables.', effects: { procedimientos: -1 },
        why: 'Es un control existente en el puesto: cuenta como mejora de controles. No cambia el tiempo de uso.',
      },
      {
        id: 'erg-soporte', hier: 'ingenieria', label: 'Brazo o soporte regulable de monitor a la altura de los ojos',
        detail: 'Pantalla frente al usuario, sin flexión del cuello.', effects: { procedimientos: -1 },
        why: 'Corrige la postura en origen mediante el diseño del puesto.',
      },
      {
        id: 'erg-pausas', hier: 'administrativo', label: 'Pausas activas y capacitación en ergonomía',
        detail: 'Micropausas y autoajuste del puesto.', effects: { capacitacion: -1, exposicion: -1 },
        why: 'Entrena al personal y fracciona la exposición continua; el puesto mal regulado no cambia.',
      },
    ],
    draw: on => {
      const sil = on('erg-silla')
      const sop = on('erg-soporte')
      return (
        <g>
          <Box x={6.5} y={1} z={27} w={1} d={0.35} h={2} tone="metal" />
          {sop ? (
            <>
              <Box x={6.95} y={0.45} z={27} w={0.15} d={0.15} h={8} tone="metal" />
              <Box x={6.4} y={0.4} z={35} w={1.1} d={0.25} h={18} tone="dark" />
            </>
          ) : (
            <>
              <Box x={6.5} y={0.4} z={27} w={0.9} d={0.5} h={14} tone="cardboard" />
              <Box x={6.4} y={0.4} z={41} w={1.1} d={0.25} h={18} tone="dark" />
            </>
          )}
          <Chair x={6.9} y={2} seat={sil ? 15 : 8} back={sil ? 28 : 18} />
          <Person x={7.3} y={2.4} z={sil ? 18 : 11} bent={!sil || !sop} />
        </g>
      )
    },
  },
  {
    id: 'archivador',
    name: 'Archivador con cajones abiertos y objetos en altura',
    hazard: 'Cajón abierto en zona de circulación y cajas apiladas sobre el archivador.',
    risk: 'Golpes contra el cajón y caída de objetos desde altura; vuelco del mueble.',
    consequences: 'Contusiones, heridas en la cabeza o piernas, atrapamiento de manos.',
    base: { personas: 2, procedimientos: 2, capacitacion: 2, exposicion: 2 },
    sev: 2,
    anchor: [0.7, 2.8, 98],
    depth: 5,
    refs: ['Ley 29783, art. 21', 'D.S. 005-2012-TR', 'NTP 399.010-1:2016 (señales)'],
    signal: { family: 'advertencia', text: 'Advertencia: «Caída de objetos» y rótulo «Mantener cajones cerrados».' },
    controls: [
      {
        id: 'arch-altura', hier: 'eliminacion', label: 'Retirar las cajas de la parte superior y archivar en nivel bajo',
        detail: 'No quedan objetos que puedan caer.', effects: { procedimientos: -1 },
        why: 'Elimina la fuente de caída de objetos; la apertura de cajones sigue siendo posible.',
      },
      {
        id: 'arch-bloqueo', hier: 'ingenieria', label: 'Archivador con bloqueo de apertura simultánea (antivuelco)',
        detail: 'Un solo cajón abierto a la vez; cajones con cierre.', effects: { exposicion: -1 },
        why: 'El cajón abierto en el paso aparece con menor frecuencia.',
      },
      {
        id: 'arch-admin', hier: 'administrativo', label: 'Regla de «cajones cerrados» y orden semanal',
        detail: 'Hábito y supervisión del orden.', effects: { capacitacion: -1 },
        why: 'Modifica la conducta del personal; no cambia el mueble.',
      },
    ],
    draw: on => {
      const high = !on('arch-altura')
      const open = !on('arch-bloqueo')
      return (
        <g>
          <Box x={0.2} y={2.2} w={1} d={1.2} h={70} tone="metal" />
          {[17, 35, 53].map(z => <g key={z}>{ln([[1.2, 2.3, z], [1.2, 3.3, z]], 'sim-seam')}</g>)}
          {open && <Box x={1.2} y={2.3} z={34} w={0.9} d={1} h={10} tone="metal" />}
          {high && (
            <>
              <Box x={0.3} y={2.3} z={70} w={0.8} d={1} h={14} tone="cardboard" />
              <Box x={0.45} y={2.5} z={84} w={0.6} d={0.7} h={12} tone="cardboard" />
            </>
          )}
        </g>
      )
    },
  },
  {
    id: 'salida',
    name: 'Salida de emergencia obstruida por cajas',
    hazard: 'Cajas almacenadas frente a la puerta de salida de emergencia.',
    risk: 'Imposibilidad o demora de evacuación ante incendio, sismo u otra emergencia.',
    consequences: 'Atrapamiento, pánico y aglomeración; lesiones graves o fatales por humo o colapso.',
    base: { personas: 3, procedimientos: 3, capacitacion: 2, exposicion: 3 },
    sev: 3,
    anchor: [1.2, 8, 44],
    depth: 9.8,
    refs: ['A.130 RNE (Requisitos de seguridad: evacuación)', 'Ley 29783, art. 21', 'NTP 399.010-1:2016 (señales)', 'D.S. 005-2012-TR'],
    signal: { family: 'emergencia', text: 'Emergencia: «Salida de emergencia» (verde, con flecha) y rótulo «No obstruir».' },
    controls: [
      {
        id: 'sal-retirar', hier: 'eliminacion', label: 'Retirar las cajas y reubicarlas en un almacén',
        detail: 'La vía queda despejada de forma permanente.', effects: { exposicion: -1, procedimientos: -1 },
        why: 'La obstrucción deja de existir y la ruta cumple su función.',
      },
      {
        id: 'sal-puerta', hier: 'ingenieria', label: 'Barra antipánico y apertura hacia el sentido de la evacuación',
        detail: 'Apertura rápida sin llave.', effects: { procedimientos: -1 },
        why: 'Mejora el control existente de la salida; no cambia el número de personas.',
      },
      {
        id: 'sal-demarcar', hier: 'administrativo', label: 'Demarcar franja libre en el piso, inspecciones y simulacros',
        detail: 'Zona de no almacenamiento y práctica de evacuación.', effects: { capacitacion: -1, procedimientos: -1 },
        why: 'Mejora el procedimiento y el entrenamiento del personal.',
      },
    ],
    draw: on => {
      const clear = on('sal-retirar')
      return (
        <g>
          <polygon className="sim-door" points={pts([[0, 7, 0], [0, 9, 0], [0, 9, 72], [0, 7, 72]])} />
          <WallSign plane="L" a={7.3} w={1.4} z={78} h={14} kind="emergencia" label="SALIDA" />
          {on('sal-puerta') && ln([[0, 7.15, 38], [0, 8.85, 38]], 'sim-bar')}
          {on('sal-demarcar') && <polygon className="sim-strip" points={pts([[0, 6.6, 0], [2.7, 6.6, 0], [2.7, 9.4, 0], [0, 9.4, 0]])} />}
          {!clear && (
            <>
              <Box x={0.4} y={7.2} w={1.4} d={0.8} h={26} tone="cardboard" />
              <Box x={0.5} y={8.1} w={1.2} d={0.8} h={40} tone="cardboard" />
              <Box x={1.6} y={7.6} w={0.8} d={1} h={16} tone="cardboard" />
            </>
          )}
        </g>
      )
    },
  },
  {
    id: 'extintor',
    name: 'Extintor sin señalizar y obstruido',
    hazard: 'Extintor oculto tras una caja, sin señal ni ubicación visible desde el pasillo.',
    risk: 'Demora o imposibilidad de combatir un amago de incendio.',
    consequences: 'Propagación del fuego, daños materiales y lesiones por humo o quemaduras.',
    base: { personas: 2, procedimientos: 2, capacitacion: 2, exposicion: 1 },
    sev: 3,
    anchor: [9.4, 0.3, 66],
    depth: 11,
    refs: ['NTP 350.043-1 (extintores portátiles)', 'A.130 RNE', 'NTP 399.010-1:2016 (señales)', 'Ley 29783, art. 21'],
    signal: { family: 'incendios', text: 'Incendios: señal «Extintor» (rojo) con flecha y número de ubicación, visible desde el pasillo.' },
    controls: [
      {
        id: 'ext-despejar', hier: 'eliminacion', label: 'Retirar la caja y mantener el acceso despejado',
        detail: 'El extintor queda al alcance en segundos.', effects: { procedimientos: -1 },
        why: 'Restituye la función del equipo existente.',
      },
      {
        id: 'ext-senal', hier: 'administrativo', label: 'Señal de extintor visible a la altura reglamentaria',
        detail: 'Se identifica el equipo desde el pasillo.', effects: { capacitacion: -1 },
        why: 'Informa; no cambia el estado del equipo ni la carga de fuego.',
      },
      {
        id: 'ext-insp', hier: 'administrativo', label: 'Inspección mensual y capacitación en uso de extintores',
        detail: 'Registro de inspección y práctica.', effects: { procedimientos: -1, capacitacion: -1 },
        why: 'Garantiza equipo operativo y personal con conocimiento práctico.',
      },
    ],
    draw: on => (
      <g>
        <Box x={9.3} y={0.05} z={22} w={0.35} d={0.35} h={30} tone="red" />
        <Box x={9.38} y={0.13} z={52} w={0.2} d={0.2} h={5} tone="dark" />
        {on('ext-senal') && <WallSign plane="R" a={9.05} w={0.85} z={66} h={14} kind="incendios" label="EXT" />}
        {!on('ext-despejar') && <Box x={8.7} y={0.15} w={1.1} d={1.1} h={30} tone="cardboard" />}
      </g>
    ),
  },
  {
    id: 'luz',
    name: 'Iluminación deficiente y reflejos en pantalla',
    hazard: 'Luz solar directa que genera reflejos en el monitor y luminaria débil que parpadea.',
    risk: 'Fatiga visual y posturas compensatorias al trabajar con pantalla.',
    consequences: 'Cefalea, ardor ocular, disminución del rendimiento y errores de lectura.',
    base: { personas: 1, procedimientos: 3, capacitacion: 2, exposicion: 3 },
    sev: 1,
    anchor: [3, 0.2, 114],
    depth: 6.5,
    refs: ['R.M. 375-2008-TR (Norma Básica de Ergonomía)', 'EM.110 RNE (confort lumínico y térmico)', 'D.S. 005-2012-TR'],
    signal: { family: 'obligacion', text: 'Obligación / información: cartel de orientación de pantallas y uso de persianas.' },
    controls: [
      {
        id: 'luz-reubicar', hier: 'eliminacion', label: 'Reubicar la pantalla perpendicular a la ventana',
        detail: 'El reflejo directo deja de incidir en la pantalla.', effects: { exposicion: -1 },
        why: 'Se elimina el deslumbramiento en ese puesto; el nivel de iluminación general no cambia.',
      },
      {
        id: 'luz-persiana', hier: 'ingenieria', label: 'Persianas o film regulable en la ventana',
        detail: 'Control de la luz natural durante el día.', effects: { procedimientos: -1 },
        why: 'Mejora el control existente sobre el deslumbramiento.',
      },
      {
        id: 'luz-led', hier: 'sustitucion', label: 'Sustituir por luminarias LED con nivel de iluminancia adecuado',
        detail: 'Luz estable, sin parpadeo.', effects: { procedimientos: -1 },
        why: 'Reemplaza la fuente deficiente por una adecuada.',
      },
    ],
    draw: on => {
      const per = on('luz-persiana')
      const led = on('luz-led')
      const reu = on('luz-reubicar')
      const [mx, my] = P(2.6, 0.67, 36)
      const [lx, ly] = P(3, 1.45, 28)
      return (
        <g>
          <polygon className="sim-window" points={pts([[1.6, 0, 45], [4.4, 0, 45], [4.4, 0, 100], [1.6, 0, 100]])} />
          {per && [55, 65, 75, 85, 95].map(z => <g key={z}>{ln([[1.6, 0.02, z], [4.4, 0.02, z]], 'sim-blind')}</g>)}
          {!per && !reu && <polygon className="sim-beam" points={pts([[1.6, 0.1, 0], [4.4, 0.1, 0], [6, 5, 0], [3.2, 5, 0]])} />}
          <Box x={2.1} y={0.45} z={27} w={1} d={0.22} h={18} tone="dark" />
          {!per && !reu && <ellipse className="sim-glare-spot" cx={mx} cy={my} rx="13" ry="8" />}
          {ln([[3, 1.45, 110], [3, 1.45, 103]], 'sim-seam')}
          <g className={led ? undefined : 'sim-flicker'}>
            <Box x={2.3} y={1.2} z={98} w={1.4} d={0.5} h={4} tone={led ? 'white' : 'dark'} />
          </g>
          {led && <ellipse className="sim-lampglow" cx={lx} cy={ly} rx="34" ry="14" />}
        </g>
      )
    },
  },
]

const officeStatics: Scenario['statics'] = [
  { depth: 5.7, node: <Desk x={1} y={0.2} w={3} d={1.5} /> },
  { depth: 6, node: <Chair x={1.9} y={2} /> },
  { depth: 10.1, node: <Desk x={5.9} y={0.2} w={2.5} d={1.5} /> },
  { depth: 16, node: <g><Box x={5.5} y={6.5} w={0.2} d={1.5} h={22} tone="metal" /><Box x={7.8} y={6.5} w={0.2} d={1.5} h={22} tone="metal" /><Box x={5.5} y={6.5} z={22} w={2.5} d={1.5} h={3} tone="wood" /></g> },
  { depth: 19.5, node: <g><Box x={9} y={8.5} w={0.7} d={0.7} h={12} tone="wood" /><Box x={8.9} y={8.4} z={12} w={0.9} d={0.9} h={22} tone="green" /></g> },
]

/* ------------------------------------------------------------------ */
/* Escenario 2: Almacén logístico                                      */
/* ------------------------------------------------------------------ */

const warehouseHazards: Hazard[] = [
  {
    id: 'estanteria',
    name: 'Estantería sobrecargada y sin anclaje',
    hazard: 'Rack con cajas por encima de su capacidad, sin anclaje al piso ni rótulo de carga máxima.',
    risk: 'Colapso de la estantería y caída de la carga almacenada.',
    consequences: 'Aplastamiento, politraumatismos o muerte; pérdida de mercadería y paralización.',
    base: { personas: 2, procedimientos: 3, capacitacion: 2, exposicion: 2 },
    sev: 3,
    anchor: [0.8, 3.2, 108],
    depth: 7.3,
    refs: ['Ley 29783, art. 21', 'D.S. 005-2012-TR', 'R.M. 375-2008-TR (manipulación de cargas)', 'NTP 399.010-1:2016 (señales)'],
    signal: { family: 'advertencia', text: 'Advertencia: «Carga máxima por nivel» y señal «Caída de objetos».' },
    controls: [
      {
        id: 'est-carga', hier: 'eliminacion', label: 'Retirar el exceso de carga y respetar la capacidad por nivel',
        detail: 'Se baja la carga del nivel superior.', effects: { procedimientos: -1 },
        why: 'Elimina la sobrecarga, pero la estantería sigue sin anclaje.',
      },
      {
        id: 'est-anclaje', hier: 'ingenieria', label: 'Anclaje al piso, arriostres y protectores de columna',
        detail: 'Estructura estable ante impactos.', effects: { procedimientos: -1 },
        why: 'Control físico que mejora el control existente. Un colapso seguiría siendo de alta severidad.',
      },
      {
        id: 'est-rotulo', hier: 'administrativo', label: 'Rótulo de capacidad, inspección periódica y capacitación',
        detail: 'Cada nivel con carga máxima visible.', effects: { capacitacion: -1 },
        why: 'Informa y entrena; no cambia la estructura.',
      },
    ],
    draw: on => {
      const load = on('est-carga')
      const anc = on('est-anclaje')
      return (
        <g>
          {[28, 58, 88].map(z => <Box key={z} x={0.2} y={1} z={z} w={1.25} d={4.75} h={3} tone="metal" />)}
          {[1, 3.3, 5.6].map(y => (
            <g key={y}>
              <Box x={0.2} y={y} w={0.15} d={0.15} h={100} tone="blue" />
              <Box x={1.3} y={y} w={0.15} d={0.15} h={100} tone="blue" />
            </g>
          ))}
          {[28, 58, 88].map(z =>
            [0, 1].map(bay =>
              [0, 1].map(k => (
                <Box key={`${z}-${bay}-${k}`} x={0.4} y={1.2 + bay * 2.3 + k * 1.05} z={z + 3} w={0.85} d={0.95} h={z === 88 && !load ? 24 : 14} tone="cardboard" />
              )),
            ),
          )}
          {anc && (
            <>
              {[1, 3.3, 5.6].map(y => <Box key={y} x={1.1} y={y - 0.1} w={0.5} d={0.35} h={2} tone="dark" />)}
              {ln([[1.5, 1, 0], [1.5, 3.3, 58]], 'sim-brace')}
              {ln([[1.5, 3.3, 0], [1.5, 5.6, 58]], 'sim-brace')}
            </>
          )}
          {on('est-rotulo') && <Box x={1.5} y={2.1} z={38} w={0.05} d={0.9} h={9} tone="yellow" />}
        </g>
      )
    },
  },
  {
    id: 'montacargas',
    name: 'Montacargas sin separación peatonal',
    hazard: 'Tránsito de montacargas por el mismo pasillo que usan los peatones, sin barreras ni límite de velocidad.',
    risk: 'Atropello o aprisionamiento de personas por el equipo móvil.',
    consequences: 'Fracturas, aplastamiento, muerte; daños a la carga y a la estructura.',
    base: { personas: 2, procedimientos: 3, capacitacion: 2, exposicion: 3 },
    sev: 3,
    anchor: [5.5, 4.6, 36],
    depth: 11.5,
    refs: ['Ley 29783, art. 21', 'D.S. 005-2012-TR', 'NTP 399.010-1:2016 (señales)'],
    signal: { family: 'prohibicion', text: 'Prohibición: «Prohibido el paso de peatones» en vía de montacargas; advertencia de «Tránsito de montacargas».' },
    controls: [
      {
        id: 'mon-barrera', hier: 'ingenieria', label: 'Vía peatonal separada con barandas y bolardos',
        detail: 'Los peatones circulan por carril propio.', effects: { personas: -1, exposicion: -1 },
        why: 'Reduce a quienes comparten la vía del equipo y el tiempo de contacto.',
      },
      {
        id: 'mon-adm', hier: 'administrativo', label: 'Límite de velocidad, licencia interna y capacitación de operadores',
        detail: 'Procedimiento de tránsito y entrenamiento.', effects: { procedimientos: -1, capacitacion: -1 },
        why: 'Mejora el procedimiento y el entrenamiento; el equipo sigue en circulación.',
      },
      {
        id: 'mon-epp', hier: 'epp', label: 'Chaleco reflectivo y casco',
        detail: 'Mejora la visibilidad del peatón.', effects: {},
        why: 'No cambia ningún índice por sí solo: es complementario y no sustituye la separación física.',
      },
    ],
    draw: on => {
      const bar = on('mon-barrera')
      return (
        <g>
          {ln([[9, 4.9, 0], [2.2, 4.9, 0]], 'sim-path')}
          {bar && <polygon className="sim-lane" points={pts([[2, 6, 0], [7.6, 6, 0], [7.6, 6.7, 0], [2, 6.7, 0]])} />}
          {bar && [2.2, 3.5, 4.8, 6.1, 7.4].map(x => <Box key={x} x={x} y={5.8} w={0.22} d={0.22} h={16} tone="yellow" />)}
          <Box x={5} y={3.7} w={0.6} d={0.15} h={6} tone="dark" />
          <Box x={5} y={5.9} w={0.6} d={0.15} h={6} tone="dark" />
          <Box x={5} y={3.8} z={2} w={1.5} d={2.4} h={10} tone="yellow" />
          <Box x={5.2} y={4.1} z={12} w={1} d={1.7} h={16} tone="dark" />
          <Box x={4.55} y={3.9} w={0.15} d={2} h={38} tone="metal" />
          <Box x={3.7} y={4.2} z={2} w={0.9} d={0.2} h={2} tone="metal" />
          <Box x={3.7} y={5.2} z={2} w={0.9} d={0.2} h={2} tone="metal" />
          {on('mon-adm') && <WallSign plane="R" a={5.9} w={0.8} z={80} h={14} kind="prohibicion" label="10" />}
          <Person x={bar ? 4.4 : 3.3} y={bar ? 6.35 : 4.3} hv={on('mon-epp')} />
        </g>
      )
    },
  },
  {
    id: 'manual',
    name: 'Manipulación manual de cajas pesadas',
    hazard: 'Levantamiento manual de cajas de unos 35 kg con flexión de la espalda y sin ayudas mecánicas.',
    risk: 'Sobreesfuerzo y posturas forzadas por manipulación manual de cargas.',
    consequences: 'Lumbalgia, hernias, lesiones musculoesqueléticas crónicas y descanso médico.',
    base: { personas: 2, procedimientos: 2, capacitacion: 2, exposicion: 3 },
    sev: 2,
    anchor: [7.5, 2.6, 52],
    depth: 11,
    refs: ['R.M. 375-2008-TR (Norma Básica de Ergonomía; manipulación de cargas)', 'Ley 29783, art. 21', 'D.S. 005-2012-TR'],
    signal: { family: 'advertencia', text: 'Advertencia: «Carga pesada». Obligación: uso de ayudas mecánicas y levantamiento en equipo.' },
    controls: [
      {
        id: 'man-ayuda', hier: 'ingenieria', label: 'Transpaleta o carretilla para el traslado',
        detail: 'La carga se mueve con ayuda mecánica.', effects: { procedimientos: -1, exposicion: -1 },
        why: 'Reduce el esfuerzo físico y la frecuencia de levantamientos manuales.',
      },
      {
        id: 'man-adm', hier: 'administrativo', label: 'Límite de peso, levantamiento en equipo y capacitación en técnica',
        detail: 'Procedimiento de manipulación segura.', effects: { capacitacion: -1, procedimientos: -1 },
        why: 'Entrena y fija reglas; la carga sigue siendo pesada.',
      },
      {
        id: 'man-epp', hier: 'epp', label: 'Guantes antideslizantes y calzado de seguridad',
        detail: 'Agarre firme y protección de pies.', effects: {},
        why: 'No reduce el esfuerzo lumbar: complementario. Una faja lumbar no sustituye la ayuda mecánica.',
      },
    ],
    draw: on => {
      const aid = on('man-ayuda')
      const [lx, ly] = P(7.9, 2.9, 40)
      return (
        <g>
          <Box x={8} y={0.9} w={1.2} d={1.2} h={3} tone="wood" />
          <Box x={8.05} y={0.95} z={3} w={1.1} d={1.1} h={20} tone="cardboard" />
          {aid ? (
            <>
              <Box x={7} y={2.1} w={1.9} d={0.55} h={4} tone="red" />
              <Box x={7.1} y={2.05} z={4} w={0.9} d={0.65} h={14} tone="cardboard" />
              {ln([[6.9, 2.4, 4], [6.4, 2.4, 30]], 'sim-seam')}
              <Person x={6.2} y={2.4} />
            </>
          ) : (
            <>
              <Box x={7.2} y={2.2} z={8} w={0.8} d={0.7} h={14} tone="cardboard" />
              <Person x={6.8} y={2.55} bent />
              <rect x={lx - 20} y={ly - 9} width="40" height="14" rx="4" className="sim-weight" />
              <text x={lx} y={ly - 1} className="sim-weight-t">35 kg</text>
            </>
          )}
        </g>
      )
    },
  },
  {
    id: 'derrame',
    name: 'Derrame en el piso',
    hazard: 'Líquido derramado de un tambor con fuga, sin señalización ni material absorbente.',
    risk: 'Caída por resbalón al mismo nivel; contacto con el producto.',
    consequences: 'Fracturas, contusiones, golpes en la cabeza; irritación si el producto es químico.',
    base: { personas: 2, procedimientos: 2, capacitacion: 2, exposicion: 2 },
    sev: 2,
    anchor: [5.2, 8.3, 8],
    depth: 16,
    refs: ['Ley 29783, art. 21', 'D.S. 005-2012-TR', 'NTP 399.010-1:2016 (señales)'],
    signal: { family: 'advertencia', text: 'Advertencia: «Piso mojado / superficie resbaladiza».' },
    controls: [
      {
        id: 'der-fuente', hier: 'eliminacion', label: 'Reparar la fuga del tambor y limpiar el derrame',
        detail: 'Se elimina la fuente del líquido.', effects: { exposicion: -1, procedimientos: -1 },
        why: 'Sin fuga ni charco, el peligro desaparece mientras no reaparezca.',
      },
      {
        id: 'der-kit', hier: 'ingenieria', label: 'Kit antiderrames y bandeja de contención',
        detail: 'Contención rápida y absorción.', effects: { procedimientos: -1 },
        why: 'Mejora la respuesta existente ante el derrame.',
      },
      {
        id: 'der-senal', hier: 'administrativo', label: 'Señal de piso mojado y procedimiento de limpieza inmediata',
        detail: 'Aviso y respuesta ordenada.', effects: { capacitacion: -1 },
        why: 'Advierte y entrena; la superficie sigue resbaladiza hasta limpiarla.',
      },
      {
        id: 'der-epp', hier: 'epp', label: 'Calzado antideslizante',
        detail: 'Mejor agarre al caminar.', effects: {},
        why: 'No elimina el resbalón: control complementario sin cambio de índices.',
      },
    ],
    draw: on => {
      const gone = on('der-fuente')
      const kit = on('der-kit')
      const [sx, sy] = P(4.7, 7.6, 0)
      return (
        <g>
          <Box x={6.3} y={8.1} w={0.8} d={0.8} h={24} tone="blue" />
          {!gone && <polygon className="sim-liquid" points={pts(ell(5.2, 8.4, kit ? 0.6 : 1.2, kit ? 0.45 : 0.9))} />}
          {!gone && ln([[6.3, 8.5, 6], [5.9, 8.5, 2]], 'sim-drip')}
          {kit && (
            <>
              <Box x={3.4} y={8.6} w={0.6} d={0.6} h={12} tone="red" />
              <Box x={4.3} y={8.1} w={0.5} d={0.3} h={1} tone="metal" />
              <Box x={4.3} y={8.6} w={0.5} d={0.3} h={1} tone="metal" />
            </>
          )}
          {on('der-senal') && (
            <g transform={`translate(${sx} ${sy})`}>
              <path className="sim-aframe" d="M-9 0 L0 -22 L9 0 Z" />
              <text className="sim-sign-t" x="0" y="-7">!</text>
            </g>
          )}
        </g>
      )
    },
  },
  {
    id: 'apilamiento',
    name: 'Apilamiento inestable',
    hazard: 'Seis niveles de cajas desalineadas sobre una parihuela, sin film ni esquineros.',
    risk: 'Volcadura de la pila y caída de las cajas sobre las personas.',
    consequences: 'Golpes, contusiones, fracturas; daño de la mercadería.',
    base: { personas: 2, procedimientos: 3, capacitacion: 2, exposicion: 2 },
    sev: 2,
    anchor: [8.6, 7.8, 96],
    depth: 18,
    refs: ['Ley 29783, art. 21', 'D.S. 005-2012-TR', 'R.M. 375-2008-TR (manipulación de cargas)'],
    signal: { family: 'advertencia', text: 'Advertencia: «Caída de objetos» y rótulo de altura máxima de estiba.' },
    controls: [
      {
        id: 'api-altura', hier: 'eliminacion', label: 'Reducir la altura de estiba a 4 niveles',
        detail: 'Menos carga en altura.', effects: { procedimientos: -1 },
        why: 'Elimina los niveles más inestables, pero la pila sigue sin amarre.',
      },
      {
        id: 'api-film', hier: 'ingenieria', label: 'Alinear las cajas, esquineros y film estirable',
        detail: 'La pila se comporta como una unidad.', effects: { procedimientos: -1 },
        why: 'Mejora el control físico de la carga.',
      },
      {
        id: 'api-proc', hier: 'administrativo', label: 'Procedimiento de estiba y capacitación',
        detail: 'Criterios de altura, orden y peso.', effects: { capacitacion: -1 },
        why: 'Entrena al personal; no modifica la pila existente por sí solo.',
      },
    ],
    draw: on => {
      const levels = on('api-altura') ? 4 : 6
      const tidy = on('api-film')
      const off = [0, 0.12, -0.1, 0.18, -0.16, 0.22]
      return (
        <g>
          <Box x={8} y={7.2} w={1.3} d={1.3} h={3} tone="wood" />
          {Array.from({ length: levels }, (_, i) => (
            <Box key={i} x={8.05 + (tidy ? 0 : off[i])} y={7.25 + (tidy ? 0 : off[(i + 2) % 6])} z={3 + i * 13} w={1.15} d={1.15} h={13} tone="cardboard" />
          ))}
          {tidy && [10, 24, 38].map(z => <g key={z}>{ln([[8.05, 8.4, z], [9.2, 8.4, z]], 'sim-wrap')}{ln([[9.2, 7.25, z], [9.2, 8.4, z]], 'sim-wrap')}</g>)}
        </g>
      )
    },
  },
  {
    id: 'senalizacion',
    name: 'Falta de señalización',
    hazard: 'Pasillos sin demarcar y sin señales de seguridad, evacuación o uso obligatorio de EPP.',
    risk: 'Desconocimiento de rutas y de obligaciones; circulación desordenada y retraso en la evacuación.',
    consequences: 'Accidentes por conducta insegura, evacuación deficiente, incumplimiento normativo.',
    base: { personas: 3, procedimientos: 3, capacitacion: 2, exposicion: 3 },
    sev: 2,
    anchor: [3.5, 0.2, 98],
    depth: 1,
    refs: ['NTP 399.010-1:2016 (señales de seguridad)', 'A.130 RNE (evacuación)', 'Ley 29783, art. 21', 'D.S. 005-2012-TR'],
    signal: { family: 'emergencia', text: 'Conjunto: emergencia (salida), incendios (extintor), obligación (EPP) y prohibición según la zona.' },
    controls: [
      {
        id: 'sen-evac', hier: 'administrativo', label: 'Señales de evacuación y de extintor',
        detail: 'Rutas y equipos identificados.', effects: { procedimientos: -1 },
        why: 'Señalizar es un control administrativo: orienta, pero no elimina el peligro.',
      },
      {
        id: 'sen-epp', hier: 'administrativo', label: 'Señales de obligación y prohibición por zona',
        detail: 'Uso de EPP y conductas prohibidas visibles.', effects: { capacitacion: -1 },
        why: 'Refuerza el conocimiento del personal sobre las reglas de la zona.',
      },
      {
        id: 'sen-piso', hier: 'ingenieria', label: 'Demarcación de pasillos con pintura o bandas',
        detail: 'Separación visible entre vías y áreas de almacenamiento.', effects: { exposicion: -1, personas: -1 },
        why: 'Ordena la circulación y reduce el cruce de personas con las áreas de riesgo.',
      },
    ],
    draw: on => (
      <g>
        {!on('sen-evac') && !on('sen-epp') && <rect className="sim-ghost" x={P(3.5, 0, 70)[0] - 18} y={P(3.5, 0, 70)[1] - 12} width="36" height="24" rx="3" />}
        {on('sen-evac') && (
          <>
            <WallSign plane="R" a={3.8} w={0.9} z={70} h={14} kind="emergencia" label="SALIDA" />
            <WallSign plane="R" a={4.9} w={0.8} z={70} h={14} kind="incendios" label="EXT" />
          </>
        )}
        {on('sen-epp') && (
          <>
            <WallSign plane="R" a={1.6} w={0.9} z={70} h={14} kind="obligacion" label="EPP" />
            <WallSign plane="R" a={2.7} w={0.9} z={70} h={14} kind="prohibicion" label="NO" />
          </>
        )}
        {on('sen-piso') && (
          <>
            {ln([[1.8, 3.4, 0], [9.5, 3.4, 0]], 'sim-line-y')}
            {ln([[1.8, 7.4, 0], [9.5, 7.4, 0]], 'sim-line-y')}
          </>
        )}
      </g>
    ),
  },
]

const warehouseStatics: Scenario['statics'] = [
  { depth: 1, node: <g><polygon className="sim-dock" points={pts([[6.8, 0, 0], [9.6, 0, 0], [9.6, 0, 72], [6.8, 0, 72]])} />{[14, 28, 42, 56].map(z => <g key={z}>{ln([[6.8, 0, z], [9.6, 0, z]], 'sim-blind')}</g>)}</g> },
  { depth: 12, node: <g><Box x={1.6} y={8.4} w={1.2} d={1.2} h={3} tone="wood" /><Box x={1.65} y={8.45} z={3} w={1.1} d={1.1} h={14} tone="cardboard" /></g> },
]

/* ------------------------------------------------------------------ */
/* Escenarios                                                          */
/* ------------------------------------------------------------------ */

const SCENARIOS: Scenario[] = [
  {
    id: 'oficina',
    name: 'Oficina administrativa',
    blurb: 'Siete peligros típicos de una oficina: ergonomía, riesgo eléctrico, evacuación e incendios.',
    hazards: officeHazards,
    statics: officeStatics,
  },
  {
    id: 'almacen',
    name: 'Almacén logístico',
    blurb: 'Seis peligros de almacenamiento: racks, equipos móviles, cargas y señalización.',
    hazards: warehouseHazards,
    statics: warehouseStatics,
  },
  {
    id: 'planta',
    name: 'Planta de manufactura',
    blurb: 'Maquinaria, atrapamiento, ruido y energías peligrosas.',
    soon: true,
    hazards: [],
    statics: [],
  },
]

/* ------------------------------------------------------------------ */
/* Reporte                                                             */
/* ------------------------------------------------------------------ */

const DISCLAIMER =
  'Escenario educativo con datos ficticios. No reemplaza el IPERC real ni la evaluación en campo por personal competente.'
const RESIDUAL_NOTE = 'Residual proyectado: debe verificarse en campo.'
const METHOD_LINE =
  'Probabilidad (P) = personas expuestas + procedimientos + capacitación + exposición (1 a 3 cada uno). Riesgo = P × Severidad (1 a 3). Trivial 4 · Tolerable 5-8 · Moderado 9-16 · Importante 17-24 · Intolerable 25-36 (Anexo 3, R.M. 050-2013-TR / D.S. 005-2012-TR).'

function buildMarkdown(sc: Scenario, applied: Record<string, string[]>, seen: string[]) {
  const date = new Date().toLocaleDateString('es-PE')
  const L: string[] = []
  L.push(`# Reporte del simulador de ambientes: ${sc.name}`, '', `Fecha: ${date}`, '', `> ${DISCLAIMER}`, '')
  L.push(`Peligros identificados: ${sc.hazards.filter(h => seen.includes(h.id)).length} de ${sc.hazards.length}`, '')
  L.push('## Metodología', '', METHOD_LINE, '')
  L.push('## Resumen inicial vs. residual', '', '| N.º | Peligro | Riesgo inicial | Controles aplicados | Riesgo residual |', '|---|---|---|---|---|')
  sc.hazards.forEach((h, i) => {
    if (!seen.includes(h.id)) {
      L.push(`| ${i + 1} | ${h.name} | sin identificar | - | - |`)
      return
    }
    const a = applied[h.id] ?? []
    const ini = calc(h, [])
    const res = calc(h, a)
    L.push(`| ${i + 1} | ${h.name} | ${ini.r} (${ini.level.label}) | ${a.length} | ${res.r} (${res.level.label}) |`)
  })
  L.push('', `*${RESIDUAL_NOTE}*`, '', '## Detalle por peligro', '')
  sc.hazards.forEach((h, i) => {
    if (!seen.includes(h.id)) return
    const a = applied[h.id] ?? []
    const ini = calc(h, [])
    const res = calc(h, a)
    L.push(`### ${i + 1}. ${h.name}`, '', `- Peligro: ${h.hazard}`, `- Riesgo: ${h.risk}`, `- Consecuencias: ${h.consequences}`)
    L.push(`- Evaluación inicial: P = ${IDX_KEYS.map(k => ini.idx[k]).join(' + ')} = ${ini.p} (${probLevel(ini.p)}); S = ${ini.sev}; riesgo = ${ini.r} (${ini.level.label})`)
    L.push(`- Evaluación residual: P = ${IDX_KEYS.map(k => res.idx[k]).join(' + ')} = ${res.p}; S = ${res.sev}; riesgo = ${res.r} (${res.level.label})`)
    L.push('- Controles aplicados:')
    if (a.length === 0) L.push('  - Ninguno')
    h.controls
      .filter(c => a.includes(c.id))
      .forEach(c => {
        const eff = Object.entries(c.effects).map(([k, v]) => `${EFFECT_LABEL[k as EffectKey]} ${v}`).join(', ') || 'sin cambio de índices'
        L.push(`  - [${HIER[c.hier]}] ${c.label} (${eff})`)
      })
    L.push(`- Señal recomendada (${FAMILY[h.signal.family]}): ${h.signal.text}`)
    L.push(`- Referencias: ${h.refs.join('; ')}`, '')
  })
  L.push('---', '', `*${RESIDUAL_NOTE}* ${DISCLAIMER}`, '')
  return L.join('\n')
}

/* ------------------------------------------------------------------ */
/* Vista                                                               */
/* ------------------------------------------------------------------ */

function LevelBadge({ r }: { r: number }) {
  const l = levelOf(r)
  return <span className={`sim-level lv-${l.key}`}>{r} · {l.label}</span>
}

export default function SimulatorView({ onOpenVisor }: { onOpenVisor?: () => void }) {
  const [scId, setScId] = useState('oficina')
  const [applied, setApplied] = useState<Record<string, string[]>>({})
  const [seen, setSeen] = useState<string[]>([])
  const [sel, setSel] = useState<string | null>(null)
  const panelRef = useRef<HTMLElement>(null)

  const sc = SCENARIOS.find(s => s.id === scId) ?? SCENARIOS[0]
  const hz = sc.hazards.find(h => h.id === sel) ?? null

  useEffect(() => {
    if (!sel || window.innerWidth >= 900) return
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    panelRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' })
  }, [sel])

  const choose = (id: string) => {
    setSel(id)
    setSeen(s => (s.includes(id) ? s : [...s, id]))
  }
  const toggle = (hid: string, cid: string) =>
    setApplied(a => {
      const cur = a[hid] ?? []
      return { ...a, [hid]: cur.includes(cid) ? cur.filter(x => x !== cid) : [...cur, cid] }
    })
  const reset = () => {
    setApplied({})
    setSeen([])
    setSel(null)
  }
  const changeScenario = (id: string) => {
    setScId(id)
    setSel(null)
  }

  const identified = sc.hazards.filter(h => seen.includes(h.id)).length

  const download = () => {
    const blob = new Blob([buildMarkdown(sc, applied, seen)], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reporte-simulador-${sc.id}.md`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const items = [
    ...sc.statics.map((s, i) => ({ key: `s${i}`, depth: s.depth, node: s.node })),
    ...sc.hazards.map(h => {
      const ids = applied[h.id] ?? []
      return { key: h.id, depth: h.depth, node: h.draw(cid => ids.includes(cid)) }
    }),
  ].sort((a, b) => a.depth - b.depth)

  const summaryRows = sc.hazards.map((h, i) => {
    const known = seen.includes(h.id)
    const a = applied[h.id] ?? []
    return { h, i, known, n: a.length, ini: calc(h, []), res: calc(h, a) }
  })

  const summaryTable = (
    <div className="sim-table-wrap">
      <table className="sim-table">
        <thead>
          <tr><th>N.º</th><th>Peligro</th><th>Inicial</th><th>Controles</th><th>Residual</th></tr>
        </thead>
        <tbody>
          {summaryRows.map(({ h, i, known, n, ini, res }) => (
            <tr key={h.id}>
              <td>{i + 1}</td>
              <td>{known ? h.name : 'Sin identificar'}</td>
              <td>{known ? <LevelBadge r={ini.r} /> : '—'}</td>
              <td>{known ? n : '—'}</td>
              <td>{known ? <LevelBadge r={res.r} /> : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  const hApplied = hz ? applied[hz.id] ?? [] : []
  const ini = hz ? calc(hz, []) : null
  const res = hz ? calc(hz, hApplied) : null

  return (
    <div className="view-page simulator">
      <header className="page-head">
        <div>
          <h1>Simulador de ambientes</h1>
          <p>Recorre un ambiente de trabajo en vista isométrica, identifica los peligros, evalúa el riesgo inicial y prueba controles según la jerarquía de prevención.</p>
        </div>
      </header>

      <div className="sim-notice" role="note">
        <TriangleAlert size={16} aria-hidden="true" />
        <span>{DISCLAIMER}</span>
      </div>

      <div className="tab-switch" role="tablist" aria-label="Escenarios">
        {SCENARIOS.map(s => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={s.id === scId}
            className={s.id === scId ? 'active' : ''}
            disabled={s.soon}
            title={s.soon ? 'Próximamente' : s.blurb}
            onClick={() => changeScenario(s.id)}
          >
            {s.name}
            {s.soon && <small className="sim-soon">Próximamente</small>}
          </button>
        ))}
      </div>

      <p className="sim-blurb">{sc.blurb}</p>

      <div className="sim-toolbar">
        <div className="sim-progress">
          <strong>{identified} de {sc.hazards.length} peligros identificados</strong>
          <progress value={identified} max={sc.hazards.length} aria-label="Progreso de identificación de peligros" />
        </div>
        <div className="sim-actions">
          <button type="button" className="sim-btn" onClick={download}><Download size={15} aria-hidden="true" /> Descargar reporte</button>
          <button type="button" className="sim-btn" onClick={() => window.print()}><Printer size={15} aria-hidden="true" /> Imprimir / PDF</button>
          <button type="button" className="sim-btn ghost" onClick={reset}><RotateCcw size={15} aria-hidden="true" /> Reiniciar</button>
          {onOpenVisor && (
            <button type="button" className="sim-btn ghost" onClick={onOpenVisor}><BookOpen size={15} aria-hidden="true" /> Ver normas en el Visor SSOMA</button>
          )}
        </div>
      </div>

      <div className="sim-layout">
        <div className="sim-scene-col">
          <div className="sim-scene">
            <svg viewBox="0 0 640 420" role="group" aria-label={`Ambiente isométrico: ${sc.name}`}>
              <polygon className="sim-floor" points={pts([[0, 0, 0], [10, 0, 0], [10, 10, 0], [0, 10, 0]])} />
              {Array.from({ length: 9 }, (_, i) => (
                <g key={i}>
                  {ln([[i + 1, 0, 0], [i + 1, 10, 0]], 'sim-grid')}
                  {ln([[0, i + 1, 0], [10, i + 1, 0]], 'sim-grid')}
                </g>
              ))}
              <polygon className="sim-wall-l" points={pts([[0, 0, 0], [0, 10, 0], [0, 10, 110], [0, 0, 110]])} />
              <polygon className="sim-wall-r" points={pts([[0, 0, 0], [10, 0, 0], [10, 0, 110], [0, 0, 110]])} />
              {items.map(it => <g key={it.key}>{it.node}</g>)}
              {sc.hazards.map((h, i) => {
                const [mx, my] = P(...h.anchor)
                const a = applied[h.id] ?? []
                const lv = calc(h, a).level.key
                const done = a.length > 0
                return (
                  <g
                    key={h.id}
                    className={`sim-marker lv-${lv}${sel === h.id ? ' sel' : ''}`}
                    transform={`translate(${mx} ${my})`}
                    role="button"
                    tabIndex={0}
                    aria-label={`Peligro ${i + 1}: ${h.name}. ${seen.includes(h.id) ? 'Identificado' : 'Sin identificar'}.`}
                    aria-pressed={sel === h.id}
                    onClick={() => choose(h.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        choose(h.id)
                      }
                    }}
                  >
                    <circle className="pulse" r="12" />
                    <circle className="hit" r="20" />
                    <circle className="core" r="11" />
                    <text className="num" y="0.5">{done ? '✓' : i + 1}</text>
                  </g>
                )
              })}
            </svg>
          </div>
          <p className="sim-hint"><Eye size={14} aria-hidden="true" /> Toca o selecciona un marcador pulsante para evaluar el peligro. El color del marcador indica el nivel de riesgo actual.</p>

          <ul className="sim-list" aria-label="Lista de peligros">
            {sc.hazards.map((h, i) => (
              <li key={h.id}>
                <button type="button" className={sel === h.id ? 'on' : ''} onClick={() => choose(h.id)}>
                  <span className={`sim-dot lv-${calc(h, applied[h.id] ?? []).level.key}`}>{i + 1}</span>
                  <span>{h.name}</span>
                  {seen.includes(h.id) && <Check size={14} aria-label="Identificado" />}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <aside className="sim-panel" ref={panelRef} aria-live="polite">
          {!hz || !ini || !res ? (
            <div className="sim-empty">
              <h2>Selecciona un peligro</h2>
              <p>Al elegir un marcador verás el peligro, el riesgo, las consecuencias, la evaluación IPERC inicial y los controles disponibles.</p>
              <MethodBlock />
            </div>
          ) : (
            <div className="sim-detail">
              <h2>{hz.name}</h2>
              <dl className="sim-dl">
                <dt>Peligro</dt><dd>{hz.hazard}</dd>
                <dt>Riesgo</dt><dd>{hz.risk}</dd>
                <dt>Consecuencias</dt><dd>{hz.consequences}</dd>
              </dl>

              <h3>Evaluación IPERC inicial</h3>
              <IndexTable cur={ini} base={ini} />
              <p className="sim-formula">
                P = {IDX_KEYS.map(k => ini.idx[k]).join(' + ')} = <b>{ini.p}</b> ({probLevel(ini.p)}) · Riesgo = {ini.p} × {ini.sev} = <b>{ini.r}</b> <LevelBadge r={ini.r} />
              </p>

              <h3>Controles (elige y combina)</h3>
              <ul className="sim-controls">
                {hz.controls.map(c => {
                  const on = hApplied.includes(c.id)
                  const eff = Object.entries(c.effects)
                  return (
                    <li key={c.id} className={on ? 'on' : ''}>
                      <button type="button" aria-pressed={on} onClick={() => toggle(hz.id, c.id)}>
                        <span className={`sim-hier h-${c.hier}`}>{HIER[c.hier]}</span>
                        <span className="sim-ctl-label">{c.label}</span>
                        <span className="sim-ctl-detail">{c.detail}</span>
                        <span className="sim-effects">
                          {eff.length === 0 ? <em>Sin cambio de índices (complementario)</em> : eff.map(([k, v]) => <em key={k}>{EFFECT_LABEL[k as EffectKey]} {v}</em>)}
                        </span>
                      </button>
                      <small className="sim-why">{c.why}</small>
                    </li>
                  )
                })}
              </ul>

              <h3>Riesgo residual proyectado</h3>
              <IndexTable cur={res} base={ini} />
              <p className="sim-formula">
                P = {IDX_KEYS.map(k => res.idx[k]).join(' + ')} = <b>{res.p}</b> ({probLevel(res.p)}) · Riesgo = {res.p} × {res.sev} = <b>{res.r}</b> <LevelBadge r={res.r} />
              </p>
              <p className="sim-warn" role="note"><TriangleAlert size={14} aria-hidden="true" /> {RESIDUAL_NOTE} El riesgo nunca es cero: siempre queda un residual.</p>

              <h3>Señal recomendada</h3>
              <p><span className={`sim-fam sg-${hz.signal.family}`}>{FAMILY[hz.signal.family]}</span> {hz.signal.text}</p>

              <h3>Referencias normativas</h3>
              <ul className="sim-refs">{hz.refs.map(r => <li key={r}>{r}</li>)}</ul>
              <MethodBlock />
            </div>
          )}
        </aside>
      </div>

      <section className="sim-summary" aria-label="Resumen inicial vs. residual">
        <h2>Resumen inicial vs. residual</h2>
        {summaryTable}
        <p className="sim-warn"><TriangleAlert size={14} aria-hidden="true" /> {RESIDUAL_NOTE}</p>
      </section>

      <section className="sim-report" aria-hidden="true">
        <h1>Reporte del simulador de ambientes: {sc.name}</h1>
        <p>Fecha: {new Date().toLocaleDateString('es-PE')} · {identified} de {sc.hazards.length} peligros identificados</p>
        <p><b>{DISCLAIMER}</b></p>
        <p>{METHOD_LINE}</p>
        {summaryTable}
        <p>{RESIDUAL_NOTE}</p>
        {summaryRows.filter(r => r.known).map(({ h, i, ini: a0, res: a1 }) => (
          <article key={h.id}>
            <h3>{i + 1}. {h.name}</h3>
            <p>{h.hazard} Riesgo: {h.risk}</p>
            <p>Inicial: P {a0.p} × S {a0.sev} = {a0.r} ({a0.level.label}). Residual: P {a1.p} × S {a1.sev} = {a1.r} ({a1.level.label}).</p>
            <p>Controles: {h.controls.filter(c => (applied[h.id] ?? []).includes(c.id)).map(c => `[${HIER[c.hier]}] ${c.label}`).join('; ') || 'ninguno'}</p>
            <p>Señal ({FAMILY[h.signal.family]}): {h.signal.text}</p>
            <p>Referencias: {h.refs.join('; ')}</p>
          </article>
        ))}
      </section>
    </div>
  )
}

function IndexTable({ cur, base }: { cur: ReturnType<typeof calc>; base: ReturnType<typeof calc> }) {
  return (
    <div className="sim-table-wrap">
      <table className="sim-table sim-idx">
        <tbody>
          {IDX_KEYS.map(k => (
            <tr key={k} className={cur.idx[k] !== base.idx[k] ? 'chg' : ''}>
              <th scope="row">{IDX[k].label}</th>
              <td className="n">{cur.idx[k]}</td>
              <td>{IDX[k].levels[cur.idx[k] - 1]}</td>
            </tr>
          ))}
          <tr className={cur.sev !== base.sev ? 'chg' : ''}>
            <th scope="row">Severidad (consecuencia)</th>
            <td className="n">{cur.sev}</td>
            <td>{SEV_LEVELS[cur.sev - 1]}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function MethodBlock() {
  return (
    <details className="sim-method">
      <summary>Metodología IPERC del simulador</summary>
      <p>{METHOD_LINE}</p>
      <p>Probabilidad: Baja 4-6, Media 7-9, Alta 10-12. Severidad: 1 ligeramente dañino, 2 dañino, 3 extremadamente dañino.</p>
      <p>
        Criterio didáctico: eliminación, sustitución e ingeniería mejoran los controles existentes o reducen personas y
        frecuencia de exposición; los controles administrativos actúan sobre procedimientos y capacitación; el EPP casi
        nunca reduce la probabilidad. Cada índice baja como mínimo a 1, por lo que el riesgo mínimo es 4 (trivial), nunca cero.
      </p>
    </details>
  )
}
