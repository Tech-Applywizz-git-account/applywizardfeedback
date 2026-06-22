import { Request, Response, NextFunction } from 'express';
import { feedbackService } from '../services/feedback.service';
import { Role } from '@prisma/client';

export class FeedbackController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const files = (req.files as Express.Multer.File[]) || [];
      const feedback = await feedbackService.create(req.userId!, req.body, files);
      res.status(201).json({ success: true, data: feedback, message: 'Feedback submitted successfully' });
    } catch (err) {
      next(err);
    }
  }

  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await feedbackService.getAll(req.userId!, req.query as any);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === Role.ADMIN;
      const feedback = await feedbackService.getById(req.params.id, req.userId!, isAdmin);
      res.json({ success: true, data: feedback });
    } catch (err) {
      next(err);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await feedbackService.delete(req.params.id, req.userId!);
      res.json({ success: true, message: 'Feedback deleted' });
    } catch (err) {
      next(err);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const isAdmin = req.user?.role === Role.ADMIN;
      const comment = await feedbackService.addComment(req.params.id, req.userId!, isAdmin, req.body);
      res.status(201).json({ success: true, data: comment, message: 'Comment added' });
    } catch (err) {
      next(err);
    }
  }

  async getComments(req: Request, res: Response, next: NextFunction) {
    try {
      const comments = await feedbackService.getComments(req.params.id);
      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }
}

export const feedbackController = new FeedbackController();
