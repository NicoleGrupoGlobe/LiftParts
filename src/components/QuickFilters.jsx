import React from 'react'

export default function QuickFilters({ products, selectedBrands, onBrandToggle }) {
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]

  return (
    <div className="quick-filters">
      <div className="quick-filters__header">
        <span className="quick-filters__title">Filtros rápidos</span>
        <span className="quick-filters__label">MARCAS</span>
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
  )
}
