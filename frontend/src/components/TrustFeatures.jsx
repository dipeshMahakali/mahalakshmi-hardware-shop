import React from 'react';
import { ShieldCheck, Truck, Lock, Headphones, Award, Sparkles, CheckCircle } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export { Categories } from './Categories.jsx';

const iconMap = {
  'shield-check': ShieldCheck,
  'truck': Truck,
  'lock': Lock,
  'headphones': Headphones,
  'award': Award,
  'sparkles': Sparkles,
  'check-circle': CheckCircle
};

const DEFAULT_TRUST_ITEMS = [
  { id: 'trust-1', icon: 'shield-check', title: 'Genuine Products', desc: '100% authentic & quality assured' },
  { id: 'trust-2', icon: 'truck', title: 'Fast Delivery', desc: 'Safe & reliable doorstep delivery' },
  { id: 'trust-3', icon: 'lock', title: 'Secure Payments', desc: 'Safe 256-bit encrypted checkout' },
  { id: 'trust-4', icon: 'headphones', title: 'Expert Support', desc: 'Help choosing the right hardware' }
];

export function TrustFeatures() {
  const { siteContent } = useShop();
  const rawTrust = siteContent?.trust_features;
  const trustItems = (
    Array.isArray(rawTrust) && rawTrust.length > 0
      ? rawTrust
      : (Array.isArray(rawTrust?.features) && rawTrust.features.length > 0
        ? rawTrust.features
        : (Array.isArray(rawTrust?.items) && rawTrust.items.length > 0
          ? rawTrust.items
          : DEFAULT_TRUST_ITEMS))
  );

  return (
    <div className="trust-features-wrapper">
      <div className="container">
        <div className="trust-features-grid">
          {trustItems.map((item, idx) => {
            const Icon = iconMap[item.icon] || ShieldCheck;
            return (
              <div key={item.id || idx} className="trust-card">
                <div className="trust-icon-box">
                  <Icon size={24} />
                </div>
                <div>
                  <div className="trust-title">{item.title}</div>
                  <div className="trust-desc">{item.desc || item.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
