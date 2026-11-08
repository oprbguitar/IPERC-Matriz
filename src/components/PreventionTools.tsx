import { useState } from 'react'
import { noiseReferenceHours, uvBand } from '../lib/prevention'

const NOISE_ROWS = [88, 91, 94, 97, 100]
const formatTime = (hours: number) => hours >= 1 ? `${hours.toLocaleString('es-PE', { maximumFractionDigits: 2 })} h` : `${Math.round(hours * 60)} min`

export default function PreventionTools({ onOpenNorm }: { onOpenNorm: (id: string) => void }) {
  const [db, setDb] = useState(85)
  const [uv, setUv] = useState(6)
  const hours = noiseReferenceHours(db)
  const band = uvBand(uv)
  return <section className="pr-tools" aria-labelledby="pr-tools-title">
    <div className="pr-section-head"><h2 id="pr-tools-title">Ruido e índice UV</h2><p>Valores elegidos por usted: son entradas didácticas, no mediciones.</p></div>
    <div className="pr-tools-grid">
      <article className="pr-tool"><h3>Índice de ruido: nivel y tiempo</h3>
        <div className="pr-explain"><p><b>Qué muestra:</b> cuántas horas a nivel constante equivalen a la dosis de referencia (100 % = 85 dB(A) durante 8 h).</p><p><b>Cómo leerlo:</b> cada 3 dB que sube el nivel, el tiempo se reduce a la mitad.</p><p><b>Para qué sirve:</b> priorizar el control de la fuente y comprender por qué 3 dB importan. No reemplaza la dosimetría ni fija un «tiempo seguro».</p></div>
        <label htmlFor="pr-db">Nivel constante ilustrativo <output htmlFor="pr-db">{db} dB(A)</output></label><input id="pr-db" type="range" min="85" max="100" step="1" value={db} onChange={e => setDb(Number(e.target.value))} />
        <div className="pr-reading"><strong>{hours !== null ? formatTime(hours) : '—'}</strong><span>Duración de referencia del modelo</span></div>
        <div className="pr-meter" aria-hidden="true"><span style={{ width: `${Math.min(100, (hours ?? 0) / 8 * 100)}%` }} /></div>
        <table className="pr-table"><caption className="sr-only">Duración de referencia por nivel</caption><thead><tr><th>Nivel dB(A)</th>{NOISE_ROWS.map(level => <th key={level}>{level}</th>)}</tr></thead><tbody><tr><th>Tiempo</th>{NOISE_ROWS.map(level => <td key={level}>{formatTime(noiseReferenceHours(level) ?? 0)}</td>)}</tr></tbody></table>
        <p className="pr-muted">Modelo T = 8 × 2<sup>(85 − L)/3</sup> h (intercambio de 3 dB, NIOSH 98-126), para nivel constante entre 85 y 100 dB(A), sin ruido impulsivo. OSHA usa 90 dB(A) con intercambio de 5 dB. En tareas de atención constante y alta exigencia intelectual la R.M. 375-2008-TR contempla un criterio específico menor; revíselo para su actividad.</p>
        <button className="pr-text-btn" type="button" onClick={() => onOpenNorm('rm-375-2008-tr')}>Consultar R.M. 375-2008-TR →</button></article>
      <article className="pr-tool"><h3>Índice UV</h3>
        <div className="pr-explain"><p><b>Qué muestra:</b> la intensidad de la radiación ultravioleta ambiental, en la clasificación de la OMS.</p><p><b>Cómo leerlo:</b> de 3 en adelante se recomienda protección; el pico va de 10:00 a 16:00.</p><p><b>Para qué sirve:</b> decidir horarios, sombra y barreras. No calcula dosis individual ni minutos seguros.</p></div>
        <label htmlFor="pr-uv">Índice UV ilustrativo <output htmlFor="pr-uv">{uv}</output></label><input id="pr-uv" type="range" min="0" max="14" step="1" value={uv} onChange={e => setUv(Number(e.target.value))} />
        <div className="pr-reading"><strong>{band?.label}</strong><span>Clasificación educativa de la OMS</span></div>
        <p>{band?.advice}</p>
        <a className="pr-text-btn" href="https://www.who.int/news-room/questions-and-answers/item/radiation-the-ultraviolet-(uv)-index" target="_blank" rel="noopener noreferrer">Fuente: índice UV de la OMS ↗</a>
        <button className="pr-text-btn" type="button" onClick={() => onOpenNorm('ds-003-2026-sa')}>Marco peruano: D.S. 003-2026-SA →</button></article>
    </div>
  </section>
}
