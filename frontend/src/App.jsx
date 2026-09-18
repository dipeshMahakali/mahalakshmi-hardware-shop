import React, { useState, useEffect } from 'react';
import { ShopProvider, useShop } from './context/ShopContext.jsx';
import { Header } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { TrustFeatures, Categories } from './components/TrustFeatures.jsx';
import { BestSellers, RecommendedProducts } from './components/BestSellers.jsx';
import { ShopByNeed, PromoBanner } from './components/ShopByNeed.jsx';
import { BusinessServices, WhyChooseUs } from './components/BusinessServices.jsx';
import { CategoryCatalog } from './components/CategoryCatalog.jsx';
import { ProductVisualizer } from './components/ProductVisualizer.jsx';
import { CarpenterPortal } from './components/CarpenterPortal.jsx';
import { AdminDashboard } from './components/AdminDashboard.jsx';
import { AdminLogin } from './components/AdminLogin.jsx';
import { PartnerLogin } from './components/PartnerLogin.jsx';
import { Footer } from './components/Footer.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { MobileNavDrawer } from './components/MobileNavDrawer.jsx';
import { QuickViewModal, QuoteModal } from './components/QuickViewModal.jsx';
import { SupportWidget, ToastContainer } from './components/SupportWidget.jsx';
import { DeveloperWatermark } from './components/DeveloperWatermark.jsx';
import { businessApi } from './api/businessApi';
import { AdminPanelShell } from './components/layout/AdminPanelShell.jsx';
import { PartnerPanelShell } from './components/layout/PartnerPanelShell.jsx';
import './style.css';

function MainCatalogContent() {
  const { activeCategory, isCatalogView } = useShop();

  if (isCatalogView || (activeCategory !== 'all' && activeCategory !== 'home')) {
    return <CategoryCatalog />;
  }

  return (
    <main>
      <Hero />
      <ProductVisualizer />
      <TrustFeatures />
      <Categories />
      <BestSellers />
      <ShopByNeed />
      <PromoBanner />
      <RecommendedProducts />
      <BusinessServices />
      <WhyChooseUs />
    </main>
  );
}

