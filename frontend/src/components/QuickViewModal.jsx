import React from 'react';
import { X, ShoppingBag, Heart, Send } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HardwareSVG } from '../utils/HardwareCanvas';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, wishlist } = useShop();

  if (!quickViewProduct) return null;

  const isWishlisted = wishlist.includes(quickViewProduct.id);

  return (
    <div className="modal-backdrop is-open" onClick={() => setQuickViewProduct(null)}>
      <div className="quickview-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={() => setQuickViewProduct(null)}>
          <X size={20} />
        </button>

        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)' }}>
          <HardwareSVG type={quickViewProduct.type} width={260} height={260} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className={`product-badge ${quickViewProduct.badgeType}`}>{quickViewProduct.badge}</span>
            <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '800', color: 'var(--color-primary)', marginTop: 'var(--space-2)', lineHeight: '1.2' }}>{quickViewProduct.name}</h2>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>{quickViewProduct.subtitle}</p>

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: '800', color: 'var(--color-primary)' }}>₹{quickViewProduct.price.toLocaleString('en-IN')}</span>
              {quickViewProduct.originalPrice && <span style={{ fontSize: 'var(--fs-md)', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>₹{quickViewProduct.originalPrice.toLocaleString('en-IN')}</span>}
              <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>{quickViewProduct.discountPercentage}% OFF</span>
            </div>

            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)', lineHeight: '1.5' }}>{quickViewProduct.description}</p>

            <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--fs-xs)' }}>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Material:</strong> {quickViewProduct.material}
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Finish:</strong> {quickViewProduct.finish}
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Warranty:</strong> {quickViewProduct.warranty}
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>SKU:</strong> {quickViewProduct.sku}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
            <button 
              className="add-to-cart-btn" 
              style={{ flex: 1, padding: 'var(--space-4)', fontSize: 'var(--fs-base)' }}
              onClick={() => {
                addToCart(quickViewProduct);
                setQuickViewProduct(null);
              }}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button 
              className="btn-secondary" 
              style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)' }}
              onClick={() => toggleWishlist(quickViewProduct.id)}
            >
              <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : 'currentColor'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuoteModal() {
  const { isQuoteModalOpen, setIsQuoteModalOpen, addToast } = useShop();

  if (!isQuoteModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsQuoteModalOpen(false);
    addToast('Quote request submitted! Our specialist will call you shortly.', 'send');
  };

  return (
    <div className="modal-backdrop is-open" onClick={() => setIsQuoteModalOpen(false)}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={() => setIsQuoteModalOpen(false)}>
          <X size={20} />
        </button>

        <h3 className="quote-modal-title">Request a Bulk Quote</h3>
        <p className="quote-modal-subtitle">Submit your hardware project details for trade discounts & bulk pricing.</p>

        <form className="quote-form" onSubmit={handleSubmit}>
          <div className="quote-form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-input" required placeholder="e.g. Rajesh Sharma" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input type="tel" className="form-input" required placeholder="+91 98765 43210" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-input" required placeholder="name@company.com" />
          </div>

          <div className="quote-form-row">
            <div className="form-group">
              <label className="form-label">Project Type</label>
              <select className="form-select">
                <option value="Residential">Residential Renovation</option>
                <option value="Commercial">Commercial / Office Project</option>
                <option value="Dealer">Dealer Bulk Requirement</option>
                <option value="Architect">Architect / Designer Specification</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estimated Volume</label>
              <select className="form-select">
                <option value="10-50 units">10 - 50 Units</option>
                <option value="50-200 units">50 - 200 Units</option>
                <option value="200+ units">200+ Units (Full Project)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Product Requirements & Specs</label>
            <textarea className="form-textarea" rows="3" placeholder="List items needed (e.g. 40 mortise handles, 100 soft close hinges, 10 smart locks)"></textarea>
          </div>

          <button type="submit" className="submit-quote-btn">
            Submit Quote Request <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
