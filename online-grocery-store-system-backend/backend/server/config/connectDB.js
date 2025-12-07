import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Configure Cloudinary with credentials from environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage (doesn't save files to disk)
const storage = new multer.memoryStorage();

// Function to upload image to Cloudinary
export const imageUploadUtil = async (file) => {
    try {
        // Convert buffer to base64 string for Cloudinary upload
        const b64 = Buffer.from(file.buffer).toString("base64");
        let dataURI = "data:" + file.mimetype + ";base64," + b64;
        
        const result = await cloudinary.uploader.upload(dataURI, {
            resource_type: "auto",
            folder: "products" // Organize images in a 'products' folder
        });
        return result;
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        throw error;
    }
};

// Function to delete image from Cloudinary
export const imageDeleteUtil = async (public_id) => {
    try {
        await cloudinary.uploader.destroy(public_id);
    } catch (error) {
        console.error("Cloudinary delete error:", error);
        throw error;
    }
};

// Configure multer middleware
export const upload = multer({ 
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit per file
        files: 5 // Maximum of 5 files
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    }
});

// Export Cloudinary instance for direct use if needed
export { cloudinary };