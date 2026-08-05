import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, Lock, AlertCircle, ArrowRight, User, Key, CheckCircle, 
  Eye, EyeOff, Sparkles, Shield, Activity, ChevronRight, Check, X, 
  Zap, LogIn, UserPlus, ArrowUpRight, Phone
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TiltCard } from '../components/common/TiltCard';
import { forgotPassword, verifyOtp, verifyOtpOnly } from '../services/authService';
import { CinematicBackground } from '../components/landing/CinematicBackground';

export const AuthPage = ({ initialMode = 'login' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login, register, verifyRegistration, resendRegistration, logout, loading } = useAuth();

  // Mode state: 'login' | 'register'
  const [mode, setMode] = useState(
    location.pathname === '/register' ? 'register' : initialMode
  );

  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('register');
    } else if (location.pathname === '/login') {
      setMode('login');
    }
  }, [location.pathname]);

  const handleModeSwitch = (newMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    setLocalError('');
    navigate(newMode === 'register' ? '/register' : '/login', { replace: true });
  };

  // Shared Form Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');

  // Register Specific Inputs
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [secretCode, setSecretCode] = useState('');

  // OTP Verification States
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(120);
  const [verifying, setVerifying] = useState(false);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpInputs, setForgotOtpInputs] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [forgotCountdown, setForgotCountdown] = useState(0);

  const from = location.state?.from?.pathname || '/dashboard';

  // Countdown timer for Register OTP
  useEffect(() => {
    if (!showOtp || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtp, countdown]);

  // Forgot Password Countdown
  useEffect(() => {
    let interval = null;
    if (forgotCountdown > 0) {
      interval = setInterval(() => {
        setForgotCountdown((c) => c - 1);
      }, 1000);
    } else if (forgotCountdown === 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [forgotCountdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Password strength score
  const getPasswordStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-gray-700', segments: 0 };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[a-z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 25, label: 'Weak', color: 'bg-red-500', segments: 1 };
    if (score === 3 || score === 4) return { score: 65, label: 'Good', color: 'bg-amber-500', segments: 3 };
    return { score: 100, label: 'Strong & Ultra-Secure', color: 'bg-[#22C55E]', segments: 4 };
  };

  const strength = getPasswordStrength(password);

  // Quick Demo fill
  const handleQuickDemoFill = () => {
    setEmail('devops@cloudatlas.io');
    setPassword('DemoPass123!');
    setLocalError('');
  };

  // Sign In Handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please enter both your email address and password');
      return;
    }

    try {
      const user = await login(email, password);
      if (user && user.role === 'super_admin') {
        if (logout) logout();
        setLocalError('Super Admin accounts must use the dedicated Super Admin Portal (/admin/login).');
        return;
      }
      setEmail('');
      setPassword('');
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Invalid email address or password.');
    }
  };

  // Register Handler
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!name || !email || !phoneNumber || !password || !confirmPassword) {
      setLocalError('Please fill in all required fields');
      return;
    }

    const cleanPhone = phoneNumber.replace(/\D/g, '');
    if (cleanPhone.length !== 10) {
      setLocalError('Phone number must be exactly 10 digits.');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setLocalError('Password must be at least 8 characters long');
      return;
    }

    try {
      const res = await register(name, email, cleanPhone, password, confirmPassword, secretCode);
      if (res && res.status === 'pending_verification') {
        setShowOtp(true);
        setCountdown(120);
        if (res.devOtp) {
          setOtp(res.devOtp);
          const digits = res.devOtp.split('');
          setOtpInputs(digits.concat(Array(6 - digits.length).fill('')));
        }
        return;
      }
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please check your inputs.');
    }
  };

  // OTP Change handlers
  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otpInputs];
    newOtp[index] = digit;
    setOtpInputs(newOtp);
    setOtp(newOtp.join(''));

    if (digit && index < 5) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, 6);
    const newOtp = ['', '', '', '', '', ''];
    digits.forEach((d, idx) => {
      if (idx < 6) newOtp[idx] = d;
    });
    setOtpInputs(newOtp);
    setOtp(newOtp.join(''));
    const focusIdx = Math.min(digits.length, 5);
    const focusInput = document.getElementById(`auth-otp-${focusIdx}`);
    if (focusInput) focusInput.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLocalError('');
    const finalOtp = otp || otpInputs.join('');
    if (!finalOtp || finalOtp.trim().length !== 6) {
      setLocalError('Please enter a valid 6-digit OTP code.');
      return;
    }
    setVerifying(true);
    try {
      await verifyRegistration(email, finalOtp.trim());
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'OTP verification failed. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    setLocalError('');
    try {
      const res = await resendRegistration(email);
      setCountdown(120);
      if (res && res.devOtp) {
        setOtp(res.devOtp);
        const digits = res.devOtp.split('');
        setOtpInputs(digits.concat(Array(6 - digits.length).fill('')));
      }
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP.');
    }
  };

  // Forgot Password Handlers
  const handleSendForgotOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) {
      setForgotError('Please enter your registered email address');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotSuccess(res.message || 'Verification code dispatched to your email.');
      setForgotStep(2);
      setForgotCountdown(120);
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Failed to send verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyForgotOtpOnly = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotOtp || forgotOtp.length !== 6) {
      setForgotError('Please enter the complete 6-digit verification code.');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyOtpOnly(forgotEmail, forgotOtp);
      setForgotSuccess(res.message || 'OTP verified successfully. Create a new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Invalid or expired verification code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotOtp || !newPassword || !confirmNewPassword) {
      setForgotError('Please fill in all required fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyOtp(forgotEmail, forgotOtp, newPassword);
      setForgotSuccess(res.message || 'Password reset successfully! Redirecting...');
      setTimeout(() => {
        setShowForgotModal(false);
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Failed to reset password.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12 overflow-hidden bg-[#040806] text-[#F1F5F9] font-sans">
      
      {/* Dynamic Animated Cosmic Background Canvas */}
      <CinematicBackground />

      {/* Atmospheric Ambient Glow Blobs */}
      <div className="absolute top-[18%] left-[20%] w-[480px] h-[480px] rounded-full bg-[#22C55E]/15 blur-[160px] pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-[15%] right-[20%] w-[520px] h-[520px] rounded-full bg-[#06B6D4]/15 blur-[180px] pointer-events-none animate-pulse-glow" />

      {/* Brand Header */}
      <div className="relative z-10 flex flex-col items-center mb-8 text-center space-y-3">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#16A34A] via-[#22C55E] to-[#4ADE80] p-[1.5px] shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-transform group-hover:scale-105">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#07130F]">
              <Activity className="h-6 w-6 text-[#22C55E] animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-1.5 font-display">
              CloudAtlas <span className="text-[#22C55E]">AI</span>
            </span>
            <span className="text-[10px] text-gray-400 font-mono tracking-widest uppercase">Enterprise Cloud Intelligence</span>
          </div>
        </Link>
      </div>

      {/* Center Floating Glass Card */}
      <div className="relative z-10 w-full max-w-xl mx-auto">
        <TiltCard 
          className="w-full rounded-[32px] p-[1.5px] bg-gradient-to-b from-[#22C55E]/40 via-[#06B6D4]/25 to-white/10 border border-white/10 shadow-[0_30px_80px_rgba(0,0,0,0.9)] backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="rounded-[30px] p-7 sm:p-10 bg-[#091510]/95 space-y-7 text-left relative">
            
            {/* SEGMENTED FLOATING PILL TOGGLE */}
            <div className="relative flex bg-[#040907] p-1.5 rounded-2xl border border-white/10 shadow-inner">
              <button
                type="button"
                onClick={() => handleModeSwitch('login')}
                className={`relative flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-colors z-10 cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'login' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode === 'login' && (
                  <motion.div
                    layoutId="authCardTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <LogIn className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Sign In</span>
              </button>

              <button
                type="button"
                onClick={() => handleModeSwitch('register')}
                className={`relative flex-1 py-3 text-xs font-extrabold uppercase tracking-wider transition-colors z-10 cursor-pointer flex items-center justify-center gap-2 ${
                  mode === 'register' ? 'text-white' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {mode === 'register' && (
                  <motion.div
                    layoutId="authCardTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] rounded-xl shadow-[0_0_25px_rgba(34,197,94,0.5)]"
                    transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                  />
                )}
                <UserPlus className="h-4 w-4 relative z-10" />
                <span className="relative z-10">Create Account</span>
              </button>
            </div>

            {/* Title Header */}
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                  {mode === 'login' ? 'Welcome Back' : 'Create Console Account'}
                </h1>
                <p className="text-xs text-gray-400 mt-1">
                  {mode === 'login' 
                    ? 'Authenticate credentials to enter FinOps console' 
                    : 'Setup your multi-cloud administrative profile'
                  }
                </p>
              </div>

              {mode === 'login' && (
                <button
                  type="button"
                  onClick={handleQuickDemoFill}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#22C55E]/15 border border-[#22C55E]/30 text-[#4ADE80] text-[10px] font-bold uppercase tracking-wider hover:bg-[#22C55E]/25 transition-all cursor-pointer shadow-sm"
                >
                  <Sparkles className="h-3 w-3" />
                  <span>Demo Fill</span>
                </button>
              )}
            </div>

            {localError && (
              <div className="flex items-start gap-3 rounded-2xl p-4 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium leading-relaxed animate-shake">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-400" />
                <span>{localError}</span>
              </div>
            )}

            {/* ANIMATED MODE TRANSITION CONTENT */}
            <AnimatePresence mode="wait">
              
              {/* SIGN IN MODE */}
              {mode === 'login' && (
                <motion.form
                  key="loginForm"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleLoginSubmit}
                  className="space-y-5"
                >
                  {/* Email Input */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                      Work Email Address
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E] transition-colors">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="username"
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 transition-all font-medium"
                        placeholder="devops@company.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300">
                        Security Passcode
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotModal(true);
                          setForgotStep(1);
                          setForgotEmail(email);
                          setForgotOtp('');
                          setForgotOtpInputs(['', '', '', '', '', '']);
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setForgotError('');
                          setForgotSuccess('');
                        }}
                        className="text-xs font-semibold text-[#4ADE80] hover:underline cursor-pointer"
                      >
                        Forgot Passcode?
                      </button>
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E] transition-colors">
                        <Lock className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:bg-white/[0.06] focus:outline-none focus:ring-2 focus:ring-[#22C55E]/20 transition-all font-medium"
                        placeholder="••••••••"
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

                  {/* Sign In Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-extrabold uppercase tracking-wider text-[#07130F] bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#07130F] border-t-transparent" />
                    ) : (
                      <>
                        <span>Sign In to Console</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* CREATE ACCOUNT MODE */}
              {mode === 'register' && (
                <motion.div
                  key="registerContainer"
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {showOtp ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-5">
                      <p className="text-xs text-gray-300 leading-relaxed text-center">
                        A 6-digit verification code was sent to <strong className="text-[#4ADE80]">{email}</strong>. Check your inbox or dev log.
                      </p>

                      <div className="text-center py-2.5 px-3 rounded-2xl text-xs bg-white/[0.02] border border-[#22C55E]/20">
                        {countdown > 0 ? (
                          <span className="text-gray-300 font-mono text-xs">
                            Code expires in: <strong className="text-[#4ADE80]">{formatTime(countdown)}</strong>
                          </span>
                        ) : (
                          <span className="text-red-400 text-xs font-bold">
                            Code expired (2 min limit) — Click Resend Code
                          </span>
                        )}
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-2">
                          6-Digit OTP Code
                        </label>
                        <div className="flex gap-2.5">
                          {otpInputs.map((digit, idx) => (
                            <input
                              key={idx}
                              id={`auth-otp-${idx}`}
                              type="text"
                              inputMode="numeric"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleOtpChange(idx, e.target.value)}
                              onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                              onPaste={idx === 0 ? handleOtpPaste : undefined}
                              disabled={countdown === 0}
                              className="w-full aspect-square text-center font-mono text-xl font-bold rounded-2xl bg-white/[0.03] border border-white/20 text-white focus:border-[#4ADE80] focus:outline-none"
                            />
                          ))}
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={verifying || countdown === 0}
                        className="w-full py-4 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-[#07130F] bg-gradient-to-r from-[#16A34A] to-[#4ADE80] shadow-md hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
                      >
                        {verifying ? (
                          <div className="h-5 w-5 mx-auto animate-spin rounded-full border-2 border-[#07130F] border-t-transparent" />
                        ) : (
                          <span>Verify & Activate Account</span>
                        )}
                      </button>

                      <div className="flex items-center justify-between text-xs pt-2">
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={countdown > 0}
                          className="text-[#4ADE80] hover:underline cursor-pointer disabled:opacity-50 disabled:no-underline font-semibold"
                        >
                          {countdown > 0 ? `Resend in ${formatTime(countdown)}` : '🔄 Resend Code'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowOtp(false)}
                          className="text-gray-400 hover:text-white"
                        >
                          Edit Information
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Registration Input Fields Grid */
                    <form onSubmit={handleRegisterSubmit} className="space-y-4">
                      
                      {/* Grid Row 1: Full Name & Email */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                            Full Name
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E]">
                              <User className="h-4 w-4" />
                            </div>
                            <input
                              type="text"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:bg-white/[0.06] focus:outline-none transition-all font-medium"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                            Work Email Address
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E]">
                              <Mail className="h-4 w-4" />
                            </div>
                            <input
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:bg-white/[0.06] focus:outline-none transition-all font-medium"
                              placeholder="john@company.com"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Row 2: Phone & Secret Key */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                            Phone Number (10 Digits)
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 font-mono text-xs">
                              +1
                            </div>
                            <input
                              type="tel"
                              maxLength={10}
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:bg-white/[0.06] focus:outline-none font-mono transition-all"
                              placeholder="9876543210"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                            Invitation Key (Optional)
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E]">
                              <Key className="h-4 w-4" />
                            </div>
                            <input
                              type="text"
                              value={secretCode}
                              onChange={(e) => setSecretCode(e.target.value)}
                              className="w-full pl-10 pr-4 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:bg-white/[0.06] focus:outline-none font-mono transition-all"
                              placeholder="ATLAS-ADMIN-99"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Grid Row 3: Password & Confirm Password */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                            Password
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E]">
                              <Lock className="h-4 w-4" />
                            </div>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full pl-9 pr-9 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:outline-none transition-all font-medium"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-300 mb-1.5">
                            Confirm Password
                          </label>
                          <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#22C55E]">
                              <Lock className="h-4 w-4" />
                            </div>
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="w-full pl-9 pr-9 py-3 rounded-2xl text-xs sm:text-sm text-white placeholder-gray-500 bg-white/[0.03] border border-white/10 focus:border-[#22C55E] focus:outline-none transition-all font-medium"
                              placeholder="••••••••"
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white cursor-pointer"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password Segmented Strength Bar */}
                      {password && (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex justify-between items-center text-[10px] font-mono">
                            <span className="text-gray-400">Security Score</span>
                            <span className={`font-bold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                          </div>
                          <div className="grid grid-cols-4 gap-1.5">
                            {[1, 2, 3, 4].map((seg) => (
                              <div 
                                key={seg} 
                                className={`h-1.5 rounded-full transition-all duration-300 ${
                                  seg <= strength.segments ? strength.color : 'bg-white/10'
                                }`} 
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Register Submit Button */}
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-4 text-xs font-extrabold uppercase tracking-wider text-[#07130F] bg-gradient-to-r from-[#16A34A] via-[#22C55E] to-[#4ADE80] shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_35px_rgba(34,197,94,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50 mt-4"
                      >
                        {loading ? (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#07130F] border-t-transparent" />
                        ) : (
                          <>
                            <span>Register Console Account</span>
                            <ArrowRight className="h-4 w-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Card Footer Links */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
              <span className="flex items-center gap-1.5">
                <Shield className="h-3.5 w-3.5 text-[#22C55E]" />
                <span>Zero-Trust Encryption</span>
              </span>
              <Link to="/admin/login" className="font-bold text-[#06B6D4] hover:underline flex items-center gap-1">
                <span>Super Admin</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

          </div>
        </TiltCard>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#040806]/85 backdrop-blur-md"
            onClick={() => setShowForgotModal(false)}
          />
          
          <div className="relative z-10 w-full max-w-md rounded-3xl p-[1.5px] bg-gradient-to-b from-[#4ADE80]/40 to-white/10 border border-white/10 shadow-2xl animate-modal-enter">
            <div className="rounded-[28px] p-6 sm:p-8 bg-[#091510] space-y-5 text-left">
              
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-base font-bold text-white flex items-center gap-2 font-display">
                  <Key className="h-4 w-4 text-[#4ADE80]" />
                  Reset Passcode
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {forgotError && (
                <div className="flex items-start gap-2.5 rounded-2xl p-3.5 bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-medium">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-red-400" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="flex items-start gap-2.5 rounded-2xl p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
                  <CheckCircle className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleSendForgotOtp} className="space-y-4">
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Enter your registered email address. We will dispatch a 6-digit OTP code to verify your identity.
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Registered Email
                    </label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl text-sm text-white bg-white/[0.03] border border-white/10 focus:border-[#4ADE80] focus:outline-none"
                      placeholder="name@company.com"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#07130F] bg-gradient-to-r from-[#16A34A] to-[#4ADE80] shadow-md hover:scale-[1.01] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Dispatching OTP...' : 'Send Verification OTP'}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyForgotOtpOnly} className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Enter the 6-digit code sent to <strong className="text-[#4ADE80]">{forgotEmail}</strong>
                  </p>

                  <div className="text-center py-2.5 px-3 rounded-2xl text-xs bg-white/[0.02] border border-white/10">
                    {forgotCountdown > 0 ? (
                      <span className="text-gray-300 font-mono text-xs">
                        Code expires in: <strong className="text-[#4ADE80]">{formatTime(forgotCountdown)}</strong>
                      </span>
                    ) : (
                      <span className="text-red-400 text-xs font-bold">
                        Code expired (2 min limit) — Request a new code
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                      6-Digit OTP Code
                    </label>
                    <div className="flex gap-2">
                      {forgotOtpInputs.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`forgot-otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 1);
                            const copy = [...forgotOtpInputs];
                            copy[idx] = val;
                            setForgotOtpInputs(copy);
                            setForgotOtp(copy.join(''));
                            if (val && idx < 5) {
                              const next = document.getElementById(`forgot-otp-${idx + 1}`);
                              if (next) next.focus();
                            }
                          }}
                          disabled={forgotCountdown === 0}
                          className="w-full aspect-square text-center font-mono text-lg font-bold rounded-2xl bg-white/[0.03] border border-white/20 text-white focus:border-[#4ADE80] focus:outline-none"
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || forgotCountdown === 0}
                    className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#07130F] bg-gradient-to-r from-[#16A34A] to-[#4ADE80] cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setForgotStep(1)}
                      className="flex-1 py-2.5 rounded-2xl text-xs text-gray-400 bg-white/5 border border-white/10 hover:text-white"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSendForgotOtp}
                      disabled={forgotCountdown > 0}
                      className="flex-1 py-2.5 rounded-2xl text-xs text-[#4ADE80] bg-white/5 border border-white/10 disabled:opacity-50 font-semibold"
                    >
                      {forgotCountdown > 0 ? `Resend (${forgotCountdown}s)` : 'Resend Code'}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs text-gray-300">
                    Create a new strong password for your account.
                  </p>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3.5 rounded-2xl text-sm text-white bg-white/[0.03] border border-white/10 focus:border-[#4ADE80] focus:outline-none"
                        placeholder="••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-2xl text-sm text-white bg-white/[0.03] border border-white/10 focus:border-[#4ADE80] focus:outline-none"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider text-[#07130F] bg-gradient-to-r from-[#16A34A] to-[#4ADE80] cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AuthPage;
