import React, { useState } from 'react'
import ReactDOM from 'react-dom'

export default function ProductModal({ product: p, onClose, onAddToCart }) {
  const inStock = p.stock > 0
  const [qty, setQty] = useState(1)

  function changeQty(delta) {
    setQty(prev => {
      const next = prev + delta
      if (next < 1) return 1
      if (inStock && next > p.stock) return p.stock
      return next
    })
  }

  function handleQtyInput(e) {
    const v = parseInt(e.target.value) || 1
    const clamped = inStock ? Math.min(Math.max(1, v), p.stock) : Math.max(1, v)
    setQty(clamped)
  }

  return ReactDOM.createPortal(
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label={p.name}>
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">×</button>
        <div className="modal-body">
          <div className="modal-image">
            {p.image
              ? <img src={p.image} alt={p.name} />
              : <span className="img-placeholder" style={{ fontSize: '4rem' }}>📦</span>
            }
          </div>
          <div className="modal-details">
            <div className="modal-badges">
              <span className="brand-badge">{p.brand}</span>
              {p.tags?.map(t => <span key={t} className="tag">{t}</span>)}
            </div>
            <h2 className="modal-name">{p.name}</h2>
            <p className="card__sku">{p.sku}</p>
            <p className="modal-desc">{p.description}</p>
            <div className={`stock-indicator ${inStock ? 'in-stock' : 'out-of-stock'}`}>
              <span className="stock-dot" />
              {inStock ? `En stock (${p.stock} unidades)` : 'Agotado'}
            </div>
            <div className="quantity-selector">
              <button type="button" onClick={() => changeQty(-1)}>−</button>
              <input
                type="number"
                value={qty}
                min={1}
                max={inStock ? p.stock : undefined}
                onChange={handleQtyInput}
              />
              <button type="button" onClick={() => changeQty(1)}>+</button>
            </div>
            <button
              className={`card__cta modal-cta ${inStock ? 'cta-cotizar' : 'cta-solicitar'}`}
              onClick={() => onAddToCart(p, qty)}
            >
              {inStock ? 'Añadir al carrito' : 'Añadir solicitud'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
