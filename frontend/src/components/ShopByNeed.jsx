import React from 'react';
import { Compass, ArrowRight, DoorOpen, Home, Box, ShieldCheck, Building2 } from 'lucide-react';
import { SHOP_BY_NEEDS } from '../data/products.js';
import { useShop } from '../context/ShopContext.jsx';

export { PromoBanner } from './PromoBanner.jsx';

const iconMap = {
  'door-closed': DoorOpen,
  'home': Home,
  'box': Box,
  'shield-check': ShieldCheck,
  'building-2': Building2
};

export function ShopByNeed() {
  const { setActiveCategory, siteContent } = useShop();
  const needData = siteContent?.shop_by_need || {};
  const items = Array.isArray(needData.items) && needData.items.length > 0
    ? needData.items
    : (Array.isArray(needData) && needData.length > 0 ? needData : SHOP_BY_NEEDS);

  return (
    <section className="section shop-by-need-section" id="shop-by-need">
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><Compass size={14} /> {needData.badge || 'Project Guidance'}</span>
            <h2 className="section-title">{needData.title || 'What Are You Working On?'}</h2>
            <p className="section-subtitle">{needData.subtitle || 'Find the right hardware tailored for your exact project type.'}</p>
          </div>
        </div>

        <div className="need-cards-grid">
          {items.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Compass;
            return (
              <div 
                key={item.id || idx} 
                className="need-card" 
                style={{ transitionDelay: `${idx * 80}ms`, cursor: 'pointer' }}
                onClick={() => setActiveCategory(item.category_target || 'all')}
              >
                <div className="need-icon-wrapper">
                  <IconComponent size={28} />
                </div>
                
                <div className="need-title">{item.title}</div>
                <div className="need-subtitle">{item.subtitle}</div>
                <p className="need-desc">{item.description}</p>
                
                <div className="need-action-link">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
