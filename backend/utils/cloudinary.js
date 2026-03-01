import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

// Ensure .env variables are loaded BEFORE reading Cloudinary creds.
// This is important because this file is imported from route files,
// which are evaluated before `dotenv.config()` in `server.js`.
dotenv.config();

// Check if Cloudinary credentials are configured
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

// Function to check if Cloudinary is configured
export const isCloudinaryConfigured = () => {
  return !!(cloudName && apiKey && apiSecret);
};

// Function to ensure Cloudinary is configured
export const ensureCloudinaryConfig = () => {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file');
  }
  
  // Configure if not already configured
  if (!cloudinary.config().cloud_name) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }
};

if (!cloudName || !apiKey || !apiSecret) {
  console.warn('⚠️  WARNING: Cloudinary credentials not configured!');
  console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file');
  console.warn('   File uploads will fail until credentials are configured.');
} else {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log('✅ Cloudinary configured');
}

// Memory storage for multer
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

export const uploadToCloudinary = async (filePath, folder = 'placement-portal') => {
  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Cloudinary credentials not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env file');
  }
  
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: folder,
    });
    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw error;
  }
};

export const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    throw error;
  }
};

export default cloudinary;

