import apiClient from './apiClient';

const kanjiService = {
  getAll: () => apiClient.get('/kanjis'),
  getById: (id) => apiClient.get(`/kanjis/${id}`),
  create: (data) => apiClient.post('/kanjis', data),
  update: (id, data) => apiClient.put(`/kanjis/${id}`, data),
  delete: (id) => apiClient.delete(`/kanjis/${id}`),
};

export default kanjiService;
