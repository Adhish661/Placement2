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

// @desc    Download certificate file as PDF
// @route   GET /api/certificates/:id/download
// @access  Private
export const downloadCertificate = asyncHandler(async (req, res) => {
  const certificate = await Certificate.findById(req.params.id);

  if (!certificate) {
    res.status(404);
    throw new Error('Certificate not found');
  }

  if (certificate.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!certificate.fileUrl) {
    res.status(400);
    throw new Error('No file available for download');
  }

  try {
    // Use Cloudinary's f_pdf transformation to force PDF format
    // Insert f_pdf transformation into the Cloudinary URL
    const transformedUrl = certificate.fileUrl.replace(
      '/upload/',
      '/upload/f_pdf/'
    );
    
    const response = await fetch(transformedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const fileBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);
    
    // Always use .pdf extension for downloads
    const fileName = `${certificate.title.replace(/\s+/g, '_')}.pdf`;

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${fileName}"`
    );
    res.setHeader('Content-Length', buffer.length);

    res.send(buffer);
  } catch (error) {
    console.error('Certificate download error:', error);
    throw new Error('Failed to download certificate');
  }
});


