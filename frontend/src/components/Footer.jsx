import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 text-xs mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-sm font-bold text-white">🏝️ Holiday Mirage</span>
          <p className="mt-1 text-slate-400">Plan your perfect escape with mood-based travel itineraries.</p>
        </div>
        <div className="flex space-x-4">
          <Link to="/" className="hover:text-teal-400">Home</Link>
          <Link to="/destinations" className="hover:text-teal-400">Destinations</Link>
          <Link to="/login" className="hover:text-teal-400">Sign In</Link>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pt-4 border-t border-slate-800 text-center text-slate-500">
        © {new Date().getFullYear()} Holiday Mirage. Full-Stack Web Development Assignment.
      </div>
    </footer>
  );
};

export default Footer;
