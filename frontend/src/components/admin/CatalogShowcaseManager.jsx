import React, { useState, useEffect } from 'react';
import { 
  Layers, Star, Sparkles, Plus, Edit2, Trash2, Search, Filter, 
  Check, AlertCircle, RefreshCw, X, Shield, ArrowUpDown, Tag
} from 'lucide-react';
import { businessApi } from '../../api/businessApi';
import { formatINR } from '../../utils/currency';

export function CatalogShowcaseManager({ token, onCatalogUpdated }) {
  const [subView, setSubView] = useState('products'); // 'products' | 'categories'
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [statusMsg, setStatusMsg] = useState(null);

  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    category: 'Door Hardware',
    sku: '',
    selling_price: '',
    original_price: '',
    discount_percentage: 0,
    stock_quantity: 20,
    tax_rate: 18,
    brand: 'Architectural Grade',
    subtitle: '',
    material: '',
    finish: '',
    warranty: '',
    description: '',
    badge: '',
    badge_type: 'bestseller',
    is_bestseller: false,
    is_recommended: false,
    display_order: 0
  });

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    icon: 'door-closed',
    tagline: '',
    description: '',
    product_count_label: '100+ Products',
    display_order: 0,
    is_active: true,
    is_featured_landing: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodsRes, catsRes] = await Promise.allSettled([
        businessApi.products(token, { include_inactive: true }),
        businessApi.categories({ include_inactive: true })
      ]);

      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setProducts(prodsRes.value);
      }
      if (catsRes.status === 'fulfilled' && Array.isArray(catsRes.value)) {
        setCategories(catsRes.value);
      }
    } catch (err) {
      console.warn('Failed to load catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showFeedback = (type, text) => {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  };

  // 1-Click Toggle Bestseller
  const handleToggleBestseller = async (product) => {
    const nextVal = !product.is_bestseller;
    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_bestseller: nextVal } : p));
    try {
      await businessApi.patchProductCuration(token, product.id, { is_bestseller: nextVal });
      showFeedback('success', `Updated "${product.name}" bestseller status!`);
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update bestseller flag');
      loadData();
    }
  };

  // 1-Click Toggle Recommended
  const handleToggleRecommended = async (product) => {
    const nextVal = !product.is_recommended;
    // Optimistic UI update
    setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_recommended: nextVal } : p));
    try {
      await businessApi.patchProductCuration(token, product.id, { is_recommended: nextVal });
      showFeedback('success', `Updated "${product.name}" recommended status!`);
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to update recommended flag');
      loadData();
    }
  };

  // Product modal open
  const openNewProductModal = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      category: categories[0]?.name || 'Door Hardware',
      sku: `SMH-${Math.floor(1000 + Math.random() * 9000)}`,
      selling_price: '',
      original_price: '',
      discount_percentage: 0,
      stock_quantity: 20,
      tax_rate: 18,
      brand: 'Architectural Grade',
      subtitle: '',
      material: '',
      finish: '',
      warranty: '10 Years Mechanical Warranty',
      description: '',
      badge: '',
      badge_type: 'bestseller',
      is_bestseller: false,
      is_recommended: false,
      display_order: products.length + 1
    });
    setIsProductModalOpen(true);
  };

  const openEditProductModal = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name || '',
      category: prod.category || 'Door Hardware',
      sku: prod.sku || '',
      selling_price: prod.selling_price || '',
      original_price: prod.original_price || '',
      discount_percentage: prod.discount_percentage || 0,
      stock_quantity: prod.stock_quantity ?? 20,
      tax_rate: prod.tax_rate ?? 18,
      brand: prod.brand || 'Architectural Grade',
      subtitle: prod.subtitle || '',
      material: prod.material || '',
      finish: prod.finish || '',
      warranty: prod.warranty || '',
      description: prod.description || '',
      badge: prod.badge || '',
      badge_type: prod.badge_type || 'bestseller',
      is_bestseller: Boolean(prod.is_bestseller),
      is_recommended: Boolean(prod.is_recommended),
      display_order: prod.display_order ?? 0
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        selling_price: parseFloat(productForm.selling_price) || 0,
        original_price: productForm.original_price ? parseFloat(productForm.original_price) : null,
        stock_quantity: parseInt(productForm.stock_quantity, 10) || 0,
        tax_rate: parseFloat(productForm.tax_rate) || 18,
        display_order: parseInt(productForm.display_order, 10) || 0,
        discount_percentage: parseInt(productForm.discount_percentage, 10) || 0
      };

      if (editingProduct) {
        await businessApi.updateProduct(token, editingProduct.id, payload);
        showFeedback('success', `Product "${payload.name}" updated successfully!`);
      } else {
        await businessApi.createProduct(token, payload);
        showFeedback('success', `Product "${payload.name}" created successfully!`);
      }
      setIsProductModalOpen(false);
      loadData();
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save product.');
    }
  };

  const handleDeleteProduct = async (prod) => {
    if (!window.confirm(`Are you sure you want to delete "${prod.name}" (SKU: ${prod.sku})?`)) return;
    try {
      await businessApi.deleteProduct(token, prod.id);
      showFeedback('success', `Product "${prod.name}" deleted.`);
      loadData();
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to delete product.');
    }
  };

  // Category modal handlers
  const openNewCategoryModal = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      slug: '',
      icon: 'door-closed',
      tagline: '',
      description: '',
      product_count_label: '100+ Products',
      display_order: categories.length + 1,
      is_active: true,
      is_featured_landing: true
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name || '',
      slug: cat.slug || '',
      icon: cat.icon || 'door-closed',
      tagline: cat.tagline || '',
      description: cat.description || '',
      product_count_label: cat.product_count_label || '100+ Products',
      display_order: cat.display_order ?? 0,
      is_active: cat.is_active ?? true,
      is_featured_landing: cat.is_featured_landing ?? true
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...categoryForm,
        slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        display_order: parseInt(categoryForm.display_order, 10) || 0
      };

      if (editingCategory) {
        await businessApi.updateCategory(token, editingCategory.id, payload);
        showFeedback('success', `Category "${payload.name}" updated!`);
      } else {
        await businessApi.createCategory(token, payload);
        showFeedback('success', `Category "${payload.name}" created!`);
      }
      setIsCategoryModalOpen(false);
      loadData();
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to save category.');
    }
  };

  const handleDeleteCategory = async (cat) => {
    if (!window.confirm(`Are you sure you want to delete category "${cat.name}"?`)) return;
    try {
      await businessApi.deleteCategory(token, cat.id);
      showFeedback('success', `Category "${cat.name}" removed.`);
      loadData();
      if (onCatalogUpdated) onCatalogUpdated();
    } catch (err) {
      showFeedback('error', err.message || 'Failed to delete category.');
    }
  };

  // Filtered products
  const filteredProducts = products.filter(p => {
    const matchesSearch = !searchQuery || 
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = selectedCategory === 'ALL' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const bestsellersCount = products.filter(p => p.is_bestseller).length;
  const recommendedCount = products.filter(p => p.is_recommended).length;

  return (
    <div className="admin-catalog-curator" style={{ padding: '0.5rem 0' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: '#18181b',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid #27272a'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Layers size={22} color="#f59e0b" />
            Storefront Catalog & Showcase Curator
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.88rem' }}>
            Control which products appear in the "Most Loved" Bestsellers carousel and "Recommended" rotation disk, manage prices, discounts, stock, and categories.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadData}
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          {subView === 'products' ? (
            <button
              type="button"
              className="btn-primary"
              onClick={openNewProductModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#d97706', borderColor: '#b45309' }}
            >
              <Plus size={16} />
              Add Product
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary"
              onClick={openNewCategoryModal}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#d97706', borderColor: '#b45309' }}
            >
              <Plus size={16} />
              Add Category
            </button>
          )}
        </div>
      </div>

      {statusMsg && (
        <div style={{
          padding: '0.9rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: statusMsg.type === 'success' ? '#064e3b' : '#7f1d1d',
          color: statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca',
          border: `1px solid ${statusMsg.type === 'success' ? '#059669' : '#dc2626'}`
        }}>
          {statusMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 500 }}>{statusMsg.text}</span>
        </div>
      )}

      {/* Primary Tab Switcher */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => setSubView('products')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            border: subView === 'products' ? '1px solid #f59e0b' : '1px solid #27272a',
            background: subView === 'products' ? '#27272a' : '#18181b',
            color: subView === 'products' ? '#f59e0b' : '#a1a1aa',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          📦 Showcase Products ({products.length})
        </button>

        <button
          type="button"
          onClick={() => setSubView('categories')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '8px',
            border: subView === 'categories' ? '1px solid #f59e0b' : '1px solid #27272a',
            background: subView === 'categories' ? '#27272a' : '#18181b',
            color: subView === 'categories' ? '#f59e0b' : '#a1a1aa',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          🗂️ Category Hierarchy ({categories.length})
        </button>
      </div>

      {/* SUBVIEW 1: PRODUCTS SHOWCASE */}
      {subView === 'products' && (
        <div>
          {/* Quick Metrics Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#a1a1aa', textTransform: 'uppercase' }}>Total Catalog Products</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f4f4f5' }}>{products.length}</div>
            </div>
            <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#f59e0b', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={14} /> Active Bestsellers
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f59e0b' }}>{bestsellersCount} items</div>
            </div>
            <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1rem', borderRadius: '10px' }}>
              <div style={{ fontSize: '0.8rem', color: '#38bdf8', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={14} /> Active Recommended
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#38bdf8' }}>{recommendedCount} items</div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '1rem',
            alignItems: 'center',
            marginBottom: '1.25rem',
            background: '#18181b',
            padding: '1rem',
            borderRadius: '10px',
            border: '1px solid #27272a'
          }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#71717a' }} />
              <input
                type="text"
                className="form-input"
                placeholder="Search by product name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <div style={{ flex: '0 0 200px' }}>
              <select
                className="form-select"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="ALL">All Categories ({products.length})</option>
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div style={{ background: '#18181b', borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ background: '#27272a', color: '#a1a1aa', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.85rem 1rem' }}>Order</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Product & Details</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Category</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Selling Price</th>
                    <th style={{ padding: '0.85rem 1rem' }}>Stock</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Bestseller</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>Recommended</th>
                    <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#71717a' }}>
                        No products match your current filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p, idx) => (
                      <tr key={p.id || idx} style={{ borderBottom: '1px solid #27272a', transition: 'background 0.15s ease' }}>
                        <td style={{ padding: '0.85rem 1rem', color: '#71717a', fontSize: '0.85rem' }}>
                          #{p.display_order ?? idx + 1}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#f4f4f5', fontSize: '0.92rem' }}>{p.name}</div>
                          <div style={{ fontSize: '0.78rem', color: '#a1a1aa', display: 'flex', gap: '0.6rem', marginTop: '0.2rem' }}>
                            <span>SKU: {p.sku}</span>
                            {p.badge && (
                              <span style={{
                                padding: '0.1rem 0.4rem',
                                borderRadius: '4px',
                                background: '#3b82f620',
                                color: '#60a5fa',
                                fontWeight: 600,
                                fontSize: '0.72rem'
                              }}>
                                {p.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: '#d4d4d8', fontSize: '0.85rem' }}>
                          {p.category}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <div style={{ fontWeight: 600, color: '#10b981' }}>{formatINR(p.selling_price)}</div>
                          {p.original_price && (
                            <div style={{ fontSize: '0.75rem', color: '#71717a', textDecoration: 'line-through' }}>
                              {formatINR(p.original_price)}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: (p.stock_quantity ?? 0) < 5 ? '#ef444420' : '#10b98120',
                            color: (p.stock_quantity ?? 0) < 5 ? '#f87171' : '#34d399',
                            fontWeight: 600,
                            fontSize: '0.78rem'
                          }}>
                            {p.stock_quantity ?? 0} in stock
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleBestseller(p)}
                            title={p.is_bestseller ? "Click to remove from Bestsellers" : "Click to feature in Bestsellers"}
                            style={{
                              background: p.is_bestseller ? '#f59e0b20' : 'transparent',
                              border: p.is_bestseller ? '1px solid #f59e0b' : '1px solid #3f3f46',
                              color: p.is_bestseller ? '#f59e0b' : '#71717a',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            <Star size={13} fill={p.is_bestseller ? '#f59e0b' : 'none'} />
                            {p.is_bestseller ? 'Featured' : 'Add'}
                          </button>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => handleToggleRecommended(p)}
                            title={p.is_recommended ? "Click to remove from Recommended" : "Click to feature in Recommended"}
                            style={{
                              background: p.is_recommended ? '#38bdf820' : 'transparent',
                              border: p.is_recommended ? '1px solid #38bdf8' : '1px solid #3f3f46',
                              color: p.is_recommended ? '#38bdf8' : '#71717a',
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontSize: '0.78rem',
                              fontWeight: 600
                            }}
                          >
                            <Sparkles size={13} />
                            {p.is_recommended ? 'Active' : 'Add'}
                          </button>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '0.4rem' }}>
                            <button
                              type="button"
                              onClick={() => openEditProductModal(p)}
                              title="Edit product details"
                              style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#e4e4e7', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteProduct(p)}
                              title="Delete product"
                              style={{ background: '#7f1d1d20', border: '1px solid #991b1b', color: '#f87171', padding: '0.4rem', borderRadius: '6px', cursor: 'pointer' }}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBVIEW 2: CATEGORY HIERARCHY */}
      {subView === 'categories' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
            {categories.map((cat, idx) => (
              <div
                key={cat.id || idx}
                style={{
                  background: '#18181b',
                  border: '1px solid #27272a',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f4f4f5' }}>{cat.name}</h4>
                      <div style={{ fontSize: '0.8rem', color: '#f59e0b', marginTop: '0.2rem' }}>slug: #{cat.slug}</div>
                    </div>
                    <span style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: cat.is_active !== false ? '#10b98120' : '#ef444420',
                      color: cat.is_active !== false ? '#34d399' : '#f87171',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {cat.is_active !== false ? 'Active' : 'Hidden'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: '#a1a1aa', margin: '0.5rem 0' }}>
                    {cat.tagline || cat.description || 'No description provided.'}
                  </p>

                  <div style={{ fontSize: '0.8rem', color: '#71717a', marginTop: '0.5rem' }}>
                    Product Count Label: <strong style={{ color: '#d4d4d8' }}>{cat.product_count_label || 'Products'}</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', borderTop: '1px solid #27272a', paddingTop: '0.75rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#71717a' }}>Order: #{cat.display_order ?? idx + 1}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      onClick={() => openEditCategoryModal(cat)}
                      style={{ background: '#27272a', border: '1px solid #3f3f46', color: '#e4e4e7', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat)}
                      style={{ background: '#7f1d1d20', border: '1px solid #991b1b', color: '#f87171', padding: '0.4rem 0.75rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '680px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#f4f4f5' }}>
                {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Hardware Product'}
              </h3>
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Product Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Category *</label>
                  <select
                    className="form-select"
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>SKU Code *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={productForm.sku}
                    onChange={(e) => setProductForm({ ...productForm, sku: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Selling Price (₹) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    value={productForm.selling_price}
                    onChange={(e) => setProductForm({ ...productForm, selling_price: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Original MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-input"
                    value={productForm.original_price}
                    onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Stock Quantity</label>
                  <input
                    type="number"
                    className="form-input"
                    value={productForm.stock_quantity}
                    onChange={(e) => setProductForm({ ...productForm, stock_quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Badge Label (e.g. BESTSELLER, SALE)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.badge}
                    onChange={(e) => setProductForm({ ...productForm, badge: e.target.value })}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Material Specification</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.material}
                    onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                    placeholder="Solid Forged Brass"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Finish Type</label>
                  <input
                    type="text"
                    className="form-input"
                    value={productForm.finish}
                    onChange={(e) => setProductForm({ ...productForm, finish: e.target.value })}
                    placeholder="Satin Brass PVD"
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Description</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    value={productForm.description}
                    onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '1.5rem', gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f4f4f5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={productForm.is_bestseller}
                      onChange={(e) => setProductForm({ ...productForm, is_bestseller: e.target.checked })}
                    />
                    Feature in "Customer Favorites" Bestsellers
                  </label>

                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f4f4f5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={productForm.is_recommended}
                      onChange={(e) => setProductForm({ ...productForm, is_recommended: e.target.checked })}
                    />
                    Feature in "Recommended Hardware" Carousel
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsProductModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#d97706', borderColor: '#b45309' }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {isCategoryModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.75)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            background: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600, color: '#f4f4f5' }}>
                {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Add New Category'}
              </h3>
              <button
                type="button"
                onClick={() => setIsCategoryModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCategory}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Category Name *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                    placeholder="Door Hardware"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Slug (#anchor)</label>
                  <input
                    type="text"
                    className="form-input"
                    value={categoryForm.slug}
                    onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                    placeholder="door-hardware"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Product Count Label</label>
                  <input
                    type="text"
                    className="form-input"
                    value={categoryForm.product_count_label}
                    onChange={(e) => setCategoryForm({ ...categoryForm, product_count_label: e.target.value })}
                    placeholder="120+ Products"
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Display Order</label>
                  <input
                    type="number"
                    className="form-input"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({ ...categoryForm, display_order: e.target.value })}
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Tagline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={categoryForm.tagline}
                    onChange={(e) => setCategoryForm({ ...categoryForm, tagline: e.target.value })}
                    placeholder="Precision engineered architectural hardware..."
                  />
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f4f4f5', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={categoryForm.is_active}
                      onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                    />
                    Category Active (Visible on Storefront 360° carousel)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem', borderTop: '1px solid #27272a', paddingTop: '1rem' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCategoryModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#d97706', borderColor: '#b45309' }}
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

