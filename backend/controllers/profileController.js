// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Profile from '../models/Profile.js';
import { updateStudentExcel } from '../utils/excelService.js';

// @desc    Get or create user profile
// @route   GET /api/profile
// @access  Private
export const getProfile = asyncHandler(async (req, res) => {
  // Support userId query parameter for coordinators/admins to view other users' profiles
  let userId = req.user._id;
  
  if (req.query.userId && (req.user.role === 'DEPT_COORDINATOR' || req.user.role === 'ADMIN')) {
    userId = req.query.userId;
  }
  
  let profile = await Profile.findOne({ user: userId });

  if (!profile) {
    // Only create profile if it's the authenticated user's own profile
    if (userId.toString() === req.user._id.toString()) {
      profile = await Profile.create({ user: userId });
    } else {
      return res.status(404).json({ message: 'Profile not found' });
    }
  }

  res.json(profile);
});

// @desc    Update basic details
// @route   PUT /api/profile/basic-details
// @access  Private
export const updateBasicDetails = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
  }

  // Ensure profileCompletion is initialized
  if (!profile.profileCompletion) {
    profile.profileCompletion = {
      basicDetails: false,
      education: false,
      skills: false,
      overall: 0,
    };
  }

  // Ensure basicDetails is initialized
  if (!profile.basicDetails) {
    profile.basicDetails = {};
  }

  profile.basicDetails = {
    ...profile.basicDetails,
    ...req.body,
  };

  profile.profileCompletion.basicDetails = true;
  
  // Mark nested objects as modified for Mongoose
  profile.markModified('basicDetails');
  profile.markModified('profileCompletion');
  
  await profile.save();

  // Update Excel
  try {
    await updateStudentExcel();
  } catch (error) {
    console.error('Excel update error:', error);
  }

  res.json(profile);
});

// @desc    Update education details
// @route   PUT /api/profile/education
// @access  Private
export const updateEducation = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
  }

  // Ensure profileCompletion is initialized
  if (!profile.profileCompletion) {
    profile.profileCompletion = {
      basicDetails: false,
      education: false,
      skills: false,
      overall: 0,
    };
  }

  // Ensure education is initialized
  if (!profile.education) {
    profile.education = {};
  }

  profile.education = {
    ...profile.education,
    ...req.body,
  };

  profile.profileCompletion.education = true;
  
  // Mark nested objects as modified for Mongoose
  profile.markModified('education');
  profile.markModified('profileCompletion');
  
  await profile.save();

  // Update Excel
  try {
    await updateStudentExcel();
  } catch (error) {
    console.error('Excel update error:', error);
  }

  res.json(profile);
});

// @desc    Update skills
// @route   PUT /api/profile/skills
// @access  Private
export const updateSkills = asyncHandler(async (req, res) => {
  let profile = await Profile.findOne({ user: req.user._id });

  if (!profile) {
    profile = await Profile.create({ user: req.user._id });
  }

  // Ensure profileCompletion is initialized
  if (!profile.profileCompletion) {
    profile.profileCompletion = {
      basicDetails: false,
      education: false,
      skills: false,
      overall: 0,
    };
  }

  profile.skills = {
    technical: req.body.technical || [],
    languages: req.body.languages || [],
  };

  profile.profileCompletion.skills = true;
  
  // Calculate overall completion
  const completions = [
    profile.profileCompletion.basicDetails,
    profile.profileCompletion.education,
    profile.profileCompletion.skills,
  ];
  profile.profileCompletion.overall = Math.round((completions.filter(Boolean).length / completions.length) * 100);

  // Mark nested objects as modified for Mongoose
  profile.markModified('skills');
  profile.markModified('profileCompletion');

  await profile.save();

  // Update Excel
  try {
    await updateStudentExcel();
  } catch (error) {
    console.error('Excel update error:', error);
  }

  res.json(profile);
});

