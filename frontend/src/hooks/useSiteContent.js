import { useState, useEffect, useCallback } from 'react';
import { businessApi } from '../api/businessApi.js';

export const DEFAULT_SITE_CONTENT = {
  hero: {
    badge: 'PREMIUM ARCHITECTURAL HARDWARE SHOWROOM',
    title_main: 'Stronger',
    title_highlight: 'Spaces.',
    description: 'Discover premium hardware designed for modern homes, offices and professional projects. Engineered for durability, security, and timeless elegance.',
    primary_cta_text: 'Shop Door Hardware',
    primary_cta_link: '#door-hardware',
    secondary_cta_text: 'Explore All Products',
    secondary_cta_link: '#bestsellers'
  },
  trust_features: [
    { id: 'trust-1', icon: 'shield-check', title: 'Genuine Products', desc: '100% authentic & quality assured' },
    { id: 'trust-2', icon: 'truck', title: 'Fast Delivery', desc: 'Safe & reliable doorstep delivery' },
    { id: 'trust-3', icon: 'lock', title: 'Secure Payments', desc: 'Safe 256-bit encrypted checkout' },
    { id: 'trust-4', icon: 'headphones', title: 'Expert Support', desc: 'Help choosing the right hardware' }
  ],
  categories_header: {
    badge: '360° Category Showcase',
    title: 'Explore Top Categories',
    subtitle: 'Precision engineered architectural hardware for every residential and commercial space.'
  },
  bestsellers_header: {
    badge: 'Customer Favorites',
    title: 'Most Loved Hardware Essentials',
    subtitle: 'Popular architectural hardware selected by homeowners and design professionals.'
  },
  recommended_header: {
    badge: '360° Curated Rotation',
    title: 'Recommended Hardware',
    subtitle: 'Continuous showcase of high-precision architectural fittings chosen by interior architects and master craftsmen.'
  },
  shop_by_need: {
    badge: 'Project Guidance',
    title: 'What Are You Working On?',
    subtitle: 'Find the right hardware tailored for your exact project type.',
    items: [
      {
        id: 'need-1',
        title: 'Building a New Door',
        subtitle: 'Locks, handles & hinges',
        description: 'Complete entry door hardware sets engineered for strength, safety, and modern architectural aesthetics.',
        icon: 'door-closed',
        category_target: 'door-hardware'
      },
      {
        id: 'need-2',
        title: 'Home Renovation',
        subtitle: 'Upgrade your spaces',
        description: 'Transform interior doors, kitchen cabinets, and wardrobes with premium metallic accents and smooth fittings.',
        icon: 'home',
        category_target: 'all'
      },
      {
        id: 'need-3',
        title: 'Setting Up Cabinets',
        subtitle: 'Fittings & accessories',
        description: 'Heavy duty drawer slides, soft-close hinges, and stylish cabinet knobs designed for effortless everyday use.',
        icon: 'archive',
        category_target: 'cabinet-hardware'
      },
      {
        id: 'need-4',
        title: 'Improving Security',
        subtitle: 'Smart locks & security',
        description: 'Upgrade to keyless biometric entry, hardened steel deadbolts, and heavy duty rim security systems.',
        icon: 'shield-check',
        category_target: 'locks-security'
      },
      {
        id: 'need-5',
        title: 'Commercial Project',
        subtitle: 'Bulk & professional hardware',
        description: 'Fire-rated panic hardware, heavy traffic door closers, and high volume project solutions with trade pricing.',
        icon: 'building-2',
        category_target: 'all'
      }
    ]
  },
  promo_banner: {
    badge: 'ARCHITECTURAL EXCELLENCE',
    title_main: 'The Matte Black',
    title_highlight: 'Heritage Collection',
    description: 'Transform residential and commercial doors with precision-milled solid zinc handles, anti-corrosion finishes, and Japanese magnetic latch technology.',
    feature_1: '10-Year Mechanical Warranty',
    feature_2: 'Grade 304 Stainless Steel Core',
    feature_3: 'Zero-Fingerprint PVD Coating',
    cta_text: 'Explore Collection',
    cta_link: 'door-hardware',
    limited_tag: 'Trade Pricing Available',
    chip_top: 'PVD Matte Black',
    chip_bottom: 'Japanese Magnetic Latch'
  },
  business_services: [
    { id: 'serv-1', icon: 'file-text', title: 'Request a Quote', desc: 'Get better custom pricing for bulk requirements & project estimates.', action: 'quote' },
    { id: 'serv-2', icon: 'users', title: 'Become a Dealer', desc: 'Join our authorized dealer network and grow your hardware business.', action: 'quote' },
    { id: 'serv-3', icon: 'layers', title: 'Bulk Orders', desc: 'Dedicated commercial project solutions with wholesale trade terms.', action: 'quote' },
    { id: 'serv-4', icon: 'headphones', title: 'Expert Support', desc: "We're here to help you choose the exact hardware specifications.", action: 'support' }
  ],
  why_choose_us: {
    badge: 'Our Commitment',
    title: 'Why Choose Shri Mahalakshmi Trader?',
    subtitle: 'Delivering exceptional quality, technical precision, and reliable customer service in Bagbahara & surrounding regions.',
    items: [
      { id: 'why-1', icon: 'shield-check', title: 'Quality First', desc: 'Carefully selected hardware products manufactured to rigorous EN & IS standards.' },
      { id: 'why-2', icon: 'clock', title: 'Reliable Service', desc: 'Prompt order processing, dedicated logistics, and dependable project deliveries.' },
      { id: 'why-3', icon: 'grid', title: 'Broad Selection', desc: 'Over 5,000+ premium architectural fittings, drawer systems, and commercial hardware.' },
      { id: 'why-4', icon: 'trending-up', title: 'Trade Benefits', desc: 'Exclusive wholesale pricing and digital khata management for architects & contractors.' }
    ]
  },
  footer: {
    about_text: 'Shri Mahalakshmi Trader is your trusted destination for premium architectural hardware, fittings, door security, and cabinet accessories in Bagbahara. Built for durability and engineered for modern spaces.',
    phone: '+91 95261 62225',
    email: 'contact@shrimahalakshmitrader.com',
    address: 'Near Bharat Petrol Pump, Bagbahara, Chhattisgarh - 493449',
    hours: 'Mon - Sat: 9:00 AM - 8:00 PM',
    gstin: '22AAACH7409R1ZZ',
    copyright: '© 2026 Shri Mahalakshmi Trader. All rights reserved.',
    top_bar_message_1: 'Fast & Reliable Delivery in Bagbahara',
    top_bar_message_2: '100% Genuine Quality Hardware',
    top_bar_message_3: 'Trusted Hardware Professionals',
    top_bar_message_4: 'Expert Support: +91 95261 62225'
  }
};

