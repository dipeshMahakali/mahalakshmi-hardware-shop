import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Home, ChevronRight, SlidersHorizontal, Grid, List, Search, 
  ShieldCheck, FileText, ArrowRight, Sparkles, Filter, X, Check
} from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';
import { ProductCard } from './ProductCard.jsx';
import { HardwareSVG } from './graphics/HardwareIllustrations.jsx';
import { SelectDropdown } from './SelectDropdown.jsx';
import { useDebounce } from '../hooks/useDebounce.js';

function normalizeSlug(str) {
  return (str || '')
    .toLowerCase()
    .trim()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const MATERIAL_OPTIONS = [
  { value: 'all', label: 'All Materials' },
  { value: 'brass', label: 'Solid Brass' },
  { value: 'stainless', label: 'Stainless Steel 304' },
  { value: 'zinc', label: 'Zinc Alloy' },
  { value: 'plywood', label: 'Plywood & Boards' },
  { value: 'glass', label: 'Glass & Alloy' }
];

const PRICE_OPTIONS = [
  { value: 'all', label: 'All Price Ranges' },
  { value: 'under-500', label: 'Under ₹500' },
  { value: '500-1500', label: '₹500 - ₹1,500' },
  { value: '1500-3000', label: '₹1,500 - ₹3,000' },
  { value: 'above-3000', label: 'Above ₹3,000' }
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Sort by: Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'discount', label: 'Biggest Discount' }
];

