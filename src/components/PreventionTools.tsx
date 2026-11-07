import { useState } from 'react'
import { noiseReferenceHours, uvBand } from '../lib/prevention'

export default function PreventionTools({ onOpenNorm }: { onOpenNorm: (id: string) => void }) {
  const [db, setDb] = useState(85)
  const [uv, setUv] = useState(6)
  const hours = noiseReferenceHours(db)
  const band = uvBand(uv)
  return <section className="pr-tools" aria-labelledby="pr-tools-title">
    <div className="pr-section-head"><span className="pr-kicker">Experimente y comprenda</span><h2 id="pr-tools-title">Dos referencias, ninguna medición inventada.</h2><p>Mueva los controles. Los valores son entradas didácticas elegidas por usted.</p></div>
    <div className="pr-tools-grid">
      <article className="pr-tool"><h3>Ruido: nivel y tiempo</h3><label htmlFor="pr-db">Nivel constante ilustrativo <output htmlFor="pr-db">{db} dB(A)</output></label><input id="pr-db" type="range" min="85" max="100" step="1" value={db} onChange={e => setDb(Number(e.target.value))} /><div className="pr-reading"><strong>{hours !== null ? (hours >= 1 ? `${hours.toLocaleString('es-PE', { maximumFractionDigits: 2 })} h` : `${Math.round(hours * 60)} min`) : '—'}</strong><span>Duración de referencia del modelo</span></div><div className="pr-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, (hours ?? 0) / 8 * 100)}%` }} /></div><p><b>Modelo:</b> T = 8 × 2<sup>(85 − L) / 3</sup> horas; intercambio de 3 dB. Nivel constante entre 85 y 100 dB(A), sin ruido impulsivo ni dosis de jornada variable.</p><p>No determina un «tiempo seguro». En tareas de atención constante y alta exigencia intelectual, la R.M. 375 contempla un criterio específico menor de 65 dB, que debe revisarse para la actividad.</p><button className="pr-text-btn" type="button" onClick={() => onOpenNorm('rm-375-2008-tr')}>Consultar R.M. 375-2008-TR →</button></article>
      <article className="pr-tool"><h3>Sol: interprete el índice UV</h3><label htmlFor="pr-uv">Índice UV ilustrativo <output htmlFor="pr-uv">{uv}</output></label><input id="pr-uv" type="range" min="0" max="14" step="1" value={uv} onChange={e => setUv(Number(e.target.value))} /><div className="pr-reading"><strong>{band?.label}</strong><span>Clasificación educativa OMS</span></div><p>{band?.advice}</p><p>El índice describe la intensidad de la radiación UV ambiental. No calcula dosis individual, riesgo de cáncer ni minutos de exposición seguros; tampoco es una lectura meteorológica en vivo.</p><a className="pr-text-btn" href="https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index" target="_blank" rel="noopener noreferrer">Fuente: índice UV de la OMS ↗</a><button className="pr-text-btn" type="button" onClick={() => onOpenNorm('ds-003-2026-sa')}>Marco peruano: D.S. 003-2026-SA →</button></article>
    </div>
  </section>
}
