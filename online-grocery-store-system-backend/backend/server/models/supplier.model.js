import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'is invalid']
    },
    phone: {
        type: String,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country: String,
        postalCode: String
    },
    productsSupplied: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Add method to generate purchase order
supplierSchema.methods.generatePurchaseOrder = async function(productId, quantity) {
    const po = {
        supplier: this._id,
        product: productId,
        quantity,
        orderDate: new Date(),
        status: 'pending'
    };
    // In a real app, you would save this to a PurchaseOrder collection
    console.log(`Purchase Order Generated for ${this.name}:`, po);
    return po;
};

export default mongoose.model('Supplier', supplierSchema);