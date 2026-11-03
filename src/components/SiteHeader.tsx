import { Crown, Menu, Search, ShieldCheck, UserRound, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { NAV_ITEMS, SPACES, spaceOf, type SiteViewId } from '../data/platformContent'
import type { ApiUser } from '../lib/api'

interface SiteHeaderProps {
  active: SiteViewId
  onNavigate: (view: SiteViewId) => void
  onSearch: () => void
  user: ApiUser | null
  premiumPercent: number | null
}

const labelOf = (id: SiteViewId) => NAV_ITEMS.find((item) => item.id === id)?.label ?? id

export function SiteHeader({ active, onNavigate, onSearch, user, premiumPercent }: SiteHeaderProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const activeSpace = spaceOf(active)
  const space = SPACES.find((item) => item.id === activeSpace)

  // La barra queda fija; al desplazarse se compacta y gana sombra.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Atajo de teclado: Ctrl/Cmd + K abre la búsqueda.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onSearch()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSearch])

  function go(view: SiteViewId) {
    onNavigate(view)
    setOpenMenu(false)
  }

  return (
    <header className={`site-header spaced ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-row">
        <button type="button" className="site-brand" onClick={() => go('inicio')} aria-label="Observatorio SST Perú, ir al inicio">
          <span className="site-logo" aria-hidden="true">
            <ShieldCheck size={22} />
          </span>
          <span className="site-brand-text">
            <strong>Observatorio SST Perú</strong>
            <small>Normas · cumplimiento · prevención</small>
          </span>
        </button>

        <nav className="site-nav" aria-label="Espacios de trabajo">
          {SPACES.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSpace === item.id ? 'active' : ''}
              aria-current={activeSpace === item.id ? 'true' : undefined}
              title={item.hint}
              onClick={() => go(item.views[0])}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <button type="button" className="search-trigger" onClick={onSearch} title="Buscar (Ctrl + K)">
          <Search size={16} aria-hidden="true" /> <span>Buscar</span> <kbd>Ctrl K</kbd>
        </button>

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
      </div>

      {space && (
        <nav className="sub-nav" aria-label={`Secciones de ${space.label}`}>
          <b>{space.label}</b>
          {space.views.map((view) => (
            <button key={view} type="button" className={active === view ? 'active' : ''} aria-current={active === view ? 'page' : undefined} onClick={() => go(view)}>
              {labelOf(view)}
            </button>
          ))}
        </nav>
      )}

      {openMenu && (
        <nav className="site-nav-mobile" aria-label="Navegación principal (móvil)">
          {SPACES.map((item) => (
            <div key={item.id} className="mobile-space">
              <small>{item.label}</small>
              {item.views.map((view) => (
                <button key={view} type="button" className={active === view ? 'active' : ''} onClick={() => go(view)}>
                  <b>{labelOf(view)}</b>
                </button>
              ))}
            </div>
          ))}
        </nav>
      )}
    </header>
  )
}

export default SiteHeader
