import React, { useState } from 'react';
import { Crown, ArrowRight, Award, Sparkles, CheckCircle, Tag } from 'lucide-react';
import { HardwareSVG } from './graphics/HardwareIllustrations.jsx';
import { useShop } from '../context/ShopContext.jsx';

export function PromoBanner() {
  const { setActiveCategory } = useShop();
  const [sheenPos, setSheenPos] = useState({ x: 0, y: 0 });

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
            <div className="promo-content">
              <div className="promo-badge">
                <Crown size={14} />
                <span>ARCHITECTURAL EXCELLENCE</span>
              </div>

              <h2 className="promo-title">
                The Matte Black <br />
                <span className="highlight-orange">Heritage Collection</span>
              </h2>

              <p className="promo-description">
                Transform residential and commercial doors with precision-milled solid zinc handles, anti-corrosion finishes, and Japanese magnetic latch technology.
              </p>

              <div className="promo-features">
                <div className="promo-feature-item">
                  <CheckCircle size={16} />
                  <span>10-Year Mechanical Warranty</span>
                </div>
                <div className="promo-feature-item">
                  <Award size={16} />
                  <span>Grade 304 Stainless Steel Core</span>
                </div>
                <div className="promo-feature-item">
                  <Sparkles size={16} />
                  <span>Zero-Fingerprint PVD Coating</span>
                </div>
              </div>

              <div className="promo-actions">
                <button 
                  onClick={() => setActiveCategory('door-hardware')} 
                  className="btn-primary"
                >
                  <span>Explore Collection</span>
                  <ArrowRight size={18} />
                </button>
                <div className="promo-limited-tag">
                  <Tag size={14} />
                  <span>Trade Pricing Available</span>
                </div>
              </div>
            </div>

            <div className="promo-visual">
              <div className="promo-visual-glow"></div>
              <div className="promo-image-wrapper">
                <HardwareSVG type="door-hardware" width={300} height={300} className="promo-canvas-art" />
              </div>
              <div className="promo-spec-chip chip-top">
                <span className="chip-dot"></span>
                <span>PVD Matte Black</span>
              </div>
              <div className="promo-spec-chip chip-bottom">
                <span className="chip-dot"></span>
                <span>Japanese Magnetic Latch</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
