import { Component, lazy, Suspense, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ArrowRight, BookOpen, Layers, Pause, Play, Search, SlidersHorizontal } from 'lucide-react'
import { PREVENTION_FAMILIES, PREVENTION_PROFILES, PREVENTION_SECTORS, PREVENTION_TOPICS } from '../data/prevention'
import { PREVENTION_SCENES } from '../data/preventionScenes'
import type { SiteViewId } from '../data/platformContent'
import { filterPreventionTopics } from '../lib/prevention'
import PreventionTopicDetail from '../components/PreventionTopicDetail'
import PreventionTools from '../components/PreventionTools'
import PreventionPractice from '../components/PreventionPractice'
import PreventionEquipment from '../components/PreventionEquipment'

const PreventionScene = lazy(() => import('../components/PreventionScene'))

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() { return { failed: true } }
  render() { return this.state.failed ? <p className="pr-notice">El visor no pudo cargarse. Puede consultar los mismos peligros desde la lista de puntos y las fichas.</p> : this.props.children }
}

const params = () => new URLSearchParams(location.hash.split('?')[1] ?? '')
type Mode = 'fichas' | 'ambientes' | 'equipos' | 'practica' | 'herramientas'

export default function PreventionView({ onOpenNorm, onNavigate, focusTopicId, onFocusConsumed }: { onOpenNorm: (id: string) => void; onNavigate: (view: SiteViewId) => void; focusTopicId?: string; onFocusConsumed: () => void }) {
  const [query, setQuery] = useState('')
  const [sector, setSector] = useState(() => PREVENTION_SECTORS.some(s => s.id === params().get('sector')) ? params().get('sector')! : '')
  const [family, setFamily] = useState('')
  const [profileId, setProfileId] = useState('worker')
  const [topicId, setTopicId] = useState(() => focusTopicId ?? params().get('f') ?? '')
  const [mode, setMode] = useState<Mode>('fichas')
  const [sceneId, setSceneId] = useState('oficina')
  const [controlled, setControlled] = useState(false)
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  const results = useMemo(() => filterPreventionTopics(query, sector, family), [query, sector, family])
  const topic = results.find(t => t.id === topicId) ?? results[0]
  const profile = PREVENTION_PROFILES.find(p => p.id === profileId) ?? PREVENTION_PROFILES[0]
  const scene = PREVENTION_SCENES.find(s => s.id === sceneId) ?? PREVENTION_SCENES[0]
  const domestic = sector === 'domestic' || (mode === 'ambientes' && Boolean(scene.domestic))

  useEffect(() => {
    const syncLocation = () => {
      if (!location.hash.startsWith('#/explorador')) return
      const id = params().get('f') ?? ''
      if (!PREVENTION_TOPICS.some(t => t.id === id)) return
      setTopicId(id); setQuery(''); setFamily(''); setMode('fichas')
      setSector(params().get('sector') === 'domestic' ? 'domestic' : '')
    }
    window.addEventListener('hashchange', syncLocation)
    window.addEventListener('popstate', syncLocation)
    return () => { window.removeEventListener('hashchange', syncLocation); window.removeEventListener('popstate', syncLocation) }
  }, [])

  useEffect(() => {
    if (focusTopicId && PREVENTION_TOPICS.some(t => t.id === focusTopicId)) {
      setQuery(''); setSector(''); setFamily(''); setTopicId(focusTopicId); setMode('fichas')
      onFocusConsumed()
    }
  }, [focusTopicId, onFocusConsumed])

  useEffect(() => {
    if (!topic) return
    const next = new URLSearchParams({ f: topic.id })
    if (domestic) next.set('sector', 'domestic')
    window.history.replaceState(window.history.state, '', `#/explorador?${next}`)
  }, [topic, domestic])

  function selectHotspot(id: string) {
    const spot = scene.hotspots.find(p => p.id === id)
    if (!spot) return
    setQuery(''); setSector(scene.domestic ? 'domestic' : ''); setFamily(''); setTopicId(spot.topicId)
  }

  function changeMode(next: Mode) {
    if (next === 'ambientes') {
      setQuery(''); setFamily(''); setSector(scene.domestic ? 'domestic' : '')
      setTopicId(scene.hotspots.find(p => p.topicId === topic?.id)?.topicId ?? scene.hotspots[0].topicId)
    }
    setMode(next)
  }

  const tabs: { id: Mode; label: string }[] = [{ id: 'fichas', label: 'Fichas por riesgo' }, { id: 'ambientes', label: 'Visor de ambientes' }, { id: 'equipos', label: 'EPP e instrumentos' }, { id: 'practica', label: 'Práctica IPERC' }, { id: 'herramientas', label: 'Ruido e índice UV' }]

  return <div className={`pr-explorer ${paused ? 'pr-paused' : ''}`}>
    <header className="pr-heading"><div><span className="pr-kicker"><Layers size={16} aria-hidden="true" /> Conocimiento que se convierte en prevención</span><h1>Explorador de Riesgos y Controles</h1><p>Elija una industria o un peligro. Comprenda la exposición, compare controles y sepa qué evidencia revisar.</p></div><div className="pr-heading-side"><span>CONSULTA PÚBLICA</span><b>Identificar. Comprender.<br />Actuar y verificar.</b><button type="button" className="pr-text-btn" aria-pressed={paused} onClick={() => setPaused(p => !p)}>{paused ? <Play size={15} /> : <Pause size={15} />}{paused ? 'Activar animaciones' : 'Pausar animaciones'}</button></div></header>
    <nav className="pr-tabs" aria-label="Formas de explorar">{tabs.map(tab => <button key={tab.id} type="button" aria-pressed={mode === tab.id} onClick={() => changeMode(tab.id)}>{tab.label}<ArrowRight size={15} aria-hidden="true" /></button>)}</nav>
    {mode === 'herramientas' ? <PreventionTools onOpenNorm={onOpenNorm} /> : mode === 'equipos' ? <PreventionEquipment /> : mode === 'practica' ? <PreventionPractice onNavigate={onNavigate} onOpenNorm={onOpenNorm} /> : <>
      {mode === 'fichas' && <section className="pr-filters" aria-label="Filtrar fichas preventivas"><label className="pr-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar peligro, equipo o control</span><input type="search" placeholder="¿Qué necesita prevenir? Ej.: ruido, casco, piel…" value={query} onChange={e => { setQuery(e.target.value); setTopicId('') }} /></label><div className="pr-facets"><label><SlidersHorizontal size={15} aria-hidden="true" /> Sector<select value={sector} onChange={e => { setSector(e.target.value); setTopicId('') }}><option value="">Todos los sectores</option>{PREVENTION_SECTORS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}</select></label><label>Familia de peligros<select value={family} onChange={e => { setFamily(e.target.value); setTopicId('') }}><option value="">Todas las familias</option>{PREVENTION_FAMILIES.map(f => <option key={f.id} value={f.id}>{f.label}</option>)}</select></label><label>Mi perfil<select value={profileId} onChange={e => setProfileId(e.target.value)}>{PREVENTION_PROFILES.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}</select></label></div></section>}
      {mode === 'ambientes' && <section className="pr-viewer" aria-labelledby="pr-viewer-title"><div className="pr-section-head"><span className="pr-kicker">Reconozca los peligros en su contexto</span><h2 id="pr-viewer-title">Entre al ambiente. Elija un punto.</h2><p>Escenas ilustrativas de prevención; no representan una inspección ni una exposición medida.</p></div><div className="pr-scene-nav" aria-label="Ambientes">{PREVENTION_SCENES.map(s => <button key={s.id} type="button" aria-pressed={sceneId === s.id} onClick={() => { setSceneId(s.id); setControlled(false); setQuery(''); setFamily(''); setSector(s.domestic ? 'domestic' : ''); setTopicId(s.hotspots[0].topicId) }}>{s.label}</button>)}</div><div className="pr-viewer-toolbar"><span><b>{scene.label}</b> · {controlled ? 'Controles ilustrados' : 'Peligros por identificar'}</span><button type="button" aria-pressed={controlled} onClick={() => setControlled(c => !c)}>{controlled ? 'Ver sin controles' : 'Comparar con controles'}</button></div><SceneBoundary><Suspense fallback={<p className="pr-notice" role="status">Cargando ilustración… Puede usar la lista de puntos.</p>}><PreventionScene sceneId={sceneId} controlled={controlled} paused={paused} selectedId={scene.hotspots.find(p => p.topicId === topic?.id)?.id ?? ''} onSelect={selectHotspot} /></Suspense></SceneBoundary><div className="pr-point-list" aria-label="Puntos de inspección">{scene.hotspots.map((spot, i) => <button key={spot.id} type="button" aria-pressed={spot.topicId === topic?.id} onClick={() => selectHotspot(spot.id)}><span>{i + 1}</span>{spot.label}</button>)}</div></section>}
      <div className={`pr-workspace ${mode === 'ambientes' ? 'pr-workspace-scene' : ''}`}>
        {mode === 'fichas' && <aside className="pr-master" aria-label="Resultados del explorador"><p className="pr-result-count" role="status">{results.length} fichas · {PREVENTION_TOPICS.length} en el catálogo inicial</p>{results.map(t => <button key={t.id} className="pr-result" type="button" aria-pressed={topic?.id === t.id} onClick={() => setTopicId(t.id)}><small>{PREVENTION_FAMILIES.find(f => f.id === t.family)?.label}</small><b>{t.title}</b><span>{t.summary}</span><ArrowRight size={16} aria-hidden="true" /></button>)}</aside>}
        {topic ? <PreventionTopicDetail key={`${topic.id}-${domestic}`} topic={topic} domestic={domestic} profileHint={domestic ? 'Revise condiciones domésticas sin intervenir equipos peligrosos. Busque asistencia competente cuando corresponda.' : profile.hint} onOpenNorm={onOpenNorm} onTrack={() => onNavigate('verificar')} /> : <div className="pr-empty"><BookOpen size={32} aria-hidden="true" /><h2>No encontramos esa combinación.</h2><p>Pruebe un término más general o restablezca las facetas.</p><button type="button" onClick={() => { setQuery(''); setSector(''); setFamily('') }}>Restablecer búsqueda</button></div>}
      </div>
    </>}
    <footer className="pr-footer"><p>Primero el control colectivo; después, la protección personal. Las fichas orientan la consulta: la evaluación y su verificación corresponden a cada situación real.</p><button type="button" className="pr-text-btn" onClick={() => onNavigate('simulador')}>Abrir simulador IPERC existente →</button><button type="button" className="pr-text-btn" onClick={() => onNavigate('visor')}>Consultar visor SSOMA →</button></footer>
  </div>
}
