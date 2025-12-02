import axios from 'axios';

// Base API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ==================== AUTH API ====================
export const authAPI = {
  register: async (name, email, password) => {
    const response = await api.post('/auth/register', { name, email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response;
  },

  logout: async () => {
    await api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    return await api.get('/auth/me');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getStoredUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
};

// ==================== RESTAURANT API ====================
export const restaurantAPI = {
  getAll: async (filters = {}) => {
    return await api.get('/restaurants', { params: filters });
  },

  getById: async (id) => {
    return await api.get(`/restaurants/${id}`);
  },

  search: async (query, cuisine, maxDistance, maxPrice) => {
    return await api.get('/restaurants/search', {
      params: { q: query, cuisine, maxDistance, maxPrice }
    });
  },

  getRecommendations: async () => {
    return await api.get('/restaurants/recommendations');
  },

  getPopular: async (limit = 10) => {
    return await api.get('/restaurants/popular', { params: { limit } });
  },

  getNearby: async (limit = 10) => {
    return await api.get('/restaurants/nearby', { params: { limit } });
  },

  getCuisines: async () => {
    return await api.get('/restaurants/cuisines');
  }
};

// ==================== FAVORITE API ====================
export const favoriteAPI = {
  getAll: async () => {
    return await api.get('/favorites');
  },

  add: async (restaurantId) => {
    return await api.post(`/favorites/${restaurantId}`);
  },

  remove: async (restaurantId) => {
    return await api.delete(`/favorites/${restaurantId}`);
  },

  toggle: async (restaurantId) => {
    return await api.put(`/favorites/${restaurantId}/toggle`);
  },

  check: async (restaurantId) => {
    return await api.get(`/favorites/${restaurantId}/check`);
  }
};

// ==================== HISTORY API ====================
export const historyAPI = {
  getAll: async (limit = 50) => {
    return await api.get('/history', { params: { limit } });
  },

  add: async (restaurantId, action = 'view') => {
    return await api.post('/history', { restaurantId, action });
  },

  getRecentlyViewed: async (limit = 10) => {
    return await api.get('/history/recently-viewed', { params: { limit } });
  },

  getByAction: async (action) => {
    return await api.get(`/history/by-action/${action}`);
  },

  deleteAll: async () => {
    return await api.delete('/history');
  },

  deleteOld: async (days = 30) => {
    return await api.delete(`/history/old/${days}`);
  }
};

// ==================== PROFILE API ====================
export const profileAPI = {
  get: async () => {
    return await api.get('/profile');
  },

  update: async (data) => {
    return await api.put('/profile', data);
  },

  getPreferences: async () => {
    return await api.get('/profile/preferences');
  },

  updatePreferences: async (preferences) => {
    return await api.put('/profile/preferences', preferences);
  },

  deletePreferences: async () => {
    return await api.delete('/profile/preferences');
  },

  getStats: async () => {
    return await api.get('/profile/stats');
  }
};

export default api;
