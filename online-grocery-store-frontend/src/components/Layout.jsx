import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { logout } from '../services/authService';
import { FiShoppingCart } from 'react-icons/fi';

function Layout() {
  const navigate = useNavigate();
  const componentRef = useRef();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState('');
  const { getCartItemCount } = useCart();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: 'Product_Report',
    // ...other options
  });

  const handleDelete = async (id) => {
    // ...
  };

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Quick Cart</h1>
        </div>
        <div className="sidebar-menu">
          <Link to="/home" className="nav-link">
            <i className="icon-dashboard"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/home/newProduct" className="nav-link">
            <i className="icon-dashboard"></i>
            <span>Add Products</span>
          </Link>
          <Link to="/home/products" className="nav-link">
            <i className="icon-products"></i>
            <span>Product Details</span>
          </Link>
          <Link to="/home/suppliers" className="nav-link">
            <i className="icon-suppliers"></i>
            <span>Supplier Details</span>
          </Link>
          <Link to="/home/profile" className="nav-link">
            <i className="icon-profile"></i>
            <span>User Profile</span>
          </Link>
          <Link to="/cart" className="nav-link relative">
            <FiShoppingCart className="icon" />
            <span>View Cart</span>
            {getCartItemCount() > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {getCartItemCount()}
              </span>
            )}
          </Link>
          <button 
            onClick={handleLogout}
            className="nav-link text-red-500 hover:text-red-700 mt-auto"
          >
            <i className="icon-logout"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-40 absolute inset-0"></div>
          <div className="relative bg-white rounded-lg shadow-xl px-8 py-6 flex flex-col items-center animate-fade-in">
            <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span className="text-lg font-semibold text-gray-800 mb-4">Are you sure you want to delete this product?</span>
            <div className="flex gap-4">
              <button
                onClick={async () => {
                  try {
                    await api.delete(`/products/${productToDelete}`);
                    fetchProducts();
                    fetchInventoryStats();
                    setDeleteMessage('Product deleted successfully!');
                  } catch {
                    setDeleteMessage('Failed to delete product.');
                  }
                  setShowDeleteConfirm(false);
                  setShowDeletePopup(true);
                  setTimeout(() => setShowDeletePopup(false), 2000);
                }}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showDeletePopup && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-40 absolute inset-0"></div>
          <div className="relative bg-white rounded-lg shadow-xl px-8 py-6 flex flex-col items-center animate-fade-in">
            <svg className="w-12 h-12 text-green-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-semibold text-gray-800">{deleteMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Layout;