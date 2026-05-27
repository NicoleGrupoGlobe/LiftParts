import React from 'react'
import logo from '../../assets/LogoLiftParts.svg'

export default function Navbar({ activeCategoryGroup, setActiveCategoryGroup, cartCount, onCartClick }) {
  function toggleGroup(group) {
    setActiveCategoryGroup(activeCategoryGroup === group ? null : group)
  }

  return (
    <header className="navbar" role="banner">
      <a className="navbar__logo-block" href="#" aria-label="Globe Lift Parts — inicio">
        <img src={logo} alt="Globe Lift Parts" />
      </a>

      <div className="navbar__inner">
        <nav className="navbar__nav-center" aria-label="Filtro por categoría">
          <span
            className={`nav-group-link${activeCategoryGroup === 'Ascensores' ? ' active' : ''}`}
            onClick={() => toggleGroup('Ascensores')}
            role="button"
            tabIndex={0}
          >
            Ascensores
          </span>
          <span
            className={`nav-group-link${activeCategoryGroup === 'Escaleras Mecánicas' ? ' active' : ''}`}
            onClick={() => toggleGroup('Escaleras Mecánicas')}
            role="button"
            tabIndex={0}
          >
            Escaleras Mecánicas
          </span>
        </nav>

        <div className="navbar__spacer" />

        <button className="cart-btn" onClick={onCartClick} aria-label="Carrito de compras">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
          </svg>
          {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
        </button>
      </div>
    </header>
  )
}
