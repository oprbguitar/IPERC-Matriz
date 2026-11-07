import { useId } from 'react'
import { PREVENTION_SCENES } from '../data/preventionScenes'

interface Props {
  sceneId: string
  controlled: boolean
  paused: boolean
  selectedId: string
  onSelect: (hotspotId: string) => void
}

type Point = [number, number, number?]
const point = ([x, y, z = 0]: Point) => [430 + (x - y) * 30, 105 + (x + y) * 17 - z]
const points = (values: Point[]) => values.map(value => point(value).join(',')).join(' ')
const C = { pale: 'var(--pr-scene-pale, #eaf1f6)', wall: 'var(--pr-scene-wall, #d7e3ec)', ink: 'var(--pr-ink, #20364b)', blue: 'var(--pr-accent, #1f6fe5)', teal: 'var(--pr-support, #117d76)', amber: 'var(--pr-warn, #b86213)', white: 'var(--pr-surface, #ffffff)', danger: 'var(--pr-danger, #ad4539)' }

function Block({ x, y, w = 1, d = 1, h = 30, z = 0, fill = C.blue }: { x: number; y: number; w?: number; d?: number; h?: number; z?: number; fill?: string }) {
  return <g stroke={C.ink} strokeWidth="1" strokeLinejoin="round">
    <polygon fill={fill} points={points([[x,y+d,z],[x+w,y+d,z],[x+w,y+d,z+h],[x,y+d,z+h]])} />
    <polygon fill={fill} style={{ filter: 'brightness(.85)' }} points={points([[x+w,y,z],[x+w,y+d,z],[x+w,y+d,z+h],[x+w,y,z+h]])} />
    <polygon fill={fill} style={{ filter: 'brightness(1.12)' }} points={points([[x,y,z+h],[x+w,y,z+h],[x+w,y+d,z+h],[x,y+d,z+h]])} />
  </g>
}

function Line({ path, color = C.ink, width = 2, dash }: { path: Point[]; color?: string; width?: number; dash?: string }) {
  return <polyline fill="none" stroke={color} strokeWidth={width} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" points={points(path)} />
}

function Person({ x, y, protected: safe = false, seated = false }: { x: number; y: number; protected?: boolean; seated?: boolean }) {
  const [px, py] = point([x,y])
  return <g transform={`translate(${px} ${py})`} stroke={C.ink} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d={seated ? safe ? 'M-10 0 L-10-14 L3-14 L3-34 M3-26 L20-26' : 'M-13 0 L-16-14 L2-14 L12-32 M10-25 L25-32' : 'M-8 0 L0-20 L9 0 M0-20 L0-43 M0-35 L-13-25 M0-35 L13-26'} fill="none" />
    <path d={seated ? safe ? 'M-4-18 L7-18 L7-35 L-4-35 Z' : 'M-5-18 L7-16 L17-33 L6-37 Z' : 'M-7-22 L7-22 L7-42 L-7-42 Z'} fill={safe ? C.teal : C.blue} strokeWidth="1" />
    <circle cx={seated ? safe ? 2 : 16 : 0} cy={seated ? -43 : -51} r="7" fill={C.white} strokeWidth="1.5" />
    {safe && !seated && <path d="M-9-54 Q0-68 9-54 Z" fill={C.amber} strokeWidth="1" />}
  </g>
}

function Desk({ x, y, safe }: { x: number; y: number; safe: boolean }) {
  return <g>
    <Block x={x} y={y} w={2.5} d={1.5} h={7} z={35} fill={C.white} />
    <Line path={[[x,y,35],[x,y,0]]} width={4} /><Line path={[[x+2.5,y+1.5,35],[x+2.5,y+1.5,0]]} width={4} />
    {safe && <Block x={x+.65} y={y+.1} w={1.05} d={.4} h={8} z={42} fill={C.teal} />}
    <Block x={x+.7} y={y+.15} w={.95} d={.18} h={safe ? 25 : 16} z={safe ? 50 : 42} fill={C.ink} />
    <Block x={x+.75} y={y+.62} w={.8} d={.4} h={2} z={42} fill={C.pale} />
    <Block x={x+1.35} y={y+2} w={.7} d={.7} h={safe ? 22 : 13} fill={C.blue} />
    {safe && <g><Block x={x+1.35} y={y+2.55} w={.7} d={.16} h={39} fill={C.blue} /><Block x={x+1.7} y={y+2.85} w={1} d={.45} h={6} fill={C.teal} /></g>}
    <Person x={x+1.7} y={y+2.25} seated protected={safe} />
  </g>
}

