import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, Scale } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AdaptedDownload, useOrg } from '../components/AdaptedDownload'
import { DocActions, DocReader } from '../components/DocReader'
import { CAREER_PATHS, careerPlanMarkdown } from '../data/careerPaths'
import { GUIDES } from '../data/guides'
import { findNorm } from '../data/legalDatabase'
import type { SiteViewId } from '../data/platformContent'
import { advancedTemplates, type AdvancedTemplate } from '../lib/templateBuilder'

interface CareerViewProps {
  pathId: string
  onSelectPath: (id: string) => void
  onNavigate: (view: SiteViewId) => void
  onOpenNorm: (normId: string) => void
  onOpenGuide: (guideId: string) => void
}

/** Rutas de especialización mostradas como diagrama por etapas. */
export function CareerView({ pathId, onSelectPath, onNavigate, onOpenNorm, onOpenGuide }: CareerViewProps) {
  const path = CAREER_PATHS.find((item) => item.id === pathId) ?? CAREER_PATHS[0]
  const [openStage, setOpenStage] = useState(0)
  const [preview, setPreview] = useState<AdvancedTemplate | null>(null)
  const org = useOrg()
  const templates = useMemo(() => new Map(advancedTemplates(org).map((item) => [item.id, item])), [org])
  const guideName = (id: string) => GUIDES.find((guide) => guide.id === id)?.title ?? id
  const plan = careerPlanMarkdown(path, (id) => findNorm(id)?.shortName ?? id, (id) => templates.get(id)?.name ?? id, guideName)

  return (
    <div className="view-page career">
      <header className="page-head">
        <div>
          <span className="eyebrow"><GraduationCap size={15} aria-hidden="true" /> Rutas de especialista</span>
          <h1>{path.title}</h1>
          <p>{path.summary}</p>
          <small className="career-profile">Para: {path.profile}</small>
        </div>
        <div className="tab-switch" role="tablist" aria-label="Rutas">
          {CAREER_PATHS.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={item.id === path.id}
              className={item.id === path.id ? 'active' : ''}
              onClick={() => {
                onSelectPath(item.id)
                setOpenStage(0)
              }}
            >
              {item.short}
            </button>
          ))}
        </div>
      </header>

      <DocActions id={`ruta-${path.id}`} title={`Plan de formación: ${path.title}`} markdown={plan} />

      <ol className="career-map">
        {path.stages.map((stage, index) => {
          const isOpen = openStage === index
          return (
            <li key={stage.title} className={isOpen ? 'open' : ''}>
              <button type="button" className="career-node" aria-expanded={isOpen} onClick={() => setOpenStage(isOpen ? -1 : index)}>
                <span className="career-num">{index + 1}</span>
                <span>
                  <b>{stage.title}</b>
                  <small>{stage.goal}</small>
                </span>
              </button>
              {isOpen && (
                <div className="career-body">
                  <div className="career-col">
                    <h3>Qué aprender</h3>
                    <ul>{stage.learn.map((item) => <li key={item}>{item}</li>)}</ul>
                    <p className="career-proof"><CheckCircle2 size={15} aria-hidden="true" /> {stage.proof}</p>
                  </div>
                  <div className="career-col">
                    {stage.normIds.length > 0 && (
                      <>
                        <h3>Normas</h3>
                        <div className="career-links">
                          {stage.normIds.map((id) => (
                            <button type="button" key={id} onClick={() => onOpenNorm(id)}>
                              <Scale size={13} aria-hidden="true" /> {findNorm(id)?.shortName ?? id}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {stage.guideIds.length > 0 && (
                      <>
                        <h3>Guías</h3>
                        <div className="career-links">
                          {stage.guideIds.map((id) => (
                            <button type="button" key={id} onClick={() => onOpenGuide(id)}>
                              <BookOpen size={13} aria-hidden="true" /> {guideName(id)}
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                    {stage.view && (
                      <button type="button" className="btn-secondary small" onClick={() => {
                          if (stage.view!.id === 'rutas') {
                            onSelectPath('iperc')
                            setOpenStage(0)
                          } else onNavigate(stage.view!.id)
                        }}>
                        {stage.view.label} <ArrowRight size={14} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  {stage.templateIds.length > 0 && (
                    <div className="career-templates">
                      <h3>Plantillas de esta etapa</h3>
                      {stage.templateIds
                        .map((id) => templates.get(id))
                        .filter((item): item is AdvancedTemplate => Boolean(item))
                        .map((template) => (
                          <AdaptedDownload key={template.id} template={template} onPreview={setPreview} label={template.name} />
                        ))}
                    </div>
                  )}
                </div>
              )}
            </li>
          )
        })}
      </ol>

      {preview && <DocReader id={preview.id} title={preview.name} subtitle="Plantilla adaptada · vista previa" markdown={preview.markdown} onClose={() => setPreview(null)} />}
    </div>
  )
}

export default CareerView
