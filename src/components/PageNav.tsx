import { ArrowLeft, ArrowRight, ChevronRight, Home } from 'lucide-react'
import { NAV_ITEMS, pathFor, SPACES, spaceOf, type SiteViewId } from '../data/platformContent'

const labelOf = (id: SiteViewId) => NAV_ITEMS.find((item) => item.id === id)?.label ?? id
const hintOf = (id: SiteViewId) => NAV_ITEMS.find((item) => item.id === id)?.description ?? ''

interface PageNavProps {
  view: SiteViewId
  premium: boolean
  onNavigate: (view: SiteViewId) => void
}

/**
 * Barra de orientación superior: volver, ruta de migas y posición dentro del recorrido.
 * Responde siempre a «dónde estoy», «cómo vuelvo» y «qué sigue».
 */
export function PageTrail({ view, premium, onNavigate }: PageNavProps) {
  const path = pathFor(premium)
  const index = path.indexOf(view)
  const space = SPACES.find((item) => item.id === spaceOf(view))
  const next = index >= 0 ? path[index + 1] : undefined

  return (
    <nav className="page-trail" aria-label="Ubicación">
      <button type="button" className="trail-back" onClick={() => window.history.back()} title="Volver a la página anterior (Alt + ←)">
        <ArrowLeft size={16} aria-hidden="true" /> <span>Volver</span>
      </button>
      <ol className="trail-crumbs">
        <li>
          <button type="button" onClick={() => onNavigate('inicio')}>
            <Home size={14} aria-hidden="true" /> Inicio
          </button>
        </li>
        {space && (
          <li>
            <ChevronRight size={14} aria-hidden="true" />
            <button type="button" onClick={() => onNavigate(space.views[0])}>{space.label}</button>
          </li>
        )}
        <li aria-current="page">
          <ChevronRight size={14} aria-hidden="true" />
          <b>{labelOf(view)}</b>
        </li>
      </ol>
      {index > 0 && (
        <span className="trail-step" aria-label={`Paso ${index} de ${path.length - 1}`}>
          Paso {index} de {path.length - 1}
        </span>
      )}
      {next && (
        <button type="button" className="trail-next" onClick={() => onNavigate(next)} title={hintOf(next)}>
          <span>Siguiente: {labelOf(next)}</span> <ArrowRight size={16} aria-hidden="true" />
        </button>
      )}
    </nav>
  )
}

/** Paginador inferior: anterior y siguiente del recorrido con su descripción. */
export function PagePager({ view, premium, onNavigate }: PageNavProps) {
  const path = pathFor(premium)
  const index = path.indexOf(view)
  if (index < 0) return null
  const prev = path[index - 1]
  const next = path[index + 1]
  const percent = Math.round((index / (path.length - 1)) * 100)

  return (
    <nav className="page-pager" aria-label="Recorrido guiado">
      {prev ? (
        <button type="button" className="pager-prev" onClick={() => onNavigate(prev)}>
          <ArrowLeft size={18} aria-hidden="true" />
          <span>
            <small>Anterior</small>
            <b>{labelOf(prev)}</b>
          </span>
        </button>
      ) : (
        <span />
      )}
      <div className="pager-progress" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
        <small>Recorrido {percent}%</small>
      </div>
      {next ? (
        <button type="button" className="pager-next" onClick={() => onNavigate(next)}>
          <span>
            <small>Siguiente</small>
            <b>{labelOf(next)}</b>
            <em>{hintOf(next)}</em>
          </span>
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      ) : (
        <span />
      )}
    </nav>
  )
}
