import React from 'react';
import { Layers, ArrowRight, ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { CATEGORIES } from '../data/products.js';
import { HardwareSVG } from './graphics/HardwareIllustrations.jsx';
import { useShop } from '../context/ShopContext.jsx';
import { useRotaryCarousel } from '../hooks/useRotaryCarousel.js';

export function Categories() {
  const { setActiveCategory } = useShop();

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
    itemsLength: CATEGORIES.length,
    basePixelsPerSecond: 80,
    stepDistance: 230
  });

  // Tripled dataset to create an unbreakable, seamless 360° rotating disk loop
  const displayCategories = [...CATEGORIES, ...CATEGORIES, ...CATEGORIES];

  const getCategorySvgType = (cat) => {
    switch (cat.id) {
      case 'door-hardware': return 'door_hardware';
      case 'handles': return 'handle_lever_gold';
      case 'locks-security': return 'smart_lock';
      case 'hinges': return 'hinge_hydraulic';
      case 'cabinet-hardware': return 'drawer_slide';
      case 'bathroom-fittings': return 'padlock_brass';
      case 'tools-accessories': return 'tower_bolt';
      default: return cat.type || cat.id;
    }
  };

  return (
    <section className="section" id="categories">
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge">
              <Layers size={14} /> 360° Category Showcase
            </span>
            <h2 className="section-title">Explore Top Categories</h2>
            <p className="section-subtitle">
              Precision engineered architectural hardware for every residential and commercial space.
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
              <span>View All Categories</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div 
          className={`carousel-container-relative ${isMouseDown ? 'is-dragging' : ''}`}
          {...containerProps}
        >
          {/* Visual Cylindrical Horizon Edge Fade Masks */}
          <div className="carousel-edge-fade edge-left" />
          <div className="carousel-edge-fade edge-right" />

          <div 
            className="product-carousel-track" 
            ref={trackRef}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            role="region"
            aria-label="Infinite rotating categories showcase"
          >
            {displayCategories.map((cat, idx) => (
              <div 
                key={`${cat.id}-rotary-${idx}`} 
                className="carousel-category-wrap"
              >
                <div 
                  className="category-card"
                  onClick={() => setActiveCategory(cat.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveCategory(cat.id);
                    }
                  }}
                >
                  <div className="category-image-wrap">
                    <HardwareSVG type={getCategorySvgType(cat)} width={100} height={100} className="category-canvas-icon" />
                  </div>
                  <div className="category-meta">
                    <h3 className="category-title">{cat.name}</h3>
                    <span className="category-count">{cat.count}</span>
                  </div>
                </div>
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
                ? 'Category rotation paused • Click Play to spin' 
                : isHovered 
                  ? 'Holding position • Hover away to resume rotation' 
                  : `Infinite 360° Rotating Categories (${speedMultiplier}x speed) • Drag or hover to inspect`}
            </span>
          </div>

          <div className="carousel-hint-text">
            <span>Drag or use arrows to spin ({CATEGORIES.length} categories)</span>
          </div>
        </div>
      </div>
    </section>
  );
}
