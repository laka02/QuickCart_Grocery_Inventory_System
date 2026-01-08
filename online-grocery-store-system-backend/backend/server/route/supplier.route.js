import express from 'express';
import {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    generatePurchaseOrder,
    generateSuppliersPDF
} from '../controllers/supplier.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// Protected supplier routes (require authentication for inventory management)
router.post('/', authenticate, createSupplier);
router.get('/', authenticate, getAllSuppliers);
router.get('/:id', authenticate, getSupplierById);
router.put('/:id', authenticate, updateSupplier);

// Purchase order route
router.post('/:id/purchase-order', authenticate, generatePurchaseOrder);

// PDF generation route
router.get('/pdf/generate', authenticate, generateSuppliersPDF);

export default router;