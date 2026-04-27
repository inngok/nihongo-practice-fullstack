import apiClient from './apiClient';

const vocabService = {
  getAll: () => apiClient.get('/vocabs'),
  getById: (id) => apiClient.get(`/vocabs/${id}`),
  create: (data) => apiClient.post('/vocabs', data),
  update: (id, data) => apiClient.put(`/vocabs/${id}`, data),
  delete: (id) => apiClient.delete(`/vocabs/${id}`),
};

export default vocabService;
