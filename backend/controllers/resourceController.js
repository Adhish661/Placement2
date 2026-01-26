// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Resource from '../models/Resource.js';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'STUDENT') {
    // Students see resources for their department or general resources
    const userProfile = await import('../models/Profile.js').then(m => m.default);
    const profile = await userProfile.findOne({ user: req.user._id });
    const department = profile?.education?.current?.department;
    
    query = {
      $or: [
        { department: department },
        { department: { $exists: false } },
        { type: 'general' },
      ],
    };
  } else if (req.user.role === 'DEPT_COORDINATOR') {
    query = { department: req.user.department };
  }

  const resources = await Resource.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(resources);
});

// @desc    Create resource
// @route   POST /api/resources
// @access  Private/Coordinator
export const createResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create({
    ...req.body,
    uploadedBy: req.user._id,
    department: req.user.department || req.body.department,
  });

  res.status(201).json(resource);
});

// @desc    Delete resource
// @route   DELETE /api/resources/:id
// @access  Private/Coordinator
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  if (resource.uploadedBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await resource.deleteOne();
  res.json({ message: 'Resource deleted' });
});

