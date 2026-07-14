import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,102,255,0.12) 0%, transparent 70%), #0A0B10' }}>
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-4">
      <img
        src="/favicon.png"
        alt="Network Design Labs"
        className="w-full max-w-25 mx-auto rounded-2xl shadow-2xl shadow-black/50 border border-white/8"
      />
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Network Design Labs</p>
      </div>
      </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card-static rounded-2xl p-6 space-y-4">
          <div>
            <label className="field-label flex items-center space-x-1.5"><Mail className="h-3.5 w-3.5" /><span>Email Address</span></label>
            <input
              type="email" required value={email}
              onChange={e => setEmail(e.target.value)}
              className="field-input"
              placeholder="admin@gordon.com"
              autoFocus
            />
          </div>
          <div>
            <label className="field-label flex items-center space-x-1.5"><Lock className="h-3.5 w-3.5" /><span>Password</span></label>
            <input
              type="password" required value={password}
              onChange={e => setPassword(e.target.value)}
              className="field-input"
              placeholder="••••••••"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center text-sm py-3!">
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600">
          This dashboard is restricted to the platform administrator account.
        </p>
      </div>
    </div>
  );
}

export default Login;