function Shelves({ x, y, safe }: { x: number; y: number; safe: boolean }) {
  return <g>
    {[0,40,80].map(z => <g key={z}>
      <Block x={x} y={y} w={3} d={1.2} h={5} z={z} fill={C.ink} />
      <Block x={x+.2} y={y+.1} w={1} d={.9} h={25} z={z+5} fill={C.amber} />
      <Block x={x+1.5} y={y+.1} w={safe ? 1 : 1.7} d={.9} h={safe ? 25 : 35} z={z+5} fill={C.amber} />
    </g>)}
    <Line path={[[x,y+1.2,0],[x,y+1.2,115]]} width={4}/><Line path={[[x+3,y+1.2,0],[x+3,y+1.2,115]]} width={4}/>
  </g>
}

function Conveyor({ safe, food = false }: { safe: boolean; food?: boolean }) {
  return <g>
    <Block x={3} y={3} w={4} d={1.8} h={35} fill={food ? C.white : C.blue}/>
    {Array.from({length:8}, (_,i) => <Line key={i} path={[[3+i*.5,3,38],[3+i*.5,4.8,38]]} color={C.ink} width={2}/>)}
    {[0,1,2].map(i => <Block key={i} x={3.4+i} y={3.5} w={.5} d={.6} h={12} z={40} fill={food ? i === 0 ? C.danger : C.teal : C.amber}/>)}
    <Block x={6} y={3} w={1} d={1.8} h={70} fill={food ? C.pale : C.ink}/>
    {safe && <g opacity=".8"><Block x={5.5} y={2.8} w={1.7} d={.15} h={65} fill={C.teal}/><Line path={[[3,5,65],[7,5,65]]} color={C.teal} width={5}/></g>}
    <Person x={4} y={6} protected={safe}/>
  </g>
}

