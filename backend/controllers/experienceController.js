// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Experience from '../models/Experience.js';
import { deleteFromCloudinary } from '../utils/cloudinary.js';

// @desc    Get all experiences for user
// @route   GET /api/profile/experiences
// @access  Private
export const getExperiences = asyncHandler(async (req, res) => {
  const experiences = await Experience.find({ user: req.user._id }).sort({ startDate: -1 });
  res.json(experiences);
});

// @desc    Create experience
// @route   POST /api/profile/experiences
// @access  Private
export const createExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.create({
    user: req.user._id,
    ...req.body,
  });
  res.status(201).json(experience);
});

// @desc    Update experience
// @route   PUT /api/profile/experiences/:id
// @access  Private
export const updateExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    res.status(404);
    throw new Error('Experience not found');
  }

  if (experience.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete old file if new one is uploaded
  if (req.body.proofUrl && experience.proofPublicId) {
    try {
      await deleteFromCloudinary(experience.proofPublicId);
    } catch (error) {
      console.error('Error deleting old file:', error);
    }
  }

  Object.assign(experience, req.body);
  await experience.save();

  res.json(experience);
});

// @desc    Delete experience
// @route   DELETE /api/profile/experiences/:id
// @access  Private
export const deleteExperience = asyncHandler(async (req, res) => {
  const experience = await Experience.findById(req.params.id);

  if (!experience) {
    res.status(404);
    throw new Error('Experience not found');
  }

  if (experience.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete file from cloudinary
  if (experience.proofPublicId) {
    try {
      await deleteFromCloudinary(experience.proofPublicId);
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  await experience.deleteOne();
  res.json({ message: 'Experience deleted' });
});

