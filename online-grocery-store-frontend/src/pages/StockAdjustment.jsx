import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPackage, FiArrowLeft, FiPlus, FiMinus, FiAlertCircle } from 'react-icons/fi';
import api from '../utils/api';
import { adjustStock } from '../services/stockService';

const StockAdjustment = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [adjustment, setAdjustment] = useState('');
  const [reason, setReason] = useState('');
  const [reasonDescription, setReasonDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
    }
  };

  const handleProductSelect = (productId) => {
    const product = products.find(p => p._id === productId);
    setSelectedProduct(product);
    setAdjustment('');
    setReason('');
    setReasonDescription('');
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedProduct || !adjustment || !reason) {
      setError('Please fill all required fields');
      setLoading(false);
      return;
    }

    const adjustmentNum = parseInt(adjustment, 10);
    if (isNaN(adjustmentNum) || adjustmentNum === 0) {
      setError('Adjustment amount must be a non-zero whole number');
      setLoading(false);
      return;
    }

    if (selectedProduct.stock + adjustmentNum < 0) {
      setError('Stock cannot go below 0');
      setLoading(false);
      return;
    }

    try {
      const response = await adjustStock(
        selectedProduct._id,
        adjustmentNum,
        reason,
        reasonDescription
      );

      console.log('Stock adjustment response:', response);
      
      // Handle response structure - backend returns { success: true, data: { product: {...} } }
      const responseData = response.data?.data || response.data;
      const newStock = responseData?.product?.newStock || selectedProduct.stock + adjustmentNum;

      setSuccess(`Stock adjusted successfully! New stock: ${newStock}`);
      
      // Refresh products to get updated stock
      await fetchProducts();
      
      // Update selected product stock in UI
      if (selectedProduct) {
        setSelectedProduct({
          ...selectedProduct,
          stock: newStock
        });
      }
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSelectedProduct(null);
        setAdjustment('');
        setReason('');
        setReasonDescription('');
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error adjusting stock:', err);
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.error || 
                          err.message || 
                          'Failed to adjust stock. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const quickAdjust = (amount) => {
    if (selectedProduct) {
      setAdjustment(amount.toString());
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/home')}
            className="mr-4 p-2 hover:bg-white rounded-lg transition"
          >
            <FiArrowLeft className="text-2xl text-blue-700" />
          </button>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <FiPackage className="mr-3" />
            Stock Adjustment
          </h1>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
              <p className="text-red-700 font-medium flex items-center">
                <FiAlertCircle className="mr-2" />
                {error}
              </p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded">
              <p className="text-green-700 font-medium">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product *
              </label>
              <select
                value={selectedProduct?._id || ''}
                onChange={(e) => handleProductSelect(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Choose a product...</option>
                {products.map(product => (
                  <option key={product._id} value={product._id}>
                    {product.name} (Current Stock: {product.stock})
                  </option>
                ))}
              </select>
            </div>

            {selectedProduct && (
              <>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Product Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Current Stock:</span>
                      <span className="ml-2 font-bold text-blue-700">{selectedProduct.stock}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reorder Point:</span>
                      <span className="ml-2 font-bold text-blue-700">{selectedProduct.reorderPoint || 10}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Category:</span>
                      <span className="ml-2">{selectedProduct.category}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Price:</span>
                      <span className="ml-2">Rs. {selectedProduct.price?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adjustment Amount *
                    <span className="text-xs text-gray-500 ml-2">
                      (Positive to add, negative to subtract)
                    </span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={adjustment}
                      onChange={(e) => setAdjustment(e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., +10 or -5"
                      required
                      step="1"
                    />
                    <div className="flex space-x-1">
                      <button
                        type="button"
                        onClick={() => quickAdjust(10)}
                        className="px-3 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 transition"
                        title="Quick add 10"
                      >
                        <FiPlus /> +10
                      </button>
                      <button
                        type="button"
                        onClick={() => quickAdjust(-10)}
                        className="px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                        title="Quick subtract 10"
                      >
                        <FiMinus /> -10
                      </button>
                    </div>
                  </div>
                  {adjustment && !isNaN(parseInt(adjustment, 10)) && (
                    <p className="mt-2 text-sm text-gray-600">
                      New stock will be: <span className="font-bold text-blue-700">
                        {Math.max(0, selectedProduct.stock + parseInt(adjustment, 10))}
                      </span>
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Adjustment *
                  </label>
                  <select
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="">Select a reason...</option>
                    <option value="stock_adjusted">Manual Adjustment</option>
                    <option value="damaged">Damaged Items</option>
                    <option value="returned">Returned Items</option>
                    <option value="found">Found Items</option>
                    <option value="expired">Expired Items</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    value={reasonDescription}
                    onChange={(e) => setReasonDescription(e.target.value)}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add any additional details about this adjustment..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full ${
                    loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                  } text-white font-medium py-3 px-4 rounded-lg shadow-md transition duration-300`}
                >
                  {loading ? 'Adjusting Stock...' : 'Adjust Stock'}
                </button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default StockAdjustment;