function RoomObjects({ id, safe }: { id: string; safe: boolean }) {
  if (id === 'oficina') return <g>
    <Desk x={2.3} y={3.6} safe={safe}/><Desk x={6.1} y={5.8} safe={safe}/>
    <Block x={7.8} y={.4} w={1.2} d={.35} h={58} z={22} fill={safe ? C.teal : C.amber}/>
    <Line path={[[8.4,.8,35],[8.4,2,0],[6,2.5,0]]} color={safe ? C.ink : C.danger} dash={safe ? undefined : '5 4'}/>
    <Block x={2} y={.4} w={2.4} d={.3} h={27} z={72} fill={C.white}/>
  </g>
  if (id === 'almacen') return <g>
    <Shelves x={1} y={1.3} safe={safe}/><Shelves x={6.2} y={.5} safe={safe}/>
    <Block x={6.1} y={6} w={1.5} d={1.4} h={32} fill={C.amber}/><Block x={6.1} y={6} w={.3} d={1.4} h={58} fill={C.ink}/>
    <Line path={[[6,6,3],[4.5,6,3],[4.5,7,3],[6,7,3]]} color={C.ink} width={5}/>
    <Person x={4} y={6.6} protected={safe}/>
    <Line path={[[1,5,1],[3,5,1],[3,9,1]]} color={safe ? C.teal : C.danger} width={safe ? 12 : 3} dash={safe ? '9 6' : '4 6'}/>
  </g>
  if (id === 'planta' || id === 'alimentos') return <g>
    <Conveyor safe={safe} food={id === 'alimentos'}/>
    <Block x={1} y={1} w={1.7} d={.8} h={70} fill={id === 'alimentos' ? C.white : C.amber}/>
    <Block x={7.4} y={.6} w={1.4} d={1.2} h={95} fill={C.pale}/>
    <Line path={[[8.1,.55,10],[8.1,.55,85]]} color={C.blue}/>
    <Block x={1.8} y={7.4} w={.7} d={.7} h={27} fill={safe ? C.teal : C.amber}/>
    <Block x={2.7} y={7.4} w={.7} d={.7} h={27} fill={C.blue}/>
    {safe && id === 'alimentos' && <Line path={[[4.5,2,2],[4.5,5,2]]} color={C.teal} width={8}/>}
  </g>
  if (id === 'salud') return <g>
    <Block x={3.5} y={3} w={1.8} d={3.2} h={33} fill={C.white}/><Block x={3.6} y={3.1} w={1.6} d={2.8} h={7} z={33} fill={C.pale}/>
    <Block x={3.7} y={3.2} w={1.4} d={.6} h={9} z={40} fill={C.white}/>
    <Person x={2.7} y={5.5} protected={safe}/>
    <Block x={7.4} y={1.5} w={1} d={1} h={42} fill={C.white}/><Block x={7.5} y={1.6} w={.7} d={.7} h={14} z={42} fill={safe ? C.danger : C.amber}/>
    <Block x={1.4} y={.8} w={1.8} d={.8} h={42} fill={C.white}/>
    <Line path={[[2.2,1.3,42],[2.2,1.3,60],[2.6,1.3,60]]} color={C.blue} width={3}/>
    {safe && <Line path={[[3.2,3,48],[3.2,6.2,48],[5.5,6.2,48]]} color={C.teal} width={4}/>}
  </g>
  if (id === 'construccion') return <g>
    {[0,65,130].map(z => <g key={z}><Block x={1.5} y={2} w={3.5} d={1.6} h={7} z={z} fill={C.pale}/></g>)}
    {[1.5,5].map(x => <g key={x}><Line path={[[x,2,0],[x,2,170]]} width={4}/><Line path={[[x,3.6,0],[x,3.6,170]]} width={4}/></g>)}
    <Line path={[[1.5,3.6,0],[5,3.6,130],[1.5,3.6,130],[5,3.6,0]]} width={2}/>
    {safe && <Line path={[[1.5,3.6,165],[5,3.6,165],[5,2,165]]} color={C.teal} width={5}/>}
    <Block x={6.6} y={2} w={1.5} d={1.5} h={37} fill={C.amber}/><Person x={6} y={6} protected={safe}/>
    <Block x={3} y={7} w={2} d={1} h={20} fill={C.wall}/>
  </g>
  if (id === 'agricultura') return <g>
    {[2.5,4,5.5,7,8.5].map(y => <g key={y}><Line path={[[3,y,2],[8.5,y,2]]} color={C.teal} width={13}/>{[3.5,5,6.5,8].map(x => <Line key={x} path={[[x,y,2],[x,y,18],[x+.25,y,24],[x,y,18],[x-.25,y,25]]} color={C.teal} width={3}/>)}</g>)}
    <Block x={.7} y={2} w={1.5} d={1.7} h={70} fill={safe ? C.teal : C.amber}/><Person x={6.1} y={6.5} protected={safe}/>
    {safe && <g><Block x={4.5} y={1} w={3.5} d={2} h={5} z={100} fill={C.pale}/><Line path={[[4.5,3,0],[4.5,3,100]]} width={4}/><Line path={[[8,3,0],[8,3,100]]} width={4}/></g>}
  </g>
  return <g>
    <Block x={1.4} y={2} w={3} d={1.4} h={32} fill={C.blue}/><Block x={1.4} y={2} w={3} d={.3} h={57} fill={C.blue}/>
    <Block x={6.8} y={.5} w={2.2} d={1} h={45} fill={C.white}/><Block x={7.2} y={.6} w={1.2} d={.7} h={5} z={46} fill={C.ink}/>
    <Block x={1.3} y={7} w={1.1} d={.8} h={50} fill={safe ? C.teal : C.amber}/>
    <Person x={7} y={5.5} protected={false}/><Block x={4} y={5} w={1.8} d={1.6} h={20} fill={C.pale}/>
    <Line path={[[1,1.5,28],[1.4,1.5,0],[3.6,3.8,0]]} color={safe ? C.ink : C.danger} dash={safe ? undefined : '4 3'}/>
  </g>
}

