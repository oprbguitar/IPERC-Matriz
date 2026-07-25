import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import { LegalReference } from './components/LegalReference'
import { SideDrawer } from './components/SideDrawer'
import { SiteHeader } from './components/SiteHeader'
import {
  findTemplate,
  OBLIGATION_KIND_HELP,
  OBLIGATION_KIND_LABELS,
  PLATFORM_DISCLAIMER,
  ROUTE_CARDS,
  type RouteCardId,
  type SiteViewId,
  type SizeBandId,
} from './data/platformContent'
import { assetUrl } from './lib/assets'
import { statusForAnswer, type DiagnosticAnswers } from './lib/diagnostic'
import { ToolsWorkspace } from './tools/ToolsWorkspace'
import HomeView from './views/HomeView'
import NormativeView from './views/NormativeView'
import ObligationsView, { type ObligationsTab } from './views/ObligationsView'
import RouteView from './views/RouteView'
import TemplatesView from './views/TemplatesView'

const ANSWERS_STORAGE_KEY = 'ruta-sst-peru:diagnostico'

/** Pasos de la ruta recomendada que quedan cubiertos por cada respuesta del diagnóstico. */
const STEP_BY_QUESTION: Record<string, string> = {
  committee: 'documentos',
  'annual-plan': 'documentos',
  iperc: 'riesgos',
  'risk-map': 'riesgos',
  records: 'evidencias',
  accidents: 'evidencias',
  environment: 'controles',
}

function readStoredAnswers(): DiagnosticAnswers {
  try {
    const raw = window.localStorage.getItem(ANSWERS_STORAGE_KEY)
    return raw ? (JSON.parse(raw) as DiagnosticAnswers) : {}
  } catch {
    return {}
  }
}

function App() {
  const [view, setView] = useState<SiteViewId>('inicio')
  const [answers, setAnswers] = useState<DiagnosticAnswers>(readStoredAnswers)
  const [openCard, setOpenCard] = useState<RouteCardId | null>(null)
  const [obligationsTab, setObligationsTab] = useState<ObligationsTab>('sst')
  const [focusNormId, setFocusNormId] = useState<string | undefined>(undefined)

  useEffect(() => {
    try {
      window.localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(answers))
    } catch {
      // El almacenamiento local puede estar deshabilitado; el diagnóstico sigue funcionando en memoria.
    }
  }, [answers])

  // La navegacion cambia el contenido principal: devolvemos el foco al inicio de la vista.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [view])

  const handleAnswer = useCallback((questionId: string, value: string) => {
    setAnswers((previous) => ({ ...previous, [questionId]: value }))
  }, [])

  const resetAnswers = useCallback(() => setAnswers({}), [])

  const completedStepIds = useMemo(() => {
    const done = new Set<string>()
    if (Object.keys(answers).length > 0) done.add('diagnostico')
    for (const [questionId, stepId] of Object.entries(STEP_BY_QUESTION)) {
      if (statusForAnswer(questionId, answers[questionId]) === 'cumple') done.add(stepId)
    }
    // La exportación se considera cubierta cuando el resto de la ruta está completo.
    if (done.size >= 5) done.add('exportacion')
    return [...done]
  }, [answers])

  const progressPercent = Math.round((completedStepIds.length / 6) * 100)

  const defaultSize = (answers.size as SizeBandId | undefined) ?? undefined
  const defaultSector = answers.sector

  const navigate = useCallback((next: SiteViewId) => {
    setView(next)
    setOpenCard(null)
  }, [])

  const openRouteCard = useCallback((id: RouteCardId) => setOpenCard(id), [])

  const openNorm = useCallback((normId: string) => {
    setFocusNormId(normId)
    setView('normativa')
  }, [])

  const card = ROUTE_CARDS.find((item) => item.id === openCard)

  if (view === 'herramientas') {
    return <ToolsWorkspace onBackToSite={() => navigate('inicio')} />
  }

  return (
    <div className="site-shell">
      <SiteHeader active={view} onNavigate={navigate} />

      <main className="site-main" id="contenido">
        {view === 'inicio' && (
          <HomeView
            onNavigate={navigate}
            onOpenRouteCard={openRouteCard}
            onOpenNorm={openNorm}
            completedStepIds={completedStepIds}
            progressPercent={progressPercent}
          />
        )}
        {view === 'ruta' && (
          <RouteView answers={answers} onAnswer={handleAnswer} onReset={resetAnswers} onNavigate={navigate} />
        )}
        {view === 'obligaciones' && (
          <ObligationsView
            tab={obligationsTab}
            onTabChange={setObligationsTab}
            defaultSize={defaultSize}
            defaultSector={defaultSector}
          />
        )}
        {view === 'plantillas' && <TemplatesView />}
        {view === 'normativa' && <NormativeView focusNormId={focusNormId} onNavigate={navigate} />}
      </main>

      <SideDrawer
        open={Boolean(card)}
        title={card ? `${card.order}. ${card.title}` : ''}
        subtitle={card?.summary}
        onClose={() => setOpenCard(null)}
      >
        {card && (
          <>
            <p className="drawer-intro">{card.detailIntro}</p>
            <ul className="drawer-points">
              {card.points.map((point) => (
                <li key={point.text}>
                  <span className={`kind-tag ${point.kind}`} title={OBLIGATION_KIND_HELP[point.kind]}>
                    {OBLIGATION_KIND_LABELS[point.kind]}
                  </span>
                  <span>{point.text}</span>
                </li>
              ))}
            </ul>

            <div className="result-links">
              <b>Normativa relacionada:</b>
              {card.normIds.map((normId) => (
                <LegalReference key={normId} normId={normId} compact />
              ))}
            </div>

            {card.templateIds.length > 0 && (
              <div className="result-links">
                <b>Plantillas:</b>
                {card.templateIds.map((templateId) => {
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

            <button type="button" className="btn-primary" onClick={() => navigate(card.primaryAction.view)}>
              {card.primaryAction.label}
            </button>
            <p className="site-disclaimer">{PLATFORM_DISCLAIMER}</p>
          </>
        )}
      </SideDrawer>
    </div>
  )
}

export default App
