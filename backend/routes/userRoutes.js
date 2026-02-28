import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { getUsers, getUser } from '../controllers/userController.js';

const router = express.Router();

// Allow both ADMIN and DEPT_COORDINATOR to access users endpoint
router.get('/', protect, authorize('ADMIN', 'DEPT_COORDINATOR'), getUsers);
router.get('/:id', protect, getUser);

export default router;

