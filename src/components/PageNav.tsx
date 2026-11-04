import { ArrowLeft, ChevronRight } from 'lucide-react'
import { NAV_ITEMS, SPACES, spaceOf, type SiteViewId } from '../data/platformContent'

const labelOf = (id: SiteViewId) => NAV_ITEMS.find((item) => item.id === id)?.label ?? id

interface PageTrailProps {
  view: SiteViewId
  onNavigate: (view: SiteViewId) => void
}

/** Línea discreta sobre el contenido: flecha para volver y ubicación actual. */
export function PageTrail({ view, onNavigate }: PageTrailProps) {
  const space = SPACES.find((item) => item.id === spaceOf(view))
  return (
    <nav className="page-trail" aria-label="Ubicación">
      <button type="button" className="trail-back" onClick={() => window.history.back()} title="Volver a la página anterior">
        <ArrowLeft size={15} aria-hidden="true" /> Volver
      </button>
      <span className="trail-sep" aria-hidden="true" />
      <button type="button" className="trail-link" onClick={() => onNavigate('inicio')}>Inicio</button>
      {space && (
        <>
          <ChevronRight size={13} aria-hidden="true" />
          <span className="trail-space">{space.label}</span>
        </>
      )}
      <ChevronRight size={13} aria-hidden="true" />
      <b aria-current="page">{labelOf(view)}</b>
    </nav>
  )
}
