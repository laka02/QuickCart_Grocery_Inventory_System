import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts';
import { getProducts } from '../services/productService';
import { getLowStockAlerts } from '../services/stockService';
import { FiAlertTriangle, FiPackage, FiArrowRight } from 'react-icons/fi';

function Home() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStock: 0,
    averagePrice: 0,
    totalValue: 0,
    categoryCount: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRoles, setShowRoles] = useState(false);
  const [products, setProducts] = useState([]);
  const [categoryChartData, setCategoryChartData] = useState([]);
  const [stockLevelData, setStockLevelData] = useState([]);
  const [stockTrendData, setStockTrendData] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState(null);

  useEffect(() => {
    const fetchInventoryStats = async () => {
      try {
        const response = await api.get('/products/stats/inventory');
        setStats(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchProductsForCharts = async () => {
      try {
        const res = await getProducts();
        const items = res.data || [];
        setProducts(items);

        // Category distribution (number of products per category)
        const categoryMap = items.reduce((acc, p) => {
          const key = p.category || 'Uncategorized';
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {});
        const categoryData = Object.entries(categoryMap).map(([name, value]) => ({
          name,
          value,
        }));
        setCategoryChartData(categoryData);

        // Stock level distribution
        let outOfStock = 0;
        let low = 0;
        let medium = 0;
        let high = 0;

        items.forEach((p) => {
          const stock = Number(p.stock) || 0;
          if (stock === 0) outOfStock += 1;
          else if (stock < 10) low += 1;
          else if (stock <= 50) medium += 1;
          else high += 1;
        });

        setStockLevelData([
          { name: 'Out of Stock', value: outOfStock },
          { name: 'Low (1-9)', value: low },
          { name: 'Medium (10-50)', value: medium },
          { name: 'High (>50)', value: high },
        ]);

        // Stock trend over time (by month)
        const monthlyStockMap = items.reduce((acc, product) => {
          if (!product.createdAt) return acc;
          const date = new Date(product.createdAt);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

          if (!acc[monthKey]) {
            acc[monthKey] = {
              sortValue: new Date(date.getFullYear(), date.getMonth(), 1).getTime(),
              totalStock: 0,
            };
          }
          acc[monthKey].totalStock += Number(product.stock) || 0;
          return acc;
        }, {});

        const monthlyStock = Object.entries(monthlyStockMap)
          .sort((a, b) => a[1].sortValue - b[1].sortValue)
          .map(([key, value]) => {
            const [year, month] = key.split('-');
            const labelDate = new Date(Number(year), Number(month) - 1, 1);
            return {
              month: labelDate.toLocaleString('default', { month: 'short', year: 'numeric' }),
              totalStock: value.totalStock,
            };
          });

        setStockTrendData(monthlyStock);
      } catch (err) {
        console.error('Error loading products for charts:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchLowStockAlerts = async () => {
      try {
        const response = await getLowStockAlerts();
        setLowStockAlerts(response.data);
      } catch (err) {
        console.error('Error loading low stock alerts:', err);
      }
    };

    Promise.all([fetchInventoryStats(), fetchProductsForCharts(), fetchLowStockAlerts()]).catch(() => {
      setLoading(false);
    });
  }, []);

  const CATEGORY_COLORS = ['#2563eb', '#16a34a', '#f97316', '#a855f7', '#0ea5e9', '#facc15'];
  const STOCK_COLORS = ['#ef4444', '#f97316', '#22c55e', '#2563eb'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12 pt-8">
          <h3 className="text-3xl font-bold mb-2 text-blue-800">Welcome to the</h3>
          <h1 className="text-6xl font-bold text-blue-900 mb-6">Quick Cart Grocery Store</h1>
          <Link 
            to="/products" 
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition duration-300"
          >
            View Products
          </Link>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-xl p-8 mb-12">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-800">Inventory Dashboard</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-600">Loading inventory stats...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <p className="text-red-700 font-medium">Error loading stats: {error}</p>
            </div>
          ) : (
            <>
              {/* Low Stock Alerts */}
              {lowStockAlerts && lowStockAlerts.total > 0 && (
                <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-lg p-6 shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <FiAlertTriangle className="text-3xl text-orange-600 mr-3" />
                      <div>
                        <h3 className="text-2xl font-bold text-orange-900">Low Stock Alerts</h3>
                        <p className="text-orange-700">
                          {lowStockAlerts.critical} critical (out of stock), {lowStockAlerts.low} low stock items
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/home/stock/adjust"
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition flex items-center"
                    >
                      Adjust Stock <FiArrowRight className="ml-2" />
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {lowStockAlerts.products.slice(0, 6).map((product) => (
                      <div
                        key={product._id}
                        className={`p-4 rounded-lg ${
                          product.stock === 0
                            ? 'bg-red-100 border-2 border-red-300'
                            : 'bg-orange-100 border-2 border-orange-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-800">{product.name}</h4>
                            <p className="text-sm text-gray-600">{product.category}</p>
                            <div className="mt-2 flex items-center space-x-4">
                              <span className={`text-sm font-bold ${
                                product.stock === 0 ? 'text-red-700' : 'text-orange-700'
                              }`}>
                                Stock: {product.stock}
                              </span>
                              <span className="text-xs text-gray-600">
                                Reorder: {product.reorderPoint || 10}
                              </span>
                            </div>
                          </div>
                          <Link
                            to={`/home/stock/history/${product._id}`}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                            title="View History"
                          >
                            <FiPackage className="text-xl" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                  {lowStockAlerts.total > 6 && (
                    <div className="mt-4 text-center">
                      <Link
                        to="/home/stock/history"
                        className="text-orange-700 hover:text-orange-900 font-semibold text-sm"
                      >
                        View all {lowStockAlerts.total} low stock items →
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <h3 className="font-semibold text-gray-600 text-lg mb-2">Total Products</h3>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalProducts}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <h3 className="font-semibold text-gray-600 text-lg mb-2">Total Stock</h3>
                  <p className="text-4xl font-bold text-blue-600">{stats.totalStock}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <h3 className="font-semibold text-gray-600 text-lg mb-2">Avg. Price</h3>
                  <p className="text-4xl font-bold text-blue-600">Rs. {stats.averagePrice.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <h3 className="font-semibold text-gray-600 text-lg mb-2">Total Value</h3>
                  <p className="text-4xl font-bold text-blue-600">Rs. {stats.totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all">
                  <h3 className="font-semibold text-gray-600 text-lg mb-2">Categories</h3>
                  <p className="text-4xl font-bold text-blue-600">{stats.categoryCount}</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Category Distribution Pie Chart */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Products by Category</h3>
                  {categoryChartData.length === 0 ? (
                    <p className="text-gray-500 text-sm">No category data available.</p>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={categoryChartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={90}
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name} ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {categoryChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                          <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>

                {/* Stock Level Bar Chart */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">Stock Level Overview</h3>
                  {stockLevelData.every((d) => d.value === 0) ? (
                    <p className="text-gray-500 text-sm">No stock data available.</p>
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockLevelData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                          <YAxis allowDecimals={false} />
                          <Tooltip formatter={(value) => [`${value} products`, 'Count']} />
                          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                            {stockLevelData.map((entry, index) => (
                              <Cell key={`bar-${index}`} fill={STOCK_COLORS[index % STOCK_COLORS.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>

              {/* Stock Trend Chart */}
              <div className="mt-10 bg-white rounded-xl shadow-md border border-gray-100 p-6">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Stock Level Over Time</h3>
                {stockTrendData.length === 0 ? (
                  <p className="text-gray-500 text-sm">Not enough historical data to display the trend.</p>
                ) : (
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stockTrendData} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                        <YAxis allowDecimals={false} />
                        <Tooltip formatter={(value) => [`${value} units`, 'Total Stock']} />
                        <Line
                          type="monotone"
                          dataKey="totalStock"
                          stroke="#2563eb"
                          strokeWidth={3}
                          dot={{ r: 4, stroke: '#1d4ed8', strokeWidth: 2 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

export default Home;