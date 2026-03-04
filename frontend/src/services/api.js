// src/services/api.js
// ─────────────────────────────────────────────────────────────
// Centralized API service — all backend calls go through here.
// ─────────────────────────────────────────────────────────────

import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// ── Axios instance ────────────────────────────────────────────
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if it exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dahtech_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirect to login on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('dahtech_token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// ════════════════════════════════════════════════════════════
// AUTH
// ════════════════════════════════════════════════════════════

export const authAPI = {
  login: (username, password) =>
    api.post('/api/auth/login', { username, password }),
};

// ════════════════════════════════════════════════════════════
// PRODUCTS — Public
// ════════════════════════════════════════════════════════════

export const productAPI = {
  /** Public storefront listing */
  getPublic: (params) =>
    api.get('/api/products/public', { params }),

  /** Admin: all products with QR codes */
  getAll: (page = 0, size = 20) =>
    api.get('/api/products', { params: { page, size } }),

  /** Admin: single product */
  getOne: (id) => api.get(`/api/products/${id}`),

  /** Admin: create new product */
  create: (data) => api.post('/api/products', data),

  /** Admin: delete product */
  delete: (id) => api.delete(`/api/products/${id}`),

  /** Admin: get dashboard stats */
  getStats: () => api.get('/api/products/stats'),

  /** Admin: QR code PNG download URL */
  qrDownloadUrl: (id) => `${BASE_URL}/api/products/${id}/qr`,
};

// ════════════════════════════════════════════════════════════
// ORDERS
// ════════════════════════════════════════════════════════════

export const orderAPI = {
  /** Public: customer places order */
  place: (data) => api.post('/api/orders/public', data),

  /** Admin: view all orders */
  getAll: (page = 0, size = 20, status) =>
    api.get('/api/orders', { params: { page, size, status } }),

  /** Admin: update order status */
  updateStatus: (id, status) =>
    api.patch(`/api/orders/${id}/status`, null, { params: { status } }),
};

// ════════════════════════════════════════════════════════════
// SHOPS
// ════════════════════════════════════════════════════════════

export const shopAPI = {
  /** Admin: all shops for dropdown */
  getAll: () => api.get('/api/shops'),

  /** Public: active shops */
  getActive: () => api.get('/api/shops/public'),

  /** Admin: create shop */
  create: (data) => api.post('/api/shops', data),
};

export default api;
