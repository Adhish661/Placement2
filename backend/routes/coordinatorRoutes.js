import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createCoordinator,
  getCoordinators,
  updateCoordinatorStatus,
  resetCoordinatorPassword,
  deleteCoordinator,
} from '../controllers/coordinatorController.js';

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getCoordinators);
router.post('/', protect, authorize('ADMIN'), createCoordinator);
router.put('/:id/status', protect, authorize('ADMIN'), updateCoordinatorStatus);
router.put('/:id/reset-password', protect, authorize('ADMIN'), resetCoordinatorPassword);
router.delete('/:id', protect, authorize('ADMIN'), deleteCoordinator);

export default router;

