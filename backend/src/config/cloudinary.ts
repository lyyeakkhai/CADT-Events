import { v2 as cloudinary } from "cloudinary";
import { env } from "./env";

// Support both CLOUDINARY_URL (preferred, e.g. cloudinary://key:secret@cloudname)
// and individual vars.
if (env.CLOUDINARY_URL) {
  cloudinary.config({
    secure: true,
  });
  // The SDK auto-picks up CLOUDINARY_URL when present
} else if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn('[cloudinary] No Cloudinary credentials found. Image uploads will fail.');
}

export default cloudinary;
