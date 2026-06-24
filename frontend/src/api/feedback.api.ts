import api from '../lib/api';
import { ApiResponse, Feedback, FeedbackComment, PaginatedResponse, FeedbackQuery } from '../types';
import { FeedbackSchema, CommentSchema } from '../lib/schemas';

export const feedbackApi = {
  create: async (data: FeedbackSchema, images?: File[]): Promise<ApiResponse<Feedback>> => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('category', data.category);
    formData.append('description', data.description);
    if (images && images.length > 0) {
      images.forEach((file) => formData.append('images', file));
    }
    const res = await api.post('/feedback', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  getAll: async (query: FeedbackQuery = {}): Promise<ApiResponse<PaginatedResponse<Feedback>>> => {
    const res = await api.get('/feedback', { params: query });
    return res.data;
  },

  getById: async (id: string): Promise<ApiResponse<Feedback>> => {
    const res = await api.get(`/feedback/${id}`);
    return res.data;
  },

  delete: async (id: string): Promise<ApiResponse<null>> => {
    const res = await api.delete(`/feedback/${id}`);
    return res.data;
  },

  addComment: async (id: string, data: CommentSchema): Promise<ApiResponse<FeedbackComment>> => {
    const res = await api.post(`/feedback/${id}/comment`, data);
    return res.data;
  },

  getComments: async (id: string): Promise<ApiResponse<FeedbackComment[]>> => {
    const res = await api.get(`/feedback/${id}/comments`);
    return res.data;
  },
};
