import { Crown, Lock } from 'lucide-react'
import type { SiteViewId } from '../data/platformContent'

/** Implementar (IPERC en línea y formatos editables) queda reservado a la cuenta premium. */
export function PremiumLock({ view, onNavigate }: { view: SiteViewId; onNavigate: (view: SiteViewId) => void }) {
  return (
    <section className="premium-lock" aria-labelledby="lock-title">
      <span className="lock-icon" aria-hidden="true"><Lock size={26} /></span>
      <h1 id="lock-title">{view === 'herramientas' ? 'IPERC y herramientas' : view === 'ia' ? 'IA premium: diagnóstico, informes y alertas' : 'Formatos y registros editables'}</h1>
      <p>
        La IA es la zona premium: solicite su prueba gratuita de 7 a 15 días con su DNI.
        Las herramientas, formatos y plantillas siguen siendo libres.
      </p>
      <div className="lock-actions">
        <button type="button" className="btn-primary" onClick={() => onNavigate('premium')}>
          <Crown size={16} aria-hidden="true" /> Ingresar o crear cuenta
        </button>
        <button type="button" className="btn-secondary" onClick={() => onNavigate('plantillas')}>
          Ir a plantillas descargables
        </button>
      </div>
    </section>
  )
}
