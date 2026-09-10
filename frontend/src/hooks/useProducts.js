import { useState, useEffect, useCallback } from 'react';
import { PRODUCTS as FALLBACK_PRODUCTS, CATEGORIES as FALLBACK_CATEGORIES } from '../data/products.js';
import { businessApi } from '../api/businessApi.js';

function inferHardwareType(name = '', category = '') {
  const text = `${name} ${category}`.toLowerCase();
  if (text.includes('smart') || text.includes('digital lock')) return 'smart_lock';
  if (text.includes('handle') || text.includes('mortise')) return 'handle_lever';
  if (text.includes('hinge')) return 'hinge_hydraulic';
  if (text.includes('slide') || text.includes('channel') || text.includes('drawer')) return 'drawer_slide';
  if (text.includes('padlock')) return 'padlock_brass';
  if (text.includes('closer')) return 'door_closer';
  if (text.includes('knob')) return 'cabinet_knob';
  if (text.includes('stopper')) return 'door_stopper';
  if (text.includes('bolt') || text.includes('tower')) return 'tower_bolt';
  return 'handle_lever';
}

export function useProducts() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const fetchCatalog = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const liveData = await businessApi.products();
      if (Array.isArray(liveData) && liveData.length > 0) {
        // Map backend products to rich storefront model
        const mappedLiveProducts = liveData.map((p, idx) => ({
          id: p.id || `live-${idx}`,
          name: p.name,
          category: p.category || 'General Hardware',
          categoryId: (p.category || 'door-hardware').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          subtitle: `${p.brand || 'Premium'} • SKU: ${p.sku}`,
          price: Number(p.selling_price) || 0,
          originalPrice: p.selling_price ? Math.round(Number(p.selling_price) * 1.25) : null,
          discountPercentage: 20,
          rating: 4.8,
          reviewCount: 24 + (idx * 7) % 50,
          badge: p.tax_rate > 0 ? `GST ${p.tax_rate}%` : 'IN STOCK',
          badgeType: 'bestseller',
          inStock: true,
          sku: p.sku,
          material: p.brand || 'Architectural Grade',
          finish: 'Standard Commercial',
          warranty: 'Standard Manufacturer Warranty',
          description: p.description || `${p.name} - high precision architectural grade hardware.`,
          image_url: p.image_url || null,
          type: inferHardwareType(p.name, p.category),
          isLiveDb: true
        }));

        // Merge live products with catalog so full showroom remains intact
        const liveSkuSet = new Set(mappedLiveProducts.map(p => p.sku));
        const merged = [
          ...mappedLiveProducts,
          ...FALLBACK_PRODUCTS.filter(p => !liveSkuSet.has(p.sku))
        ];

        setProducts(merged);
        setIsLive(true);
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable, using curated catalog fallback:', err.message);
      setProducts(FALLBACK_PRODUCTS);
      setIsLive(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    products,
    categories,
    loading,
    error,
    isLive,
    refetch: fetchCatalog
  };
}