export default function App() {
  const initialPath = window.location.pathname;
  const initialView = initialPath.startsWith('/admin') ? 'admin' : initialPath.startsWith('/partner') ? 'carpenter' : 'catalog';
  const [viewMode, setViewMode] = useState(initialView);
  const [adminToken, setAdminToken] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showDemoBar, setShowDemoBar] = useState(false);
  const [adminTab, setAdminTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['kpis', 'billing', 'customers', 'inventory', 'khata', 'ai', 'catalog', 'cms', 'engagement'].includes(hash) ? hash : 'kpis';
  });
  const [adminBadges, setAdminBadges] = useState({ aiJobs: 0, lowStock: 0 });
  const [partnerTab, setPartnerTab] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return ['order', 'photo', 'sites', 'khata', 'orders'].includes(hash) ? hash : 'order';
  });
  const [partnerLoyalty, setPartnerLoyalty] = useState(null);

  const handleAdminTabChange = (tabId) => {
    setAdminTab(tabId);
    window.location.hash = tabId;
  };

  const handlePartnerTabChange = (tabId) => {
    setPartnerTab(tabId);
    window.location.hash = tabId;
  };

  useEffect(() => {
    const onHashChange = () => {
      const rawHash = window.location.hash.replace('#', '');
      if (['kpis', 'billing', 'customers', 'inventory', 'khata', 'ai', 'catalog', 'cms', 'engagement'].includes(rawHash)) {
        setAdminTab(rawHash);
      }
      if (['order', 'photo', 'sites', 'khata', 'orders'].includes(rawHash)) {
        setPartnerTab(rawHash);
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    // Check URL hash or search parameter for route & demo mode
    const hash = window.location.hash;
    const search = window.location.search;

    if (initialPath.startsWith('/admin') || hash === '#admin' || search.includes('role=admin')) {
      setViewMode('admin');
      businessApi.getMe().then((user) => {
        setCurrentUser(user);
        if (user.role === 'OWNER' || user.role === 'STAFF') setAdminToken(true);
      }).catch(() => {
        setCurrentUser(null);
        setAdminToken(false);
      });
    } else if (initialPath.startsWith('/partner') || hash === '#carpenter' || search.includes('role=carpenter')) {
      setViewMode('carpenter');
      businessApi.getMe().then((user) => {
        setCurrentUser(user);
        if (user.role === 'CARPENTER' || user.role === 'OWNER') setAdminToken(true);
      }).catch(() => {
        setCurrentUser(null);
        setAdminToken(false);
      });
    }

    if (search.includes('demo=true') || hash.includes('demo')) {
      setShowDemoBar(true);
    }
  }, [initialPath]);

  return (
    <ShopProvider>
      {/* Development route switcher for testing */}
      {showDemoBar && (
        <div style={{ background: '#141414', borderBottom: '1px solid #F47B20', color: '#fff', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <span>🛠️ Ecosystem Switcher:</span>
          <a
            href="/"
            style={{
              background: viewMode === 'catalog' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              textDecoration: 'none'
            }}
          >
            🛒 Public Showroom
          </a>
          <a
            href="/partner"
            style={{
              background: viewMode === 'carpenter' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              textDecoration: 'none'
            }}
          >
            🔨 Carpenter PWA
          </a>
          <a
            href="/admin"
            style={{
              background: viewMode === 'admin' ? 'var(--color-accent)' : 'rgba(255,255,255,0.1)',
              color: '#fff',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              textDecoration: 'none'
            }}
          >
            📊 Owner Admin Panel
          </a>
        </div>
      )}

      {/* Admin Workspace Route */}
      {viewMode === 'admin' ? (
        !adminToken ? (
          <AdminLogin
            onLoginSuccess={(user) => {
              if (user) setCurrentUser(user);
              setAdminToken(true);
            }}
            onCancel={() => { window.location.href = '/'; }}
          />
        ) : (
          <AdminPanelShell
            activeTab={adminTab}
            onTabChange={handleAdminTabChange}
            badgeCounts={adminBadges}
            user={currentUser}
            onLogout={() => {
              businessApi.logout().finally(() => {
                setAdminToken(false);
                setCurrentUser(null);
                window.location.href = '/';
              });
            }}
          >
            <AdminDashboard
              token={adminToken}
              activeTab={adminTab}
              onTabChange={handleAdminTabChange}
              onStatsUpdate={setAdminBadges}
              onLogout={() => {
                businessApi.logout().finally(() => {
                  setAdminToken(false);
                  setCurrentUser(null);
                  window.location.href = '/';
                });
              }}
            />
          </AdminPanelShell>
        )
      ) : viewMode === 'carpenter' ? (
        /* Carpenter Partner PWA Route */
        !adminToken ? (
          <PartnerLogin
            onLoginSuccess={(user) => {
              if (user) setCurrentUser(user);
              setAdminToken(true);
            }}
            onCancel={() => { window.location.href = '/'; }}
          />
        ) : (
          <PartnerPanelShell
            activeTab={partnerTab}
            onTabChange={handlePartnerTabChange}
            user={currentUser}
            loyalty={partnerLoyalty}
            onLogout={() => {
              businessApi.logout().finally(() => {
                setAdminToken(false);
                setCurrentUser(null);
                window.location.href = '/';
              });
            }}
          >
            <CarpenterPortal
              activeTab={partnerTab}
              onTabChange={handlePartnerTabChange}
              onLoyaltyUpdate={setPartnerLoyalty}
            />
          </PartnerPanelShell>
        )
      ) : (
        /* Public Showroom & Catalog Route */
        <>
          <Header setViewMode={setViewMode} viewMode={viewMode} />
          <MainCatalogContent />
          <Footer setViewMode={setViewMode} />
          <MobileNavDrawer />
          <CartDrawer />
          <QuickViewModal />
          <QuoteModal />
          <SupportWidget />
          <ToastContainer />
        </>
      )}
      <DeveloperWatermark />
    </ShopProvider>
  );
}
