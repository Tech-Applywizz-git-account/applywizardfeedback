import { FeedbackCategory, FeedbackStatus, Role } from '@prisma/client';
import { z } from 'zod';

// ─── Auth DTOs ────────────────────────────────────────────────────────────────

export const SignUpDto = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain uppercase, lowercase, number and special character'),
});

export const LoginDto = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const ForgotPasswordDto = z.object({
  email: z.string().email(),
});

export const ResetPasswordDto = z.object({
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, 'Password must contain uppercase, lowercase, number and special character'),
});

// ─── Feedback DTOs ────────────────────────────────────────────────────────────

export const CreateFeedbackDto = z.object({
  title: z.string().min(5).max(200),
  description: z.string().min(10).max(5000),
  category: z.nativeEnum(FeedbackCategory),
});

export const UpdateFeedbackStatusDto = z.object({
  status: z.nativeEnum(FeedbackStatus),
});

export const CreateCommentDto = z.object({
  comment: z.string().min(1).max(2000),
});

// ─── Query DTOs ───────────────────────────────────────────────────────────────

export const PaginationDto = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const FeedbackQueryDto = PaginationDto.extend({
  search: z.string().optional(),
  category: z.nativeEnum(FeedbackCategory).optional(),
  status: z.nativeEnum(FeedbackStatus).optional(),
  sortBy: z.enum(['createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const UserQueryDto = PaginationDto.extend({
  search: z.string().optional(),
  role: z.nativeEnum(Role).optional(),
  isActive: z.coerce.boolean().optional(),
});

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignUpDtoType = z.infer<typeof SignUpDto>;
export type LoginDtoType = z.infer<typeof LoginDto>;
export type ForgotPasswordDtoType = z.infer<typeof ForgotPasswordDto>;
export type ResetPasswordDtoType = z.infer<typeof ResetPasswordDto>;
export type CreateFeedbackDtoType = z.infer<typeof CreateFeedbackDto>;
export type UpdateFeedbackStatusDtoType = z.infer<typeof UpdateFeedbackStatusDto>;
export type CreateCommentDtoType = z.infer<typeof CreateCommentDto>;
export type PaginationDtoType = z.infer<typeof PaginationDto>;
export type FeedbackQueryDtoType = z.infer<typeof FeedbackQueryDto>;
export type UserQueryDtoType = z.infer<typeof UserQueryDto>;
