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
import { businessApi } from './api/businessApi';
import { AdminPanelShell, PartnerPanelShell } from './components/PanelShell.jsx';
import './style.css';

function MainContent({ viewMode, adminToken, setAdminToken, setViewMode }) {
  const { activeCategory } = useShop();

  if (viewMode === 'carpenter') {
    if (!adminToken) {
      return <PartnerLogin onLoginSuccess={() => setAdminToken(true)} onCancel={() => { window.location.href = '/'; }} />;
    }
    return <CarpenterPortal />;
  }

  if (viewMode === 'admin') {
    if (!adminToken) {
      return (
        <AdminLogin
          onLoginSuccess={(token) => {
            setAdminToken(token);
          }}
          onCancel={() => setViewMode('catalog')}
        />
      );
    }
    return (
      <AdminDashboard
        token={adminToken}
        onLogout={() => {
          setAdminToken('');
          setViewMode('catalog');
        }}
      />
    );
  }

  if (activeCategory !== 'all') {
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
  const [showDemoBar, setShowDemoBar] = useState(false);

  useEffect(() => {
    // Check URL hash or search parameter for route & demo mode
    const hash = window.location.hash;
    const search = window.location.search;

    if (initialPath.startsWith('/admin') || hash === '#admin' || search.includes('role=admin')) {
      setViewMode('admin');
      businessApi.getMe().then((user) => {
        if (user.role === 'OWNER' || user.role === 'STAFF') setAdminToken(true);
      }).catch(() => setAdminToken(false));
    } else if (initialPath.startsWith('/partner') || hash === '#carpenter' || search.includes('role=carpenter')) {
      setViewMode('carpenter');
    }

    if (search.includes('demo=true') || hash.includes('demo')) {
      setShowDemoBar(true);
    }
  }, []);

  return (
    <ShopProvider>
      {/* Development-only route switcher. Production navigation uses /admin and /partner links. */}
      {showDemoBar && viewMode === 'catalog' && (
        <div style={{ background: '#0284c7', color: '#fff', padding: '0.5rem 1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <span>🛠️ Ecosystem Development Switcher:</span>
          <a
            href="/"
            style={{
              background: viewMode === 'catalog' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: viewMode === 'catalog' ? '#0284c7' : '#fff',
              border: 'none',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            🛒 Public Catalog & Visualizer
          </a>
          <a
            href="/partner"
            style={{
              background: viewMode === 'carpenter' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: viewMode === 'carpenter' ? '#0284c7' : '#fff',
              border: 'none',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            🔨 Carpenter Partner PWA
          </a>
          <a
            href="/admin"
            style={{
              background: viewMode === 'admin' ? '#fff' : 'rgba(255,255,255,0.2)',
              color: viewMode === 'admin' ? '#0284c7' : '#fff',
              border: 'none',
              padding: '0.25rem 0.75rem',
              borderRadius: '20px',
              cursor: 'pointer'
            }}
          >
            📊 Shop Owner Admin Panel
          </a>
        </div>
      )}

      {viewMode === 'admin' ? (
        <AdminPanelShell onLogout={adminToken ? () => { setAdminToken(false); window.location.href = '/'; } : null}>
          <MainContent viewMode="admin" adminToken={adminToken} setAdminToken={setAdminToken} setViewMode={() => { window.location.href = '/'; }} />
        </AdminPanelShell>
      ) : viewMode === 'carpenter' ? (
        <PartnerPanelShell><MainContent viewMode="carpenter" adminToken={adminToken} setAdminToken={setAdminToken} /></PartnerPanelShell>
      ) : (
        <>
          <Header setViewMode={setViewMode} viewMode={viewMode} />
          <MainContent viewMode="catalog" setViewMode={setViewMode} />
          <Footer setViewMode={setViewMode} />
          <MobileNavDrawer />
          <CartDrawer />
          <QuickViewModal />
          <QuoteModal />
          <SupportWidget />
          <ToastContainer />
        </>
      )}
    </ShopProvider>
  );
}
