import React from 'react';
import { FileText, Users, Layers, Headphones, ShieldCheck, Clock, Grid, TrendingUp } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export function BusinessServices() {
  const { setIsQuoteModalOpen, setIsSupportOpen } = useShop();

  return (
    <section className="section business-services-section" id="business-services">
      <div className="container">
        
        <div className="services-grid">
          
          <div className="service-card" onClick={() => setIsQuoteModalOpen(true)}>
            <div className="service-icon"><FileText size={24} /></div>
            <div className="service-title">Request a Quote</div>
            <div className="service-desc">Get better custom pricing for bulk requirements & project estimates.</div>
          </div>

          <div className="service-card">
            <div className="service-icon"><Users size={24} /></div>
            <div className="service-title">Become a Dealer</div>
            <div className="service-desc">Join our authorized dealer network and grow your hardware business.</div>
          </div>

          <div className="service-card">
            <div className="service-icon"><Layers size={24} /></div>
            <div className="service-title">Bulk Orders</div>
            <div className="service-desc">Dedicated commercial project solutions with wholesale trade terms.</div>
          </div>

          <div className="service-card" onClick={() => setIsSupportOpen(true)}>
            <div className="service-icon"><Headphones size={24} /></div>
            <div className="service-title">Expert Support</div>
            <div className="service-desc">We're here to help you choose the exact hardware specifications.</div>
          </div>

        </div>

      </div>
    </section>
  );
}

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
            <div className="why-desc">Professional customer support, quick quote turnarounds, and fast dispatch times.</div>
          </div>

          <div className="why-card">
            <div className="why-icon"><Grid size={26} /></div>
            <div className="why-title">Wide Selection</div>
            <div className="why-desc">Comprehensive solutions for modern homes, corporate offices, and commercial projects.</div>
          </div>

          <div className="why-card">
            <div className="why-icon"><TrendingUp size={26} /></div>
            <div className="why-title">Value for Money</div>
            <div className="why-desc">Premium architectural hardware quality at competitive direct-to-customer pricing.</div>
          </div>

        </div>

      </div>
    </section>
  );
}
