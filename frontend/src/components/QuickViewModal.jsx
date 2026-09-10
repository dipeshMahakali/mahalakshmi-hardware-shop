import React from 'react';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';
import { HardwareSVG } from '../components/graphics/HardwareIllustrations.jsx';
import { formatINR } from '../utils/currency.js';

export { QuoteModal } from './QuoteModal.jsx';

export function QuickViewModal() {
  const { quickViewProduct, setQuickViewProduct, addToCart, toggleWishlist, wishlist } = useShop();

  if (!quickViewProduct) return null;

  const isWishlisted = wishlist.includes(quickViewProduct.id);

  return (
    <div className="modal-backdrop is-open" onClick={() => setQuickViewProduct(null)}>
      <div className="quickview-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={() => setQuickViewProduct(null)} aria-label="Close modal">
          <X size={20} />
        </button>

        <div style={{ background: 'var(--color-bg-secondary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--space-6)', minHeight: '280px' }}>
          {quickViewProduct.image_url ? (
            <img 
              src={quickViewProduct.image_url} 
              alt={quickViewProduct.name}
              style={{ maxHeight: '240px', maxWidth: '100%', objectFit: 'contain', borderRadius: '8px' }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
          ) : null}
          <div style={{ display: quickViewProduct.image_url ? 'none' : 'block' }}>
            <HardwareSVG type={quickViewProduct.type} width={240} height={240} />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className={`product-badge ${quickViewProduct.badgeType || 'bestseller'}`}>{quickViewProduct.badge || 'Architectural Choice'}</span>
            <h2 style={{ fontSize: 'var(--fs-2xl)', fontWeight: '800', color: 'var(--color-primary)', marginTop: 'var(--space-2)', lineHeight: '1.2' }}>{quickViewProduct.name}</h2>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginTop: '4px' }}>{quickViewProduct.subtitle || quickViewProduct.category}</p>

            <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--fs-2xl)', fontWeight: '800', color: 'var(--color-primary)' }}>
                {formatINR(quickViewProduct.price || quickViewProduct.selling_price)}
              </span>
              {quickViewProduct.originalPrice && (
                <span style={{ fontSize: 'var(--fs-md)', color: 'var(--color-text-light)', textDecoration: 'line-through' }}>
                  {formatINR(quickViewProduct.originalPrice)}
                </span>
              )}
              {quickViewProduct.discountPercentage ? (
                <span style={{ background: 'var(--color-accent-light)', color: 'var(--color-accent)', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                  {quickViewProduct.discountPercentage}% OFF
                </span>
              ) : null}
            </div>

            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)', lineHeight: '1.5' }}>
              {quickViewProduct.description || 'Premium architectural hardware crafted with precision engineering and superior corrosion resistance.'}
            </p>

            <div style={{ marginTop: 'var(--space-4)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', fontSize: 'var(--fs-xs)' }}>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Material:</strong> {quickViewProduct.material || 'Architectural Grade Alloy'}
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Finish:</strong> {quickViewProduct.finish || 'Matte / Satin'}
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>Warranty:</strong> {quickViewProduct.warranty || '5 Years Warranty'}
              </div>
              <div style={{ background: 'var(--color-bg-secondary)', padding: '8px 12px', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ color: 'var(--color-primary)' }}>SKU:</strong> {quickViewProduct.sku || 'SMH-ARCH'}
              </div>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-6)', display: 'flex', gap: 'var(--space-4)' }}>
            <button 
              className="add-to-cart-btn" 
              style={{ flex: 1, padding: 'var(--space-4)', fontSize: 'var(--fs-base)', cursor: 'pointer' }}
              onClick={() => {
                addToCart(quickViewProduct);
                setQuickViewProduct(null);
              }}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
            <button 
              className="btn-secondary" 
              style={{ color: 'var(--color-primary)', borderColor: 'var(--color-border)', cursor: 'pointer' }}
              onClick={() => toggleWishlist(quickViewProduct.id)}
              aria-label="Toggle Wishlist"
            >
              <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : 'currentColor'} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
