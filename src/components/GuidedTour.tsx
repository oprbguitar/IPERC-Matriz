import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useState } from 'react'

export interface TourStep {
  /** Selector CSS del elemento a resaltar; sin selector se muestra centrado. */
  target?: string
  title: string
  body: string
}

const storageKey = (id: string) => `obs-tour-${id}`

export function tourSeen(id: string): boolean {
  try {
    return localStorage.getItem(storageKey(id)) === '1'
  } catch {
    return true
  }
}

/**
 * Guía paso a paso: oscurece la pantalla, resalta un elemento y explica qué hace.
 * Se muestra sola la primera vez (por usuario y navegador) y se puede repetir con «Ver guía».
 */
export function GuidedTour({ id, steps, open, onClose }: { id: string; steps: TourStep[]; open: boolean; onClose: () => void }) {
  const [index, setIndex] = useState(0)
  const [rect, setRect] = useState<DOMRect | null>(null)
  const step = steps[index]

  const finish = useCallback(() => {
    try {
      localStorage.setItem(storageKey(id), '1')
    } catch {
      /* sin almacenamiento: la guía volverá a mostrarse */
    }
    setIndex(0)
    onClose()
  }, [id, onClose])

  useLayoutEffect(() => {
    if (!open || !step) return
    const element = step.target ? document.querySelector<HTMLElement>(step.target) : null
    if (!element) {
      setRect(null)
      return
    }
    element.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const update = () => setRect(element.getBoundingClientRect())
    const timer = window.setTimeout(update, 320)
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
    }
  }, [open, step])

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') finish()
      if (event.key === 'ArrowRight') setIndex((value) => Math.min(value + 1, steps.length - 1))
      if (event.key === 'ArrowLeft') setIndex((value) => Math.max(value - 1, 0))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, finish, steps.length])

  if (!open || !step) return null
  const pad = 8
  const narrow = window.innerWidth < 640
  const below = rect ? rect.bottom + 220 < window.innerHeight : true
  const cardStyle: React.CSSProperties = rect && !narrow
    ? {
        top: below ? rect.bottom + pad + 10 : Math.max(12, rect.top - pad - 10 - 200),
        left: Math.min(Math.max(12, rect.left), window.innerWidth - 372),
      }
    : {}

  return (
    <div className="tour-layer" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {rect ? (
        <div className="tour-hole" style={{ top: rect.top - pad, left: rect.left - pad, width: rect.width + pad * 2, height: rect.height + pad * 2 }} />
      ) : (
        <div className="tour-dim" />
      )}
      <div className={`tour-card ${rect && !narrow ? '' : 'centered'}`} style={cardStyle}>
        <div className="tour-top">
          <span>Paso {index + 1} de {steps.length}</span>
          <button type="button" className="icon-btn" aria-label="Cerrar guía" onClick={finish}><X size={16} /></button>
        </div>
        <h3 id="tour-title">{step.title}</h3>
        <p>{step.body}</p>
        <div className="tour-dots" aria-hidden="true">{steps.map((_, dot) => <i key={dot} className={dot === index ? 'on' : ''} />)}</div>
        <div className="tour-actions">
          <button type="button" className="btn-ghost small" onClick={finish}>Saltar</button>
          {index > 0 && <button type="button" className="btn-secondary small" onClick={() => setIndex(index - 1)}><ChevronLeft size={15} /> Atrás</button>}
          {index < steps.length - 1 ? (
            <button type="button" className="btn-primary small" onClick={() => setIndex(index + 1)}>Siguiente <ChevronRight size={15} /></button>
          ) : (
            <button type="button" className="btn-primary small" onClick={finish}>¡Listo!</button>
          )}
        </div>
      </div>
    </div>
  )
}
