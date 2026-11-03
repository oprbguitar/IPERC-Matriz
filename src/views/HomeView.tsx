import { ArrowRight, BookOpen, Search, ChevronRight, Crown, Download, FileSpreadsheet, FileText, FileType2, History, Radar, Scale, Users } from 'lucide-react'
import { LegalReference } from '../components/LegalReference'
import { COVERAGE_DOMAINS } from '../data/coverage'
import { GUIDES } from '../data/guides'
import { featuredNormIds, findNorm, legalNorms } from '../data/legalDatabase'
import { TIMELINE_ERAS, TIMELINE_EVENTS } from '../data/timeline'
import { statusForAnswer, type DiagnosticAnswers } from '../lib/diagnostic'
import {
  findTemplate,
  PLATFORM_DISCLAIMER,
  QUICK_DOWNLOADS,
  RECOMMENDED_STEPS,
  ROUTE_CARDS,
  type RouteCardId,
  type SiteViewId,
  type TemplateFormat,
} from '../data/platformContent'
import { assetUrl } from '../lib/assets'

const FORMAT_ICON: Record<TemplateFormat, typeof FileSpreadsheet> = {
  xlsx: FileSpreadsheet,
  docx: FileType2,
  pdf: FileText,
  enlace: FileText,
}

/**
 * Recorta el resumen sin partir palabras. No se corta por el primer punto porque
 * las abreviaturas normativas ("Ley N.° 29783") lo contienen.
 */
function shorten(text: string, maxLength = 84): string {
  if (text.length <= maxLength) return text
  const cut = text.slice(0, maxLength)
  return `${cut.slice(0, cut.lastIndexOf(' '))}…`
}

interface HomeViewProps {
  onNavigate: (view: SiteViewId) => void
  onOpenRouteCard: (id: RouteCardId) => void
  onOpenNorm: (normId: string) => void
  onOpenGuide: (guideId: string) => void
  onSearch: () => void
  completedStepIds: string[]
  progressPercent: number
  answers: DiagnosticAnswers
  premiumPercent: number | null
  signedIn: boolean
}

