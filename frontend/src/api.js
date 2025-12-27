import axios from 'axios';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location.hostname.includes('replit')) {
    return '';
  }
  return 'http://localhost:8000';
};

const API_BASE_URL = getApiBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Vendors
export const getVendors = () => api.get('/vendors/');
export const createVendor = (data) => api.post('/vendors/', data);
export const updateVendor = (id, data) => api.put(`/vendors/${id}`, data);
export const deleteVendor = (id) => api.delete(`/vendors/${id}`);

// Filaments
export const getFilaments = () => api.get('/filaments/');
export const createFilament = (data) => api.post('/filaments/', data);
export const updateFilament = (id, data) => api.put(`/filaments/${id}`, data);
export const deleteFilament = (id) => api.delete(`/filaments/${id}`);

// Purchases
export const getPurchases = () => api.get('/purchases/');
export const createPurchase = (data) => api.post('/purchases/', data);
export const updatePurchase = (id, data) => api.put(`/purchases/${id}`, data);
export const deletePurchase = (id) => api.delete(`/purchases/${id}`);

// Purchase Items
export const getPurchaseItems = () => api.get('/purchase-items/');
export const updatePurchaseItem = (id, data) => api.put(`/purchase-items/${id}`, data);
export const deletePurchaseItem = (id) => api.delete(`/purchase-items/${id}`);

// Spools
export const getSpools = () => api.get('/spools/');
export const createSpool = (data) => api.post('/spools/', data);
export const updateSpool = (id, data) => api.put(`/spools/${id}`, data);
export const deleteSpool = (id) => api.delete(`/spools/${id}`);

// Inventory
export const getInventorySummary = () => api.get('/inventory/summary');

export default api;
