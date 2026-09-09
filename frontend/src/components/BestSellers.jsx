import React, { useRef } from 'react';
import { Flame, ArrowRight, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { PRODUCTS } from '../data/products.js';
import { ProductCard } from './ProductCard';

export function BestSellers() {
  const bestSellers = PRODUCTS.slice(0, 6);

  return (
    <section className="section" id="bestsellers">
      <div className="container">
        
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><Flame size={14} /> Customer Favorites</span>
            <h2 className="section-title">Most Loved Hardware Essentials</h2>
            <p className="section-subtitle">Popular hardware selected by homeowners and professionals.</p>
          </div>
          <a href="#all-products" className="section-link">View All Products <ArrowRight size={16} /></a>
        </div>

        <div className="products-grid">
          {bestSellers.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

      </div>
    </section>
  );
}

export function RecommendedProducts() {
  const recommended = PRODUCTS.slice(6, 12);
  const trackRef = useRef(null);

  const scrollLeft = () => {
    if (trackRef.current) trackRef.current.scrollBy({ left: -320, behavior: 'smooth' });
  };

  const scrollRight = () => {
    if (trackRef.current) trackRef.current.scrollBy({ left: 320, behavior: 'smooth' });
  };

  return (
    <section className="section" id="recommended">
      <div className="container">
        
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><ThumbsUp size={14} /> Curated For You</span>
            <h2 className="section-title">Products You May Like</h2>
            <p className="section-subtitle">Handpicked architectural hardware matching your project needs.</p>
          </div>
          <a href="#all-recommended" className="section-link">Explore More <ArrowRight size={16} /></a>
        </div>

        <div className="carousel-wrapper">
          <button className="carousel-nav-btn prev-btn" onClick={scrollLeft} aria-label="Previous Products">
            <ChevronLeft size={22} />
          </button>
          
          <div className="carousel-viewport" ref={trackRef}>
            {recommended.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <button className="carousel-nav-btn next-btn" onClick={scrollRight} aria-label="Next Products">
            <ChevronRight size={22} />
          </button>
        </div>

      </div>
    </section>
  );
}
