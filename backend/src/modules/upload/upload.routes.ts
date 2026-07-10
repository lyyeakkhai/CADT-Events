import { Router } from "express";
import multer from "multer";
import cloudinary from "@/config/cloudinary";

const router = Router();

// Use memory storage to avoid saving files temporarily on disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"), async (req, res, next) => {
  console.log('[Backend Upload] Request received. Has file:', !!req.file);
  try {
    if (!req.file) {
      console.warn('[Backend Upload] No file in request');
      res.status(400).json({ error: "No image file provided" });
      return;
    }

    console.log('[Backend Upload] File received:', req.file.originalname, req.file.mimetype, req.file.size);

    // Convert buffer to base64 string
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = "data:" + req.file.mimetype + ";base64," + b64;

    console.log('[Backend Upload] Uploading to Cloudinary...');

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: "events", // You can change this to any folder name in your cloudinary account
      resource_type: "auto",
    });

    console.log('[Backend Upload] Success, url:', result.secure_url);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("[Backend Upload] Error:", error);
    res.status(500).json({ error: "Failed to upload image" });
  }
});

export const uploadRoutes = router;
