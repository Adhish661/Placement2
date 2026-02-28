import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getResources,
  createResource,
  deleteResource,
} from '../controllers/resourceController.js';
import { upload, ensureCloudinaryConfig } from '../utils/cloudinary.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

router.get('/', protect, getResources);
router.post('/', protect, authorize('DEPT_COORDINATOR'), upload.single('file'), async (req, res) => {
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

    // Decide resource_type based on MIME type: images as 'image', others as 'raw'
    const isImage = req.file.mimetype.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    let result;
    try {
      result = await cloudinary.uploader.upload(dataURI, {
        folder: 'placement-portal/resources',
        resource_type: resourceType,
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({ 
        message: `File upload failed: ${cloudinaryError.message || 'Cloudinary error'}` 
      });
    }

    const Resource = await import('../models/Resource.js').then(m => m.default);
    const newResource = await Resource.create({
      ...req.body,
      fileUrl: result.secure_url,
      filePublicId: result.public_id,
      fileMimeType: req.file.mimetype,
      uploadedBy: req.user._id,
      department: req.user.department || req.body.department,
    });

    res.status(201).json(newResource);
  } catch (error) {
    console.error('Resource upload error:', error);
    const errorMessage = error.message || 'File upload failed';
    res.status(500).json({ message: errorMessage });
  }
});
router.delete('/:id', protect, authorize('DEPT_COORDINATOR', 'ADMIN'), deleteResource);

export default router;

