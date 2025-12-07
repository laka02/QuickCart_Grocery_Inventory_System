import React from 'react';
import { useLocation } from 'react-router-dom';
import logo from '../images/logo.png';

const ProfessionalFooter = () => {
  const location = useLocation();
  const isHomeOrLogin = location.pathname === '/' || location.pathname === '/login';

  return (
    <footer className="bg-blue-900 text-white pt-10 pb-4 mt-8 border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Logo & About */}
        <div className="flex flex-col items-start">
          <div className="flex items-center mb-3">
            <img src={logo} alt="QuickCart Logo" className="h-10 w-10 mr-2 rounded-full bg-white p-1" />
            <span className="text-2xl font-bold tracking-tight">QuickCart Grocery</span>
          </div>
          <p className="text-blue-200 text-sm mb-2">Your one-stop shop for all grocery needs. Freshness delivered to your doorstep, every day.</p>
          <div className="flex space-x-3 mt-2">
            <a href="#" className="hover:text-blue-300" aria-label="Facebook"><i className="fab fa-facebook-f"></i></a>
            <a href="#" className="hover:text-blue-300" aria-label="Twitter"><i className="fab fa-twitter"></i></a>
            <a href="#" className="hover:text-blue-300" aria-label="Instagram"><i className="fab fa-instagram"></i></a>
          </div>
        </div>
        {/* Quick Links */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Quick Links</h4>
          <ul className="space-y-2 text-blue-200 text-sm">
            {isHomeOrLogin ? (
              <>
                <li><span className="opacity-60 cursor-not-allowed">Home</span></li>
                <li><span className="opacity-60 cursor-not-allowed">Login</span></li>
                <li><span className="opacity-60 cursor-not-allowed">Products</span></li>
                <li><span className="opacity-60 cursor-not-allowed">Suppliers</span></li>
                <li><span className="opacity-60 cursor-not-allowed">Profile</span></li>
              </>
            ) : (
              <>
                <li><a href="/" className="hover:text-white">Home</a></li>
                <li><a href="/login" className="hover:text-white">Login</a></li>
                <li><a href="/home/products" className="hover:text-white">Products</a></li>
                <li><a href="/home/suppliers" className="hover:text-white">Suppliers</a></li>
                <li><a href="/home/profile" className="hover:text-white">Profile</a></li>
              </>
            )}
          </ul>
        </div>
        {/* Customer Service */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Customer Service</h4>
          <ul className="space-y-2 text-blue-200 text-sm">
            <li><a href="#" className="hover:text-white">Contact Us</a></li>
            <li><a href="#" className="hover:text-white">FAQ</a></li>
            <li><a href="#" className="hover:text-white">Returns & Refunds</a></li>
            <li><a href="#" className="hover:text-white">Delivery Info</a></li>
          </ul>
        </div>
        {/* Contact Info */}
        <div>
          <h4 className="font-semibold mb-3 text-lg">Contact</h4>
          <ul className="text-blue-200 text-sm space-y-2">
            <li><span className="font-semibold text-white">Email:</span> support@quickcart.com</li>
            <li><span className="font-semibold text-white">Phone:</span> +94 11 234 5678</li>
            <li><span className="font-semibold text-white">Address:</span> 123 Main St, Colombo, Sri Lanka</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-blue-800 mt-8 pt-4 text-center text-blue-300 text-xs">
        &copy; {new Date().getFullYear()} QuickCart Grocery Store. All rights reserved. Powered by QuickCart.
      </div>
    </footer>
  );
};

export default ProfessionalFooter; 