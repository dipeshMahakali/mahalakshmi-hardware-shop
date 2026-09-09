import React, { useState, useEffect, useRef } from 'react';
import { 
  Truck, ShieldCheck, Award, Headphones, MapPin, Package, HelpCircle, 
  Search, Heart, User, ShoppingCart, Menu, Grid, DoorOpen, Grab, 
  Lock, Sliders, Box, Droplet, Sparkles, ArrowRight, ChevronDown, Check 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

const CATEGORY_OPTIONS = [
  { id: 'all', label: 'All Categories' },
  { id: 'door-hardware', label: 'Door Hardware' },
  { id: 'handles', label: 'Handles' },
  { id: 'locks-security', label: 'Locks & Security' },
  { id: 'hinges', label: 'Hinges' },
  { id: 'cabinet-hardware', label: 'Cabinet Hardware' },
  { id: 'bathroom-fittings', label: 'Bathroom Fittings' },
  { id: 'tools-accessories', label: 'Tools & Accessories' },
];

export function Header({ setViewMode, viewMode }) {
  const { cart, wishlist, setIsCartOpen, setIsMobileNavOpen, cartBump, activeCategory, setActiveCategory, setSearchQuery } = useShop();
  const [isSticky, setIsSticky] = useState(false);
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [searchInputVal, setSearchInputVal] = useState('');
  
  const dropdownRef = useRef(null);
  const searchContainerRef = useRef(null);
  const megaMenuRef = useRef(null);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const currentCatOption = CATEGORY_OPTIONS.find(c => c.id === activeCategory) || CATEGORY_OPTIONS[0];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsCatDropdownOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchActive(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(e.target)) {
        setIsMegaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInputVal);
    if (activeCategory === 'all') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Top Utility Bar */}
      <div className="top-utility-bar">
        <div className="container utility-container">
          <div className="utility-left">
            <span className="utility-item"><Truck size={14} /> Fast & Reliable Delivery</span>
            <span className="utility-divider"></span>
            <span className="utility-item"><ShieldCheck size={14} /> Genuine Quality Products</span>
            <span className="utility-divider"></span>
            <span className="utility-item"><Award size={14} /> Trusted Hardware Professionals</span>
            <span className="utility-divider"></span>
            <span className="utility-item"><Headphones size={14} /> Expert Support</span>
          </div>
          <div className="utility-right">
            {setViewMode && (
              <>
                <a
                  href="/partner"
                  className="utility-item"
                  style={{ background: 'none', border: 'none', color: '#38bdf8', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  🔨 Carpenter Partner Portal
                </a>
                <span className="utility-divider"></span>
                <a
                  href="/admin"
                  className="utility-item"
                  style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontWeight: 'bold' }}
                >
                  📊 Owner Admin Login
                </a>
                <span className="utility-divider"></span>
              </>
            )}
            <a href="#store-locator" className="utility-item"><MapPin size={14} /> Store Locator</a>
            <span className="utility-divider"></span>
            <a href="#track-order" className="utility-item"><Package size={14} /> Track Order</a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <header className={`header-wrapper ${isSticky ? 'is-sticky' : ''}`} id="header-wrapper">
        <div className="container main-header">
          
          <button 
            className="mobile-hamburger-btn" 
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open navigation menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo: SHREE MAHALAXMI HARDWARE */}
          <a href="#home" className="brand-logo" onClick={() => setActiveCategory('all')} title="Shree Mahalaxmi Hardware">
            <div className="logo-emblem">
              <ShieldCheck size={24} />
            </div>
            <div className="logo-text-group">
              <div className="logo-title">
                <span className="logo-title-main">SHREE MAHALAXMI</span>
                <span className="logo-title-sub">HARDWARE</span>
              </div>
            </div>
          </a>

          {/* Large Search Bar */}
          <div className={`search-container ${isSearchActive ? 'is-active' : ''}`} id="search-container" ref={searchContainerRef}>
            <form className="search-bar-form" onSubmit={handleSearchSubmit}>
              
              {/* Custom Category Selection Dropdown */}
              <div className="custom-select-wrapper" ref={dropdownRef}>
                <button 
                  type="button" 
                  className={`custom-select-trigger ${isCatDropdownOpen ? 'is-active' : ''}`}
                  onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                >
                  <span className="select-label">{currentCatOption.label}</span>
                  <ChevronDown size={14} className={`select-chevron ${isCatDropdownOpen ? 'is-open' : ''}`} />
                </button>

                {isCatDropdownOpen && (
                  <div className="custom-dropdown-menu">
                    {CATEGORY_OPTIONS.map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        className={`custom-dropdown-item ${activeCategory === opt.id ? 'is-selected' : ''}`}
                        onClick={() => {
                          setActiveCategory(opt.id);
                          setIsCatDropdownOpen(false);
                        }}
                      >
                        <span>{opt.label}</span>
                        {activeCategory === opt.id && <Check size={14} className="dropdown-check-icon" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <input 
                type="text" 
                className="search-input" 
                placeholder="Search for products, categories..." 
                value={searchInputVal}
                onChange={(e) => setSearchInputVal(e.target.value)}
                onFocus={() => setIsSearchActive(true)}
                onBlur={() => setTimeout(() => setIsSearchActive(false), 200)}
              />
              <button type="submit" className="search-submit-btn" aria-label="Search">
                <Search size={18} />
              </button>
            </form>

            {/* Search Live Suggestions Panel */}
            <div className="search-suggestions-panel">
              <div className="search-panel-section">
                <div className="search-panel-title">Recent Searches</div>
                <div className="search-tags">
                  <button className="search-tag" onClick={() => { setSearchInputVal('Biometric'); setActiveCategory('locks-security'); }}>Biometric Smart Lock</button>
                  <button className="search-tag" onClick={() => { setSearchInputVal('Brass'); setActiveCategory('handles'); }}>Brass Mortise Handle</button>
                  <button className="search-tag" onClick={() => { setSearchInputVal('SS 304'); setActiveCategory('hinges'); }}>SS 304 Soft Close Hinge</button>
                </div>
              </div>
              <div className="search-panel-section">
                <div className="search-panel-title">Popular Categories</div>
                <div className="search-tags">
                  <button className="search-tag" onClick={() => setActiveCategory('door-hardware')}>Door Hardware</button>
                  <button className="search-tag" onClick={() => setActiveCategory('locks-security')}>Digital Locks</button>
                  <button className="search-tag" onClick={() => setActiveCategory('cabinet-hardware')}>Drawer Channels</button>
                  <button className="search-tag" onClick={() => setActiveCategory('handles')}>Cabinet Knobs</button>
                </div>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            <button className="header-action-btn" aria-label="Wishlist">
              <div className="action-icon-wrapper">
                <Heart size={22} />
                {wishlistCount > 0 && <span className="badge-counter">{wishlistCount}</span>}
              </div>
              <span>Wishlist</span>
            </button>

            <a href="#account" className="header-action-btn" aria-label="Account">
              <div className="action-icon-wrapper">
                <User size={22} />
              </div>
              <span>Account</span>
            </a>

            <button className="header-action-btn" onClick={() => setIsCartOpen(true)} aria-label="Shopping Cart">
              <div className="action-icon-wrapper">
                <ShoppingCart size={22} />
                <span className={`badge-counter ${cartBump ? 'bump' : ''}`}>{cartCount}</span>
              </div>
              <span>Cart</span>
            </button>
          </div>
        </div>

        {/* Navigation Bar */}
        <nav className="category-nav-bar">
          <div className="container nav-container">
            <div className={`mega-menu-wrapper ${isMegaMenuOpen ? 'is-open' : ''}`} ref={megaMenuRef}>
              <button className="mega-menu-trigger" onClick={() => setIsMegaMenuOpen(!isMegaMenuOpen)}>
                <Grid size={18} />
                <span>Shop Categories</span>
                <ChevronDown size={16} />
              </button>

              <div className="mega-menu-dropdown">
                <div className="mega-menu-grid">
                  <a href="#door-hardware" className="mega-menu-item" onClick={() => { setActiveCategory('door-hardware'); setIsMegaMenuOpen(false); }}>
                    <div className="mega-menu-icon"><DoorOpen size={20} /></div>
                    <div>
                      <div className="mega-menu-info-title">Door Hardware</div>
                      <div className="mega-menu-info-desc">Handles, lever locks, tower bolts</div>
                    </div>
                  </a>
                  <a href="#handles" className="mega-menu-item" onClick={() => { setActiveCategory('handles'); setIsMegaMenuOpen(false); }}>
                    <div className="mega-menu-icon"><Grab size={20} /></div>
                    <div>
                      <div className="mega-menu-info-title">Handles</div>
                      <div className="mega-menu-info-desc">Mortise, pull bars, rose handles</div>
                    </div>
                  </a>
                  <a href="#locks-security" className="mega-menu-item" onClick={() => { setActiveCategory('locks-security'); setIsMegaMenuOpen(false); }}>
                    <div className="mega-menu-icon"><Lock size={20} /></div>
                    <div>
                      <div className="mega-menu-info-title">Locks & Security</div>
                      <div className="mega-menu-info-desc">Biometric smart locks, deadbolts</div>
                    </div>
                  </a>
                  <a href="#hinges" className="mega-menu-item" onClick={() => { setActiveCategory('hinges'); setIsMegaMenuOpen(false); }}>
                    <div className="mega-menu-icon"><Sliders size={20} /></div>
                    <div>
                      <div className="mega-menu-info-title">Hinges</div>
                      <div className="mega-menu-info-desc">Hydraulic soft-close, SS 304 butt hinges</div>
                    </div>
                  </a>
                  <a href="#cabinet-hardware" className="mega-menu-item" onClick={() => { setActiveCategory('cabinet-hardware'); setIsMegaMenuOpen(false); }}>
                    <div className="mega-menu-icon"><Box size={20} /></div>
                    <div>
                      <div className="mega-menu-info-title">Cabinet Hardware</div>
                      <div className="mega-menu-info-desc">Drawer slides, knobs, profile handles</div>
                    </div>
                  </a>
                  <a href="#bathroom-fittings" className="mega-menu-item" onClick={() => { setActiveCategory('bathroom-fittings'); setIsMegaMenuOpen(false); }}>
                    <div className="mega-menu-icon"><Droplet size={20} /></div>
                    <div>
                      <div className="mega-menu-info-title">Bathroom Fittings</div>
                      <div className="mega-menu-info-desc">Faucets, glass patches, towel rails</div>
                    </div>
                  </a>
                </div>
                <div className="mega-menu-banner">
                  <div>
                    <span className="mega-banner-tag">Architectural Selection</span>
                    <div className="mega-banner-title">Architectural Hardware Showroom</div>
                  </div>
                  <button className="mega-banner-btn" onClick={() => { setActiveCategory('all'); setIsMegaMenuOpen(false); }}>
                    Browse Full Catalog <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>

            <div className="nav-links">
              <button 
                className={`nav-link ${activeCategory === 'door-hardware' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('door-hardware')}
              >
                Door Hardware
              </button>
              <button 
                className={`nav-link ${activeCategory === 'handles' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('handles')}
              >
                Handles
              </button>
              <button 
                className={`nav-link ${activeCategory === 'locks-security' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('locks-security')}
              >
                Locks
              </button>
              <button 
                className={`nav-link ${activeCategory === 'hinges' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('hinges')}
              >
                Hinges
              </button>
              <button 
                className={`nav-link ${activeCategory === 'cabinet-hardware' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('cabinet-hardware')}
              >
                Cabinet Hardware
              </button>
              <button 
                className={`nav-link ${activeCategory === 'bathroom-fittings' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('bathroom-fittings')}
              >
                Bathroom Fittings
              </button>
              <button 
                className={`nav-link ${activeCategory === 'tools-accessories' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('tools-accessories')}
              >
                Tools & Accessories
              </button>
              <button 
                className={`nav-link active-offer ${activeCategory === 'offers' ? 'is-active' : ''}`}
                onClick={() => setActiveCategory('offers')}
              >
                <Sparkles size={14} /> Special Offers
              </button>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}
