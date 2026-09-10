import React, { useState, useEffect } from 'react';
import { Shield, ArrowRight, Compass } from 'lucide-react';
import { HardwareSVG } from './graphics/HardwareIllustrations';

export function Hero() {
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth < 768) return;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      setOffset({
        x: (e.clientX - centerX) / 35,
        y: (e.clientY - centerY) / 35
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <section className="hero-section" id="hero">
      <div className="hero-ambient-glow"></div>
      
      <div className="container hero-grid">
        <div className="hero-content">
          <div className="hero-badge hero-stagger-1">
            <Shield size={14} /> PREMIUM ARCHITECTURAL HARDWARE SHOWROOM
          </div>
          
          <h1 className="hero-title hero-stagger-2">
            Stronger <span className="highlight-orange">Spaces.</span>
          </h1>
          
          <p className="hero-description hero-stagger-3">
            Discover premium hardware designed for modern homes, offices and professional projects. Engineered for durability, security, and timeless elegance.
          </p>
          
          <div className="hero-cta-group hero-stagger-4">
            <a href="#door-hardware" className="btn-primary">
              Shop Door Hardware
              <ArrowRight className="btn-icon-arrow" size={18} />
            </a>
            
            <a href="#bestsellers" className="btn-secondary">
              <Compass size={18} />
              Explore All Products
            </a>
          </div>
        </div>

        <div className="hero-visual-stage" id="hero-parallax-stage">
          <div className="hero-visual-backdrop"></div>
          
          <div className="floating-hardware-container">
            <div 
              className="floating-hardware-item floating-smart-lock" 
              style={{ transform: `translate3d(${offset.x * 1.6}px, ${offset.y * 1.6}px, 0)` }}
            >
              <HardwareSVG type="smart_lock" width={220} height={240} />
            </div>

            <div 
              className="floating-hardware-item floating-door-handle" 
              style={{ transform: `translate3d(${offset.x * 2.8}px, ${offset.y * 2.8}px, 0)` }}
            >
              <HardwareSVG type="handle_lever_gold" width={240} height={250} />
            </div>

            <div 
              className="floating-hardware-item floating-hinge" 
              style={{ transform: `translate3d(${offset.x * 1.0}px, ${offset.y * 1.0}px, 0)` }}
            >
              <HardwareSVG type="hinge_hydraulic" width={180} height={190} />
            </div>

            <div 
              className="floating-hardware-item floating-padlock" 
              style={{ transform: `translate3d(${offset.x * 2.2}px, ${offset.y * 2.2}px, 0)` }}
            >
              <HardwareSVG type="padlock_brass" width={160} height={170} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
