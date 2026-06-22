import { prisma } from '../config/prisma';

interface CreateLogParams {
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
}

export class ActivityLogRepository {
  async create(params: CreateLogParams) {
    return prisma.activityLog.create({
      data: params,
      include: {
        actor: { select: { username: true, role: true } },
      },
    });
  }

  async findByEntityId(entityId: string) {
    return prisma.activityLog.findMany({
      where: { entityId },
      include: {
        actor: { select: { username: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;
    const [total, items] = await Promise.all([
      prisma.activityLog.count(),
      prisma.activityLog.findMany({
        skip,
        take: limit,
        include: {
          actor: { select: { username: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { items, total, page, limit };
  }
}

export const activityLogRepository = new ActivityLogRepository();
