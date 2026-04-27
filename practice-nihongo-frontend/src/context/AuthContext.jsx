import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [messageApi, contextHolder] = message.useMessage();

  const API_URL = 'http://localhost:8080/api/auth';

  useEffect(() => {
    const user = localStorage.getItem('nihongo_user');
    const token = localStorage.getItem('nihongo_token');
    if (user && token) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng nhập thất bại');
      }

      const data = await response.json();
      const user = { id: data.id, name: data.name, email: data.email };
      
      setCurrentUser(user);
      localStorage.setItem('nihongo_user', JSON.stringify(user));
      localStorage.setItem('nihongo_token', data.token);
      localStorage.setItem('nihongo_refresh_token', data.refreshToken);
      
      messageApi.success({
        content: `Chào mừng trở lại, ${user.name}!`,
        duration: 3,
        style: { marginTop: '10vh' }
      });
      return user;
    } catch (error) {
      throw error;
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Đăng ký thất bại');
      }

      const data = await response.json();
      const user = { id: data.id, name: data.name, email: data.email };
      
      setCurrentUser(user);
      localStorage.setItem('nihongo_user', JSON.stringify(user));
      localStorage.setItem('nihongo_token', data.token);
      localStorage.setItem('nihongo_refresh_token', data.refreshToken);
      
      messageApi.success({
        content: `Đăng ký thành công! Chào ${user.name}`,
        duration: 3,
        style: { marginTop: '10vh' }
      });
      return user;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nihongo_user');
    localStorage.removeItem('nihongo_token');
    localStorage.removeItem('nihongo_refresh_token');
    messageApi.info({
      content: 'Bạn đã đăng xuất.',
      duration: 2,
      style: { marginTop: '10vh' }
    });
  };

  const refreshAccessToken = async () => {
    try {
      const refreshToken = localStorage.getItem('nihongo_refresh_token');
      if (!refreshToken) throw new Error("No refresh token available");

      const response = await fetch(`${API_URL}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        logout();
        throw new Error("Refresh token expired");
      }

      const data = await response.json();
      localStorage.setItem('nihongo_token', data.accessToken);
      return data.accessToken;
    } catch (error) {
      logout();
      messageApi.warning({
        content: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!',
        duration: 4,
        style: { marginTop: '10vh' }
      });
      throw error;
    }
  };

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('nihongo_token');
    
    const headers = {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    let response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      try {
        token = await refreshAccessToken();
        headers['Authorization'] = `Bearer ${token}`;
        response = await fetch(url, { ...options, headers });
      } catch (err) {
        // Handle silently as refreshAccessToken already logs out and shows message
      }
    }

    return response;
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    fetchWithAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {contextHolder}
      {!loading && children}
    </AuthContext.Provider>
  );
};
