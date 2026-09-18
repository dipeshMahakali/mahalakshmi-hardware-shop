import React, { useState, useEffect } from 'react';
import { BarChart3, Home, LogOut, Menu, Package, Plus, Receipt, Sparkles, Users, Wallet, X, Layers, LayoutTemplate, ShoppingCart } from 'lucide-react';

const TAB_TITLES = {
  kpis: 'Executive Overview & Operations',
  billing: 'Point of Sale (POS) & Invoicing',
  catalog: 'Storefront Catalog & Showcase Curator',
  cms: 'Storefront CMS Visual Editor',
  engagement: 'Live Store Carts & Audience Telemetry',
  customers: 'Customer & Contractor Directory',
  inventory: 'Live Inventory & Stock Health',
  khata: 'Digital Customer Khata Ledger',
  ai: 'AI Voice & WhatsApp Draft Orders',
};

export function AdminPanelShell({
  children,
  activeTab = 'kpis',
  onTabChange,
  badgeCounts = { aiJobs: 0, lowStock: 0 },
  onLogout,
  user
}) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const currentTitle = TAB_TITLES[activeTab] || 'Owner Command Center';

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileNavOpen) {
        setIsMobileNavOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileNavOpen]);

  const navItems = [
    { id: 'kpis', label: 'Executive Overview', icon: BarChart3 },
    { id: 'billing', label: 'Point of Sale (POS)', icon: Receipt },
    { id: 'catalog', label: 'Catalog & Showcase', icon: Layers },
    { id: 'cms', label: 'Storefront CMS', icon: LayoutTemplate },
    { id: 'engagement', label: 'Live Store Carts', icon: ShoppingCart },
    { id: 'customers', label: 'Customers & Builders', icon: Users },
    { id: 'inventory', label: 'Inventory & Stock', icon: Package, badge: badgeCounts?.lowStock, badgeType: 'danger' },
    { id: 'khata', label: 'Digital Khata Ledger', icon: Wallet },
    { id: 'ai', label: 'AI Carpenter Orders', icon: Sparkles, badge: badgeCounts?.aiJobs, badgeType: 'warning' },
  ];

  const handleNavClick = (tabId) => {
    if (onTabChange) {
      onTabChange(tabId);
    }
    setIsMobileNavOpen(false);
  };

  return (
    <div className="panel-app admin-panel-app">
      {/* Mobile Drawer Dark Backdrop Overlay */}
      {isMobileNavOpen && (
        <div
          className="panel-drawer-backdrop"
          onClick={() => setIsMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Unified Navigation Sidebar / Mobile Slide-In Drawer */}
      <aside
        className={`panel-sidebar ${isMobileNavOpen ? 'is-open' : ''}`}
        aria-label="Admin Sidebar"
      >
        <div className="panel-sidebar-header">
          <a className="panel-brand" href="/" title="Back to storefront">
            <span className="panel-brand-mark">SM</span>
            <span>
              <strong>Shri Mahalakshmi</strong>
              <small>Owner Command Center</small>
            </span>
          </a>

          {/* Close button inside mobile drawer */}
          <button
            type="button"
            className="panel-drawer-close"
            onClick={() => setIsMobileNavOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="panel-nav" aria-label="Admin navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`panel-nav-btn ${isActive ? 'is-active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <div className="panel-nav-icon-group">
                  <Icon size={17} />
                  <span>{item.label}</span>
                </div>
                {Boolean(item.badge && item.badge > 0) && (
                  <span className={`panel-badge-pill ${item.badgeType || ''}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer: User Profile & Sign Out */}
        <div className="panel-sidebar-footer">
          <div className="panel-user-profile">
            <div className="panel-user-avatar">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'OW'}
            </div>
            <div className="panel-user-meta">
              <span className="panel-user-name">{user?.name || 'Owner Workspace'}</span>
              <span className="panel-user-role">Live Authenticated</span>
            </div>
          </div>

          {onLogout && (
            <button
              type="button"
              className="panel-logout"
              onClick={onLogout}
              title="Sign out of command center"
            >
              <LogOut size={16} />
              <span>Sign out</span>
            </button>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="panel-main">
        {/* Unified Topbar */}
        <header className="panel-topbar">
          <div className="panel-topbar-left">
            <button
              type="button"
              className="panel-menu-toggle"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open navigation drawer"
            >
              <Menu size={19} />
              {Boolean((badgeCounts?.aiJobs || 0) + (badgeCounts?.lowStock || 0) > 0) && (
                <span className="panel-menu-badge-dot" />
              )}
            </button>
            <div className="panel-topbar-titles">
              <span className="panel-eyebrow">COMMAND CENTER &bull; LIVE OPERATIONS</span>
              <h1>{currentTitle}</h1>
            </div>
          </div>

          <div className="panel-topbar-actions">
            <div className="panel-status-badge" title="Live connection to FastAPI backend and database">
              <span className="panel-status-dot" />
              <span className="panel-status-text">Live DB</span>
            </div>

            <button
              type="button"
              className="panel-topbar-action-btn"
              onClick={() => handleNavClick('billing')}
              title="Create new sales invoice"
            >
              <Plus size={15} />
              <span>New Bill</span>
            </button>

            <a className="panel-public-link" href="/" title="Open public showroom catalog">
              <Home size={15} />
              <span className="panel-public-link-text">Showroom</span>
            </a>
          </div>
        </header>

        {/* Panel Content */}
        <div className="panel-content">
          {children}
        </div>

        {/* Mobile Thumb-Friendly Bottom Quick-Dock (< 768px) */}
        <nav className="admin-bottom-nav" aria-label="Admin mobile quick navigation">
          <button
            type="button"
            className={`admin-bottom-tab ${activeTab === 'kpis' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('kpis')}
            aria-label="Executive Overview"
          >
            <BarChart3 size={18} />
            <span>Overview</span>
          </button>

          <button
            type="button"
            className={`admin-bottom-tab ${activeTab === 'billing' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('billing')}
            aria-label="Point of Sale Billing"
          >
            <Receipt size={18} />
            <span>POS</span>
          </button>

          <button
            type="button"
            className={`admin-bottom-tab ${activeTab === 'inventory' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('inventory')}
            aria-label="Inventory & Stock"
          >
            <Package size={18} />
            <span>Stock</span>
            {Boolean(badgeCounts?.lowStock && badgeCounts.lowStock > 0) && (
              <span className="admin-bottom-badge danger">{badgeCounts.lowStock}</span>
            )}
          </button>

          <button
            type="button"
            className={`admin-bottom-tab ${activeTab === 'khata' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('khata')}
            aria-label="Customer Khata Ledger"
          >
            <Wallet size={18} />
            <span>Khata</span>
          </button>

          <button
            type="button"
            className={`admin-bottom-tab ${activeTab === 'ai' ? 'is-active' : ''}`}
            onClick={() => handleNavClick('ai')}
            aria-label="AI Carpenter Orders"
          >
            <Sparkles size={18} />
            <span>AI Drafts</span>
            {Boolean(badgeCounts?.aiJobs && badgeCounts.aiJobs > 0) && (
              <span className="admin-bottom-badge warning">{badgeCounts.aiJobs}</span>
            )}
          </button>

          <button
            type="button"
            className="admin-bottom-tab"
            onClick={() => setIsMobileNavOpen(true)}
            aria-label="Open More Admin Menu"
          >
            <Menu size={18} />
            <span>More</span>
          </button>
        </nav>
      </main>
    </div>
  );
}

