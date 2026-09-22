import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  const handleDemoLogin = () => {
    setEmail('alex@example.com');
    setPassword('userpassword123');
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-xl p-8 shadow-xl space-y-6">
        
        <div className="text-center space-y-1">
          <h2 className="text-2xl font-extrabold text-white">Sign In</h2>
          <p className="text-xs text-slate-400">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="bg-rose-500/20 border border-rose-500 text-rose-300 p-3 rounded text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded p-2.5 text-xs text-white focus:outline-none focus:border-teal-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-xs rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="pt-2 border-t border-slate-800 text-center space-y-2">
          <button
            type="button"
            onClick={handleDemoLogin}
            className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 rounded"
          >
            Fill Demo Credentials (alex@example.com)
          </button>
          
          <p className="text-xs text-slate-400 pt-1">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-teal-400 hover:underline">
              Register Here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Login;
