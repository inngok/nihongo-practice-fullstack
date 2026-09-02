import apiClient from './apiClient';
import { cachedFetch, invalidateCache } from './apiCache';

const userService = {
  getAll: () => cachedFetch('users:all', () => apiClient.get('/users').then(r => r), 60_000), // Cache 1 minute
  create: async (data) => {
    const res = await apiClient.post('/users', data);
    invalidateCache('users:');
    return res;
  },
  update: async (id, data) => {
    const res = await apiClient.put(`/users/${id}`, data);
    invalidateCache('users:');
    return res;
  },
  delete: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    invalidateCache('users:');
    return res;
  },
};

export default userService;
