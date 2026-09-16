import React from 'react';
import { FileText, Users, Layers, Headphones, HelpCircle, Briefcase, Award } from 'lucide-react';
import { useShop } from '../context/ShopContext.jsx';

export { WhyChooseUs } from './WhyChooseUs.jsx';

const iconMap = {
  'file-text': FileText,
  'users': Users,
  'layers': Layers,
  'headphones': Headphones,
  'help-circle': HelpCircle,
  'briefcase': Briefcase,
  'award': Award
};

const DEFAULT_SERVICES = [
  { id: 'serv-1', icon: 'file-text', title: 'Request a Quote', desc: 'Get better custom pricing for bulk requirements & project estimates.', action: 'quote' },
  { id: 'serv-2', icon: 'users', title: 'Become a Dealer', desc: 'Join our authorized dealer network and grow your hardware business.', action: 'quote' },
  { id: 'serv-3', icon: 'layers', title: 'Bulk Orders', desc: 'Dedicated commercial project solutions with wholesale trade terms.', action: 'quote' },
  { id: 'serv-4', icon: 'headphones', title: 'Expert Support', desc: "We're here to help you choose the exact hardware specifications.", action: 'support' }
];

export function BusinessServices() {
  const { setIsQuoteModalOpen, setIsSupportOpen, siteContent } = useShop();
  const rawServices = siteContent?.business_services;
  const services = (
    Array.isArray(rawServices) && rawServices.length > 0
      ? rawServices
      : (Array.isArray(rawServices?.items) && rawServices.items.length > 0
        ? rawServices.items
        : (Array.isArray(rawServices?.services) && rawServices.services.length > 0
          ? rawServices.services
          : DEFAULT_SERVICES))
  );

  const handleClick = (service) => {
    if (service.action === 'support' || (service.title || '').toLowerCase().includes('support')) {
      setIsSupportOpen(true);
    } else {
      setIsQuoteModalOpen(true);
    }
  };

  return (
    <section className="section business-services-section" id="business-services">
      <div className="container">
        <div className="services-grid">
          {services.map((serv, idx) => {
            const Icon = iconMap[serv.icon] || FileText;
            return (
              <div 
                key={serv.id || idx} 
                className="service-card" 
                onClick={() => handleClick(serv)} 
                style={{ cursor: 'pointer' }}
              >
                <div className="service-icon"><Icon size={24} /></div>
                <div className="service-title">{serv.title}</div>
                <div className="service-desc">{serv.desc || serv.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
