import React from 'react'

export default function Header({ activeCategoryGroup, products, activeCategory, setActiveCategory, searchQuery, setSearchQuery }) {
  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean).sort())]

  return (
    <section className="hero" id="hero" aria-labelledby="hero-title">
      <div className="hero__inner hero__inner--two-col">
        <div className="hero__left">
          <h1 className="hero__title" id="hero-title">
            {activeCategoryGroup || 'Catálogo'}
          </h1>
          <p className="hero__subtitle">Repuestos y componentes para ascensores — Grupo Globe</p>
        </div>
        <div className="hero__right">
          <div className="search-bar" role="search">
            <label htmlFor="search-input" className="sr-only">Buscar producto</label>
            <input
              type="search"
              id="search-input"
              placeholder="Buscar por nombre, SKU, código o descripción…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoComplete="off"
            />
            <button type="button" aria-label="Buscar">Buscar</button>
          </div>
        </div>
      </div>
    </section>
  )
}
