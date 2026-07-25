import { Menu, ShieldCheck, X } from 'lucide-react'
import { useState } from 'react'
import { NAV_ITEMS, type SiteViewId } from '../data/platformContent'

interface SiteHeaderProps {
  active: SiteViewId
  onNavigate: (view: SiteViewId) => void
}

export function SiteHeader({ active, onNavigate }: SiteHeaderProps) {
  const [openMenu, setOpenMenu] = useState(false)

  function go(view: SiteViewId) {
    onNavigate(view)
    setOpenMenu(false)
  }

  return (
    <header className="site-header">
      <button type="button" className="site-brand" onClick={() => go('inicio')} aria-label="Ruta SST Perú, ir al inicio">
        <span className="site-logo" aria-hidden="true">
          <ShieldCheck size={22} />
        </span>
        <span className="site-brand-text">
          <strong>Ruta SST Perú</strong>
          <small>Seguridad, Salud, Medio Ambiente y Gestión Preventiva</small>
        </span>
      </button>

      <nav className="site-nav" aria-label="Navegación principal">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={active === item.id ? 'active' : ''}
            aria-current={active === item.id ? 'page' : undefined}
            title={item.description}
            onClick={() => go(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <button
        type="button"
        className="site-menu-toggle"
        aria-expanded={openMenu}
        aria-label={openMenu ? 'Cerrar menu' : 'Abrir menu'}
        onClick={() => setOpenMenu((value) => !value)}
      >
        {openMenu ? <X size={20} /> : <Menu size={20} />}
      </button>

      {openMenu && (
        <nav className="site-nav-mobile" aria-label="Navegación principal (móvil)">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              className={active === item.id ? 'active' : ''}
              aria-current={active === item.id ? 'page' : undefined}
              onClick={() => go(item.id)}
            >
              <b>{item.label}</b>
              <small>{item.description}</small>
            </button>
          ))}
        </nav>
      )}
    </header>
  )
}

export default SiteHeader
