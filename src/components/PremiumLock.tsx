import { Crown, Lock } from 'lucide-react'
import type { SiteViewId } from '../data/platformContent'

/** Implementar (IPERC en línea y formatos editables) queda reservado a la cuenta premium. */
export function PremiumLock({ view, onNavigate }: { view: SiteViewId; onNavigate: (view: SiteViewId) => void }) {
  return (
    <section className="premium-lock" aria-labelledby="lock-title">
      <span className="lock-icon" aria-hidden="true"><Lock size={26} /></span>
      <h1 id="lock-title">{view === 'herramientas' ? 'IPERC y herramientas' : 'Formatos y registros editables'}</h1>
      <p>
        El espacio <b>Implementar</b> está disponible para cuentas premium mientras lo terminamos de afinar.
        Mientras tanto, puede descargar todas las plantillas adaptadas a su empresa desde la Biblioteca.
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
