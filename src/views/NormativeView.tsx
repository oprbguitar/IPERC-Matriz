import { CalendarCheck, ChevronDown, LayoutGrid, List, Search } from 'lucide-react'
import { NormLinks } from '../components/NormLinks'
import { SOURCES_GENERATED_AT } from '../data/normLinks'
import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import {
  LEGAL_CATALOGUE_VERIFIED_AT,
  LEGAL_CATEGORY_LABELS,
  LEGAL_STATUS_LABELS,
  legalNorms,
  sectoralNormIdsBySector,
  sectorModules,
} from '../data/legalDatabase'
import {
  findTemplate,
  OBLIGATION_KIND_HELP,
  OBLIGATION_KIND_LABELS,
  PLATFORM_DISCLAIMER,
  ROUTE_CARDS,
  type SiteViewId,
} from '../data/platformContent'
import { assetUrl } from '../lib/assets'
import type { LegalCategory, LegalEffectiveStatus } from '../types'

type SortMode = 'relevancia' | 'fecha'

const IsoView = lazy(() => import('./IsoView'))

interface NormativeViewProps {
  focusNormId?: string
  onNavigate: (view: SiteViewId) => void
}

export function NormativeView({ focusNormId, onNavigate }: NormativeViewProps) {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<LegalCategory | 'todas'>('todas')
  const [sector, setSector] = useState<string>('todos')
  const [status, setStatus] = useState<LegalEffectiveStatus | 'todos'>('todos')
  const [sort, setSort] = useState<SortMode>('relevancia')
  const [expanded, setExpanded] = useState<string | null>(focusNormId ?? null)
  const [layout, setLayout] = useState<'list' | 'grid'>('list')
  const [section, setSection] = useState<'peru' | 'iso'>('peru')

  useEffect(() => {
    if (focusNormId) setExpanded(focusNormId)
  }, [focusNormId])

  const visible = useMemo(() => {
    const sectorAllowed =
      sector === 'todos' ? null : new Set([...(sectoralNormIdsBySector[sector] ?? [])])

    const filtered = legalNorms.filter((norm) => {
      const haystack = `${norm.shortName} ${norm.officialTitle} ${norm.keyTopics.join(' ')} ${norm.plainLanguageSummary}`.toLowerCase()
      const matchesQuery = haystack.includes(query.toLowerCase())
      const matchesCategory = category === 'todas' || norm.category === category
      const matchesStatus = status === 'todos' || norm.effectiveStatus === status
      // Un sector concreto muestra el marco general mas sus normas sectoriales.
      const matchesSector = !sectorAllowed || norm.category !== 'sectoral' || sectorAllowed.has(norm.id)
      return matchesQuery && matchesCategory && matchesStatus && matchesSector
    })

    if (sort === 'fecha') {
      return [...filtered].sort((a, b) => (b.publicationDate ?? '').localeCompare(a.publicationDate ?? ''))
    }
    return filtered
  }, [query, category, sector, status, sort])

  return (
    <div className="view-page">
      <header className="page-head">
        <div>
          <h1>Normativa peruana</h1>
          <p>
            Catálogo de normas de seguridad y salud en el trabajo y de ambiente, con enlace directo a la fuente oficial.
            Última revisión del catálogo: {LEGAL_CATALOGUE_VERIFIED_AT}. Enlaces verificados automáticamente el{' '}
            {SOURCES_GENERATED_AT.slice(0, 10)}.
          </p>
        </div>
        <div className="tab-switch" role="tablist" aria-label="Tipo de normativa">
          <button type="button" role="tab" aria-selected={section === 'peru'} className={section === 'peru' ? 'active' : ''} onClick={() => setSection('peru')}>
            Normas peruanas
          </button>
          <button type="button" role="tab" aria-selected={section === 'iso'} className={section === 'iso' ? 'active' : ''} onClick={() => setSection('iso')}>
            ISO y sistemas integrados
          </button>
        </div>
      </header>

      {section === 'iso' ? (
        <Suspense fallback={<p className="empty-note">Cargando normas ISO…</p>}>
          <IsoView />
        </Suspense>
      ) : (
      <>
      <div className="filter-row">
        <label className="search-field">
          <Search size={16} aria-hidden="true" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por número, título o tema"
            aria-label="Buscar norma"
          />
        </label>
        <label>
          <span>Categoría</span>
          <select value={category} onChange={(event) => setCategory(event.target.value as LegalCategory | 'todas')}>
            <option value="todas">Todas</option>
            {(Object.keys(LEGAL_CATEGORY_LABELS) as LegalCategory[]).map((key) => (
              <option key={key} value={key}>
                {LEGAL_CATEGORY_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Sector</span>
          <select value={sector} onChange={(event) => setSector(event.target.value)}>
            <option value="todos">Todos los sectores</option>
            {sectorModules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Estado</span>
          <select value={status} onChange={(event) => setStatus(event.target.value as LegalEffectiveStatus | 'todos')}>
            <option value="todos">Todos</option>
            {(Object.keys(LEGAL_STATUS_LABELS) as LegalEffectiveStatus[]).map((key) => (
              <option key={key} value={key}>
                {LEGAL_STATUS_LABELS[key]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span>Ordenar</span>
          <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)}>
            <option value="relevancia">Relevancia</option>
            <option value="fecha">Fecha de publicación</option>
          </select>
        </label>
        <div className="layout-toggle" role="group" aria-label="Vista">
          <button type="button" className={layout === 'list' ? 'active' : ''} onClick={() => setLayout('list')}><List size={15} aria-hidden="true" /> Lista</button>
          <button type="button" className={layout === 'grid' ? 'active' : ''} onClick={() => setLayout('grid')}><LayoutGrid size={15} aria-hidden="true" /> Cuadros</button>
        </div>
        <p className="filter-count">{visible.length} norma(s)</p>
      </div>

      <div className={`norm-list ${layout === 'grid' ? 'as-grid' : ''}`}>
        {visible.map((norm) => {
          const isOpen = expanded === norm.id
          const routeCard = ROUTE_CARDS.find((card) => card.id === norm.relatedRouteId)
          return (
            <article className={`legal-card${isOpen ? ' open' : ''}`} key={norm.id} id={`norma-${norm.id}`}>
              <header>
                <div>
                  <h2>{norm.shortName}</h2>
                  <p className="legal-official-title">{norm.officialTitle}</p>
                </div>
                <div className="legal-badges">
                  <span className={`status-tag ${norm.effectiveStatus}`}>{LEGAL_STATUS_LABELS[norm.effectiveStatus]}</span>
                  <span className={`kind-tag ${norm.obligationKind}`} title={OBLIGATION_KIND_HELP[norm.obligationKind]}>
                    {OBLIGATION_KIND_LABELS[norm.obligationKind]}
                  </span>
                </div>
              </header>

              <p className="legal-summary">{norm.plainLanguageSummary}</p>

              <ul className="legal-meta">
                <li>
                  <b>Tema principal</b>
                  {LEGAL_CATEGORY_LABELS[norm.category]}
                </li>
                <li>
                  <b>Ámbito de aplicación</b>
                  {norm.appliesTo.join(', ')}
                </li>
                <li>
                  <b>Autoridad</b>
                  {norm.authority}
                </li>
                <li>
                  <CalendarCheck size={14} aria-hidden="true" /> Verificado el {norm.lastVerifiedAt}
                </li>
              </ul>

              <div className="legal-actions">
                <NormLinks norm={norm} />
                <button
                  type="button"
                  className="btn-ghost small"
                  aria-expanded={isOpen}
                  aria-controls={`regula-${norm.id}`}
                  onClick={() => setExpanded(isOpen ? null : norm.id)}
                >
                  ¿Qué regula? <ChevronDown size={15} aria-hidden="true" className={isOpen ? 'rotated' : ''} />
                </button>
              </div>

              {isOpen && (
                <div className="legal-detail" id={`regula-${norm.id}`}>
                  <ul>
                    {norm.whatItRegulates.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                  {norm.notes && <p className="legal-note">{norm.notes}</p>}
                  <div className="legal-detail-links">
                    {norm.relatedTemplateIds && norm.relatedTemplateIds.length > 0 && (
                      <div className="result-links">
                        <b>Plantillas relacionadas:</b>
                        {norm.relatedTemplateIds.map((templateId) => {
                          const template = findTemplate(templateId)
                          if (!template) return null
                          const href = template.file ? assetUrl(template.file) : template.externalUrl
                          return (
                            <a
                              key={templateId}
                              className="template-link"
                              href={href}
                              {...(template.file ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' })}
                            >
                              {template.name}
                            </a>
                          )
                        })}
                      </div>
                    )}
                    {routeCard && (
                      <div className="result-links">
                        <b>Paso de la ruta:</b>
                        <button type="button" className="template-link" onClick={() => onNavigate(routeCard.primaryAction.view)}>
                          {routeCard.title}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
        {visible.length === 0 && <p className="empty-note">No hay normas que coincidan con los filtros.</p>}
      </div>
      </>
      )}

      <p className="site-disclaimer">{PLATFORM_DISCLAIMER}</p>
    </div>
  )
}

export default NormativeView
