import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_URL = `${BACKEND_URL}/api`;

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (name, email, password, role) => api.post('/auth/register', { name, email, password, role }),
  getMe: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  update: (userId, userData) => api.put(`/users/${userId}`, userData),
  delete: (userId) => api.delete(`/users/${userId}`),
};

// Video API
export const videoAPI = {
  getAll: () => api.get('/videos'),
  create: (videoData) => api.post('/videos', videoData),
  update: (videoId, videoData) => api.put(`/videos/${videoId}`, videoData),
  delete: (videoId) => api.delete(`/videos/${videoId}`),
};

// Video Progress API
export const progressAPI = {
  get: () => api.get('/progress'),
  complete: (videoId, comment) => api.post(`/progress/${videoId}`, null, { params: { comment } }),
};

// Meeting API
export const meetingAPI = {
  getAll: () => api.get('/meetings'),
  create: (meetingData) => api.post('/meetings', meetingData),
  update: (meetingId, meetingData) => api.put(`/meetings/${meetingId}`, meetingData),
  delete: (meetingId) => api.delete(`/meetings/${meetingId}`),
};

// Task API
export const taskAPI = {
  getAll: () => api.get('/tasks'),
  create: (taskData) => api.post('/tasks', taskData),
  update: (taskId, taskData) => api.put(`/tasks/${taskId}`, taskData),
  updateStatus: (taskId, status) => api.patch(`/tasks/${taskId}/status`, null, { params: { status } }),
  delete: (taskId) => api.delete(`/tasks/${taskId}`),
};

// Goal API
export const goalAPI = {
  getAll: () => api.get('/goals'),
  create: (goalData) => api.post('/goals', goalData),
  delete: (goalId) => api.delete(`/goals/${goalId}`),
};

// Reason API
export const reasonAPI = {
  getAll: () => api.get('/reasons'),
  create: (reasonData) => api.post('/reasons', reasonData),
  delete: (reasonId) => api.delete(`/reasons/${reasonId}`),
};

// Prospect API
export const prospectAPI = {
  getAll: () => api.get('/prospects'),
  create: (prospectData) => api.post('/prospects', prospectData),
  update: (prospectId, prospectData) => api.put(`/prospects/${prospectId}`, prospectData),
  delete: (prospectId) => api.delete(`/prospects/${prospectId}`),
};

// Partner API
export const partnerAPI = {
  getAll: () => api.get('/partners'),
  create: (partnerData) => api.post('/partners', partnerData),
  update: (partnerId, partnerData) => api.put(`/partners/${partnerId}`, partnerData),
  delete: (partnerId) => api.delete(`/partners/${partnerId}`),
};

// Habit API
export const habitAPI = {
  getAll: () => api.get('/habits'),
  update: (habitId, completed) => api.patch(`/habits/${habitId}`, null, { params: { completed } }),
};

// Event API
export const eventAPI = {
  getAll: () => api.get('/events'),
  create: (eventData) => api.post('/events', eventData),
  update: (eventId, eventData) => api.put(`/events/${eventId}`, eventData),
  delete: (eventId) => api.delete(`/events/${eventId}`),
};

// Event Registration API
export const eventRegistrationAPI = {
  getAll: () => api.get('/event-registrations'),
  register: (eventId) => api.post('/event-registrations', null, { params: { event_id: eventId } }),
  updateStatus: (registrationId, status) => api.patch(`/event-registrations/${registrationId}/status`, null, { params: { status } }),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  create: (notificationData, userId) => api.post('/notifications', notificationData, { params: { user_id: userId } }),
  markRead: (notificationId) => api.patch(`/notifications/${notificationId}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count'),
};

// Recommendation API
export const recommendationAPI = {
  getAll: (type) => api.get('/recommendations', { params: { type } }),
  create: (recData) => api.post('/recommendations', recData),
  update: (recId, recData) => api.put(`/recommendations/${recId}`, recData),
  delete: (recId) => api.delete(`/recommendations/${recId}`),
};

// Blog API
export const blogAPI = {
  getAll: (published) => api.get('/blogs', { params: { published } }),
  getOne: (blogId) => api.get(`/blogs/${blogId}`),
  create: (blogData) => api.post('/blogs', blogData),
  update: (blogId, blogData) => api.put(`/blogs/${blogId}`, blogData),
  delete: (blogId) => api.delete(`/blogs/${blogId}`),
};

// Search API
export const searchAPI = {
  search: (query) => api.get('/search', { params: { q: query } }),
};

// File Upload API
export const fileAPI = {
  uploadImage: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    return axios.post(`${API_URL}/upload-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`
      }
    });
  }
};

// Message/Inbox API
export const messageAPI = {
  getAll: () => api.get('/messages'),
  send: (messageData) => api.post('/messages', messageData),
  getUnreadCount: () => api.get('/messages/unread-count'),
  markRead: (messageId) => api.patch(`/messages/${messageId}/read`),
  markAllRead: () => api.patch('/messages/read-all'),
  delete: (messageId) => api.delete(`/messages/${messageId}`),
};

// Statistics & Analytics API
export const statisticsAPI = {
  getDashboard: () => api.get('/statistics/dashboard'),
  getUserRegistrations: () => api.get('/statistics/user-registrations'),
  getActiveUsers: () => api.get('/statistics/active-users'),
  getEventParticipation: () => api.get('/statistics/event-participation'),
  exportUsers: () => api.get('/statistics/export-users'),
};

export default api;
