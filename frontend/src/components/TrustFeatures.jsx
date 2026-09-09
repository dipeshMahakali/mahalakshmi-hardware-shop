import React from 'react';
import { ShieldCheck, Truck, Lock, Headphones, Layers, ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../data/products.js';
import { HardwareSVG } from '../utils/HardwareCanvas';

export function TrustFeatures() {
  return (
    <div className="trust-features-wrapper">
      <div className="container">
        <div className="trust-features-grid">
          
          <div className="trust-card">
            <div className="trust-icon-box"><ShieldCheck size={24} /></div>
            <div>
              <div className="trust-title">Genuine Products</div>
              <div className="trust-desc">100% authentic & quality assured</div>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box"><Truck size={24} /></div>
            <div>
              <div className="trust-title">Fast Delivery</div>
              <div className="trust-desc">Safe & reliable doorstep delivery</div>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box"><Lock size={24} /></div>
            <div>
              <div className="trust-title">Secure Payments</div>
              <div className="trust-desc">Safe 256-bit encrypted checkout</div>
            </div>
          </div>

          <div className="trust-card">
            <div className="trust-icon-box"><Headphones size={24} /></div>
            <div>
              <div className="trust-title">Expert Support</div>
              <div className="trust-desc">Help choosing the right hardware</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export function Categories() {
  return (
    <section className="section" id="categories">
      <div className="container">
        
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><Layers size={14} /> Shop By Category</span>
            <h2 className="section-title">Explore Top Categories</h2>
            <p className="section-subtitle">Find the right hardware for every space.</p>
          </div>
          <a href="#all-categories" className="section-link">View All Categories <ArrowRight size={16} /></a>
        </div>

        <div className="categories-grid">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="category-card" data-category-id={cat.id}>
              <div className="category-image-wrapper">
                <HardwareSVG type={cat.type} width={110} height={110} />
              </div>
              <div className="category-name">{cat.name}</div>
              <div className="category-count">{cat.count}</div>
              <div className="category-action-link">
                <span>Explore</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
