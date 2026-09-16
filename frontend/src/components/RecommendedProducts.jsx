import React from 'react';
import { Sparkles, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { PRODUCTS } from '../data/products.js';
import { useProducts } from '../hooks/useProducts.js';
import { ProductCard } from './ProductCard.jsx';
import { useShop } from '../context/ShopContext.jsx';
import { useRotaryCarousel } from '../hooks/useRotaryCarousel.js';

export function RecommendedProducts() {
  const { setActiveCategory, products, siteContent } = useShop();
  const headerData = siteContent?.recommended_header || {};

  // Curate recommended items dynamically flagged from catalog
  const catalogSource = products && products.length > 0 ? products : PRODUCTS;
  const filteredRecommended = catalogSource.filter(p => p.is_recommended);
  const recommended = filteredRecommended.length >= 4 
    ? filteredRecommended 
    : (catalogSource.length >= 10 ? catalogSource.slice(6, 14) : catalogSource.slice(0, 8));

  // Tripled dataset to create an unbreakable, seamless 360° rotating disk loop
  const displayItems = [...recommended, ...recommended, ...recommended];

  const {
    trackRef,
    isPaused,
    setIsPaused,
    isHovered,
    isMouseDown,
    speedMultiplier,
    setSpeedMultiplier,
    rotateStep,
    handleKeyDown,
    containerProps
  } = useRotaryCarousel({
    itemsLength: recommended.length,
    basePixelsPerSecond: 90,
    stepDistance: 314
  });

  return (
    <section className="section recommended-section" id="recommended">
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge">
              <Sparkles size={14} /> {headerData.badge || '360° Curated Rotation'}
            </span>
            <h2 className="section-title">{headerData.title || 'Recommended Hardware'}</h2>
            <p className="section-subtitle">
              {headerData.subtitle || 'Continuous showcase of high-precision architectural fittings chosen by interior architects and master craftsmen.'}
            </p>
          </div>

          <div className="carousel-header-controls">
            <div className="carousel-nav-group">
              <button 
                onClick={() => rotateStep(-1)} 
                className="carousel-nav-pill" 
                aria-label="Rotate disk counter-clockwise"
                title="Rotate counter-clockwise"
              >
                <ChevronLeft size={18} />
              </button>

              <button 
                onClick={() => setIsPaused(prev => !prev)} 
                className={`carousel-nav-pill auto-scroll-toggle ${!isPaused && !isHovered ? 'is-playing' : ''}`}
                aria-label={isPaused ? "Resume rotating disk" : "Pause rotating disk"}
                title={isPaused ? "Resume rotation" : "Pause rotation"}
              >
                {isPaused ? <Play size={15} /> : <Pause size={15} />}
              </button>

              <button 
                onClick={() => setSpeedMultiplier(prev => prev === 1 ? 1.5 : prev === 1.5 ? 2 : 1)}
                className="carousel-nav-pill carousel-speed-pill"
                title={`Speed: ${speedMultiplier}x (click to change)`}
                aria-label="Toggle rotation speed"
              >
                <span>{speedMultiplier}x</span>
              </button>

              <button 
                onClick={() => rotateStep(1)} 
                className="carousel-nav-pill" 
                aria-label="Rotate disk clockwise"
                title="Rotate clockwise"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <button 
              onClick={() => setActiveCategory('all')} 
              className="section-link carousel-view-all-btn"
            >
              <span>View All</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div 
          className={`carousel-container-relative ${isMouseDown ? 'is-dragging' : ''}`}
          {...containerProps}
        >
          {/* Visual 3D Cylinder Edge Fade Masks */}
          <div className="carousel-edge-fade edge-left" />
          <div className="carousel-edge-fade edge-right" />

          <div 
            className="product-carousel-track" 
            ref={trackRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Infinite rotating disk hardware showcase"
          >
            {displayItems.map((product, idx) => (
              <div key={`${product.id}-rotary-${idx}`} className="carousel-card-wrap">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* Footer Rotating Disk Status & Hint */}
        <div className="carousel-footer-bar">
          <div className="carousel-disk-indicator">
            <span className={`disk-spinner ${!isPaused && !isHovered ? 'is-spinning' : ''}`} />
            <span>
              {isPaused 
                ? 'Disk rotation paused • Click Play to spin' 
                : isHovered 
                  ? 'Holding position • Hover away to resume rotation' 
                  : `Infinite 360° Rotating Showroom (${speedMultiplier}x speed) • Drag or hover to inspect`}
            </span>
          </div>

          <div className="carousel-hint-text">
            <span>Drag or use arrows to spin ({recommended.length} curated designs)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
