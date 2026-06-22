import { userRepository } from '../repositories/user.repository';
import { activityLogRepository } from '../repositories/activityLog.repository';
import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/errorHandler';
import { Role } from '@prisma/client';
import { UserQueryDtoType } from '../types/dto';

export class UserService {
  async getAll(query: UserQueryDtoType) {
    return userRepository.findAll(query);
  }

  async promoteToAdmin(targetId: string, actorId: string) {
    const target = await userRepository.findById(targetId);
    if (!target) throw new AppError('User not found', 404);
    if (target.role === Role.ADMIN) throw new AppError('User is already an admin', 400);

    const updated = await userRepository.updateRole(targetId, Role.ADMIN);

    await activityLogRepository.create({
      actorId,
      action: 'USER_PROMOTED',
      entityType: 'profile',
      entityId: targetId,
      metadata: { email: target.email },
    });

    return updated;
  }

  async demoteFromAdmin(targetId: string, actorId: string) {
    if (targetId === actorId) throw new AppError('Cannot demote yourself', 400);
    const target = await userRepository.findById(targetId);
    if (!target) throw new AppError('User not found', 404);
    if (target.role !== Role.ADMIN) throw new AppError('User is not an admin', 400);

    const updated = await userRepository.updateRole(targetId, Role.USER);

    await activityLogRepository.create({
      actorId,
      action: 'USER_DEMOTED',
      entityType: 'profile',
      entityId: targetId,
      metadata: { email: target.email },
    });

    return updated;
  }

  async disableUser(targetId: string, actorId: string) {
    if (targetId === actorId) throw new AppError('Cannot disable your own account', 400);
    const target = await userRepository.findById(targetId);
    if (!target) throw new AppError('User not found', 404);
    if (!target.isActive) throw new AppError('User is already disabled', 400);

    // Also revoke Supabase session
    await supabaseAdmin.auth.admin.updateUserById(target.authUserId, {
      ban_duration: 'none', // We handle this ourselves
    });

    const updated = await userRepository.updateStatus(targetId, false);

    await activityLogRepository.create({
      actorId,
      action: 'USER_DISABLED',
      entityType: 'profile',
      entityId: targetId,
      metadata: { email: target.email },
    });

    return updated;
  }

  async enableUser(targetId: string, actorId: string) {
    const target = await userRepository.findById(targetId);
    if (!target) throw new AppError('User not found', 404);
    if (target.isActive) throw new AppError('User is already active', 400);

    const updated = await userRepository.updateStatus(targetId, true);

    await activityLogRepository.create({
      actorId,
      action: 'USER_ENABLED',
      entityType: 'profile',
      entityId: targetId,
      metadata: { email: target.email },
    });

    return updated;
  }

  async getStats() {
    return userRepository.getUserStats();
  }
}

export const userService = new UserService();
