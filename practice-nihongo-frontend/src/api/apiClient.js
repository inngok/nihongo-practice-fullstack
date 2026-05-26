import axios from 'axios';

import { API_BASE_URL } from '../config';

const baseURL = API_BASE_URL;

const apiClient = axios.create({
  baseURL: baseURL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nihongo_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Response interceptor to handle token expiration and automatic refreshing
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If we receive a 401 Unauthorized, and this request hasn't been retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('nihongo_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Call refresh endpoint directly using a separate axios instance (to avoid interceptor loops)
        const refreshResponse = await axios.post(`${baseURL}/auth/refresh`, { refreshToken });
        const newToken = refreshResponse.data.accessToken;

        if (newToken) {
          localStorage.setItem('nihongo_token', newToken);
          // Update authorization header for the original request
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Retry the original request with the new token
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        console.error('Auto token refresh failed:', refreshError);
        // Only log out if the server explicitly rejected the refresh token (e.g. 400, 401, 403)
        // If it was a network error (no response) or 503/500 server error, don't log the user out.
        if (refreshError.response && refreshError.response.status >= 400 && refreshError.response.status < 500) {
          localStorage.removeItem('nihongo_user');
          localStorage.removeItem('nihongo_token');
          localStorage.removeItem('nihongo_refresh_token');
          window.location.href = '/login';
        }
      }
    }

    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
