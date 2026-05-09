import apiClient from './apiClient';

const vocabFolderService = {
  getMyFolders: () => apiClient.get('/vocab-folders'),
  createFolder: (data) => apiClient.post('/vocab-folders', data),
  updateFolder: (id, data) => apiClient.put(`/vocab-folders/${id}`, data),
  deleteFolder: (id) => apiClient.delete(`/vocab-folders/${id}`),
};

export default vocabFolderService;
