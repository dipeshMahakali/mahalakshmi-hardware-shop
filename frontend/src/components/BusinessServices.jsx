import React from 'react';
import { FileText, Users, Layers, Headphones } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';

export { WhyChooseUs } from './WhyChooseUs.jsx';

export function BusinessServices() {
  const { setIsQuoteModalOpen, setIsSupportOpen } = useShop();

  return (
    <section className="section business-services-section" id="business-services">
      <div className="container">
        <div className="services-grid">
          <div className="service-card" onClick={() => setIsQuoteModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="service-icon"><FileText size={24} /></div>
            <div className="service-title">Request a Quote</div>
            <div className="service-desc">Get better custom pricing for bulk requirements & project estimates.</div>
          </div>

          <div className="service-card" onClick={() => setIsQuoteModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="service-icon"><Users size={24} /></div>
            <div className="service-title">Become a Dealer</div>
            <div className="service-desc">Join our authorized dealer network and grow your hardware business.</div>
          </div>

          <div className="service-card" onClick={() => setIsQuoteModalOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="service-icon"><Layers size={24} /></div>
            <div className="service-title">Bulk Orders</div>
            <div className="service-desc">Dedicated commercial project solutions with wholesale trade terms.</div>
          </div>

          <div className="service-card" onClick={() => setIsSupportOpen(true)} style={{ cursor: 'pointer' }}>
            <div className="service-icon"><Headphones size={24} /></div>
            <div className="service-title">Expert Support</div>
            <div className="service-desc">We're here to help you choose the exact hardware specifications.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
