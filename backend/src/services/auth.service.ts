import { supabaseAdmin } from '../config/supabase';
import { userRepository } from '../repositories/user.repository';
import { AppError } from '../middleware/errorHandler';
import { SignUpDtoType, LoginDtoType } from '../types/dto';

export class AuthService {
  async signUp(data: SignUpDtoType) {
    const { email, username, password } = data;

    // Check username uniqueness
    const existingUsername = await userRepository.findByEmail(email);
    if (existingUsername) {
      throw new AppError('Email already in use', 409);
    }

    const existingProfile = await userRepository.findByEmail(email);

    // Register in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        throw new AppError('Email already in use', 409);
      }
      throw new AppError(authError.message, 400);
    }

    if (!authData.user) {
      throw new AppError('Failed to create user', 500);
    }

    // Create profile in DB
    const profile = await userRepository.create({
      authUserId: authData.user.id,
      email,
      username,
    });

    // Generate session
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
    });

    // Sign in to get token
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session) {
      throw new AppError('Account created but could not generate session', 500);
    }

    return {
      user: profile,
      token: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
    };
  }

  async login(data: LoginDtoType) {
    const { email, password } = data;

    const { data: signInData, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !signInData.session) {
      throw new AppError('Invalid email or password', 401);
    }

    const profile = await userRepository.findByAuthUserId(signInData.user.id);
    if (!profile) {
      throw new AppError('User profile not found', 404);
    }

    if (!profile.isActive) {
      throw new AppError('Account has been disabled. Please contact an administrator.', 403);
    }

    return {
      user: profile,
      token: signInData.session.access_token,
      refreshToken: signInData.session.refresh_token,
    };
  }

  async logout(token: string) {
    const { error } = await supabaseAdmin.auth.admin.signOut(token);
    if (error) {
      console.error('Logout error:', error);
    }
    return true;
  }

  async forgotPassword(email: string) {
    // We just trigger the reset email; don't reveal if user exists
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
      options: {
        redirectTo: `${process.env.CORS_ORIGIN}/auth/reset-password`,
      },
    });
    // Silently handle — don't leak user existence
    return true;
  }

  async resetPassword(token: string, newPassword: string) {
    // The token from the reset email is a Supabase access token
    const { data: { user }, error: verifyError } = await supabaseAdmin.auth.getUser(token);

    if (verifyError || !user) {
      throw new AppError('Invalid or expired reset token', 401);
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      password: newPassword,
    });

    if (error) {
      throw new AppError('Failed to reset password', 500);
    }

    return true;
  }
}

export const authService = new AuthService();
