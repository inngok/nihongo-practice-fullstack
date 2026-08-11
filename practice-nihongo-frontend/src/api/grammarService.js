import apiClient from './apiClient';
import { cachedFetch, invalidateCache } from './apiCache';

const grammarService = {
  getAll: () => cachedFetch('grammars:all', () => apiClient.get('/grammars'), 2 * 60_000),
  getById: (id) => cachedFetch(`grammars:id:${id}`, () => apiClient.get(`/grammars/${id}`), 2 * 60_000),
  getByLevel: (level) => cachedFetch(`grammars:level:${level}`, () => apiClient.get(`/grammars/level/${level}`), 2 * 60_000),
  create: async (data) => {
    const res = await apiClient.post('/grammars', data);
    invalidateCache('grammars:');
    return res;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/grammars/${id}`, data);
    invalidateCache('grammars:');
    return res;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/grammars/${id}`);
    invalidateCache('grammars:');
    return res;
  },
  deleteAll: async (bookId) => {
    const res = await apiClient.delete(`/grammars/all${bookId ? `?bookId=${bookId}` : ''}`);
    invalidateCache('grammars:');
    return res;
  },
};

export default grammarService;
