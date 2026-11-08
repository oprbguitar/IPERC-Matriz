import { useState } from 'react'
import { ArrowDownToLine, CheckCheck, ExternalLink, FileText, Link, Printer, QrCode } from 'lucide-react'
import { findNorm } from '../data/legalDatabase'
import { OBLIGATION_KIND_LABELS } from '../data/platformContent'
import type { PreventionTopic } from '../data/prevention'
import { downloadMarkdown, downloadWord, printPdf } from '../lib/docgen'
import { topicReferenceFacts } from '../lib/prevention'

function topicMarkdown(topic: PreventionTopic, domestic: boolean) {
  return `# ${topic.title}\n\n${domestic ? 'Prevención doméstica general. Las referencias empresariales se ofrecen para consulta, no como obligaciones del hogar.' : 'Ficha educativa de prevención. No acredita cumplimiento.'}\n\nRevisión editorial: 07/11/2026.\n\n${topic.summary}\n\n## Exposición\n${topic.exposure}\n\n## Consecuencia posible\n${topic.consequence}\n\n## Controles propuestos\n${topic.controls.map(c => `- ${c}`).join('\n')}\n\n## Lista de inspección orientativa\n${topic.verification.map(v => `- [ ] ${v}`).join('\n')}\n\nResponsable: __________________\nFecha de verificación: __________________\nEvidencia: __________________\nResultado observado: __________________\n\n## Instrumentos\n${topic.instruments.map(i => `- ${i}`).join('\n')}\n\n## Protección personal\n${topic.ppe.map(i => `- ${i}`).join('\n')}\n\n## Referencias\n${topic.normIds.map(id => { const n = findNorm(id); return n ? `- [${n.shortName}](${n.officialPageUrl}) · ${n.notes ?? n.plainLanguageSummary}` : '' }).join('\n')}\n\n${topic.sourceUrls.map(url => `- ${url}`).join('\n')}\n\n## Alcance y restricciones\n${topic.limits}\n\n${topic.sourceStatus}\n\nFicha permanente: ${location.origin}${location.pathname}#/explorador?f=${topic.id}${domestic ? '&sector=domestic' : ''}`
}

export default function PreventionTopicDetail({ topic, domestic, profileHint, sectorNote, onOpenNorm, onTrack }: { topic: PreventionTopic; domestic: boolean; profileHint: string; sectorNote?: string; onOpenNorm: (id: string) => void; onTrack: () => void }) {
  const [feedback, setFeedback] = useState('')
  const facts = topicReferenceFacts(topic.id)
  const markdown = () => topicMarkdown(topic, domestic)
  const permalink = `${location.origin}${location.pathname}#/explorador?f=${topic.id}${domestic ? '&sector=domestic' : ''}`
  async function copyLink() {
    try { await navigator.clipboard.writeText(permalink); setFeedback('Enlace copiado.') }
    catch { setFeedback(`Enlace permanente: ${permalink}`) }
  }
  async function downloadQr() {
    try {
      const { toString } = await import('qrcode')
      const svg = await toString(permalink, { type: 'svg', margin: 4, errorCorrectionLevel: 'M' })
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = `ficha-${topic.id}-qr.svg`; anchor.click()
      window.setTimeout(() => URL.revokeObjectURL(url), 1000)
      setFeedback('QR descargado. Complementa la ficha; no sustituye señalización normalizada.')
    } catch { setFeedback('No se pudo generar el QR. Puede copiar el enlace de la ficha.') }
  }
  return <article className="pr-detail" aria-labelledby="pr-detail-title">
    <div className="pr-detail-heading"><h2 id="pr-detail-title">{topic.title}</h2><p>{topic.summary}</p></div>
    {domestic && <p className="pr-notice">Hogar: prevención general. Las obligaciones empresariales de SST no se trasladan automáticamente a actividades domésticas.</p>}
    {sectorNote && <p className="pr-sector-note"><b>En este sector:</b> {sectorNote}</p>}
    <div className="pr-detail-columns"><section><h4>Exposición</h4><p>{topic.exposure}</p></section><section><h4>Consecuencia posible</h4><p>{topic.consequence}</p></section></div>
    <div className="pr-detail-columns"><section><h4>Controle antes de exponerse</h4><ol className="pr-checklist">{topic.controls.map(c => <li key={c}>{c}</li>)}</ol></section><section><h4>Compruebe con evidencia</h4><ul className="pr-evidence">{topic.verification.map(v => <li key={v}><CheckCheck size={16} aria-hidden="true" />{v}</li>)}</ul></section></div>
    <p className="pr-hint"><b>Su siguiente acción:</b> {profileHint}</p>
    {facts.length > 0 && <details className="pr-disclosure" open><summary>Datos de referencia con fuente ({facts.length})</summary><dl className="pr-facts">{facts.map(fact => <div key={`${fact.label}-${fact.value}`}><dt>{fact.label}</dt><dd>{fact.value}<small>Fuente: {fact.source}</small></dd></div>)}</dl></details>}
    <details className="pr-disclosure"><summary>Instrumentos y protección personal</summary><div className="pr-detail-columns"><div><h4>Qué medir o revisar</h4><ul className="pr-bullets">{topic.instruments.map(i => <li key={i}>{i}</li>)}</ul></div><div><h4>Qué protección evaluar</h4><ul className="pr-bullets">{topic.ppe.map(i => <li key={i}>{i}</li>)}</ul></div></div><p>Los datos de calibración y selección están en la pestaña «EPP e instrumentos». Calibración, certificación de producto y acreditación del laboratorio son evidencias distintas.</p></details>
    <details className="pr-disclosure"><summary>Normas, fuentes y límites de aplicación</summary><p>{topic.sourceStatus}</p><ul className="pr-norms">{topic.normIds.map(id => { const norm = findNorm(id); return norm ? <li key={id}><button type="button" onClick={() => onOpenNorm(id)}>{norm.shortName} <ExternalLink size={14} aria-hidden="true" /></button><span>{OBLIGATION_KIND_LABELS[norm.obligationKind]} · última revisión del catálogo: {norm.lastVerifiedAt}</span><p>{norm.appliesTo.join(' · ')}</p></li> : null })}</ul>{topic.sourceUrls.map(url => <a key={url} href={url} target="_blank" rel="noopener noreferrer">Referencia técnica adicional ↗</a>)}<p className="pr-notice">{topic.limits}</p><p>Revisión editorial: 07/11/2026. Una referencia internacional no es automáticamente obligatoria en Perú.</p></details>
    <div className="pr-downloads" aria-label="Recursos de esta ficha"><button type="button" onClick={() => printPdf(topic.title, markdown())}><Printer size={15} /> PDF</button><button type="button" onClick={() => downloadWord(topic.title, markdown())}><FileText size={15} /> Word</button><button type="button" onClick={() => downloadMarkdown(topic.title, markdown())}><ArrowDownToLine size={15} /> Markdown</button><button type="button" onClick={copyLink}><Link size={15} /> Enlace</button><button type="button" onClick={downloadQr}><QrCode size={15} /> QR</button><button type="button" onClick={onTrack}>Ir a seguimiento →</button></div>
    <p className="pr-feedback" role="status">{feedback}</p>
  </article>
}
