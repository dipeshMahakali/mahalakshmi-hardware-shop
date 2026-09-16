import React, { createContext, useContext, useState, useEffect } from 'react';
import { CATEGORIES as DEFAULT_CATEGORIES } from '../data/products.js';
import { useProducts } from '../hooks/useProducts.js';
import { useSiteContent } from '../hooks/useSiteContent.js';
import { businessApi } from '../api/businessApi.js';

const ShopContext = createContext();

function getSessionToken() {
  try {
    let token = localStorage.getItem('smh_session_token');
    if (!token) {
      token = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem('smh_session_token', token);
    }
    return token;
  } catch {
    return 'sess_fallback_' + Date.now();
  }
}

export function ShopProvider({ children }) {
  const { products, categories, isLive, loading: productsLoading, refetch: refetchProducts } = useProducts();
  const { content: siteContent, loading: siteContentLoading, isLive: isSiteContentLive, refetch: refetchSiteContent, updateSection: updateSiteContent } = useSiteContent();

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

  const [isCatalogView, setIsCatalogView] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'catalog' || hash === 'catalogs' || hash === 'all-products') return true;
    return DEFAULT_CATEGORIES.some(c => c.id === hash);
  });

  const [activeCategory, setActiveCategoryState] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    const valid = DEFAULT_CATEGORIES.some(c => c.id === hash);
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
      const validCategories = categories && categories.length > 0 ? categories : DEFAULT_CATEGORIES;

      if (hash === '' || hash === 'hero' || hash === 'home') {
        setIsCatalogView(false);
        setActiveCategoryState('all');
      } else if (hash === 'catalog' || hash === 'catalogs' || hash === 'all-products') {
        setIsCatalogView(true);
        setActiveCategoryState('all');
      } else {
        const found = validCategories.find(c => c.id === hash || (c.slug && c.slug === hash));
        if (found) {
          setIsCatalogView(true);
          setActiveCategoryState(found.id);
        }
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [categories]);

  const setActiveCategory = (catId) => {
    if (catId === 'home') {
      setIsCatalogView(false);
      setActiveCategoryState('all');
      window.location.hash = 'home';
    } else if (catId === 'all' || catId === 'catalog') {
      setIsCatalogView(true);
      setActiveCategoryState('all');
      window.location.hash = 'catalog';
    } else {
      setIsCatalogView(true);
      setActiveCategoryState(catId);
      window.location.hash = catId;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToHome = () => {
    setIsCatalogView(false);
    setActiveCategoryState('all');
    window.location.hash = 'home';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    localStorage.setItem('smh_cart', JSON.stringify(cart));
    const timer = setTimeout(() => {
      const sessionToken = getSessionToken();
      const items = cart.map(i => ({
        product_id: typeof i.dbId === 'number' ? i.dbId : (typeof i.id === 'number' ? i.id : 1),
        product_name: i.name,
        sku: i.sku || '',
        quantity: i.quantity,
        unit_price: Number(i.price) || 0
      }));
      businessApi.syncStorefrontCart({
        session_token: sessionToken,
        items
      }).catch(() => {
        // silent telemetry fallback
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [cart]);

  useEffect(() => {
    localStorage.setItem('smh_wishlist', JSON.stringify(wishlist));
    const timer = setTimeout(() => {
      const sessionToken = getSessionToken();
      const numericIds = wishlist.map(id => {
        if (typeof id === 'number') return id;
        const found = products.find(p => p.id === id);
        return found?.dbId || 1;
      });
      businessApi.syncStorefrontWishlist({
        session_token: sessionToken,
        product_ids: numericIds
      }).catch(() => {
        // silent telemetry fallback
      });
    }, 800);
    return () => clearTimeout(timer);
  }, [wishlist, products]);

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
      products,
      categories: categories || DEFAULT_CATEGORIES,
      isLive,
      productsLoading,
      refetchProducts,
      cart,
      wishlist,
      activeCategory,
      setActiveCategory,
      isCatalogView,
      setIsCatalogView,
      navigateToHome,
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
      addToast,
      siteContent,
      siteContentLoading,
      isSiteContentLive,
      refetchSiteContent,
      updateSiteContent
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  return useContext(ShopContext);
}
