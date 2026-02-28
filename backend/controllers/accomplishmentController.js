// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Accomplishment from '../models/Accomplishment.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all accomplishments for user
// @route   GET /api/profile/accomplishments
// @access  Private
export const getAccomplishments = asyncHandler(async (req, res) => {
  const accomplishments = await Accomplishment.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(accomplishments);
});

// @desc    Create accomplishment
// @route   POST /api/profile/accomplishments
// @access  Private
export const createAccomplishment = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.create({
    user: req.user._id,
    ...req.body,
  });
  res.status(201).json(accomplishment);
});

// @desc    Update accomplishment
// @route   PUT /api/profile/accomplishments/:id
// @access  Private
export const updateAccomplishment = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.findById(req.params.id);

  if (!accomplishment) {
    res.status(404);
    throw new Error('Accomplishment not found');
  }

  if (accomplishment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete old file if new one is uploaded
  if (req.body.fileUrl && accomplishment.filePublicId) {
    try {
      await deleteFromCloudinary(accomplishment.filePublicId);
    } catch (error) {
      console.error('Error deleting old file:', error);
    }
  }

  Object.assign(accomplishment, req.body);
  await accomplishment.save();

  res.json(accomplishment);
});

// @desc    Delete accomplishment
// @route   DELETE /api/profile/accomplishments/:id
// @access  Private
export const deleteAccomplishment = asyncHandler(async (req, res) => {
  const accomplishment = await Accomplishment.findById(req.params.id);

  if (!accomplishment) {
    res.status(404);
    throw new Error('Accomplishment not found');
  }

  if (accomplishment.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete file from cloudinary
  if (accomplishment.filePublicId) {
    try {
      await deleteFromCloudinary(accomplishment.filePublicId);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  await accomplishment.deleteOne();
  res.json({ message: 'Accomplishment deleted' });
});

