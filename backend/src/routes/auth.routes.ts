import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/authenticate';
import { validate } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimiter';
import { SignUpDto, LoginDto, ForgotPasswordDto, ResetPasswordDto } from '../types/dto';

const router = Router();

router.post('/signup', authLimiter, validate(SignUpDto), authController.signUp.bind(authController));
router.post('/login', authLimiter, validate(LoginDto), authController.login.bind(authController));
router.post('/logout', authenticate, authController.logout.bind(authController));
router.post('/forgot-password', authLimiter, validate(ForgotPasswordDto), authController.forgotPassword.bind(authController));
router.post('/reset-password', validate(ResetPasswordDto), authController.resetPassword.bind(authController));
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
