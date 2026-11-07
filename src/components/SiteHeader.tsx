import { ChevronDown, Crown, Menu, Search, UserRound, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { NAV_ITEMS, spaceOf, spacesFor, type SiteViewId, type SpaceId } from '../data/platformContent'
import type { ApiUser } from '../lib/api'
import { assetUrl } from '../lib/assets'

interface SiteHeaderProps {
  active: SiteViewId
  onNavigate: (view: SiteViewId) => void
  onSearch: () => void
  user: ApiUser | null
  premiumPercent: number | null
}

const itemOf = (id: SiteViewId) => NAV_ITEMS.find((item) => item.id === id)

/**
 * Menú principal: un botón por espacio que despliega sus secciones (con una línea que
 * explica cada una). Se abre al pasar el cursor o con clic/teclado y se cierra con Escape
 * o al hacer clic fuera. En móvil, el mismo árbol aparece en el menú hamburguesa.
 */
export function SiteHeader({ active, onNavigate, onSearch, user, premiumPercent }: SiteHeaderProps) {
  const [openMenu, setOpenMenu] = useState(false)
  const [openSpace, setOpenSpace] = useState<SpaceId | null>(null)
  const [scrolled, setScrolled] = useState(false)
  const navRef = useRef<HTMLElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  const spaces = spacesFor(Boolean(user))
  const activeSpace = spaceOf(active)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onSearch()
      }
      if (event.key === 'Escape') {
        setOpenSpace(null)
        ;(document.activeElement as HTMLElement | null)?.blur()
      }
    }
    const onClick = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) setOpenSpace(null)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onClick)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onClick)
    }
  }, [onSearch])

  function go(view: SiteViewId) {
    onNavigate(view)
    setOpenMenu(false)
    setOpenSpace(null)
    ;(document.activeElement as HTMLElement | null)?.blur()
  }

  function hover(id: SpaceId | null) {
    window.clearTimeout(closeTimer.current)
    if (id) setOpenSpace(id)
    else closeTimer.current = window.setTimeout(() => setOpenSpace(null), 180)
  }

  return (
    <header className={`site-header spaced ${scrolled ? 'scrolled' : ''}`}>
      <div className="header-row">
        <button type="button" className="site-brand" onClick={() => go('inicio')} aria-label="Observatorio Prevenir Perú, ir al inicio">
          <img className="site-logo-img" src={assetUrl('brand/logo-128.png')} width={40} height={40} alt="" />
          <span className="site-brand-text">
            <strong>Observatorio Prevenir Perú</strong>
            <small>Seguridad · salud · ambiente</small>
          </span>
        </button>

        <nav className="site-nav menu-nav" aria-label="Espacios de trabajo" ref={navRef}>
          {spaces.map((space) => {
            const isOpen = openSpace === space.id
            return (
              <div key={space.id} className={`menu-item ${isOpen ? 'open' : ''}`} onMouseEnter={() => hover(space.id)} onMouseLeave={() => hover(null)}>
                <button
                  type="button"
                  className={activeSpace === space.id ? 'active' : ''}
                  aria-expanded={isOpen}
                  aria-haspopup="true"
                  onClick={() => setOpenSpace(isOpen ? null : space.id)}
                >
                  {space.label} <ChevronDown size={14} aria-hidden="true" />
                </button>
                {isOpen && (
                  <div className="menu-panel" role="menu" aria-label={space.label}>
                    <small className="menu-hint">{space.hint}</small>
                    {space.views.map((view) => {
                      const item = itemOf(view)
                      return (
                        <button
                          key={view}
                          type="button"
                          role="menuitem"
                          className={active === view ? 'current' : ''}
                          aria-current={active === view ? 'page' : undefined}
                          onClick={() => go(view)}
                        >
                          <b>{item?.label ?? view}</b>
                          <span>{item?.description}</span>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <button type="button" className="search-trigger" onClick={onSearch} title="Buscar (Ctrl + K)" aria-label="Buscar en el Observatorio">
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

      {openMenu && (
        <nav className="site-nav-mobile" aria-label="Navegación principal (móvil)">
          {spaces.map((space) => (
            <div key={space.id} className="mobile-space">
              <small>{space.label}</small>
              {space.views.map((view) => (
                <button key={view} type="button" className={active === view ? 'active' : ''} onClick={() => go(view)}>
                  <b>{itemOf(view)?.label ?? view}</b>
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
