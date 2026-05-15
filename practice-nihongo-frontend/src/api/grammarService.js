import apiClient from './apiClient';

const grammarService = {
  getAll: () => apiClient.get('/grammars'),
  getById: (id) => apiClient.get(`/grammars/${id}`),
  getByLevel: (level) => apiClient.get(`/grammars/level/${level}`),
  create: (data) => apiClient.post('/grammars', data),
  update: (id, data) => apiClient.put(`/grammars/${id}`, data),
  delete: (id) => apiClient.delete(`/grammars/${id}`),
  deleteAll: (bookId) => apiClient.delete(`/grammars/all${bookId ? `?bookId=${bookId}` : ''}`),
};

export default grammarService;
