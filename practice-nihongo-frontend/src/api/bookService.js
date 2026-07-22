import apiClient from './apiClient';
import { cachedFetch, invalidateCache } from './apiCache';

const bookService = {
  // Cache 5 phút — danh sách sách rất ít khi thay đổi
  getAll: () => cachedFetch('books:all', () => apiClient.get('/books').then(r => r), 5 * 60_000),
  getById: (id) => cachedFetch(`books:${id}`, () => apiClient.get(`/books/${id}`), 5 * 60_000),
  create: async (data) => {
    const res = await apiClient.post('/books', data);
    invalidateCache('books:');
    return res;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/books/${id}`, data);
    invalidateCache('books:');
    return res;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/books/${id}`);
    invalidateCache('books:');
    return res;
  },
};

export default bookService;
