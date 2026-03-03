import express from 'express';
import {
  registerStudent,
  login,
  getMe,
  updatePassword,
  requestEmailOtp,
  verifyEmailOtp,
  updateEmail,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';
import { protect, protectOptional } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerStudent);
router.post('/login', login);
router.post('/request-otp', protectOptional, requestEmailOtp);
router.post('/verify-otp', verifyEmailOtp);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);
router.put('/update-email', protect, updateEmail);

export default router;

