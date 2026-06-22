import { Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedback.service';
import { userService } from '../services/user.service';

export class AdminController {
  // ─── Users ────────────────────────────────────────────────────────────────

  async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await userService.getAll(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async promoteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.promoteToAdmin(req.params.id, req.userId!);
      res.json({ success: true, data: user, message: 'User promoted to admin' });
    } catch (err) {
      next(err);
    }
  }

  async demoteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.demoteFromAdmin(req.params.id, req.userId!);
      res.json({ success: true, data: user, message: 'Admin privileges removed' });
    } catch (err) {
      next(err);
    }
  }

  async disableUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.disableUser(req.params.id, req.userId!);
      res.json({ success: true, data: user, message: 'User disabled' });
    } catch (err) {
      next(err);
    }
  }

  async enableUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.enableUser(req.params.id, req.userId!);
      res.json({ success: true, data: user, message: 'User enabled' });
    } catch (err) {
      next(err);
    }
  }

  // ─── Feedback ─────────────────────────────────────────────────────────────

  async getFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.adminGetAll(req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async updateFeedbackStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const feedback = await feedbackService.adminUpdateStatus(
        req.params.id,
        req.userId!,
        req.body.status
      );
      res.json({ success: true, data: feedback, message: 'Status updated' });
    } catch (err) {
      next(err);
    }
  }

  // ─── Stats ────────────────────────────────────────────────────────────────

  async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const [feedbackStats, userStats] = await Promise.all([
        feedbackService.getStats(),
        userService.getStats(),
      ]);
      res.json({ success: true, data: { feedback: feedbackStats, users: userStats } });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
