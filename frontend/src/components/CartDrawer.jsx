import React from 'react';
import { ShoppingCart, X, ShoppingBag, ArrowRight } from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { HardwareSVG } from '../utils/HardwareCanvas';

export function CartDrawer() {
  const { cart, isCartOpen, setIsCartOpen, incrementQty, decrementQty, removeFromCart, addToast } = useShop();

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const amountLeft = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <div className={`cart-drawer ${isCartOpen ? 'is-open' : ''}`} id="cart-drawer">
      
      <div className="cart-drawer-header">
        <div className="cart-drawer-title">
          <ShoppingCart size={20} /> Your Shopping Cart ({cart.length})
        </div>
        <button className="drawer-close-btn" onClick={() => setIsCartOpen(false)} aria-label="Close Cart">
          <X size={20} />
        </button>
      </div>

      <div className="free-shipping-bar-container">
        <div className="free-shipping-text">
          {amountLeft === 0 
            ? '🎉 Congratulations! You unlocked FREE Delivery!' 
            : `Add ₹${amountLeft.toLocaleString('en-IN')} more to get FREE Delivery!`}
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      <div className="cart-drawer-body">
        {cart.length === 0 ? (
          <div className="cart-empty-state">
            <div className="cart-empty-icon"><ShoppingBag size={32} /></div>
            <h3>Your cart is empty</h3>
            <p style={{ fontSize: '13px', marginTop: '6px' }}>Explore our catalog and add items to your cart.</p>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-img">
                <HardwareSVG type={item.type} width={50} height={50} />
              </div>
              <div className="cart-item-details">
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">₹{item.price.toLocaleString('en-IN')}</div>
                </div>
                <div className="cart-qty-controls">
                  <button className="qty-btn" onClick={() => decrementQty(item.id)}>-</button>
                  <span className="qty-val">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => incrementQty(item.id)}>+</button>
                  <button 
                    style={{ marginLeft: 'auto', color: 'var(--color-danger)', fontSize: '12px', background: 'none', border: 'none', cursor: 'pointer' }}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="cart-drawer-footer">
          <div className="cart-subtotal-row">
            <span>Subtotal</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <button 
            className="checkout-btn"
            onClick={() => {
              addToast('Proceeding to Checkout...', 'shopping-bag');
              setIsCartOpen(false);
            }}
          >
            Proceed to Checkout <ArrowRight size={18} />
          </button>
        </div>
      )}

    </div>
  );
}
