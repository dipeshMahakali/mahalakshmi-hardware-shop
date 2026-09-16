import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  CircleDollarSign,
  CreditCard,
  Package,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Wallet,
  X
} from 'lucide-react';
import { businessApi } from '../api/businessApi';
import { formatINR } from '../utils/currency';
import { CatalogShowcaseManager } from './admin/CatalogShowcaseManager';
import { StorefrontCMSManager } from './admin/StorefrontCMSManager';
import { AudienceEngagementManager } from './admin/AudienceEngagementManager';

export function AdminDashboard({
  token: propToken,
  activeTab: propActiveTab,
  onTabChange,
  onStatsUpdate
}) {
  const [token] = useState(propToken || true);
  const [localActiveTab, setLocalActiveTab] = useState('kpis');
  const currentTab = propActiveTab || localActiveTab;

  const handleTabSwitch = (tabId) => {
    setLocalActiveTab(tabId);
    if (onTabChange) onTabChange(tabId);
  };

  const handleConvertCartToPos = (cartSession) => {
    const convertedItems = (cartSession.items || []).map(item => {
      const existingProduct = products.find(p => p.id === item.product_id || p.sku === item.sku);
      return {
        product_id: item.product_id || existingProduct?.id || 1,
        product_name: item.product_name || existingProduct?.name || 'Hardware Item',
        sku: item.sku || existingProduct?.sku || '',
        quantity: Number(item.quantity) || 1,
        unit_price: Number(item.unit_price) || Number(existingProduct?.selling_price) || 0,
        tax_rate: Number(existingProduct?.tax_rate) || 18,
        stock_available: existingProduct?.stock_quantity ?? 20
      };
    });
    setBillItems(convertedItems);
    handleTabSwitch('billing');
    setMsg({ type: 'success', text: `Loaded ${convertedItems.length} items from online customer cart into POS Bill!` });
  };

  const [dashboardData, setDashboardData] = useState(null);
  const [aiJobs, setAiJobs] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [inventoryList, setInventoryList] = useState([]);
  const [invoicesList, setInvoicesList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [msg, setMsg] = useState(null);

  // Billing (POS) state
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [customerProjects, setCustomerProjects] = useState([]);
  const [discount, setDiscount] = useState('0');
  const [billItems, setBillItems] = useState([]);
  const [productSearchQuery, setProductSearchQuery] = useState('');

  // Khata view state
  const [khataCustomer, setKhataCustomer] = useState('');
  const [khataDetails, setKhataDetails] = useState(null);
  const [khataLoading, setKhataLoading] = useState(false);

  // Modals state
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    customer_type: 'RETAIL',
    opening_balance: '0'
  });

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    invoice_id: '',
    amount: '',
    method: 'CASH',
    reference: '',
    notes: ''
  });

  // Filters
  const [aiFilter, setAiFilter] = useState('REVIEW_REQUIRED');
  const [inventorySearchQuery, setInventorySearchQuery] = useState('');
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');

  useEffect(() => {
    if (token) {
      loadDashboardData(token);
    }
  }, [token]);

  const loadDashboardData = async (authToken) => {
    const t = authToken || token;
    if (!t) return;
    setRefreshing(true);
    try {
      const [statsRes, jobsRes, custsRes, prodsRes, invRes, invsRes] = await Promise.allSettled([
        businessApi.dashboard(t),
        businessApi.aiJobs(t),
        businessApi.customers(t),
        businessApi.products(t),
        businessApi.inventory(t),
        businessApi.invoices(t)
      ]);

      if (statsRes.status === 'fulfilled' && statsRes.value?.data) {
        setDashboardData(statsRes.value.data);
        if (onStatsUpdate) {
          onStatsUpdate({
            aiJobs: statsRes.value.data.ai_pending_jobs || 0,
            lowStock: statsRes.value.data.low_stock_count || 0
          });
        }
      }

      if (jobsRes.status === 'fulfilled' && Array.isArray(jobsRes.value)) {
        setAiJobs(jobsRes.value);
      }

      if (custsRes.status === 'fulfilled' && Array.isArray(custsRes.value)) {
        setCustomers(custsRes.value);
      }

      if (prodsRes.status === 'fulfilled' && Array.isArray(prodsRes.value)) {
        setProducts(prodsRes.value);
      }

      if (invRes.status === 'fulfilled' && Array.isArray(invRes.value)) {
        setInventoryList(invRes.value);
      }

      if (invsRes.status === 'fulfilled' && Array.isArray(invsRes.value)) {
        setInvoicesList(invsRes.value);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCustomerChange = async (custId) => {
    setSelectedCustomer(custId);
    setSelectedProject('');
    if (!custId) {
      setCustomerProjects([]);
      return;
    }
    try {
      const projs = await businessApi.projects(token, custId);
      setCustomerProjects(projs || []);
    } catch (err) {
      console.error('Project load error:', err);
      setCustomerProjects([]);
    }
  };

  const addProductToBill = (prod) => {
    setBillItems((prev) => {
      const existing = prev.find((i) => i.product_id === prod.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === prod.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          product_id: prod.id,
          name: prod.name,
          unit_price: Number(prod.selling_price),
          unit: prod.unit || 'piece',
          quantity: 1
        }
      ];
    });
  };

  const updateBillItemQty = (productId, delta) => {
    setBillItems((prev) =>
      prev
        .map((item) => {
          if (item.product_id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeBillItem = (productId) => {
    setBillItems((prev) => prev.filter((i) => i.product_id !== productId));
  };

  // Subtotal, tax, grand total calculation
  const subtotal = useMemo(() => {
    return billItems.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);
  }, [billItems]);

  const discountAmount = useMemo(() => {
    const val = Number(discount) || 0;
    return Math.min(val, subtotal);
  }, [discount, subtotal]);

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const tax = taxableAmount * 0.18;
  const grandTotal = taxableAmount + tax;

  const handleCreateBill = async () => {
    if (!selectedCustomer) {
      setMsg({ type: 'error', text: 'Please select a customer to issue the invoice to.' });
      return;
    }
    if (billItems.length === 0) {
      setMsg({ type: 'error', text: 'Please add at least one item from the catalog.' });
      return;
    }
    setLoading(true);
    try {
      const invPayload = {
        customer_id: selectedCustomer,
        project_id: selectedProject || null,
        discount: Number(discount) || 0,
        items: billItems.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          unit_price: i.unit_price
        }))
      };
      const res = await businessApi.createInvoice(token, invPayload);
      setMsg({
        type: 'success',
        text: `Invoice #${res.invoice_number} created successfully for ${formatINR(res.total)}! Khata balance updated.`
      });
      setBillItems([]);
      setDiscount('0');
      setSelectedProject('');
      loadDashboardData(token);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to generate invoice.' });
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAIJob = async (jobId, action) => {
    try {
      await businessApi.approveAIJob(token, jobId, action);
      setMsg({
        type: 'success',
        text: `AI Draft Order ${action === 'APPROVE' ? 'Approved & Confirmed' : 'Rejected'}.`
      });
      loadDashboardData(token);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to update AI order.' });
    }
  };

  const loadKhataView = async (custId) => {
    setKhataCustomer(custId);
    if (!custId) {
      setKhataDetails(null);
      return;
    }
    setKhataLoading(true);
    try {
      const res = await businessApi.khata(token, custId);
      setKhataDetails(res);
    } catch (err) {
      console.error('Khata view error:', err);
      setKhataDetails(null);
    } finally {
      setKhataLoading(false);
    }
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!newCustomer.name.trim() || !newCustomer.phone.trim()) {
      setMsg({ type: 'error', text: 'Please provide customer name and phone number.' });
      return;
    }
    try {
      const created = await businessApi.createCustomer(token, {
        name: newCustomer.name.trim(),
        phone: newCustomer.phone.trim(),
        customer_type: newCustomer.customer_type,
        opening_balance: Number(newCustomer.opening_balance) || 0
      });
      setMsg({
        type: 'success',
        text: `Customer "${created.name}" created successfully!`
      });
      setIsCustomerModalOpen(false);
      setNewCustomer({ name: '', phone: '', customer_type: 'RETAIL', opening_balance: '0' });
      await loadDashboardData(token);
      setSelectedCustomer(created.id);
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to create customer.' });
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.invoice_id) {
      setMsg({ type: 'error', text: 'Please select an unpaid invoice.' });
      return;
    }
    const amt = Number(paymentForm.amount);
    if (!amt || amt <= 0) {
      setMsg({ type: 'error', text: 'Please enter a valid payment amount.' });
      return;
    }
    try {
      await businessApi.recordPayment(token, {
        invoice_id: paymentForm.invoice_id,
        amount: amt,
        method: paymentForm.method,
        reference: paymentForm.reference || null,
        notes: paymentForm.notes || null
      });
      setMsg({
        type: 'success',
        text: `Payment of ${formatINR(amt)} successfully recorded! Khata ledger updated.`
      });
      setIsPaymentModalOpen(false);
      setPaymentForm({ invoice_id: '', amount: '', method: 'CASH', reference: '', notes: '' });
      await loadDashboardData(token);
      if (khataCustomer) {
        await loadKhataView(khataCustomer);
      }
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Failed to record payment.' });
    }
  };

  // Filtered catalog products for POS
  const filteredProducts = useMemo(() => {
    if (!productSearchQuery.trim()) return products;
    const q = productSearchQuery.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q))
    );
  }, [products, productSearchQuery]);

  // Filtered inventory items
  const filteredInventory = useMemo(() => {
    if (!inventorySearchQuery.trim()) return inventoryList;
    const q = inventorySearchQuery.toLowerCase();
    return inventoryList.filter(
      (item) =>
        (item.product_name && item.product_name.toLowerCase().includes(q)) ||
        (item.product_id && item.product_id.toLowerCase().includes(q))
    );
  }, [inventoryList, inventorySearchQuery]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    if (!customerSearchQuery.trim()) return customers;
    const q = customerSearchQuery.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.customer_type && c.customer_type.toLowerCase().includes(q))
    );
  }, [customers, customerSearchQuery]);

  // Filtered AI jobs
  const filteredAiJobs = useMemo(() => {
    if (aiFilter === 'REVIEW_REQUIRED') {
      return aiJobs.filter((j) => j.status === 'REVIEW_REQUIRED');
    }
    return aiJobs;
  }, [aiJobs, aiFilter]);

  // Unpaid invoices for selected khata customer
  const customerUnpaidInvoices = useMemo(() => {
    if (!khataCustomer) return [];
    return invoicesList.filter(
      (inv) => inv.customer_id === khataCustomer && Number(inv.outstanding) > 0
    );
  }, [khataCustomer, invoicesList]);

  return (
    <div className="admin-container">
      {/* Feedback Banner */}
      {msg && (
        <div className={`admin-feedback ${msg.type === 'error' ? 'error' : 'success'}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {msg.type === 'error' ? <AlertCircle size={18} /> : <Check size={18} />}
            <span>{msg.text}</span>
          </div>
          <button
            type="button"
            className="admin-feedback-close"
            onClick={() => setMsg(null)}
            title="Dismiss message"
          >
            &times;
          </button>
        </div>
      )}

      {/* =========================================================================
          TAB 1: EXECUTIVE OVERVIEW & OPERATIONS (kpis)
          ========================================================================= */}
      {currentTab === 'kpis' && (
        <div>
          {/* KPI Metrics Grid */}
          <div className="admin-kpi-grid">
            <div className="admin-kpi-card kpi-revenue">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Total Revenue Invoiced</span>
                <div className="admin-kpi-icon">
                  <TrendingUp size={20} />
                </div>
              </div>
              <div className="admin-kpi-val">
                {formatINR(dashboardData?.today_sales || 0)}
              </div>
              <div className="admin-kpi-sub">
                <ArrowUpRight size={13} style={{ color: '#10B981' }} />
                <span>Cumulative verified sales</span>
              </div>
            </div>

            <div className="admin-kpi-card kpi-collected">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Payments Received</span>
                <div className="admin-kpi-icon">
                  <CircleDollarSign size={20} />
                </div>
              </div>
              <div className="admin-kpi-val">
                {formatINR(dashboardData?.today_payments || 0)}
              </div>
              <div className="admin-kpi-sub">
                <span>Bank, Cash, UPI settled</span>
              </div>
            </div>

            <div className="admin-kpi-card kpi-outstanding">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Khata Credit Outstanding</span>
                <div className="admin-kpi-icon">
                  <AlertCircle size={20} />
                </div>
              </div>
              <div className="admin-kpi-val" style={{ color: '#F87171' }}>
                {formatINR(dashboardData?.total_outstanding || 0)}
              </div>
              <div className="admin-kpi-sub">
                <span>Active contractor dues</span>
              </div>
            </div>

            <div className="admin-kpi-card kpi-inventory">
              <div className="admin-kpi-top">
                <span className="admin-kpi-label">Low Stock Warnings</span>
                <div className="admin-kpi-icon">
                  <AlertTriangle size={20} />
                </div>
              </div>
              <div className="admin-kpi-val" style={{ color: '#FBBF24' }}>
                {dashboardData?.low_stock_count || 0} SKUs
              </div>
              <div className="admin-kpi-sub">
                <span>Items below reorder point</span>
              </div>
            </div>
          </div>

          {/* Quick Actions Ribbon */}
          <div className="admin-actions-bar">
            <div className="admin-actions-group">
              <button
                type="button"
                className="admin-action-btn primary"
                onClick={() => handleTabSwitch('billing')}
              >
                <Plus size={15} />
                <span>Create New Bill</span>
              </button>

              <button
                type="button"
                className="admin-action-btn"
                onClick={() => setIsCustomerModalOpen(true)}
              >
                <Users size={15} />
                <span>Add Customer</span>
              </button>

              <button
                type="button"
                className="admin-action-btn"
                onClick={() => handleTabSwitch('inventory')}
              >
                <Package size={15} />
                <span>Check Inventory</span>
              </button>

              <button
                type="button"
                className="admin-action-btn"
                onClick={() => handleTabSwitch('khata')}
              >
                <Wallet size={15} />
                <span>Customer Khata</span>
              </button>
            </div>

            <button
              type="button"
              className="admin-action-btn"
              onClick={() => loadDashboardData(token)}
              disabled={refreshing}
              title="Refresh live data from server"
            >
              <RefreshCw
                size={14}
                style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }}
              />
              <span>{refreshing ? 'Syncing...' : 'Sync Live Data'}</span>
            </button>
          </div>

          {/* Operations Split View */}
          <div className="admin-ops-grid">
            {/* Left Column: Recent Invoices Ledger */}
            <div className="admin-card">
              <div className="admin-card-header">
                <h3 className="admin-card-title">
                  <Receipt size={17} style={{ color: '#F47B20' }} />
                  <span>Recent Sales Invoices</span>
                </h3>
                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  onClick={() => handleTabSwitch('billing')}
                >
                  <Plus size={13} />
                  <span>New Invoice</span>
                </button>
              </div>

              {invoicesList.length === 0 ? (
                <div className="admin-empty-state">
                  <Receipt className="admin-empty-icon" />
                  <p>No invoices created yet. Use Quick Billing to generate your first bill.</p>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Invoice #</th>
                        <th>Customer</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoicesList.slice(0, 6).map((inv) => {
                        const cust = customers.find((c) => c.id === inv.customer_id);
                        return (
                          <tr key={inv.id}>
                            <td style={{ fontWeight: 700, color: '#FFFFFF' }}>
                              {inv.invoice_number}
                            </td>
                            <td>{cust?.name || 'Walk-in Customer'}</td>
                            <td>
                              <span
                                className={`badge-status ${
                                  inv.status === 'PAID'
                                    ? 'paid'
                                    : inv.status === 'PARTIALLY_PAID'
                                    ? 'partial'
                                    : 'pending'
                                }`}
                              >
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ color: '#94A3B8' }}>
                              {inv.created_at ? new Date(inv.created_at).toLocaleDateString('en-IN') : 'Recent'}
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: 700, color: '#10B981' }}>
                              {formatINR(inv.total)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Right Column: Pending Action Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* AI Draft Orders Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <Sparkles size={17} style={{ color: '#D4AF37' }} />
                    <span>AI Carpenter Draft Orders</span>
                  </h3>
                  <span
                    className={`badge-status ${
                      aiJobs.filter((j) => j.status === 'REVIEW_REQUIRED').length > 0
                        ? 'review'
                        : 'active'
                    }`}
                  >
                    {aiJobs.filter((j) => j.status === 'REVIEW_REQUIRED').length} Pending
                  </span>
                </div>

                {aiJobs.filter((j) => j.status === 'REVIEW_REQUIRED').length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px 12px', color: '#64748B' }}>
                    <Check size={28} style={{ color: '#10B981', margin: '0 auto 8px', display: 'block' }} />
                    <p style={{ margin: 0, fontSize: '13px' }}>All AI orders have been reviewed!</p>
                  </div>
                ) : (
                  aiJobs
                    .filter((j) => j.status === 'REVIEW_REQUIRED')
                    .slice(0, 3)
                    .map((job) => (
                      <div key={job.id} className="admin-ai-card">
                        <div className="admin-ai-card-top">
                          <span className="badge-status source">
                            {job.source_type} ORDER
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 700,
                              color: Number(job.confidence_score) >= 80 ? '#10B981' : '#F59E0B'
                            }}
                          >
                            {Number(job.confidence_score).toFixed(0)}% Match
                          </span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                          Project: {job.detected_project || 'General Hardware'}
                        </div>
                        <div className="admin-ai-prompt">
                          "{job.input_text}"
                        </div>
                        <div className="admin-ai-actions">
                          <button
                            type="button"
                            className="admin-action-btn"
                            style={{ padding: '5px 10px', fontSize: '11.5px', color: '#F87171' }}
                            onClick={() => handleApproveAIJob(job.id, 'REJECT')}
                          >
                            <X size={13} />
                            <span>Reject</span>
                          </button>
                          <button
                            type="button"
                            className="admin-action-btn primary"
                            style={{ padding: '5px 12px', fontSize: '11.5px' }}
                            onClick={() => handleApproveAIJob(job.id, 'APPROVE')}
                          >
                            <Check size={13} />
                            <span>Approve & Reserve</span>
                          </button>
                        </div>
                      </div>
                    ))
                )}
              </div>

              {/* Critical Low Stock Items Card */}
              <div className="admin-card">
                <div className="admin-card-header">
                  <h3 className="admin-card-title">
                    <AlertTriangle size={17} style={{ color: '#F59E0B' }} />
                    <span>Low Stock Reorders</span>
                  </h3>
                  <button
                    type="button"
                    className="admin-action-btn"
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                    onClick={() => handleTabSwitch('inventory')}
                  >
                    <span>View All</span>
                  </button>
                </div>

                {inventoryList.filter((item) => Number(item.available) <= Number(item.reorder_level)).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '20px 12px', color: '#64748B' }}>
                    <p style={{ margin: 0, fontSize: '13px' }}>All product inventory levels are healthy.</p>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inventoryList
                      .filter((item) => Number(item.available) <= Number(item.reorder_level))
                      .slice(0, 3)
                      .map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '10px 12px',
                            background: '#111317',
                            borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
                              {item.product_name}
                            </div>
                            <div style={{ fontSize: '11px', color: '#94A3B8' }}>
                              Reorder at: {item.reorder_level} units
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span className="badge-status lowstock">
                              {item.available} Left
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: POINT OF SALE (POS) & INVOICING (billing)
          ========================================================================= */}
      {currentTab === 'billing' && (
        <div className="admin-billing-grid">
          {/* Left: Customer, Project & Catalog Picker */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <Receipt size={17} style={{ color: '#F47B20' }} />
                <span>1. Select Customer & Add Products</span>
              </h3>
              <button
                type="button"
                className="admin-action-btn"
                style={{ padding: '5px 10px', fontSize: '12px' }}
                onClick={() => setIsCustomerModalOpen(true)}
              >
                <Plus size={13} />
                <span>New Customer</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-label">Customer / Contractor:</label>
                <select
                  className="admin-select"
                  value={selectedCustomer}
                  onChange={(e) => handleCustomerChange(e.target.value)}
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.customer_type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="admin-form-group" style={{ margin: 0 }}>
                <label className="admin-label">Site Project (Optional):</label>
                <select
                  className="admin-select"
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  disabled={!selectedCustomer}
                >
                  <option value="">-- General Walk-in / Site --</option>
                  {customerProjects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Catalog Search & Grid */}
            <div style={{ marginBottom: '14px' }}>
              <div style={{ position: 'relative' }}>
                <Search
                  size={15}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#64748B'
                  }}
                />
                <input
                  type="text"
                  className="admin-input"
                  style={{ paddingLeft: '34px' }}
                  placeholder="Search catalog products by name, SKU or category..."
                  value={productSearchQuery}
                  onChange={(e) => setProductSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="admin-product-picker-grid">
              {filteredProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="admin-product-btn"
                  onClick={() => addProductToBill(p)}
                  title={`Click to add ${p.name}`}
                >
                  <div>
                    <strong>{p.name}</strong>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>
                      SKU: {p.sku} &bull; {p.unit || 'pc'}
                    </span>
                  </div>
                  <div className="admin-product-btn-footer">
                    <span className="admin-product-price">{formatINR(p.selling_price)}</span>
                    <span
                      style={{
                        fontSize: '11px',
                        background: 'rgba(244, 123, 32, 0.15)',
                        color: '#F47B20',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontWeight: 700
                      }}
                    >
                      + Add
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Cart & Invoice Summary */}
          <div className="admin-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="admin-card-header">
              <h3 className="admin-card-title">
                <CreditCard size={17} style={{ color: '#10B981' }} />
                <span>2. Cart & Tax Invoice Summary</span>
              </h3>
              {billItems.length > 0 && (
                <button
                  type="button"
                  className="admin-action-btn"
                  style={{ padding: '4px 8px', fontSize: '11.5px', color: '#F87171' }}
                  onClick={() => setBillItems([])}
                >
                  <Trash2 size={13} />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <div style={{ flex: 1 }}>
              {billItems.length === 0 ? (
                <div className="admin-empty-state" style={{ padding: '60px 20px' }}>
                  <Receipt className="admin-empty-icon" />
                  <p>Cart is currently empty. Click on products from the catalog on the left to add items.</p>
                </div>
              ) : (
                <div className="admin-table-container" style={{ maxHeight: '280px' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th style={{ textAlign: 'right' }}>Total</th>
                        <th style={{ width: '30px' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item) => (
                        <tr key={item.product_id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#FFFFFF' }}>{item.name}</div>
                            <small style={{ color: '#94A3B8' }}>{formatINR(item.unit_price)} / {item.unit}</small>
                          </td>
                          <td>
                            <div className="admin-qty-control">
                              <button
                                type="button"
                                className="admin-qty-btn"
                                onClick={() => updateBillItemQty(item.product_id, -1)}
                              >
                                -
                              </button>
                              <span style={{ minWidth: '20px', textAlign: 'center', fontWeight: 700 }}>
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                className="admin-qty-btn"
                                onClick={() => updateBillItemQty(item.product_id, 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td>{formatINR(item.unit_price)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700, color: '#FFFFFF' }}>
                            {formatINR(item.quantity * item.unit_price)}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => removeBillItem(item.product_id)}
                              style={{ background: 'none', border: 'none', color: '#F87171', cursor: 'pointer', padding: '4px' }}
                              title="Remove item"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bill Summary Footer */}
            {billItems.length > 0 && (
              <div className="admin-bill-summary">
                <div className="admin-bill-row">
                  <span>Subtotal:</span>
                  <span>{formatINR(subtotal, true)}</span>
                </div>

                <div className="admin-bill-row" style={{ alignItems: 'center' }}>
                  <span>Discount (₹):</span>
                  <input
                    type="number"
                    min="0"
                    className="admin-input"
                    style={{ width: '100px', padding: '4px 8px', textAlign: 'right' }}
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                  />
                </div>

                <div className="admin-bill-row">
                  <span>GST (18% Estimated):</span>
                  <span>{formatINR(tax, true)}</span>
                </div>

                <div className="admin-bill-total-row">
                  <span>Grand Total:</span>
                  <span style={{ color: '#F47B20' }}>{formatINR(grandTotal, true)}</span>
                </div>

                <button
                  type="button"
                  className="admin-action-btn primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '12px',
                    fontSize: '14px',
                    fontWeight: 800,
                    marginTop: '16px'
                  }}
                  disabled={loading}
                  onClick={handleCreateBill}
                >
                  <Receipt size={17} />
                  <span>{loading ? 'Issuing Tax Invoice...' : 'Generate Tax Invoice & Update Khata'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 3: CUSTOMERS & CONTRACTORS DIRECTORY (customers)
          ========================================================================= */}
      {currentTab === 'customers' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Users size={17} style={{ color: '#F47B20' }} />
              <span>Customer & Contractor Master Directory</span>
            </h3>
            <button
              type="button"
              className="admin-action-btn primary"
              onClick={() => setIsCustomerModalOpen(true)}
            >
              <Plus size={15} />
              <span>Add New Customer</span>
            </button>
          </div>

          <div style={{ marginBottom: '16px', maxWidth: '360px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B'
                }}
              />
              <input
                type="text"
                className="admin-input"
                style={{ paddingLeft: '34px' }}
                placeholder="Search customers by name, phone, type..."
                value={customerSearchQuery}
                onChange={(e) => setCustomerSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Category</th>
                  <th>Contact Phone</th>
                  <th>Opening Balance</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No customers found matching your search query.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map((c) => (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{c.name}</td>
                      <td>
                        <span className="badge-status active">{c.customer_type}</span>
                      </td>
                      <td style={{ color: '#94A3B8' }}>{c.phone}</td>
                      <td style={{ fontWeight: 600 }}>{formatINR(c.opening_balance)}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-action-btn"
                          style={{ padding: '5px 12px', fontSize: '11.5px' }}
                          onClick={() => {
                            handleTabSwitch('khata');
                            loadKhataView(c.id);
                          }}
                        >
                          <Wallet size={13} />
                          <span>View Khata</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: DIGITAL KHATA LEDGER (khata)
          ========================================================================= */}
      {currentTab === 'khata' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Wallet size={17} style={{ color: '#F47B20' }} />
              <span>Digital Customer Credit Khata Ledger</span>
            </h3>
            {khataCustomer && khataDetails && (
              <button
                type="button"
                className="admin-action-btn primary"
                onClick={() => {
                  setPaymentForm({
                    invoice_id: customerUnpaidInvoices[0]?.id || '',
                    amount: String(customerUnpaidInvoices[0]?.outstanding || khataDetails.outstanding || ''),
                    method: 'CASH',
                    reference: '',
                    notes: ''
                  });
                  setIsPaymentModalOpen(true);
                }}
              >
                <Plus size={14} />
                <span>Record Payment Received</span>
              </button>
            )}
          </div>

          <div style={{ maxWidth: '380px', marginBottom: '20px' }}>
            <label className="admin-label">Select Customer to View Khata Statement:</label>
            <select
              className="admin-select"
              value={khataCustomer}
              onChange={(e) => loadKhataView(e.target.value)}
            >
              <option value="">-- Choose Customer --</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customer_type})
                </option>
              ))}
            </select>
          </div>

          {khataLoading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94A3B8' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 10px', display: 'block' }} />
              Loading Khata transactions...
            </div>
          )}

          {!khataLoading && !khataDetails && (
            <div className="admin-empty-state">
              <Wallet className="admin-empty-icon" />
              <p>Select a customer above to view their running balance, debit/credit ledger, and record settlements.</p>
            </div>
          )}

          {!khataLoading && khataDetails && (
            <div>
              {/* Summary Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '14px',
                  marginBottom: '20px'
                }}
              >
                <div style={{ background: '#111317', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Opening Balance
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginTop: '4px' }}>
                    {formatINR(khataDetails.opening_balance)}
                  </div>
                </div>

                <div style={{ background: '#111317', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Sales Debit (+)
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#38BDF8', marginTop: '4px' }}>
                    {formatINR(khataDetails.debit)}
                  </div>
                </div>

                <div style={{ background: '#111317', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <span style={{ fontSize: '11.5px', color: '#94A3B8', textTransform: 'uppercase', fontWeight: 700 }}>
                    Total Settled Credit (-)
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#10B981', marginTop: '4px' }}>
                    {formatINR(khataDetails.credit)}
                  </div>
                </div>

                <div style={{ background: '#111317', padding: '14px 18px', borderRadius: '10px', border: '1px solid rgba(239, 68, 68, 0.25)' }}>
                  <span style={{ fontSize: '11.5px', color: '#F87171', textTransform: 'uppercase', fontWeight: 700 }}>
                    Net Outstanding Dues
                  </span>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#EF4444', marginTop: '4px' }}>
                    {formatINR(khataDetails.outstanding)}
                  </div>
                </div>
              </div>

              {/* Transactions Table */}
              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Transaction Description</th>
                      <th>Debit (+)</th>
                      <th>Credit (-)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khataDetails.transactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748B' }}>
                          No transactions recorded for this customer yet.
                        </td>
                      </tr>
                    ) : (
                      khataDetails.transactions.map((t, idx) => (
                        <tr key={idx}>
                          <td>
                            <span
                              className={`badge-status ${
                                t.type === 'CREDIT_SALE' || t.type === 'DEBIT' ? 'partial' : 'paid'
                              }`}
                            >
                              {t.type}
                            </span>
                          </td>
                          <td style={{ color: '#FFFFFF' }}>{t.description}</td>
                          <td style={{ color: Number(t.debit) > 0 ? '#38BDF8' : '#64748B', fontWeight: 600 }}>
                            {Number(t.debit) > 0 ? formatINR(t.debit) : '-'}
                          </td>
                          <td style={{ color: Number(t.credit) > 0 ? '#10B981' : '#64748B', fontWeight: 600 }}>
                            {Number(t.credit) > 0 ? formatINR(t.credit) : '-'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 5: LIVE INVENTORY & REORDER HEALTH (inventory)
          ========================================================================= */}
      {currentTab === 'inventory' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Package size={17} style={{ color: '#F47B20' }} />
              <span>Live Warehouse Inventory & Reorder Monitoring</span>
            </h3>
            <div className="admin-card-header-actions">
              <span className="badge-status instock">{inventoryList.length} Active SKUs</span>
              {dashboardData?.low_stock_count > 0 && (
                <span className="badge-status lowstock">{dashboardData.low_stock_count} Reorders Due</span>
              )}
            </div>
          </div>

          <div style={{ maxWidth: '360px', marginBottom: '16px' }}>
            <div style={{ position: 'relative' }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#64748B'
                }}
              />
              <input
                type="text"
                className="admin-input"
                style={{ paddingLeft: '34px' }}
                placeholder="Search inventory items..."
                value={inventorySearchQuery}
                onChange={(e) => setInventorySearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product Item</th>
                  <th>On Hand</th>
                  <th>Reserved</th>
                  <th>Available</th>
                  <th>Reorder Level</th>
                  <th>Stock Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748B' }}>
                      No inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => {
                    const isLow = Number(item.available) <= Number(item.reorder_level);
                    return (
                      <tr key={item.id}>
                        <td style={{ fontWeight: 700, color: '#FFFFFF' }}>{item.product_name}</td>
                        <td>{item.on_hand}</td>
                        <td style={{ color: '#F59E0B' }}>{item.reserved}</td>
                        <td style={{ fontWeight: 700, color: isLow ? '#F87171' : '#10B981' }}>
                          {item.available}
                        </td>
                        <td style={{ color: '#94A3B8' }}>{item.reorder_level}</td>
                        <td>
                          {isLow ? (
                            <span className="badge-status lowstock">
                              <AlertTriangle size={12} />
                              <span>LOW STOCK</span>
                            </span>
                          ) : (
                            <span className="badge-status instock">
                              <Check size={12} />
                              <span>IN STOCK</span>
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 6: AI CARPENTER ORDERS (ai)
          ========================================================================= */}
      {currentTab === 'ai' && (
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">
              <Sparkles size={17} style={{ color: '#F47B20' }} />
              <span>AI Voice & WhatsApp Draft Orders Review</span>
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                className={`admin-action-btn ${aiFilter === 'REVIEW_REQUIRED' ? 'primary' : ''}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setAiFilter('REVIEW_REQUIRED')}
              >
                Needs Review ({aiJobs.filter((j) => j.status === 'REVIEW_REQUIRED').length})
              </button>
              <button
                type="button"
                className={`admin-action-btn ${aiFilter === 'ALL' ? 'primary' : ''}`}
                style={{ fontSize: '12px', padding: '6px 12px' }}
                onClick={() => setAiFilter('ALL')}
              >
                All Orders ({aiJobs.length})
              </button>
            </div>
          </div>

          {filteredAiJobs.length === 0 ? (
            <div className="admin-empty-state">
              <Sparkles className="admin-empty-icon" />
              <p>No AI orders matching this filter. When carpenters send audio or text orders, they appear here.</p>
            </div>
          ) : (
            <div className="admin-ai-grid">
              {filteredAiJobs.map((job) => (
                <div key={job.id} className="admin-ai-card" style={{ margin: 0, padding: '18px' }}>
                  <div className="admin-ai-card-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="badge-status source">{job.source_type}</span>
                      <strong style={{ fontSize: '14px', color: '#FFFFFF' }}>
                        {job.detected_project || 'General Hardware Site'}
                      </strong>
                    </div>
                    <span
                      style={{
                        fontSize: '11.5px',
                        fontWeight: 700,
                        color: Number(job.confidence_score) >= 80 ? '#10B981' : '#F59E0B'
                      }}
                    >
                      {Number(job.confidence_score).toFixed(0)}% Confidence
                    </span>
                  </div>

                  <div className="admin-ai-prompt" style={{ margin: '12px 0' }}>
                    "{job.input_text}"
                  </div>

                  <div className="admin-ai-card-footer">
                    <span
                      className={`badge-status ${
                        job.status === 'COMPLETED'
                          ? 'paid'
                          : job.status === 'FAILED'
                          ? 'rejected'
                          : 'review'
                      }`}
                    >
                      {job.status}
                    </span>

                    {job.status === 'REVIEW_REQUIRED' && (
                      <div className="admin-ai-actions">
                        <button
                          type="button"
                          className="admin-action-btn"
                          style={{ padding: '6px 12px', fontSize: '12px', color: '#F87171' }}
                          onClick={() => handleApproveAIJob(job.id, 'REJECT')}
                        >
                          <X size={13} />
                          <span>Reject</span>
                        </button>
                        <button
                          type="button"
                          className="admin-action-btn primary"
                          style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
                          onClick={() => handleApproveAIJob(job.id, 'APPROVE')}
                        >
                          <Check size={13} />
                          <span>Approve & Reserve</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 7: CATALOG & SHOWCASE CURATOR (catalog)
          ========================================================================= */}
      {currentTab === 'catalog' && (
        <CatalogShowcaseManager
          token={token}
          onCatalogUpdated={() => loadDashboardData(token)}
        />
      )}

      {/* =========================================================================
          TAB 8: STOREFRONT CMS VISUAL EDITOR (cms)
          ========================================================================= */}
      {currentTab === 'cms' && (
        <StorefrontCMSManager
          token={token}
          onContentSaved={() => loadDashboardData(token)}
        />
      )}

      {/* =========================================================================
          TAB 9: AUDIENCE TELEMETRY & LIVE CARTS (engagement)
          ========================================================================= */}
      {currentTab === 'engagement' && (
        <AudienceEngagementManager
          token={token}
          onConvertToPos={handleConvertCartToPos}
        />
      )}

      {/* =========================================================================
          MODAL: CREATE NEW CUSTOMER
          ========================================================================= */}
      {isCustomerModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsCustomerModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-card-header" style={{ marginBottom: '16px' }}>
              <h3 className="admin-card-title">
                <Users size={18} style={{ color: '#F47B20' }} />
                <span>Add New Customer or Builder</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsCustomerModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <div className="admin-form-group">
                <label className="admin-label">Full Name / Firm Name *</label>
                <input
                  type="text"
                  required
                  className="admin-input"
                  placeholder="e.g. Ramesh Sharma"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Mobile Number *</label>
                <input
                  type="tel"
                  required
                  className="admin-input"
                  placeholder="e.g. 9876543210"
                  value={newCustomer.phone}
                  onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Customer Type</label>
                <select
                  className="admin-select"
                  value={newCustomer.customer_type}
                  onChange={(e) => setNewCustomer({ ...newCustomer, customer_type: e.target.value })}
                >
                  <option value="RETAIL">Retail Customer</option>
                  <option value="CONTRACTOR">Contractor / Builder</option>
                  <option value="CARPENTER">Carpenter Partner</option>
                  <option value="HOMEOWNER">Homeowner</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Initial Opening Khata Balance (₹)</label>
                <input
                  type="number"
                  min="0"
                  className="admin-input"
                  placeholder="0"
                  value={newCustomer.opening_balance}
                  onChange={(e) => setNewCustomer({ ...newCustomer, opening_balance: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsCustomerModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="admin-action-btn primary">
                  <Plus size={14} />
                  <span>Create Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: RECORD PAYMENT RECEIVED
          ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="admin-modal-backdrop" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-card-header" style={{ marginBottom: '16px' }}>
              <h3 className="admin-card-title">
                <CircleDollarSign size={18} style={{ color: '#10B981' }} />
                <span>Record Payment for Khata</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPayment}>
              <div className="admin-form-group">
                <label className="admin-label">Select Unpaid Invoice *</label>
                <select
                  required
                  className="admin-select"
                  value={paymentForm.invoice_id}
                  onChange={(e) => {
                    const inv = customerUnpaidInvoices.find((i) => i.id === e.target.value);
                    setPaymentForm({
                      ...paymentForm,
                      invoice_id: e.target.value,
                      amount: inv ? String(inv.outstanding) : ''
                    });
                  }}
                >
                  <option value="">-- Choose Invoice --</option>
                  {customerUnpaidInvoices.map((inv) => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoice_number} - Total: {formatINR(inv.total)} (Due: {formatINR(inv.outstanding)})
                    </option>
                  ))}
                </select>
                {customerUnpaidInvoices.length === 0 && (
                  <small style={{ color: '#F87171', display: 'block', marginTop: '4px' }}>
                    No pending invoices with outstanding balances found for this customer.
                  </small>
                )}
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Amount Received (₹) *</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  className="admin-input"
                  placeholder="e.g. 5000"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Payment Method</label>
                <select
                  className="admin-select"
                  value={paymentForm.method}
                  onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                >
                  <option value="CASH">Cash</option>
                  <option value="UPI">UPI / QR Code</option>
                  <option value="BANK_TRANSFER">Bank Transfer (NEFT/RTGS)</option>
                  <option value="CARD">Debit / Credit Card</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label className="admin-label">Transaction Reference (Optional)</label>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="UPI Txn ID or Cheque #"
                  value={paymentForm.reference}
                  onChange={(e) => setPaymentForm({ ...paymentForm, reference: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-action-btn"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-action-btn primary"
                  disabled={customerUnpaidInvoices.length === 0}
                >
                  <Check size={14} />
                  <span>Confirm Payment</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

