// Async handler wrapper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

import Certificate from '../models/Certificate.js';

// @desc    Get all certificates for a user
// @route   GET /api/certificates
// @access  Private
export const getCertificates = asyncHandler(async (req, res) => {
  const certificates = await Certificate.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(certificates);
});

// @desc    Create certificate
// @route   POST /api/certificates
// @access  Private
export const createCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.create({
    ...req.body,
    user: req.user._id,
  });
  res.status(201).json(certificate);
});

// @desc    Update certificate
// @route   PUT /api/certificates/:id
// @access  Private
export const updateCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  if (certificate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  Object.assign(certificate, req.body);
  await certificate.save();

  res.json(certificate);
});

// @desc    Delete certificate
// @route   DELETE /api/certificates/:id
// @access  Private
export const deleteCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  if (certificate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Delete from cloudinary if publicId exists
  if (certificate.filePublicId) {
    try {
      const { deleteFromCloudinary } = await import('../utils/cloudinary.js');
      await deleteFromCloudinary(certificate.filePublicId);
    } catch (error) {
      console.error('Error deleting from cloudinary:', error);
    }
  }

  await certificate.deleteOne();
  res.json({ message: 'Certificate deleted' });
});

