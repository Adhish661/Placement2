import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  createDrive,
  getDrives,
  getDrive,
  updateDrive,
  assignDrive,
  deleteDrive,
  shareDrive,
} from '../controllers/driveController.js';

const router = express.Router();

router.get('/', protect, getDrives);
router.get('/:id', protect, getDrive);
router.post('/', protect, authorize('ADMIN'), createDrive);
router.put('/:id', protect, authorize('ADMIN'), updateDrive);
router.post('/:id/assign', protect, authorize('ADMIN'), assignDrive);
router.post('/:id/share', protect, authorize('DEPT_COORDINATOR', 'ADMIN'), shareDrive);
router.delete('/:id', protect, authorize('ADMIN'), deleteDrive);

export default router;

