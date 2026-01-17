import { useState, useEffect } from 'react'
import './App.css'
import { api } from './api'
import type { Product } from './types/products'

interface ProductFormData {
  title: string
  description: string
  price: number
  category: string
  stock: number
}

function App() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [showModal, setShowModal] = useState<boolean>(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
  })

  // Mahsulotlarni yuklash
  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.getProducts(10)
      setProducts(data.docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi')
      console.error('Ma\'lumot yuklashda xatolik:', err)
    } finally {
      setLoading(false)
    }
  }

  // Qidiruv
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      fetchProducts()
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await api.searchProducts(searchQuery)
      setProducts(data.docs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Qidirishda xatolik')
    } finally {
      setLoading(false)
    }
  }

  // Modal ochish (yangi mahsulot)
  const openCreateModal = () => {
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
    })
    setShowModal(true)
  }

  // Modal ochish (tahrirlash)
  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      title: product.title,
      description: product.description || '',
      price: product.price,
      category: product.category || '',
      stock: product.stock || 0,
    })
    setShowModal(true)
  }

  // Modal yopish
  const closeModal = () => {
    setShowModal(false)
    setEditingProduct(null)
    setFormData({
      title: '',
      description: '',
      price: 0,
      category: '',
      stock: 0,
    })
  }

  // Form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingProduct) {
        // Update
        await api.updateProduct(editingProduct.id, formData)
        alert('✅ Mahsulot yangilandi!')
      } else {
        // Create
        await api.createProduct(formData)
        alert('✅ Mahsulot qo\'shildi!')
      }
      
      closeModal()
      fetchProducts()
    } catch (err) {
      alert('❌ Xatolik: ' + (err instanceof Error ? err.message : 'Noma\'lum xatolik'))
    }
  }

  // Delete
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`"${title}" mahsulotini o'chirmoqchimisiz?`)) {
      return
    }

    try {
      await api.deleteProduct(id)
      alert('✅ Mahsulot o\'chirildi!')
      fetchProducts()
    } catch (err) {
      alert('❌ O\'chirishda xatolik: ' + (err instanceof Error ? err.message : 'Noma\'lum xatolik'))
    }
  }

  // Narx formatlash
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('uz-UZ', {
      minimumFractionDigits: 0,
    }).format(price) + ' so\'m'
  }

  // Loading holati
  if (loading && products.length === 0) {
    return (
      <div className="app">
        <div className="loading-container">
          <div className="loader">⏳</div>
          <h2>Mahsulotlar yuklanmoqda...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <h1>🛍️ Mahsulotlar boshqaruvi</h1>
          <p className="subtitle">Jami {products.length} ta mahsulot</p>
        </div>

        <div className="header-actions">
          {/* Qidiruv */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Mahsulot nomi bo'yicha qidiring..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button type="submit" className="search-btn">
                🔍
              </button>
            </div>
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  fetchProducts()
                }}
                className="clear-btn"
              >
                ✕ Tozalash
              </button>
            )}
          </form>

          {/* Yangi mahsulot qo'shish */}
          <button onClick={openCreateModal} className="add-btn">
            ➕ Yangi mahsulot
          </button>
        </div>
      </header>

      {/* Error */}
      {error && (
        <div className="error-container">
          <p>❌ {error}</p>
          <button onClick={fetchProducts} className="retry-btn">
            🔄 Qayta urinish
          </button>
        </div>
      )}

      {/* Mahsulotlar */}
      <div className="products-grid">
        {products.length === 0 ? (
          <div className="no-products">
            <div className="empty-icon">📦</div>
            <h3>Hech qanday mahsulot topilmadi</h3>
            {searchQuery ? (
              <button onClick={fetchProducts} className="retry-btn">
                Barcha mahsulotlarni ko'rsatish
              </button>
            ) : (
              <button onClick={openCreateModal} className="retry-btn">
                Birinchi mahsulotni qo'shing
              </button>
            )}
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id} className="product-card">
              {/* Rasm */}
              <div className="product-image">
                {product.image?.url ? (
                  <img
                    src={`https://payload-api-2.onrender.com${product.image.url}`}
                    alt={product.image.alt || product.title}
                    loading="lazy"
                  />
                ) : (
                  <div className="no-image">
                    <span>🖼️</span>
                    <p>Rasm yo'q</p>
                  </div>
                )}
              </div>

              {/* Ma'lumotlar */}
              <div className="product-info">
                <h2 className="product-title">{product.title}</h2>

                {product.description && (
                  <p className="product-description">
                    {product.description.length > 80
                      ? `${product.description.substring(0, 80)}...`
                      : product.description}
                  </p>
                )}

                <div className="product-details">
                  {product.category && (
                    <span className="category-badge">
                      {product.category}
                    </span>
                  )}

                  <div className="product-price">
                    {formatPrice(product.price)}
                  </div>

                  {product.stock !== undefined && (
                    <div className="stock-info">
                      {product.stock > 0 ? (
                        <span className="in-stock">
                          ✅ {product.stock} ta
                        </span>
                      ) : (
                        <span className="out-of-stock">❌ Tugagan</span>
                      )}
                    </div>
                  )}
                </div>

                {/* CRUD tugmalari */}
                <div className="card-actions">
                  <button 
                    onClick={() => openEditModal(product)}
                    className="edit-btn"
                    title="Tahrirlash"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleDelete(product.id, product.title)}
                    className="delete-btn"
                    title="O'chirish"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {editingProduct ? '✏️ Mahsulotni tahrirlash' : '➕ Yangi mahsulot'}
              </h2>
              <button onClick={closeModal} className="modal-close-btn">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="title">Mahsulot nomi *</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="Masalan: Olma"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Tavsif</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Mahsulot haqida qisqacha ma'lumot"
                  rows={4}
                  className="form-textarea"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Narxi (so'm) *</label>
                  <input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    required
                    min="0"
                    placeholder="0"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="stock">Omborda (dona)</label>
                  <input
                    id="stock"
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    min="0"
                    placeholder="0"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="category">Kategoriya</label>
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Masalan: meva, sabzavot"
                  className="form-input"
                />
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="cancel-btn">
                  Bekor qilish
                </button>
                <button type="submit" className="submit-btn">
                  {editingProduct ? '💾 Saqlash' : '➕ Qo\'shish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App