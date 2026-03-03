// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
import User from '../models/User.js';
import EmailOtp from '../models/EmailOtp.js';
import generateToken from '../utils/generateToken.js';
import { sendLoginAlert, sendRegistrationEmail, sendEmailOtp } from '../utils/emailService.js';
import { updateStudentExcel } from '../utils/excelService.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const isValidEmail = (email) => {
  if (!email) return false;
  const normalized = String(email).trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

const createOtpCode = () => String(crypto.randomInt(100000, 999999));

// @desc    Request email OTP for registration or email change
// @route   POST /api/auth/request-otp
// @access  Public (register) / Private (update email)
export const requestEmailOtp = asyncHandler(async (req, res) => {
  const { email, purpose = 'register' } = req.body;

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error('Invalid email address');
  }

  if (!['register', 'update_email'].includes(purpose)) {
    res.status(400);
    throw new Error('Invalid OTP purpose');
  }

  if (purpose === 'update_email' && !req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Avoid leaking whether an email exists for registration
  if (purpose === 'register') {
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.json({ message: 'OTP sent successfully' });
    }
  }

  await EmailOtp.deleteMany({
    email: normalizedEmail,
    purpose,
    ...(purpose === 'update_email' ? { user: req.user._id } : {}),
  });

  const otpCode = createOtpCode();
  const codeHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailOtp.create({
    email: normalizedEmail,
    purpose,
    codeHash,
    expiresAt,
    ...(purpose === 'update_email' ? { user: req.user._id } : {}),
  });

  await sendEmailOtp(normalizedEmail, otpCode, purpose);

  res.json({ message: 'OTP sent successfully' });
});

// @desc    Verify email OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyEmailOtp = asyncHandler(async (req, res) => {
  const { email, purpose = 'register', code } = req.body;

  if (!isValidEmail(email) || !code) {
    res.status(400);
    throw new Error('Email and OTP code are required');
  }

  if (!['register', 'update_email'].includes(purpose)) {
    res.status(400);
    throw new Error('Invalid OTP purpose');
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  const otpRecord = await EmailOtp.findOne({
    email: normalizedEmail,
    purpose,
  }).sort({ createdAt: -1 });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    res.status(400);
    throw new Error('OTP expired or not found');
  }

  if (otpRecord.attempts >= 5) {
    res.status(429);
    throw new Error('Too many failed attempts');
  }

  const isMatch = await bcrypt.compare(String(code), otpRecord.codeHash);
  otpRecord.attempts += 1;
  if (!isMatch) {
    await otpRecord.save();
    res.status(400);
    throw new Error('Invalid OTP');
  }

  otpRecord.verifiedAt = new Date();
  await otpRecord.save();

  const payload = {
    email: normalizedEmail,
    purpose,
    userId: otpRecord.user ? otpRecord.user.toString() : undefined,
  };
  const verificationToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '10m',
  });

  res.json({ message: 'OTP verified', verificationToken });
});

// @desc    Update user email after OTP verification
// @route   PUT /api/auth/update-email
// @access  Private
export const updateEmail = asyncHandler(async (req, res) => {
  const { newEmail, verificationToken } = req.body;

  if (!isValidEmail(newEmail) || !verificationToken) {
    res.status(400);
    throw new Error('New email and verification token are required');
  }

  let decoded;
  try {
    decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
  } catch {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  if (decoded.purpose !== 'update_email' || decoded.email !== newEmail.toLowerCase()) {
    res.status(400);
    throw new Error('Verification token does not match the email');
  }

  if (decoded.userId && decoded.userId !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized to update this email');
  }

  const existing = await User.findOne({ email: newEmail.toLowerCase() });
  if (existing) {
    res.status(400);
    throw new Error('Email already in use');
  }

  const user = await User.findById(req.user._id);
  user.email = newEmail.toLowerCase();
  await user.save();

  res.json({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
    token: generateToken(user._id),
  });
});

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerStudent = asyncHandler(async (req, res) => {
  const { name, email, password, verificationToken } = req.body;

  if (!verificationToken) {
    res.status(400);
    throw new Error('Email verification is required');
  }

  if (!name || !/^[A-Za-z\s.]+$/.test(String(name).trim())) {
    res.status(400);
    throw new Error('Name must contain alphabets and spaces only');
  }

  if (!password || password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  let decoded;
  try {
    decoded = jwt.verify(verificationToken, process.env.JWT_SECRET);
  } catch {
    res.status(400);
    throw new Error('Invalid or expired verification token');
  }

  if (decoded.purpose !== 'register' || decoded.email !== String(email).trim().toLowerCase()) {
    res.status(400);
    throw new Error('Email verification does not match');
  }

  // Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: 'STUDENT',
  });

  if (user) {
    // Update Excel sheet
    try {
      await updateStudentExcel();
    } catch (error) {
      console.error('Excel update error:', error);
    }

    try {
      await sendRegistrationEmail(user.email, user.name);
    } catch (error) {
      console.error('Registration email error:', error);
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(403);
      throw new Error('Account is deactivated. Please contact administrator.');
    }

    // Send login alert email
    try {
      await sendLoginAlert(user.email, user.name);
    } catch (error) {
      console.error('Email error:', error);
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token: generateToken(user._id),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
});

// @desc    Update password
// @route   PUT /api/auth/update-password
// @access  Private
export const updatePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!newPassword || newPassword.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters long');
  }

  const user = await User.findById(req.user._id);

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword;
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    throw new Error('Current password is incorrect');
  }
});

// @desc    Request password reset OTP
// @route   POST /api/auth/request-password-reset
// @access  Public
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!isValidEmail(email)) {
    res.status(400);
    throw new Error('Invalid email address');
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Check if user exists with this email
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // Don't leak whether email exists
    return res.json({ message: 'If email exists, password reset OTP has been sent' });
  }

  // Delete any existing forgot_password OTP for this email
  await EmailOtp.deleteMany({
    email: normalizedEmail,
    purpose: 'forgot_password',
  });

  const otpCode = createOtpCode();
  const codeHash = await bcrypt.hash(otpCode, 10);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailOtp.create({
    email: normalizedEmail,
    purpose: 'forgot_password',
    codeHash,
    expiresAt,
  });

  await sendEmailOtp(normalizedEmail, otpCode, 'forgot_password');

  res.json({ message: 'Password reset OTP sent successfully' });
});

// @desc    Reset password using OTP
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = asyncHandler(async (req, res) => {
  const { email, code, newPassword } = req.body;

  if (!isValidEmail(email) || !code || !newPassword) {
    res.status(400);
    throw new Error('Email, OTP code, and new password are required');
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  // Verify OTP
  const otpRecord = await EmailOtp.findOne({
    email: normalizedEmail,
    purpose: 'forgot_password',
  }).sort({ createdAt: -1 });

  if (!otpRecord || otpRecord.expiresAt < new Date()) {
    res.status(400);
    throw new Error('OTP expired or not found');
  }

  if (otpRecord.attempts >= 5) {
    res.status(429);
    throw new Error('Too many failed attempts');
  }

  const isMatch = await bcrypt.compare(String(code), otpRecord.codeHash);
  otpRecord.attempts += 1;
  
  if (!isMatch) {
    await otpRecord.save();
    res.status(400);
    throw new Error('Invalid OTP');
  }

  // Find and update user password
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    res.status(400);
    throw new Error('User not found');
  }

  user.password = newPassword;
  await user.save();

  // Mark OTP as verified and delete it
  await EmailOtp.deleteOne({ _id: otpRecord._id });

  res.json({ message: 'Password reset successfully. Please login with your new password.' });
});

