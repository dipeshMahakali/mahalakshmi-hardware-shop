import React from 'react';
import { 
  ShieldCheck, Lock, Phone, Mail, MapPin, Clock, Home, Search, 
  Grid, Heart, ShoppingCart 
} from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function Footer() {
  const { cart, wishlist, setIsCartOpen, setIsMobileNavOpen, setActiveCategory } = useShop();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const wishlistCount = wishlist.length;

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
                    <span className="logo-title-main">SHREE MAHALAXMI</span>
                    <span className="logo-title-sub">HARDWARE</span>
                  </div>
                </div>
              </a>
              
              <p className="footer-about-text">
                Your trusted destination for premium architectural hardware, fittings, door security, and cabinet accessories. Built for durability and engineered for modern spaces.
              </p>

              <div className="footer-trust-badges">
                <div className="footer-badge-pill"><ShieldCheck size={14} /> 100% Genuine</div>
                <div className="footer-badge-pill"><Lock size={14} /> 256-Bit SSL</div>
              </div>
            </div>

            <div>
              <h4 className="footer-col-title">Shop Catalogs</h4>
              <ul className="footer-links-list">
                <li><button className="footer-link-btn" onClick={() => setActiveCategory('door-hardware')}>Door Hardware</button></li>
                <li><button className="footer-link-btn" onClick={() => setActiveCategory('handles')}>Handles</button></li>
                <li><button className="footer-link-btn" onClick={() => setActiveCategory('locks-security')}>Locks & Security</button></li>
                <li><button className="footer-link-btn" onClick={() => setActiveCategory('hinges')}>Hinges</button></li>
                <li><button className="footer-link-btn" onClick={() => setActiveCategory('cabinet-hardware')}>Cabinet Hardware</button></li>
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
                  <span>+91 98765 43210</span>
                </div>
                <div className="footer-contact-item">
                  <Mail size={18} />
                  <span>info@shreemahalaxmihardware.com</span>
                </div>
                <div className="footer-contact-item">
                  <MapPin size={18} />
                  <span>123 Hardware Market, City Center, Ahmedabad, Gujarat - 380001</span>
                </div>
                <div className="footer-contact-item">
                  <Clock size={18} />
                  <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
                </div>
              </div>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <div>© {new Date().getFullYear()} Shree Mahalaxmi Hardware. All Rights Reserved.</div>

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
