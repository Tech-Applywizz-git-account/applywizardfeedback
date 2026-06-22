import { feedbackRepository } from '../repositories/feedback.repository';
import { commentRepository } from '../repositories/comment.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { CreateFeedbackDtoType, FeedbackQueryDtoType, CreateCommentDtoType } from '../types/dto';
import { FeedbackStatus, Role } from '@prisma/client';

const BUCKET = 'feedback-images';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];

export class FeedbackService {
  async create(userId: string, data: CreateFeedbackDtoType, files: Express.Multer.File[]) {
    // Create feedback
    const feedback = await feedbackRepository.create(userId, data);

    // Upload images if any
    if (files && files.length > 0) {
      if (files.length > 10) {
        throw new AppError('Maximum 10 images allowed', 400);
      }

      const imageData: Array<{ imageUrl: string; imagePath: string }> = [];

      for (const file of files) {
        if (file.size > MAX_FILE_SIZE) {
          throw new AppError(`File ${file.originalname} exceeds 10MB limit`, 400);
        }
        if (!ALLOWED_TYPES.includes(file.mimetype)) {
          throw new AppError(`File type ${file.mimetype} not allowed`, 400);
        }

        const ext = file.originalname.split('.').pop();
        const path = `${userId}/${feedback.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

        const { data: uploadData, error } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(path, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
          });

        if (error) {
          console.error('Upload error:', error);
          continue;
        }

        const { data: publicUrl } = supabaseAdmin.storage
          .from(BUCKET)
          .getPublicUrl(path);

        imageData.push({ imageUrl: publicUrl.publicUrl, imagePath: path });
      }

      if (imageData.length > 0) {
        await feedbackRepository.addImages(feedback.id, imageData);
      }
    }

    await activityLogRepository.create({
      actorId: userId,
      action: 'FEEDBACK_CREATED',
      entityType: 'feedback',
      entityId: feedback.id,
      metadata: { title: feedback.title, category: feedback.category },
    });

    return feedbackRepository.findById(feedback.id);
  }

  async getAll(userId: string, query: FeedbackQueryDtoType) {
    return feedbackRepository.findByUserId(userId, query);
  }

  async getById(id: string, userId: string, isAdmin: boolean) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) throw new AppError('Feedback not found', 404);

    // Non-admins can only view their own feedback
    if (!isAdmin && feedback.userId !== userId) {
      throw new AppError('Not authorized to view this feedback', 403);
    }

    return feedback;
  }

  async delete(id: string, userId: string) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) throw new AppError('Feedback not found', 404);
    if (feedback.userId !== userId) throw new AppError('Not authorized', 403);

    // Delete images from storage
    if (feedback.images.length > 0) {
      const paths = feedback.images.map((img) => img.imagePath);
      await supabaseAdmin.storage.from(BUCKET).remove(paths);
    }

    await feedbackRepository.delete(id);
    return true;
  }

  async addComment(feedbackId: string, userId: string, isAdmin: boolean, data: CreateCommentDtoType) {
    const feedback = await feedbackRepository.findById(feedbackId);
    if (!feedback) throw new AppError('Feedback not found', 404);

    if (!isAdmin && feedback.userId !== userId) {
      throw new AppError('Not authorized to comment on this feedback', 403);
    }

    const comment = await commentRepository.create(feedbackId, userId, data.comment, isAdmin);

    await activityLogRepository.create({
      actorId: userId,
      action: 'COMMENT_ADDED',
      entityType: 'feedback',
      entityId: feedbackId,
      metadata: { isAdmin },
    });

    return comment;
  }

  async getComments(feedbackId: string) {
    const feedback = await feedbackRepository.findById(feedbackId);
    if (!feedback) throw new AppError('Feedback not found', 404);
    return commentRepository.findByFeedbackId(feedbackId);
  }

  async adminGetAll(query: FeedbackQueryDtoType) {
    return feedbackRepository.findAll(query);
  }

  async adminUpdateStatus(id: string, adminId: string, status: FeedbackStatus) {
    const feedback = await feedbackRepository.findById(id);
    if (!feedback) throw new AppError('Feedback not found', 404);

    const updated = await feedbackRepository.updateStatus(id, status);

    await activityLogRepository.create({
      actorId: adminId,
      action: 'STATUS_UPDATED',
      entityType: 'feedback',
      entityId: id,
      metadata: { from: feedback.status, to: status },
    });

    return updated;
  }

  async getStats() {
    return feedbackRepository.getStats();
  }
}

export const feedbackService = new FeedbackService();
