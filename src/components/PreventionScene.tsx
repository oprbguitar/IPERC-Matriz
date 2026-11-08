import { useId } from 'react'
import { PREVENTION_SCENES } from '../data/preventionScenes'
import { project, SCENE_HEIGHT, SCENE_WIDTH, type Point3 } from '../lib/preventionScene'

interface Props {
  sceneId: string
  controlled: boolean
  paused: boolean
  selectedId: string
  onSelect: (hotspotId: string) => void
}

const points = (values: Point3[]) => values.map(value => project(value).join(',')).join(' ')
const C = { pale: 'var(--surface-muted)', floor: 'var(--surface-soft)', wall: 'var(--border-strong)', ink: 'var(--text)', blue: 'var(--blue)', teal: 'var(--teal)', amber: 'var(--amber)', white: 'var(--surface)', danger: 'var(--red)', green: 'var(--green)' }

/** Prisma apoyado en el piso: tres caras visibles. Todo objeto se construye con bloques para que los bordes coincidan. */
function Block({ x, y, w = 1, d = 1, h = 10, z = 0, fill = C.blue, opacity }: { x: number; y: number; w?: number; d?: number; h?: number; z?: number; fill?: string; opacity?: number }) {
  return <g stroke={C.ink} strokeWidth="1" strokeLinejoin="round" opacity={opacity}>
    <polygon fill={fill} points={points([[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]])} />
    <polygon fill={fill} style={{ filter: 'brightness(.82)' }} points={points([[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]])} />
    <polygon fill={fill} style={{ filter: 'brightness(1.12)' }} points={points([[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]])} />
  </g>
}

/** Marca sobre el piso (ruta, derrame, zona delimitada). */
function Zone({ x, y, w, d, fill = C.teal, opacity = 0.35, dash, stroke }: { x: number; y: number; w: number; d: number; fill?: string; opacity?: number; dash?: string; stroke?: string }) {
  return <polygon points={points([[x, y, 0], [x + w, y, 0], [x + w, y + d, 0], [x, y + d, 0]])} fill={fill} fillOpacity={opacity} stroke={stroke ?? fill} strokeWidth="1.5" strokeDasharray={dash} strokeLinejoin="round" />
}

function Legs({ x, y, w, d, h, t = 0.14, z = 0 }: { x: number; y: number; w: number; d: number; h: number; t?: number; z?: number }) {
  return <g>{[[x, y], [x + w - t, y], [x, y + d - t], [x + w - t, y + d - t]].map(([lx, ly]) => <Block key={`${lx}-${ly}`} x={lx} y={ly} w={t} d={t} h={h} z={z} fill={C.ink} />)}</g>
}

function Head({ at, r = 6.5, fill = C.white }: { at: Point3; r?: number; fill?: string }) {
  const [cx, cy] = project(at)
  return <circle cx={cx} cy={cy} r={r} fill={fill} stroke={C.ink} strokeWidth="1.2" />
}

function Hat({ at }: { at: Point3 }) {
  const [cx, cy] = project(at)
  return <path d={`M${cx - 8} ${cy - 1} A8 8 0 0 1 ${cx + 8} ${cy - 1} Z`} fill={C.amber} stroke={C.ink} strokeWidth="1.2" />
}

function Worker({ x, y, z = 0, safe = false, hat = safe }: { x: number; y: number; z?: number; safe?: boolean; hat?: boolean }) {
  return <g>
    <Block x={x - 0.22} y={y - 0.09} w={0.18} d={0.18} h={22} z={z} fill={C.ink} /><Block x={x + 0.04} y={y - 0.09} w={0.18} d={0.18} h={22} z={z} fill={C.ink} />
    <Block x={x - 0.26} y={y - 0.16} w={0.52} d={0.32} h={22} z={z + 22} fill={safe ? C.teal : C.blue} />
    <Block x={x - 0.4} y={y - 0.08} w={0.13} d={0.16} h={18} z={z + 24} fill={safe ? C.teal : C.blue} /><Block x={x + 0.27} y={y - 0.08} w={0.13} d={0.16} h={18} z={z + 24} fill={safe ? C.teal : C.blue} />
    <Head at={[x, y, z + 51]} />{hat && <Hat at={[x, y, z + 54]} />}
  </g>
}

