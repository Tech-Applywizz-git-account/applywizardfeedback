import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  async signUp(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.signUp(req.body);
      res.status(201).json({ success: true, data: result, message: 'Account created successfully' });
    } catch (err) {
      next(err);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json({ success: true, data: result, message: 'Logged in successfully' });
    } catch (err) {
      next(err);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] || '';
      await authService.logout(token);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  }

  async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.forgotPassword(req.body.email);
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.',
      });
    } catch (err) {
      next(err);
    }
  }

  async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.headers.authorization?.split(' ')[1] || '';
      await authService.resetPassword(token, req.body.password);
      res.json({ success: true, message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  }

  async me(req: Request, res: Response) {
    res.json({ success: true, data: req.user });
  }
}

export const authController = new AuthController();
