import apiClient from './apiClient';
import { cachedFetch, invalidateCache } from './apiCache';

const kanjiService = {
  getAll: (params) => {
    const key = `kanjis:${JSON.stringify(params || {})}`;
    return cachedFetch(key, () => apiClient.get('/kanjis', { params }), 2 * 60_000);
  },
  getById: (id) => cachedFetch(`kanjis:id:${id}`, () => apiClient.get(`/kanjis/${id}`), 2 * 60_000),
  create: async (data) => {
    const res = await apiClient.post('/kanjis', data);
    invalidateCache('kanjis:');
    return res;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/kanjis/${id}`, data);
    invalidateCache('kanjis:');
    return res;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/kanjis/${id}`);
    invalidateCache('kanjis:');
    return res;
  },
  deleteAll: async (bookId) => {
    const res = await apiClient.delete(`/kanjis/all${bookId ? `?bookId=${bookId}` : ''}`);
    invalidateCache('kanjis:');
    return res;
  },
};

export default kanjiService;
