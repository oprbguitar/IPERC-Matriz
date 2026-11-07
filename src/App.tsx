import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'
import './styles/observatorio.css'
import './styles/compliance.css'
import './styles/navigation.css'
import { LegalReference } from './components/LegalReference'
import { SideDrawer } from './components/SideDrawer'
import { GlobalSearch, type SearchTarget } from './components/GlobalSearch'
import { SiteHeader } from './components/SiteHeader'
import { PageTrail } from './components/PageNav'
import { DocReader } from './components/DocReader'
import { FORMATS } from './catalog'
import { GUIDES } from './data/guides'
import { guideManual } from './data/guideManuals'
import { PremiumLock } from './components/PremiumLock'
import {
  findTemplate,
  isSiteView,
  OBLIGATION_KIND_HELP,
  PREMIUM_VIEWS,
  OBLIGATION_KIND_LABELS,
  PLATFORM_DISCLAIMER,
  ROUTE_CARDS,
  type RouteCardId,
  type SiteViewId,
  type SizeBandId,
} from './data/platformContent'
import { assetUrl } from './lib/assets'
import { statusForAnswer, type DiagnosticAnswers } from './lib/diagnostic'
import { api, type ApiUser } from './lib/api'
import type { LibraryTab } from './views/LibraryView'
import PremiumView, { computePercent } from './views/PremiumView'
import HomeView from './views/HomeView'
import type { ComplianceTab } from './views/ComplianceView'
import FormatsView, { FormEditor } from './views/FormatsView'
import type { InspectionTab } from './views/InspectionView'
import type { ObligationsTab } from './views/ObligationsView'

// Cada espacio se descarga solo cuando se visita: la portada carga mucho más rápido.
const ToolsWorkspace = lazy(() => import('./tools/ToolsWorkspace').then((module) => ({ default: module.ToolsWorkspace })))
const EvolutionView = lazy(() => import('./views/EvolutionView'))
const LibraryView = lazy(() => import('./views/LibraryView'))
const NormativeView = lazy(() => import('./views/NormativeView'))
const ComplianceView = lazy(() => import('./views/ComplianceView'))
const InspectionView = lazy(() => import('./views/InspectionView'))
const ObligationsView = lazy(() => import('./views/ObligationsView'))
const RouteView = lazy(() => import('./views/RouteView'))
const CareerView = lazy(() => import('./views/CareerView'))
const SsomaVisorView = lazy(() => import('./views/SsomaVisorView'))
const GlossaryView = lazy(() => import('./views/GlossaryView'))
const SignageView = lazy(() => import('./views/SignageView'))
const SimulatorView = lazy(() => import('./views/SimulatorView'))

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

