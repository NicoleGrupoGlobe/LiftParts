import React from 'react'

export default function QuickFilters({ products, selectedBrands, onBrandToggle, searchQuery, setSearchQuery }) {
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]

  return (
    <div className="quick-filters">
      <div className="quick-filters__row">
        <div className="quick-filters__left">
          <div className="quick-filters__header">
            <span className="quick-filters__title">Filtrar por marca</span>
          </div>
          <div className="quick-filters__pills">
            {brands.map(brand => (
              <button
                key={brand}
                className={`brand-pill${selectedBrands.includes(brand) ? ' active' : ''}`}
                onClick={() => onBrandToggle(brand)}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
        <div className="navbar__search qf-search">
          <span className="navbar__search-icon">🔍</span>
          <input
            type="search"
            placeholder="Buscar producto, SKU…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoComplete="off"
          />
          <button type="button">Buscar</button>
        </div>
      </div>
    </div>
  )
}
