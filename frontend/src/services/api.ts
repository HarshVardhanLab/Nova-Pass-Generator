import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ───────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: handle 401 token expiry ────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ─── Auth ─────────────────────────────────────────────────────
export const auth = {
  login: (username: string, password: string) =>
    api.post('/auth/login', new URLSearchParams({ username, password }), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

// ─── Events ───────────────────────────────────────────────────
export const events = {
  list: () => api.get('/events'),
  get: (id: number) => api.get(`/events/${id}`),
  create: (data: any) => api.post('/events', data),
  update: (id: number, data: any) => api.put(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
};

// ─── Teams ────────────────────────────────────────────────────
export const teams = {
  list: (eventId?: number) => api.get('/teams', { params: { event_id: eventId } }),
  get: (id: number) => api.get(`/teams/${id}`),
  create: (data: any) => api.post('/teams', data),
  delete: (id: number) => api.delete(`/teams/${id}`),
};

// ─── Members ──────────────────────────────────────────────────
export const members = {
  list: (teamId?: number, eventId?: number) =>
    api.get('/members', { params: { team_id: teamId, event_id: eventId } }),
  get: (id: number) => api.get(`/members/${id}`),
  create: (data: any) => api.post('/members', data),
  update: (id: number, data: any) => api.put(`/members/${id}`, data),
  delete: (id: number) => api.delete(`/members/${id}`),
};

// ─── CSV ──────────────────────────────────────────────────────
export const csv = {
  upload: (eventId: number, file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/csv/upload/${eventId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  export: (eventId: number) =>
    api.get(`/csv/export/${eventId}`, { responseType: 'blob' }),
};

// ─── Passes ───────────────────────────────────────────────────
export const passes = {
  generate: (data: any) => api.post('/passes/generate', data),
  download: (memberId: number) =>
    api.get(`/passes/download/${memberId}`, { responseType: 'blob' }),
  downloadAll: (eventId: number) =>
    api.get(`/passes/download-all/${eventId}`, { responseType: 'blob' }),
  preview: (memberId: number) =>
    api.get(`/passes/preview/${memberId}`, { responseType: 'blob' }),
};

// ─── Scanner ──────────────────────────────────────────────────
export const scanner = {
  scan: (data: any) => api.post('/scanner/scan', data),
  attendance: (eventId: number) => api.get(`/scanner/attendance/${eventId}`),
  logs: (eventId: number) => api.get(`/scanner/logs/${eventId}`),
};

// ─── Dashboard ────────────────────────────────────────────────
export const dashboard = {
  stats: () => api.get('/dashboard/stats'),
  eventStats: (eventId: number) => api.get(`/dashboard/event-stats/${eventId}`),
};

// ─── Templates ────────────────────────────────────────────────
export const templates = {
  list: (eventId?: number) =>
    api.get('/templates', { params: { event_id: eventId } }),
  get: (id: number) => api.get(`/templates/${id}`),
  upload: (data: FormData) =>
    api.post('/templates/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id: number, data: any) => api.put(`/templates/${id}`, data),
  delete: (id: number) => api.delete(`/templates/${id}`),
};

export default api;
