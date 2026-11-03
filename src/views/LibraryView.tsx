import { BookOpen, Clock, FileBarChart2, FileSpreadsheet, FolderDown, LibraryBig, Search, Sparkles } from 'lucide-react'
import { useMemo, useState } from 'react'
import { DocActions, DocReader } from '../components/DocReader'
import { findNorm } from '../data/legalDatabase'
import { GUIDES } from '../data/guides'
import type { DiagnosticAnswers } from '../lib/diagnostic'
import { trackDownload } from '../lib/api'
import { downloadExcel } from '../lib/docgen'
import { REPORTS } from '../lib/reports'
import { advancedTemplates } from '../lib/templateBuilder'
import TemplatesView from './TemplatesView'

export type LibraryTab = 'guias' | 'avanzadas' | 'informes' | 'plantillas'

interface LibraryViewProps {
  tab: LibraryTab
  onTabChange: (tab: LibraryTab) => void
  answers: DiagnosticAnswers
  openGuideId?: string
  onGuideOpened?: () => void
}

const TABS: Array<{ id: LibraryTab; label: string; icon: typeof BookOpen }> = [
  { id: 'guias', label: 'Guías', icon: BookOpen },
  { id: 'informes', label: 'Informes', icon: FileBarChart2 },
  { id: 'avanzadas', label: 'Plantillas avanzadas', icon: Sparkles },
  { id: 'plantillas', label: 'Plantillas', icon: FolderDown },
]

