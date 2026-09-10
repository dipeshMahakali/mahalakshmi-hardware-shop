import React from 'react';
import { ShieldCheck, Truck, Lock, Headphones } from 'lucide-react';

export { Categories } from './Categories.jsx';

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
