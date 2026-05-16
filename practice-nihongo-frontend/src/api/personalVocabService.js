import apiClient from './apiClient';

const personalVocabService = {
  getAll: () => apiClient.get('/personal-vocabs'),
  getById: (id) => apiClient.get(`/personal-vocabs/${id}`),
  create: (data) => apiClient.post('/personal-vocabs', data),
  update: (id, data) => apiClient.put(`/personal-vocabs/${id}`, data),
  delete: (id) => apiClient.delete(`/personal-vocabs/${id}`),
};

export default personalVocabService;
