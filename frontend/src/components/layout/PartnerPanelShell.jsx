import React from 'react';
import { Briefcase, Camera, Hammer, Home, LogOut, Mic, PackageCheck, Star, Wallet } from 'lucide-react';

export function PartnerPanelShell({
  children,
  activeTab = 'order',
  onTabChange,
  user,
  loyalty,
  onLogout
}) {
  const navItems = [
    { id: 'order', label: 'Voice Order', icon: Mic },
    { id: 'photo', label: 'Photo Slip', icon: Camera },
    { id: 'sites', label: 'My Sites', icon: Briefcase },
    { id: 'khata', label: 'Khata Due', icon: Wallet },
    { id: 'orders', label: 'Tracking', icon: PackageCheck },
  ];

  return (
    <div className="partner-app panel-app">
      {/* Topbar */}
      <header className="partner-topbar">
        <div className="partner-topbar-left">
          <a className="panel-brand partner-brand" href="/" title="Back to storefront">
            <span className="panel-brand-mark partner-mark"><Hammer size={18} /></span>
            <span className="partner-brand-text">
              <strong>Shree Mahalaxmi</strong>
              <small className="partner-brand-subtitle">Carpenter Network</small>
            </span>
          </a>

          {loyalty && (
            <div className="partner-loyalty-pill">
              <Star size={12} fill="#F47B20" />
              <span>{loyalty.tier} ({loyalty.points} pts)</span>
            </div>
          )}
        </div>

        <div className="partner-topbar-actions">
          <a className="panel-public-link partner-topbar-btn" href="/" title="Open public showroom">
            <Home size={15} />
            <span className="partner-btn-label">Showroom</span>
          </a>

          {onLogout && (
            <button
              type="button"
              className="panel-logout partner-logout-btn"
              onClick={onLogout}
              title="Sign out of partner portal"
            >
              <LogOut size={15} />
              <span className="partner-btn-label">Exit</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="partner-content">
        {children}
      </main>

      {/* Mobile-Only Bottom Navigation */}
      <nav className="partner-bottom-nav" aria-label="Partner navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              className={isActive ? 'is-active' : ''}
              onClick={() => onTabChange?.(item.id)}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

