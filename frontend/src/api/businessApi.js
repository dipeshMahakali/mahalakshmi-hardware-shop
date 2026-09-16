const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    // When served via Vite dev server (port 5173), use relative URL to route via Vite reverse-proxy
    if (window.location.port === '5173') {
      return '';
    }
    // Fallback for LAN IP / standalone: route to port 8000 on the same host
    if (window.location.hostname) {
      return `${window.location.protocol}//${window.location.hostname}:8000`;
    }
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
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
  registerOwner: ({ name, email, password }) =>
    request(`/api/v1/auth/register?name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`, { method: 'POST' }),
  login: ({ email, password }) =>
    request('/api/v1/auth/login', {
      method: 'POST',
      body: new URLSearchParams({ username: email, password }).toString(),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  getMe: () => request('/api/v1/auth/me'),
  logout: () => request('/api/v1/auth/logout', { method: 'POST' }),

  // Customers & Projects
  customers: () => request('/api/v1/customers'),
  createCustomer: (token, customer) =>
    request('/api/v1/customers', { method: 'POST', body: JSON.stringify(customer) }),
  createProject: (token, customerId, project) =>
    request(`/api/v1/customers/${customerId}/projects`, { method: 'POST', body: JSON.stringify(project) }),
  projects: (token, customerId) =>
    request(`/api/v1/customers/${customerId}/projects`),

  // Categories
  categories: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/categories${q ? '?' + q : ''}`);
  },
  getCategory: (id) => request(`/api/v1/categories/${id}`),
  createCategory: (token, category) =>
    request('/api/v1/categories', { method: 'POST', body: JSON.stringify(category) }),
  updateCategory: (token, id, category) =>
    request(`/api/v1/categories/${id}`, { method: 'PUT', body: JSON.stringify(category) }),
  deleteCategory: (token, id) =>
    request(`/api/v1/categories/${id}`, { method: 'DELETE' }),

  // Products
  products: (token, params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/api/v1/products${q ? '?' + q : ''}`);
  },
  createProduct: (token, product) =>
    request('/api/v1/products', { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (token, id, product) =>
    request(`/api/v1/products/${id}`, { method: 'PUT', body: JSON.stringify(product) }),
  patchProductCuration: (token, id, curation) =>
    request(`/api/v1/products/${id}/curation`, { method: 'PATCH', body: JSON.stringify(curation) }),
  deleteProduct: (token, id) =>
    request(`/api/v1/products/${id}`, { method: 'DELETE' }),

  // Storefront CMS & Audience Telemetry
  getStorefrontContent: () => request('/api/v1/storefront/content'),
  updateStorefrontContent: (token, sectionKey, content) =>
    request(`/api/v1/storefront/content/${sectionKey}`, { method: 'PUT', body: JSON.stringify({ content }) }),
  syncStorefrontCart: (payload) =>
    request('/api/v1/storefront/cart/sync', { method: 'POST', body: JSON.stringify(payload) }),
  syncStorefrontWishlist: (payload) =>
    request('/api/v1/storefront/wishlist/sync', { method: 'POST', body: JSON.stringify(payload) }),
  getStorefrontEngagement: (token) =>
    request('/api/v1/storefront/engagement'),

  // Billing & Invoices
  createInvoice: (token, invoice) =>
    request('/api/v1/invoices', { method: 'POST', body: JSON.stringify(invoice) }),
  invoices: (token, customerId = '') =>
    request(`/api/v1/invoices${customerId ? '?customer_id=' + customerId : ''}`),

  // Payments & Khata
  recordPayment: (token, payment) =>
    request('/api/v1/payments', { method: 'POST', body: JSON.stringify(payment) }),
  khata: (token, customerId) =>
    request(`/api/v1/ledger/customers/${customerId}/khata`),

  // Inventory
  inventory: () => request('/api/v1/inventory'),
  adjustStock: (token, payload) =>
    request('/api/v1/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) }),
  lowStock: () => request('/api/v1/inventory/reorder'),

  // AI Pipeline
  processAI: (token, payload) =>
    request('/api/v1/ai/process', { method: 'POST', body: JSON.stringify(payload) }),
  aiJobs: () => request('/api/v1/ai/jobs'),
  approveAIJob: (token, jobId, action, editedItems = null) =>
    request(`/api/v1/ai/jobs/${jobId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ job_id: jobId, action, edited_items: editedItems })
    }),

  // Loyalty & Suppliers & Dashboard
  loyaltyAccount: (token, customerId) => request(`/api/v1/loyalty/customers/${customerId}`),
  rewards: () => request('/api/v1/loyalty/rewards'),
  redeemReward: (token, customerId, rewardId) =>
    request('/api/v1/loyalty/redeem', { method: 'POST', body: JSON.stringify({ customer_id: customerId, reward_id: rewardId }) }),
  dashboard: () => request('/api/v1/reports/dashboard'),

  // Orders & Estimates for Carpenter Partner
  orders: (token, customerId = '') =>
    request(`/api/v1/orders${customerId ? '?customer_id=' + customerId : ''}`),
  createOrder: (token, payload) =>
    request('/api/v1/orders', { method: 'POST', body: JSON.stringify(payload) }),
  estimates: (token, customerId = '') =>
    request(`/api/v1/estimates${customerId ? '?customer_id=' + customerId : ''}`)
};
