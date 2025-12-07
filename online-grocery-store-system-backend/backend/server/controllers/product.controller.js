import Product from '../models/product.model.js';
import { upload, imageUploadUtil, cloudinary } from '../utils/cloudinary.util.js';
import PDFDocument from 'pdfkit';

// Create a new product with image upload
export const createProduct = async (req, res) => {
    try {
        console.log('Request files received:', {
            count: req.files?.length,
            files: req.files?.map(f => ({
                name: f.originalname,
                size: f.size,
                type: f.mimetype
            }))
        });

        let images = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await imageUploadUtil(file);
                    images.push({
                        public_id: result.public_id,
                        url: result.secure_url
                    });
                } catch (uploadError) {
                    console.error(`Failed to upload ${file.originalname}:`, uploadError);
                    // Continue with other files even if one fails
                }
            }
        }

        if (images.length === 0 && req.files?.length > 0) {
            throw new Error('All image uploads failed');
        }

        const product = new Product({
            ...req.body,
            images
        });

        await product.save();
        res.status(201).json(product);
    } catch (error) {
        console.error('Product creation failed:', {
            error: error.message,
            body: req.body,
            stack: error.stack
        });
        res.status(400).json({ 
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// Get all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a product (with optional image update)
export const updateProduct = async (req, res) => {
    try {
        let updateData = { ...req.body };
        
        // Handle image upload if present
        if (req.files && req.files.length > 0) {
            const images = [];
            for (const file of req.files) {
                try {
                    const result = await imageUploadUtil(file);
                    images.push({
                        public_id: result.public_id,
                        url: result.secure_url
                    });
                } catch (uploadError) {
                    console.error(`Failed to upload ${file.originalname}:`, uploadError);
                    // Continue with other files even if one fails
                }
            }
            
            // Combine existing images with new ones
            if (req.body.existingImages) {
                const existingImages = JSON.parse(req.body.existingImages);
                updateData.images = [...existingImages, ...images];
            } else {
                updateData.images = images;
            }
        } else if (req.body.existingImages) {
            // If no new images but existing images are provided
            updateData.images = JSON.parse(req.body.existingImages);
        }

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        console.error('Product update failed:', {
            error: error.message,
            body: req.body,
            stack: error.stack
        });
        res.status(400).json({ 
            success: false,
            message: error.message,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// Delete a product (and its images from Cloudinary)
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        // Delete images from Cloudinary if they exist
        if (product.images && product.images.length > 0) {
            try {
                for (const image of product.images) {
                    if (image.public_id) {
                        await cloudinary.uploader.destroy(image.public_id);
                    }
                }
            } catch (cloudinaryError) {
                console.error('Error deleting images from Cloudinary:', cloudinaryError);
                // Continue with product deletion even if image deletion fails
            }
        }

        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: error.message });
    }
};

// Get total stock sum of all products
export const getTotalStock = async (req, res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" }
                }
            }
        ]);

        const totalStock = result.length > 0 ? result[0].totalStock : 0;
        res.json({ totalStock });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get comprehensive inventory statistics
