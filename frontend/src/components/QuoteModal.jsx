import React from 'react';
import { X, Send } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';

export function QuoteModal() {
  const { isQuoteModalOpen, setIsQuoteModalOpen, addToast } = useShop();

  if (!isQuoteModalOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsQuoteModalOpen(false);
    addToast('Quote request submitted! Our specialist will call you shortly.', 'send');
  };

  return (
    <div className="modal-backdrop is-open" onClick={() => setIsQuoteModalOpen(false)}>
      <div className="quote-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="quickview-close-btn" onClick={() => setIsQuoteModalOpen(false)} aria-label="Close quote modal">
          <X size={20} />
        </button>

        <h3 className="quote-modal-title">Request a Bulk Quote</h3>
        <p className="quote-modal-subtitle">Submit your hardware project details for trade discounts & bulk pricing.</p>

        <form onSubmit={handleSubmit} className="quote-form">
          <div className="form-group">
            <label className="form-label" htmlFor="quote-name">Full Name</label>
            <input id="quote-name" className="form-input" type="text" placeholder="e.g. Rajesh Sharma" required />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="quote-phone">Phone Number</label>
              <input id="quote-phone" className="form-input" type="tel" placeholder="+91 95261 62225" required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="quote-type">Project Type</label>
              <select id="quote-type" className="form-select">
                <option>Residential Interior</option>
                <option>Commercial Office</option>
                <option>Hotel / Hospitality</option>
                <option>Contractor / Carpenter Bulk</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="quote-req">Hardware Requirements / Quantities</label>
            <textarea 
              id="quote-req" 
              className="form-textarea" 
              rows={3} 
              placeholder="e.g. 24 pairs 18-inch telescopic channels, 4 mortise handles in antique brass..."
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
            <Send size={16} /> Submit Quote Request
          </button>
        </form>
      </div>
    </div>
  );
}
