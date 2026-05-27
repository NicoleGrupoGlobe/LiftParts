import React, { useState } from 'react'

const VISIBLE_COUNT = 4

export default function QuickFilters({ products, selectedBrands, onBrandToggle }) {
  const [expanded, setExpanded] = useState(false)

  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]
  const visibleBrands = expanded ? brands : brands.slice(0, VISIBLE_COUNT)
  const hasMore = brands.length > VISIBLE_COUNT

  return (
    <div className="quick-filters">
      <div className="quick-filters__header">
        <span className="quick-filters__title">Filtros rápidos</span>
        <span className="quick-filters__label">MARCAS</span>
      </div>
      <div className="quick-filters__pills">
        {visibleBrands.map(brand => (
          <button
            key={brand}
            className={`brand-pill${selectedBrands.includes(brand) ? ' active' : ''}`}
            onClick={() => onBrandToggle(brand)}
          >
            {brand}
          </button>
        ))}
        {hasMore && (
          <button className="brand-pill" onClick={() => setExpanded(e => !e)}>
            {expanded ? 'Menos' : `+ Más`}
          </button>
        )}
      </div>
    </div>
  )
}
