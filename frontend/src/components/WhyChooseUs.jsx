import React from 'react';
import { ShieldCheck, Clock, Grid, TrendingUp, Award, CheckCircle, HeartHandshake } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';

const iconMap = {
  'shield-check': ShieldCheck,
  'clock': Clock,
  'grid': Grid,
  'trending-up': TrendingUp,
  'award': Award,
  'check-circle': CheckCircle,
  'heart-handshake': HeartHandshake
};

const DEFAULT_ITEMS = [
  { id: 'why-1', icon: 'shield-check', title: 'Quality First', desc: 'Carefully selected hardware products manufactured to rigorous EN & IS standards.' },
  { id: 'why-2', icon: 'clock', title: 'Reliable Service', desc: 'Prompt order processing, dedicated logistics, and dependable project deliveries.' },
  { id: 'why-3', icon: 'grid', title: 'Broad Selection', desc: 'Over 500+ premium architectural fittings, drawer systems, and commercial hardware.' },
  { id: 'why-4', icon: 'trending-up', title: 'Trade Benefits', desc: 'Exclusive wholesale pricing and digital khata management for architects & contractors.' }
];

export function WhyChooseUs() {
  const { siteContent } = useShop();
  const whyData = siteContent?.why_choose_us || {};
  const items = Array.isArray(whyData.items) && whyData.items.length > 0
    ? whyData.items
    : (Array.isArray(whyData) && whyData.length > 0 ? whyData : DEFAULT_ITEMS);

  return (
    <section className="section" id="why-us">
      <div className="container">
        <div className="section-header">
          <div className="section-title-group">
            <span className="section-badge"><ShieldCheck size={14} /> {whyData.badge || 'Our Commitment'}</span>
            <h2 className="section-title">{whyData.title || 'Why Choose Shri Mahalakshmi Trader?'}</h2>
            <p className="section-subtitle">{whyData.subtitle || 'Delivering exceptional quality, technical precision, and reliable customer service.'}</p>
          </div>
        </div>

        <div className="why-us-grid">
          {items.map((item, idx) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.id || idx} className="why-card">
                <div className="why-icon"><Icon size={26} /></div>
                <div className="why-title">{item.title}</div>
                <div className="why-desc">{item.desc || item.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
