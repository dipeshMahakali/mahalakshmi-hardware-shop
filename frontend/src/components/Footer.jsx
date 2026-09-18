import React from 'react';
import { 
  ShieldCheck, Lock, Phone, Mail, MapPin, Clock, Home, Search, 
  Grid, Heart, ShoppingCart 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function Footer() {
  const { cart, wishlist, setIsCartOpen, setIsMobileNavOpen, setActiveCategory, categories, siteContent } = useShop();
  const footerData = siteContent?.footer || {};

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

  const displayCategories = (categories && categories.length > 0)
    ? categories.slice(0, 6)
    : [
        { id: 'door-hardware', name: 'Door Hardware' },
        { id: 'handles', name: 'Handles' },
        { id: 'locks-security', name: 'Locks & Security' },
        { id: 'hinges', name: 'Hinges' },
        { id: 'cabinet-hardware', name: 'Cabinet Hardware' }
      ];

  return (
    <>
      <footer className="site-footer" id="contact">
        <div className="container">
          
          <div className="footer-grid">
            <div className="footer-brand-col">
              <a href="#home" className="brand-logo footer-brand-logo" onClick={() => setActiveCategory('all')}>
                <div className="logo-emblem">
                  <ShieldCheck size={24} />
                </div>
                <div className="logo-text-group">
                  <div className="logo-title">
                    <span className="logo-title-main">SHRI MAHALAKSHMI</span>
                    <span className="logo-title-sub">TRADER</span>
                  </div>
                </div>
              </a>
              
              <p className="footer-about-text">
                {footerData.about_text || 'Shri Mahalakshmi Trader is your trusted destination for premium architectural hardware, fittings, door security, and cabinet accessories in Bagbahara, Chhattisgarh. Built for durability and engineered for modern spaces.'}
              </p>

              <div className="footer-trust-badges">
                <div className="footer-badge-pill"><ShieldCheck size={14} /> 100% Genuine</div>
                <div className="footer-badge-pill"><Lock size={14} /> 256-Bit SSL</div>
                {footerData.gstin && (
                  <div className="footer-badge-pill">GSTIN: {footerData.gstin}</div>
                )}
              </div>
            </div>

            <div>
              <h4 className="footer-col-title">Shop Catalogs</h4>
              <ul className="footer-links-list">
                {displayCategories.map(cat => (
                  <li key={cat.id}>
                    <button className="footer-link-btn" onClick={() => setActiveCategory(cat.id)}>
                      {cat.name}
                    </button>
                  </li>
                ))}
                <li><button className="footer-link-btn" onClick={() => setActiveCategory('all')}>All Catalogs</button></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Customer Service</h4>
              <ul className="footer-links-list">
                <li><a href="#contact" className="footer-link">Contact Us</a></li>
                <li><a href="#track-order" className="footer-link">Track Order</a></li>
                <li><a href="#shipping" className="footer-link">Shipping Policy</a></li>
                <li><a href="#returns" className="footer-link">Returns & Refunds</a></li>
                <li><a href="#faqs" className="footer-link">FAQs</a></li>
                <li><a href="#warranty" className="footer-link">Warranty Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Business</h4>
              <ul className="footer-links-list">
                <li><a href="#business-services" className="footer-link">Bulk Orders</a></li>
                <li><a href="#business-services" className="footer-link">Become a Dealer</a></li>
                <li><a href="#business-services" className="footer-link">Request a Quote</a></li>
                <li><a href="/admin" className="footer-link">Owner Admin Panel</a></li>
                <li><a href="/partner" className="footer-link">Carpenter Partner Panel</a></li>
              </ul>
            </div>

            <div>
              <h4 className="footer-col-title">Contact Us</h4>
              <div className="footer-contact-list">
                <div className="footer-contact-item">
                  <Phone size={18} />
                  <span>{footerData.phone || '+91 95261 62225'}</span>
                </div>
                <div className="footer-contact-item">
                  <Mail size={18} />
                  <span>{footerData.email || 'contact@shrimahalakshmitrader.com'}</span>
                </div>
                <div className="footer-contact-item">
                  <MapPin size={18} />
                  <span>{footerData.address || 'Near Bharat Petrol Pump, Bagbahara, Chhattisgarh - 493449'}</span>
                </div>
                <div className="footer-contact-item">
                  <Clock size={18} />
                  <span>{footerData.hours || 'Mon - Sat: 9:00 AM - 8:00 PM'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>{footerData.copyright || `© ${new Date().getFullYear()} Shri Mahalakshmi Trader. All Rights Reserved.`}</div>

            <div className="payment-badges-row">
              <span className="payment-badge">VISA</span>
              <span className="payment-badge">Mastercard</span>
              <span className="payment-badge">UPI</span>
              <span className="payment-badge">Paytm</span>
              <span className="payment-badge"><Lock size={12} /> 256-bit SSL</span>
            </div>

            <div className="footer-legal-links">
              <a href="#privacy" className="footer-legal-link">Privacy Policy</a>
              <a href="#terms" className="footer-legal-link">Terms & Conditions</a>
              <a href="#sitemap" className="footer-legal-link">Sitemap</a>
              <div className="dev-signature-mark" title="System Architecture &amp; Full-Stack Engineering">
                <span>Designed &amp; Engineered by </span>
                <span className="dev-mark-author">Dipesh Patel</span>
              </div>
            </div>
          </div>

        </div>
      </footer>

      {/* Mobile Fixed Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <div className="mobile-bottom-nav-grid">
          <button className="mobile-nav-item is-active" onClick={() => setActiveCategory('all')}>
            <Home size={19} />
            <span>Home</span>
          </button>
          <button className="mobile-nav-item" onClick={() => setIsMobileNavOpen(true)}>
            <Grid size={19} />
            <span>Menu</span>
          </button>
          <button className="mobile-nav-item" onClick={() => setActiveCategory('door-hardware')}>
            <Search size={19} />
            <span>Search</span>
          </button>
          <button className="mobile-nav-item">
            <Heart size={19} />
            {wishlistCount > 0 && <span className="badge-counter" style={{ top: '2px', right: '14px' }}>{wishlistCount}</span>}
            <span>Wishlist</span>
          </button>
          <button className="mobile-nav-item" onClick={() => setIsCartOpen(true)}>
            <ShoppingCart size={19} />
            {cartCount > 0 && <span className="badge-counter" style={{ top: '2px', right: '14px' }}>{cartCount}</span>}
            <span>Cart</span>
          </button>
        </div>
      </nav>
    </>
  );
}
