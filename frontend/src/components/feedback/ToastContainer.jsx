import React from 'react';
import { CheckCircle, ShoppingBag, Heart, Send, Trash } from 'lucide-react';
import { useShop } from '../../context/ShopContext.jsx';

const toastIcons = {
  'check-circle': CheckCircle,
  'shopping-bag': ShoppingBag,
  'heart': Heart,
  'send': Send,
  'trash': Trash
};

export function ToastContainer() {
  const { toasts } = useShop();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(t => {
        const IconComponent = toastIcons[t.icon] || CheckCircle;
        return (
          <div key={t.id} className="toast-message" role="status">
            <IconComponent size={18} />
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}

