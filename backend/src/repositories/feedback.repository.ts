import { prisma } from '../config/prisma';
import { FeedbackQueryDtoType, CreateFeedbackDtoType } from '../types/dto';
import { FeedbackStatus } from '@prisma/client';

export class FeedbackRepository {
  async create(userId: string, data: CreateFeedbackDtoType) {
    return prisma.feedback.create({
      data: {
        ...data,
        userId,
      },
      include: {
        user: { select: { id: true, username: true, email: true } },
        images: true,
        _count: { select: { comments: true } },
      },
    });
  }

  async findAll(query: FeedbackQueryDtoType) {
    const { page, limit, search, category, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: { select: { id: true, username: true, email: true } },
          images: { select: { id: true, imageUrl: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByUserId(userId: string, query: FeedbackQueryDtoType) {
    const { page, limit, search, category, status, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (category) where.category = category;
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      prisma.feedback.count({ where }),
      prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          images: { select: { id: true, imageUrl: true } },
          _count: { select: { comments: true } },
        },
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.feedback.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, username: true, email: true } },
        images: true,
        comments: {
          include: {
            user: { select: { id: true, username: true, role: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async updateStatus(id: string, status: FeedbackStatus) {
    return prisma.feedback.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string) {
    return prisma.feedback.delete({ where: { id } });
  }

  async addImages(feedbackId: string, images: Array<{ imageUrl: string; imagePath: string }>) {
    return prisma.feedbackImage.createMany({
      data: images.map((img) => ({ feedbackId, ...img })),
    });
  }

  async getStats() {
    const [total, byStatus, byCategory, recentTrend] = await Promise.all([
      prisma.feedback.count(),
      prisma.feedback.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      prisma.feedback.groupBy({
        by: ['category'],
        _count: { category: true },
      }),
      prisma.$queryRaw<Array<{ date: string; count: bigint }>>`
        SELECT DATE(created_at) as date, COUNT(*) as count
        FROM feedback
        WHERE created_at >= NOW() - INTERVAL '30 days'
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `,
    ]);

    return { total, byStatus, byCategory, recentTrend };
  }
}

export const feedbackRepository = new FeedbackRepository();
