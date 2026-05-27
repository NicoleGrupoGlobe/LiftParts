import { useState } from 'react'

export default function useCart() {
  const [cartItems, setCartItems] = useState([])

  function addToCart(product, qty) {
    const isRequest = product.stock === 0
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id)
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i)
      }
      return [...prev, { ...product, quantity: qty, isRequest }]
    })
  }

  function updateQuantity(id, qty) {
    if (qty < 1) return
    setCartItems(prev => prev.map(i => i.id === id ? { ...i, quantity: qty } : i))
  }

  function removeItem(id) {
    setCartItems(prev => prev.filter(i => i.id !== id))
  }

  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0)

  return { cartItems, addToCart, updateQuantity, removeItem, cartCount }
}
