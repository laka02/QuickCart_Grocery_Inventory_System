import Supplier from '../models/supplier.model.js';
import Product from '../models/product.model.js';
import express from 'express';
import PDFDocument from 'pdfkit';

const router = express.Router();

// Create new supplier
export const createSupplier = async (req, res) => {
    try {
        const supplier = new Supplier(req.body);
        await supplier.save();
        res.status(201).json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get all suppliers
export const getAllSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('productsSupplied', 'name price');
        res.json(suppliers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get single supplier
export const getSupplierById = async (req, res) => {
    try {
        const supplier = await Supplier.findById(req.params.id)
            .populate('productsSupplied', 'name price stock');
        
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update supplier
export const updateSupplier = async (req, res) => {
    try {
        const supplier = await Supplier.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }
        res.json(supplier);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Generate purchase order (for low stock items)
export const generatePurchaseOrder = async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const supplier = await Supplier.findById(req.params.id);
        
        if (!supplier) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Check if supplier provides this product
        if (!supplier.productsSupplied.includes(productId)) {
            return res.status(400).json({ message: 'This supplier does not provide the requested product' });
        }

        const purchaseOrder = await supplier.generatePurchaseOrder(productId, quantity);
        
        // In a real app, you would save the PO to database here
        // await PurchaseOrder.create(purchaseOrder);
        
        res.json({
            message: 'Purchase order generated successfully',
            purchaseOrder,
            supplierEmail: supplier.email
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// In supplier.controller.js
export const deleteSupplier = async (req, res) => {
    try {
        console.log('Deleting supplier ID:', req.params.id); // Debug log
        const deletedSupplier = await Supplier.findByIdAndDelete(req.params.id);
        
        if (!deletedSupplier) {
            console.log('Supplier not found'); // Debug log
            return res.status(404).json({ message: 'Supplier not found' });
        }
        
        console.log('Successfully deleted:', deletedSupplier); // Debug log
        res.json({ message: 'Supplier deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error); // Debug log
        res.status(500).json({ 
            message: 'Error deleting supplier',
            error: error.message 
        });
    }
};

// Generate PDF for suppliers
export const generateSuppliersPDF = async (req, res) => {
    try {
        const suppliers = await Supplier.find().populate('productsSupplied', 'name');
        
        // Create a PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=suppliers.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Add title
        doc.fontSize(20).text('Suppliers List', { align: 'center' });
        doc.moveDown(2);
        
        // Add date
        doc.fontSize(10).text(`Generated on: ${new Date().toLocaleDateString()}`, { align: 'right' });
        doc.moveDown(2);
        
        // Table settings
        const tableTop = 150;
        const tableLeft = 50;
        const columnWidth = 100;
        const rowHeight = 30;
        
        // Draw table headers with background
        doc.fontSize(12);
        doc.fillColor('#f3f4f6'); // Light gray background
        
        // Header row
        doc.rect(tableLeft, tableTop, columnWidth * 4, rowHeight).fill();
        doc.fillColor('#000000'); // Reset text color
        
        // Draw header text
        doc.text('Name', tableLeft + 5, tableTop + 10);
        doc.text('Email', tableLeft + columnWidth + 5, tableTop + 10);
        doc.text('Phone', tableLeft + columnWidth * 2 + 5, tableTop + 10);
        doc.text('Status', tableLeft + columnWidth * 3 + 5, tableTop + 10);
        
        // Draw header borders
        doc.strokeColor('#000000');
        doc.lineWidth(1);
        doc.rect(tableLeft, tableTop, columnWidth * 4, rowHeight).stroke();
        
        // Add table rows
        let y = tableTop + rowHeight;
        suppliers.forEach((supplier, index) => {
            if (y > 700) { // Start new page if near bottom
                doc.addPage();
                y = 50;
            }
            
            // Draw row background
            doc.fillColor(index % 2 === 0 ? '#ffffff' : '#f9fafb');
            doc.rect(tableLeft, y, columnWidth * 4, rowHeight).fill();
            doc.fillColor('#000000'); // Reset text color
            
            // Draw cell borders
            doc.strokeColor('#e5e7eb');
            doc.rect(tableLeft, y, columnWidth * 4, rowHeight).stroke();
            
            // Draw cell content
            doc.fontSize(10);
            doc.text(supplier.name || '-', tableLeft + 5, y + 10, { width: columnWidth - 10 });
            doc.text(supplier.email || '-', tableLeft + columnWidth + 5, y + 10, { width: columnWidth - 10 });
            doc.text(supplier.phone || '-', tableLeft + columnWidth * 2 + 5, y + 10, { width: columnWidth - 10 });
            doc.text(supplier.isActive ? 'Active' : 'Inactive', tableLeft + columnWidth * 3 + 5, y + 10, { width: columnWidth - 10 });
            
            y += rowHeight;
        });
        
        // Add footer
        doc.fontSize(10);
        doc.text(`Total Suppliers: ${suppliers.length}`, 50, y + 20);
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: error.message });
    }
};

export default router;