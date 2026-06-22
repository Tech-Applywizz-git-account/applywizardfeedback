import { Router } from 'express';
import multer from 'multer';
import { feedbackController } from '../controllers/feedback.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { uploadLimiter } from '../middleware/rateLimiter';
import { CreateFeedbackDto, CreateCommentDto, FeedbackQueryDto } from '../types/dto';

const router = Router();

// Use memory storage for Supabase upload
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, WEBP allowed.'));
    }
  },
});

// All routes require authentication
router.use(authenticate);

router.post(
  '/',
  uploadLimiter,
  upload.array('images', 10),
  validate(CreateFeedbackDto),
  feedbackController.create.bind(feedbackController)
);

router.get(
  '/',
  validate(FeedbackQueryDto, 'query'),
  feedbackController.getAll.bind(feedbackController)
);

router.get('/:id', feedbackController.getById.bind(feedbackController));

router.delete('/:id', feedbackController.delete.bind(feedbackController));

router.post(
  '/:id/comment',
  validate(CreateCommentDto),
  feedbackController.addComment.bind(feedbackController)
);

router.get('/:id/comments', feedbackController.getComments.bind(feedbackController));

export default router;
