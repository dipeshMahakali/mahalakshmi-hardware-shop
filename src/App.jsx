import React from 'react';
import { ShopProvider, useShop } from './context/ShopContext.jsx';
import { Header } from './components/Header.jsx';
import { Hero } from './components/Hero.jsx';
import { TrustFeatures, Categories } from './components/TrustFeatures.jsx';
import { BestSellers, RecommendedProducts } from './components/BestSellers.jsx';
import { ShopByNeed, PromoBanner } from './components/ShopByNeed.jsx';
import { BusinessServices, WhyChooseUs } from './components/BusinessServices.jsx';
import { CategoryCatalog } from './components/CategoryCatalog.jsx';
import { Footer } from './components/Footer.jsx';
import { CartDrawer } from './components/CartDrawer.jsx';
import { MobileNavDrawer } from './components/MobileNavDrawer.jsx';
import { QuickViewModal, QuoteModal } from './components/QuickViewModal.jsx';
import { SupportWidget, ToastContainer } from './components/SupportWidget.jsx';
import './style.css';

function MainContent() {
  const { activeCategory } = useShop();

  if (activeCategory !== 'all') {
    return <CategoryCatalog />;
  }

  return (
    <main>
      <Hero />
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
  return (
    <ShopProvider>
      <Header />
      <MainContent />
      <Footer />
      <MobileNavDrawer />
      <CartDrawer />
      <QuickViewModal />
      <QuoteModal />
      <SupportWidget />
      <ToastContainer />
    </ShopProvider>
  );
}
