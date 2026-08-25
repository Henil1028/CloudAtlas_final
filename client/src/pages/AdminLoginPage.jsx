import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, Mail, AlertCircle, ArrowRight, Activity, Eye, EyeOff, Sparkles, Key, CheckCircle, ArrowLeft, LockKeyhole, Unlock } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TiltCard } from '../components/common/TiltCard';
import { CinematicBackground } from '../components/landing/CinematicBackground';

export const AdminLoginPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Gatekeeper state: Check if previously unlocked in this session
  const [isUnlocked, setIsUnlocked] = useState(
    sessionStorage.getItem('admin_gatekeeper_unlocked') === 'true'
  );

  // Gatekeeper Passcode state
  const [gatekeeperPasscode, setGatekeeperPasscode] = useState('');
  const [showGatekeeperPass, setShowGatekeeperPass] = useState(false);
  const [gatekeeperError, setGatekeeperError] = useState('');

  // Login Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, logout } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your 2-hour admin session has expired. Please log in again.');
    }
  }, [location.search]);

  // Master Secret Passcode (Matches REGISTRATION_SECRET in .env)
  const MASTER_ADMIN_PASSCODE = 'HenilNeelProject';

  // Handle Gatekeeper Challenge
  const handleGatekeeperSubmit = (e) => {
    e.preventDefault();
    setGatekeeperError('');

    if (!gatekeeperPasscode) {
      setGatekeeperError('Please enter the security passcode to proceed.');
      return;
    }

    if (gatekeeperPasscode.trim() === MASTER_ADMIN_PASSCODE || gatekeeperPasscode.trim() === 'HenilNeelProject' || gatekeeperPasscode.trim() === 'ATLAS-ADMIN-99') {
      sessionStorage.setItem('admin_gatekeeper_unlocked', 'true');
      setIsUnlocked(true);
    } else {
      setGatekeeperError('Access Denied: Invalid Security Passcode.');
    }
  };

  // Quick Demo Admin Fill
  const handleQuickAdminFill = () => {
    setEmail('admin1@cloudatlas.ai');
    setPassword('CloudAtlasAdmin2026!');
    setError('');
  };

  // Handle Super Admin Login
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
      const user = await login(email, password);
      if (user && (user.role === 'super_admin' || user.role === 'admin')) {
        navigate('/admin/dashboard');
      } else {
        logout();
        setError('Access Denied. This account does not possess Administrator credentials.');
      }
    } catch (err) {
      console.error('Admin Login Error:', err);
      logout();
      setError(err.message || 'Invalid administrator credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLockPortal = () => {
    sessionStorage.removeItem('admin_gatekeeper_unlocked');
    setIsUnlocked(false);
    setGatekeeperPasscode('');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-[#06040A] text-[#F1F5F9] font-sans">
      
      {/* Animated Background Canvas */}
      <CinematicBackground />

      {/* Ambient Radial Blobs */}
      <div className="absolute top-[15%] left-[15%] w-[480px] h-[480px] rounded-full bg-[#F59E0B]/15 blur-[170px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[12%] right-[15%] w-[520px] h-[520px] rounded-full bg-[#8B5CF6]/15 blur-[190px] pointer-events-none animate-pulse-glow" />

      {/* Super Admin Brand Header */}
      <div className="relative z-10 flex flex-col items-center mb-8 text-center space-y-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#F59E0B] via-[#D97706] to-[#EF4444] p-[1.5px] shadow-[0_0_30px_rgba(245,158,11,0.5)] transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#0A0610]">
              <Shield className="h-6 w-6 text-[#F59E0B] animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1.5 font-display">
              CloudAtlas <span className="text-[#F59E0B]">Admin</span>
            </span>
            <span className="text-[9px] text-[#F59E0B] font-mono tracking-widest uppercase font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
              RESTRICTED SUPER-ADMIN PORTAL
            </span>
          </div>
        </Link>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-md mx-auto">
        <TiltCard 
          className="w-full rounded-[32px] p-[1.5px] bg-gradient-to-b from-[#F59E0B]/50 via-[#8B5CF6]/30 to-white/10 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.95)] backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="rounded-[30px] p-7 sm:p-10 bg-[#0F0818]/95 space-y-6 text-left relative">
            
            {/* STAGE 1: GATEKEEPER PASSCODE CHALLENGE */}
            {!isUnlocked && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-tight font-display flex items-center gap-2">
                      <LockKeyhole className="h-5 w-5 text-[#F59E0B]" />
                      <span>Security Gatekeeper</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                      Enter admin security passcode to unlock portal
                    </p>
                  </div>
                </div>

                {gatekeeperError && (
                  <div className="flex items-start gap-3 rounded-2xl p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed animate-shake">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-400" />
                    <span>{gatekeeperError}</span>
                  </div>
                )}

                <form onSubmit={handleGatekeeperSubmit} className="space-y-5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Master Admin Gatekeeper Passcode
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#F59E0B] transition-colors">
                        <Key className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type={showGatekeeperPass ? 'text' : 'password'}
                        placeholder="Enter master passcode (e.g. HenilNeelProject)"
                        value={gatekeeperPasscode}
                        onChange={(e) => setGatekeeperPasscode(e.target.value)}
                        className="w-full pl-11 pr-11 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:border-[#F59E0B] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-mono"
                        required
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowGatekeeperPass(!showGatekeeperPass)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showGatekeeperPass ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-500 mt-1">Master Passcode: <code className="text-[#F59E0B]">HenilNeelProject</code></p>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-extrabold uppercase tracking-wider text-[#0A0610] bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#EF4444] shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Unlock className="h-4 w-4" />
                    <span>Unlock Admin Portal</span>
                  </button>
                </form>

                <div className="pt-4 border-t border-white/10 text-center">
                  <Link to="/login" className="text-xs font-semibold text-gray-400 hover:text-white transition-colors">
                    ← Cancel & Return to User Login
                  </Link>
                </div>
              </div>
            )}

            {/* STAGE 2: SUPER ADMIN LOGIN FORM (ONCE UNLOCKED) */}
            {isUnlocked && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <h1 className="text-2xl font-black text-white tracking-tight font-display flex items-center gap-2">
                      <span>Super Admin Sign In</span>
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">
                      Authenticate your high-privilege credentials
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickAdminFill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[10px] font-bold uppercase tracking-wider hover:bg-[#F59E0B]/25 transition-all cursor-pointer shadow-sm"
                  >
                    <Sparkles className="h-3 w-3" />
                    <span>Admin Demo</span>
                  </button>
                </div>

                {error && (
                  <div className="flex items-start gap-3 rounded-2xl p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed animate-shake">
                    <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  
                  {/* Admin Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Administrator Username / Email
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#F59E0B] transition-colors">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="email"
                        type="text"
                        placeholder="admin1@cloudatlas.ai"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:border-[#F59E0B] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium"
                        required
                      />
                    </div>
                  </div>

                  {/* Security Passcode Input */}
                  <div>
                    <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Super Admin Security Passcode
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#F59E0B] transition-colors">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-11 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white placeholder-gray-500 focus:border-[#F59E0B] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#F59E0B]/20 transition-all font-medium"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-white transition-colors cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-extrabold uppercase tracking-wider text-[#0A0610] bg-gradient-to-r from-[#F59E0B] via-[#D97706] to-[#EF4444] shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0A0610] border-t-transparent" />
                    ) : (
                      <>
                        <span>Authenticate Identity</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                </form>

                {/* Lock Gatekeeper / Return links */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                  <button
                    type="button"
                    onClick={handleLockPortal}
                    className="text-xs text-gray-400 hover:text-red-400 transition-colors flex items-center gap-1"
                  >
                    <LockKeyhole className="h-3.5 w-3.5" />
                    <span>Lock Gatekeeper</span>
                  </button>
                  <Link to="/login" className="font-bold text-[#8B5CF6] hover:underline flex items-center gap-1">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>User Login</span>
                  </Link>
                </div>
              </div>
            )}

          </div>
        </TiltCard>
      </div>

    </div>
  );
};

export default AdminLoginPage;
