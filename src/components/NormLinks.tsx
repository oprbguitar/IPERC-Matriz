import { BookMarked, ExternalLink, FileText, Landmark, Newspaper } from 'lucide-react'
import { useState } from 'react'
import { consolidatedUrl, normSource, SPIJ_HOME, spijUrl } from '../data/normLinks'
import type { LegalNorm } from '../types'

/** Fila de enlaces directos de una norma: oficial, PDF, El Peruano, concordado y SPIJ. */
export function NormLinks({ norm }: { norm: LegalNorm }) {
  const [copied, setCopied] = useState(false)
  const source = normSource(norm.id)
  const pdf = norm.officialDocumentUrl ?? source?.pdfUrl ?? undefined
  const peruano = source?.elPeruanoUrl ?? undefined
  const concordado = consolidatedUrl(norm.id)
  const spij = spijUrl(norm.id)

  async function openSpij() {
    try {
      await navigator.clipboard.writeText(norm.shortName)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2500)
    } catch {
      // Sin permiso de portapapeles: se abre igual el SPIJ.
    }
    window.open(SPIJ_HOME, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="norm-links">
      <a className="nl-main" href={norm.officialPageUrl} target="_blank" rel="noopener noreferrer">
        <ExternalLink size={14} aria-hidden="true" /> Fuente oficial
      </a>
      {pdf && pdf !== norm.officialPageUrl && (
        <a href={pdf} target="_blank" rel="noopener noreferrer">
          <FileText size={14} aria-hidden="true" /> PDF
        </a>
      )}
      {peruano && peruano !== norm.officialPageUrl && (
        <a href={peruano} target="_blank" rel="noopener noreferrer">
          <Newspaper size={14} aria-hidden="true" /> El Peruano
        </a>
      )}
      {concordado && (
        <a href={concordado} target="_blank" rel="noopener noreferrer">
          <BookMarked size={14} aria-hidden="true" /> Texto concordado
        </a>
      )}
      {spij ? (
        <a href={spij} target="_blank" rel="noopener noreferrer">
          <Landmark size={14} aria-hidden="true" /> SPIJ
        </a>
      ) : (
        <button type="button" onClick={openSpij} title="Abre el SPIJ (acceso libre) y copia el número de la norma para buscarla">
          <Landmark size={14} aria-hidden="true" /> {copied ? 'Número copiado' : 'SPIJ'}
        </button>
      )}
      {source && (
        <small className={`nl-check ${source.ok ? 'ok' : 'bad'}`} title={source.title ?? undefined}>
          {source.ok ? '● enlace verificado' : '● revisar enlace'} {source.checkedAt}
        </small>
      )}
    </div>
  )
}

export default NormLinks
