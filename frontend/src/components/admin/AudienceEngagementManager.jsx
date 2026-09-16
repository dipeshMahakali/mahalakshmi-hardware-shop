import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Heart, ArrowRight, RefreshCw, Receipt, 
  TrendingUp, Users, Clock, CheckCircle, Package 
} from 'lucide-react';
import { businessApi } from '../../api/businessApi';
import { formatINR } from '../../utils/currency';

export function AudienceEngagementManager({ token, onConvertToPos }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadEngagement();
  }, []);

  const loadEngagement = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await businessApi.getStorefrontEngagement(token);
      setData(res);
    } catch (err) {
      console.warn('Failed to load engagement data:', err);
      setError(err.message || 'Could not load engagement telemetry.');
    } finally {
      setLoading(false);
    }
  };

  const activeCarts = data?.active_carts || [];
  const topWishlisted = data?.top_wishlisted || [];
  const pipelineValue = data?.total_pipeline_value || 0;
  const totalWishlistEntries = data?.total_wishlist_entries || 0;

  const handleConvertCart = (cartSession) => {
    if (!cartSession.items || cartSession.items.length === 0) {
      alert('This cart session is currently empty.');
      return;
    }
    if (onConvertToPos) {
      onConvertToPos(cartSession);
    }
  };

  return (
    <div className="admin-engagement-hub" style={{ padding: '0.5rem 0' }}>
      {/* Header Banner */}
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
            <ShoppingCart size={22} color="#f59e0b" />
            Live Customer Carts & Wishlist Telemetry
          </h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#a1a1aa', fontSize: '0.88rem' }}>
            Real-time storefront engagement. Monitor items currently in customer baskets and 1-click convert customer carts into active POS Invoices.
          </p>
        </div>

        <button
          type="button"
          className="btn-secondary"
          onClick={loadEngagement}
          disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem' }}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          Refresh Carts
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b', fontSize: '0.85rem', fontWeight: 600 }}>
            <ShoppingCart size={16} /> Active Shopping Carts
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f4f4f5', margin: '0.4rem 0 0.2rem' }}>
            {activeCarts.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Browsing live on storefront</div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontSize: '0.85rem', fontWeight: 600 }}>
            <TrendingUp size={16} /> Total Pipeline Basket Value
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#10b981', margin: '0.4rem 0 0.2rem' }}>
            {formatINR(pipelineValue)}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Potential sales in active sessions</div>
        </div>

        <div style={{ background: '#18181b', border: '1px solid #27272a', padding: '1.25rem', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ec4899', fontSize: '0.85rem', fontWeight: 600 }}>
            <Heart size={16} /> Wishlist Intent Signals
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f4f4f5', margin: '0.4rem 0 0.2rem' }}>
            {totalWishlistEntries}
          </div>
          <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Saved hardware items</div>
        </div>
      </div>

      {/* Grid: Active Carts (Left) & Top Wishlisted (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
        {/* Active Carts Panel */}
        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingCart size={18} color="#f59e0b" />
              Active Customer Cart Sessions ({activeCarts.length})
            </h3>
          </div>

          {activeCarts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>
              No active customer cart sessions at the moment. As visitors add items, they appear here live.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activeCarts.map((cart, idx) => (
                <div
                  key={cart.id || idx}
                  style={{
                    background: '#27272a',
                    border: '1px solid #3f3f46',
                    borderRadius: '10px',
                    padding: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f4f4f5', fontSize: '0.95rem' }}>
                        {cart.customer_name || `Store Guest (${(cart.session_token || '').substring(0, 10)}...)`}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa', marginTop: '0.2rem' }}>
                        Last Active: {cart.updated_at ? new Date(cart.updated_at).toLocaleTimeString() : 'Just now'}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#10b981' }}>
                        {formatINR(cart.total_value)}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#a1a1aa' }}>
                        {cart.items_count} items
                      </div>
                    </div>
                  </div>

                  {/* Items preview */}
                  <div style={{ background: '#18181b', borderRadius: '6px', padding: '0.6rem 0.8rem', marginBottom: '0.75rem', fontSize: '0.82rem' }}>
                    {(cart.items || []).map((item, iIdx) => (
                      <div key={item.id || iIdx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: iIdx === cart.items.length - 1 ? 'none' : '1px solid #27272a' }}>
                        <span style={{ color: '#d4d4d8' }}>{item.quantity}x {item.product_name}</span>
                        <span style={{ color: '#a1a1aa' }}>{formatINR(item.unit_price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* 1-Click Convert to POS Bill */}
                  <button
                    type="button"
                    onClick={() => handleConvertCart(cart)}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      padding: '0.6rem',
                      borderRadius: '6px',
                      background: '#d97706',
                      border: '1px solid #b45309',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <Receipt size={16} />
                    Convert Cart to POS Draft Bill
                    <ArrowRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Wishlisted Demand Panel */}
        <div style={{ background: '#18181b', border: '1px solid #27272a', borderRadius: '12px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid #27272a', paddingBottom: '0.75rem' }}>
            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: '#f4f4f5', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Heart size={18} color="#ec4899" />
              Top Wishlisted Hardware (Demand Leaderboard)
            </h3>
          </div>

          {topWishlisted.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#71717a' }}>
              No customer wishlist items recorded yet. When shoppers save products, they will rank here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {topWishlisted.map((item, idx) => (
                <div
                  key={item.product_id || idx}
                  style={{
                    background: '#27272a',
                    borderRadius: '8px',
                    padding: '0.85rem 1rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: '1px solid #3f3f46'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: idx === 0 ? '#f59e0b20' : '#3f3f46',
                      color: idx === 0 ? '#f59e0b' : '#a1a1aa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.85rem'
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#f4f4f5', fontSize: '0.9rem' }}>{item.product_name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#a1a1aa' }}>SKU: {item.sku}</div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#ec4899', fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.3rem', justifyContent: 'flex-end' }}>
                      <Heart size={14} fill="#ec4899" /> {item.count} saves
                    </div>
                    <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 500 }}>
                      {formatINR(item.selling_price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

