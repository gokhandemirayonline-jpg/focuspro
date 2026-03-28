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
  getMe: () => api.get(`/auth/me?t=${new Date().getTime()}`),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.post('/auth/change-password', passwordData),
};

// User API
export const userAPI = {
  getAll: () => api.get('/users'),
  create: (userData) => api.post('/users', userData),
  update: (userId, userData) => api.put(`/users/${userId}`, userData),
  delete: (userId) => api.delete(`/users/${userId}`),
  getBadgeCollection: () => api.get('/badges/my-collection'),
  getBadges: (userId) => api.get(`/users/${userId}/badges`),
};

// Video Category API
export const videoCategoryAPI = {
  getAll: () => api.get('/video-categories'),
  create: (categoryData) => api.post('/video-categories', categoryData),
  update: (categoryId, categoryData) => api.put(`/video-categories/${categoryId}`, categoryData),
  delete: (categoryId) => api.delete(`/video-categories/${categoryId}`),
};

// Video API
export const videoAPI = {
  getAll: () => api.get('/videos'),
  create: (videoData) => api.post('/videos', videoData),
  update: (videoId, videoData) => api.put(`/videos/${videoId}`, videoData),
  delete: (videoId) => api.delete(`/videos/${videoId}`),
  trackView: (videoId) => api.post(`/videos/${videoId}/view`),
  getStatistics: () => api.get('/videos/statistics/views'),
  reorder: (orderUpdates) => api.post('/admin/videos/reorder', orderUpdates)
};

// Video Progress API
export const progressAPI = {
  get: () => api.get('/progress'),
  complete: (videoId, comment) => api.post(`/progress/${videoId}`, null, { params: { comment } }),
  updateProgress: (videoId, progressData) => api.patch(`/videos/${videoId}/progress`, progressData),
  incrementView: (videoId) => api.post(`/videos/${videoId}/view`)
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
  update: (goalId, goalData) => api.put(`/goals/${goalId}`, goalData),
  delete: (goalId) => api.delete(`/goals/${goalId}`),
};

// Reason API
export const reasonAPI = {
  getAll: () => api.get('/reasons'),
  create: (reasonData) => api.post('/reasons', reasonData),
  delete: (reasonId) => api.delete(`/reasons/${reasonId}`),
};

// Prospect Category API
export const prospectCategoryAPI = {
  getAll: () => api.get('/prospect-categories'),
  create: (categoryData) => api.post('/prospect-categories', categoryData),
  update: (categoryId, categoryData) => api.put(`/prospect-categories/${categoryId}`, categoryData),
  delete: (categoryId) => api.delete(`/prospect-categories/${categoryId}`),
};

