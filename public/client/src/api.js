// API Helper functions for SENTARA Storefront

const API_BASE = '/api';

// Helper to get authorization headers
const getHeaders = (contentType = 'application/json') => {
  const token = localStorage.getItem('sentara_token');
  const headers = {};
  if (contentType) {
    headers['Content-Type'] = contentType;
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Response helper
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Something went wrong');
  }
  return data;
};

export const api = {
  // Authentication
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      return handleResponse(res);
    },
    register: async (name, email, address, password) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, address, password }),
      });
      return handleResponse(res);
    },
    getMe: async () => {
      const res = await fetch(`${API_BASE}/auth/me`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    sendOtp: async (mobile, name) => {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ mobile, name }),
      });
      return handleResponse(res);
    },
    verifyOtp: async (mobile, otp) => {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ mobile, otp }),
      });
      return handleResponse(res);
    },
  },

  // Products
  products: {
    list: async (params = {}) => {
      const query = new URLSearchParams();
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') {
          query.append(key, val);
        }
      });
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/products${queryString}`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
    copilot: async (query) => {
      const res = await fetch(`${API_BASE}/products/copilot?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
    mood: async (type) => {
      const res = await fetch(`${API_BASE}/products/mood?type=${encodeURIComponent(type)}`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
    bundle: async (budget) => {
      const res = await fetch(`${API_BASE}/products/bundle?budget=${encodeURIComponent(budget)}`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
    goal: async (type) => {
      const res = await fetch(`${API_BASE}/products/goal?type=${encodeURIComponent(type)}`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
    priceHistory: async (id) => {
      const res = await fetch(`${API_BASE}/products/${id}/price-history`, {
        method: 'GET',
        headers: getHeaders(null),
      });
      return handleResponse(res);
    },
  },

  // Shopping Cart
  cart: {
    get: async () => {
      const res = await fetch(`${API_BASE}/cart`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    add: async (productId, quantity = 1, color = null, size = null) => {
      const res = await fetch(`${API_BASE}/cart/add`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity, color, size }),
      });
      return handleResponse(res);
    },
    update: async (productId, quantity, color = null, size = null) => {
      const res = await fetch(`${API_BASE}/cart/update`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ productId, quantity, color, size }),
      });
      return handleResponse(res);
    },
    remove: async (productId, color = null, size = null) => {
      const query = new URLSearchParams();
      if (color) query.append('color', color);
      if (size) query.append('size', size);
      const queryString = query.toString() ? `?${query.toString()}` : '';
      const res = await fetch(`${API_BASE}/cart/remove/${productId}${queryString}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    clear: async () => {
      const res = await fetch(`${API_BASE}/cart/clear`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Coupons
  coupons: {
    list: async () => {
      const res = await fetch(`${API_BASE}/coupons`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    apply: async (code, subtotal) => {
      const res = await fetch(`${API_BASE}/coupons/apply`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ code, subtotal }),
      });
      return handleResponse(res);
    },
  },

  // User details & addresses
  user: {
    getProfile: async () => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    updateProfile: async (name, email) => {
      const res = await fetch(`${API_BASE}/user/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, email }),
      });
      return handleResponse(res);
    },
    getAddresses: async () => {
      const res = await fetch(`${API_BASE}/user/addresses`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    addAddress: async (addressData) => {
      const res = await fetch(`${API_BASE}/user/addresses`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(addressData),
      });
      return handleResponse(res);
    },
    updateAddress: async (id, addressData) => {
      const res = await fetch(`${API_BASE}/user/addresses/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(addressData),
      });
      return handleResponse(res);
    },
    deleteAddress: async (id) => {
      const res = await fetch(`${API_BASE}/user/addresses/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getRecentlyViewed: async () => {
      const res = await fetch(`${API_BASE}/user/recently-viewed`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    addRecentlyViewed: async (productId) => {
      const res = await fetch(`${API_BASE}/user/recently-viewed`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId }),
      });
      return handleResponse(res);
    },
  },

  // Orders
  orders: {
    create: async (orderData) => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(orderData),
      });
      return handleResponse(res);
    },
    list: async () => {
      const res = await fetch(`${API_BASE}/orders`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    getById: async (id) => {
      const res = await fetch(`${API_BASE}/orders/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
  },

  // Payment (Razorpay)
  payment: {
    createOrder: async (amount, receipt) => {
      const res = await fetch(`${API_BASE}/payment/create-order`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ amount, receipt }),
      });
      return handleResponse(res);
    },
    verify: async (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
      const res = await fetch(`${API_BASE}/payment/verify`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature }),
      });
      return handleResponse(res);
    },
  },

  // Groups
  groups: {
    create: async () => {
      const res = await fetch(`${API_BASE}/groups/create`, {
        method: 'POST',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    get: async (id) => {
      const res = await fetch(`${API_BASE}/groups/${id}`, {
        method: 'GET',
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    vote: async (id, productId, type) => {
      const res = await fetch(`${API_BASE}/groups/${id}/vote`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ productId, type }),
      });
      return handleResponse(res);
    },
  },

  // Chat
  chat: {
    send: async (query) => {
      const res = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ query }),
      });
      return handleResponse(res);
    },
  },
};