export function HomeView({
  onNavigate,
  onOpenRouteCard,
  onOpenNorm,
  onOpenGuide,
  onSearch,
  completedStepIds,
  progressPercent,
  answers,
  premiumPercent,
  signedIn,
}: HomeViewProps) {
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            Gestiona <span className="accent-blue">SST</span>, <span className="accent-sky">SOMA</span> e{' '}
            <span className="accent-teal">IPERC</span> de forma clara y rápida
          </h1>
          <p>Orientación práctica, plazos, formatos y herramientas para cualquier profesión o empresa.</p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={() => onNavigate('ruta')}>
              Comenzar ruta <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="btn-secondary" onClick={() => onNavigate('plantillas')}>
              <Download size={17} aria-hidden="true" /> Descargar plantillas
            </button>
          </div>
          <button type="button" className="home-search" onClick={onSearch}>
            <Search size={18} aria-hidden="true" /> ¿Qué debe cumplir? Ej.: «ergonomía en oficinas públicas», «accidente de montacargas»…
          </button>
          <p className="hero-audience">
            <Users size={16} aria-hidden="true" /> Para empresas, supervisores, comités, trabajadores y consultores.
          </p>
        </div>
        <picture className="hero-art">
          <source srcSet={assetUrl('assets/hero-sst-workers.webp')} type="image/webp" />
          <img
            src={assetUrl('assets/hero-sst-workers.png')}
            width={1100}
            height={733}
            alt="Dos profesionales de seguridad y salud en el trabajo, con casco y chaleco, revisan una lista de verificación en una tablet y un portapapeles."
            fetchPriority="high"
            decoding="async"
          />
        </picture>
      </section>

      <section className="story-strip" aria-label="Historia de la normativa SST en el Perú">
        <div className="story-copy">
          <span className="eyebrow"><History size={15} aria-hidden="true" /> La historia en 60 segundos</span>
          <h2>Cómo nació y evolucionó la SST en el Perú</h2>
          <p>{TIMELINE_EVENTS.length} hitos, de la seguridad industrial de 1964 a la gestión con datos e IA de 2026.</p>
          <button type="button" className="btn-secondary small" onClick={() => onNavigate('evolucion')}>
            Ver línea de tiempo <ArrowRight size={15} aria-hidden="true" />
          </button>
        </div>
        <ol className="story-eras">
          {TIMELINE_ERAS.map((era, index) => (
            <li key={era.id} style={{ '--i': index } as React.CSSProperties}>
              <button type="button" onClick={() => onNavigate('evolucion')}>
                <span className="story-dot" aria-hidden="true" />
                <b>{era.range}</b>
                <small>{era.title}</small>
              </button>
            </li>
          ))}
        </ol>
      </section>

      <section className="route-cards" aria-label="Ruta práctica en seis pasos">
        {ROUTE_CARDS.map((card) => {
          const Icon = card.icon
          return (
            <button type="button" key={card.id} className={`route-card ${card.accent}`} onClick={() => onOpenRouteCard(card.id)}>
              <span className="route-card-icon" aria-hidden="true">
                <Icon size={22} />
              </span>
              <span className="route-card-text">
                <b>
                  {card.order}. {card.title}
                </b>
                <small>{card.summary}</small>
              </span>
              <ChevronRight size={18} aria-hidden="true" className="route-card-arrow" />
            </button>
          )
        })}
      </section>

      <div className="home-lower">
        <section className="panel route-progress" aria-labelledby="route-progress-title">
          <h2 id="route-progress-title">Tu ruta recomendada</h2>
          <ol className="route-steps">
            {RECOMMENDED_STEPS.map((step, index) => {
              const Icon = step.icon
              const done = completedStepIds.includes(step.id)
              return (
                <li key={step.id}>
                  <button type="button" className={done ? 'done' : ''} onClick={() => onNavigate(step.view)} title={step.hint}>
                    <span aria-hidden="true">
                      <Icon size={18} />
                    </span>
                    <b>{step.label}</b>
                  </button>
                  {index < RECOMMENDED_STEPS.length - 1 && (
                    <i className="route-arrow" aria-hidden="true">
                      →
                    </i>
                  )}
                </li>
              )
            })}
          </ol>
          <div className="progress-line">
            <span>Tu progreso actual</span>
            <div
              className="progress-track"
              role="progressbar"
              aria-valuenow={progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Avance de la ruta recomendada"
            >
              <i style={{ width: `${progressPercent}%` }} />
            </div>
            <b>{progressPercent}%</b>
          </div>
        </section>

        <section className="panel quick-downloads" aria-labelledby="quick-downloads-title">
          <div className="panel-head">
            <h2 id="quick-downloads-title">Descargas rápidas</h2>
            <button type="button" className="link-button" onClick={() => onNavigate('plantillas')}>
              Ver todas
            </button>
          </div>
          <ul>
            {QUICK_DOWNLOADS.map((group) => {
              const template = findTemplate(group.templateId)
              const Icon = FORMAT_ICON[group.format]
              if (!template) return null
              const href = template.file ? assetUrl(template.file) : template.externalUrl
              const isLocal = Boolean(template.file)
              return (
                <li key={group.id}>
                  <a
                    href={href}
                    {...(isLocal
                      ? { download: '' }
                      : { target: '_blank', rel: 'noopener noreferrer' })}
                    aria-label={`${group.label}: ${template.name}`}
                  >
                    <span className={`file-chip ${group.format}`} aria-hidden="true">
                      <Icon size={17} />
                    </span>
                    <span>
                      <b>{group.label}</b>
                      <small>{group.hint}</small>
                    </span>
                    <Download size={16} aria-hidden="true" />
                  </a>
                </li>
              )
            })}
          </ul>
          <div className="quick-guides">
            <b><BookOpen size={15} aria-hidden="true" /> Guías listas</b>
            {GUIDES.slice(0, 4).map((guide) => (
              <button type="button" key={guide.id} onClick={() => onOpenGuide(guide.id)}>
                {guide.title} <ChevronRight size={14} aria-hidden="true" />
              </button>
            ))}
          </div>
        </section>

        <section className="panel featured-norms" aria-labelledby="featured-norms-title">
          <div className="panel-head">
            <h2 id="featured-norms-title">Normativa peruana</h2>
            <button type="button" className="link-button" onClick={() => onNavigate('normativa')}>
              Ver más
            </button>
          </div>
          <ul>
            {featuredNormIds.map((id) => {
              const norm = findNorm(id)
              if (!norm) return null
              return (
                <li key={id}>
                  <button type="button" onClick={() => onOpenNorm(id)}>
                    <span className="norm-chip" aria-hidden="true">
                      <Scale size={16} />
                    </span>
                    <span>
                      <b>{norm.shortName}</b>
                      <small>{shorten(norm.plainLanguageSummary)}</small>
                    </span>
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <section className="tracker" aria-labelledby="tracker-title">
        <header className="tracker-head">
          <div>
            <span className="eyebrow"><Radar size={15} aria-hidden="true" /> Sistema de seguimiento</span>
            <h2 id="tracker-title">Cobertura SST, SSOMA y salud ocupacional</h2>
            <p>{COVERAGE_DOMAINS.length} dominios · {legalNorms.length} normas oficiales enlazadas. El estado se alimenta de su diagnóstico en Mi Ruta.</p>
          </div>
          {signedIn ? (
            <button type="button" className="premium-progress" onClick={() => onNavigate('premium')}>
              <span style={{ '--p': premiumPercent ?? 0 } as React.CSSProperties} className="mini-ring" aria-hidden="true" />
              <span><b>{premiumPercent ?? 0}%</b><small>Plan premium</small></span>
            </button>
          ) : (
            <button type="button" className="premium-progress locked" onClick={() => onNavigate('premium')}>
              <Crown size={18} aria-hidden="true" />
              <span><b>Premium</b><small>IA y agentes</small></span>
            </button>
          )}
        </header>
        <ul className="tracker-grid">
          {COVERAGE_DOMAINS.map((domain, index) => {
            const Icon = domain.icon
            const status = domain.diagnosticId ? statusForAnswer(domain.diagnosticId, answers[domain.diagnosticId]) : undefined
            const label = status === 'cumple' ? 'Cumple' : status === 'pendiente' ? 'Pendiente' : status === 'no-aplica' ? 'No aplica' : status === 'verificar' ? 'Verificar' : domain.diagnosticId ? 'Sin evaluar' : 'Referencia'
            const norms = domain.normIds.filter((id) => findNorm(id)).length
            return (
              <li key={domain.id} style={{ '--i': index } as React.CSSProperties}>
                <button
                  type="button"
                  className={`tracker-tile ${domain.tone}`}
                  onClick={() => (domain.guideId ? onOpenGuide(domain.guideId) : onNavigate(domain.view))}
                  title={domain.description}
                >
                  <span className="tracker-icon" aria-hidden="true"><Icon size={18} /></span>
                  <span className="tracker-text">
                    <b>{domain.label}</b>
                    <small>{domain.description}</small>
                  </span>
                  <span className="tracker-meta">
                    <em className={`state ${status ?? 'none'}`}>{label}</em>
                    <small>{norms} norma{norms === 1 ? '' : 's'}</small>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="site-disclaimer">
        {PLATFORM_DISCLAIMER} Marco base:{' '}
        <LegalReference normId="law-29783" compact /> y su reglamento,{' '}
        <LegalReference normId="ds-005-2012-tr" compact />.
      </p>
    </div>
  )
}

export default HomeView
