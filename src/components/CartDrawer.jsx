import React from 'react'

export default function CartDrawer({ isOpen, onClose, cartItems, updateQuantity, removeItem }) {
  function buildCartSummary() {
    return cartItems
      .map(i => `${i.name} | SKU: ${i.sku} | Cant: ${i.quantity}${i.isRequest ? ' (Solicitud)' : ''}`)
      .join('\n')
  }

  function handleSolicitar() {
    const body = encodeURIComponent(buildCartSummary())
    window.location.href = `mailto:contacto@grupoglobe.com?subject=Cotizaci%C3%B3n%20Globe%20Lift%20Parts&body=${body}`
  }

  return (
    <>
      <div className={`cart-backdrop${isOpen ? ' visible' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`cart-drawer${isOpen ? ' open' : ''}`} aria-label="Carrito de compras">
        <div className="cart-header">
          <span>Mi carrito</span>
          <button className="cart-close" onClick={onClose} aria-label="Cerrar carrito">×</button>
        </div>
        <div className="cart-body">
          {cartItems.length === 0 ? (
            <p className="cart-empty">Tu carrito está vacío.</p>
          ) : (
            cartItems.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item__thumb">
                  {item.image
                    ? <img src={item.image} alt={item.name} />
                    : <span>📦</span>
                  }
                </div>
                <div className="cart-item__info">
                  <p className="cart-item__name">
                    {item.name}
                    {item.isRequest && <span className="solicitud-badge">SOLICITUD</span>}
                  </p>
                  <p className="cart-item__sku">{item.sku}</p>
                  <div className="cart-item__controls">
                    <button className="qty-btn" onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}>−</button>
                    <span className="qty-display">{item.quantity}</span>
                    <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Eliminar">🗑</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cartItems.length > 0 && (
          <div className="cart-footer">
            <button className="cta-cotizar cart-submit" onClick={handleSolicitar}>
              Solicitar Cotización
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
