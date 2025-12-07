import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import logo from '../images/logo.png';

const ProductTable = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        stock: '',
        supplier: '',
        images: []
    });
    const [selectedImages, setSelectedImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [stats, setStats] = useState({
        totalStock: 0,
        totalProducts: 0,
        averagePrice: 0,
        totalValue: 0,
        categoryCount: 0
    });
    const [isPrinting, setIsPrinting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [allCategories, setAllCategories] = useState([]);
    const [sortBy, setSortBy] = useState('');
    const [sortOrder, setSortOrder] = useState('asc');

    const componentRef = useRef();
    const currentDate = new Date().toLocaleDateString();

    useEffect(() => {
        fetchProducts();
        fetchInventoryStats();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products');
            setProducts(response.data);
            setLoading(false);
            const categories = Array.from(new Set(response.data.map(p => p.category)));
            setAllCategories(categories);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const fetchInventoryStats = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products/stats/inventory');
            setStats(response.data);
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files) {
            const filesArray = Array.from(e.target.files).map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));
            
            setSelectedImages(prev => [...prev, ...filesArray]);
            setImagePreviews(prev => [...prev, ...filesArray.map(file => file.preview)]);
        }
    };

    const removeImage = (index) => {
        const newImages = [...selectedImages];
        URL.revokeObjectURL(newImages[index].preview);
        newImages.splice(index, 1);
        setSelectedImages(newImages);
        setImagePreviews(newImages.map(file => file.preview));
    };

    const removeExistingImage = (productId, publicId) => {
        if (window.confirm('Are you sure you want to delete this image?')) {
            axios.delete(`http://localhost:3000/api/products/${productId}/images`, { 
                data: { public_id: publicId } 
            })
            .then(() => {
                fetchProducts();
                setEditFormData(prev => ({
                    ...prev,
                    images: prev.images.filter(img => img.public_id !== publicId)
                }));
            })
            .catch(err => console.error('Error deleting image:', err));
        }
    };

    const printStyles = `
        @page {
            size: A4 landscape;
            margin: 15mm;
        }
        @media print {
            html, body {
                height: initial !important;
                overflow: initial !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            body {
                background: white !important;
                padding: 0 !important;
                margin: 0 !important;
            }
            .no-print, .action-buttons {
                display: none !important;
            }
            table {
                width: 100% !important;
                border-collapse: collapse !important;
                font-size: 11px !important;
            }
            th, td {
                border: 1px solid #2563eb !important;
                padding: 8px !important;
                text-align: left !important;
            }
            th {
                background-color: #2563eb !important;
                color: #fff !important;
                font-weight: bold !important;
            }
            tr:nth-child(even) {
                background-color: #e0e7ff !important;
            }
            .stats-container, .stats-grid, .stats-item {
                background: #e0e7ff !important;
                border: 1px solid #2563eb !important;
                border-radius: 8px !important;
                color: #1e293b !important;
            }
            .stats-title {
                color: #2563eb !important;
            }
            .stats-value {
                color: #1e40af !important;
            }
            .product-image {
                width: 50px !important;
                height: 50px !important;
                object-fit: cover !important;
                margin-right: 5px !important;
            }
            .report-header {
                display: flex !important;
                align-items: center !important;
                margin-bottom: 24px !important;
                border-bottom: 2px solid #2563eb !important;
                padding-bottom: 12px !important;
            }
            .report-header img {
                border: 2px solid #2563eb !important;
                background: #fff !important;
                border-radius: 50% !important;
                margin-right: 16px !important;
                height: 48px !important;
                width: 48px !important;
            }
            .report-header h1 {
                color: #2563eb !important;
                font-size: 2rem !important;
                margin-bottom: 0 !important;
            }
            .report-header p {
                color: #333 !important;
                font-size: 1rem !important;
            }
        }
    `;

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onBeforeGetContent: () => {
            return new Promise((resolve) => {
                setIsPrinting(true);
                setTimeout(resolve, 500);
            });
        },
        onAfterPrint: () => {
            setIsPrinting(false);
        },
        pageStyle: printStyles,
        documentTitle: `Inventory_Report_${new Date().toISOString().split('T')[0]}`,
    });

    const handlePrintWithDelay = () => {
        setTimeout(() => {
            if (componentRef.current) {
                handlePrint();
            } else {
                alert("Error preparing the report. Please try again.");
                setIsPrinting(false);
            }
        }, 1000);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                const response = await axios.delete(`http://localhost:3000/api/products/${id}`);
                if (response.status === 200) {
                    alert('Product deleted successfully!');
                    fetchProducts();
                    fetchInventoryStats();
                }
            } catch (err) {
                console.error('Error deleting product:', err);
                alert(`Failed to delete product: ${err.response?.data?.message || err.message}`);
            }
        }
    };

    const handleEditClick = (product) => {
        setEditingId(product._id);
        setEditFormData({
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category,
            stock: product.stock,
            supplier: product.supplier,
            images: product.images || []
        });
        setImagePreviews(product.images?.map(img => img.url) || []);
        setSelectedImages([]);
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData({
            ...editFormData,
            [name]: value
        });
    };

    const handleUpdate = async (id) => {
        try {
            const formData = new FormData();
            
            // Append text fields
            Object.keys(editFormData).forEach(key => {
                if (key !== 'images') {
                    formData.append(key, editFormData[key]);
                }
            });
            
            // Append existing images
            if (editFormData.images && editFormData.images.length > 0) {
                formData.append('existingImages', JSON.stringify(editFormData.images));
            }
            
            // Append new images
            selectedImages.forEach(image => {
                formData.append('images', image.file);
            });
            
            const response = await axios.put(`http://localhost:3000/api/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            
            console.log('Update response:', response.data);
            
            setEditingId(null);
            setSelectedImages([]);
            setImagePreviews([]);
            fetchProducts();
            fetchInventoryStats();
        } catch (err) {
            console.error('Error updating product:', err);
            alert('Failed to update product. Please try again.');
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setSelectedImages([]);
        setImagePreviews([]);
    };

    // Filtered products
    const filteredProducts = products.filter(product => {
        const matchesSearch =
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.supplier.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter ? product.category === categoryFilter : true;
        return matchesSearch && matchesCategory;
    });

    // Sorted products
    const sortedProducts = [...filteredProducts];
    if (sortBy) {
        sortedProducts.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];
            if (sortBy === 'createdAt') {
                valA = new Date(valA);
                valB = new Date(valB);
            } else {
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();
            }
            if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const handleGeneratePDF = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/products/pdf/generate', {
                responseType: 'blob'
            });
            
            // Create a blob from the PDF data
            const blob = new Blob([response.data], { type: 'application/pdf' });
            
            // Create a URL for the blob
            const url = window.URL.createObjectURL(blob);
            
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            link.download = 'products.pdf';
            
            // Append link to body, click it, and remove it
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Clean up the URL
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-gray-600">Loading products...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
            <div className="bg-red-50 border-l-4 border-red-500 p-4 max-w-md">
                <p className="text-red-700 font-medium">Error: {error}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 gap-4">
                    <h1 className="text-3xl font-bold text-blue-900">Product Inventory</h1>
                    <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
                        <input
                            type="text"
                            placeholder="Search by name, description, or supplier..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Categories</option>
                            {allCategories.map((cat, idx) => (
                                <option key={idx} value={cat}>{cat}</option>
                            ))}
                        </select>
                        <select
                            value={sortBy}
                            onChange={e => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Sort By</option>
                            <option value="name">Name</option>
                            <option value="price">Price</option>
                            <option value="stock">Stock</option>
                            <option value="createdAt">Added Date</option>
                        </select>
                        <button
                            onClick={handleGeneratePDF}
                            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Generate Report
                        </button>
                    </div>
                </div>
                
                {/* Printable Content */}
                <div ref={componentRef} className="bg-white p-6 rounded-xl shadow-lg">
                    {/* Official Report Header with Logo */}
                    <div className="report-header mb-6">
                        <img src={logo} alt="QuickCart Logo" className="h-12 w-12 mr-4 rounded-full bg-white p-1 border border-blue-900" />
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900 mb-1">QuickCart Grocery</h1>
                            <p className="text-sm text-gray-600">Product Inventory Report</p>
                        </div>
                    </div>
                    {/* Report Header - Only visible in print */}
                    <div className="hidden print:block report-header">
                        <img src={logo} alt="QuickCart Logo" className="h-12 w-12 mr-4 rounded-full bg-white p-1 border border-blue-900" />
                        <div>
                            <h1 className="text-3xl font-bold text-blue-900 mb-1">QuickCart Grocery</h1>
                            <p className="text-sm text-gray-600">Product Inventory Report</p>
                        </div>
                    </div>
                    <div className="flex justify-between items-center mb-6 text-sm text-gray-600 border-b pb-4">
                        <p>Generated on: {currentDate}</p>
                        <p>Total Products: {stats.totalProducts}</p>
                    </div>
                    {/* Inventory Stats */}
                    <div className="stats-container bg-white print:bg-transparent rounded-xl shadow-md print:shadow-none p-6 mb-8">
                        <h2 className="text-xl font-bold text-center mb-6 text-gray-800 print:text-black">Inventory Summary</h2>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {[
                                { title: "Total Products", value: stats.totalProducts },
                                { title: "Total Stock", value: stats.totalStock },
                                { title: "Avg. Price", value: `Rs. ${stats.averagePrice.toFixed(2)}` },
                                { title: "Total Value", value: `Rs. ${stats.totalValue.toFixed(2)}` },
                                { title: "Categories", value: stats.categoryCount }
                            ].map((stat, index) => (
                                <div key={index} className="bg-gray-50 print:bg-gray-100 p-4 rounded-lg border border-gray-200 stats-item">
                                    <h3 className="text-sm font-medium text-gray-600 stats-title">{stat.title}</h3>
                                    <p className="text-2xl font-bold text-blue-600 print:text-blue-800 mt-2 stats-value">{stat.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Products Table */}
                    <div className="table-container bg-white print:bg-transparent rounded-xl shadow-md print:shadow-none overflow-hidden">
                        <h2 className="text-lg font-bold p-4 bg-gray-50 print:bg-gray-100 border-b border-gray-200">Product Details</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 product-table">
                                <thead className="bg-gray-50 print:bg-gray-100">
                                    <tr>
                                        <th className="px-1 py-1 w-20 text-xs">Name</th>
                                        <th className="px-1 py-1 w-40 text-xs">Description</th>
                                        <th className="px-1 py-1 w-16 text-xs">Price</th>
                                        <th className="px-1 py-1 w-20 text-xs">Category</th>
                                        <th className="px-1 py-1 w-12 text-xs">Stock</th>
                                        <th className="px-1 py-1 w-20 text-xs">Images</th>
                                        <th className="px-1 py-1 w-24 text-xs">Supplier</th>
                                        <th className="px-1 py-1 w-20 text-xs no-print print:hidden action-buttons">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {sortedProducts.map((product) => (
                                        <tr key={product._id} className="h-16">
                                            {editingId === product._id ? (
                                                <>
                                                    <td className="px-1 py-1 text-xs">
                                                        <input
                                                            type="text"
                                                            name="name"
                                                            value={editFormData.name}
                                                            onChange={handleEditFormChange}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-1 text-xs max-w-xs whitespace-normal">
                                                        <input
                                                            type="text"
                                                            name="description"
                                                            value={editFormData.description}
                                                            onChange={handleEditFormChange}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-1 text-xs">
                                                        <input
                                                            type="number"
                                                            name="price"
                                                            value={editFormData.price}
                                                            onChange={handleEditFormChange}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                            step="0.01"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-1 text-xs">
                                                        <input
                                                            type="text"
                                                            name="category"
                                                            value={editFormData.category}
                                                            onChange={handleEditFormChange}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-1 text-xs">
                                                        <input
                                                            type="number"
                                                            name="stock"
                                                            value={editFormData.stock}
                                                            onChange={handleEditFormChange}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                            min="0"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-1 text-xs">
                                                        <div className="space-y-2">
                                                            <div className="flex flex-wrap gap-2">
                                                                {editFormData.images?.map((img, idx) => (
                                                                    <div key={idx} className="relative">
                                                                        <img 
                                                                            src={img.url} 
                                                                            alt="Product"
                                                                            className="h-12 w-12 object-cover rounded border"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeExistingImage(product._id, img.public_id)}
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                                {imagePreviews.map((preview, idx) => (
                                                                    <div key={`new-${idx}`} className="relative">
                                                                        <img 
                                                                            src={preview} 
                                                                            alt="Preview"
                                                                            className="h-12 w-12 object-cover rounded border"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => removeImage(idx)}
                                                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs"
                                                                        >
                                                                            ×
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <input
                                                                type="file"
                                                                multiple
                                                                onChange={handleImageChange}
                                                                accept="image/*"
                                                                className="block w-full text-sm text-gray-500
                                                                    file:mr-4 file:py-1 file:px-4
                                                                    file:rounded-md file:border-0
                                                                    file:text-sm file:font-semibold
                                                                    file:bg-blue-50 file:text-blue-700
                                                                    hover:file:bg-blue-100"
                                                            />
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-1 text-xs">
                                                        <input
                                                            type="text"
                                                            name="supplier"
                                                            value={editFormData.supplier}
                                                            onChange={handleEditFormChange}
                                                            className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                                                        />
                                                    </td>
                                                    <td className="px-1 py-1 text-xs space-x-1 no-print print:hidden action-buttons">
                                                        <button
                                                            onClick={() => handleUpdate(product._id)}
                                                            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded shadow-sm transition"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={handleCancel}
                                                            className="bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium py-1 px-3 rounded shadow-sm transition"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-1 py-1 text-xs font-medium text-gray-900">{product.name}</td>
                                                    <td className="px-1 py-1 text-xs text-gray-600 max-w-xs whitespace-normal">{product.description}</td>
                                                    <td className="px-1 py-1 text-xs text-blue-600 font-medium">Rs. {product.price.toFixed(2)}</td>
                                                    <td className="px-1 py-1 text-xs text-gray-600">{product.category}</td>
                                                    <td className="px-1 py-1 text-xs text-gray-600">{product.stock}</td>
                                                    <td className="px-1 py-1 text-xs">
                                                        <div className="flex flex-wrap gap-1">
                                                            {product.images?.map((img, idx) => (
                                                                <img key={idx} src={img.url} alt={product.name} className="h-6 w-6 object-cover rounded border" />
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="px-1 py-1 text-xs text-gray-600">{product.supplier}</td>
                                                    <td className="px-1 py-1 text-xs space-x-1 no-print print:hidden action-buttons">
                                                        <button
                                                            onClick={() => handleEditClick(product)}
                                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-1 px-3 rounded shadow-sm transition"
                                                        >
                                                            Edit
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(product._id)}
                                                            className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-1 px-3 rounded shadow-sm transition"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    {/* Report Footer - Only visible in print */}
                    <div className="hidden print:block mt-8 pt-4 text-center text-xs text-gray-500 border-t border-gray-200">
                        <p>© {new Date().getFullYear()} Quick Cart Grocery Store - Inventory Management System</p>
                        <p className="mt-1">Report generated on {currentDate}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductTable;