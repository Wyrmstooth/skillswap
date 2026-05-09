import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
};

export const userAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.put('/users/me', data),
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
};

export const skillAPI = {
  getAll: (params) => api.get('/skills', { params }),
  getByUser: (userId) => api.get(`/skills/user/${userId}`),
  create: (data) => api.post('/skills', data),
  update: (id, data) => api.put(`/skills/${id}`, data),
  delete: (id) => api.delete(`/skills/${id}`),
  getCategories: () => api.get('/skills/categories'),
};

export const taskAPI = {
  getAll: (params) => api.get('/tasks', { params }),
  getById: (id) => api.get(`/tasks/${id}`),
  getByUser: (userId) => api.get(`/tasks/user/${userId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  accept: (id) => api.post(`/tasks/${id}/accept`),
  complete: (id) => api.post(`/tasks/${id}/complete`),
  delete: (id) => api.delete(`/tasks/${id}`),
};

export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getMessages: (userId) => api.get(`/messages/${userId}`),
  send: (data) => api.post('/messages', data),
  markRead: (userId) => api.put(`/messages/read/${userId}`),
};

export const ratingAPI = {
  getByUser: (userId) => api.get(`/ratings/user/${userId}`),
  create: (data) => api.post('/ratings', data),
};

export default api;
