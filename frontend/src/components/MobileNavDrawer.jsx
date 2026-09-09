import React from 'react';
import { 
  X, ShieldCheck, DoorOpen, Grab, Lock, Sliders, Box, 
  Droplet, Wrench, Sparkles, Phone, FileText, ChevronRight, MapPin, Search 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function MobileNavDrawer() {
  const { 
    isMobileNavOpen, setIsMobileNavOpen, categories, activeCategory, 
    setActiveCategory, setIsQuoteModalOpen, setSearchQuery 
  } = useShop();

  if (!isMobileNavOpen) return null;

  const handleCategorySelect = (catId) => {
    setActiveCategory(catId);
    setIsMobileNavOpen(false);
  };

  const getCategoryIcon = (catId) => {
    switch(catId) {
      case 'door-hardware': return <DoorOpen size={18} />;
      case 'handles': return <Grab size={18} />;
      case 'locks-security': return <Lock size={18} />;
      case 'hinges': return <Sliders size={18} />;
      case 'cabinet-hardware': return <Box size={18} />;
      case 'bathroom-fittings': return <Droplet size={18} />;
      default: return <Wrench size={18} />;
    }
  };

  return (
    <>
      {/* Backdrop Overlay */}
      <div 
        className="mobile-nav-backdrop-overlay"
        onClick={() => setIsMobileNavOpen(false)}
      />

      {/* Drawer Panel */}
      <div className="mobile-nav-panel">
        
        {/* Drawer Header */}
        <div className="mobile-drawer-header">
          <div className="mobile-drawer-brand">
            <div className="mobile-drawer-emblem">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="mobile-drawer-title-main">SHREE MAHALAXMI</div>
              <div className="mobile-drawer-title-sub">HARDWARE</div>
            </div>
          </div>

          <button 
            onClick={() => setIsMobileNavOpen(false)}
            className="mobile-drawer-close-btn"
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quick Search inside Sidebar */}
        <div className="mobile-drawer-search-container">
          <div className="mobile-drawer-search-wrapper">
            <input 
              type="text" 
              placeholder="Quick search hardware..." 
              className="mobile-drawer-search-input"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search size={14} className="mobile-drawer-search-icon" />
          </div>
        </div>

        {/* Navigation Categories List Body */}
        <div className="mobile-drawer-body">
          <div className="mobile-drawer-section-label">
            Catalog Categories
          </div>

          {/* All Catalogs Button */}
          <button
            onClick={() => handleCategorySelect('all')}
            className={`mobile-nav-cat-item ${activeCategory === 'all' ? 'is-active' : ''}`}
          >
            <div className="mobile-nav-cat-left">
              <span className="mobile-nav-cat-icon">
                <Sparkles size={18} />
              </span>
              <span>All Catalogs</span>
            </div>
            <ChevronRight size={14} opacity={0.6} />
          </button>

          {/* Individual Category Buttons */}
          {categories.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`mobile-nav-cat-item ${isActive ? 'is-active' : ''}`}
              >
                <div className="mobile-nav-cat-left">
                  <span className="mobile-nav-cat-icon">
                    {getCategoryIcon(cat.id)}
                  </span>
                  <span>{cat.name}</span>
                </div>
                <span className="mobile-nav-cat-badge">
                  {cat.itemCount || 12}
                </span>
              </button>
            );
          })}
        </div>

        {/* B2B Quote & Quick Help Footer */}
        <div className="mobile-drawer-footer">
          <div className="mobile-panel-links">
            <a href="/admin" className="mobile-drawer-link-item">📊 Owner Admin Panel</a>
            <a href="/partner" className="mobile-drawer-link-item">🔨 Carpenter Partner</a>
          </div>
          <button
            onClick={() => { setIsMobileNavOpen(false); setIsQuoteModalOpen(true); }}
            className="mobile-drawer-quote-btn"
          >
            <FileText size={16} />
            <span>Request Trade Quote</span>
          </button>

          <div className="mobile-drawer-quick-links">
            <a href="tel:+919876543210" className="mobile-drawer-link-item">
              <Phone size={13} color="#F47B20" />
              <span>+91 98765 43210</span>
            </a>
            <a href="#store-locator" className="mobile-drawer-link-item" onClick={() => setIsMobileNavOpen(false)}>
              <MapPin size={13} color="#F47B20" />
              <span>Store Locator</span>
            </a>
          </div>
        </div>

      </div>
    </>
  );
}
