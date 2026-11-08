import { ArrowRight, ScanSearch } from 'lucide-react'
import type { SiteViewId } from '../data/platformContent'

export default function PreventionPreview({ onNavigate }: { onNavigate: (view: SiteViewId) => void }) {
  return <section className="pr-preview" aria-labelledby="pr-preview-title">
    <div>
      <h2 id="pr-preview-title">Riesgos y controles</h2>
      <p>Por sector o ambiente: qué controlar, medir y verificar.</p>
    </div>
    <button className="btn-primary" type="button" onClick={() => onNavigate('explorador')}><ScanSearch size={17} aria-hidden="true" /> Abrir explorador <ArrowRight size={17} aria-hidden="true" /></button>
  </section>
}