function SeatedWorker({ x, y, safe }: { x: number; y: number; safe: boolean }) {
  return <g>
    <Block x={x - 0.25} y={y - 0.7} w={0.5} d={0.7} h={5} z={18} fill={C.ink} />
    <Block x={x - 0.25} y={y - 0.18} w={0.5} d={0.32} h={22} z={18} fill={safe ? C.teal : C.blue} />
    <Head at={[x, y, 46]} />
  </g>
}

function Desk({ x, y, safe }: { x: number; y: number; safe: boolean }) {
  const riser = safe ? 10 : 3
  return <g>
    <Legs x={x} y={y} w={2.4} d={1.4} h={34} />
    <Block x={x} y={y} w={2.4} d={1.4} h={3} z={34} fill={C.white} />
    <Block x={x + 1.05} y={y + 0.5} w={0.3} d={0.3} h={riser} z={37} fill={C.ink} />
    <Block x={x + 0.6} y={y + 0.4} w={1.2} d={0.14} h={16} z={37 + riser} fill={C.ink} />
    <Block x={x + 0.7} y={y + 0.85} w={1.0} d={0.34} h={1.5} z={37} fill={C.pale} />
    <Block x={x + 1.1} y={y + 1.75} w={0.1} d={0.1} h={15} fill={C.ink} />
    <Block x={x + 0.8} y={y + 1.5} w={0.8} d={0.8} h={3} z={15} fill={C.ink} />
    <Block x={x + 0.8} y={y + 2.3} w={0.8} d={0.12} h={22} z={18} fill={C.ink} />
    {safe && <Block x={x + 0.9} y={y + 0.95} w={0.6} d={0.4} h={4} fill={C.teal} />}
    <SeatedWorker x={x + 1.2} y={y + 2.2} safe={safe} />
  </g>
}

function Rack({ x, y, w, d = 1, safe, boxes = true }: { x: number; y: number; w: number; d?: number; safe: boolean; boxes?: boolean }) {
  return <g>
    {[0, 45, 90].map(z => <g key={z}>
      <Block x={x} y={y} w={w} d={d} h={3} z={z + 20} fill={C.ink} />
      {boxes && <><Block x={x + 0.2} y={y + 0.1} w={w / 2 - 0.3} d={d - 0.2} h={22} z={z + 23} fill={C.amber} /><Block x={x + w / 2 + 0.1} y={y + 0.1} w={safe ? w / 2 - 0.4 : w / 2 - 0.2} d={d - 0.2} h={safe ? 20 : 30} z={z + 23} fill={C.amber} /></>}
    </g>)}
    {[x, x + w - 0.12].map(px => [y, y + d - 0.12].map(py => <Block key={`${px}-${py}`} x={px} y={py} w={0.12} d={0.12} h={118} fill={safe ? C.teal : C.blue} />))}
  </g>
}

function Table({ x, y, w, d, h = 34, fill = C.white }: { x: number; y: number; w: number; d: number; h?: number; fill?: string }) {
  return <g><Legs x={x} y={y} w={w} d={d} h={h} /><Block x={x} y={y} w={w} d={d} h={3} z={h} fill={fill} /></g>
}

function Bin({ x, y, fill, lid }: { x: number; y: number; fill: string; lid: boolean }) {
  return <g><Block x={x} y={y} w={0.7} d={0.7} h={34} fill={fill} />{lid && <Block x={x - 0.04} y={y - 0.04} w={0.78} d={0.78} h={4} z={34} fill={C.ink} />}</g>
}

