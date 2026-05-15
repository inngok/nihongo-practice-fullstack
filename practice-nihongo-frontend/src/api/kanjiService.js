import apiClient from './apiClient';

const kanjiService = {
  getAll: (params) => apiClient.get('/kanjis', { params }),
  getById: (id) => apiClient.get(`/kanjis/${id}`),
  create: (data) => apiClient.post('/kanjis', data),
  update: (id, data) => apiClient.put(`/kanjis/${id}`, data),
  delete: (id) => apiClient.delete(`/kanjis/${id}`),
  deleteAll: (bookId) => apiClient.delete(`/kanjis/all${bookId ? `?bookId=${bookId}` : ''}`),
};

export default kanjiService;
