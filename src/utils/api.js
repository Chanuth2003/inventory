// src/utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,        // ← This is the key fix
  timeout: 10000,
});

// Optional: Add response interceptor for better error handling
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      console.log("Session expired");
      // You can redirect to login here if you want
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;