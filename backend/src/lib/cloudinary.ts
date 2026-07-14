import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with standard environment variables
// It will automatically use CLOUDINARY_URL if it exists in the env
cloudinary.config({
  secure: true,
});

/**
 * Cloudinary storage configuration for Multer
 */
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'cadt-events', // Default folder name in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
  } as any,
});

/**
 * Multer upload middleware configured with Cloudinary storage
 */
export const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

export { cloudinary };
