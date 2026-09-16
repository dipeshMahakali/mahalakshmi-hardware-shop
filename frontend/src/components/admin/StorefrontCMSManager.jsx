import React, { useState, useEffect } from 'react';
import { 
  LayoutTemplate, Save, RefreshCw, Sparkles, Check, AlertCircle, 
  Crown, ShieldCheck, Compass, Briefcase, Award, Phone, Mail, MapPin, 
  Clock, FileText, Plus, Trash2, ArrowRight
} from 'lucide-react';
import { businessApi } from '../../api/businessApi';
import { DEFAULT_SITE_CONTENT, normalizeSiteContent } from '../../hooks/useSiteContent';

export function StorefrontCMSManager({ token, onContentSaved }) {
  const [activeSubTab, setActiveSubTab] = useState('hero');
  const [cmsData, setCmsData] = useState(DEFAULT_SITE_CONTENT);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    loadCMS();
  }, []);

  const loadCMS = async () => {
    setLoading(true);
    try {
      const data = await businessApi.getStorefrontContent();
      if (data && typeof data === 'object') {
        setCmsData(normalizeSiteContent(data));
      }
    } catch (err) {
      console.warn('Could not load remote CMS, using current state:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSection = async (sectionKey) => {
    setSaving(true);
    setStatusMsg(null);
    try {
      let sectionContent;
      if (sectionKey === 'trust_features') {
        const trustList = Array.isArray(cmsData.trust_features)
          ? cmsData.trust_features
          : (Array.isArray(cmsData.trust_features?.features)
            ? cmsData.trust_features.features
            : (Array.isArray(cmsData.trust_features?.items) ? cmsData.trust_features.items : DEFAULT_SITE_CONTENT.trust_features));
        sectionContent = { features: trustList };
      } else if (sectionKey === 'business_services') {
        const servList = Array.isArray(cmsData.business_services)
          ? cmsData.business_services
          : (Array.isArray(cmsData.business_services?.items)
            ? cmsData.business_services.items
            : (Array.isArray(cmsData.business_services?.services) ? cmsData.business_services.services : DEFAULT_SITE_CONTENT.business_services));
        sectionContent = { items: servList };
      } else {
        sectionContent = cmsData[sectionKey];
      }

      await businessApi.updateStorefrontContent(token, sectionKey, sectionContent);
      setStatusMsg({ type: 'success', text: `Saved "${sectionKey.replace(/_/g, ' ').toUpperCase()}" successfully!` });
      if (onContentSaved) onContentSaved(sectionKey, sectionContent);
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to save section.' });
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const updateField = (section, field, value) => {
    setCmsData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayItem = (section, index, field, value) => {
    setCmsData(prev => {
      let list = [];
      if (Array.isArray(prev[section])) {
        list = [...prev[section]];
      } else if (Array.isArray(prev[section]?.features)) {
        list = [...prev[section].features];
      } else if (Array.isArray(prev[section]?.items)) {
        list = [...prev[section].items];
      } else if (DEFAULT_SITE_CONTENT[section]) {
        list = [...DEFAULT_SITE_CONTENT[section]];
      }
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      return { ...prev, [section]: list };
    });
  };

  const updateSubArrayItem = (section, subKey, index, field, value) => {
    setCmsData(prev => {
      const parent = { ...(prev[section] || {}) };
      const sourceList = Array.isArray(parent[subKey])
        ? parent[subKey]
        : (DEFAULT_SITE_CONTENT[section]?.[subKey] || []);
      const list = [...sourceList];
      if (list[index]) {
        list[index] = { ...list[index], [field]: value };
      }
      parent[subKey] = list;
      return { ...prev, [section]: parent };
    });
  };

  const sectionsList = [
    { id: 'hero', label: 'Hero Header', icon: Crown },
    { id: 'promo_banner', label: 'Promo Collection', icon: Sparkles },
    { id: 'trust_features', label: 'Trust Badges (4)', icon: ShieldCheck },
    { id: 'shop_by_need', label: 'Shop By Need (5)', icon: Compass },
    { id: 'business_services', label: 'Business Services (4)', icon: Briefcase },
    { id: 'why_choose_us', label: 'Why Choose Us (4)', icon: Award },
    { id: 'footer', label: 'Contact, Header & Footer', icon: Phone },
  ];

  return (
    <div className="admin-cms-hub" style={{ padding: '0.5rem 0' }}>
      {/* CMS Header Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.5rem',
        background: '#18181b',
        padding: '1.25rem',
        borderRadius: '12px',
        border: '1px solid #27272a'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, margin: 0, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <LayoutTemplate size={22} color="#f59e0b" />
            Storefront CMS Visual Editor
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.88rem' }}>
            Live content management system. Changes published here immediately reflect on the customer-facing landing page.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={loadCMS}
            disabled={loading || saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
          >
            <RefreshCw size={15} className={loading ? 'spin' : ''} />
            Refresh
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleSaveSection(activeSubTab)}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem', background: '#d97706', borderColor: '#b45309' }}
          >
            <Save size={16} />
            {saving ? 'Publishing...' : 'Save & Publish Tab'}
          </button>
        </div>
      </div>

      {statusMsg && (
        <div style={{
          padding: '0.9rem 1.25rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          background: statusMsg.type === 'success' ? '#064e3b' : '#7f1d1d',
          color: statusMsg.type === 'success' ? '#a7f3d0' : '#fecaca',
          border: `1px solid ${statusMsg.type === 'success' ? '#059669' : '#dc2626'}`
        }}>
          {statusMsg.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
          <span style={{ fontWeight: 500 }}>{statusMsg.text}</span>
        </div>
      )}

      {/* Sub-tabs Navigation */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: '1px solid #27272a',
        paddingBottom: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        {sectionsList.map(tab => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                border: isActive ? '1px solid #f59e0b' : '1px solid #27272a',
                background: isActive ? '#27272a' : '#18181b',
                color: isActive ? '#f59e0b' : '#a1a1aa',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: HERO */}
      {activeSubTab === 'hero' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Crown size={18} color="#f59e0b" />
            Hero Section Editor
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Showroom Badge Text</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.badge || ''}
                onChange={(e) => updateField('hero', 'badge', e.target.value)}
                placeholder="PREMIUM ARCHITECTURAL HARDWARE SHOWROOM"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Main Title Heading</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.title_main || ''}
                onChange={(e) => updateField('hero', 'title_main', e.target.value)}
                placeholder="Stronger"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Highlighted Title (Orange Accent)</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.title_highlight || ''}
                onChange={(e) => updateField('hero', 'title_highlight', e.target.value)}
                placeholder="Spaces."
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Hero Description Paragraph</label>
              <textarea
                className="form-input"
                rows={3}
                value={cmsData.hero?.description || ''}
                onChange={(e) => updateField('hero', 'description', e.target.value)}
                placeholder="Discover premium hardware..."
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Primary CTA Button Label</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.primary_cta_text || ''}
                onChange={(e) => updateField('hero', 'primary_cta_text', e.target.value)}
                placeholder="Shop Door Hardware"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Primary CTA Target (#anchor)</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.primary_cta_link || ''}
                onChange={(e) => updateField('hero', 'primary_cta_link', e.target.value)}
                placeholder="#door-hardware"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Secondary CTA Button Label</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.secondary_cta_text || ''}
                onChange={(e) => updateField('hero', 'secondary_cta_text', e.target.value)}
                placeholder="Explore All Products"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Secondary CTA Target (#anchor)</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.hero?.secondary_cta_link || ''}
                onChange={(e) => updateField('hero', 'secondary_cta_link', e.target.value)}
                placeholder="#bestsellers"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PROMO BANNER */}
      {activeSubTab === 'promo_banner' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={18} color="#f59e0b" />
            Promo Collection Heritage Banner Editor
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Collection Badge</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.badge || ''}
                onChange={(e) => updateField('promo_banner', 'badge', e.target.value)}
                placeholder="ARCHITECTURAL EXCELLENCE"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Title Main Line</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.title_main || ''}
                onChange={(e) => updateField('promo_banner', 'title_main', e.target.value)}
                placeholder="The Matte Black"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Title Accent Line (Orange)</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.title_highlight || ''}
                onChange={(e) => updateField('promo_banner', 'title_highlight', e.target.value)}
                placeholder="Heritage Collection"
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Collection Narrative Description</label>
              <textarea
                className="form-input"
                rows={3}
                value={cmsData.promo_banner?.description || ''}
                onChange={(e) => updateField('promo_banner', 'description', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Bullet Point 1</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.feature_1 || ''}
                onChange={(e) => updateField('promo_banner', 'feature_1', e.target.value)}
                placeholder="10-Year Mechanical Warranty"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Bullet Point 2</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.feature_2 || ''}
                onChange={(e) => updateField('promo_banner', 'feature_2', e.target.value)}
                placeholder="Grade 304 Stainless Steel Core"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Bullet Point 3</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.feature_3 || ''}
                onChange={(e) => updateField('promo_banner', 'feature_3', e.target.value)}
                placeholder="Zero-Fingerprint PVD Coating"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>CTA Button Label</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.cta_text || ''}
                onChange={(e) => updateField('promo_banner', 'cta_text', e.target.value)}
                placeholder="Explore Collection"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Category Filter Destination</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.cta_link || ''}
                onChange={(e) => updateField('promo_banner', 'cta_link', e.target.value)}
                placeholder="door-hardware"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Side Tag Text</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.limited_tag || ''}
                onChange={(e) => updateField('promo_banner', 'limited_tag', e.target.value)}
                placeholder="Trade Pricing Available"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Top Floating Spec Chip</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.chip_top || ''}
                onChange={(e) => updateField('promo_banner', 'chip_top', e.target.value)}
                placeholder="PVD Matte Black"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Bottom Floating Spec Chip</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.promo_banner?.chip_bottom || ''}
                onChange={(e) => updateField('promo_banner', 'chip_bottom', e.target.value)}
                placeholder="Japanese Magnetic Latch"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TRUST FEATURES */}
      {activeSubTab === 'trust_features' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={18} color="#f59e0b" />
            Trust Badges & Quality Assurance (4 Cards)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {(() => {
              const trustList = Array.isArray(cmsData.trust_features)
                ? cmsData.trust_features
                : (Array.isArray(cmsData.trust_features?.features)
                  ? cmsData.trust_features.features
                  : (Array.isArray(cmsData.trust_features?.items)
                    ? cmsData.trust_features.items
                    : (DEFAULT_SITE_CONTENT.trust_features || [])));
              return trustList.map((card, idx) => (
                <div key={card.id || idx} style={{ background: '#27272a', padding: '1rem', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                  <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Badge #{idx + 1}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={card.title || ''}
                      onChange={(e) => updateArrayItem('trust_features', idx, 'title', e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Description</label>
                    <input
                      type="text"
                      className="form-input"
                      value={card.desc || card.description || ''}
                      onChange={(e) => updateArrayItem('trust_features', idx, 'desc', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Icon (shield-check, truck, lock, headphones)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={card.icon || ''}
                      onChange={(e) => updateArrayItem('trust_features', idx, 'icon', e.target.value)}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* TAB 4: SHOP BY NEED */}
      {activeSubTab === 'shop_by_need' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Compass size={18} color="#f59e0b" />
            Project Guidance ("Shop By Need") Editor
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Section Badge</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.shop_by_need?.badge || ''}
                onChange={(e) => updateField('shop_by_need', 'badge', e.target.value)}
                placeholder="Project Guidance"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Section Title</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.shop_by_need?.title || ''}
                onChange={(e) => updateField('shop_by_need', 'title', e.target.value)}
                placeholder="What Are You Working On?"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Section Subtitle</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.shop_by_need?.subtitle || ''}
                onChange={(e) => updateField('shop_by_need', 'subtitle', e.target.value)}
                placeholder="Find the right hardware tailored for your exact project type."
              />
            </div>
          </div>

          <h4 style={{ fontSize: '1rem', color: '#d4d4d8', marginBottom: '1rem' }}>Project Need Cards (5)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            {(() => {
              const needList = Array.isArray(cmsData.shop_by_need?.items)
                ? cmsData.shop_by_need.items
                : (Array.isArray(cmsData.shop_by_need)
                  ? cmsData.shop_by_need
                  : (DEFAULT_SITE_CONTENT.shop_by_need?.items || []));
              return needList.map((item, idx) => (
                <div key={item.id || idx} style={{ background: '#27272a', padding: '1rem', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                  <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Project #{idx + 1}: {item.title}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.title || ''}
                      onChange={(e) => updateSubArrayItem('shop_by_need', 'items', idx, 'title', e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Subtitle</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.subtitle || ''}
                      onChange={(e) => updateSubArrayItem('shop_by_need', 'items', idx, 'subtitle', e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={item.description || ''}
                      onChange={(e) => updateSubArrayItem('shop_by_need', 'items', idx, 'description', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Category Slug Target (e.g. door-hardware)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.category_target || ''}
                      onChange={(e) => updateSubArrayItem('shop_by_need', 'items', idx, 'category_target', e.target.value)}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* TAB 5: BUSINESS SERVICES */}
      {activeSubTab === 'business_services' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Briefcase size={18} color="#f59e0b" />
            Trade & Commercial Services (4 Cards)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {(() => {
              const servicesList = Array.isArray(cmsData.business_services)
                ? cmsData.business_services
                : (Array.isArray(cmsData.business_services?.items)
                  ? cmsData.business_services.items
                  : (Array.isArray(cmsData.business_services?.services)
                    ? cmsData.business_services.services
                    : (DEFAULT_SITE_CONTENT.business_services || [])));
              return servicesList.map((serv, idx) => (
                <div key={serv.id || idx} style={{ background: '#27272a', padding: '1rem', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                  <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Service #{idx + 1}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={serv.title || ''}
                      onChange={(e) => updateArrayItem('business_services', idx, 'title', e.target.value)}
                    />
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={serv.desc || serv.description || ''}
                      onChange={(e) => updateArrayItem('business_services', idx, 'desc', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Action Mode (quote / support)</label>
                    <select
                      className="form-select"
                      value={serv.action || 'quote'}
                      onChange={(e) => updateArrayItem('business_services', idx, 'action', e.target.value)}
                    >
                      <option value="quote">Open Quote Modal</option>
                      <option value="support">Open Expert Support Widget</option>
                    </select>
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* TAB 6: WHY CHOOSE US */}
      {activeSubTab === 'why_choose_us' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={18} color="#f59e0b" />
            "Why Choose Shree Mahalaxmi Hardware" Pillars (4 Cards)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Section Badge</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.why_choose_us?.badge || ''}
                onChange={(e) => updateField('why_choose_us', 'badge', e.target.value)}
                placeholder="Our Commitment"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Section Title</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.why_choose_us?.title || ''}
                onChange={(e) => updateField('why_choose_us', 'title', e.target.value)}
                placeholder="Why Choose Shree Mahalaxmi Hardware?"
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Section Subtitle</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.why_choose_us?.subtitle || ''}
                onChange={(e) => updateField('why_choose_us', 'subtitle', e.target.value)}
                placeholder="Delivering exceptional quality, technical precision..."
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.25rem' }}>
            {(() => {
              const whyList = Array.isArray(cmsData.why_choose_us?.items)
                ? cmsData.why_choose_us.items
                : (Array.isArray(cmsData.why_choose_us)
                  ? cmsData.why_choose_us
                  : (DEFAULT_SITE_CONTENT.why_choose_us?.items || []));
              return whyList.map((item, idx) => (
                <div key={item.id || idx} style={{ background: '#27272a', padding: '1rem', borderRadius: '8px', border: '1px solid #3f3f46' }}>
                  <div style={{ fontWeight: 600, color: '#f59e0b', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
                    Pillar #{idx + 1}
                  </div>
                  <div style={{ marginBottom: '0.75rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Title</label>
                    <input
                      type="text"
                      className="form-input"
                      value={item.title || ''}
                      onChange={(e) => updateSubArrayItem('why_choose_us', 'items', idx, 'title', e.target.value)}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Description</label>
                    <textarea
                      className="form-input"
                      rows={2}
                      value={item.desc || item.description || ''}
                      onChange={(e) => updateSubArrayItem('why_choose_us', 'items', idx, 'desc', e.target.value)}
                    />
                  </div>
                </div>
              ));
            })()}
          </div>
        </div>
      )}

      {/* TAB 7: HEADER & FOOTER */}
      {activeSubTab === 'footer' && (
        <div className="admin-card" style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#f4f4f5', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={18} color="#f59e0b" />
            Contact Info, Top Header Messages & Footer
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Footer Brand About Text</label>
              <textarea
                className="form-input"
                rows={2}
                value={cmsData.footer?.about_text || ''}
                onChange={(e) => updateField('footer', 'about_text', e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Customer Phone Number</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.footer?.phone || ''}
                onChange={(e) => updateField('footer', 'phone', e.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Customer Support Email</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.footer?.email || ''}
                onChange={(e) => updateField('footer', 'email', e.target.value)}
                placeholder="info@shreemahalaxmihardware.com"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Physical Showroom Address</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.footer?.address || ''}
                onChange={(e) => updateField('footer', 'address', e.target.value)}
                placeholder="123 Hardware Market, Ahmedabad"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Operating Hours</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.footer?.hours || ''}
                onChange={(e) => updateField('footer', 'hours', e.target.value)}
                placeholder="Mon - Sat: 9:00 AM - 7:00 PM"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>GSTIN Number</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.footer?.gstin || ''}
                onChange={(e) => updateField('footer', 'gstin', e.target.value)}
                placeholder="24AAACH7409R1ZZ"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: '#a1a1aa', marginBottom: '0.4rem' }}>Copyright Notice</label>
              <input
                type="text"
                className="form-input"
                value={cmsData.footer?.copyright || ''}
                onChange={(e) => updateField('footer', 'copyright', e.target.value)}
                placeholder="© 2026 Shree Mahalaxmi Hardware"
              />
            </div>

            <div style={{ gridColumn: '1 / -1', borderTop: '1px solid #27272a', paddingTop: '1.25rem', marginTop: '0.5rem' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#d4d4d8', marginBottom: '0.75rem' }}>Top Utility Bar Live Ticker Messages (4)</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Message 1</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cmsData.footer?.top_bar_message_1 || ''}
                    onChange={(e) => updateField('footer', 'top_bar_message_1', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Message 2</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cmsData.footer?.top_bar_message_2 || ''}
                    onChange={(e) => updateField('footer', 'top_bar_message_2', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Message 3</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cmsData.footer?.top_bar_message_3 || ''}
                    onChange={(e) => updateField('footer', 'top_bar_message_3', e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#a1a1aa', marginBottom: '0.25rem' }}>Message 4</label>
                  <input
                    type="text"
                    className="form-input"
                    value={cmsData.footer?.top_bar_message_4 || ''}
                    onChange={(e) => updateField('footer', 'top_bar_message_4', e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

