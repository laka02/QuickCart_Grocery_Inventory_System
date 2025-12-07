import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Export cloudinary instance
export { cloudinary };

// Enhanced file upload utility
export const imageUploadUtil = async (file) => {
    try {
        // Validate file object
        if (!file || !file.buffer) {
            throw new Error('Invalid file object received');
        }

        // Convert buffer to base64
        const b64 = file.buffer.toString("base64");
        const dataURI = `data:${file.mimetype};base64,${b64}`;
        
        // Upload to Cloudinary
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto",
            folder: "products",
            quality: "auto:good" // Optimize image quality
        });
        
        return result;
    } catch (error) {
        console.error("Cloudinary upload failed:", {
            error: error.message,
            fileInfo: {
                originalname: file?.originalname,
                mimetype: file?.mimetype,
                size: file?.size
            }
        });
        throw new Error(`Image upload failed: ${error.message}`);
    }
};

// Configure Multer middleware
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
        files: 5 // Maximum 5 files
    },
    fileFilter: (req, file, cb) => {
        try {
            if (!file.mimetype.startsWith('image/')) {
                throw new Error('Only image files are allowed');
            }
            cb(null, true);
        } catch (error) {
            console.error('File filter error:', error.message);
            cb(error, false);
        }
    }
});