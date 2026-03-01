import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { generateResume } from '../controllers/resumeController.js';

const router = express.Router();

router.get('/generate', protect, authorize('STUDENT'), generateResume);

export default router;

