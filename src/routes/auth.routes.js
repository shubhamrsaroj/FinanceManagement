import express from 'express';
import {
    register,
    login,
    getMe,
    logout,
    changePassword
} from '../controller/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validation.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import {
    registerSchema,
    loginSchema,
    changePasswordSchema
} from '../validators/userValidator.js';

const router = express.Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);
router.post('/change-password', authenticate, validate(changePasswordSchema), changePassword);

export default router;