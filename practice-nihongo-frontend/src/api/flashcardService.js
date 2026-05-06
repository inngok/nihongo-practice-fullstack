import apiClient from './apiClient';

const flashcardService = {
  getAll: () => apiClient.get('/flashcards'),
  getDue: () => apiClient.get('/flashcards/due'),
  getDueCount: () => apiClient.get('/flashcards/due/count'),
  add: (vocabId, kanjiId) => {
    const params = {};
    if (vocabId) params.vocabId = vocabId;
    if (kanjiId) params.kanjiId = kanjiId;
    return apiClient.post('/flashcards', null, { params });
  },
  review: (id, rating) => apiClient.post(`/flashcards/${id}/review`, { rating }),
  delete: (id) => apiClient.delete(`/flashcards/${id}`),
};

export default flashcardService;
