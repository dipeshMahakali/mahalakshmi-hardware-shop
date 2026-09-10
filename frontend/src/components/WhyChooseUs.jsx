import React from 'react';
import { ShieldCheck, Clock, Grid, TrendingUp } from 'lucide-react';

export function WhyChooseUs() {
  return (
    <section className="section" id="why-us">
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><ShieldCheck size={14} /> Our Commitment</span>
            <h2 className="section-title">Why Choose Shree Mahalaxmi Hardware?</h2>
            <p className="section-subtitle">Delivering exceptional quality, technical precision, and reliable customer service.</p>
          </div>
        </div>

        <div className="why-us-grid">
          <div className="why-card">
            <div className="why-icon"><ShieldCheck size={26} /></div>
            <div className="why-title">Quality First</div>
            <div className="why-desc">Carefully selected hardware products manufactured to rigorous EN & IS standards.</div>
          </div>

          <div className="why-card">
            <div className="why-icon"><Clock size={26} /></div>
            <div className="why-title">Reliable Service</div>
            <div className="why-desc">Prompt order processing, dedicated logistics, and dependable project deliveries.</div>
          </div>

          <div className="why-card">
            <div className="why-icon"><Grid size={26} /></div>
            <div className="why-title">Broad Selection</div>
            <div className="why-desc">Over 500+ premium architectural fittings, drawer systems, and commercial hardware.</div>
          </div>

          <div className="why-card">
            <div className="why-icon"><TrendingUp size={26} /></div>
            <div className="why-title">Trade Benefits</div>
            <div className="why-desc">Exclusive wholesale pricing and digital khata management for architects & contractors.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
