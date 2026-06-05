import Product from '../models/product.model.js';
import StockHistory from '../models/stockHistory.model.js';
import User from '../models/user.model.js';

// Helper function to log stock changes
export const logStockChange = async (productId, previousStock, newStock, reason, reasonDescription, userId) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return;

        let performedByName = 'System';
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                performedByName = user.email;
            }
        }

        const changeAmount = newStock - previousStock;

        await StockHistory.create({
            product: productId,
            productName: product.name,
            previousStock,
            newStock,
            changeAmount,
            reason,
            reasonDescription: reasonDescription || '',
            performedBy: userId || null,
            performedByName
        });
    } catch (error) {
        console.error('Error logging stock change:', error);
        // Don't throw - stock logging shouldn't break the main operation
    }
};

// Adjust stock manually with reason
export const adjustStock = async (req, res) => {
    try {
        const { productId, adjustment, reason, reasonDescription } = req.body;
        const userId = req.userId;

        console.log('Stock adjustment request:', { productId, adjustment, reason, userId });

        if (!productId || adjustment === undefined || adjustment === null) {
            return res.status(400).json({
                success: false,
                message: 'Product ID and adjustment amount are required'
            });
        }

        // Convert adjustment to number
        const adjustmentNum = parseInt(adjustment, 10);
        if (isNaN(adjustmentNum)) {
            return res.status(400).json({
                success: false,
                message: 'Adjustment must be a valid number'
            });
        }

        if (!reason) {
            return res.status(400).json({
                success: false,
                message: 'Reason is required for stock adjustment'
            });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const previousStock = product.stock;
        const newStock = Math.max(0, previousStock + adjustmentNum);

        product.stock = newStock;
        await product.save();

        // Log the stock change
        await logStockChange(
            productId,
            previousStock,
            newStock,
            reason,
            reasonDescription || '',
            userId
        );

        res.json({
            success: true,
            message: 'Stock adjusted successfully',
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    previousStock,
                    newStock,
                    changeAmount: adjustmentNum
                }
            }
        });
    } catch (error) {
        console.error('Error adjusting stock:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Internal server error while adjusting stock'
        });
    }
};

// Get stock history for a product
export const getStockHistory = async (req, res) => {
    try {
        const { productId } = req.params;
        const { page = 1, limit = 50 } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const history = await StockHistory.find({ product: productId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('performedBy', 'email role')
            .lean();

        const total = await StockHistory.countDocuments({ product: productId });

        res.json({
            success: true,
            data: {
                product: {
                    _id: product._id,
                    name: product.name,
                    currentStock: product.stock,
                    reorderPoint: product.reorderPoint
                },
                history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching stock history:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get all stock history (with filters)
export const getAllStockHistory = async (req, res) => {
    try {
        const { page = 1, limit = 50, productId, reason, startDate, endDate } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const query = {};
        if (productId) query.product = productId;
        if (reason) query.reason = reason;

        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        const history = await StockHistory.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('product', 'name category')
            .populate('performedBy', 'email role')
            .lean();

        const total = await StockHistory.countDocuments(query);

        res.json({
            success: true,
            data: {
                history,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        console.error('Error fetching all stock history:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Get low stock alerts
export const getLowStockAlerts = async (req, res) => {
    try {
        const { threshold } = req.query;
        
        let lowStockProducts;
        
        if (threshold) {
            // If threshold is provided, use it
            lowStockProducts = await Product.find({ stock: { $lte: parseInt(threshold) } })
                .select('name stock reorderPoint category supplier price _id')
                .sort({ stock: 1 })
                .lean();
        } else {
            // Otherwise, get all products and filter by reorderPoint
            const allProducts = await Product.find()
                .select('name stock reorderPoint category supplier price _id')
                .lean();
            
            lowStockProducts = allProducts.filter(p => {
                const reorderPoint = p.reorderPoint || 10;
                return p.stock <= reorderPoint;
            }).sort((a, b) => a.stock - b.stock);
        }

        const criticalStock = lowStockProducts.filter(p => p.stock === 0);
        const lowStock = lowStockProducts.filter(p => p.stock > 0);

        res.json({
            success: true,
            data: {
                total: lowStockProducts.length,
                critical: criticalStock.length,
                low: lowStock.length,
                products: lowStockProducts,
                criticalProducts: criticalStock,
                lowStockProducts: lowStock
            }
        });
    } catch (error) {
        console.error('Error fetching low stock alerts:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// Bulk stock adjustment (for multiple products)
export const bulkAdjustStock = async (req, res) => {
    try {
        const { adjustments } = req.body; // Array of { productId, adjustment, reason, reasonDescription }
        const userId = req.userId;

        if (!Array.isArray(adjustments) || adjustments.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Adjustments array is required'
            });
        }

        const results = [];
        const errors = [];

        for (const adj of adjustments) {
            try {
                const { productId, adjustment, reason, reasonDescription } = adj;

                if (!productId || adjustment === undefined || !reason) {
                    errors.push({
                        productId: productId || 'unknown',
                        error: 'Missing required fields'
                    });
                    continue;
                }

                const product = await Product.findById(productId);
                if (!product) {
                    errors.push({
                        productId,
                        error: 'Product not found'
                    });
                    continue;
                }

                const previousStock = product.stock;
                const newStock = Math.max(0, previousStock + adjustment);

                product.stock = newStock;
                await product.save();

                await logStockChange(
                    productId,
                    previousStock,
                    newStock,
                    reason,
                    reasonDescription,
                    userId
                );

                results.push({
                    productId,
                    productName: product.name,
                    previousStock,
                    newStock,
                    adjustment
                });
            } catch (error) {
                errors.push({
                    productId: adj.productId || 'unknown',
                    error: error.message
                });
            }
        }

        res.json({
            success: true,
            message: `Processed ${results.length} adjustments${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
            data: {
                successful: results,
                errors: errors.length > 0 ? errors : undefined
            }
        });
    } catch (error) {
        console.error('Error in bulk stock adjustment:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
