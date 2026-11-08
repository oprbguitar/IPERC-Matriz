import { useMemo, useState } from 'react'
import { Clock, Scale } from 'lucide-react'
import { DIAGRAMS, type DNode, type NodeKind } from '../data/diagrams'
import '../styles/diagrams.css'
import { hashParam } from '../lib/hashParams'

const W = 170
const H = 54
const GX = 210
const GY = 96
const PAD = 20

const KIND_LABEL: Record<NodeKind, string> = { inicio: 'Inicio', proceso: 'Proceso', decision: 'Decisión', documento: 'Registro / documento', fin: 'Cierre', alerta: 'Alerta / plazo' }

function center(node: DNode) {
  return { x: PAD + node.col * GX + W / 2, y: PAD + node.row * GY + H / 2 }
}

/** Divide la etiqueta en 2 líneas como máximo. */
function wrap(label: string): string[] {
  if (label.length <= 22) return [label]
  const words = label.split(' ')
  let first = ''
  while (words.length && `${first} ${words[0]}`.trim().length <= 22) first = `${first} ${words.shift()}`.trim()
  return [first, words.join(' ')]
}

export default function DiagramsView() {
  const [diagramId, setDiagramId] = useState(() => DIAGRAMS.find((item) => item.id === hashParam('d'))?.id ?? DIAGRAMS[0].id)
  const [selected, setSelected] = useState<string | null>(null)
  const [path, setPath] = useState<number | null>(null)
  const diagram = DIAGRAMS.find((item) => item.id === diagramId) ?? DIAGRAMS[0]
  const byId = useMemo(() => new Map(diagram.nodes.map((node) => [node.id, node])), [diagram])
  const rows = Math.max(...diagram.nodes.map((node) => node.row)) + 1
  const width = PAD * 2 + (diagram.cols - 1) * GX + W
  const height = PAD * 2 + (rows - 1) * GY + H
  const active = path !== null ? new Set(diagram.paths?.[path]?.nodes ?? []) : null
  const node = selected ? byId.get(selected) : undefined

  const pick = (id: string) => {
    setDiagramId(id)
    setSelected(null)
    setPath(null)
  }

  return (
    <div className="view-page diagrams">
      <header className="page-head">
        <div>
          <h1>Diagramas de procesos</h1>
          <p>Los procesos clave de SSOMA en flujos de ingeniería. Toque un nodo para ver qué se hace, el plazo y la norma.</p>
        </div>
      </header>

      <div className="ssoma-filter" role="tablist" aria-label="Diagramas">
        {DIAGRAMS.map((item) => (
          <button type="button" key={item.id} className={item.id === diagram.id ? 'active' : ''} onClick={() => pick(item.id)}>{item.title}</button>
        ))}
      </div>

      <div className="diagram-layout">
        <figure className="diagram-canvas">
          <figcaption>
            <b>{diagram.title}</b> · {diagram.summary}
          </figcaption>
          {diagram.paths && (
            <div className="diagram-paths">
              <span>Recorrido:</span>
              <button type="button" className={path === null ? 'active' : ''} onClick={() => setPath(null)}>Todo</button>
              {diagram.paths.map((item, index) => (
                <button type="button" key={item.label} className={path === index ? 'active' : ''} onClick={() => setPath(index)}>{item.label}</button>
              ))}
            </div>
          )}
          <div className="diagram-scroll">
            <svg viewBox={`0 0 ${width} ${height}`} style={{ minWidth: Math.min(width, 520) }} role="img" aria-label={diagram.title}>
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0 0 L10 5 L0 10 z" className="d-arrow" />
                </marker>
              </defs>
              {diagram.edges.map((edge) => {
                const from = byId.get(edge.from)
                const to = byId.get(edge.to)
                if (!from || !to) return null
                const a = center(from)
                const b = center(to)
                // Enrutamiento ortogonal: retornos por el costado exterior; misma fila, de borde a borde.
                const back = to.row < from.row
                const sameRow = to.row === from.row
                const side = from.col === 0 && to.col === 0 ? -1 : 1
                const outX = (side > 0 ? Math.max(a.x, b.x) : Math.min(a.x, b.x)) + side * (W / 2 + 16)
                const dir = b.x > a.x + 5 ? 1 : b.x < a.x - 5 ? -1 : 0
                let d: string
                let sx = a.x
                let sy = a.y
                let ex = b.x
                let ey = b.y
                if (back) {
                  sx = a.x + side * (W / 2)
                  ex = b.x + side * (W / 2)
                  d = `M${sx} ${a.y} H ${outX} V ${b.y} H ${ex}`
                  sx = outX
                } else if (sameRow) {
                  sx = a.x + dir * (W / 2)
                  ex = b.x - dir * (W / 2)
                  d = `M${sx} ${a.y} H ${ex}`
                } else if (dir !== 0) {
                  sx = a.x + dir * (W / 2)
                  ey = b.y - H / 2
                  d = `M${sx} ${a.y} H ${b.x} V ${ey}`
                } else {
                  sy = a.y + H / 2
                  ey = b.y - H / 2
                  d = `M${a.x} ${sy} V ${ey}`
                }
                const on = !active || (active.has(edge.from) && active.has(edge.to))
                return (
                  <g key={edge.from + edge.to} className={on ? 'd-edge' : 'd-edge dim'}>
                    <path d={d} markerEnd="url(#arrow)" fill="none" strokeDasharray={back ? '5 4' : undefined} />
                    {edge.label && <text x={(sx + ex) / 2 + 4} y={(sy + ey) / 2 - 4} className="d-elabel">{edge.label}</text>}
                  </g>
                )
              })}
              {diagram.nodes.map((item) => {
                const x = PAD + item.col * GX
                const y = PAD + item.row * GY
                const lines = wrap(item.label)
                const on = !active || active.has(item.id)
                return (
                  <g
                    key={item.id}
                    className={`d-node k-${item.kind}${selected === item.id ? ' sel' : ''}${on ? '' : ' dim'}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`${item.label}. ${KIND_LABEL[item.kind]}`}
                    onClick={() => setSelected(item.id)}
                    onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && setSelected(item.id)}
                  >
                    {item.kind === 'decision' ? (
                      <path d={`M${x + W / 2} ${y - 6} L${x + W + 4} ${y + H / 2} L${x + W / 2} ${y + H + 6} L${x - 4} ${y + H / 2} Z`} />
                    ) : (
                      <rect x={x} y={y} width={W} height={H} rx={item.kind === 'inicio' || item.kind === 'fin' ? H / 2 : 8} />
                    )}
                    {item.time && <circle cx={x + W - 6} cy={y + 6} r="6" className="d-clock" />}
                    <text x={x + W / 2} y={y + H / 2 + (lines.length > 1 ? -3 : 4)} textAnchor="middle">
                      {lines.map((line, index) => <tspan key={index} x={x + W / 2} dy={index ? 14 : 0}>{line}</tspan>)}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
          <div className="diagram-legend">
            {(['inicio', 'proceso', 'decision', 'documento', 'alerta', 'fin'] as NodeKind[]).map((kind) => (
              <span key={kind}><i className={`k-${kind}`} />{KIND_LABEL[kind]}</span>
            ))}
            <span><i className="d-clock-legend" />Tiene plazo</span>
          </div>
        </figure>

        <aside className="diagram-panel" aria-live="polite">
          {node ? (
            <>
              <span className={`diagram-kind k-${node.kind}`}>{KIND_LABEL[node.kind]}</span>
              <h2>{node.label}</h2>
              <p>{node.detail}</p>
              {node.time && <p className="diagram-meta"><Clock size={15} aria-hidden="true" /> <b>{node.time}</b></p>}
              {node.norm && <p className="diagram-meta"><Scale size={15} aria-hidden="true" /> {node.norm}</p>}
            </>
          ) : (
            <p className="empty-note">Toque cualquier nodo del diagrama.</p>
          )}
        </aside>
      </div>
      <p className="site-disclaimer">Diagramas orientativos. Plazos y artículos según la norma citada; verifique el texto vigente.</p>
    </div>
  )
}
