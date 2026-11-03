import { ChevronRight, GitBranch, History, Scale, Sparkles, Target } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { DocActions } from '../components/DocReader'
import { findNorm } from '../data/legalDatabase'
import {
  findBranch,
  TIMELINE_BRANCHES,
  TIMELINE_ERAS,
  TIMELINE_EVENTS,
  type BranchId,
  type TimelineBranch,
} from '../data/timeline'

interface EvolutionViewProps {
  onOpenNorm: (normId: string) => void
}

/** Revela elementos con animacion cuando entran en pantalla. */
function useReveal(key: string) {
  const rootRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const items = root.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('revealed'))
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    items.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [key])
  return rootRef
}

function evolutionMarkdown(): string {
  const eras = TIMELINE_ERAS.map((era) => {
    const events = TIMELINE_EVENTS.filter((event) => event.year >= era.from && event.year <= era.to)
      .map((event) => `| ${event.year} | ${event.title} | ${findBranch(event.branch).label} | ${event.impact} |`)
      .join('\n')
    return `## ${era.range} · ${era.title}\n\n${era.summary}\n\n| Año | Hito | Rama | Impacto |\n|---|---|---|---|\n${events}`
  }).join('\n\n')
  const branches = TIMELINE_BRANCHES.map(
    (branch) =>
      `### ${branch.label}\n\n${branch.description}\n\n| Especialización | Roles | Prioridades |\n|---|---|---|\n${branch.specializations
        .map((spec) => `| ${spec.name} | ${spec.roles.join(', ')} | ${spec.priorities.join('; ')} |`)
        .join('\n')}`,
  ).join('\n\n')
  return `# Evolución normativa de la SST y SSOMA en el Perú\n\nCómo nació cada norma, qué ramas abrió, qué especialidades surgieron y qué prioridades tienen hoy.\n\n${eras}\n\n## Árbol de especialización\n\n${branches}`
}

