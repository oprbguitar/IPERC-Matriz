import { Download, ExternalLink, FileSpreadsheet, FileText, FileType2, Link2, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LegalReference } from '../components/LegalReference'
import {
  PLATFORM_DISCLAIMER,
  TEMPLATE_CATEGORIES,
  TEMPLATES,
  type TemplateCategoryId,
  type TemplateFormat,
} from '../data/platformContent'
import { assetUrl } from '../lib/assets'

const FORMAT_ICON: Record<TemplateFormat, typeof FileSpreadsheet> = {
  xlsx: FileSpreadsheet,
  docx: FileType2,
  pdf: FileText,
  enlace: Link2,
}

const FORMAT_LABEL: Record<TemplateFormat, string> = {
  xlsx: 'Excel',
  docx: 'Word',
  pdf: 'PDF',
  enlace: 'Fuente oficial',
}

export function TemplatesView() {
  const [category, setCategory] = useState<TemplateCategoryId | 'todas'>('todas')
  const [query, setQuery] = useState('')

  const visible = useMemo(
    () =>
      TEMPLATES.filter((item) => {
        const matchesCategory = category === 'todas' || item.category === category
        const haystack = `${item.name} ${item.description} ${item.audience.join(' ')}`.toLowerCase()
        return matchesCategory && haystack.includes(query.toLowerCase())
      }),
    [category, query],
  )

  const downloadable = TEMPLATES.filter((item) => item.file).length

  return (
    <div className="view-page">
      <header className="page-head">
        <div>
          <h1>Plantillas</h1>
          <p>
            {downloadable} archivo(s) se descargan desde esta plataforma. El resto enlaza directamente a los formatos y
            modelos publicados por entidades oficiales, para que siempre use la versión vigente.
          </p>
        </div>
      </header>

      <div className="filter-row">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar plantilla, tema o destinatario"
            aria-label="Buscar plantilla"
          />
        </label>
        <div className="chip-row" role="group" aria-label="Categorías de plantillas">
          <button type="button" className={category === 'todas' ? 'chip active' : 'chip'} onClick={() => setCategory('todas')}>
            Todas
          </button>
          {TEMPLATE_CATEGORIES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={category === item.id ? 'chip active' : 'chip'}
              title={item.description}
              onClick={() => setCategory(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="template-grid">
        {visible.map((item) => {
          const Icon = FORMAT_ICON[item.format]
          const isLocal = Boolean(item.file)
          const href = isLocal ? assetUrl(item.file as string) : item.externalUrl
          return (
            <article className="template-card" key={item.id}>
              <header>
                <span className={`file-chip ${item.format}`} aria-hidden="true">
                  <Icon size={17} />
                </span>
                <span className="format-tag">{FORMAT_LABEL[item.format]}</span>
              </header>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <p className="template-audience">Útil para: {item.audience.join(', ')}.</p>
              <div className="result-links">
                <b>Normativa:</b>
                {item.normIds.map((normId) => (
                  <LegalReference key={normId} normId={normId} compact />
                ))}
              </div>
              <a
                className={isLocal ? 'btn-primary small' : 'btn-secondary small'}
                href={href}
                {...(isLocal ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' })}
              >
                {isLocal ? (
                  <>
                    <Download size={15} aria-hidden="true" /> Descargar
                  </>
                ) : (
                  <>
                    <ExternalLink size={15} aria-hidden="true" /> Abrir fuente oficial
                  </>
                )}
              </a>
            </article>
          )
        })}
        {visible.length === 0 && <p className="empty-note">No se encontraron plantillas con ese criterio.</p>}
      </div>

      <p className="site-disclaimer">{PLATFORM_DISCLAIMER}</p>
    </div>
  )
}

export default TemplatesView
