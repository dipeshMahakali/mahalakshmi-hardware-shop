const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    // When served on Vercel, standard production domain, or Vite dev proxy (port 5173), use relative URL
    const isVercel = window.location.hostname.includes('vercel.app');
    const isDevProxy = window.location.port === '5173';
    const isStandardWebPort = !window.location.port || window.location.port === '80' || window.location.port === '443';

    if (isVercel || isDevProxy || (isStandardWebPort && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')) {
      return '';
    }
    // Fallback for local development or LAN testing: route to port 8000
    if (window.location.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

function getStoredAuthToken() {
  try {
    return localStorage.getItem('smh_auth_token') || '';
  } catch {
    return '';
  }
}

function setStoredAuthToken(token) {
  try {
    if (token) {
      localStorage.setItem('smh_auth_token', token);
    } else {
      localStorage.removeItem('smh_auth_token');
    }
  } catch {}
}

async function request(path, options = {}) {
  const token = (typeof options.token === 'string' && options.token.length > 5)
    ? options.token
    : getStoredAuthToken();

  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...(options.headers || {})
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.detail || 'Something went wrong. Please try again.');
  }
  return payload;
}

export const businessApi = {
  health: () => request('/health'),
  
  // Auth
  registerOwner: async ({ name, email, password }) => {
    const res = await request(`/api/v1/auth/register?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { method: 'POST' });
    if (res?.access_token) {
      setStoredAuthToken(res.access_token);
    }
    return res;
  },
  login: async ({ email, password }) => {
    const res = await request('/api/v1/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username: email, password }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });
    if (res?.access_token) {
      setStoredAuthToken(res.access_token);
    }
    return res;
  },
  getMe: (token) => request('/api/v1/auth/me', { token }),
  logout: async () => {
    try {
      await request('/api/v1/auth/logout', { method: 'POST' });
    } finally {
      setStoredAuthToken(null);
    }
  },

  // Customers & Projects
  customers: (token) => request('/api/v1/customers', { token }),
  createCustomer: (token, customer) =>
    request('/api/v1/customers', { method: 'POST', token, body: JSON.stringify(customer) }),
  createProject: (token, customerId, project) =>
    request(`/api/v1/customers/${customerId}/projects`, { method: 'POST', token, body: JSON.stringify(project) }),
  projects: (token, customerId) =>
    request(`/api/v1/customers/${customerId}/projects`, { token }),

  // Categories
  categories: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/categories${q ? '?' + q : ''}`);
  },
  getCategory: (id) => request(`/api/v1/categories/${id}`),
  createCategory: (token, category) =>
    request('/api/v1/categories', { method: 'POST', token, body: JSON.stringify(category) }),
  updateCategory: (token, id, category) =>
    request(`/api/v1/categories/${id}`, { method: 'PUT', token, body: JSON.stringify(category) }),
  deleteCategory: (token, id) =>
    request(`/api/v1/categories/${id}`, { method: 'DELETE', token }),

  // Products
  products: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/products${q ? '?' + q : ''}`, { token });
  },
  createProduct: (token, product) =>
    request('/api/v1/products', { method: 'POST', token, body: JSON.stringify(product) }),
  updateProduct: (token, id, product) =>
    request(`/api/v1/products/${id}`, { method: 'PUT', token, body: JSON.stringify(product) }),
  patchProductCuration: (token, id, curation) =>
    request(`/api/v1/products/${id}/curation`, { method: 'PATCH', token, body: JSON.stringify(curation) }),
  deleteProduct: (token, id) =>
    request(`/api/v1/products/${id}`, { method: 'DELETE', token }),

  // Storefront CMS & Audience Telemetry
  getStorefrontContent: () => request('/api/v1/storefront/content'),
  updateStorefrontContent: (token, sectionKey, content) =>
    request(`/api/v1/storefront/content/${sectionKey}`, { method: 'PUT', token, body: JSON.stringify({ content }) }),
  syncStorefrontCart: (payload) =>
    request('/api/v1/storefront/cart/sync', { method: 'POST', body: JSON.stringify(payload) }),
  syncStorefrontWishlist: (payload) =>
    request('/api/v1/storefront/wishlist/sync', { method: 'POST', body: JSON.stringify(payload) }),
  getStorefrontEngagement: (token) =>
    request('/api/v1/storefront/engagement', { token }),

  // Billing & Invoices
  createInvoice: (token, invoice) =>
    request('/api/v1/invoices', { method: 'POST', token, body: JSON.stringify(invoice) }),
  invoices: (token, customerId = '') =>
    request(`/api/v1/invoices${customerId ? '?customer_id=' + customerId : ''}`, { token }),

  // Payments & Khata
  recordPayment: (token, payment) =>
    request('/api/v1/payments', { method: 'POST', token, body: JSON.stringify(payment) }),
  khata: (token, customerId) =>
    request(`/api/v1/ledger/customers/${customerId}/khata`, { token }),

  // Inventory
  inventory: (token) => request('/api/v1/inventory', { token }),
  adjustStock: (token, payload) =>
    request('/api/v1/inventory/adjust', { method: 'POST', token, body: JSON.stringify(payload) }),
  lowStock: (token) => request('/api/v1/inventory/reorder', { token }),

  // AI Pipeline
  processAI: (token, payload) =>
    request('/api/v1/ai/process', { method: 'POST', token, body: JSON.stringify(payload) }),
  aiJobs: (token) => request('/api/v1/ai/jobs', { token }),
  approveAIJob: (token, jobId, action, editedItems = null) =>
    request(`/api/v1/ai/jobs/${jobId}/approve`, {
      method: 'POST',
      token,
      body: JSON.stringify({ job_id: jobId, action, edited_items: editedItems })
    }),

  // Loyalty & Suppliers & Dashboard
  loyaltyAccount: (token, customerId) => request(`/api/v1/loyalty/customers/${customerId}`, { token }),
  rewards: (token) => request('/api/v1/loyalty/rewards', { token }),
  redeemReward: (token, customerId, rewardId) =>
    request('/api/v1/loyalty/redeem', { method: 'POST', token, body: JSON.stringify({ customer_id: customerId, reward_id: rewardId }) }),
  dashboard: (token) => request('/api/v1/reports/dashboard', { token }),

  // Orders & Estimates for Carpenter Partner
  orders: (token, customerId = '') =>
    request(`/api/v1/orders${customerId ? '?customer_id=' + customerId : ''}`, { token }),
  createOrder: (token, payload) =>
    request('/api/v1/orders', { method: 'POST', token, body: JSON.stringify(payload) }),
  estimates: (token, customerId = '') =>
    request(`/api/v1/estimates${customerId ? '?customer_id=' + customerId : ''}`, { token })
};