export const getInventoryStats = async (req, res) => {
    try {
        const result = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" },
                    totalProducts: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    categories: { $addToSet: "$category" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalStock: 1,
                    totalProducts: 1,
                    averagePrice: { $round: ["$averagePrice", 2] },
                    totalValue: { $round: ["$totalValue", 2] },
                    categoryCount: { $size: "$categories" }
                }
            }
        ]);

        res.json(result[0] || {
            totalStock: 0,
            totalProducts: 0,
            averagePrice: 0,
            totalValue: 0,
            categoryCount: 0
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Generate PDF for products
export const generateProductsPDF = async (req, res) => {
    try {
        const products = await Product.find();
        const stats = await Product.aggregate([
            {
                $group: {
                    _id: null,
                    totalStock: { $sum: "$stock" },
                    totalProducts: { $sum: 1 },
                    averagePrice: { $avg: "$price" },
                    totalValue: { $sum: { $multiply: ["$price", "$stock"] } },
                    categories: { $addToSet: "$category" }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalStock: 1,
                    totalProducts: 1,
                    averagePrice: { $round: ["$averagePrice", 2] },
                    totalValue: { $round: ["$totalValue", 2] },
                    categoryCount: { $size: "$categories" }
                }
            }
        ]).then(result => result[0] || {
            totalStock: 0,
            totalProducts: 0,
            averagePrice: 0,
            totalValue: 0,
            categoryCount: 0
        });

        const categoryCounts = products.reduce((acc, product) => {
            const key = product.category || 'Uncategorized';
            acc[key] = (acc[key] || 0) + 1;
            return acc;
        }, {});
        const categoryEntries = Object.entries(categoryCounts);
        const topCategory = categoryEntries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

        // Create a PDF document
        const doc = new PDFDocument({
            size: 'A4',
            margin: 50
        });
        
        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=products.pdf');
        
        // Pipe the PDF to the response
        doc.pipe(res);
        
        // Header
        doc.fontSize(26).fillColor('#2563eb').text('QuickCart Inventory Report', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(12).fillColor('#4b5563').text('Comprehensive product inventory summary with live analytics', { align: 'center' });
        doc.moveDown(1.5);
        
        doc.fontSize(10);
        const currentDate = new Date().toLocaleDateString();
        doc.fillColor('#6b7280').text(`Generated on: ${currentDate}`, { align: 'right' });
        doc.moveDown(1);

        // Summary cards
        const summaryStartY = doc.y;
        const cardWidth = 160;
        const cardHeight = 70;
        const cardGap = 15;
        const cardData = [
            { title: 'Total Products', value: stats.totalProducts, color: '#1d4ed8' },
            { title: 'Total Stock', value: stats.totalStock, color: '#059669' },
            { title: 'Inventory Value', value: `Rs. ${stats.totalValue.toLocaleString()}`, color: '#c026d3' },
            { title: 'Avg. Price', value: `Rs. ${stats.averagePrice.toFixed(2)}`, color: '#ea580c' },
        ];

        cardData.forEach((card, index) => {
            const x = 50 + (index % 2) * (cardWidth + cardGap);
            const y = summaryStartY + Math.floor(index / 2) * (cardHeight + cardGap);
            doc.save();
            doc.roundedRect(x, y, cardWidth, cardHeight, 12).fillOpacity(0.08).fill(card.color);
            doc.restore();
            doc.rect(x, y, cardWidth, cardHeight).strokeColor('#e5e7eb').stroke();
            doc.fillColor('#6b7280').fontSize(11).text(card.title, x + 12, y + 12);
            doc.fillColor(card.color).fontSize(20).text(card.value, x + 12, y + 32);
        });

        doc.moveDown(5);
        doc.fontSize(12).fillColor('#111827').text(`Categories tracked: ${stats.categoryCount}`, { continued: true }).fillColor('#6b7280').text(`   Top category: ${topCategory}`);
        doc.moveDown(1.5);

        // Category bar chart
        doc.fontSize(16).fillColor('#111827').text('Category Distribution', { align: 'left' });
        doc.moveDown(0.5);

        if (categoryEntries.length === 0) {
            doc.fillColor('#6b7280').fontSize(11).text('No category data available.', { align: 'left' });
        } else {
            const chartLeft = 60;
            const chartTop = doc.y + 10;
            const chartHeight = 150;
            const barWidth = 25;
            const barSpacing = 20;
            const maxValue = Math.max(...categoryEntries.map(([, value]) => value));
            const palette = ['#3b82f6', '#22c55e', '#f97316', '#a855f7', '#0ea5e9', '#f973a1'];

            categoryEntries.forEach(([category, value], idx) => {
                const scaledHeight = maxValue === 0 ? 0 : (value / maxValue) * chartHeight;
                const x = chartLeft + idx * (barWidth + barSpacing);
                const y = chartTop + chartHeight - scaledHeight;
                const color = palette[idx % palette.length];

                doc.save();
                doc.rect(x, y, barWidth, scaledHeight).fill(color);
                doc.restore();
                doc.fillColor('#374151').fontSize(8).text(value.toString(), x, y - 12, { width: barWidth, align: 'center' });
                doc.fillColor('#4b5563').fontSize(9).text(category, x - 10, chartTop + chartHeight + 6, { width: barWidth + 20, align: 'center' });
            });

            doc.moveDown(8);
        }

        doc.moveDown(1);
        const sectionTitleY = doc.y;
        doc
            .fillColor('#111827')
            .fontSize(16)
            .text('Product Details', 50, sectionTitleY, { width: 512, align: 'left' });
        doc.moveDown(0.6);

        const tableTop = doc.y;
        const tableLeft = 50;
        const columnWidths = {
            name: 120,
            price: 80,
            stock: 60,
            category: 100,
            supplier: 120
        };
        const totalWidth = Object.values(columnWidths).reduce((a, b) => a + b, 0);
        const minRowHeight = 30;
        
        const headerTitles = ['Name', 'Price', 'Stock', 'Category', 'Supplier'];
        const headerKeys = Object.keys(columnWidths);
        const headerHeights = headerTitles.map((title, i) =>
            doc.heightOfString(title, { width: columnWidths[headerKeys[i]] - 10 })
        );
        const headerRowHeight = Math.max(...headerHeights) + 20;

        const drawHeader = (startY) => {
            doc.fontSize(12);
            doc.fillColor('#eff6ff');
            doc.rect(tableLeft, startY, totalWidth, headerRowHeight).fill();
            doc.fillColor('#1f2937');

            let currentX = tableLeft;
            headerTitles.forEach((title, i) => {
                doc.text(title, currentX + 5, startY + 10, { width: columnWidths[headerKeys[i]] - 10 });
                currentX += columnWidths[headerKeys[i]];
            });

            doc.strokeColor('#bfdbfe');
            doc.lineWidth(1).rect(tableLeft, startY, totalWidth, headerRowHeight).stroke();

            return startY + headerRowHeight;
        };

        let footerY;
        if (products.length === 0) {
            // No table rows; place message and footer just below current content
            const messageY = tableTop + 10;
            doc.fontSize(12).fillColor('#6b7280').text('No products available to display.', tableLeft, messageY);
            footerY = messageY + 40;
        } else {
            let y = drawHeader(tableTop);
            products.forEach((product, index) => {
                const cellValues = [
                    product.name || '-',
                    `Rs. ${product.price?.toFixed(2) || '-'}`,
                    product.stock?.toString() || '-',
                    product.category || '-',
                    product.supplier || '-'
                ];
                const cellHeights = cellValues.map((val, i) =>
                    doc.heightOfString(val, { width: columnWidths[headerKeys[i]] - 10 })
                );
                let rowHeight = Math.max(...cellHeights) + 20;

                if (y + rowHeight > doc.page.height - 80) {
                    doc.addPage();
                    y = drawHeader(50);
                }

                doc.fillColor(index % 2 === 0 ? '#ffffff' : '#f9fafb');
                doc.rect(tableLeft, y, totalWidth, rowHeight).fill();
                doc.fillColor('#111827');
                doc.strokeColor('#e5e7eb');
                doc.rect(tableLeft, y, totalWidth, rowHeight).stroke();
                let currentX = tableLeft;
                cellValues.forEach((val, i) => {
                    doc.fontSize(10).text(val, currentX + 5, y + 10, { width: columnWidths[headerKeys[i]] - 10 });
                    currentX += columnWidths[headerKeys[i]];
                });
                y += rowHeight;
                footerY = y;
            });
        }
        
        doc.fontSize(10).fillColor('#6b7280');
        doc.text(`© ${new Date().getFullYear()} QuickCart Grocery Store - Inventory Management System`, 50, (footerY || doc.y) + 20, { align: 'center' });
        doc.text(`Report generated on ${currentDate}`, 50, (footerY || doc.y) + 35, { align: 'center' });
        
        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).json({ message: error.message });
    }
};