import React, { useState, useMemo } from 'react';
import { 
  Home, ChevronRight, SlidersHorizontal, Grid, List, Search, 
  ShieldCheck, FileText, ArrowRight, Sparkles, Filter 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { ProductCard } from './ProductCard';
import { HardwareSVG } from '../utils/HardwareCanvas';
import { SelectDropdown } from './SelectDropdown';

const MATERIAL_OPTIONS = [
  { value: 'all', label: 'All Materials' },
  { value: 'brass', label: 'Solid Brass' },
  { value: 'stainless', label: 'Stainless Steel 304' },
  { value: 'zinc', label: 'Zinc Alloy' },
  { value: 'glass', label: 'Glass & Alloy' }
];

const SORT_OPTIONS = [
  { value: 'featured', label: 'Sort by: Featured' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'discount', label: 'Biggest Discount' }
];

export function CategoryCatalog() {
  const { products, categories, activeCategory, setActiveCategory, setIsQuoteModalOpen } = useShop();
  
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [materialFilter, setMaterialFilter] = useState('all');
  const [localSearch, setLocalSearch] = useState('');

  // Find active category details
  const currentCategory = categories.find(c => c.id === activeCategory) || {
    id: 'all',
    name: 'All Architectural Catalogs',
    description: 'Explore our complete catalog of door hardware, biometric locks, soft close hinges and cabinet accessories.',
    tagline: 'Precision engineered architectural hardware designed for modern homes and commercial spaces.'
  };

  // Filter products by category, material, local search
  const filteredProducts = useMemo(() => {
    let list = products;

    if (activeCategory !== 'all') {
      list = list.filter(p => p.categoryId === activeCategory);
    }

    if (materialFilter !== 'all') {
      list = list.filter(p => p.material.toLowerCase().includes(materialFilter.toLowerCase()));
    }

    if (localSearch.trim() !== '') {
      const q = localSearch.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.subtitle.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q)
      );
    }

    // Sort products
    return [...list].sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return b.discountPercentage - a.discountPercentage;
      return 0; // featured default
    });
  }, [products, activeCategory, materialFilter, localSearch, sortBy]);

  return (
    <div className="catalog-page-container">
      
      {/* Breadcrumb Navigation Bar */}
      <div className="catalog-breadcrumb-bar">
        <div className="container breadcrumb-container">
          <button className="breadcrumb-link" onClick={() => setActiveCategory('all')}>
            <Home size={14} /> Home
          </button>
          <ChevronRight size={14} className="breadcrumb-separator" />
          <span className="breadcrumb-link" onClick={() => setActiveCategory('all')}>Catalogs</span>
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
            <h1 className="catalog-title">{currentCategory.name} Catalog</h1>
            <p className="catalog-tagline">{currentCategory.tagline}</p>
            <p className="catalog-description">{currentCategory.description}</p>
            
            {/* Category Switcher Tabs */}
            <div className="category-tabs-scroll">
              <button 
                className={`category-tab-btn ${activeCategory === 'all' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('all')}
              >
                All Products
              </button>
              {categories.map(c => (
                <button 
                  key={c.id}
                  className={`category-tab-btn ${activeCategory === c.id ? 'is-active' : ''}`}
                  onClick={() => setActiveCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          <div className="catalog-hero-preview-visual">
            <div className="catalog-visual-card">
              <HardwareSVG type={currentCategory.type || 'smart_lock'} width={220} height={220} />
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar & Filter Bar */}
      <section className="section catalog-body-section">
        <div className="container">
          
          <div className="catalog-toolbar">
            <div className="toolbar-left">
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
            </div>

            <div className="toolbar-right">
              {/* In-Catalog Search */}
              <div className="catalog-search-input-wrapper">
                <Search size={14} />
                <input 
                  type="text" 
                  className="catalog-search-input" 
                  placeholder="Filter catalog..." 
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
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

          {/* Catalog Grid View */}
          {filteredProducts.length === 0 ? (
            <div className="catalog-empty-state">
              <div className="empty-state-icon"><Filter size={32} /></div>
              <h3>No matching hardware found</h3>
              <p>Try adjusting your search query or material filter.</p>
              <button className="btn-secondary" onClick={() => { setMaterialFilter('all'); setLocalSearch(''); }}>
                Reset Filters
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
