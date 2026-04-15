import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Sword, Shield } from 'lucide-react';

function formatError(detail) {
  if (!detail) return 'Something went wrong.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail)) return detail.map(e => e?.msg || JSON.stringify(e)).join(' ');
  return String(detail);
}

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) { setError('Fill all fields'); return; }
    setLoading(true);
    setError('');
    try {
      if (isRegister) { await register(username, password); }
      else { await login(username, password); }
      navigate('/lobby');
    } catch (err) {
      setError(formatError(err.response?.data?.detail) || err.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" data-testid="login-page">
      {/* Background */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1746960854615-d99ee8e55b96?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1NzB8MHwxfHNlYXJjaHwzfHxzYW11cmFpJTIwc3dvcmQlMjBkYXJrfGVufDB8fHx8MTc3NjI2ODgyOHww&ixlib=rb-4.1.0&q=85"
          alt="" className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/75" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in-up">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Sword className="w-8 h-8 text-[#C41E3A]" />
            <h1 className="font-heading text-4xl sm:text-5xl font-black tracking-tight text-[#F5F5F0]">
              ROKUGAN
            </h1>
            <Shield className="w-8 h-8 text-[#D4AF37]" />
          </div>
          <p className="text-[#A1A1AA] text-sm tracking-[0.2em] uppercase font-bold">Battle for Honor</p>
        </div>

        {/* Form Card */}
        <div className="glass-panel rounded-sm p-8">
          <h2 className="font-heading text-2xl font-bold text-center mb-6 text-[#D4AF37]">
            {isRegister ? 'Create Account' : 'Enter the Battlefield'}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-[#D32F2F]/20 border border-[#D32F2F]/50 rounded-sm text-sm text-[#F87171]" data-testid="auth-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#A1A1AA] mb-2">Username</label>
              <input
                data-testid="username-input"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded-sm focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent outline-none transition-all"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-[0.2em] font-bold text-[#A1A1AA] mb-2">Password</label>
              <input
                data-testid="password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-black/50 border border-white/20 text-white px-4 py-3 rounded-sm focus:ring-2 focus:ring-[#C41E3A] focus:border-transparent outline-none transition-all"
                placeholder="Enter password"
              />
            </div>
            <button
              data-testid="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#C41E3A] text-white font-bold uppercase tracking-wider rounded-sm hover:bg-[#A01830] transition-colors disabled:opacity-50 shadow-md"
            >
              {loading ? 'Loading...' : isRegister ? 'Register' : 'Login'}
            </button>
          </form>

          <div className="mt-5 text-center">
            <button
              data-testid="toggle-auth-mode"
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-[#D4AF37] hover:text-[#B5952F] text-sm transition-colors"
            >
              {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
