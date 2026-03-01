import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getProfile,
  updateBasicDetails,
  updateEducation,
  updateSkills,
} from '../controllers/profileController.js';
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import {
  getAccomplishments,
  createAccomplishment,
  updateAccomplishment,
  deleteAccomplishment,
} from '../controllers/accomplishmentController.js';
import {
  getExperiences,
  createExperience,
  updateExperience,
  deleteExperience,
} from '../controllers/experienceController.js';
import { upload, ensureCloudinaryConfig } from '../utils/cloudinary.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

// Profile routes
router.get('/', protect, getProfile);
router.put('/basic-details', protect, updateBasicDetails);
router.put('/education', protect, updateEducation);
router.put('/skills', protect, updateSkills);
router.post('/photo', protect, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check and ensure Cloudinary is configured
    try {
      ensureCloudinaryConfig();
    } catch (configError) {
      console.error('Cloudinary configuration error:', configError.message);
      return res.status(500).json({ 
        message: 'File upload service not configured. Please contact administrator.' 
      });
    }

    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    let result;
    try {
      result = await cloudinary.uploader.upload(dataURI, {
        folder: 'placement-portal/profile-photos',
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({ 
        message: `Photo upload failed: ${cloudinaryError.message || 'Cloudinary error'}` 
      });
    }

    const Profile = await import('../models/Profile.js').then(m => m.default);
    let profile = await Profile.findOne({ user: req.user._id });

    if (!profile) {
      profile = await Profile.create({ user: req.user._id });
    }

    // Delete old photo if exists
    if (profile.profilePhoto?.publicId) {
      try {
        await cloudinary.uploader.destroy(profile.profilePhoto.publicId);
      } catch (error) {
        console.error('Error deleting old photo:', error);
      }
    }

    profile.profilePhoto = {
      url: result.secure_url,
      publicId: result.public_id,
    };
    await profile.save();

    res.json(profile);
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error.message || 'Photo upload failed';
    res.status(500).json({ message: errorMessage });
  }
});

// Project routes
router.get('/projects', protect, getProjects);
router.post('/projects', protect, createProject);
router.put('/projects/:id', protect, updateProject);
router.delete('/projects/:id', protect, deleteProject);

// Accomplishment routes
router.get('/accomplishments', protect, getAccomplishments);
router.post('/accomplishments', protect, createAccomplishment);
router.put('/accomplishments/:id', protect, updateAccomplishment);
router.delete('/accomplishments/:id', protect, deleteAccomplishment);

// Experience routes
router.get('/experiences', protect, getExperiences);
router.post('/experiences', protect, createExperience);
router.put('/experiences/:id', protect, updateExperience);
router.delete('/experiences/:id', protect, deleteExperience);

// File upload route
router.post('/upload', protect, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Check and ensure Cloudinary is configured
    try {
      ensureCloudinaryConfig();
    } catch (configError) {
      console.error('Cloudinary configuration error:', configError.message);
      return res.status(500).json({ 
        message: 'File upload service not configured. Please contact administrator.' 
      });
    }

    // Convert buffer to base64
    const base64 = req.file.buffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64}`;

    // Decide resource_type based on MIME type: images as 'image', others as 'raw'
    const isImage = req.file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    // Upload to Cloudinary
    let result;
    try {
      result = await cloudinary.uploader.upload(dataURI, {
        folder: 'placement-portal',
        resource_type: resourceType,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({ 
        message: `File upload failed: ${cloudinaryError.message || 'Cloudinary error'}` 
      });
    }

    res.json({
      url: result.secure_url,
      publicId: result.public_id,
    });
  } catch (error) {
    console.error('Upload error:', error);
    const errorMessage = error.message || 'File upload failed';
    res.status(500).json({ message: errorMessage });
  }
});

export default router;

