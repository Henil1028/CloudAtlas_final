import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Activity, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const AdminLoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter both your admin email and password.');
      setLoading(false);
      return;
    }

    try {
      // Use existing login function
      const user = await login(email, password);
      
      // If login succeeds, check if the user is a super_admin
      if (user && user.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        // Immediate cleanup of session if not a super admin
        logout();
        setError('Access Denied. This account does not possess Super Admin credentials.');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      // Ensure local state is clean
      logout();
      setError(err.message || 'Invalid administrator credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center grid-bg text-white px-4 relative overflow-hidden">
      {/* Dynamic Floating Background Elements */}
      <div className="absolute top-1/10 left-1/10 h-[350px] w-[350px] rounded-full bg-primary/10 blur-[130px] animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/10 right-1/10 h-[400px] w-[400px] rounded-full bg-orange-600/10 blur-[150px] pointer-events-none" />
      
      {/* Matrix-like subtle light bars */}
      <div className="absolute inset-0 bg-gradient-to-t from-navy-dark via-transparent to-transparent opacity-90 pointer-events-none" />

      <div className="w-full max-w-lg relative z-10 my-8">
        
        {/* Portal Branding and Micro-Animations */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            {/* Pulsing Outer Glow */}
            <div className="absolute -inset-1.5 rounded-2xl bg-gradient-to-r from-primary to-orange-500 opacity-60 blur-md group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
            
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-navy-dark border border-white/10 text-white shadow-2xl">
              <Shield className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mt-6 text-center">
            <span className="bg-gradient-to-r from-white via-slate-100 to-gray-400 bg-clip-text text-transparent">
              CloudAtlas AI
            </span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest">
              SECURE ADMIN PORTAL
            </p>
          </div>
        </div>

        {/* High-Fidelity Login Card */}
        <div className="glass-card rounded-2xl p-8 sm:p-10 border border-white/5 shadow-2xl relative overflow-hidden bg-navy-dark/40 backdrop-blur-xl">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed animate-shake">
                <AlertCircle className="h-5 w-5 shrink-0 text-red-400 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field with Glow effect */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                Administrator Username / Email
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  id="email"
                  type="text"
                  placeholder="admin1@cloudatlas.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  required
                />
              </div>
            </div>

            {/* Password Field with Show/Hide toggle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Security Passcode
                </label>
              </div>
              <div className="relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-primary/50 focus:bg-white/[0.04] focus:ring-1 focus:ring-primary/20 transition-all font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-primary to-orange-600 text-sm font-semibold rounded-xl text-white hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer shadow-lg shadow-primary/25 disabled:opacity-50"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  Authenticate Identity
                  <ArrowRight className="h-4.5 w-4.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-gray-500 mt-8 font-medium">
          Protected by end-to-end JWT encryption. Only authorized employees are allowed.
        </p>
      </div>

      <style>{`
        .grid-bg {
          background-image: 
            radial-gradient(at 50% 50%, rgba(10, 15, 30, 0.5), #060814),
            linear-gradient(rgba(255, 255, 255, 0.007) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.007) 1px, transparent 1px);
          background-size: 100% 100%, 30px 30px, 30px 30px;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 2;
        }
      `}</style>
    </div>
  );
};

export default AdminLoginPage;
