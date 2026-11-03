import { Crown, Menu, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NAV_ITEMS, type SiteViewId } from '../data/platformContent'
import type { ApiUser } from '../lib/api'

interface SiteHeaderProps {
  active: SiteViewId
  onNavigate: (view: SiteViewId) => void
  user: ApiUser | null
  premiumPercent: number | null
}

export function SiteHeader({ active, onNavigate, user, premiumPercent }: SiteHeaderProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // La barra queda fija; al desplazarse se compacta y gana sombra.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function go(view: SiteViewId) {
    onNavigate(view)
    setOpenMenu(false)
  }

  const items = NAV_ITEMS.filter((item) => item.id !== 'premium')

  return (
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`}>
      <button type="button" className="site-brand" onClick={() => go('inicio')} aria-label="Observatorio SST Perú, ir al inicio">
        <span className="site-logo" aria-hidden="true">
          <ShieldCheck size={22} />
        </span>
        <span className="site-brand-text">
          <strong>Observatorio SST Perú</strong>
          <small>SST · SSOMA · Salud ocupacional · IPERC</small>
        </span>
      </button>

      <nav className="site-nav" aria-label="Navegación principal">
        {items.map((item) => (
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
        className={`premium-chip ${active === 'premium' ? 'active' : ''} ${user ? 'signed' : ''}`}
        onClick={() => go('premium')}
        title={user ? `Sesión: ${user.email}` : 'Acceso premium'}
      >
        {user ? <UserRound size={16} aria-hidden="true" /> : <Crown size={16} aria-hidden="true" />}
        <span>{user ? (premiumPercent !== null ? `${premiumPercent}%` : 'Mi panel') : 'Premium'}</span>
      </button>

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
