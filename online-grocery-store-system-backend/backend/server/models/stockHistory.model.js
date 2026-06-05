import mongoose from 'mongoose';

const stockHistorySchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    previousStock: {
        type: Number,
        required: true,
        min: 0
    },
    newStock: {
        type: Number,
        required: true,
        min: 0
    },
    changeAmount: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        enum: [
            'product_created',
            'product_updated',
            'stock_adjusted',
            'order_placed',
            'order_cancelled',
            'damaged',
            'returned',
            'found',
            'expired',
            'other'
        ]
    },
    reasonDescription: {
        type: String,
        trim: true
    },
    performedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    performedByName: {
        type: String
    }
}, {
    timestamps: true
});

// Index for faster queries
stockHistorySchema.index({ product: 1, createdAt: -1 });
stockHistorySchema.index({ createdAt: -1 });

const StockHistory = mongoose.model('StockHistory', stockHistorySchema);

export default StockHistory;
