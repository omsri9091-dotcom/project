import axios from 'axios';
import {
  User,
  Student,
  Prediction,
  Recommendation,
  StudyPlan,
  Notification,
  ModelMetrics,
  AnalyticsOverview,
} from '../types';

const configuredApiUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
const API_BASE_URL =
  configuredApiUrl ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:5000/api'
    : 'https://adexa-ai-production.up.railway.app/api');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adexa_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept 401s for automatic session expiry handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        localStorage.removeItem('adexa_token');
        localStorage.removeItem('adexa_user');
      }
    }
    return Promise.reject(error);
  }
);

/* Auth API */
export const authApi = {
  login: async (credentials: any) => {
    const res = await api.post('/auth/login', credentials);
    return res.data;
  },
  register: async (userData: any) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('/auth/profile', data);
    return res.data;
  },
};

/* Student API */
export const studentApi = {
  getMyProfile: async () => {
    try {
      const res = await api.get('/students/me');
      return res.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // Fallback for legacy route deployments
        const authRes = await api.get('/auth/me');
        if (authRes.data && authRes.data.user) {
          return {
            success: true,
            data: {
              student: authRes.data.user.studentProfile || null,
              isProfileCompleted: Boolean(authRes.data.user.isProfileCompleted),
              predictions: [],
              recommendations: [],
            },
          };
        }
      }
      throw err;
    }
  },
  saveProfile: async (profileData: any) => {
    try {
      const res = await api.post('/students/profile', profileData);
      return res.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // Fallback for servers without /students/profile route
        const authRes = await api.put('/auth/profile', profileData);
        return {
          success: true,
          message: authRes.data?.message || 'Profile updated successfully.',
          data: {
            student: authRes.data?.user?.studentProfile || authRes.data?.data?.student || profileData,
            isProfileCompleted: true,
          },
          user: authRes.data?.user,
        };
      }
      throw err;
    }
  },
  getStudents: async (params?: any) => {
    const res = await api.get('/students', { params });
    return res.data;
  },
  getStudentById: async (id: string) => {
    try {
      const res = await api.get(`/students/${id}`);
      return res.data;
    } catch (err: any) {
      if (err.response && err.response.status === 404 && id === 'me') {
        const authRes = await api.get('/auth/me');
        if (authRes.data && authRes.data.user) {
          return {
            success: true,
            data: {
              student: authRes.data.user.studentProfile || null,
              isProfileCompleted: Boolean(authRes.data.user.isProfileCompleted),
              predictions: [],
              recommendations: [],
            },
          };
        }
      }
      throw err;
    }
  },
  createStudent: async (studentData: any) => {
    const res = await api.post('/students', studentData);
    return res.data;
  },
  updateStudent: async (id: string, studentData: any) => {
    const res = await api.put(`/students/${id}`, studentData);
    return res.data;
  },
  deleteStudent: async (id: string) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },
  exportCSV: async () => {
    const res = await api.get('/students/export/csv', { responseType: 'blob' });
    return res.data;
  },
};

/* Prediction API */
export const predictionApi = {
  predict: async (data: any) => {
    const res = await api.post('/predictions/predict', data);
    return res.data;
  },
  getStudentPredictions: async (studentId: string) => {
    const res = await api.get(`/predictions/${studentId}`);
    return res.data;
  },
  getMetrics: async (): Promise<{ success: boolean; metrics: ModelMetrics }> => {
    const res = await api.get('/predictions/metrics');
    return res.data;
  },
};

/* Recommendation API */
export const recommendationApi = {
  generate: async (data: { studentId?: string }) => {
    const res = await api.post('/recommendations/generate', data);
    return res.data;
  },
  getByStudent: async (studentId: string) => {
    const res = await api.get(`/recommendations/${studentId}`);
    return res.data;
  },
  toggleStatus: async (id: string) => {
    const res = await api.put(`/recommendations/${id}/toggle`);
    return res.data;
  },
};

/* Study Plan API */
export const studyPlanApi = {
  create: async (data: any) => {
    const res = await api.post('/study-plans', data);
    return res.data;
  },
  getByStudent: async (studentId: string) => {
    const res = await api.get(`/study-plans/${studentId}`);
    return res.data;
  },
};

/* Analytics API */
export const analyticsApi = {
  getOverview: async (params?: any): Promise<{ success: boolean; data: AnalyticsOverview }> => {
    const res = await api.get('/analytics/overview', { params });
    return res.data;
  },
  getPerformance: async (params?: any) => {
    const res = await api.get('/analytics/performance', { params });
    return res.data;
  },
  getRisk: async (params?: any) => {
    const res = await api.get('/analytics/risk', { params });
    return res.data;
  },
};

/* Notification API */
export const notificationApi = {
  getAll: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },
  markAsRead: async (id: string) => {
    const res = await api.put(`/notifications/${id}/read`);
    return res.data;
  },
  markAllAsRead: async () => {
    const res = await api.put('/notifications/read-all');
    return res.data;
  },
};

/* AI Assistant API */
export const aiApi = {
  chat: async (data: { message: string; studentId?: string; history?: any[] }) => {
    const res = await api.post('/ai/chat', data);
    return res.data;
  },
};

/* User API (Admin) */
export const userApi = {
  getAll: async (params?: any) => {
    const res = await api.get('/users', { params });
    return res.data;
  },
  create: async (userData: any) => {
    const res = await api.post('/users', userData);
    return res.data;
  },
  toggleStatus: async (id: string) => {
    const res = await api.put(`/users/${id}/status`);
    return res.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/users/${id}`);
    return res.data;
  },
};

export default api;
