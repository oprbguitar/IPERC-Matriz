import { ArrowRight, BarChart3, BookOpen, Boxes, ChevronRight, Crown, Download, FileSpreadsheet, FileText, FileType2, GraduationCap, History, Library, Microscope, Route, Scale, ShieldCheck, Tags, TriangleAlert, Workflow } from 'lucide-react'
import { LegalReference } from '../components/LegalReference'
import { GUIDES } from '../data/guides'
import { findNorm } from '../data/legalDatabase'
import type { DiagnosticAnswers } from '../lib/diagnostic'
import {
  findTemplate,
  PLATFORM_DISCLAIMER,
  QUICK_DOWNLOADS,
  ROUTE_CARDS,
  type RouteCardId,
  type SiteViewId,
  type TemplateFormat,
} from '../data/platformContent'
import { assetUrl } from '../lib/assets'

/** Normas que se listan en la portada (con desplazamiento interno). */
const HOME_NORM_IDS = ['law-29783', 'ds-005-2012-tr', 'rm-050-2013-tr', 'law-30222', 'ds-002-2020-tr', 'law-32721', 'ds-003-2026-sa', 'rm-245-2021-tr', 'rm-375-2008-tr', 'rm-312-2011-minsa', 'ds-003-98-sa', 'ds-014-2013-tr', 'ds-019-2006-tr', 'law-31572', 'ds-011-2019-tr', 'ds-024-2016-em', 'dl-1278', 'law-28611']

