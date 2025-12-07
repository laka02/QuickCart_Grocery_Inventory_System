import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const SupplierTable = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [poDetails, setPoDetails] = useState({
    productId: '',
    quantity: 1
  });
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/suppliers'),
          axios.get('http://localhost:3000/api/products')
        ]);
        setSuppliers(suppliersRes.data);
        setProducts(productsRes.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtered suppliers
  const filteredSuppliers = suppliers.filter(supplier => {
    const term = searchTerm.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(term) ||
      supplier.email.toLowerCase().includes(term) ||
      (supplier.phone || '').toLowerCase().includes(term)
    );
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        const response = await axios.delete(
          `http://localhost:3000/api/suppliers/${id}`,
          {
            headers: {
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        
        if (response.status === 200) {
          setSuppliers(prevSuppliers => 
            prevSuppliers.filter(supplier => supplier._id !== id)
          );
          alert('Supplier deleted successfully');
        }
      } catch (err) {
        console.error('Full error:', err);
        console.error('Response data:', err.response?.data);
        setError(
          err.response?.data?.message || 
          err.response?.data?.error || 
          'Failed to delete supplier. Please try again.'
        );
      }
    }
  };

  const handleCreatePO = (supplier) => {
    setSelectedSupplier(supplier);
    setPoDetails({
      productId: supplier.productsSupplied[0]?._id || '',
      quantity: 1
    });
  };

  const handlePoSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:3000/api/suppliers/${selectedSupplier._id}/purchase-order`,
        poDetails
      );
      alert(`Purchase Order Created!\n${JSON.stringify(response.data, null, 2)}`);
      setSelectedSupplier(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleGeneratePDF = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/suppliers/pdf/generate', {
        responseType: 'blob'
      });
      
      // Create a blob from the PDF data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'suppliers.pdf';
      
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

  const handleStatusToggle = async (supplierId, currentStatus) => {
    try {
      const response = await axios.put(
        `http://localhost:3000/api/suppliers/${supplierId}`,
        { isActive: !currentStatus }
      );
      
      setSuppliers(prevSuppliers =>
        prevSuppliers.map(supplier =>
          supplier._id === supplierId
            ? { ...supplier, isActive: !currentStatus }
            : supplier
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (loading) return <div className="text-center py-8">Loading suppliers...</div>;
  if (error) return <div className="text-red-500 text-center py-8">Error: {error}</div>;

  return (
    <div className="w-full px-2 py-4">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
        <h1 className="text-2xl font-bold">Supplier Management</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleGeneratePDF}
            className="px-4 py-2 bg-blue-900 text-white rounded-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Generate PDF
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider no-print">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSuppliers.map((supplier) => (
              <tr key={supplier._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{supplier.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{supplier.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-gray-500">{supplier.phone || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {supplier.productsSupplied?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {supplier.productsSupplied.map(product => (
                        <span key={product._id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {product.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400">No products</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleStatusToggle(supplier._id, supplier.isActive)}
                    className={`px-2 py-1 text-xs rounded-full cursor-pointer ${
                      supplier.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDelete(supplier._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => handleCreatePO(supplier)}
                      className="text-green-600 hover:text-green-900"
                      disabled={!supplier.productsSupplied?.length}
                    >
                      Create PO
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PO Modal */}
      {selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              Create Purchase Order for {selectedSupplier.name}
            </h2>
            <form onSubmit={handlePoSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <select
                  value={poDetails.productId}
                  onChange={(e) => setPoDetails({...poDetails, productId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  {selectedSupplier.productsSupplied.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.name} (${product.price})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  min="1"
                  value={poDetails.quantity}
                  onChange={(e) => setPoDetails({...poDetails, quantity: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              {error && <div className="text-red-500 mb-4">{error}</div>}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setSelectedSupplier(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
                >
                  Submit PO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {suppliers.length === 0 && (
        <div className="text-center py-8 text-gray-500">No suppliers found</div>
      )}
    </div>
  );
};

export default SupplierTable;