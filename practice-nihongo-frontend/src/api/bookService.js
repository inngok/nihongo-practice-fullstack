import apiClient from './apiClient';

const bookService = {
  getAll: () => apiClient.get('/books'),
  getById: (id) => apiClient.get(`/books/${id}`),
  create: (data) => apiClient.post('/books', data),
  update: (id, data) => apiClient.put(`/books/${id}`, data),
  delete: (id) => apiClient.delete(`/books/${id}`),
};

export default bookService;
