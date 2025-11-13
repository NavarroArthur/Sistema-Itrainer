import axios from 'axios';

// Em produção, usa URL relativa. Em desenvolvimento, usa localhost
const baseURL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3010/api';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('itrainer_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;