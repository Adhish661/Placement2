import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
} from '../controllers/certificateController.js';
import { upload, ensureCloudinaryConfig } from '../utils/cloudinary.js';
import cloudinary from '../utils/cloudinary.js';

const router = express.Router();

router.get('/', protect, getCertificates);
router.post('/', protect, upload.single('file'), async (req, res) => {
  try {
    console.log('Certificate upload request received');
    console.log('Request body:', req.body);
    console.log('File received:', req.file ? 'Yes' : 'No');
    
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    if (!req.body.title) {
      return res.status(400).json({ message: 'Title is required' });
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
        folder: 'placement-portal/certificates',
      });
    } catch (cloudinaryError) {
      console.error('Cloudinary upload error:', cloudinaryError);
      return res.status(500).json({ 
        message: `File upload failed: ${cloudinaryError.message || 'Cloudinary error'}` 
      });
    }

    const Certificate = await import('../models/Certificate.js').then(m => m.default);
    let newCertificate;
    try {
      newCertificate = await Certificate.create({
        title: req.body.title,
        description: req.body.description || '',
        type: req.body.type || 'Certificate',
        issuedBy: req.body.issuedBy || '',
        issuedDate: req.body.issuedDate || undefined,
        fileUrl: result.secure_url,
        filePublicId: result.public_id,
        user: req.user._id,
      });
    } catch (dbError) {
      console.error('Database error creating certificate:', dbError);
      // Try to delete the uploaded file from Cloudinary if database save fails
      try {
        await cloudinary.uploader.destroy(result.public_id);
      } catch (deleteError) {
        console.error('Error deleting uploaded file:', deleteError);
      }
      return res.status(500).json({ 
        message: `Failed to save certificate: ${dbError.message || 'Database error'}` 
      });
    }

    res.status(201).json(newCertificate);
  } catch (error) {
    console.error('Certificate upload error:', error);
    const errorMessage = error.message || 'File upload failed';
    res.status(500).json({ message: errorMessage });
  }
});
router.put('/:id', protect, updateCertificate);
router.delete('/:id', protect, deleteCertificate);

export default router;