// Prospect Column API (Dynamic Columns)
export const prospectColumnAPI = {
  getAll: () => api.get('/prospect-columns'),
  create: (columnData) => api.post('/prospect-columns', columnData),
  update: (columnId, columnData) => api.put(`/prospect-columns/${columnId}`, columnData),
  delete: (columnId) => api.delete(`/prospect-columns/${columnId}`),
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

// Habit API (New structure)
export const habitAPI = {
  getAll: () => api.get('/habits'),
  create: (habitData) => api.post('/habits', habitData),
  update: (habitId, habitData) => api.put(`/habits/${habitId}`, habitData),
  delete: (habitId) => api.delete(`/habits/${habitId}`),
  complete: (habitId) => api.post(`/habits/${habitId}/complete`),
  uncomplete: (habitId) => api.delete(`/habits/${habitId}/complete`),
  completeForDate: (habitId, date) => api.post(`/habits/${habitId}/complete`, { completion_date: date }),
  uncompleteForDate: (habitId, date) => api.delete(`/habits/${habitId}/complete`, { data: { completion_date: date } }),
  getTodayCompletions: () => api.get('/habits/completions/today'),
  getDateCompletions: (date) => api.get(`/habits/completions/date/${date}`),
  getStats: () => api.get('/habits/stats'),
  getCalendar: (year, month) => api.get(`/habits/calendar/${year}/${month}`),
};

// Dream Priority API (Multiple analyses support)
export const dreamPriorityAPI = {
  getAll: () => api.get('/dream-priorities'),
  getOne: (id) => api.get(`/dream-priorities/${id}`),
  create: (dreamData) => api.post('/dream-priorities', dreamData),
  update: (id, dreamData) => api.put(`/dream-priorities/${id}`, dreamData),
  delete: (id) => api.delete(`/dream-priorities/${id}`),
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
  reply: (messageId, content) => {
    // content string ise, obje yap. Obje ise olduğu gibi gönder
    const body = typeof content === 'string' ? { content } : content;
    return api.post(`/messages/${messageId}/reply`, body);
  },
  getThread: (messageId) => api.get(`/messages/${messageId}/thread`),
};

// Statistics & Analytics API
export const statisticsAPI = {
  getDashboard: () => api.get('/statistics/dashboard'),
  getUserRegistrations: () => api.get('/statistics/user-registrations'),
  getActiveUsers: () => api.get('/statistics/active-users'),
  getEventParticipation: () => api.get('/statistics/event-participation'),
  exportUsers: () => api.get('/statistics/export-users'),
};

// Activity Log API
export const activityLogAPI = {
  getAll: (filters) => {
    const params = new URLSearchParams();
    if (filters?.action) params.append('action', filters.action);
    if (filters?.resource_type) params.append('resource_type', filters.resource_type);
    if (filters?.user_id) params.append('user_id', filters.user_id);
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    if (filters?.limit) params.append('limit', filters.limit);
    return api.get(`/activity-logs?${params.toString()}`);
  },
  getStatistics: () => api.get('/activity-logs/statistics'),
  clearOld: (days) => api.delete(`/activity-logs/clear?days=${days}`),
};

// Learning Path API
export const learningPathAPI = {
  getAll: () => api.get('/learning-paths'),
  create: (pathData) => api.post('/learning-paths', pathData),
  update: (pathId, pathData) => api.put(`/learning-paths/${pathId}`, pathData),
  delete: (pathId) => api.delete(`/learning-paths/${pathId}`),
  getProgress: (pathId) => api.get(`/learning-paths/${pathId}/progress`),
};

// Badge API
export const badgeAPI = {
  getAll: () => api.get('/badges'),
  create: (badgeData) => api.post('/badges', badgeData),
  update: (badgeId, badgeData) => api.put(`/badges/${badgeId}`, badgeData),
  delete: (badgeId) => api.delete(`/badges/${badgeId}`),
  awardBadge: (userId, badgeData) => api.post('/admin/badges/award', badgeData, { params: { user_id: userId } }),
};

// Character Analysis API
export const characterAnalysisAPI = {
  getAll: () => api.get('/character-analysis'),
  getById: (analysisId) => api.get(`/character-analysis/${analysisId}`),
  create: (analysisData) => api.post('/character-analysis', analysisData),
  update: (analysisId, analysisData) => api.put(`/character-analysis/${analysisId}`, analysisData),
  delete: (analysisId) => api.delete(`/character-analysis/${analysisId}`),
  aiAnalyze: (analysisData) => api.post('/character-analysis/ai-analyze', analysisData),
};

// Future Character API
export const futureCharacterAPI = {
  getAll: () => api.get('/future-character'),
  getById: (characterId) => api.get(`/future-character/${characterId}`),
  create: (characterData) => api.post('/future-character', characterData),
  update: (characterId, characterData) => api.put(`/future-character/${characterId}`, characterData),
  delete: (characterId) => api.delete(`/future-character/${characterId}`),
  aiAnalyze: (characterData) => api.post('/future-character/ai-analyze', characterData),
  gapAnalysis: (analysisData) => api.post('/character-gap-analysis', analysisData),
};

// Full Life Profile API
export const fullLifeProfileAPI = {
  getAll: () => api.get('/full-life-profile'),
  getById: (profileId) => api.get(`/full-life-profile/${profileId}`),
  create: (profileData) => api.post('/full-life-profile', profileData),
  update: (profileId, profileData) => api.put(`/full-life-profile/${profileId}`, profileData),
  analyzeCurrent: (currentData) => api.post('/full-life-profile/analyze-current', currentData),
  analyzeFuture: (futureData) => api.post('/full-life-profile/analyze-future', futureData),
  gapAnalysis: (analysisData) => api.post('/full-life-profile/gap-analysis', analysisData),
};

// Stats API
export const statsAPI = {
  getOverview: (targetUserId = null) => api.get('/stats/overview', { params: { target_user_id: targetUserId } }),
  getTasks: (period = 'week', targetUserId = null) => api.get('/stats/tasks', { params: { period, target_user_id: targetUserId } }),
  getMeetings: (period = 'week', targetUserId = null) => api.get('/stats/meetings', { params: { period, target_user_id: targetUserId } }),
  getPartners: (period = 'month', targetUserId = null) => api.get('/stats/partners', { params: { period, target_user_id: targetUserId } }),
  getEducation: (period = 'month', targetUserId = null) => api.get('/stats/education', { params: { period, target_user_id: targetUserId } }),
  getPerformance: (targetUserId = null) => api.get('/stats/performance', { params: { target_user_id: targetUserId } }),
  // Alışkanlık istatistikleri için ayrı endpoint kullanılıyor
  getHabits: () => api.get('/habits/stats'),
};

// Upload API
export const uploadAPI = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;
