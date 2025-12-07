import express from 'express';
import {
    createSupplier,
    getAllSuppliers,
    getSupplierById,
    updateSupplier,
    generatePurchaseOrder,
    generateSuppliersPDF
} from '../controllers/supplier.controller.js';

const router = express.Router();

// Supplier CRUD routes
router.post('/', createSupplier);
router.get('/', getAllSuppliers);
router.get('/:id', getSupplierById);
router.put('/:id', updateSupplier);

// Purchase order route
router.post('/:id/purchase-order', generatePurchaseOrder);

// PDF generation route
router.get('/pdf/generate', generateSuppliersPDF);

export default router;