/** Accesos directos: toda la plataforma a un clic desde la portada. */
const QUICK_ACCESS: Array<{ view: string; label: string; hint: string; icon: typeof Route; tone: string }> = [
  { view: 'explorador', label: 'Riesgos y controles', hint: 'Fichas por peligro, EPP, instrumentos y visor de ambientes', icon: ShieldCheck, tone: 'blue' },
  { view: 'senales?sec=senales', label: 'Señales', hint: 'Catálogo NTP 399.010-1 e ISO 7010 para imprimir', icon: TriangleAlert, tone: 'amber' },
  { view: 'senales?sec=etiquetas', label: 'Etiquetas operativas', hint: 'LOTO, andamios, extintores e inspecciones', icon: Tags, tone: 'red' },
  { view: 'simulador', label: 'Simulador', hint: 'Recorra ambientes de trabajo y detecte peligros', icon: Boxes, tone: 'teal' },
  { view: 'estadisticas', label: 'Accidentes MTPE', hint: 'Estadística oficial con lectura técnica', icon: BarChart3, tone: 'blue' },
  { view: 'diagramas', label: 'Diagramas', hint: 'PHVA, IPERC, accidentes, residuos y emergencias', icon: Workflow, tone: 'violet' },
  { view: 'visor', label: 'Visor SSOMA', hint: 'Normas SST y ambientales en detalle, cuadros y químicos', icon: Microscope, tone: 'teal' },
  { view: 'normativa', label: 'Normas peruanas', hint: 'Leyes y reglamentos con artículos cotejados', icon: Scale, tone: 'blue' },
  { view: 'glosario', label: 'Glosario', hint: 'Términos, siglas y códigos de colores', icon: Library, tone: 'green' },
  { view: 'evolucion', label: 'Línea de tiempo', hint: 'Cómo nació y evolucionó la SST en el Perú', icon: History, tone: 'violet' },
  { view: 'rutas', label: 'Especialista', hint: 'Rutas para ser especialista en SST, SSOMA o IPERC', icon: GraduationCap, tone: 'green' },
  { view: 'ia', label: 'IA premium', hint: 'Consultor, diagnóstico por foto, informes y alertas', icon: Crown, tone: 'gold' },
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
function shorten(text: string, maxLength = 70): string {
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
  completedStepIds?: string[]
  progressPercent?: number
  answers?: DiagnosticAnswers
  premiumPercent?: number | null
  signedIn?: boolean
}

/** Portada en una sola pantalla: presentación, accesos directos y tres paneles con desplazamiento interno. */
export function HomeView({ onNavigate, onOpenRouteCard, onOpenNorm, onOpenGuide }: HomeViewProps) {
  const go = (view: string) => (view.includes('?') ? (window.location.hash = `#/${view}`) : onNavigate(view as SiteViewId))
  return (
    <div className="home home-v2">
      <section className="hv-hero" aria-labelledby="hero-title">
        <div className="hv-hero-copy">
          <h1 id="hero-title">
            Prevenir es <span className="accent-blue">cumplir</span>: SST, <span className="accent-sky">SOMA</span> e <span className="accent-teal">IPERC</span> en un solo lugar
          </h1>
          <p>Normas peruanas verificadas, plantillas listas y herramientas para cualquier organización.</p>
          <div className="hero-actions">
            <button type="button" className="btn-primary" onClick={() => onNavigate('ruta')}>Comenzar ruta <ArrowRight size={17} aria-hidden="true" /></button>
            <button type="button" className="btn-secondary" onClick={() => onNavigate('plantillas')}><Download size={17} aria-hidden="true" /> Plantillas</button>
          </div>
        </div>
        <picture className="hv-hero-art">
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

      <nav className="hv-quick" aria-label="Accesos directos">
        {QUICK_ACCESS.map(({ view, label, hint, icon: Icon, tone }) => (
          <button key={label} type="button" className={`home-quick-btn tone-${tone}`} onClick={() => go(view)} title={hint}>
            <span aria-hidden="true"><Icon size={21} /></span>
            <b>{label}</b>
          </button>
        ))}
      </nav>

      <div className="hv-panels">
        <section className="panel hv-panel" aria-labelledby="hv-route-title">
          <div className="panel-head">
            <h2 id="hv-route-title"><Route size={16} aria-hidden="true" /> Ruta práctica</h2>
            <button type="button" className="link-button" onClick={() => onNavigate('ruta')}>Mi ruta</button>
          </div>
          <ul className="hv-list">
            {ROUTE_CARDS.map((card) => {
              const Icon = card.icon
              return (
                <li key={card.id}>
                  <button type="button" onClick={() => onOpenRouteCard(card.id)} title={card.summary}>
                    <span className={`hv-icon ${card.accent}`} aria-hidden="true"><Icon size={16} /></span>
                    <span><b>{card.order}. {card.title}</b><small>{shorten(card.summary, 60)}</small></span>
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>

        <section className="panel hv-panel quick-downloads" aria-labelledby="quick-downloads-title">
          <div className="panel-head">
            <h2 id="quick-downloads-title"><Download size={16} aria-hidden="true" /> Descargas rápidas</h2>
            <button type="button" className="link-button" onClick={() => onNavigate('plantillas')}>Ver todas</button>
          </div>
          <ul className="hv-list">
            {QUICK_DOWNLOADS.map((group) => {
              const template = findTemplate(group.templateId)
              const Icon = FORMAT_ICON[group.format]
              if (!template) return null
              const href = template.file ? assetUrl(template.file) : template.externalUrl
              const isLocal = Boolean(template.file)
              return (
                <li key={group.id}>
                  <a href={href} {...(isLocal ? { download: '' } : { target: '_blank', rel: 'noopener noreferrer' })} aria-label={`${group.label}: ${template.name}`}>
                    <span className={`file-chip ${group.format}`} aria-hidden="true"><Icon size={16} /></span>
                    <span><b>{group.label}</b><small>{group.hint}</small></span>
                    <Download size={15} aria-hidden="true" />
                  </a>
                </li>
              )
            })}
            {GUIDES.slice(0, 4).map((guide) => (
              <li key={guide.id}>
                <button type="button" onClick={() => onOpenGuide(guide.id)}>
                  <span className="hv-icon sky" aria-hidden="true"><BookOpen size={16} /></span>
                  <span><b>{guide.title}</b><small>Guía lista</small></span>
                  <ChevronRight size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel hv-panel featured-norms" aria-labelledby="featured-norms-title">
          <div className="panel-head">
            <h2 id="featured-norms-title"><Scale size={16} aria-hidden="true" /> Normativa peruana</h2>
            <button type="button" className="link-button" onClick={() => onNavigate('normativa')}>Ver más</button>
          </div>
          <ul className="hv-list" tabIndex={0} aria-label="Normas destacadas (desplazable)">
            {HOME_NORM_IDS.map((id) => {
              const norm = findNorm(id)
              if (!norm) return null
              return (
                <li key={id}>
                  <button type="button" onClick={() => onOpenNorm(id)}>
                    <span className="norm-chip" aria-hidden="true"><Scale size={15} /></span>
                    <span><b>{norm.shortName}</b><small>{shorten(norm.plainLanguageSummary)}</small></span>
                    <ChevronRight size={15} aria-hidden="true" />
                  </button>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <p className="site-disclaimer hv-disclaimer">
        {PLATFORM_DISCLAIMER} Marco base: <LegalReference normId="law-29783" compact /> y <LegalReference normId="ds-005-2012-tr" compact />.
      </p>
    </div>
  )
}

export default HomeView
