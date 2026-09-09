import React, { createContext, useContext, useState, useEffect } from 'react';
import { PRODUCTS, CATEGORIES } from '../data/products.js';

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smh_cart') || '[]');
    } catch {
      return [];
    }
  });

  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('smh_wishlist') || '[]');
    } catch {
      return [];
    }
  });

  const [activeCategory, setActiveCategoryState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const valid = CATEGORIES.some(c => c.id === hash);
    return valid ? hash : 'all';
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [cartBump, setCartBump] = useState(false);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === '' || hash === 'hero' || hash === 'home') {
        setActiveCategoryState('all');
      } else {
        const valid = CATEGORIES.some(c => c.id === hash);
        if (valid) setActiveCategoryState(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const setActiveCategory = (catId) => {
    setActiveCategoryState(catId);
    if (catId === 'all') {
      window.location.hash = 'home';
    } else {
      window.location.hash = catId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('smh_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('smh_wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToast = (message, icon = 'check-circle') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, icon }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3200);
  };

  const addToCart = (product) => {
    setCart(prevCart => {
      const existingIndex = prevCart.findIndex(item => item.id === product.id);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + 1
        };
        return updated;
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });

    setCartBump(true);
    setTimeout(() => setCartBump(false), 400);
    addToast(`Added "${product.name}" to cart!`, 'shopping-bag');
  };

  const incrementQty = (productId) => {
    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: item.quantity + 1 } : item));
  };

  const decrementQty = (productId) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.id !== productId));
    addToast('Item removed from cart', 'trash');
  };

  const toggleWishlist = (productId) => {
    setWishlist(prev => {
      const exists = prev.includes(productId);
      if (exists) {
        addToast('Removed from Wishlist', 'heart');
        return prev.filter(id => id !== productId);
      } else {
        addToast('Saved to Wishlist!', 'heart');
        return [...prev, productId];
      }
    });
  };

  return (
    <ShopContext.Provider value={{
      products: PRODUCTS,
      categories: CATEGORIES,
      cart,
      wishlist,
      activeCategory,
      setActiveCategory,
      searchQuery,
      setSearchQuery,
      isCartOpen,
      setIsCartOpen,
      isMobileNavOpen,
      setIsMobileNavOpen,
      isQuoteModalOpen,
      setIsQuoteModalOpen,
      isSupportOpen,
      setIsSupportOpen,
      quickViewProduct,
      setQuickViewProduct,
      cartBump,
      toasts,
      addToCart,
      incrementQty,
      decrementQty,
      removeFromCart,
      toggleWishlist,
      addToast
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
