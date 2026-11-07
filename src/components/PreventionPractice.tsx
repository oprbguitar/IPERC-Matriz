import { useState } from 'react'
import { ArrowRight, Download, FileText, Printer, Save } from 'lucide-react'
import type { SiteViewId } from '../data/platformContent'
import { downloadMarkdown, downloadWord, printPdf } from '../lib/docgen'
import { buildPracticeMarkdown, normalizePractice, PRACTICE_EXAMPLES, PRACTICE_FIELDS, PRACTICE_HIERARCHY, type PracticeData } from '../lib/preventionPractice'

const STORAGE_KEY = 'observatorio-sst:practica-preventiva:v1'
const TITLE = 'Práctica preventiva — actividad, tarea y control'

function readDraft(): PracticeData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return normalizePractice(raw && raw.length <= 12000 ? JSON.parse(raw) : null)
  } catch {
    return normalizePractice(null)
  }
}

export default function PreventionPractice({ onNavigate, onOpenNorm }: { onNavigate: (view: SiteViewId) => void; onOpenNorm: (id: string) => void }) {
  const [draft, setDraft] = useState<PracticeData>(readDraft)
  const [status, setStatus] = useState('El borrador se guarda solo cuando pulsa Guardar en este navegador.')
  const markdown = buildPracticeMarkdown(draft)
  function saveDraft() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePractice(draft)))
      setStatus('Borrador guardado en este navegador. No se envió a un servidor.')
    } catch {
      setStatus('El navegador no permitió guardar. Puede descargar el borrador para conservarlo.')
    }
  }
  return <section className="pr-practice" aria-labelledby="pr-practice-title">
    <div className="pr-section-head"><div><span className="pr-kicker">Del aprendizaje a la acción</span><h2 id="pr-practice-title">Construye tu primera ficha preventiva</h2><p>Actividad → tarea → peligro → evento peligroso → daño posible → control → evidencia. Complete una situación concreta y úsela para iniciar su evaluación.</p></div><span className="pr-notice">Pendiente de evaluación y verificación</span></div>
    <div className="pr-actions" aria-label="Cargar un ejemplo didáctico"><b>Pruebe con:</b>{PRACTICE_EXAMPLES.map(example => <button key={example.id} type="button" className="pr-button" onClick={() => { setDraft({ ...example.value }); setStatus(`Ejemplo didáctico de ${example.label.toLowerCase()} cargado. Revíselo y adáptelo a su tarea.`) }}>{example.label}</button>)}</div>
    <div className="pr-practice-grid">
      <form className="pr-form" onSubmit={event => { event.preventDefault(); saveDraft() }}>
        {PRACTICE_FIELDS.map(field => <label key={field.key}><span>{field.label}</span><textarea rows={field.key === 'measure' || field.key === 'evidence' ? 3 : 2} maxLength={800} value={draft[field.key]} placeholder={field.placeholder} onChange={event => { const value = event.target.value; setDraft(previous => ({ ...previous, [field.key]: value })) }} /></label>)}
        <label><span>Nivel principal de la medida propuesta</span><select value={draft.hierarchy} onChange={event => { const hierarchy = normalizePractice({ hierarchy: event.target.value }).hierarchy; setDraft(previous => ({ ...previous, hierarchy })) }}>{PRACTICE_HIERARCHY.map(level => <option key={level.id} value={level.id}>{level.label}</option>)}</select></label>
        <button className="pr-button pr-button-primary" type="submit"><Save size={16} aria-hidden="true"/> Guardar en este navegador</button>
        <p role="status" className="pr-muted">{status}</p>
      </form>
      <aside>
        <h3>Priorice actuar sobre el peligro</h3>
        <p>Esquema didáctico: de actuar en la fuente a proteger a la persona. Combine medidas según la evaluación.</p>
        <ol className="pr-hierarchy">{PRACTICE_HIERARCHY.map(level => <li key={level.id} data-selected={draft.hierarchy === level.id}><b>{level.label}</b><p>{level.description}</p></li>)}</ol>
        <p className="pr-notice"><b>Tercerizar no equivale a sustituir.</b> Contratar a otra empresa cambia quién realiza el trabajo; no elimina ni reemplaza por sí solo la fuente de peligro.</p>
        <p className="pr-muted">El art. 21 de la Ley N.° 29783 tiene un orden legal propio: eliminación; control o aislamiento; sistemas de trabajo seguro; sustitución progresiva; y EPP en último caso. La pirámide es una ayuda educativa.</p>
        <button type="button" className="pr-link" onClick={() => onOpenNorm('law-29783')}>Consultar Ley N.° 29783 <ArrowRight size={14} aria-hidden="true"/></button>
      </aside>
    </div>
    <div className="pr-notice"><b>Distinga los documentos.</b> La línea base describe la situación inicial del sistema de gestión. La matriz IPERC evalúa riesgos de actividades y tareas. La R.M. N.° 050-2013-TR aporta formatos referenciales; no establece un único método obligatorio para toda actividad. Los PETS son sectoriales cuando correspondan, no una denominación universal.</div>
    <div className="pr-actions"><button type="button" className="pr-button" onClick={() => downloadWord(TITLE, markdown)}><FileText size={16} aria-hidden="true"/> Word editable</button><button type="button" className="pr-button" onClick={() => downloadMarkdown(TITLE, markdown)}><Download size={16} aria-hidden="true"/> Markdown</button><button type="button" className="pr-button" onClick={() => printPdf(TITLE, markdown)}><Printer size={16} aria-hidden="true"/> Imprimir / PDF</button><button type="button" className="pr-link" onClick={() => onOpenNorm('rm-050-2013-tr')}>Ver R.M. N.° 050-2013-TR</button></div>
    <p className="pr-muted">El evento peligroso explica cómo podría producirse el daño; no es un nivel de riesgo calculado. No se calcula aceptabilidad con esta ficha: requiere metodología, evaluación de exposición y verificación en el lugar. Guardar o descargar no acredita cumplimiento.</p>
    <div className="pr-actions"><button type="button" className="pr-button" onClick={() => onNavigate('simulador')}>Practicar evaluación en el simulador <ArrowRight size={16} aria-hidden="true"/></button><button type="button" className="pr-link" onClick={() => onNavigate('herramientas')}>Abrir matriz IPERC · requiere cuenta</button></div>
  </section>
}
