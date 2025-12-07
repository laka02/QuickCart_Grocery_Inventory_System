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

const router = express.Router();

// For multiple image uploads (max 5 images)
router.post('/', upload.array('images', 5), createProduct);
router.get('/', getAllProducts);
router.get('/total-stock', getTotalStock);
router.get('/stats/inventory', getInventoryStats);
router.get('/pdf/generate', generateProductsPDF);

router.get('/:id', getProductById);
router.put('/:id', upload.array('images', 5), updateProduct);
router.delete('/:id', deleteProduct);

export default router;