/** Vista inicial desde la dirección (#/normativa), para que atrás/adelante y los enlaces funcionen. */
function viewFromHash(): SiteViewId {
  const value = window.location.hash.replace(/^#\/?/, '').split('?')[0]
  return isSiteView(value) ? value : 'inicio'
}

function App() {
  const [view, setView] = useState<SiteViewId>(viewFromHash)
  const [readerGuideId, setReaderGuideId] = useState<string | undefined>(undefined)
  const [editorFormatId, setEditorFormatId] = useState<string | undefined>(undefined)
  const [careerId, setCareerId] = useState<string>('sst')
  const [answers, setAnswers] = useState<DiagnosticAnswers>(readStoredAnswers)
  const [openCard, setOpenCard] = useState<RouteCardId | null>(null)
  const [obligationsTab, setObligationsTab] = useState<ObligationsTab>('sst')
  const [focusNormId, setFocusNormId] = useState<string | undefined>(undefined)
  const [libraryTab, setLibraryTab] = useState<LibraryTab>('avanzadas')
  const [inspectionTab, setInspectionTab] = useState<InspectionTab>('contingencia')
  const [openFormatId, setOpenFormatId] = useState<string | undefined>(undefined)
  const [searchOpen, setSearchOpen] = useState(false)
  const [openGuideId, setOpenGuideId] = useState<string | undefined>(undefined)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [offline, setOffline] = useState(false)
  const [premiumPercent, setPremiumPercent] = useState<number | null>(null)

  // Sesion del Observatorio (Cloudflare). En GitHub Pages no hay API: modo sin servidor.
  useEffect(() => {
    api
      .me()
      .then(({ user: current }) => setUser(current))
      .catch(() => setOffline(true))
      .finally(() => setAuthReady(true))
  }, [])

  useEffect(() => {
    if (!user) {
      setPremiumPercent(null)
      return
    }
    api
      .progress()
      .then(({ items }) => setPremiumPercent(computePercent(Object.fromEntries(items.map((item) => [item.item_id, item.status])))))
      .catch(() => setPremiumPercent(null))
  }, [user, view])

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

  // Historial del navegador: cada vista tiene su dirección y los botones atrás/adelante funcionan.
  useEffect(() => {
    if (!window.location.hash) window.history.replaceState({ view }, '', `#/${view}`)
    const onPop = () => {
      setView(viewFromHash())
      setOpenCard(null)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const navigate = useCallback((next: SiteViewId) => {
    setView((current) => {
      if (current !== next) window.history.pushState({ view: next }, '', `#/${next}`)
      return next
    })
    setOpenCard(null)
  }, [])

  const premium = Boolean(user)

  const openRouteCard = useCallback((id: RouteCardId) => setOpenCard(id), [])

  // Guías y formatos se abren encima de la página actual: al cerrar, el usuario sigue donde estaba.
  const openGuide = useCallback((guideId: string) => setReaderGuideId(guideId), [])

  const openNorm = useCallback(
    (normId: string) => {
      setFocusNormId(normId)
      navigate('normativa')
    },
    [navigate],
  )

  const openFormat = useCallback((formatId: string) => setEditorFormatId(formatId), [])

  const openSearch = useCallback(() => setSearchOpen(true), [])

  const handleSearch = useCallback(
    (target: SearchTarget) => {
      if (target.kind === 'norma') openNorm(target.id)
      else if (target.kind === 'guia') openGuide(target.id)
      else if (target.kind === 'formato') openFormat(target.id)
      else if (target.kind === 'obligacion') navigate('diagnostico')
      else if (target.kind === 'caso') {
        setInspectionTab('casos')
        navigate('casos')
      } else {
        setInspectionTab('contingencia')
        navigate('fiscalizacion')
      }
    },
    [openNorm, openGuide, openFormat, navigate],
  )

  const card = ROUTE_CARDS.find((item) => item.id === openCard)
  const readerGuide = GUIDES.find((item) => item.id === readerGuideId)
  const editorFormat = FORMATS.find((item) => item.id === editorFormatId)
  const locked = !premium && PREMIUM_VIEWS.includes(view)

  const overlays = (
    <>
      {readerGuide && (
        <DocReader
          id={readerGuide.id}
          title={readerGuide.title}
          subtitle={`${readerGuide.audience} · al cerrar vuelve a esta página`}
          markdown={readerGuide.body}
          fullMarkdown={guideManual(readerGuide.id)}
          onClose={() => setReaderGuideId(undefined)}
        />
      )}
      {editorFormat && <FormEditor format={editorFormat} onClose={() => setEditorFormatId(undefined)} />}
    </>
  )

  if (view === 'herramientas' && !locked) {
    return (
      <>
        <Suspense fallback={<p className="empty-note">Cargando herramientas…</p>}>
          <ToolsWorkspace onBackToSite={() => window.history.back()} onOpenGuide={openGuide} />
        </Suspense>
        {overlays}
        <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSearch} />
      </>
    )
  }

  return (
    <div className="site-shell">
      <SiteHeader active={view} onNavigate={navigate} onSearch={openSearch} user={user} premiumPercent={premiumPercent} />
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} onSelect={handleSearch} />
      {view !== 'inicio' && <PageTrail view={view} onNavigate={navigate} />}

      <main className="site-main" id="contenido" key={view}>
        {locked && <PremiumLock view={view} onNavigate={navigate} />}
        <Suspense fallback={<p className="empty-note view-loading">Cargando…</p>}>
        {view === 'inicio' && (
          <HomeView
            onNavigate={navigate}
            onOpenRouteCard={openRouteCard}
            onOpenCareer={(pathId: string) => {
              setCareerId(pathId)
              navigate('rutas')
            }}
            onOpenNorm={openNorm}
            onOpenGuide={openGuide}
            onSearch={openSearch}
            completedStepIds={completedStepIds}
            progressPercent={progressPercent}
            answers={answers}
            premiumPercent={premiumPercent}
            signedIn={Boolean(user)}
          />
        )}
        {view === 'evolucion' && <EvolutionView onOpenNorm={openNorm} />}
        {view === 'visor' && <SsomaVisorView onOpenNorm={openNorm} onNavigate={navigate} />}
        {view === 'senales' && <SignageView />}
        {view === 'glosario' && <GlossaryView />}
        {view === 'simulador' && <SimulatorView onOpenVisor={() => navigate('visor')} />}
        {view === 'premium' && (
          <PremiumView user={user} authReady={authReady} offline={offline} onUserChange={setUser} onPercentChange={setPremiumPercent} />
        )}
        {view === 'ruta' && (
          <RouteView answers={answers} onAnswer={handleAnswer} onReset={resetAnswers} onNavigate={navigate} />
        )}
        {(view === 'obligaciones' || view === 'soma') && (
          <ObligationsView
            tab={view === 'soma' ? 'soma' : obligationsTab === 'soma' ? 'sst' : obligationsTab}
            onTabChange={(next) => {
              setObligationsTab(next)
              navigate(next === 'soma' ? 'soma' : 'obligaciones')
            }}
            defaultSize={defaultSize}
            defaultSector={defaultSector}
            onOpenGuide={openGuide}
          />
        )}
        {view === 'plantillas' && (
          <LibraryView
            key={openGuideId ?? 'library'}
            tab={libraryTab}
            onTabChange={setLibraryTab}
            answers={answers}
            openGuideId={openGuideId}
            onGuideOpened={() => setOpenGuideId(undefined)}
          />
        )}
        {(view === 'normativa' || view === 'iso') && (
          <NormativeView focusNormId={focusNormId} onNavigate={navigate} section={view === 'iso' ? 'iso' : 'peru'} />
        )}
        {view === 'rutas' && <CareerView pathId={careerId} onSelectPath={setCareerId} onNavigate={navigate} onOpenNorm={openNorm} onOpenGuide={openGuide} />}
        {(view === 'diagnostico' || view === 'verificar') && (
          <ComplianceView
            tab={view === 'diagnostico' ? 'aplicables' : 'seguimiento'}
            onTabChange={(next: ComplianceTab) => navigate(next === 'aplicables' ? 'diagnostico' : 'verificar')}
            signedIn={Boolean(user)}
            onOpenFormat={openFormat}
          />
        )}
        {view === 'formatos' && !locked && (
          <FormatsView key={openFormatId ?? 'formatos'} openFormatId={openFormatId} onFormatOpened={() => setOpenFormatId(undefined)} />
        )}
        {(view === 'fiscalizacion' || view === 'casos') && (
          <InspectionView
            tab={view === 'casos' ? 'casos' : inspectionTab}
            onTabChange={(next) => {
              setInspectionTab(next)
              navigate(next === 'casos' ? 'casos' : 'fiscalizacion')
            }}
            onOpenGuide={openGuide}
          />
        )}
        </Suspense>
      </main>
      {overlays}

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
