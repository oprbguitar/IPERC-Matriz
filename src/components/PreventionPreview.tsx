import { ArrowRight, ScanSearch } from 'lucide-react'
import type { SiteViewId } from '../data/platformContent'

export default function PreventionPreview({ onNavigate }: { onNavigate: (view: SiteViewId) => void }) {
  return <section className="pr-preview" aria-labelledby="pr-preview-title">
    <div><span className="pr-kicker"><ScanSearch size={16} aria-hidden="true" /> Explore la prevención</span>
      <h2 id="pr-preview-title">Del peligro al control, en una sola vista.</h2>
      <p>Busque por industria, recorra ambientes y consulte qué medir, proteger y verificar.</p>
    </div>
    <div className="pr-preview-map" aria-hidden="true"><svg viewBox="0 0 300 110"><path d="M20 55H280M75 55V20H150V90H225V55" fill="none" stroke="currentColor" strokeDasharray="5 5"/><circle cx="25" cy="55" r="16"/><circle cx="150" cy="55" r="25"/><circle cx="275" cy="55" r="16"/><path d="M140 55l7 7 14-16" fill="none" stroke="white" strokeWidth="4"/><text x="25" y="91" textAnchor="middle">PELIGRO</text><text x="150" y="103" textAnchor="middle">CONTROL</text><text x="273" y="91" textAnchor="middle">EVIDENCIA</text></svg></div>
    <button className="btn-primary" type="button" onClick={() => onNavigate('explorador')}>Abrir explorador <ArrowRight size={17} aria-hidden="true" /></button>
  </section>
}
