import { prisma } from '../config/prisma';

export class CommentRepository {
  async create(feedbackId: string, userId: string, comment: string, isAdmin: boolean) {
    return prisma.feedbackComment.create({
      data: { feedbackId, userId, comment, isAdmin },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
    });
  }

  async findByFeedbackId(feedbackId: string) {
    return prisma.feedbackComment.findMany({
      where: { feedbackId },
      include: {
        user: { select: { id: true, username: true, role: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const commentRepository = new CommentRepository();
