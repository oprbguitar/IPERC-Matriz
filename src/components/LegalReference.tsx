import { ExternalLink } from 'lucide-react'
import { findNorm, VERIFICATION_NOTICE } from '../data/legalDatabase'

interface LegalReferenceProps {
  /** Identificador de la norma en el catálogo legal. */
  normId: string
  /** Texto a mostrar. Por defecto el nombre corto de la norma. */
  label?: string
  /** Artículo verificado en la fuente oficial, por ejemplo "artículo 33". */
  article?: string
  /** Variante compacta para usar dentro de listas densas. */
  compact?: boolean
}

/**
 * Enlace normativo en línea.
 *
 * Siempre apunta a la fuente oficial registrada en el catálogo legal:
 * ningun componente debe escribir una URL legal por su cuenta.
 */
export function LegalReference({ normId, label, article, compact = false }: LegalReferenceProps) {
  const norm = findNorm(normId)

  if (!norm) {
    return <span className="legal-ref legal-ref-missing">{label ?? normId} · {VERIFICATION_NOTICE}</span>
  }

  const text = label ?? (article ? `${article} de la ${norm.shortName}` : norm.shortName)
  const ariaLabel = `${text}. Abrir la fuente oficial de ${norm.officialTitle} en una pestana nueva.`

  return (
    <a
      className={`legal-ref${compact ? ' compact' : ''}`}
      href={norm.officialPageUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      title={norm.officialTitle}
    >
      {text}
      <ExternalLink size={compact ? 12 : 13} aria-hidden="true" />
    </a>
  )
}

export default LegalReference
