import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  getResources,
  createResource,
  deleteResource,
  downloadResource,
  updateResource,
} from '../controllers/resourceController.js';
import { upload, ensureCloudinaryConfig } from '../utils/cloudinary.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

router.get('/', protect, getResources);

// Upload a new resource file to Cloudinary and create the Resource document
router.post(
  '/',
  protect,
  authorize('DEPT_COORDINATOR'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Basic validation
      if (!req.body.title) {
        return res.status(400).json({ message: 'Title is required' });
      }

      // Check and ensure Cloudinary is configured
      try {
        ensureCloudinaryConfig();
      } catch (configError) {
        console.error('Cloudinary configuration error:', configError.message);
        return res.status(500).json({
          message: 'File upload service not configured. Please contact administrator.',
        });
      }

      const base64 = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64}`;

      // Decide resource_type based on MIME type: images as 'image', others as 'raw'
      const isImage = req.file.mimetype.startsWith('image/');
      const resourceType = isImage ? 'image' : 'raw';

      // Preserve original filename for nicer URLs and downloads
      const originalName = req.file.originalname || 'resource';
      const safeName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');

      let result;
      try {
        result = await cloudinary.uploader.upload(dataURI, {
          folder: 'placement-portal/resources',
          resource_type: resourceType,
          public_id: safeName,
          use_filename: true,
          unique_filename: true,
          access_mode: 'public',
        });
      } catch (cloudinaryError) {
        console.error('Cloudinary upload error:', cloudinaryError);
        return res.status(500).json({
          message: `File upload failed: ${cloudinaryError.message || 'Cloudinary error'}`,
        });
      }

      const Resource = await import('../models/Resource.js').then((m) => m.default);
      let newResource;
      try {
        newResource = await Resource.create({
          ...req.body,
          fileUrl: result.secure_url,
          filePublicId: result.public_id,
          fileMimeType: req.file.mimetype,
          fileOriginalName: originalName,
          uploadedBy: req.user._id,
          department: req.user.department || req.body.department,
        });
      } catch (dbError) {
        console.error('Database error creating resource:', dbError);
        // Best-effort cleanup of the uploaded Cloudinary asset
        try {
          await cloudinary.uploader.destroy(result.public_id);
        } catch (deleteError) {
          console.error('Error deleting uploaded resource from Cloudinary:', deleteError);
        }
        return res.status(500).json({
          message: `Failed to save resource: ${dbError.message || 'Database error'}`,
        });
      }

      res.status(201).json(newResource);
    } catch (error) {
      console.error('Resource upload error:', error);
      const errorMessage = error.message || 'File upload failed';
      res.status(500).json({ message: errorMessage });
    }
  }
);

// Stream/download a resource file through the backend
router.get('/:id/download', protect, downloadResource);

router.put('/:id', protect, authorize('DEPT_COORDINATOR', 'ADMIN'), updateResource);
router.delete('/:id', protect, authorize('DEPT_COORDINATOR', 'ADMIN'), deleteResource);

export default router;

