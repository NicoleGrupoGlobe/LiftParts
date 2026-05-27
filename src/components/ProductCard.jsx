import React from 'react'

export default function ProductCard({ product: p, onCardClick, onAddToCart }) {
  return (
    <article className="card" role="listitem" onClick={onCardClick} style={{ cursor: 'pointer' }}>
      <div className="card__image">
        {p.image
          ? <img src={p.image} alt={p.name} loading="lazy" onError={e => { e.currentTarget.parentElement.innerHTML = '<span class="img-placeholder">📦</span>' }} />
          : <span className="img-placeholder">📦</span>
        }
      </div>
      <div className="card__body">
        <h3 className="card__name">{p.name}</h3>
        <p className="card__sku">{p.sku}</p>
        {p.tags?.length > 0 && (
          <div className="card__tags">
            {p.tags.map(t => <span key={t} className="tag">{t}</span>)}
          </div>
        )}
        <span className="brand-badge">{p.brand}</span>
        <button
          className="card__cta cta-cotizar"
          onClick={e => { e.stopPropagation(); onAddToCart() }}
        >
          {inStock ? 'Cotizar' : 'Solicitar'}
        </button>
      </div>
    </article>
  )
}
