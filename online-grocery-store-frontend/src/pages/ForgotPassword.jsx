import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiX, FiMenu } from 'react-icons/fi';
import ProfessionalFooter from '../components/ProfessionalFooter';
import { requestPasswordReset, resetPassword } from '../services/authService';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: request reset, 2: reset password
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      const response = await requestPasswordReset(email);
      if (response.success) {
        // In development, show the token. In production, this would be sent via email
        if (response.data?.resetToken) {
          setResetToken(response.data.resetToken);
          setSuccess(`Password reset token generated. Please copy this token: ${response.data.resetToken}`);
          setStep(2);
        } else {
          setSuccess('If an account with that email exists, a password reset link would be sent to your email.');
        }
      } else {
        setError(response.message || 'Failed to request password reset. Please try again.');
      }
    } catch (err) {
      console.error('Password reset error:', err);
      // Extract error message from different possible error formats
      let errorMessage = 'Failed to request password reset. ';
      
      if (err.response) {
        // Server responded with error
        errorMessage += err.response.data?.message || err.response.statusText || 'Server error occurred.';
      } else if (err.request) {
        // Request was made but no response received
        errorMessage += 'Cannot connect to server. Please make sure the backend server is running on http://localhost:3000';
      } else if (err.message) {
        // Error message from the service
        errorMessage = err.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const token = resetToken || document.getElementById('resetTokenInput')?.value;
      if (!token) {
        setError('Reset token is required');
        setLoading(false);
        return;
      }

      const response = await resetPassword(token, newPassword);
      if (response.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-blue-900 text-white shadow-md w-full">
        <div className="container mx-auto flex justify-between items-center px-4 py-4">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 p-2 rounded-md hover:bg-blue-800 lg:hidden"
            >
              {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
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
            onClick={() => navigate('/login')}
          >
            Back to Login
          </button>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-5xl font-bold text-indigo-600">
              Quick Cart
            </h1>
            <p className="mt-2 text-gray-600">Password Reset</p>
          </div>
          <div className="bg-white py-8 px-4 shadow-lg rounded-lg">
            {step === 1 ? (
              <>
                <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
                  Forgot Password?
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Enter your email address and we'll send you a password reset token.
                </p>
                <form className="mt-8 space-y-6" onSubmit={handleRequestReset}>
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
                      disabled={loading}
                    />
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">
                      {success}
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {loading ? 'Sending...' : 'Send Reset Token'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <h2 className="mt-6 text-center text-2xl font-semibold text-gray-900">
                  Reset Password
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Enter your reset token and new password.
                </p>
                <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="resetToken" className="block text-sm font-medium text-gray-700 mb-1">
                        Reset Token
                      </label>
                      <input
                        id="resetTokenInput"
                        name="resetToken"
                        type="text"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter reset token"
                        value={resetToken}
                        onChange={(e) => setResetToken(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Enter new password (min 6 characters)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm Password
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md border border-red-200">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md border border-green-200">
                      {success}
                    </div>
                  )}

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setError('');
                        setSuccess('');
                        setResetToken('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="flex-1 py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <ProfessionalFooter />
    </div>
  );
};

export default ForgotPassword;

