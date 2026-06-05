import express from 'express';
import {
    adjustStock,
    getStockHistory,
    getAllStockHistory,
    getLowStockAlerts,
    bulkAdjustStock
} from '../controllers/stock.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();

// All stock routes require authentication
router.post('/adjust', authenticate, adjustStock);
router.post('/adjust/bulk', authenticate, bulkAdjustStock);
router.get('/history/:productId', authenticate, getStockHistory);
router.get('/history', authenticate, getAllStockHistory);
router.get('/alerts/low-stock', authenticate, getLowStockAlerts);

export default router;
