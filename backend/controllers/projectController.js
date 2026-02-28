// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Project from '../models/Project.js';

// @desc    Get all projects for user
// @route   GET /api/profile/projects
// @access  Private
export const getProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(projects);
});

// @desc    Create project
// @route   POST /api/profile/projects
// @access  Private
export const createProject = asyncHandler(async (req, res) => {
  const project = await Project.create({
    user: req.user._id,
    ...req.body,
  });
  res.status(201).json(project);
});

// @desc    Update project
// @route   PUT /api/profile/projects/:id
// @access  Private
export const updateProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  Object.assign(project, req.body);
  await project.save();

  res.json(project);
});

// @desc    Delete project
// @route   DELETE /api/profile/projects/:id
// @access  Private
export const deleteProject = asyncHandler(async (req, res) => {
  const project = await Project.findById(req.params.id);

  if (!project) {
    res.status(404);
    throw new Error('Project not found');
  }

  if (project.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  await project.deleteOne();
  res.json({ message: 'Project deleted' });
});

