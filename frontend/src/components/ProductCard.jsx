import React from 'react';
import { Heart, Eye, Star, ShoppingBag, Check } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HardwareSVG } from '../utils/HardwareCanvas';

export function ProductCard({ product }) {
  const { cart, wishlist, addToCart, toggleWishlist, setQuickViewProduct } = useShop();

  const isWishlisted = wishlist.includes(product.id);
  const isAdded = cart.some(item => item.id === product.id);

  return (
    <div className="product-card" data-product-id={product.id}>
      <div className="product-card-header">
        <span className={`product-badge ${product.badgeType}`}>{product.badge}</span>
        <button 
          className={`product-wishlist-btn ${isWishlisted ? 'is-active' : ''}`}
          onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
          aria-label="Add to Wishlist"
        >
          <Heart size={18} fill={isWishlisted ? '#EF4444' : 'none'} color={isWishlisted ? '#EF4444' : 'currentColor'} />
        </button>
      </div>

      <div className="product-image-container">
        <HardwareSVG type={product.type} width={180} height={180} />
        <button className="product-quickview-btn" onClick={() => setQuickViewProduct(product)}>
          <Eye size={14} /> Quick View
        </button>
      </div>

      <div className="product-info">
        <span className="product-category-name">{product.category}</span>
        <h3 className="product-title">{product.name}</h3>
        <p className="product-subtitle">{product.subtitle}</p>
        
        <div className="product-rating">
          <div className="stars-group">
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
            <Star size={14} fill="#D4AF37" color="#D4AF37" />
          </div>
          <span className="rating-count">({product.reviewCount})</span>
        </div>
      </div>

      <div className="product-card-footer">
        <div className="product-price-group">
          <span className="current-price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.originalPrice && <span className="original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>}
        </div>

        <button 
          className={`add-to-cart-btn ${isAdded ? 'added' : ''}`}
          onClick={() => addToCart(product)}
        >
          {isAdded ? <Check size={16} /> : <ShoppingBag size={16} />}
          <span>{isAdded ? 'Added' : 'Add to Cart'}</span>
        </button>
      </div>
    </div>
  );
}