export default function PreventionScene({ sceneId, controlled, paused, selectedId, onSelect }: Props) {
  const scene = PREVENTION_SCENES.find(item => item.id === sceneId) ?? PREVENTION_SCENES[0]
  const titleId = useId()
  const outdoor = scene.id === 'agricultura' || scene.id === 'construccion'
  return <figure className={`pr-scene ${controlled ? 'pr-scene--controlled' : ''} ${paused ? 'pr-paused' : ''}`} style={{ margin: 0 }}>
    <div className="pr-scene-canvas" style={{ position: 'relative', aspectRatio: '860 / 460' }}>
      <svg viewBox="0 0 860 460" role="img" aria-labelledby={titleId} style={{ display: 'block', width: '100%', height: '100%' }}>
        <title id={titleId}>{`${scene.label}: ${controlled ? 'representación con medidas de control' : 'identificación de peligros'}`}</title>
        <desc>{scene.description} Utilice los puntos numerados o la lista de peligros para consultar cada ficha.</desc>
        <polygon points={points([[0,0],[10,0],[10,10],[0,10]])} fill={C.pale} stroke={C.wall} strokeWidth="2"/>
        {!outdoor && <g><polygon points={points([[0,0],[0,10],[0,10,100],[0,0,100]])} fill={C.wall}/><polygon points={points([[0,0],[10,0],[10,0,100],[0,0,100]])} fill={C.pale}/></g>}
        {Array.from({length:9},(_,i) => <g key={i} opacity=".28"><Line path={[[i+1,0],[i+1,10]]} color={C.wall} width={1}/><Line path={[[0,i+1],[10,i+1]]} color={C.wall} width={1}/></g>)}
        {outdoor && <g className="pr-sun" transform="translate(677 73)"><circle r="25" fill={C.amber} opacity=".16"/><circle r="14" fill={C.amber}/>{Array.from({length:8},(_,i) => <line key={i} x1="20" y1="0" x2="27" y2="0" stroke={C.amber} strokeWidth="2" transform={`rotate(${i*45})`}/>)}</g>}
        <RoomObjects id={scene.id} safe={controlled}/>
        <path className="pr-scene-flow" d="M165 325 L424 438 L740 290" stroke={controlled ? C.teal : C.blue} strokeWidth="2" strokeDasharray="5 9" fill="none" opacity=".5"/>
        <text x="429" y="453" textAnchor="middle" fill={C.ink} fontSize="10" letterSpacing="2">ESCENARIO ILUSTRATIVO · SIN MEDICIONES</text>
      </svg>
      {scene.hotspots.map((spot,index) => <button key={spot.id} type="button" className={`pr-hotspot ${selectedId === spot.id ? 'is-selected' : ''}`} aria-pressed={selectedId === spot.id} aria-label={`${index+1}. ${spot.label}`} title={spot.label} style={{ position: 'absolute', left: `${spot.x}%`, top: `${spot.y}%`, transform: 'translate(-50%, -50%)' }} onClick={() => onSelect(spot.id)}><span>{index+1}</span><span className="pr-hotspot-label">{spot.label}</span></button>)}
    </div>
    <figcaption className="pr-scene-caption">{scene.domestic ? 'Prevención doméstica general' : 'Ejemplo didáctico'} · {controlled ? 'Controles ilustrados; su eficacia requiere verificación en el lugar.' : 'Seleccione un punto para conocer el peligro y sus controles.'}</figcaption>
  </figure>
}
