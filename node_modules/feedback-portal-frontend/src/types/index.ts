export type Role = 'ADMIN' | 'USER';
export type FeedbackCategory = 'BUG' | 'FEATURE_REQUEST' | 'UI_ISSUE' | 'PERFORMANCE' | 'CRASH' | 'OTHER';
export type FeedbackStatus = 'NEW' | 'IN_PROGRESS' | 'FIXED' | 'REJECTED' | 'RELEASED';

export interface Profile {
  id: string;
  authUserId: string;
  email: string;
  username: string;
  role: Role;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { feedback: number };
}

export interface FeedbackImage {
  id: string;
  feedbackId: string;
  imageUrl: string;
  imagePath: string;
  createdAt: string;
}

export interface FeedbackComment {
  id: string;
  feedbackId: string;
  userId: string;
  comment: string;
  isAdmin: boolean;
  createdAt: string;
  user: Pick<Profile, 'id' | 'username' | 'role'>;
}

export interface Feedback {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  status: FeedbackStatus;
  userId: string;
  createdAt: string;
  updatedAt: string;
  user?: Pick<Profile, 'id' | 'username' | 'email'>;
  images: FeedbackImage[];
  comments?: FeedbackComment[];
  _count?: { comments: number };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface FeedbackStats {
  total: number;
  byStatus: Array<{ status: FeedbackStatus; _count: { status: number } }>;
  byCategory: Array<{ category: FeedbackCategory; _count: { category: number } }>;
  recentTrend: Array<{ date: string; count: string }>;
}

export interface UserStats {
  total: number;
  admins: number;
  active: number;
  inactive: number;
}

export interface AdminStats {
  feedback: FeedbackStats;
  users: UserStats;
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: FeedbackCategory;
  status?: FeedbackStatus;
  sortBy?: 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export interface UserQuery {
  page?: number;
  limit?: number;
  search?: string;
  role?: Role;
  isActive?: boolean;
}