function Sound({ at }: { at: Point3 }) {
  const [cx, cy] = project(at)
  return <g fill="none" stroke={C.blue} strokeWidth="2" strokeLinecap="round"><path d={`M${cx} ${cy - 8}q10 8 0 16`} /><path d={`M${cx + 8} ${cy - 14}q16 14 0 28`} /></g>
}

function Sun({ x, y }: { x: number; y: number }) {
  return <g className="pr-sun" transform={`translate(${x} ${y})`}><circle r="24" fill={C.amber} opacity=".16" /><circle r="13" fill={C.amber} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1="19" y1="0" x2="26" y2="0" stroke={C.amber} strokeWidth="2" strokeLinecap="round" transform={`rotate(${i * 45})`} />)}</g>
}

function RoomObjects({ id, safe }: { id: string; safe: boolean }) {
  if (id === 'oficina') return <g>
    <Block x={2} y={0.05} w={2.4} d={0.15} h={30} z={50} fill={C.white} />
    <Block x={7.5} y={0.05} w={1.6} d={0.3} h={50} z={20} fill={safe ? C.teal : C.amber} />
    {safe ? <Zone x={7.2} y={0.4} w={2.2} d={1.3} dash="5 4" /> : <Zone x={8.2} y={0.4} w={0.14} d={3.4} fill={C.danger} opacity={0.8} />}
    <Desk x={2} y={3.4} safe={safe} />
    <Desk x={5.7} y={6} safe={safe} />
  </g>
  if (id === 'almacen') return <g>
    <Block x={0.05} y={7.6} w={0.18} d={1.2} h={75} fill={C.green} />
    <Rack x={0.8} y={0.5} w={2.4} safe={safe} /><Rack x={3.6} y={0.5} w={3.2} safe={safe} />
    <Zone x={0.4} y={8.0} w={5.2} d={0.5} dash="6 4" stroke={safe ? C.teal : C.danger} fill={safe ? C.teal : C.danger} opacity={0.18} />
    <Zone x={3} y={6.1} w={3} d={1.3} fill={C.green} opacity={0.25} dash="4 3" />
    <Block x={2.3} y={3.2} w={1} d={1} h={24} fill={C.amber} /><Block x={2.3} y={3.2} w={1} d={1} h={24} z={24} fill={C.amber} />{!safe && <Block x={2.3} y={3.2} w={1} d={1} h={24} z={48} fill={C.amber} />}
    {!safe && <Block x={2.2} y={7.9} w={0.8} d={0.8} h={26} fill={C.amber} />}
    <Worker x={4} y={6.7} safe={safe} />
    {safe && <g><Block x={5.4} y={5.9} w={0.14} d={2.2} h={14} fill={C.teal} /><Block x={5.4} y={5.9} w={0.14} d={0.14} h={30} fill={C.teal} /><Block x={5.4} y={7.96} w={0.14} d={0.14} h={30} fill={C.teal} /></g>}
    <Block x={6.1} y={6.1} w={1.4} d={1.4} h={22} z={6} fill={C.amber} />
    {[[6.1, 6.1], [7.15, 6.1], [6.1, 7.15], [7.15, 7.15]].map(([wx, wy]) => <Block key={`${wx}-${wy}`} x={wx} y={wy} w={0.35} d={0.35} h={10} fill={C.ink} />)}
    <Block x={6.2} y={5.8} w={1.2} d={0.15} h={64} fill={C.ink} /><Block x={6.3} y={5.0} w={0.22} d={0.8} h={2} z={3} fill={C.ink} /><Block x={7.0} y={5.0} w={0.22} d={0.8} h={2} z={3} fill={C.ink} />
    {[[6.1, 6.2], [7.4, 6.2], [6.1, 7.4], [7.4, 7.4]].map(([px, py]) => <Block key={`${px}-${py}`} x={px} y={py} w={0.1} d={0.1} h={24} z={28} fill={C.ink} />)}
    <Block x={6.05} y={6.15} w={1.5} d={1.4} h={2} z={52} fill={C.ink} />
  </g>
  if (id === 'planta' || id === 'alimentos') {
    const food = id === 'alimentos'
    if (!food) return <g>
      <Block x={4} y={0.05} w={1.4} d={0.35} h={82} fill={C.pale} />
      {safe && <Block x={4.5} y={0.42} w={0.3} d={0.1} h={8} z={55} fill={C.danger} />}
      <Block x={1} y={1} w={1.2} d={1.2} h={48} fill={C.amber} />
      {safe && <Block x={0.85} y={0.85} w={1.5} d={1.5} h={56} fill={C.teal} opacity={0.5} />}
      <Sound at={[1.6, 1.6, 62]} />
      <Legs x={2.4} y={3.7} w={4.6} d={1} h={28} />
      <Block x={2.4} y={3.7} w={4.6} d={1} h={4} z={28} fill={C.ink} />
      {[0, 1, 2].map(i => <Block key={i} x={2.9 + i * 1.3} y={3.95} w={0.6} d={0.5} h={12} z={32} fill={C.amber} />)}
      <Block x={7} y={3.4} w={1.8} d={1.6} h={70} fill={C.blue} />
      <Block x={7} y={4.2} w={0.5} d={0.8} h={14} z={20} fill={C.ink} />
      {safe && <g><Block x={6.75} y={3.3} w={0.1} d={2.1} h={60} fill={C.teal} opacity={0.55} /><Block x={6.75} y={5.3} w={2.3} d={0.1} h={60} fill={C.teal} opacity={0.55} /></g>}
      <Worker x={4.6} y={6} safe={safe} />
      <Bin x={1} y={7} fill={safe ? C.danger : C.amber} lid={safe} /><Bin x={1.9} y={7} fill={safe ? C.teal : C.amber} lid={safe} />{safe && <Bin x={2.8} y={7} fill={C.blue} lid />}
      {!safe && <Zone x={1} y={7.9} w={2.5} d={0.9} fill={C.danger} opacity={0.4} dash="4 3" />}
    </g>
    return <g>
      <Block x={7.4} y={0.05} w={2} d={0.2} h={80} fill={C.pale} /><Block x={7.7} y={0.28} w={0.14} d={0.1} h={14} z={34} fill={safe ? C.danger : C.ink} />
      <Block x={1} y={0.5} w={1.4} d={1.4} h={3} z={22} fill={C.ink} /><Block x={1} y={0.5} w={1.4} d={1.4} h={3} z={44} fill={C.ink} />
      {[[1, 0.5], [2.28, 0.5], [1, 1.78], [2.28, 1.78]].map(([px, py]) => <Block key={`${px}-${py}`} x={px} y={py} w={0.12} d={0.12} h={56} fill={C.ink} />)}
      {[0.1, 0.8].map(o => <Block key={o} x={1.1 + o} y={0.7} w={0.3} d={0.3} h={12} z={25} fill={safe ? C.teal : C.danger} />)}
      {[0.1, 0.8].map(o => <Block key={o} x={1.1 + o} y={0.7} w={0.3} d={0.3} h={12} z={47} fill={C.blue} />)}
      <Table x={2.2} y={3.3} w={2} d={1} /><Block x={2.5} y={3.55} w={0.9} d={0.5} h={3} z={37} fill={C.danger} />
      <Table x={2.2} y={5.6} w={2} d={1} /><Block x={2.5} y={5.85} w={0.9} d={0.5} h={3} z={37} fill={C.green} />
      {safe && <Block x={2} y={4.95} w={2.4} d={0.1} h={46} fill={C.teal} opacity={0.6} />}
      <Worker x={5.2} y={4.8} safe={safe} />
      <Block x={6.4} y={5.7} w={1.2} d={1} h={30} fill={C.pale} />
      <ellipse cx={project([7, 6.2, 40])[0]} cy={project([7, 6.2, 40])[1]} rx="15" ry="15" fill={C.white} stroke={C.ink} strokeWidth="1.5" />
      {safe && <Block x={6.3} y={5.6} w={1.4} d={1.2} h={22} z={30} fill={C.teal} opacity={0.45} />}
    </g>
  }
  if (id === 'salud') return <g>
    <Block x={1.2} y={0.1} w={1.4} d={0.8} h={34} fill={C.white} />
    <Block x={1.8} y={0.5} w={0.12} d={0.12} h={14} z={34} fill={C.ink} />
    <Block x={1.8} y={0.1} w={0.25} d={0.25} h={14} z={44} fill={safe ? C.green : C.amber} />
    <Legs x={3.6} y={3.2} w={1.6} d={2.8} h={20} />
    <Block x={3.6} y={3.2} w={1.6} d={2.8} h={10} z={20} fill={C.white} />
    <Block x={3.7} y={5.1} w={1.4} d={0.8} h={4} z={30} fill={C.pale} />
    <Block x={3.8} y={3.5} w={1.2} d={1.6} h={6} z={30} fill={C.blue} />
    <Head at={[4.4, 5.5, 38]} />
    <Worker x={5.9} y={4.6} safe={safe} />
    <Table x={7.4} y={1.5} w={1} d={1} h={42} />
    <Block x={7.65} y={1.75} w={0.5} d={0.5} h={14} z={45} fill={safe ? C.danger : C.amber} />
    {safe ? <g><Block x={2.2} y={5.5} w={0.14} d={0.14} h={80} fill={C.teal} /><Block x={3.6} y={5.5} w={0.14} d={0.14} h={80} fill={C.teal} /><Block x={2.2} y={5.5} w={1.54} d={0.14} h={6} z={80} fill={C.teal} /></g> : null}
    <Block x={2.5} y={5.8} w={0.9} d={0.9} h={4} z={20} fill={C.ink} /><Block x={2.5} y={6.55} w={0.9} d={0.12} h={22} z={24} fill={C.ink} />
    <Block x={2.7} y={6.05} w={0.5} d={0.3} h={22} z={24} fill={C.pale} /><Head at={[2.95, 6.2, 54]} />
    <Worker x={3.5} y={7.3} safe={safe} />
  </g>
  if (id === 'construccion') return <g>
    {[0, 65, 130].map(z => <Block key={z} x={1.5} y={2} w={3.5} d={2} h={6} z={z} fill={C.pale} />)}
    {[[1.5, 2], [4.85, 2], [1.5, 3.85], [4.85, 3.85]].map(([px, py]) => <Block key={`${px}-${py}`} x={px} y={py} w={0.15} d={0.15} h={130} z={6} fill={C.ink} />)}
    <polyline fill="none" stroke={C.ink} strokeWidth="2" points={points([[1.65, 4, 6], [4.85, 4, 71], [1.65, 4, 71], [4.85, 4, 136]])} />
    {safe && <g>
      {[[1.5, 3.9], [3.2, 3.9], [4.9, 3.9]].map(([px, py]) => <Block key={px} x={px} y={py} w={0.1} d={0.1} h={50} z={136} fill={C.teal} />)}
      <Block x={1.5} y={3.95} w={3.6} d={0.06} h={3} z={186} fill={C.teal} /><Block x={1.5} y={3.95} w={3.6} d={0.06} h={3} z={161} fill={C.teal} />
    </g>}
    <Worker x={4.2} y={3.2} z={136} safe={safe} />
    <Worker x={5.9} y={6.1} safe={safe} />
    <Block x={6.4} y={2.2} w={0.35} d={1.6} h={10} fill={C.ink} /><Block x={7.65} y={2.2} w={0.35} d={1.6} h={10} fill={C.ink} />
    <Block x={6.6} y={2.4} w={1.2} d={1.2} h={24} z={8} fill={C.amber} /><Block x={6.7} y={2.5} w={0.7} d={0.7} h={22} z={32} fill={C.pale} />
    <Block x={7.6} y={2.9} w={1.5} d={0.2} h={4} z={48} fill={C.amber} />
    {safe && <Zone x={6} y={1.8} w={3.4} d={2.6} fill={C.teal} opacity={0.15} dash="5 4" />}
  </g>
  if (id === 'agricultura') return <g>
    {[2.2, 3.2, 4.2].map(row => <g key={row}>
      <Zone x={3.6} y={row} w={5.6} d={0.55} fill={C.green} opacity={0.35} />
      {[3.9, 4.8, 5.7, 6.6, 7.5, 8.4].map(px => <Block key={px} x={px} y={row + 0.2} w={0.16} d={0.16} h={12} fill={C.green} />)}
    </g>)}
    <Block x={1} y={2} w={1.8} d={1.6} h={50} fill={safe ? C.teal : C.amber} />
    <Block x={0.9} y={1.9} w={2} d={1.8} h={6} z={50} fill={C.pale} />
    <Block x={1.4} y={3.6} w={0.7} d={0.05} h={34} fill={C.ink} />{safe && <Block x={1.85} y={3.66} w={0.16} d={0.06} h={5} z={16} fill={C.amber} />}
    <Worker x={6.1} y={6.5} safe={safe} />
    {safe && <g>{[[5.2, 5.7], [7.3, 5.7], [5.2, 7.2], [7.3, 7.2]].map(([px, py]) => <Block key={`${px}-${py}`} x={px} y={py} w={0.1} d={0.1} h={75} fill={C.ink} />)}<Block x={5.1} y={5.6} w={2.4} d={1.8} h={3} z={75} fill={C.teal} opacity={0.75} /></g>}
    <Block x={5.4} y={6.8} w={1.2} d={0.8} h={20} fill={C.amber} /><Block x={5.4} y={6.8} w={1.2} d={0.8} h={20} z={20} fill={C.amber} />
    <Worker x={4.5} y={7.2} safe={safe} />
  </g>
  return <g>
    <Block x={0.05} y={8} w={0.18} d={1.3} h={74} fill={C.pale} />
    {!safe && <Block x={0.4} y={8.3} w={0.8} d={0.8} h={24} fill={C.amber} />}
    <Block x={6.3} y={0.4} w={2.4} d={1.2} h={34} fill={C.white} />
    <Block x={6.9} y={0.6} w={1.2} d={0.8} h={4} z={34} fill={C.ink} />
    {[0.2, 0.5].map(o => <Block key={o} x={6.8 + o * 1.4} y={0.8} w={0.12} d={0.12} h={12} z={38} fill={C.amber} />)}
    {safe && <Block x={6.6} y={0.1} w={1.6} d={0.9} h={14} z={62} fill={C.teal} />}
    <Block x={9} y={0.5} w={0.6} d={0.6} h={40} fill={C.blue} />
    <Block x={8.7} y={0.85} w={0.3} d={0.1} h={3} z={30} fill={safe ? C.ink : C.danger} />
    <Block x={2.2} y={0.05} w={0.4} d={0.1} h={14} z={40} fill={C.white} />
    {safe ? <Block x={3.2} y={0.05} w={0.5} d={0.1} h={18} z={48} fill={C.teal} /> : <Block x={1.9} y={0.15} w={1.1} d={0.3} h={3} fill={C.ink} />}
    {!safe && <Block x={2.34} y={0.15} w={0.05} d={0.05} h={37} z={3} fill={C.ink} />}
    <Block x={1} y={5.8} w={1.2} d={1} h={34} fill={safe ? C.teal : C.pale} />
    {[0.1, 0.5, 0.85].map(o => <Block key={o} x={1.1 + o * 0.9} y={6} w={0.18} d={0.18} h={9} z={34} fill={safe ? C.white : [C.danger, C.amber, C.blue][Math.round(o * 2) % 3]} />)}
    <Block x={5.5} y={6.3} w={0.4} d={0.4} h={30} fill={C.danger} />
    <Block x={3.5} y={6} w={1.6} d={0.9} h={22} fill={C.blue} />
  </g>
}

