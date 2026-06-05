import api from '../utils/api';

export const adjustStock = async (productId, adjustment, reason, reasonDescription) => {
  return await api.post('/stock/adjust', {
    productId,
    adjustment,
    reason,
    reasonDescription
  });
};

export const bulkAdjustStock = async (adjustments) => {
  return await api.post('/stock/adjust/bulk', {
    adjustments
  });
};

export const getStockHistory = async (productId, page = 1, limit = 50) => {
  return await api.get(`/stock/history/${productId}?page=${page}&limit=${limit}`);
};

export const getAllStockHistory = async (page = 1, limit = 50, filters = {}) => {
  const params = new URLSearchParams({ page, limit });
  if (filters.productId) params.append('productId', filters.productId);
  if (filters.reason) params.append('reason', filters.reason);
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  
  return await api.get(`/stock/history?${params.toString()}`);
};

export const getLowStockAlerts = async (threshold = null) => {
  const params = threshold ? `?threshold=${threshold}` : '';
  return await api.get(`/stock/alerts/low-stock${params}`);
};
