import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createApplication,
  getApplications,
  updateApplicationStatus,
} from '../controllers/applicationController.js';

const router = express.Router();

router.get('/', protect, getApplications);
router.post('/', protect, authorize('STUDENT'), createApplication);
router.put('/:id/status', protect, authorize('DEPT_COORDINATOR', 'ADMIN'), updateApplicationStatus);

export default router;