export default function PreventionScene({ sceneId, controlled, paused, selectedId, onSelect }: Props) {
  const scene = PREVENTION_SCENES.find(item => item.id === sceneId) ?? PREVENTION_SCENES[0]
  const titleId = useId()
  const outdoor = scene.id === 'agricultura' || scene.id === 'construccion'
  return <figure className={`pr-scene ${controlled ? 'pr-scene--controlled' : ''} ${paused ? 'pr-paused' : ''}`}>
    <div className="pr-scene-canvas" style={{ aspectRatio: `${SCENE_WIDTH} / ${SCENE_HEIGHT}` }}>
      <svg viewBox={`0 0 ${SCENE_WIDTH} ${SCENE_HEIGHT}`} role="img" aria-labelledby={titleId}>
        <title id={titleId}>{`${scene.label}: ${controlled ? 'representación con medidas de control' : 'identificación de peligros'}`}</title>
        <desc>{scene.description} Utilice los puntos numerados o la lista de peligros para consultar cada ficha.</desc>
        {!outdoor && <g>
          <polygon points={points([[0, 0, 0], [0, 10, 0], [0, 10, 100], [0, 0, 100]])} fill={C.wall} stroke={C.ink} strokeWidth="1" strokeLinejoin="round" />
          <polygon points={points([[0, 0, 0], [10, 0, 0], [10, 0, 100], [0, 0, 100]])} fill={C.pale} stroke={C.ink} strokeWidth="1" strokeLinejoin="round" />
        </g>}
        <polygon points={points([[0, 0], [10, 0], [10, 10], [0, 10]])} fill={C.floor} stroke={C.ink} strokeWidth="1" strokeLinejoin="round" />
        {Array.from({ length: 9 }, (_, i) => <g key={i} stroke={C.wall} strokeWidth="1" opacity=".5"><line x1={project([i + 1, 0])[0]} y1={project([i + 1, 0])[1]} x2={project([i + 1, 10])[0]} y2={project([i + 1, 10])[1]} /><line x1={project([0, i + 1])[0]} y1={project([0, i + 1])[1]} x2={project([10, i + 1])[0]} y2={project([10, i + 1])[1]} /></g>)}
        {outdoor && <Sun x={700} y={70} />}
        <RoomObjects id={scene.id} safe={controlled} />
        <text x={SCENE_WIDTH / 2} y={SCENE_HEIGHT - 6} textAnchor="middle" fill={C.ink} fontSize="10" letterSpacing="2" opacity=".7">ESCENARIO ILUSTRATIVO · SIN MEDICIONES</text>
      </svg>
      {scene.hotspots.map((spot, index) => <button key={spot.id} type="button" className={`pr-hotspot ${selectedId === spot.id ? 'is-selected' : ''}`} aria-pressed={selectedId === spot.id} aria-label={`${index + 1}. ${spot.label}`} title={spot.label} style={{ left: `${spot.x}%`, top: `${spot.y}%` }} onClick={() => onSelect(spot.id)}><span>{index + 1}</span><span className="pr-hotspot-label">{spot.label}</span></button>)}
    </div>
    <figcaption className="pr-scene-caption">{scene.domestic ? 'Prevención doméstica general' : 'Ejemplo didáctico'} · {controlled ? 'controles ilustrados; su eficacia requiere verificación en el lugar.' : 'seleccione un punto para ver el peligro y su criterio normativo.'}</figcaption>
  </figure>
}
