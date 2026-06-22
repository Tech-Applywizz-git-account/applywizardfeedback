import { prisma } from '../config/prisma';
import { Role } from '@prisma/client';
import { UserQueryDtoType } from '../types/dto';

export class UserRepository {
  async findAll(query: UserQueryDtoType) {
    const { page, limit, search, role, isActive } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (role !== undefined) where.role = role;
    if (isActive !== undefined) where.isActive = isActive;

    const [total, items] = await Promise.all([
      prisma.profile.count({ where }),
      prisma.profile.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { feedback: true } },
        },
      }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findById(id: string) {
    return prisma.profile.findUnique({ where: { id } });
  }

  async findByAuthUserId(authUserId: string) {
    return prisma.profile.findUnique({ where: { authUserId } });
  }

  async findByEmail(email: string) {
    return prisma.profile.findUnique({ where: { email } });
  }

  async create(data: { authUserId: string; email: string; username: string }) {
    return prisma.profile.create({ data });
  }

  async updateRole(id: string, role: Role) {
    return prisma.profile.update({ where: { id }, data: { role } });
  }

  async updateStatus(id: string, isActive: boolean) {
    return prisma.profile.update({ where: { id }, data: { isActive } });
  }

  async getTotalCount() {
    return prisma.profile.count();
  }

  async getUserStats() {
    const [total, admins, active] = await Promise.all([
      prisma.profile.count(),
      prisma.profile.count({ where: { role: Role.ADMIN } }),
      prisma.profile.count({ where: { isActive: true } }),
    ]);
    return { total, admins, active, inactive: total - active };
  }
}

export const userRepository = new UserRepository();
