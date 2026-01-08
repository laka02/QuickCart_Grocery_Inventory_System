import express from 'express';
import { 
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getTotalStock,
    getInventoryStats,
    generateProductsPDF
} from '../controllers/product.controller.js';
import { upload } from '../utils/cloudinary.util.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public routes (for storefront)
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Protected routes (for inventory management - require authentication)
router.post('/', authenticate, upload.array('images', 5), createProduct);
router.put('/:id', authenticate, upload.array('images', 5), updateProduct);
router.delete('/:id', authenticate, deleteProduct);
router.get('/total-stock', authenticate, getTotalStock);
router.get('/stats/inventory', authenticate, getInventoryStats);
router.get('/pdf/generate', authenticate, generateProductsPDF);

export default router;