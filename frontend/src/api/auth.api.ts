import api from '../lib/api';
import { ApiResponse, Profile } from '../types';
import { SignUpSchema, LoginSchema } from '../lib/schemas';

interface AuthResponse {
  user: Profile;
  token: string;
  refreshToken: string;
}

export const authApi = {
  signUp: async (data: SignUpSchema): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post('/auth/signup', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    const res = await api.post('/auth/login', data);
    return res.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },

  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (password: string): Promise<ApiResponse<null>> => {
    const res = await api.post('/auth/reset-password', { password });
    return res.data;
  },

  me: async (): Promise<ApiResponse<Profile>> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};
