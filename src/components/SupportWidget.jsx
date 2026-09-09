import React, { useEffect, useRef } from 'react';
import { Headphones, MessageSquare, PhoneCall, FileText, CheckCircle, ShoppingBag, Heart, Send, Trash } from 'lucide-react';
import { useShop } from '../context/ShopContext';

const toastIcons = {
  'check-circle': CheckCircle,
  'shopping-bag': ShoppingBag,
  'heart': Heart,
  'send': Send,
  'trash': Trash
};

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
        
        <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="support-option-item">
          <MessageSquare size={18} style={{ color: '#25D366' }} />
          <span>WhatsApp Expert Chat</span>
        </a>
        
        <a href="tel:+919876543210" className="support-option-item">
          <PhoneCall size={18} style={{ color: 'var(--color-accent)' }} />
          <span>Call Hardware Specialist</span>
        </a>
        
        <button 
          className="support-option-item" 
          style={{ width: '100%', border: 'none', textAlign: 'left', cursor: 'pointer' }}
          onClick={() => {
            setIsSupportOpen(false);
            setIsQuoteModalOpen(true);
          }}
        >
          <FileText size={18} style={{ color: 'var(--color-gold)' }} />
          <span>Request Bulk Quote</span>
        </button>
      </div>

      <button className="floating-support-btn" onClick={() => setIsSupportOpen(!isSupportOpen)}>
        <span className="support-pulse-dot"></span>
        <Headphones size={18} />
        <span>Need Help?</span>
      </button>

    </div>
  );
}

export function ToastContainer() {
  const { toasts } = useShop();

  return (
    <div className="toast-container">
      {toasts.map(t => {
        const IconComponent = toastIcons[t.icon] || CheckCircle;
        return (
          <div key={t.id} className="toast-message">
            <IconComponent size={18} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
