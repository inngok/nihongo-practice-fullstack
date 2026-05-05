import apiClient from './apiClient';

const vocabService = {
  getAll: (params) => apiClient.get('/vocabs', { params }),
  getPersonal: () => apiClient.get('/vocabs/my'),
  getById: (id) => apiClient.get(`/vocabs/${id}`),
  create: (data) => apiClient.post('/vocabs', data),
  update: (id, data) => apiClient.put(`/vocabs/${id}`, data),
  delete: (id) => apiClient.delete(`/vocabs/${id}`),
};

export default vocabService;
