import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  get: <T>(url: string, params?: Record<string, unknown>) =>
    api.get<T>(url, { params }).then((res) => res.data),
  post: <T>(url: string, data?: unknown) => api.post<T>(url, data).then((res) => res.data),
  put: <T>(url: string, data?: unknown) => api.put<T>(url, data).then((res) => res.data),
  patch: <T>(url: string, data?: unknown) => api.patch<T>(url, data).then((res) => res.data),
  delete: <T>(url: string) => api.delete<T>(url).then((res) => res.data),
};
