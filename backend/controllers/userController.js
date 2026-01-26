// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import User from '../models/User.js';
import Profile from '../models/Profile.js';

// @desc    Get all users (Admin sees all, Coordinators see students in their department)
// @route   GET /api/users
// @access  Private/Admin/Coordinator
export const getUsers = asyncHandler(async (req, res) => {
  let users;
  
  if (req.user.role === 'ADMIN') {
    // Admin sees all users
    users = await User.find().select('-password').sort({ createdAt: -1 });
  } else if (req.user.role === 'DEPT_COORDINATOR') {
    // Coordinators see only students in their department
    // First get all students
    const allStudents = await User.find({ role: 'STUDENT' }).select('-password').sort({ createdAt: -1 });
    
    // Get profiles for all students and filter by department
    const coordinatorDepartment = req.user.department;
    const studentsWithProfiles = await Promise.all(
      allStudents.map(async (user) => {
        const profile = await Profile.findOne({ user: user._id });
        return { user, profile };
      })
    );
    
    // Filter students whose branch/department matches coordinator's department
    const filteredStudents = studentsWithProfiles
      .filter(({ user, profile }) => {
        if (!profile) return false;
        const studentBranch = profile.education?.current?.branch;
        const studentDepartment = profile.education?.current?.department;
        const branchMatch = studentBranch && 
          (studentBranch === coordinatorDepartment || 
           studentBranch.toLowerCase() === coordinatorDepartment.toLowerCase());
        const deptMatch = studentDepartment && 
          (studentDepartment === coordinatorDepartment || 
           studentDepartment.toLowerCase() === coordinatorDepartment.toLowerCase());
        return branchMatch || deptMatch;
      })
      .map(({ user }) => user);
    
    users = filteredStudents;
  } else {
    return res.status(403).json({ 
      message: `User role '${req.user.role}' is not authorized to access this route` 
    });
  }
  
  res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private
export const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  res.json(user);
});

