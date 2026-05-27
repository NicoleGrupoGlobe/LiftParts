import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Header from './components/Header'
import QuickFilters from './components/QuickFilters'
import ProductCard from './components/ProductCard'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import useCart from './hooks/useCart'
import productsData from '../products.json'

export default function App() {
  const [activeCategoryGroup, setActiveCategoryGroup] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBrands, setSelectedBrands] = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const cart = useCart()

  function handleBrandToggle(brand) {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    )
  }

  const filtered = productsData.filter(p => {
    const matchGroup = !activeCategoryGroup || p.categoryGroup === activeCategoryGroup
    const matchCategory = activeCategory === 'all' || p.category === activeCategory
    const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(p.brand)
    const q = searchQuery.toLowerCase().trim()
    if (!q) return matchGroup && matchCategory && matchBrand
    const haystack = [p.name, p.sku, p.description, ...(p.tags || [])].join(' ').toLowerCase()
    return matchGroup && matchCategory && matchBrand && haystack.includes(q)
  })

  return (
    <>
      <Navbar
        activeCategoryGroup={activeCategoryGroup}
        setActiveCategoryGroup={setActiveCategoryGroup}
        cartCount={cart.cartCount}
        onCartClick={() => setCartOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <Header
        activeCategoryGroup={activeCategoryGroup}
        products={productsData}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      <main className="catalog-section" id="catalogo" aria-live="polite">
        <QuickFilters
          products={productsData}
          selectedBrands={selectedBrands}
          onBrandToggle={handleBrandToggle}
        />
        <p className="result-count">
          Mostrando <strong>{filtered.length}</strong> {filtered.length === 1 ? 'producto' : 'productos'}
        </p>
        <div className="product-grid" role="list">
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <p className="empty-state__title">Sin resultados</p>
              <p className="empty-state__msg">No se encontraron productos que coincidan con tu búsqueda.</p>
            </div>
          ) : (
            filtered.map(p => (
              <ProductCard
                key={p.id}
                product={p}
                onCardClick={() => setSelectedProduct(p)}
                onAddToCart={() => {
                  cart.addToCart(p, 1)
                  setCartOpen(true)
                }}
              />
            ))
          )}
        </div>
      </main>
      <Footer />
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(product, qty) => {
            cart.addToCart(product, qty)
            setSelectedProduct(null)
            setCartOpen(true)
          }}
        />
      )}
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cart.cartItems}
        updateQuantity={cart.updateQuantity}
        removeItem={cart.removeItem}
      />
    </>
  )
}
