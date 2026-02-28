// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Drive from '../models/Drive.js';
import Notification from '../models/Notification.js';
import { sendDriveAssignment } from '../utils/emailService.js';
import User from '../models/User.js';

// @desc    Create drive (Admin only)
// @route   POST /api/drives
// @access  Private/Admin
export const createDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.create({
    ...req.body,
    createdBy: req.user._id,
  });
  res.status(201).json(drive);
});

// @desc    Get all drives
// @route   GET /api/drives
// @access  Private
export const getDrives = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'STUDENT') {
    // Students see drives shared with them by their coordinator
    const userProfile = await import('../models/Profile.js').then(m => m.default);
    const profile = await userProfile.findOne({ user: req.user._id });
    const department = profile?.education?.current?.department;
    
    query = {
      status: 'Active',
      $or: [
        { 'sharedWith.student': req.user._id },
        { 'assignedTo.department': department },
      ],
    };
  } else if (req.user.role === 'DEPT_COORDINATOR') {
    // Coordinators see drives for their department
    query = {
      $or: [
        { department: req.user.department },
        { 'assignedTo.department': req.user.department },
        { 'assignedTo.coordinator': req.user._id },
      ],
      status: { $in: ['Active', 'Draft', 'Closed'] },
    };
  } else if (req.user.role === 'ADMIN') {
    // Admin sees all drives
    query = {};
  }

  const drives = await Drive.find(query)
    .populate('createdBy', 'name email')
    .populate('assignedTo.coordinator', 'name email department')
    .populate('sharedWith.student', 'name email')
    .sort({ createdAt: -1 });

  res.json(drives);
});

// @desc    Get single drive
// @route   GET /api/drives/:id
// @access  Private
export const getDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id)
    .populate('createdBy', 'name email')
    .populate('assignedTo.coordinator', 'name email department')
    .populate('sharedWith.student', 'name email');

  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  res.json(drive);
});

// @desc    Update drive
// @route   PUT /api/drives/:id
// @access  Private/Admin
export const updateDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);

  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  if (drive.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized');
  }

  Object.assign(drive, req.body);
  await drive.save();

  res.json(drive);
});

// @desc    Assign drive to coordinator
// @route   POST /api/drives/:id/assign
// @access  Private/Admin
export const assignDrive = asyncHandler(async (req, res) => {
  const { coordinatorId, department } = req.body;

  const drive = await Drive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  const coordinator = await User.findById(coordinatorId);
  if (!coordinator || coordinator.role !== 'DEPT_COORDINATOR') {
    res.status(400);
    throw new Error('Invalid coordinator');
  }

  // Check if already assigned
  const alreadyAssigned = drive.assignedTo.some(
    (a) => a.coordinator.toString() === coordinatorId
  );

  if (!alreadyAssigned) {
    drive.assignedTo.push({
      coordinator: coordinatorId,
      department: department || coordinator.department,
    });

    await drive.save();

    // Create notification
    await Notification.create({
      user: coordinatorId,
      title: 'New Drive Assigned',
      message: `A new drive for ${drive.companyName} - ${drive.jobRole} has been assigned to you.`,
      type: 'drive',
      link: `/drives/${drive._id}`,
    });

    // Send email
    try {
      await sendDriveAssignment(coordinator.email, coordinator.name, {
        companyName: drive.companyName,
        jobRole: drive.jobRole,
        location: drive.location,
      });
    } catch (error) {
      console.error('Email error:', error);
    }
  }

  res.json(drive);
});

// @desc    Delete drive
// @route   DELETE /api/drives/:id
// @access  Private/Admin
export const deleteDrive = asyncHandler(async (req, res) => {
  const drive = await Drive.findById(req.params.id);

  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  if (drive.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized');
  }

  await drive.deleteOne();
  res.json({ message: 'Drive deleted' });
});

// @desc    Share drive with students based on criteria
// @route   POST /api/drives/:id/share
// @access  Private/Coordinator
export const shareDrive = asyncHandler(async (req, res) => {
  const { shareCriteria, studentIds } = req.body;

  const drive = await Drive.findById(req.params.id);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  // Check if coordinator has access to this drive
  const hasAccess = drive.assignedTo.some(
    (a) => a.coordinator.toString() === req.user._id.toString()
  ) || drive.department === req.user.department;

  if (!hasAccess && req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized to share this drive');
  }

  const Profile = await import('../models/Profile.js').then(m => m.default);
  const User = await import('../models/User.js').then(m => m.default);

  let studentsToShare = [];

  if (studentIds && studentIds.length > 0) {
    // Share with specific students
    studentsToShare = await User.find({
      _id: { $in: studentIds },
      role: 'STUDENT',
    });
  } else if (shareCriteria) {
    // Share based on criteria
    const criteriaQuery = { role: 'STUDENT' };
    
    // Get all students matching criteria
    const allStudents = await User.find(criteriaQuery);
    const studentProfiles = await Profile.find({
      user: { $in: allStudents.map(s => s._id) },
    }).populate('user');

    // Filter students based on criteria
    studentsToShare = studentProfiles
      .filter(profile => {
        const edu = profile.education?.current;
        if (!edu) return false;

        // Check CGPA
        if (shareCriteria.minCGPA && (!edu.cgpa || edu.cgpa < shareCriteria.minCGPA)) {
          return false;
        }
        if (shareCriteria.maxCGPA && (!edu.cgpa || edu.cgpa > shareCriteria.maxCGPA)) {
          return false;
        }

        // Check branch
        if (shareCriteria.branches && shareCriteria.branches.length > 0) {
          if (!shareCriteria.branches.includes(edu.branch)) {
            return false;
          }
        }

        // Check program
        if (shareCriteria.programs && shareCriteria.programs.length > 0) {
          if (!shareCriteria.programs.includes(edu.program)) {
            return false;
          }
        }

        // Check passout year
        if (shareCriteria.passoutYears && shareCriteria.passoutYears.length > 0) {
          if (!shareCriteria.passoutYears.includes(edu.passoutBatch)) {
            return false;
          }
        }

        // Check skills
        if (shareCriteria.requiredSkills && shareCriteria.requiredSkills.length > 0) {
          const studentSkills = profile.skills?.technical || [];
          const hasAllSkills = shareCriteria.requiredSkills.every(skill =>
            studentSkills.some(s => s.toLowerCase().includes(skill.toLowerCase()))
          );
          if (!hasAllSkills) {
            return false;
          }
        }

        return true;
      })
      .map(profile => profile.user);
  }

  // Add students to sharedWith array
  const newSharedStudents = studentsToShare
    .filter(student => {
      return !drive.sharedWith.some(
        (s) => s.student.toString() === student._id.toString()
      );
    })
    .map(student => ({
      student: student._id,
    }));

  drive.sharedWith.push(...newSharedStudents);
  drive.shareCriteria = shareCriteria || drive.shareCriteria;
  await drive.save();

  // Create notifications for shared students
  for (const student of studentsToShare) {
    await Notification.create({
      user: student._id,
      title: 'New Drive Shared',
      message: `A new drive for ${drive.companyName} - ${drive.jobRole} has been shared with you.`,
      type: 'drive',
      link: `/drives/${drive._id}`,
    });
  }

  res.json({
    drive,
    sharedCount: newSharedStudents.length,
  });
});

