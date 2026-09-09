import React, { useState, useEffect } from 'react';
import { businessApi } from '../api/businessApi';

export function AdminDashboard({ token: propToken, onLogout }) {
  const [token] = useState(propToken || true);
  const [activeSubTab, setActiveSubTab] = useState('kpis');
  const [dashboardData, setDashboardData] = useState(null);
  const [aiJobs, setAiJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState(null);

  // Billing state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [customerProjects, setCustomerProjects] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [billItems, setBillItems] = useState([]);

  // Khata view state
  const [khataCustomer, setKhataCustomer] = useState('');
  const [khataDetails, setKhataDetails] = useState(null);

  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, [token]);

  const loadDashboardData = async (authToken) => {
    const t = authToken || token;
    if (!t) return;
    try {
      const stats = await businessApi.dashboard(t);
      setDashboardData(stats.data);

      const jobs = await businessApi.aiJobs(t);
      setAiJobs(jobs);

      const custs = await businessApi.customers(t);
      setCustomers(custs);

      const prods = await businessApi.products(t);
      setProducts(prods);

      const inv = await businessApi.inventory(t);
      setInventoryList(inv);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  };

  const handleCustomerChange = async (cust_id) => {
    setSelectedCustomer(cust_id);
    if (!cust_id) return;
    try {
      const projs = await businessApi.projects(token, cust_id);
      setCustomerProjects(projs);
    } catch (err) {
      console.error('Project load error:', err);
    }
  };

  const addProductToBill = (prod) => {
    setBillItems(prev => {
      const existing = prev.find(i => i.product_id === prod.id);
      if (existing) {
        return prev.map(i => i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { product_id: prod.id, name: prod.name, unit_price: Number(prod.selling_price), quantity: 1 }];
    });
  };

  const handleCreateBill = async () => {
    if (!selectedCustomer || billItems.length === 0) {
      setMsg('❌ Please select a customer and add at least one product.');
      return;
    }
    setLoading(true);
    try {
      const invPayload = {
        customer_id: selectedCustomer,
        project_id: selectedProject || null,
        discount: Number(discount) || 0,
        items: billItems.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price }))
      };
      const res = await businessApi.createInvoice(token, invPayload);
      setMsg(`✅ Invoice ${res.invoice_number} created successfully! Total: ₹${res.total}. Khata updated.`);
      setBillItems([]);
      loadDashboardData(token);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAIJob = async (jobId, action) => {
    try {
      await businessApi.approveAIJob(token, jobId, action);
      setMsg(`✅ AI Draft Order ${action === 'APPROVE' ? 'Approved & Confirmed' : 'Rejected'}.`);
      loadDashboardData(token);
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    }
  };

  const loadKhataView = async (cust_id) => {
    setKhataCustomer(cust_id);
    if (!cust_id) return;
    try {
      const res = await businessApi.khata(token, cust_id);
      setKhataDetails(res);
    } catch (err) {
      console.error('Khata view error:', err);
    }
  };

  // Subtotal calculation
  const subtotal = billItems.reduce((acc, item) => acc + (item.unit_price * item.quantity), 0);
  const tax = (subtotal - Number(discount || 0)) * 0.18;
  const total = subtotal - Number(discount || 0) + tax;

  return (
    <div style={{ maxWidth: '1200px', margin: '2rem auto', padding: '0 1rem' }}>
      {/* Top Banner */}
      <div style={{ background: '#0f172a', color: '#fff', padding: '1.5rem 2rem', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.6rem', color: '#38bdf8' }}>📊 Shop Owner Command Center</h2>
          <p style={{ margin: '0.25rem 0 0 0', color: '#94a3b8', fontSize: '0.9rem' }}>Mahalakshmi Hardware & Building Materials Management System</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => loadDashboardData(token)} style={{ background: '#334155', color: '#fff', border: '1px solid #475569', padding: '0.6rem 1.2rem', borderRadius: '8px', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
          <button
            onClick={() => {
              businessApi.logout().finally(() => {
                if (onLogout) onLogout();
              });
            }}
            style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '0.6rem 1.2rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>
        {[
          { id: 'kpis', label: '⚡ Dashboard & KPIs' },
          { id: 'ai', label: `🤖 Pending AI Orders (${dashboardData?.ai_pending_jobs || 0})` },
          { id: 'billing', label: '🧾 Quick Billing' },
          { id: 'khata', label: '💰 Digital Khata Ledger' },
          { id: 'inventory', label: `📦 Inventory & Reorder (${dashboardData?.low_stock_count || 0})` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            style={{
              padding: '0.75rem 1.25rem',
              border: 'none',
              background: activeSubTab === tab.id ? '#2563eb' : '#f1f5f9',
              color: activeSubTab === tab.id ? '#fff' : '#475569',
              fontWeight: 'bold',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Feedback Message */}
      {msg && (
        <div style={{ padding: '1rem', borderRadius: '8px', background: msg.includes('❌') ? '#fef2f2' : '#f0fdf4', color: msg.includes('❌') ? '#991b1b' : '#166534', border: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
          {msg}
        </div>
      )}

      {/* SUBTAB 1: KPIS & OVERVIEW */}
      {activeSubTab === 'kpis' && dashboardData && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #2563eb' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Total Sales</span>
              <h3 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0.25rem 0' }}>₹{dashboardData.today_sales}</h3>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #16a34a' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Payments Collected</span>
              <h3 style={{ fontSize: '1.8rem', color: '#16a34a', margin: '0.25rem 0' }}>₹{dashboardData.today_payments}</h3>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #dc2626' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Outstanding Balance</span>
              <h3 style={{ fontSize: '1.8rem', color: '#dc2626', margin: '0.25rem 0' }}>₹{dashboardData.total_outstanding}</h3>
            </div>
            <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', borderLeft: '4px solid #eab308' }}>
              <span style={{ fontSize: '0.85rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Low Stock Alert</span>
              <h3 style={{ fontSize: '1.8rem', color: '#ca8a04', margin: '0.25rem 0' }}>{dashboardData.low_stock_count} Items</h3>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 2: PENDING AI ORDERS REVIEW */}
      {activeSubTab === 'ai' && (
        <div>
          <h3 style={{ color: '#0f172a', marginBottom: '1rem' }}>🤖 AI Draft Orders Requiring Owner Approval</h3>
          {aiJobs.filter(j => j.status === 'REVIEW_REQUIRED').length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: '#fff', borderRadius: '12px', color: '#64748b' }}>
              No pending AI orders requiring review right now.
            </div>
          ) : (
            aiJobs.filter(j => j.status === 'REVIEW_REQUIRED').map(job => (
              <div key={job.id} style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <div>
                    <span style={{ background: '#eff6ff', color: '#2563eb', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', marginRight: '0.5rem' }}>
                      SOURCE: {job.source_type}
                    </span>
                    <strong style={{ fontSize: '1.05rem', color: '#0f172a' }}>Project: {job.detected_project || 'General Site'}</strong>
                  </div>
                  <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.35rem 0.75rem', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                    Confidence: {job.confidence_score}%
                  </span>
                </div>

                <p style={{ background: '#f8fafc', padding: '0.75rem', borderRadius: '6px', fontSize: '0.9rem', color: '#334155', fontStyle: 'italic', margin: '0.5rem 0 1rem 0' }}>
                  "{job.input_text}"
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleApproveAIJob(job.id, 'REJECT')} style={{ background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '0.6rem 1.25rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ❌ Reject Order
                  </button>
                  <button onClick={() => handleApproveAIJob(job.id, 'APPROVE')} style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '0.6rem 1.5rem', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                    ✅ Approve & Reserve Stock
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* SUBTAB 3: QUICK BILLING */}
      {activeSubTab === 'billing' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Customer & Product Selection */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>1. Select Customer & Project</h4>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Customer:</label>
              <select value={selectedCustomer} onChange={(e) => handleCustomerChange(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}>
                <option value="">-- Select Customer --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.customer_type})</option>)}
              </select>
            </div>

            {selectedCustomer && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ fontSize: '0.85rem', color: '#64748b' }}>Project (Optional):</label>
                <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '0.25rem' }}>
                  <option value="">-- Select Site Project --</option>
                  {customerProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            )}

            <h4 style={{ margin: '1rem 0 0.5rem 0', color: '#0f172a' }}>2. Add Products from Catalog</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', maxHeight: '320px', overflowY: 'auto' }}>
              {products.map(p => (
                <button
                  key={p.id}
                  onClick={() => addProductToBill(p)}
                  style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '8px', textAlign: 'left', cursor: 'pointer' }}
                >
                  <strong style={{ fontSize: '0.85rem', display: 'block', color: '#1e293b' }}>{p.name}</strong>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a' }}>₹{p.selling_price} / {p.unit}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Cart & Billing Summary */}
          <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>3. Bill Summary</h4>
              {billItems.length === 0 ? (
                <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No items added to bill yet.</p>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #cbd5e1', textAlign: 'left' }}>
                      <th style={{ padding: '0.5rem 0' }}>Item</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map(item => (
                      <tr key={item.product_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '0.5rem 0' }}>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>₹{item.unit_price}</td>
                        <td>₹{item.quantity * item.unit_price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {billItems.length > 0 && (
              <div style={{ borderTop: '2px solid #e2e8f0', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <span>Subtotal:</span> <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem', fontSize: '0.9rem' }}>
                  <span>GST (18%):</span> <span>₹{tax.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.2rem', color: '#0f172a', margin: '0.5rem 0' }}>
                  <span>Grand Total:</span> <span>₹{total.toFixed(2)}</span>
                </div>

                <button
                  onClick={handleCreateBill}
                  disabled={loading}
                  style={{ width: '100%', background: '#2563eb', color: '#fff', padding: '0.85rem', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '0.5rem' }}
                >
                  {loading ? 'Processing Invoice...' : '⚡ Generate Invoice & Update Khata'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: KHATA LEDGER VIEW */}
      {activeSubTab === 'khata' && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Digital Customer Ledger (Khata)</h4>
          <select value={khataCustomer} onChange={(e) => loadKhataView(e.target.value)} style={{ padding: '0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1', width: '300px', marginBottom: '1.5rem' }}>
            <option value="">-- Select Customer to View Khata --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          {khataDetails && (
            <div>
              <div style={{ display: 'flex', gap: '2rem', marginBottom: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '8px' }}>
                <div><span>Opening Balance:</span> <strong>₹{khataDetails.opening_balance}</strong></div>
                <div><span>Total Debit:</span> <strong style={{ color: '#2563eb' }}>₹{khataDetails.debit}</strong></div>
                <div><span>Total Credit:</span> <strong style={{ color: '#16a34a' }}>₹{khataDetails.credit}</strong></div>
                <div><span>Net Outstanding:</span> <strong style={{ color: '#dc2626' }}>₹{khataDetails.outstanding}</strong></div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem' }}>Type</th>
                    <th style={{ padding: '0.75rem' }}>Description</th>
                    <th style={{ padding: '0.75rem' }}>Debit (+)</th>
                    <th style={{ padding: '0.75rem' }}>Credit (-)</th>
                  </tr>
                </thead>
                <tbody>
                  {khataDetails.transactions.map((t, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '0.75rem', fontWeight: 'bold', color: t.type === 'CREDIT_SALE' ? '#2563eb' : '#16a34a' }}>{t.type}</td>
                      <td style={{ padding: '0.75rem' }}>{t.description}</td>
                      <td style={{ padding: '0.75rem' }}>{Number(t.debit) > 0 ? `₹${t.debit}` : '-'}</td>
                      <td style={{ padding: '0.75rem' }}>{Number(t.credit) > 0 ? `₹${t.credit}` : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 5: INVENTORY & REORDER */}
      {activeSubTab === 'inventory' && (
        <div style={{ background: '#fff', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Live Inventory Levels & Reorder Triggers</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem' }}>Product Name</th>
                <th style={{ padding: '0.75rem' }}>On Hand</th>
                <th style={{ padding: '0.75rem' }}>Reserved</th>
                <th style={{ padding: '0.75rem' }}>Available</th>
                <th style={{ padding: '0.75rem' }}>Reorder Level</th>
                <th style={{ padding: '0.75rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryList.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{item.product_name}</td>
                  <td style={{ padding: '0.75rem' }}>{item.on_hand}</td>
                  <td style={{ padding: '0.75rem', color: '#eab308' }}>{item.reserved}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 'bold', color: '#16a34a' }}>{item.available}</td>
                  <td style={{ padding: '0.75rem' }}>{item.reorder_level}</td>
                  <td style={{ padding: '0.75rem' }}>
                    {item.available <= item.reorder_level ? (
                      <span style={{ background: '#fef2f2', color: '#dc2626', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        ⚠️ LOW STOCK
                      </span>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        IN STOCK
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

