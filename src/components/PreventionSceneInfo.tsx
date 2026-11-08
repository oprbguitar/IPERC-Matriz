import type { PreventionHotspot, PreventionSceneData } from '../data/preventionScenes'

export default function PreventionSceneInfo({ scene, spot, controlled }: { scene: PreventionSceneData; spot: PreventionHotspot; controlled: boolean }) {
  return <section className="pr-scene-info" aria-live="polite" aria-label={`Ficha técnica del punto: ${spot.label}`}>
    <p className="pr-scene-overview"><b>{scene.label}.</b> {scene.overview}</p>
    <h3>{spot.label}</h3>
    <p>{spot.summary}</p>
    <dl className="pr-facts">{spot.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}<small>Fuente: {fact.source}</small></dd></div>)}</dl>
    <div><h4>{controlled ? 'Controles ilustrados en la escena' : 'Controles a verificar'}</h4><ul className={`pr-scene-controls ${controlled ? 'is-on' : ''}`}>{spot.controls.map(control => <li key={control}>{control}</li>)}</ul></div>
  </section>
}
