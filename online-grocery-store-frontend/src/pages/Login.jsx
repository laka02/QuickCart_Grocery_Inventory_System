import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiDollarSign, FiPackage, FiFilter, FiX, FiMenu, FiGrid } from 'react-icons/fi';
import ProfessionalFooter from '../components/ProfessionalFooter';

const Login = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.endsWith('inv@gmail.com')) {
      localStorage.setItem('userEmail', email);
      console.log('Stored email in localStorage:', email);
      navigate('/home');
    } else {
      setError('Invalid email address. Please enter a valid email address.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header - Not fixed */}
      <header className="bg-blue-900 text-white shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 p-2 rounded-md hover:bg-blue-800 lg:hidden"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
            {/* Added logo image here */}
            <img 
              src="./src/images/logo.png" 
              alt="QuickCart Logo" 
              className="h-10 w-auto mr-3"
            />
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">QuickCart Grocery</h1>
          </div>
          <button
            className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-md shadow hover:bg-blue-100 transition duration-200"
            type="button"
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>
      </header>

      {/* Login Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-indigo-600 animate-bounce">
              Quick Cart
            </h1>
            <p className="mt-2 text-gray-600">Your one-stop shopping solution</p>
          </div>
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg">
            <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
              Welcome back
            </h2>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="email" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {error && (
                <div className="text-red-500 text-sm text-center animate-pulse">{error}</div>
              )}

              <div>
                <button
                  type="submit"
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105"
                >
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Footer */}
      <ProfessionalFooter />
    </div>
  );
};

export default Login;