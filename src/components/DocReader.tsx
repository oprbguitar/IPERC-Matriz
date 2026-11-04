import { Download, FileDown, FileText, Printer, X } from 'lucide-react'
import { useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { trackDownload } from '../lib/api'
import { downloadMarkdown, downloadWord, printPdf } from '../lib/docgen'
import { markdownToHtml } from '../lib/markdown'

interface DocActionsProps {
  id: string
  title: string
  markdown: string
  compact?: boolean
}

/** Botones de descarga Word / Markdown / PDF para un documento Markdown. */
export function DocActions({ id, title, markdown, compact }: DocActionsProps) {
  return (
    <div className={`doc-actions ${compact ? 'compact' : ''}`}>
      <button
        type="button"
        onClick={() => {
          downloadWord(title, markdown)
          trackDownload(`${id}-word`)
        }}
        title="Descargar en Word"
      >
        <FileDown size={15} aria-hidden="true" /> Word
      </button>
      <button
        type="button"
        onClick={() => {
          printPdf(title, markdown)
          trackDownload(`${id}-pdf`)
        }}
        title="Imprimir o guardar como PDF"
      >
        <Printer size={15} aria-hidden="true" /> PDF
      </button>
      {!compact && (
        <button
          type="button"
          onClick={() => {
            downloadMarkdown(title, markdown)
            trackDownload(`${id}-md`)
          }}
          title="Descargar en Markdown"
        >
          <FileText size={15} aria-hidden="true" /> .md
        </button>
      )}
    </div>
  )
}

interface DocReaderProps {
  id: string
  title: string
  subtitle?: string
  markdown: string
  /** Versión ampliada para descargar (manual completo); si no existe se descarga lo que se lee. */
  fullMarkdown?: string
  onClose: () => void
}

/** Lector a pantalla completa con indice lateral generado desde los titulos. */
export function DocReader({ id, title, subtitle, markdown, fullMarkdown, onClose }: DocReaderProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const html = useMemo(() => markdownToHtml(markdown), [markdown])
  const headings = useMemo(
    () => [...markdown.matchAll(/^##\s+(.*)$/gm)].map((match, index) => ({ index, text: match[1].replace(/\*\*/g, '') })),
    [markdown],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.classList.add('no-scroll')
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.classList.remove('no-scroll')
    }
  }, [onClose])

  function jumpTo(index: number) {
    bodyRef.current?.querySelectorAll('h2')[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Portal al body: las animaciones con transform de la vista romperian position: fixed.
  return createPortal(
    <div className="reader-overlay" role="dialog" aria-modal="true" aria-label={title} onClick={onClose}>
      <div className="reader-panel" onClick={(event) => event.stopPropagation()}>
        <header className="reader-head">
          <div>
            <small>{subtitle ?? 'Documento del Observatorio'}</small>
            <h2>{title}</h2>
          </div>
          <DocActions id={id} title={title} markdown={fullMarkdown ?? markdown} />
          <button type="button" className="reader-close" onClick={onClose} aria-label="Cerrar lector">
            <X size={20} />
          </button>
        </header>
        {fullMarkdown && (
          <p className="reader-extended">
            La descarga en Word o PDF incluye el <b>manual ampliado</b>: procedimiento detallado, ejemplos, errores frecuentes,
            listas de verificación y anexos que no se muestran en esta lectura rápida.
          </p>
        )}
        <div className="reader-layout">
          {headings.length > 2 && (
            <nav className="reader-toc" aria-label="Contenido">
              <b>Contenido</b>
              {headings.map((heading) => (
                <button type="button" key={heading.index} onClick={() => jumpTo(heading.index)}>
                  {heading.text}
                </button>
              ))}
            </nav>
          )}
          <article ref={bodyRef} className="md-body" dangerouslySetInnerHTML={{ __html: html }} />
        </div>
        <footer className="reader-foot">
          <Download size={14} aria-hidden="true" /> Documento orientativo. Verifique el texto vigente de cada norma en la fuente oficial.
        </footer>
      </div>
    </div>,
    document.body,
  )
}
