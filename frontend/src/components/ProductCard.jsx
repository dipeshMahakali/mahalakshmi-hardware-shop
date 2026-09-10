import React, { useState } from 'react';
import { Heart, Eye, Star, ShoppingBag, Check, Zap } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';
import { HardwareSVG } from './graphics/HardwareIllustrations.jsx';
import { formatINR } from '../utils/currency.js';

export function ProductCard({ product }) {
  const { cart, wishlist, addToCart, toggleWishlist, setQuickViewProduct } = useShop();
  const [imgError, setImgError] = useState(false);

  const isWishlisted = wishlist.includes(product.id);
  const isAdded = cart.some(item => item.id === product.id);

  return (
    <div className="product-card" data-product-id={product.id}>
      <div className="product-card-header">
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <span className={`product-badge ${product.badgeType || 'bestseller'}`}>
            {product.badge || 'POPULAR'}
          </span>
          {product.isLiveDb && (
            <span 
              style={{
                background: 'rgba(16, 185, 129, 0.12)',
                color: '#10B981',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                fontSize: '10px',
                fontWeight: '700',
                padding: '2px 6px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px'
              }}
              title="Verified in live shop database"
            >
              <Zap size={10} /> Live
            </span>
          )}
        </div>

        <button 
          className={`product-wishlist-btn ${isWishlisted ? 'is-active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : 'currentColor'} />
        </button>
      </div>

      <div className="product-image-container" style={{ position: 'relative', overflow: 'hidden' }}>
        {product.image_url && !imgError ? (
          <img 
            src={product.image_url} 
            alt={product.name}
            loading="lazy"
            style={{ 
              width: '100%', 
              height: '180px', 
              objectFit: 'contain', 
              padding: '12px',
              transition: 'transform 0.3s ease'
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <HardwareSVG type={product.type} width={180} height={180} />
        )}

        <button 
          className="product-quickview-btn" 
          onClick={() => setQuickViewProduct(product)}
          aria-label={`Quick view ${product.name}`}
        >
          <Eye size={14} /> Quick View
        </button>
      </div>

      <div className="product-info">
        <span className="product-category-name">{product.category}</span>
        <h3 className="product-title" title={product.name}>{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        
        <div className="product-rating">
          <div className="stars-group">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                size={14} 
                fill={i < Math.floor(product.rating || 5) ? "#D4AF37" : "none"} 
                color="#D4AF37" 
              />
            ))}
          </div>
          <span className="rating-count">({product.reviewCount || 12})</span>
        </div>
      </div>

      <div className="product-card-footer">
        <div className="product-price-group">
          <span className="current-price">{formatINR(product.price)}</span>
          {product.originalPrice && (
            <span className="original-price">{formatINR(product.originalPrice)}</span>
          )}
        </div>

        <button 
          className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
          onClick={() => addToCart(product)}
          aria-label={isAdded ? "Added to cart" : `Add ${product.name} to cart`}
        >
          {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
