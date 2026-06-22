import api from '../lib/api';
import {
  ApiResponse,
  AdminStats,
  Profile,
  Feedback,
  PaginatedResponse,
  FeedbackQuery,
  UserQuery,
  FeedbackStatus,
} from '../types';

export const adminApi = {
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    const res = await api.get('/admin/stats');
    return res.data;
  },

  // Users
  getUsers: async (query: UserQuery = {}): Promise<ApiResponse<PaginatedResponse<Profile>>> => {
    const res = await api.get('/admin/users', { params: query });
    return res.data;
  },

  promoteUser: async (id: string): Promise<ApiResponse<Profile>> => {
    const res = await api.put(`/admin/users/${id}/promote`);
    return res.data;
  },

  demoteUser: async (id: string): Promise<ApiResponse<Profile>> => {
    const res = await api.put(`/admin/users/${id}/demote`);
    return res.data;
  },

  disableUser: async (id: string): Promise<ApiResponse<Profile>> => {
    const res = await api.put(`/admin/users/${id}/disable`);
    return res.data;
  },

  enableUser: async (id: string): Promise<ApiResponse<Profile>> => {
    const res = await api.put(`/admin/users/${id}/enable`);
    return res.data;
  },

  // Feedback
  getFeedback: async (query: FeedbackQuery = {}): Promise<ApiResponse<PaginatedResponse<Feedback>>> => {
    const res = await api.get('/admin/feedback', { params: query });
    return res.data;
  },

  updateFeedbackStatus: async (id: string, status: FeedbackStatus): Promise<ApiResponse<Feedback>> => {
    const res = await api.put(`/admin/feedback/${id}/status`, { status });
    return res.data;
  },
};