export function EvolutionView({ onOpenNorm }: EvolutionViewProps) {
  const [filter, setFilter] = useState<BranchId | 'todas'>('todas')
  const [selected, setSelected] = useState<BranchId>('base')
  const rootRef = useReveal(filter)
  const markdown = useMemo(evolutionMarkdown, [])

  const visibleEvents = TIMELINE_EVENTS.filter((event) => filter === 'todas' || event.branch === filter)
  const firstYear = TIMELINE_EVENTS[0].year
  const lastYear = TIMELINE_EVENTS[TIMELINE_EVENTS.length - 1].year

  function scrollToEra(id: string) {
    document.getElementById(`era-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="view-page evolution" ref={rootRef}>
      <header className="evo-hero">
        <div className="evo-hero-copy">
          <span className="eyebrow"><History size={15} aria-hidden="true" /> Línea de tiempo normativa</span>
          <h1>
            De la seguridad industrial a la <span className="accent-blue">SST con datos e IA</span>
          </h1>
          <p>
            Recorre {lastYear - firstYear} años de normas peruanas: cómo nace cada regla, qué ramas abrió, qué especialidades
            profesionales surgieron y cuáles son sus prioridades hoy.
          </p>
          <DocActions id="evolucion" title="Evolución normativa SST y SSOMA Perú" markdown={markdown} />
        </div>
        <dl className="evo-stats">
          <div><dt>Hitos</dt><dd>{TIMELINE_EVENTS.length}</dd></div>
          <div><dt>Eras</dt><dd>{TIMELINE_ERAS.length}</dd></div>
          <div><dt>Ramas</dt><dd>{TIMELINE_BRANCHES.length}</dd></div>
          <div><dt>Especialidades</dt><dd>{TIMELINE_BRANCHES.reduce((sum, branch) => sum + branch.specializations.length, 0)}</dd></div>
        </dl>
      </header>

      <nav className="era-rail" aria-label="Eras">
        {TIMELINE_ERAS.map((era, index) => (
          <button type="button" key={era.id} onClick={() => scrollToEra(era.id)} style={{ '--i': index } as React.CSSProperties}>
            <b>{era.range}</b>
            <small>{era.title}</small>
          </button>
        ))}
      </nav>

      <div className="branch-filter" role="group" aria-label="Filtrar por rama">
        <button type="button" className={filter === 'todas' ? 'active' : ''} onClick={() => setFilter('todas')}>Todas</button>
        {TIMELINE_BRANCHES.map((branch) => (
          <button
            type="button"
            key={branch.id}
            className={filter === branch.id ? 'active' : ''}
            style={{ '--branch': branch.color } as React.CSSProperties}
            onClick={() => setFilter(branch.id)}
          >
            <i aria-hidden="true" /> {branch.label}
          </button>
        ))}
      </div>

      <section className="timeline" aria-label="Hitos normativos">
        {TIMELINE_ERAS.map((era) => {
          const events = visibleEvents.filter((event) => event.year >= era.from && event.year <= era.to)
          if (events.length === 0) return null
          return (
            <div className="tl-era" key={era.id} id={`era-${era.id}`}>
              <div className="tl-era-head" data-reveal>
                <span>{era.range}</span>
                <h2>{era.title}</h2>
                <p>{era.summary}</p>
              </div>
              <ol>
                {events.map((event, index) => {
                  const branch = findBranch(event.branch)
                  const norm = event.normId ? findNorm(event.normId) : undefined
                  return (
                    <li
                      key={`${event.year}-${event.title}`}
                      className="tl-event"
                      data-reveal
                      style={{ '--branch': branch.color, '--delay': `${(index % 4) * 70}ms` } as React.CSSProperties}
                    >
                      <span className="tl-dot" aria-hidden="true">{event.year}</span>
                      <article>
                        <header>
                          <span className="tl-branch">{branch.label}</span>
                          <h3>{event.title}</h3>
                        </header>
                        <p>{event.summary}</p>
                        <p className="tl-impact"><Sparkles size={14} aria-hidden="true" /> {event.impact}</p>
                        {norm && (
                          <button type="button" className="tl-norm" onClick={() => onOpenNorm(norm.id)}>
                            <Scale size={14} aria-hidden="true" /> {norm.shortName} <ChevronRight size={14} aria-hidden="true" />
                          </button>
                        )}
                      </article>
                    </li>
                  )
                })}
              </ol>
            </div>
          )
        })}
      </section>

      <section className="tree-section" aria-labelledby="tree-title">
        <header className="section-head" data-reveal>
          <span className="eyebrow"><GitBranch size={15} aria-hidden="true" /> Árbol de especialización</span>
          <h2 id="tree-title">Del tronco legal a las especialidades y sus prioridades</h2>
          <p>Toque una rama para ver qué especialidades nacieron de ella, qué roles las ejercen y qué priorizar hoy.</p>
        </header>
        <div className="tree-layout">
          <SpecializationTree selected={selected} onSelect={setSelected} />
          <BranchDetail branch={findBranch(selected)} />
        </div>
      </section>
    </div>
  )
}

function SpecializationTree({ selected, onSelect }: { selected: BranchId; onSelect: (id: BranchId) => void }) {
  const rowHeight = 30
  const specRows = TIMELINE_BRANCHES.flatMap((branch) => branch.specializations.map((spec) => ({ branch, spec })))
  const height = specRows.length * rowHeight + 30
  const trunk = { x: 92, y: height / 2 }
  let cursor = 0
  const branchNodes = TIMELINE_BRANCHES.map((branch) => {
    const ys = branch.specializations.map(() => {
      cursor += 1
      return cursor * rowHeight
    })
    return { branch, y: ys.reduce((sum, y) => sum + y, 0) / ys.length, specYs: ys }
  })

  return (
    <svg className="spec-tree" viewBox={`0 0 760 ${height}`} role="img" aria-label="Árbol de ramas normativas y especialidades">
      <defs>
        <linearGradient id="trunk-grad" x1="0" x2="1">
          <stop offset="0" stopColor="#1857bd" />
          <stop offset="1" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>
      {branchNodes.map(({ branch, y, specYs }) => {
        const active = branch.id === selected
        return (
          <g key={branch.id} className={`tree-branch ${active ? 'active' : ''}`} onClick={() => onSelect(branch.id)} style={{ '--branch': branch.color } as React.CSSProperties}>
            <path className="tree-link" d={`M${trunk.x + 70},${trunk.y} C${trunk.x + 150},${trunk.y} ${250},${y} ${318},${y}`} />
            {specYs.map((specY, index) => (
              <g key={branch.specializations[index].name}>
                <path className="tree-link thin" d={`M${470},${y} C${520},${y} ${520},${specY} ${560},${specY}`} />
                <circle cx={566} cy={specY} r={5} className="tree-leaf" />
                <text x={578} y={specY + 4} className="tree-spec">{branch.specializations[index].name}</text>
              </g>
            ))}
            <rect x={318} y={y - 15} width={152} height={30} rx={15} className="tree-node" />
            <text x={394} y={y + 4} textAnchor="middle" className="tree-label">{branch.label.replace(' (tronco)', '')}</text>
          </g>
        )
      })}
      <g className="tree-trunk">
        <rect x={trunk.x - 80} y={trunk.y - 34} width={150} height={68} rx={18} fill="url(#trunk-grad)" />
        <text x={trunk.x - 5} y={trunk.y - 6} textAnchor="middle">Ley N.° 29783</text>
        <text x={trunk.x - 5} y={trunk.y + 14} textAnchor="middle" className="small">SGSST · 2011</text>
      </g>
    </svg>
  )
}

function BranchDetail({ branch }: { branch: TimelineBranch }) {
  const events = TIMELINE_EVENTS.filter((event) => event.branch === branch.id)
  return (
    <aside className="branch-detail" style={{ '--branch': branch.color } as React.CSSProperties} key={branch.id}>
      <h3>{branch.label}</h3>
      <p>{branch.description}</p>
      <p className="branch-origin">
        <History size={14} aria-hidden="true" /> {events.length} hitos · desde {events[0]?.year ?? '—'}
      </p>
      {branch.specializations.map((spec) => (
        <div className="spec-card" key={spec.name}>
          <h4>{spec.name}</h4>
          <p className="spec-roles">{spec.roles.join(' · ')}</p>
          <ul>
            {spec.priorities.map((priority) => (
              <li key={priority}><Target size={13} aria-hidden="true" /> {priority}</li>
            ))}
          </ul>
        </div>
      ))}
    </aside>
  )
}

export default EvolutionView
