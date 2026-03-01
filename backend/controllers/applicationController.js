// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Application from '../models/Application.js';
import Drive from '../models/Drive.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { sendApplicationSubmitted, sendNewApplicationToCoordinator } from '../utils/emailService.js';

// @desc    Apply to drive
// @route   POST /api/applications
// @access  Private/Student
export const createApplication = asyncHandler(async (req, res) => {
  const { driveId, documents } = req.body;

  const drive = await Drive.findById(driveId);
  if (!drive) {
    res.status(404);
    throw new Error('Drive not found');
  }

  if (drive.status !== 'Active') {
    res.status(400);
    throw new Error('Drive is not active');
  }

  // Check if already applied
  const existingApplication = await Application.findOne({
    student: req.user._id,
    drive: driveId,
  });

  if (existingApplication) {
    res.status(400);
    throw new Error('Already applied to this drive');
  }

  const application = await Application.create({
    student: req.user._id,
    drive: driveId,
    documents: documents || [],
  });

  // Create notification for student
  await Notification.create({
    user: req.user._id,
    title: 'Application Submitted',
    message: `Your application for ${drive.companyName} - ${drive.jobRole} has been submitted successfully.`,
    type: 'application',
    link: `/applications/${application._id}`,
  });

  try {
    const studentUser = await User.findById(req.user._id).select('name email');
    if (studentUser?.email) {
      await sendApplicationSubmitted(studentUser.email, studentUser.name, drive.companyName, drive.jobRole);
    }
  } catch (error) {
    console.error('Application email error:', error);
  }

  // Notify coordinators (notification + email)
  const coordinators = drive.assignedTo.map((a) => a.coordinator);
  for (const coordinatorId of coordinators) {
    await Notification.create({
      user: coordinatorId,
      title: 'New Application',
      message: `${req.user.name} has applied for ${drive.companyName} - ${drive.jobRole}.`,
      type: 'application',
      link: `/applications/${application._id}`,
    });

    try {
      const coordUser = await User.findById(coordinatorId).select('name email');
      if (coordUser?.email) {
        await sendNewApplicationToCoordinator(
          coordUser.email,
          coordUser.name,
          req.user.name,
          drive.companyName,
          drive.jobRole
        );
      }
    } catch (error) {
      console.error('Coordinator application email error:', error);
    }
  }

  res.status(201).json(application);
});

// @desc    Get applications
// @route   GET /api/applications
// @access  Private
export const getApplications = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'STUDENT') {
    query = { student: req.user._id };
  } else if (req.user.role === 'DEPT_COORDINATOR') {
    // Get drives assigned to this coordinator
    const drives = await Drive.find({
      'assignedTo.coordinator': req.user._id,
    });
    query = { drive: { $in: drives.map((d) => d._id) } };
  } else if (req.user.role === 'ADMIN') {
    // Admin sees all
    query = {};
  }

  const applications = await Application.find(query)
    .populate('student', 'name email')
    .populate({
      path: 'drive',
      populate: { path: 'createdBy', select: 'name email' },
    })
    .sort({ createdAt: -1 });

  res.json(applications);
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Coordinator or Admin
export const updateApplicationStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const application = await Application.findById(req.params.id).populate('drive');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check authorization
  if (req.user.role === 'DEPT_COORDINATOR') {
    const isAssigned = application.drive.assignedTo.some(
      (a) => a.coordinator.toString() === req.user._id.toString()
    );
    if (!isAssigned) {
      res.status(403);
      throw new Error('Not authorized');
    }
  } else if (req.user.role !== 'ADMIN') {
    res.status(403);
    throw new Error('Not authorized');
  }

  application.status = status;
  application.updatedAt = new Date();
  await application.save();

  // Create notification
  await Notification.create({
    user: application.student,
    title: 'Application Status Updated',
    message: `Your application for ${application.drive.companyName} - ${application.drive.jobRole} status has been updated to ${status}.`,
    type: 'application',
    link: `/applications/${application._id}`,
  });

  res.json(application);
});


// @desc    Download application document as PDF
// @route   GET /api/applications/:id/documents/:docIndex/download
// @access  Private
export const downloadApplicationDocument = asyncHandler(async (req, res) => {
  const { id, docIndex } = req.params;
  
  const application = await Application.findById(id).populate('student');

  if (!application) {
    res.status(404);
    throw new Error('Application not found');
  }

  // Check authorization
  if (application.student._id.toString() !== req.user._id.toString() && req.user.role === 'STUDENT') {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!application.documents || !application.documents[docIndex]) {
    res.status(404);
    throw new Error('Document not found');
  }

  const document = application.documents[docIndex];

  if (!document.url) {
    res.status(400);
    throw new Error('No file available for download');
  }

  try {
    // Use Cloudinary's f_pdf transformation to force PDF format
    // Insert f_pdf transformation into the Cloudinary URL
    const transformedUrl = document.url.replace(
      '/upload/',
      '/upload/f_pdf/'
    );
    
    const response = await fetch(transformedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    // Get document type and create appropriate filename
    const docType = (document.type || 'document').replace(/\s+/g, '_');
    const fileName = `${docType}_${new Date().getTime()}.pdf`;

    // Set response headers for PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Application document download error:', error);
    throw new Error('Failed to download document');
  }
});


