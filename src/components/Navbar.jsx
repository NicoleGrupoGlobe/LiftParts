import React from 'react'
import logo from '../../assets/LogoLiftParts.svg'

export default function Navbar({ activeCategoryGroup, setActiveCategoryGroup, cartCount, onCartClick }) {
  function toggleGroup(group) {
    setActiveCategoryGroup(activeCategoryGroup === group ? null : group)
  }

  return (
    <header className="navbar" role="banner">
      <div className="navbar__inner">
        <a className="navbar__logo" href="#" aria-label="Globe Lift Parts — inicio">
          <img src={logo} alt="Globe Lift Parts" />
        </a>

        <nav className="navbar__nav-center" aria-label="Filtro por categoría">
          <button
            className={`nav-group-btn${activeCategoryGroup === 'Ascensores' ? ' active' : ''}`}
            onClick={() => toggleGroup('Ascensores')}
          >
            Ascensores
          </button>
          <button
            className={`nav-group-btn${activeCategoryGroup === 'Escaleras Mecánicas' ? ' active' : ''}`}
            onClick={() => toggleGroup('Escaleras Mecánicas')}
          >
            Escaleras Mecánicas
          </button>
        </nav>

        <button className="cart-btn" onClick={onCartClick} aria-label="Carrito de compras">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
