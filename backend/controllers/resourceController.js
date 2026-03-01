// Async handler wrapper
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

import Resource from '../models/Resource.js';
import path from 'path';
import cloudinary from '../utils/cloudinary.js';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Private
export const getResources = asyncHandler(async (req, res) => {
  let query = {};

  if (req.user.role === 'STUDENT') {
    // Students see resources for their department or general resources
    const userProfile = await import('../models/Profile.js').then((m) => m.default);
    const profile = await userProfile.findOne({ user: req.user._id });
    const department = profile?.education?.current?.department;

    query = {
      $or: [
        { department: department },
        { department: { $exists: false } },
        { type: 'general' },
      ],
    };
  } else if (req.user.role === 'DEPT_COORDINATOR') {
    query = { department: req.user.department };
  }

  const resources = await Resource.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  res.json(resources);
});

// @desc    Create resource (metadata-only; main upload handled in route with Cloudinary)
// @route   POST /api/resources
// @access  Private/Coordinator
export const createResource = asyncHandler(async (req, res) => {
  const resource = await Resource.create({
    ...req.body,
    uploadedBy: req.user._id,
    department: req.user.department || req.body.department,
  });

  res.status(201).json(resource);
});

// @desc    Delete resource (and its Cloudinary file if present)
// @route   DELETE /api/resources/:id
// @access  Private/Coordinator
export const deleteResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  if (
    resource.uploadedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'ADMIN'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  // Best-effort delete from Cloudinary if we have a publicId
  if (resource.filePublicId) {
    try {
      const { deleteFromCloudinary } = await import('../utils/cloudinary.js');
      await deleteFromCloudinary(resource.filePublicId);
    } catch (err) {
      console.error('Error deleting resource from Cloudinary:', err);
    }
  }

  await resource.deleteOne();
  res.json({ message: 'Resource deleted' });
});

// @desc    Update resource (metadata only: title, description, type)
// @route   PUT /api/resources/:id
// @access  Private/Coordinator
export const updateResource = asyncHandler(async (req, res) => {
  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  if (
    resource.uploadedBy.toString() !== req.user._id.toString() &&
    req.user.role !== 'ADMIN'
  ) {
    res.status(403);
    throw new Error('Not authorized');
  }

  const { title, description, type, department } = req.body;
  if (title !== undefined) resource.title = title;
  if (description !== undefined) resource.description = description;
  if (type !== undefined) resource.type = type;
  if (department !== undefined && req.user.role === 'ADMIN') resource.department = department;

  await resource.save();
  res.json(resource);
});

// @desc    Download/stream resource file via backend (Cloudinary private URL)
// @route   GET /api/resources/:id/download
// @access  Private
export const downloadResource = asyncHandler(async (req, res) => {
  let responded = false;

  const resource = await Resource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Resource not found');
  }

  // Authorization similar to getResources visibility rules
  if (req.user.role === 'STUDENT') {
    const userProfile = await import('../models/Profile.js').then((m) => m.default);
    const profile = await userProfile.findOne({ user: req.user._id });
    const department = profile?.education?.current?.department;

    const canAccess =
      resource.type === 'general' ||
      !resource.department ||
      (department && resource.department === department);

    if (!canAccess) {
      res.status(403);
      throw new Error('Not authorized');
    }
  } else if (req.user.role === 'DEPT_COORDINATOR') {
    if (resource.department && resource.department !== req.user.department) {
      res.status(403);
      throw new Error('Not authorized');
    }
  }

  if (!resource.fileUrl || !resource.filePublicId) {
    res.status(400);
    throw new Error('No file available for download');
  }

  try {
    const mimeFromDb = resource.fileMimeType || 'application/octet-stream';
    const isImage = mimeFromDb.startsWith('image/');
    const resourceType = isImage ? 'image' : 'raw';

    // Prefer original uploaded filename if available
    const origName = resource.fileOriginalName || '';
    const sanitizedTitle = (resource.title || 'resource').replace(/\s+/g, '_');

    // Determine extension
    let ext = '';
    if (origName) {
      ext = path.extname(origName).replace('.', '');
    }

    if (!ext) {
      const mimeMap = {
        'application/pdf': 'pdf',
        'application/msword': 'doc',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
        'application/vnd.ms-excel': 'xls',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
        'text/plain': 'txt',
        'application/zip': 'zip',
      };
      if (mimeMap[mimeFromDb]) {
        ext = mimeMap[mimeFromDb];
      } else if (mimeFromDb.startsWith('image/')) {
        ext = mimeFromDb.split('/')[1] === 'jpeg' ? 'jpg' : mimeFromDb.split('/')[1];
      } else {
        ext = (mimeFromDb.split('/')[1] || 'bin').replace(/[^a-z0-9]/gi, '');
      }
    }

    const fileName =
      origName && origName.trim() ? origName : `${sanitizedTitle}.${ext || 'bin'}`;

    // Generate a signed private download URL from Cloudinary
    const privateUrl = cloudinary.utils.private_download_url(
      resource.filePublicId,
      '', // keep original extension
      {
        resource_type: resourceType,
        type: 'upload',
        attachment: fileName,
      }
    );

    const https = (await import('https')).default;

    https
      .get(privateUrl, (cloudRes) => {
        if (cloudRes.statusCode !== 200) {
          responded = true;
          let body = '';
          cloudRes.on('data', (chunk) => {
            body += chunk;
          });
          cloudRes.on('end', () => {
            console.error('Cloudinary resource download error body:', body);
            if (!responded) {
              res
                .status(502)
                .json({ message: `Storage returned ${cloudRes.statusCode}` });
            }
          });
          return;
        }

        res.setHeader('Content-Type', mimeFromDb);
        res.setHeader(
          'Content-Disposition',
          `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(
            fileName
          )}`
        );
        responded = true;
        cloudRes.pipe(res);
      })
      .on('error', (err) => {
        console.error('HTTPS stream error (resource):', err.message);
        if (!responded) {
          res.status(500).json({ message: 'Download failed' });
        }
      });
  } catch (error) {
    console.error('Resource download error:', error);
    if (!responded) {
      res.status(500).json({ message: 'Failed to download resource' });
    }
  }
});

