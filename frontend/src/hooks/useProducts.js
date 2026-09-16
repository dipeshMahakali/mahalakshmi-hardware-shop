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
      const [categoriesRes, productsRes] = await Promise.allSettled([
        businessApi.categories(),
        businessApi.products()
      ]);

      // Process live categories
      if (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value) && categoriesRes.value.length > 0) {
        const mappedCategories = categoriesRes.value
          .filter(c => c.is_active !== false)
          .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
          .map(cat => ({
            id: cat.slug || cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            dbId: cat.id,
            name: cat.name,
            count: cat.product_count_label || 'Products',
            icon: cat.icon || 'layers',
            tagline: cat.tagline || '',
            description: cat.description || '',
            displayOrder: cat.display_order ?? 0,
            isActive: cat.is_active ?? true,
            isFeatured: cat.is_featured_landing ?? true,
            type: cat.slug || 'door-hardware'
          }));
        setCategories(mappedCategories);
      }

      // Process live products
      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value) && productsRes.value.length > 0) {
        const liveData = productsRes.value;
        const mappedLiveProducts = liveData.map((p, idx) => {
          const resolvedCategoryId = (
            p.category_id
              ? p.category_id.toLowerCase().replace(/[^a-z0-9]+/g, '-')
              : (p.category ? p.category.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'general-hardware')
          );

          return {
            id: p.id || `live-${idx}`,
            dbId: p.id,
            name: p.name,
            category: p.category || 'General Hardware',
            category_id: p.category_id || resolvedCategoryId,
            categoryId: resolvedCategoryId,
            subtitle: p.subtitle || `${p.brand || 'Premium'} • SKU: ${p.sku}`,
            price: Number(p.selling_price) || 0,
            originalPrice: p.original_price != null ? Number(p.original_price) : (p.selling_price ? Math.round(Number(p.selling_price) * 1.25) : null),
            discountPercentage: p.discount_percentage != null ? p.discount_percentage : (p.original_price && p.selling_price ? Math.max(0, Math.round(((Number(p.original_price) - Number(p.selling_price)) / Number(p.original_price)) * 100)) : 0),
            rating: Number(p.rating) || 4.8,
            reviewCount: p.review_count || (24 + (idx * 7) % 50),
            badge: p.badge || (p.is_bestseller ? 'BESTSELLER' : p.tax_rate > 0 ? `GST ${p.tax_rate}%` : 'IN STOCK'),
            badgeType: p.badge_type || (p.is_bestseller ? 'bestseller' : 'default'),
            inStock: (p.stock_quantity ?? 1) > 0,
            stockQuantity: p.stock_quantity ?? 0,
            sku: p.sku,
            brand: p.brand || '',
            material: p.material || p.brand || 'Architectural Grade',
            finish: p.finish || 'Standard Commercial',
            warranty: p.warranty || 'Standard Manufacturer Warranty',
            description: p.description || `${p.name} - high precision architectural grade hardware.`,
            image_url: p.image_url || null,
            type: p.illustration_type || inferHardwareType(p.name, p.category),
            is_bestseller: Boolean(p.is_bestseller),
            is_recommended: Boolean(p.is_recommended),
            display_order: p.display_order ?? idx,
            is_active: p.is_active ?? true,
            isLiveDb: true
          };
        }).sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0));

        // Merge with fallback products only for items not present in live db (deduplicate by id, sku, name)
        const liveIdSet = new Set(mappedLiveProducts.map(p => String(p.id)));
        const liveSkuSet = new Set(mappedLiveProducts.map(p => String(p.sku || '')).filter(Boolean));
        const liveNameSet = new Set(mappedLiveProducts.map(p => p.name.toLowerCase().trim()));
        const uniqueFallback = FALLBACK_PRODUCTS.filter(p =>
          !liveIdSet.has(String(p.id)) &&
          !liveSkuSet.has(String(p.sku || '')) &&
          !liveNameSet.has(p.name.toLowerCase().trim())
        );
        const merged = [...mappedLiveProducts, ...uniqueFallback];

        setProducts(merged);
        setIsLive(true);
      } else if (productsRes.status === 'rejected') {
        console.warn('Live products API request rejected:', productsRes.reason);
      }
    } catch (err) {
      console.warn('Backend API offline or unreachable, using curated catalog fallback:', err.message);
      setProducts(FALLBACK_PRODUCTS);
      setCategories(FALLBACK_CATEGORIES);
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

