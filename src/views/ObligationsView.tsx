import { Leaf, ShieldCheck } from 'lucide-react'
import { useMemo, useState } from 'react'
import { LegalReference } from '../components/LegalReference'
import { sectorModules } from '../data/legalDatabase'
import {
  AUDIENCES,
  findTemplate,
  OBLIGATION_KIND_HELP,
  OBLIGATION_KIND_LABELS,
  OBLIGATIONS,
  PLATFORM_DISCLAIMER,
  SIZE_BANDS,
  SOMA_DISCLAIMER,
  SOMA_TOPICS,
  type AudienceId,
  type SizeBandId,
} from '../data/platformContent'
import { assetUrl } from '../lib/assets'

export type ObligationsTab = 'sst' | 'soma'

interface ObligationsViewProps {
  tab: ObligationsTab
  onTabChange: (tab: ObligationsTab) => void
  defaultSize?: SizeBandId
  defaultSector?: string
}

export function ObligationsView({ tab, onTabChange, defaultSize, defaultSector }: ObligationsViewProps) {
  const [size, setSize] = useState<SizeBandId>(defaultSize ?? 'medium')
  const [sector, setSector] = useState<string>(defaultSector ?? 'offices')
  const [audience, setAudience] = useState<AudienceId | 'todos'>('todos')

  const visible = useMemo(
    () =>
      OBLIGATIONS.filter((item) => {
        const matchesSize = item.sizes.includes(size)
        const matchesSector = !item.sectors || item.sectors.includes(sector)
        const matchesAudience = audience === 'todos' || item.audiences.includes(audience)
        return matchesSize && matchesSector && matchesAudience
      }),
    [size, sector, audience],
  )

  const sectorLabel = sectorModules.find((module) => module.id === sector)?.label ?? sector

  return (
    <div className="view-page">
      <header className="page-head">
        <div>
          <h1>Obligaciones</h1>
          <p>Lo que le corresponde según el tamaño de su organización, su actividad económica y su rol.</p>
        </div>
        <div className="tab-switch" role="tablist" aria-label="Tipo de obligaciones">
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'sst'}
            className={tab === 'sst' ? 'active' : ''}
            onClick={() => onTabChange('sst')}
          >
            <ShieldCheck size={16} aria-hidden="true" /> Obligaciones SST
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === 'soma'}
            className={tab === 'soma' ? 'active' : ''}
            onClick={() => onTabChange('soma')}
          >
            <Leaf size={16} aria-hidden="true" /> SOMA y ambiente
          </button>
        </div>
      </header>

      {tab === 'sst' ? (
        <>
          <div className="filter-row">
            <label>
              <span>Tamaño</span>
              <select value={size} onChange={(event) => setSize(event.target.value as SizeBandId)}>
                {SIZE_BANDS.map((band) => (
                  <option key={band.id} value={band.id}>
                    {band.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Sector o actividad</span>
              <select value={sector} onChange={(event) => setSector(event.target.value)}>
                {sectorModules.map((module) => (
                  <option key={module.id} value={module.id}>
                    {module.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Rol</span>
              <select value={audience} onChange={(event) => setAudience(event.target.value as AudienceId | 'todos')}>
                <option value="todos">Todos los roles</option>
                {AUDIENCES.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>
            <p className="filter-count">
              {visible.length} punto(s) para {sectorLabel.toLowerCase()}.
            </p>
          </div>

          <div className="obligation-list">
            {visible.map((item) => (
              <article className="obligation-card" key={item.id}>
                <header>
                  <h2>{item.title}</h2>
                  <span className={`kind-tag ${item.kind}`} title={OBLIGATION_KIND_HELP[item.kind]}>
                    {OBLIGATION_KIND_LABELS[item.kind]}
                  </span>
                </header>
                <p>{item.plainText}</p>
                <dl className="result-grid">
                  <div>
                    <dt>Responsable</dt>
                    <dd>{item.responsible}</dd>
                  </div>
                  <div>
                    <dt>Evidencia esperada</dt>
                    <dd>{item.evidence}</dd>
                  </div>
                  <div>
                    <dt>Plazo o frecuencia</dt>
                    <dd>{item.frequency ?? 'Requiere verificación en la fuente oficial.'}</dd>
                  </div>
                </dl>
                <footer>
                  <div className="result-links">
                    <b>Normativa:</b>
                    {item.normIds.map((normId) => (
                      <LegalReference key={normId} normId={normId} compact />
                    ))}
                  </div>
                  {item.templateIds.length > 0 && (
                    <div className="result-links">
                      <b>Plantillas:</b>
                      {item.templateIds.map((templateId) => {
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
                </footer>
              </article>
            ))}
            {visible.length === 0 && (
              <p className="empty-note">No hay puntos para esa combinación. Pruebe con otro rol o sector.</p>
            )}
          </div>
          <p className="site-disclaimer">{PLATFORM_DISCLAIMER}</p>
        </>
      ) : (
        <>
          <p className="notice-block">{SOMA_DISCLAIMER}</p>
          <div className="soma-grid">
            {SOMA_TOPICS.map((topic) => {
              const Icon = topic.icon
              return (
                <article className="soma-card" key={topic.id}>
                  <header>
                    <span aria-hidden="true">
                      <Icon size={20} />
                    </span>
                    <h2>{topic.title}</h2>
                  </header>
                  <span className={`kind-tag ${topic.kind}`} title={OBLIGATION_KIND_HELP[topic.kind]}>
                    {OBLIGATION_KIND_LABELS[topic.kind]}
                  </span>
                  <p>{topic.description}</p>
                  <ol>
                    {topic.practicalSteps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                  <div className="result-links">
                    <b>Referencia:</b>
                    {topic.normIds.map((normId) => (
                      <LegalReference key={normId} normId={normId} compact />
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
          <p className="site-disclaimer">{PLATFORM_DISCLAIMER}</p>
        </>
      )}
    </div>
  )
}

export default ObligationsView
