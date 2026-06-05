import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiClock, FiUser, FiFilter } from 'react-icons/fi';
import { getStockHistory, getAllStockHistory } from '../services/stockService';

const StockHistory = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    reason: '',
    startDate: '',
    endDate: ''
  });

  // Debug: Log component mount and productId
  useEffect(() => {
    console.log('StockHistory component mounted, productId:', productId);
  }, [productId]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, page, filters.reason, filters.startDate, filters.endDate]);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      let response;
      if (productId) {
        response = await getStockHistory(productId, page, 20);
        console.log('Stock history response:', response);
        if (response.data) {
          setProduct(response.data.product || null);
          setHistory(response.data.history || []);
          setTotalPages(response.data.pagination?.pages || 1);
        } else {
          setError('Invalid response format');
        }
      } else {
        const params = { ...filters };
        if (filters.reason) params.reason = filters.reason;
        response = await getAllStockHistory(page, 20, params);
        console.log('All stock history response:', response);
        if (response.data) {
          setHistory(response.data.history || []);
          setTotalPages(response.data.pagination?.pages || 1);
        } else {
          setError('Invalid response format');
        }
      }
    } catch (err) {
      console.error('Error fetching stock history:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load stock history';
      setError(errorMessage);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getReasonLabel = (reason) => {
    const labels = {
      'product_created': 'Product Created',
      'product_updated': 'Product Updated',
      'stock_adjusted': 'Stock Adjusted',
      'order_placed': 'Order Placed',
      'order_cancelled': 'Order Cancelled',
      'damaged': 'Damaged',
      'returned': 'Returned',
      'found': 'Found',
      'expired': 'Expired',
      'other': 'Other'
    };
    return labels[reason] || reason;
  };

  const getReasonColor = (reason) => {
    const colors = {
      'product_created': 'bg-green-100 text-green-800',
      'product_updated': 'bg-blue-100 text-blue-800',
      'stock_adjusted': 'bg-purple-100 text-purple-800',
      'order_placed': 'bg-yellow-100 text-yellow-800',
      'order_cancelled': 'bg-red-100 text-red-800',
      'damaged': 'bg-red-100 text-red-800',
      'returned': 'bg-blue-100 text-blue-800',
      'found': 'bg-green-100 text-green-800',
      'expired': 'bg-orange-100 text-orange-800',
      'other': 'bg-gray-100 text-gray-800'
    };
    return colors[reason] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/home')}
            className="mr-4 p-2 hover:bg-white rounded-lg transition"
          >
            <FiArrowLeft className="text-2xl text-blue-700" />
          </button>
          <h1 className="text-3xl font-bold text-blue-900 flex items-center">
            <FiClock className="mr-3" />
            Stock History
            {product && <span className="ml-3 text-xl text-gray-600">- {product.name}</span>}
          </h1>
        </div>

        {product && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiPackage className="mr-2" />
              Product Information
            </h2>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <span className="text-gray-600">Current Stock:</span>
                <p className="text-2xl font-bold text-blue-700">{product.currentStock}</p>
              </div>
              <div>
                <span className="text-gray-600">Reorder Point:</span>
                <p className="text-2xl font-bold text-orange-700">{product.reorderPoint || 10}</p>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <p className={`text-lg font-semibold ${
                  product.currentStock === 0 ? 'text-red-600' :
                  product.currentStock <= product.reorderPoint ? 'text-orange-600' :
                  'text-green-600'
                }`}>
                  {product.currentStock === 0 ? 'Out of Stock' :
                   product.currentStock <= product.reorderPoint ? 'Low Stock' :
                   'In Stock'}
                </p>
              </div>
            </div>
          </div>
        )}

        {!productId && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <FiFilter className="mr-2" />
              Filters
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <select
                  value={filters.reason}
                  onChange={(e) => setFilters({ ...filters, reason: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All Reasons</option>
                  <option value="product_created">Product Created</option>
                  <option value="product_updated">Product Updated</option>
                  <option value="stock_adjusted">Stock Adjusted</option>
                  <option value="order_placed">Order Placed</option>
                  <option value="order_cancelled">Order Cancelled</option>
                  <option value="damaged">Damaged</option>
                  <option value="returned">Returned</option>
                  <option value="found">Found</option>
                  <option value="expired">Expired</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <p className="text-red-700 font-semibold">Error: {error}</p>
            <button
              onClick={fetchHistory}
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <p className="mt-4 text-gray-600">Loading history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold mb-4">Failed to load stock history</p>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchHistory}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12">
              <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg font-semibold mb-2">No stock history found</p>
              <p className="text-gray-500 text-sm">
                {productId 
                  ? 'This product has no stock history yet. Stock changes will appear here.'
                  : 'No stock history records found. Stock adjustments will appear here once made.'}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Date & Time</th>
                      {!productId && <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>}
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Previous Stock</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Change</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">New Stock</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Reason</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Performed By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((entry, index) => (
                      <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiClock className="mr-2" />
                            {formatDate(entry.createdAt)}
                          </div>
                        </td>
                        {!productId && (
                          <td className="py-3 px-4">
                            {entry.product?.name || entry.productName || 'N/A'}
                          </td>
                        )}
                        <td className="py-3 px-4 font-medium">{entry.previousStock}</td>
                        <td className="py-3 px-4">
                          <span className={`font-bold ${
                            entry.changeAmount > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {entry.changeAmount > 0 ? '+' : ''}{entry.changeAmount}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-blue-700">{entry.newStock}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReasonColor(entry.reason)}`}>
                            {getReasonLabel(entry.reason)}
                          </span>
                          {entry.reasonDescription && (
                            <p className="text-xs text-gray-500 mt-1">{entry.reasonDescription}</p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <FiUser className="mr-2" />
                            {entry.performedBy?.email || entry.performedByName || 'System'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
