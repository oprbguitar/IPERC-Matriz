import { useId, useMemo, useState } from 'react'
import { ArrowRight, Search } from 'lucide-react'
import { filterEquipment, HELMET_COMPARISON, HELMET_NTP_SOURCE, HELMET_SOURCE } from '../data/preventionEquipment'

function EquipmentIllustration({ kind }: { kind: string }) {
  const titleId = useId()
  return <svg className="pr-equip-illustration" viewBox="0 0 360 160" role="img" aria-labelledby={titleId}>
    <title id={titleId}>{kind === 'epp' ? 'Esquema ilustrativo de casco y protección ocular' : 'Esquema ilustrativo de un instrumento de medición'}</title>
    <path d="M20 139H340" stroke="var(--pr-line)" fill="none"/>
    {kind === 'epp' ? <g fill="none" stroke="var(--pr-accent)" strokeWidth="3" strokeLinejoin="round"><path d="M65 100C65 37 159 27 169 100M59 101H178V112H52V105Z" fill="var(--pr-bg)"/><path d="M107 50V90M120 50V90M69 117L82 135H149L162 117"/><path d="M224 90H321L314 119H284L277 105L269 119H235Z" fill="var(--pr-bg)"/><path d="M224 90L205 77M321 90L339 78"/><path d="M184 29L205 20M189 47H216M180 66L198 78" stroke="var(--pr-teal)"/></g> : <g fill="none" stroke="var(--pr-accent)" strokeWidth="3" strokeLinejoin="round"><rect x="92" y="30" width="90" height="108" rx="2" fill="var(--pr-bg)"/><path d="M136 30V14"/><circle cx="136" cy="10" r="7" fill="var(--pr-teal)"/><rect x="106" y="46" width="62" height="27" rx="1"/><path d="M115 61H123L129 53L138 65L146 58H160" stroke="var(--pr-teal)"/><circle cx="137" cy="103" r="16"/><path d="M137 103L146 94M182 119C235 143 256 112 244 78L264 47"/><circle cx="267" cy="38" r="11"/><path d="M217 34H235M220 20L230 28M222 50L234 43" stroke="var(--pr-teal)"/></g>}
  </svg>
}

export default function PreventionEquipment() {
  const [kind, setKind] = useState('epp')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState('cabeza')
  const results = useMemo(() => filterEquipment(kind,query), [kind,query])
  const selected = results.find(item => item.id === selectedId) ?? results[0]
  return <section aria-labelledby="pr-equipment-title">
    <div className="pr-section-head"><span className="pr-kicker">Elegir, inspeccionar y comprobar</span><h2 id="pr-equipment-title">EPP e instrumentos, con criterio técnico</h2><p>Diez familias de protección y ocho instrumentos. Compare su función, sus límites y la evidencia que debe revisar.</p></div>
    <div className="pr-filters"><label className="pr-search"><Search size={18} aria-hidden="true"/><span className="sr-only">Buscar EPP o instrumento</span><input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Ej.: casco, respirador, luxómetro…" /></label><label>Tipo de equipo<select value={kind} onChange={event => setKind(event.target.value)}><option value="epp">Equipos de protección personal</option><option value="instrumento">Instrumentos de medición</option></select></label></div>
    <div className="pr-workspace"><aside className="pr-master" aria-label="Catálogo de equipos"><p className="pr-result-count" role="status">{results.length} resultados</p>{results.map(item => <button type="button" className="pr-result" key={item.id} aria-pressed={selected?.id === item.id} onClick={() => setSelectedId(item.id)}><small>{item.kind === 'epp' ? 'PROTECCIÓN PERSONAL' : 'MEDICIÓN Y VERIFICACIÓN'}</small><b>{item.title}</b><span>{item.purpose}</span><ArrowRight size={16} aria-hidden="true"/></button>)}</aside>
      {selected ? <article className="pr-detail" key={selected.id}>
        <header className="pr-detail-heading"><span className="pr-kicker">{selected.kind === 'epp' ? 'La última barrera requiere selección y ajuste' : 'Medir exige un método y trazabilidad'}</span><h3>{selected.title}</h3><p>{selected.purpose}</p></header>
        <EquipmentIllustration kind={selected.kind}/>
        <p className="pr-muted">Esquema conceptual, sin escala. No representa certificación ni un modelo comercial.</p>
        <div className="pr-detail-columns"><section><h3>Límites de uso</h3><p>{selected.limits}</p></section><section><h3>Inspección y mantenimiento</h3><p>{selected.inspection}</p></section><section><h3>Retiro o sustitución</h3><p>{selected.replacement}</p></section><section><h3>Marcado y referencia técnica</h3><p>{selected.reference}</p></section></div>
        {selected.id === 'cabeza' && <section><h3>Cascos: impacto y clase eléctrica son atributos distintos</h3><ul className="pr-hierarchy">{HELMET_COMPARISON.map(row => <li key={row.label}><b>{row.label}</b><p>{row.description}</p></li>)}</ul><p className="pr-notice">2 200 V y 20 000 V son tensiones de ensayo. Nunca son autorización para trabajar a esas tensiones.</p><p>La ficha INACAL identifica la NTP 399.018:2022 como no obligatoria por sí misma. Esto no elimina la obligación de seleccionar protección adecuada ni una posible exigencia por remisión normativa o contractual.</p><p><a href={HELMET_SOURCE} target="_blank" rel="noopener noreferrer">Tipología y selección · OSHA</a> · <a href={HELMET_NTP_SOURCE} target="_blank" rel="noopener noreferrer">Ficha NTP 399.018:2022 · INACAL</a></p></section>}
        {selected.kind === 'instrumento' && <p className="pr-notice"><b>Distinga las evidencias.</b> Un certificado de calibración informa resultados metrológicos; la conformidad del producto y la acreditación del laboratorio son evidencias diferentes. Verifique alcance de acreditación, identificación del equipo, magnitud, rango e incertidumbre. La periodicidad depende del uso, historial y requisitos aplicables.</p>}
        <p className="pr-muted"><b>Estado:</b> {selected.status}</p><p><a href={selected.sourceUrl} target="_blank" rel="noopener noreferrer">{selected.kind === 'epp' ? 'Fuente general oficial de selección · OSHA' : 'Consultar acreditación y directorios · INACAL'} ↗</a></p><p className="pr-muted">Revisión: 07/11/2026. Las referencias extranjeras no son automáticamente obligatorias en Perú. Confirme norma, edición, marcado y aplicabilidad antes de adquirir o usar el equipo.</p>
      </article> : <div className="pr-empty"><h3>No encontramos ese equipo.</h3><p>Pruebe otra palabra o restablezca la búsqueda.</p><button type="button" onClick={() => setQuery('')}>Restablecer búsqueda</button></div>}
    </div>
  </section>
}
