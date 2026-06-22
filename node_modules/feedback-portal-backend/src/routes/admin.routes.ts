import { Router } from 'express';
import { adminController } from '../controllers/admin.controller';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';
import { validate } from '../middleware/validate';
import { UserQueryDto, FeedbackQueryDto, UpdateFeedbackStatusDto } from '../types/dto';

const router = Router();

// All admin routes require auth + admin role
router.use(authenticate, requireAdmin);

// Stats
router.get('/stats', adminController.getStats.bind(adminController));

// Users
router.get('/users', validate(UserQueryDto, 'query'), adminController.getUsers.bind(adminController));
router.put('/users/:id/promote', adminController.promoteUser.bind(adminController));
router.put('/users/:id/demote', adminController.demoteUser.bind(adminController));
router.put('/users/:id/disable', adminController.disableUser.bind(adminController));
router.put('/users/:id/enable', adminController.enableUser.bind(adminController));

// Feedback
router.get('/feedback', validate(FeedbackQueryDto, 'query'), adminController.getFeedback.bind(adminController));
router.put(
  '/feedback/:id/status',
  validate(UpdateFeedbackStatusDto),
  adminController.updateFeedbackStatus.bind(adminController)
);

export default router;
