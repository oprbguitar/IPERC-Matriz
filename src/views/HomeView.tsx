import { ArrowRight, BarChart3, BookOpen, Boxes, ChevronLeft, ChevronRight, GraduationCap, Download, FileSpreadsheet, FileText, FileType2, History, Route, Scale, Tags, TriangleAlert, Users, Workflow } from 'lucide-react'
import { useRef } from 'react'
import PreventionPreview from '../components/PreventionPreview'
import { LegalReference } from '../components/LegalReference'
import { CAREER_PATHS } from '../data/careerPaths'
import { GUIDES } from '../data/guides'
import { findNorm } from '../data/legalDatabase'

/** Normas que se listan en la portada (con desplazamiento interno). */
const HOME_NORM_IDS = ['law-29783', 'ds-005-2012-tr', 'rm-050-2013-tr', 'law-30222', 'ds-002-2020-tr', 'law-32721', 'ds-003-2026-sa', 'rm-245-2021-tr', 'rm-375-2008-tr', 'rm-312-2011-minsa', 'ds-003-98-sa', 'ds-014-2013-tr', 'ds-019-2006-tr', 'law-31572', 'ds-011-2019-tr', 'ds-024-2016-em', 'dl-1278', 'law-28611']
import { TIMELINE_ERAS, TIMELINE_EVENTS } from '../data/timeline'
import type { DiagnosticAnswers } from '../lib/diagnostic'
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

/** Accesos directos a secciones útiles que quedaban escondidas en el menú. */
const QUICK_ACCESS: Array<{ view: string; label: string; hint: string; icon: typeof Route; tone: string }> = [
  { view: 'senales?sec=senales', label: 'Señales de seguridad', hint: 'Catálogo NTP 399.010-1 e ISO 7010 para imprimir', icon: TriangleAlert, tone: 'amber' },
  { view: 'senales?sec=etiquetas', label: 'Etiquetas operativas', hint: 'LOTO, andamios, extintores e inspecciones', icon: Tags, tone: 'red' },
  { view: 'simulador', label: 'Simulador de ambientes', hint: 'Recorra áreas de trabajo y detecte peligros', icon: Boxes, tone: 'teal' },
  { view: 'estadisticas', label: 'Accidentes en el Perú', hint: 'Estadística oficial del MTPE con lectura técnica', icon: BarChart3, tone: 'blue' },
  { view: 'diagramas', label: 'Diagramas de procesos', hint: 'PHVA, IPERC, accidentes y emergencias', icon: Workflow, tone: 'violet' },
  { view: 'ruta', label: 'Mi ruta', hint: 'Diagnóstico guiado de su empresa', icon: Route, tone: 'green' },
]

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
  onSearch?: () => void
  onOpenCareer?: (pathId: string) => void
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
  completedStepIds,
  progressPercent,
  onOpenCareer,
}: HomeViewProps) {
  const railRef = useRef<HTMLDivElement>(null)
  const slide = (direction: number) => railRef.current?.scrollBy({ left: direction * railRef.current.clientWidth * 0.8, behavior: 'smooth' })
  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <h1 id="hero-title">
            Prevenir es <span className="accent-blue">cumplir</span>: SST, <span className="accent-sky">SOMA</span> e{' '}
            <span className="accent-teal">IPERC</span> en un solo lugar
          </h1>
          <p>Normas peruanas verificadas, plantillas listas para su empresa y una ruta guiada paso a paso para cualquier organización.</p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={() => onNavigate('ruta')}>
              Comenzar ruta <ArrowRight size={17} aria-hidden="true" />
            </button>
            <button type="button" className="btn-secondary" onClick={() => onNavigate('plantillas')}>
              <Download size={17} aria-hidden="true" /> Descargar plantillas
            </button>
          </div>
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

      <PreventionPreview onNavigate={onNavigate} />
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

      <section className="route-rail" aria-label="Ruta práctica en seis pasos">
        <button type="button" className="rail-arrow left" onClick={() => slide(-1)} aria-label="Ver pasos anteriores"><ChevronLeft size={18} /></button>
        <div className="route-cards" ref={railRef}>
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
        </div>
        <button type="button" className="rail-arrow right" onClick={() => slide(1)} aria-label="Ver más pasos"><ChevronRight size={18} /></button>
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
                      <Icon size={24} />
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
          <nav className="home-quick" aria-label="Accesos directos">
            {QUICK_ACCESS.map(({ view, label, hint, icon: Icon, tone }) => (
              <button key={label} type="button" className={`home-quick-btn tone-${tone}`} onClick={() => (view.includes('?') ? (window.location.hash = `#/${view}`) : onNavigate(view as SiteViewId))} title={hint}>
                <span aria-hidden="true"><Icon size={22} /></span>
                <b>{label}</b>
                <small>{hint}</small>
              </button>
            ))}
          </nav>
          <div className="career-entry">
            <b><GraduationCap size={15} aria-hidden="true" /> Rutas de especialista</b>
            <div>
              {CAREER_PATHS.map((path) => (
                <button type="button" key={path.id} onClick={() => onOpenCareer?.(path.id)} title={path.summary}>
                  <span><small>Cómo ser especialista en</small><strong>{path.short}</strong></span>
                  <ChevronRight size={14} aria-hidden="true" />
                </button>
              ))}
            </div>
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
          <ul className="norm-scroll" tabIndex={0} aria-label="Normas destacadas (desplazable)">
            {HOME_NORM_IDS.map((id) => {
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

      <p className="site-disclaimer">
        {PLATFORM_DISCLAIMER} Marco base:{' '}
        <LegalReference normId="law-29783" compact /> y su reglamento,{' '}
        <LegalReference normId="ds-005-2012-tr" compact />.
      </p>
    </div>
  )
}

export default HomeView
