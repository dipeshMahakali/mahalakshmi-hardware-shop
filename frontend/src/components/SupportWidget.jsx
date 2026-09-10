import React, { useEffect, useRef } from 'react';
import { Headphones, MessageSquare, PhoneCall, FileText } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';
import { buildWhatsAppLink } from '../utils/whatsapp.js';

export { ToastContainer } from '../components/feedback/ToastContainer.jsx';

export function SupportWidget() {
  const { isSupportOpen, setIsSupportOpen, setIsQuoteModalOpen } = useShop();
  const supportRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (supportRef.current && !supportRef.current.contains(e.target)) {
        setIsSupportOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setIsSupportOpen]);

  return (
    <div className={`floating-support-container ${isSupportOpen ? 'is-open' : ''}`} id="support-widget-container" ref={supportRef}>
      <div className="support-popup-panel">
        <div className="support-panel-header">How can we help you?</div>
        
        <a 
          href={buildWhatsAppLink('919876543210', 'Hello Shree Mahalaxmi Hardware! I need assistance with product specifications.')} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="support-option-item"
        >
          <MessageSquare size={18} style={{ color: '#25D366' }} />
          <span>WhatsApp Expert Chat</span>
        </a>
        
        <a href="tel:+919876543210" className="support-option-item">
          <PhoneCall size={18} style={{ color: 'var(--color-accent)' }} />
          <span>Call Hardware Specialist</span>
        </a>
        
        <button 
          className="support-option-item" 
          style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer', background: 'none' }}
          onClick={() => {
            setIsSupportOpen(false);
            setIsQuoteModalOpen(true);
          }}
        >
          <FileText size={18} style={{ color: 'var(--color-gold)' }} />
          <span>Request Bulk Quote</span>
        </button>
      </div>

      <button className="floating-support-btn" onClick={() => setIsSupportOpen(!isSupportOpen)} aria-label="Open support menu">
        <span className="support-pulse-dot"></span>
        <Headphones size={18} />
        <span>Need Help?</span>
      </button>
    </div>
  );
}
