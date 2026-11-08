import { useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { CALIBRATION_NOTE, filterEquipment, HELMET_COMPARISON, HELMET_NTP_SOURCE, HELMET_SOURCE, PREVENTION_EQUIPMENT, type EquipmentFact } from '../data/preventionEquipment'
import PreventionEquipmentArt from './PreventionEquipmentArt'

function FactList({ items }: { items: EquipmentFact[] }) {
  return <dl className="pr-facts">{items.map(item => <div key={item.label}><dt>{item.label}</dt><dd>{item.value}<small>Fuente: {item.source}</small></dd></div>)}</dl>
}

export default function PreventionEquipment() {
  const [kind, setKind] = useState('epp')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('cabeza')
  const results = useMemo(() => filterEquipment(kind, query), [kind, query])
  const selected = results.find(item => item.id === selectedId) ?? results[0]
  const eppCount = PREVENTION_EQUIPMENT.filter(item => item.kind === 'epp').length
  const toolCount = PREVENTION_EQUIPMENT.length - eppCount
  return <section aria-labelledby="pr-equipment-title">
    <div className="pr-section-head"><h2 id="pr-equipment-title">EPP e instrumentos</h2><p>{eppCount} familias de protección y {toolCount} instrumentos, con norma, selección, inspección y calibración.</p></div>
    <div className="pr-filters"><label className="pr-search"><Search size={18} aria-hidden="true" /><span className="sr-only">Buscar EPP o instrumento</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ej.: casco, respirador, luxómetro…" /></label><label className="pr-field">Tipo<select value={kind} onChange={event => { setKind(event.target.value); setSelectedId('') }}><option value="epp">Equipos de protección personal</option><option value="instrumento">Instrumentos de medición</option></select></label></div>
    <div className="pr-workspace"><aside className="pr-master" aria-label="Catálogo de equipos"><p className="pr-result-count" role="status">{results.length} resultados</p>{results.map(item => <button type="button" className="pr-result" key={item.id} aria-pressed={selected?.id === item.id} onClick={() => setSelectedId(item.id)}><b>{item.title}</b><ArrowRight size={16} aria-hidden="true" /></button>)}</aside>
      {selected ? <article className="pr-detail" key={selected.id}>
        <header className="pr-detail-heading"><h3>{selected.title}</h3><p>{selected.purpose}</p></header>
        <PreventionEquipmentArt id={selected.id} kind={selected.kind} />
        <p className="pr-muted pr-caption">Esquema conceptual, sin escala ni modelo comercial.</p>
        <div className="pr-block"><h4>Normas de referencia</h4><FactList items={selected.standards} /></div>
        <div className="pr-detail-columns"><section><h4>Criterios de selección</h4><ul className="pr-bullets">{selected.selection.map(text => <li key={text}>{text}</li>)}</ul></section><section><h4>Datos exactos</h4><FactList items={selected.facts} /></section></div>
        {selected.calibration && <div className="pr-block pr-calibration"><h4>Calibración y verificación</h4><FactList items={selected.calibration} /><p className="pr-notice">{CALIBRATION_NOTE}</p></div>}
        <div className="pr-detail-columns"><section><h4>Inspección</h4><p>{selected.inspection}</p></section><section><h4>{selected.kind === 'epp' ? 'Vida útil y retiro' : 'Retiro de servicio'}</h4><p>{selected.replacement}</p></section></div>
        <div className="pr-block"><h4>Límites de uso</h4><p>{selected.limits}</p></div>
        {selected.id === 'cabeza' && <div className="pr-block"><h4>Impacto y clase eléctrica son atributos distintos</h4><ul className="pr-hierarchy">{HELMET_COMPARISON.map(row => <li key={row.label}><b>{row.label}</b><p>{row.description}</p></li>)}</ul><p className="pr-notice">2 200 V y 20 000 V son tensiones de ensayo, no de trabajo. La ficha INACAL identifica la NTP 399.018:2022 como no obligatoria por sí misma; ello no elimina la obligación de seleccionar protección adecuada ni una posible exigencia por remisión normativa o contractual.</p><p><a href={HELMET_SOURCE} target="_blank" rel="noopener noreferrer">Tipología y selección · OSHA</a> · <a href={HELMET_NTP_SOURCE} target="_blank" rel="noopener noreferrer">Ficha NTP 399.018:2022 · INACAL</a></p></div>}
        <p className="pr-muted"><b>Estado:</b> {selected.status}</p>
        <p className="pr-muted"><a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">{selected.kind === 'epp' ? 'Fuente oficial de selección · OSHA' : 'Acreditación y directorios · INACAL'} ↗</a> · Revisión: 07/11/2026. Las referencias extranjeras no son automáticamente obligatorias en Perú; confirme norma, edición y marcado antes de adquirir o usar el equipo.</p>
      </article> : <div className="pr-empty"><h3>No encontramos ese equipo.</h3><p>Pruebe otra palabra o restablezca la búsqueda.</p><button type="button" onClick={() => setQuery('')}>Restablecer búsqueda</button></div>}
    </div>
  </section>
}