export function normalizeSiteContent(raw) {
  if (!raw || typeof raw !== 'object') return DEFAULT_SITE_CONTENT;

  // 1. Trust features: always normalize to an Array of items
  let rawTrust = raw.trust_features;
  let trustItems = [];
  if (Array.isArray(rawTrust)) {
    trustItems = rawTrust;
  } else if (Array.isArray(rawTrust?.features)) {
    trustItems = rawTrust.features;
  } else if (Array.isArray(rawTrust?.items)) {
    trustItems = rawTrust.items;
  } else {
    trustItems = DEFAULT_SITE_CONTENT.trust_features;
  }
  const normalizedTrust = trustItems.map((item, idx) => ({
    id: item.id || `trust-${idx + 1}`,
    title: item.title || '',
    desc: item.desc || item.description || '',
    icon: item.icon || 'shield-check'
  }));

  // 2. Business services: always normalize to an Array of items
  let rawServices = raw.business_services;
  let serviceItems = [];
  if (Array.isArray(rawServices)) {
    serviceItems = rawServices;
  } else if (Array.isArray(rawServices?.items)) {
    serviceItems = rawServices.items;
  } else if (Array.isArray(rawServices?.services)) {
    serviceItems = rawServices.services;
  } else {
    serviceItems = DEFAULT_SITE_CONTENT.business_services;
  }
  const normalizedServices = serviceItems.map((item, idx) => ({
    id: item.id || `serv-${idx + 1}`,
    title: item.title || '',
    desc: item.desc || item.description || '',
    icon: item.icon || 'file-text',
    action: item.action || (item.id === 'support' ? 'support' : 'quote')
  }));

  // 3. Shop by need: always normalize to { badge, title, subtitle, items: [...] }
  const rawNeed = raw.shop_by_need || {};
  let needItems = [];
  if (Array.isArray(rawNeed.items)) {
    needItems = rawNeed.items;
  } else if (Array.isArray(rawNeed)) {
    needItems = rawNeed;
  } else {
    needItems = DEFAULT_SITE_CONTENT.shop_by_need.items;
  }
  const normalizedNeed = {
    badge: rawNeed.badge || DEFAULT_SITE_CONTENT.shop_by_need.badge,
    title: rawNeed.title || DEFAULT_SITE_CONTENT.shop_by_need.title,
    subtitle: rawNeed.subtitle || DEFAULT_SITE_CONTENT.shop_by_need.subtitle,
    items: needItems.map((item, idx) => ({
      id: item.id || `need-${idx + 1}`,
      title: item.title || '',
      subtitle: item.subtitle || '',
      description: item.description || item.desc || '',
      icon: item.icon || 'door-closed',
      category_target: item.category_target || item.category || 'door-hardware'
    }))
  };

  // 4. Why choose us: always normalize to { badge, title, subtitle, items: [...] }
  const rawWhy = raw.why_choose_us || {};
  let whyItems = [];
  if (Array.isArray(rawWhy.items)) {
    whyItems = rawWhy.items;
  } else if (Array.isArray(rawWhy)) {
    whyItems = rawWhy;
  } else {
    whyItems = DEFAULT_SITE_CONTENT.why_choose_us.items;
  }
  const normalizedWhy = {
    badge: rawWhy.badge || DEFAULT_SITE_CONTENT.why_choose_us.badge,
    title: rawWhy.title || DEFAULT_SITE_CONTENT.why_choose_us.title,
    subtitle: rawWhy.subtitle || DEFAULT_SITE_CONTENT.why_choose_us.subtitle,
    items: whyItems.map((item, idx) => ({
      id: item.id || `why-${idx + 1}`,
      title: item.title || '',
      desc: item.desc || item.description || '',
      icon: item.icon || 'shield-check'
    }))
  };

  // 5. Hero
  const rawHero = raw.hero || {};
  const normalizedHero = {
    badge: rawHero.badge || DEFAULT_SITE_CONTENT.hero.badge,
    title_main: rawHero.title_main || rawHero.title || DEFAULT_SITE_CONTENT.hero.title_main,
    title_highlight: rawHero.title_highlight || rawHero.highlight || DEFAULT_SITE_CONTENT.hero.title_highlight,
    description: rawHero.description || DEFAULT_SITE_CONTENT.hero.description,
    primary_cta_text: rawHero.primary_cta_text || DEFAULT_SITE_CONTENT.hero.primary_cta_text,
    primary_cta_link: rawHero.primary_cta_link || DEFAULT_SITE_CONTENT.hero.primary_cta_link,
    secondary_cta_text: rawHero.secondary_cta_text || DEFAULT_SITE_CONTENT.hero.secondary_cta_text,
    secondary_cta_link: rawHero.secondary_cta_link || DEFAULT_SITE_CONTENT.hero.secondary_cta_link,
  };

  // 6. Promo Banner
  const rawPromo = raw.promo_banner || {};
  const promoFeatures = Array.isArray(rawPromo.features) ? rawPromo.features : [];
  const normalizedPromo = {
    badge: rawPromo.badge || DEFAULT_SITE_CONTENT.promo_banner.badge,
    title_main: rawPromo.title_main || rawPromo.title || DEFAULT_SITE_CONTENT.promo_banner.title_main,
    title_highlight: rawPromo.title_highlight || rawPromo.highlight || DEFAULT_SITE_CONTENT.promo_banner.title_highlight,
    description: rawPromo.description || DEFAULT_SITE_CONTENT.promo_banner.description,
    feature_1: rawPromo.feature_1 || promoFeatures[0] || DEFAULT_SITE_CONTENT.promo_banner.feature_1,
    feature_2: rawPromo.feature_2 || promoFeatures[1] || DEFAULT_SITE_CONTENT.promo_banner.feature_2,
    feature_3: rawPromo.feature_3 || promoFeatures[2] || DEFAULT_SITE_CONTENT.promo_banner.feature_3,
    cta_text: rawPromo.cta_text || DEFAULT_SITE_CONTENT.promo_banner.cta_text,
    cta_link: rawPromo.cta_link || rawPromo.cta_category || DEFAULT_SITE_CONTENT.promo_banner.cta_link,
    limited_tag: rawPromo.limited_tag || DEFAULT_SITE_CONTENT.promo_banner.limited_tag,
    chip_top: rawPromo.chip_top || DEFAULT_SITE_CONTENT.promo_banner.chip_top,
    chip_bottom: rawPromo.chip_bottom || DEFAULT_SITE_CONTENT.promo_banner.chip_bottom,
  };

  // 7. Footer & Header utility
  const rawFooter = raw.footer || {};
  const rawHeaderUtil = raw.header_utility || {};
  const normalizedFooter = {
    about_text: rawFooter.about_text || rawFooter.about || DEFAULT_SITE_CONTENT.footer.about_text,
    phone: rawFooter.phone || rawHeaderUtil.phone || DEFAULT_SITE_CONTENT.footer.phone,
    email: rawFooter.email || DEFAULT_SITE_CONTENT.footer.email,
    address: rawFooter.address || DEFAULT_SITE_CONTENT.footer.address,
    hours: rawFooter.hours || DEFAULT_SITE_CONTENT.footer.hours,
    gstin: rawFooter.gstin || DEFAULT_SITE_CONTENT.footer.gstin,
    copyright: rawFooter.copyright || DEFAULT_SITE_CONTENT.footer.copyright,
    top_bar_message_1: rawFooter.top_bar_message_1 || rawHeaderUtil.delivery_message || DEFAULT_SITE_CONTENT.footer.top_bar_message_1,
    top_bar_message_2: rawFooter.top_bar_message_2 || rawHeaderUtil.quality_message || DEFAULT_SITE_CONTENT.footer.top_bar_message_2,
    top_bar_message_3: rawFooter.top_bar_message_3 || rawHeaderUtil.trust_message || DEFAULT_SITE_CONTENT.footer.top_bar_message_3,
    top_bar_message_4: rawFooter.top_bar_message_4 || rawHeaderUtil.support_message || DEFAULT_SITE_CONTENT.footer.top_bar_message_4,
  };

  return {
    ...DEFAULT_SITE_CONTENT,
    ...raw,
    hero: normalizedHero,
    promo_banner: normalizedPromo,
    trust_features: normalizedTrust,
    shop_by_need: normalizedNeed,
    business_services: normalizedServices,
    why_choose_us: normalizedWhy,
    footer: normalizedFooter,
  };
}

export function useSiteContent() {
  const [content, setContent] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLive, setIsLive] = useState(false);

  const fetchContent = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const liveData = await businessApi.getStorefrontContent();
      if (liveData && typeof liveData === 'object' && Object.keys(liveData).length > 0) {
        setContent(normalizeSiteContent(liveData));
        setIsLive(true);
      }
    } catch (err) {
      console.warn('Storefront CMS API offline, using showroom defaults:', err.message);
      setIsLive(false);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSection = useCallback(async (token, sectionKey, newSectionData) => {
    // Optimistic UI update
    setContent(prev => ({
      ...prev,
      [sectionKey]: newSectionData
    }));

    try {
      await businessApi.updateStorefrontContent(token, sectionKey, newSectionData);
      return { success: true };
    } catch (err) {
      console.error(`Failed to persist ${sectionKey} to backend:`, err);
      // Re-fetch to sync
      await fetchContent();
      throw err;
    }
  }, [fetchContent]);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  return {
    content,
    loading,
    error,
    isLive,
    refetch: fetchContent,
    updateSection
  };
}

