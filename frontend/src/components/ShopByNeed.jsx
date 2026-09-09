import React, { useState } from 'react';
import { Compass, ArrowRight, Crown, Award, Sparkles, CheckCircle, Tag, DoorOpen, Home, Box, ShieldCheck, Building2 } from 'lucide-react';
import { SHOP_BY_NEEDS } from '../data/products.js';
import { HardwareSVG } from '../utils/HardwareCanvas';

const iconMap = {
  'door-closed': DoorOpen,
  'home': Home,
  'box': Box,
  'shield-check': ShieldCheck,
  'building-2': Building2
};

export function ShopByNeed() {
  return (
    <section className="section shop-by-need-section" id="shop-by-need">
      <div className="container">
        
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><Compass size={14} /> Project Guidance</span>
            <h2 className="section-title">What Are You Working On?</h2>
            <p className="section-subtitle">Find the right hardware tailored for your exact project type.</p>
          </div>
        </div>

        <div className="need-cards-grid">
          {SHOP_BY_NEEDS.map((item, idx) => {
            const IconComponent = iconMap[item.icon] || Compass;
            return (
              <div key={item.id} className="need-card" style={{ transitionDelay: `${idx * 80}ms` }}>
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

export function PromoBanner() {
  const [sheenPos, setSheenPos] = useState({ x: -500, y: -500 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setSheenPos({
      x: e.clientX - rect.left - rect.width,
      y: e.clientY - rect.top - rect.height
    });
  };

  return (
    <section className="promo-banner-section" id="promo-collection">
      <div className="container">
        
        <div className="promo-banner-container" onMouseMove={handleMouseMove}>
          <div 
            className="promo-light-sheen" 
            style={{ transform: `translate(${sheenPos.x}px, ${sheenPos.y}px)` }}
          ></div>
          
          <div className="promo-banner-grid">
            <div>
              <span className="promo-tag"><Crown size={14} /> EXCLUSIVE SHOWROOM COLLECTION</span>
              <h2 className="promo-title">
                Premium Hardware.<br/>
                Premium Experience.
              </h2>
              <p className="promo-description">
                Upgrade your space with carefully selected hardware designed for strength, style and everyday performance. Crafted with precision metallurgy and timeless aesthetics.
              </p>
              
              <a href="#bestsellers" className="btn-primary">
                Explore Premium Collection
                <ArrowRight className="btn-icon-arrow" size={18} />
              </a>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', height: '280px' }}>
              <div style={{ transform: 'scale(1.1)', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))' }}>
                <HardwareSVG type="smart_lock" width={240} height={260} />
              </div>
            </div>
          </div>

          <div className="promo-features-row">
            <div className="promo-feature-item">
              <span className="promo-feature-title"><Award size={14} style={{ color: 'var(--color-accent)' }} /> Premium Quality</span>
              <span className="promo-feature-desc">Built to last a lifetime</span>
            </div>
            <div className="promo-feature-item">
              <span className="promo-feature-title"><Sparkles size={14} style={{ color: 'var(--color-accent)' }} /> Modern Designs</span>
              <span className="promo-feature-desc">Stylish & functional finishes</span>
            </div>
            <div className="promo-feature-item">
              <span className="promo-feature-title"><CheckCircle size={14} style={{ color: 'var(--color-accent)' }} /> Quality Inspected</span>
              <span className="promo-feature-desc">Tested to EN standards</span>
            </div>
            <div className="promo-feature-item">
              <span className="promo-feature-title"><Tag size={14} style={{ color: 'var(--color-accent)' }} /> Best Value</span>
              <span className="promo-feature-desc">Competitive trade pricing</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