export function CategoryCatalog() {
  const { products, categories, activeCategory, setActiveCategory, navigateToHome, setIsQuoteModalOpen } = useShop();
  
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [materialFilter, setMaterialFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [localSearch, setLocalSearch] = useState('');
  
  const debouncedSearch = useDebounce(localSearch, 250);
  const activeTabRef = useRef(null);

  // Auto-scroll active category pill into view
  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
  }, [activeCategory]);

  // Find active category details
  const currentCategory = useMemo(() => {
    if (!activeCategory || activeCategory === 'all' || activeCategory === 'catalog') {
      return {
        id: 'all',
        name: 'All Architectural Catalogs',
        description: 'Explore our complete catalog of door hardware, biometric locks, soft close hinges, plywood, and cabinet accessories.',
        tagline: 'Precision engineered architectural hardware designed for modern homes and commercial spaces.',
        type: 'door_hardware'
      };
    }
    const normTarget = normalizeSlug(activeCategory);
    return (categories || []).find(c => {
      const cSlug = normalizeSlug(c.slug || c.id);
      const cName = normalizeSlug(c.name);
      return c.id === activeCategory || cSlug === normTarget || cName === normTarget;
    }) || {
      id: activeCategory,
      name: activeCategory.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      description: 'Explore our premium selection crafted for strength, security, and architectural beauty.',
      tagline: 'Precision engineered architectural hardware designed for modern spaces.',
      type: 'door_hardware'
    };
  }, [categories, activeCategory]);

  // Multi-facet filtering logic
  const filteredProducts = useMemo(() => {
    let list = products || [];

    // Category filter with resilient multi-attribute normalization
    if (activeCategory && activeCategory !== 'all' && activeCategory !== 'catalog') {
      const targetSlug = normalizeSlug(activeCategory);
      list = list.filter(p => {
        const pCatId = normalizeSlug(p.categoryId);
        const pCatDbId = normalizeSlug(p.category_id);
        const pCatName = normalizeSlug(p.category);
        const pRawCat = (p.category || '').toLowerCase().trim();
        const rawTarget = activeCategory.toLowerCase().trim();

        return (
          pCatId === targetSlug ||
          pCatDbId === targetSlug ||
          pCatName === targetSlug ||
          pRawCat === rawTarget ||
          p.category_id === activeCategory ||
          p.categoryId === activeCategory
        );
      });
    }

    // Material filter
    if (materialFilter !== 'all') {
      list = list.filter(p => (p.material || '').toLowerCase().includes(materialFilter.toLowerCase()));
    }

    // Price range filter
    if (priceFilter !== 'all') {
      list = list.filter(p => {
        const price = Number(p.price || p.selling_price) || 0;
        if (priceFilter === 'under-500') return price < 500;
        if (priceFilter === '500-1500') return price >= 500 && price <= 1500;
        if (priceFilter === '1500-3000') return price > 1500 && price <= 3000;
        if (priceFilter === 'above-3000') return price > 3000;
        return true;
      });
    }

    // In-Stock filter
    if (inStockOnly) {
      list = list.filter(p => p.inStock !== false);
    }

    // Debounced text search
    if (debouncedSearch.trim() !== '') {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(q) || 
        (p.subtitle || '').toLowerCase().includes(q) ||
        (p.material || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q)
      );
    }

    // Sort products
    return [...list].sort((a, b) => {
      const priceA = Number(a.price || a.selling_price) || 0;
      const priceB = Number(b.price || b.selling_price) || 0;
      if (sortBy === 'price-low') return priceA - priceB;
      if (sortBy === 'price-high') return priceB - priceA;
      if (sortBy === 'rating') return (b.rating || 5) - (a.rating || 5);
      if (sortBy === 'discount') return (b.discountPercentage || 0) - (a.discountPercentage || 0);
      return 0; // featured default
    });
  }, [products, activeCategory, materialFilter, priceFilter, inStockOnly, debouncedSearch, sortBy]);

  const hasActiveFilters = materialFilter !== 'all' || priceFilter !== 'all' || inStockOnly || localSearch !== '';

  const resetAllFilters = () => {
    setMaterialFilter('all');
    setPriceFilter('all');
    setInStockOnly(false);
    setLocalSearch('');
    setSortBy('featured');
  };

  return (
    <div className="catalog-page-container">
      
      {/* Breadcrumb Navigation Bar */}
      <div className="catalog-breadcrumb-bar">
        <div className="container breadcrumb-container">
          <button className="breadcrumb-link" onClick={() => navigateToHome ? navigateToHome() : setActiveCategory('home')}>
            <Home size={14} /> Home
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <button className="breadcrumb-link" onClick={() => setActiveCategory('all')}>Catalogs</button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-current">{currentCategory.name}</span>
        </div>
      </div>

      {/* Hero Category Banner */}
      <section className="catalog-hero-banner">
        <div className="container catalog-hero-grid">
          <div className="catalog-hero-content">
            <span className="catalog-badge">
              <Sparkles size={14} /> ARCHITECTURAL SHOWROOM COLLECTION
            </span>
            <h1 className="catalog-title">{currentCategory.name}</h1>
            <p className="catalog-tagline">{currentCategory.tagline}</p>
            <p className="catalog-description">{currentCategory.description}</p>
            
            {/* Category Switcher Tabs */}
            <div className="category-tabs-scroll">
              <button 
                ref={(!activeCategory || activeCategory === 'all' || activeCategory === 'catalog') ? activeTabRef : null}
                className={`category-tab-btn ${(!activeCategory || activeCategory === 'all' || activeCategory === 'catalog') ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Products
              </button>
              {(categories || []).map(c => {
                const isActive = (
                  activeCategory === c.id ||
                  normalizeSlug(activeCategory) === normalizeSlug(c.slug || c.id) ||
                  normalizeSlug(activeCategory) === normalizeSlug(c.name)
                );
                return (
                  <button 
                    key={c.id}
                    ref={isActive ? activeTabRef : null}
                    className={`category-tab-btn ${isActive ? 'is-active' : ''}`}
                    onClick={() => setActiveCategory(c.id)}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="catalog-hero-preview-visual">
            <div className="catalog-visual-card">
              <HardwareSVG type={currentCategory.type || 'smart_lock'} width={220} height={220} />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar & Multi-Facet Filter Bar */}
      <section className="section catalog-body-section">
        <div className="container">
          
          <div className="catalog-toolbar" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div className="toolbar-left" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
              <span className="results-count-badge">
                Showing <strong>{filteredProducts.length}</strong> products
              </span>

              {/* Material Filter */}
              <div className="filter-dropdown-wrapper">
                <SlidersHorizontal size={14} />
                <SelectDropdown
                  value={materialFilter} 
                  options={MATERIAL_OPTIONS}
                  onChange={setMaterialFilter}
                  ariaLabel="Filter by material"
                />
              </div>

              {/* Price Filter */}
              <div className="filter-dropdown-wrapper">
                <SelectDropdown
                  value={priceFilter}
                  options={PRICE_OPTIONS}
                  onChange={setPriceFilter}
                  ariaLabel="Filter by price"
                />
              </div>

              {/* In Stock Only Toggle */}
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                style={{
                  background: inStockOnly ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                  color: inStockOnly ? '#fff' : 'var(--color-text-main)',
                  border: '1px solid var(--color-border)',
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--fs-xs)',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {inStockOnly && <Check size={12} color="var(--color-accent)" />}
                In-Stock Only
              </button>
            </div>

            <div className="toolbar-right">
              {/* In-Catalog Instant Search */}
              <div className="catalog-search-input-wrapper">
                <Search size={14} />
                <input 
                  type="text" 
                  className="catalog-search-input" 
                  placeholder="Search in catalog..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
                {localSearch && (
                  <button 
                    onClick={() => setLocalSearch('')}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px' }}
                    aria-label="Clear search"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Sort By */}
              <SelectDropdown
                className="sort-select"
                value={sortBy} 
                options={SORT_OPTIONS}
                onChange={setSortBy}
                ariaLabel="Sort products"
              />

              {/* View Mode Toggle */}
              <div className="view-mode-toggle">
                <button 
                  className={`view-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-label="Grid View"
                >
                  <Grid size={16} />
                </button>
                <button 
                  className={`view-btn ${viewMode === 'list' ? 'is-active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-label="List View"
                >
                  <List size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', margin: '0.75rem 0 1.5rem 0' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--color-text-muted)' }}>Active Filters:</span>
              {materialFilter !== 'all' && (
                <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Material: {MATERIAL_OPTIONS.find(m => m.value === materialFilter)?.label}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setMaterialFilter('all')} />
                </span>
              )}
              {priceFilter !== 'all' && (
                <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Price: {PRICE_OPTIONS.find(p => p.value === priceFilter)?.label}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setPriceFilter('all')} />
                </span>
              )}
              {inStockOnly && (
                <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  In-Stock Only
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setInStockOnly(false)} />
                </span>
              )}
              {localSearch && (
                <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', padding: '4px 10px', borderRadius: '16px', fontSize: '12px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  Query: "{localSearch}"
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => setLocalSearch('')} />
                </span>
              )}
              <button 
                onClick={resetAllFilters}
                style={{ background: 'none', border: 'none', color: 'var(--color-accent)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Clear all
              </button>
            </div>
          )}

          {/* Catalog Grid / List View */}
          {filteredProducts.length === 0 ? (
            <div className="catalog-empty-state">
              <div className="empty-state-icon"><Filter size={32} /></div>
              <h3>No matching hardware found</h3>
              <p>Try adjusting your search query, material filter, or price parameters.</p>
              <button className="btn-secondary" onClick={resetAllFilters}>
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={`catalog-products-container ${viewMode === 'list' ? 'is-list-view' : 'products-grid'}`}>
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          {/* Trade Bulk Quote Banner inside Catalog */}
          <div className="catalog-trade-banner">
            <div className="trade-banner-content">
              <div className="trade-badge"><ShieldCheck size={16} /> COMMERCIAL & TRADE PROJECT ENQUIRIES</div>
              <h3 className="trade-title">Need Bulk Quantities or Spec Sheets for Architectural Projects?</h3>
              <p className="trade-subtitle">Get custom wholesale quotes with factory lead times and specialized hardware finishes.</p>
            </div>
            <button className="btn-primary" onClick={() => setIsQuoteModalOpen(true)}>
              <FileText size={18} /> Request Trade Quote <ArrowRight size={16} />
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
