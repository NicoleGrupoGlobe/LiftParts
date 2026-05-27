import { useState, useEffect } from 'react'

export default function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/products.json')
      .then(r => r.json())
      .then(data => {
        const normalized = data.map(p => ({
          ...p,
          categoryGroups: p.categoryGroups ?? [p.categoryGroup].filter(Boolean),
        }))
        setProducts(normalized)
        setLoading(false)
      })
  }, [])

  return { products, loading }
}
