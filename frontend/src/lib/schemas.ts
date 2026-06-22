import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain a number')
    .regex(/[@$!%*?&]/, 'Must contain a special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain a number')
      .regex(/[@$!%*?&]/, 'Must contain a special character'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const feedbackSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  category: z.enum(['BUG', 'FEATURE_REQUEST', 'UI_ISSUE', 'PERFORMANCE', 'CRASH', 'OTHER'], {
    required_error: 'Please select a category',
  }),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
});

export const commentSchema = z.object({
  comment: z.string().min(1, 'Comment cannot be empty').max(2000),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
export type LoginSchema = z.infer<typeof loginSchema>;
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
export type FeedbackSchema = z.infer<typeof feedbackSchema>;
export type CommentSchema = z.infer<typeof commentSchema>;
