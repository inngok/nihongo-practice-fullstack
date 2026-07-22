import apiClient from './apiClient';
import { cachedFetch, invalidateCache } from './apiCache';

const vocabService = {
  // Cache 2 phút — dữ liệu vocab theo book/params
  getAll: (params) => {
    const key = `vocabs:${JSON.stringify(params || {})}`;
    return cachedFetch(key, () => apiClient.get('/vocabs', { params }), 2 * 60_000);
  },
  getPersonal: () => apiClient.get('/vocabs/my'), // không cache — dữ liệu cá nhân, thay đổi thường
  getById: (id) => cachedFetch(`vocabs:id:${id}`, () => apiClient.get(`/vocabs/${id}`), 2 * 60_000),
  create: async (data) => {
    const res = await apiClient.post('/vocabs', data);
    invalidateCache('vocabs:');
    return res;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/vocabs/${id}`, data);
    invalidateCache('vocabs:');
    return res;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/vocabs/${id}`);
    invalidateCache('vocabs:');
    return res;
  },
};

export default vocabService;
