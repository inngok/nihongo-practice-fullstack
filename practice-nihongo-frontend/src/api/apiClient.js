import axios from 'axios';

const isLocal = window.location.hostname === 'localhost';
const baseURL = isLocal ? 'http://localhost:8080/api' : 'http://3.107.17.42/api';

const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Bạn có thể thêm interceptors ở đây nếu sau này có dùng Token/Auth
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
