// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import User from '../models/User.js';
import { sendCoordinatorCredentials } from '../utils/emailService.js';
import crypto from 'crypto';

// @desc    Create department coordinator
// @route   POST /api/coordinators
// @access  Private/Admin
export const createCoordinator = asyncHandler(async (req, res) => {
  const { name, email, department, password } = req.body;

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Generate password if not provided
  const generatedPassword = password || crypto.randomBytes(8).toString('hex');

  const coordinator = await User.create({
    name,
    email,
    password: generatedPassword,
    role: 'DEPT_COORDINATOR',
    department,
    createdBy: req.user._id,
  });

  // Send credentials email
  try {
    await sendCoordinatorCredentials(email, name, generatedPassword, department);
  } catch (error) {
    console.error('Email error:', error);
  }

  res.status(201).json({
    _id: coordinator._id,
    name: coordinator.name,
    email: coordinator.email,
    department: coordinator.department,
    isActive: coordinator.isActive,
  });
});

// @desc    Get all coordinators
// @route   GET /api/coordinators
// @access  Private/Admin
export const getCoordinators = asyncHandler(async (req, res) => {
  const coordinators = await User.find({ role: 'DEPT_COORDINATOR' })
    .select('-password')
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(coordinators);
});

// @desc    Update coordinator status
// @route   PUT /api/coordinators/:id/status
// @access  Private/Admin
export const updateCoordinatorStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  const coordinator = await User.findById(req.params.id);

  if (!coordinator || coordinator.role !== 'DEPT_COORDINATOR') {
    res.status(404);
    throw new Error('Coordinator not found');
  }

  coordinator.isActive = isActive;
  await coordinator.save();

  res.json(coordinator);
});

// @desc    Reset coordinator password
// @route   PUT /api/coordinators/:id/reset-password
// @access  Private/Admin
export const resetCoordinatorPassword = asyncHandler(async (req, res) => {
  const coordinator = await User.findById(req.params.id);

  if (!coordinator || coordinator.role !== 'DEPT_COORDINATOR') {
    res.status(404);
    throw new Error('Coordinator not found');
  }

  const newPassword = crypto.randomBytes(8).toString('hex');
  coordinator.password = newPassword;
  await coordinator.save();

  // Send email with new password
  try {
    await sendCoordinatorCredentials(
      coordinator.email,
      coordinator.name,
      newPassword,
      coordinator.department
    );
  } catch (error) {
    console.error('Email error:', error);
  }

  res.json({ message: 'Password reset successfully. New password sent to email.' });
});

// @desc    Delete coordinator
// @route   DELETE /api/coordinators/:id
// @access  Private/Admin
export const deleteCoordinator = asyncHandler(async (req, res) => {
  const coordinator = await User.findById(req.params.id);

  if (!coordinator || coordinator.role !== 'DEPT_COORDINATOR') {
    res.status(404);
    throw new Error('Coordinator not found');
  }

  await coordinator.deleteOne();
  res.json({ message: 'Coordinator deleted successfully' });
});

