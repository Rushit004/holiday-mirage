import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-teal-400">🏝️ Holiday Mirage</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">Home</Link>
            <Link to="/destinations" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">Destinations</Link>
            {isAuthenticated && (
              <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-teal-400 transition-colors">Dashboard</Link>
            )}
          </div>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="text-xs text-slate-300">Hello, <strong className="text-white">{user?.name}</strong></span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login" className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white">
                  Login
                </Link>
                <Link to="/register" className="px-3.5 py-1.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded transition-colors">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-300 hover:text-white focus:outline-none text-xl"
            >
              {isOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 py-3 space-y-2">
          <Link to="/" onClick={() => setIsOpen(false)} className="block text-sm py-1 text-slate-300 hover:text-teal-400">Home</Link>
          <Link to="/destinations" onClick={() => setIsOpen(false)} className="block text-sm py-1 text-slate-300 hover:text-teal-400">Destinations</Link>
          {isAuthenticated && (
            <Link to="/dashboard" onClick={() => setIsOpen(false)} className="block text-sm py-1 text-slate-300 hover:text-teal-400">Dashboard</Link>
          )}

          <div className="pt-2 border-t border-slate-800">
            {isAuthenticated ? (
              <button
                onClick={() => { handleLogout(); setIsOpen(false); }}
                className="w-full text-left py-1 text-xs text-rose-400 font-bold"
              >
                Logout ({user?.name})
              </button>
            ) : (
              <div className="flex space-x-2 pt-1">
                <Link to="/login" onClick={() => setIsOpen(false)} className="px-3 py-1 text-xs bg-slate-800 text-white rounded">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="px-3 py-1 text-xs bg-teal-500 text-slate-950 font-bold rounded">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