export function LibraryView({ tab, onTabChange, answers, openGuideId, onGuideOpened }: LibraryViewProps) {
  const [query, setQuery] = useState('')
  const templates = useMemo(advancedTemplates, [])
  const [reader, setReader] = useState<{ id: string; title: string; subtitle: string; markdown: string } | null>(() => {
    const guide = GUIDES.find((item) => item.id === openGuideId)
    return guide ? { id: guide.id, title: guide.title, subtitle: 'Guía del Observatorio', markdown: guide.body } : null
  })

  const guides = useMemo(
    () =>
      GUIDES.filter((guide) =>
        `${guide.title} ${guide.summary} ${guide.audience}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  )

  return (
    <div className="view-page library">
      <header className="page-head">
        <div>
          <span className="eyebrow"><LibraryBig size={15} aria-hidden="true" /> Biblioteca</span>
          <h1>Guías, informes y plantillas</h1>
          <p>Lea en línea o descargue en Word, PDF o Markdown. Todo se adapta a cualquier empresa o institución.</p>
        </div>
        <div className="tab-switch" role="tablist" aria-label="Secciones de la biblioteca">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              role="tab"
              key={id}
              aria-selected={tab === id}
              className={tab === id ? 'active' : ''}
              onClick={() => onTabChange(id)}
            >
              <Icon size={16} aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </header>

      <section className="provenance" aria-label="Procedencia de los documentos">
        <div><b>Formatos oficiales</b><small>Enlaces directos a MTPE, SUNAFIL, SERVIR, MINSA y MINAM: siempre la versión vigente publicada por la entidad.</small></div>
        <div><b>Plantillas propias</b><small>Excel IPERC y guía Word elaborados por el Observatorio; código abierto en GitHub (oprbguitar/IPERC-Matriz).</small></div>
        <div><b>Documentos generados</b><small>Guías e informes que se arman en su navegador desde el catálogo normativo verificado y sus respuestas; nada se envía a terceros.</small></div>
        <div><b>Contenido ISO</b><small>Paráfrasis interpretativa de los cursos SSOMA 2026 y Sistemas Integrados (oprbguitar), sin reproducir texto ISO.</small></div>
      </section>

      {tab === 'guias' && (
        <>
          <label className="search-inline">
            <Search size={16} aria-hidden="true" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar guía por tema o público" />
          </label>
          <div className="guide-grid">
            {guides.map((guide, index) => (
              <article className="guide-card" key={guide.id} style={{ '--i': index } as React.CSSProperties}>
                <header>
                  <span className="guide-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="guide-time"><Clock size={13} aria-hidden="true" /> {guide.minutes} min</span>
                </header>
                <h3>{guide.title}</h3>
                <p>{guide.summary}</p>
                <small className="guide-audience">{guide.audience}</small>
                <div className="guide-norms">
                  {guide.normIds.slice(0, 3).map((id) => (
                    <span key={id}>{findNorm(id)?.shortName ?? id}</span>
                  ))}
                </div>
                <footer>
                  <button
                    type="button"
                    className="btn-primary small"
                    onClick={() => setReader({ id: guide.id, title: guide.title, subtitle: guide.audience, markdown: guide.body })}
                  >
                    <BookOpen size={15} aria-hidden="true" /> Leer
                  </button>
                  <DocActions id={guide.id} title={guide.title} markdown={guide.body} compact />
                </footer>
              </article>
            ))}
          </div>
        </>
      )}

      {tab === 'informes' && (
        <div className="report-cards">
          {REPORTS.map((report) => {
            const markdown = report.build(answers)
            return (
              <article className="report-card" key={report.id}>
                <FileBarChart2 size={26} aria-hidden="true" />
                <div>
                  <h3>{report.title}</h3>
                  <p>{report.summary}</p>
                </div>
                <footer>
                  <button
                    type="button"
                    className="btn-secondary small"
                    onClick={() => setReader({ id: report.id, title: report.title, subtitle: 'Informe generado', markdown })}
                  >
                    Vista previa
                  </button>
                  <DocActions id={report.id} title={report.title} markdown={markdown} compact />
                </footer>
              </article>
            )
          })}
          <p className="site-disclaimer">
            El informe de diagnóstico usa sus respuestas de Mi Ruta (se guardan solo en este navegador).
          </p>
        </div>
      )}

      {tab === 'avanzadas' && (
        <section className="advanced-templates">
          <p className="adv-intro">
            Plantillas detalladas listas para usar: control documental, base legal con artículos cotejados, instrucciones de llenado, filas numeradas y firmas.
            Descárguelas en <b>Word</b> (editable), <b>Excel</b> (tablas) o <b>PDF</b>. Son plantillas propias del Observatorio, no formatos oficiales.
          </p>
          <div className="guide-grid">
            {templates.map((template, index) => (
              <article className="guide-card adv-card" key={template.id} style={{ '--i': index } as React.CSSProperties}>
                <header>
                  <span className="guide-index">{template.topic}</span>
                  {template.sheet && <span className="guide-time"><FileSpreadsheet size={13} aria-hidden="true" /> Excel</span>}
                </header>
                <h3>{template.name}</h3>
                <p>{template.summary}</p>
                <small className="guide-audience">{template.basis[0]}</small>
                <footer>
                  <button type="button" className="btn-secondary small" onClick={() => setReader({ id: template.id, title: template.name, subtitle: 'Plantilla avanzada', markdown: template.markdown })}>
                    Vista previa
                  </button>
                  <div className="doc-actions compact">
                    <DocActions id={template.id} title={template.name} markdown={template.markdown} compact />
                    {template.sheet && (
                      <button
                        type="button"
                        onClick={() => {
                          downloadExcel(template.name, [['Plantilla', 'Observatorio SST Perú (propia, no oficial)'], ['Base legal', template.basis.join(' | ')]], template.sheet!.columns, template.sheet!.rows)
                          trackDownload(`${template.id}-excel`)
                        }}
                      >
                        <FileSpreadsheet size={15} aria-hidden="true" /> Excel
                      </button>
                    )}
                  </div>
                </footer>
              </article>
            ))}
          </div>
        </section>
      )}

      {tab === 'plantillas' && <TemplatesView />}

      {reader && (
        <DocReader
          id={reader.id}
          title={reader.title}
          subtitle={reader.subtitle}
          markdown={reader.markdown}
          onClose={() => {
            setReader(null)
            onGuideOpened?.()
          }}
        />
      )}
    </div>
  )
}

export default LibraryView
