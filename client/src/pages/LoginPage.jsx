import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, X, Key, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TiltCard } from '../components/common/TiltCard';
import { forgotPassword, verifyOtp, verifyOtpOnly } from '../services/authService';
import { CinematicBackground } from '../components/landing/CinematicBackground';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (countdown === 0 && interval) {
      clearInterval(interval);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [countdown]);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSendOtp = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!forgotEmail) {
      setForgotError('Please enter your email address');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPassword(forgotEmail);
      setForgotSuccess(res.message || 'OTP sent successfully. Check your email or server console!');
      setForgotStep(2);
      setCountdown(120); // 2 minutes (120 seconds)
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Failed to send OTP. Please check email.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleVerifyOtpOnly = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!otp) {
      setForgotError('Please enter the verification code');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyOtpOnly(forgotEmail, otp);
      setForgotSuccess(res.message || 'OTP verified successfully. Please enter your new password.');
      setForgotStep(3);
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Failed to verify OTP. Please check code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotError('');
    setForgotSuccess('');
    if (!otp || !newPassword || !confirmNewPassword) {
      setForgotError('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    setForgotLoading(true);
    try {
      const res = await verifyOtp(forgotEmail, otp, newPassword);
      setForgotSuccess(res.message || 'Password reset successfully! Redirecting...');
      setTimeout(() => {
        setShowForgotModal(false);
      }, 2000);
    } catch (err) {
      setForgotError(err.response?.data?.message || err.message || 'Failed to reset password. Please check OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
      setLocalError('Please fill in all fields');
      return;
    }

    try {
      const user = await login(email, password);
      // Super Admin must use dedicated /admin/login URL
      if (user && user.role === 'super_admin') {
        if (logout) logout();
        setLocalError('Super Admin accounts are not permitted on regular login. Please use the dedicated Admin Portal (/admin/login).');
        return;
      }
      setEmail('');
      setPassword('');
      navigate(from, { replace: true });
    } catch (err) {
      setLocalError(err.message || 'Invalid email or password');
    }
  };

  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const otpRefs = [];

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otpInputs];
    newOtp[index] = digit;
    setOtpInputs(newOtp);
    setOtp(newOtp.join(''));

    if (digit && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text').match(/\d/g) || []).slice(0, 6);
    const newOtp = [...otpInputs];
    digits.forEach((d, idx) => {
      if (idx < 6) newOtp[idx] = d;
    });
    setOtpInputs(newOtp);
    setOtp(newOtp.join(''));
    const focusIdx = Math.min(digits.length, 5);
    const focusInput = document.getElementById(`otp-${focusIdx}`);
    if (focusInput) focusInput.focus();
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#07130F]">
      {/* Animated Cinematic Background */}
      <CinematicBackground />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and header */}
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="flex items-center gap-2.5 group mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.4" className="w-6 h-6">
              <circle cx="12" cy="12" r="9.2"/>
              <path d="M12 2.8v18.4M2.8 12h18.4M6 6.2c2 2 4 2.8 6 2.8s4-.8 6-2.8M6 17.8c2-2 4-2.8 6-2.8s4 .8 6 2.8"/>
            </svg>
            <span className="font-serif text-sm tracking-[0.14em] uppercase text-[#22C55E] font-medium">
              Cloud_Atlas
            </span>
          </Link>
          <p className="text-[#94A3B8] text-xs">Secure access to your prediction panel</p>
        </div>

        <TiltCard className="relative w-full rounded-[18px] p-[1px]"
          style={{
            background: 'linear-gradient(180deg, rgba(34,197,94,0.18), rgba(34,197,94,0.08))',
            boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)'
          }}
        >
          <div className="rounded-[17px] p-8"
            style={{
              background: 'linear-gradient(180deg, #0D1D17, #07130F)'
            }}
          >
            <h1 className="font-serif text-2xl font-semibold text-center mb-1"
              style={{ color: '#ffffff', letterSpacing: '0.01em' }}
            >
              Verify it's you
            </h1>
            <p className="text-center text-xs mb-6" style={{ color: '#8a97a8' }}>
              Sign in to your administrator console
            </p>

            {localError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5 text-xs"
                style={{ background: 'rgba(224,138,138,0.1)', border: '1px solid rgba(224,138,138,0.2)', color: '#e08a8a' }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{localError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8a97a8' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="username"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(34,197,94,0.22)',
                      color: '#ffffff',
                      caretColor: '#22C55E'
                    }}
                    placeholder="admin@cloudatlas.io"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#22C55E';
                      e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.15), 0 0 18px rgba(34,197,94,0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(34,197,94,0.22)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotModal(true);
                      setForgotStep(1);
                      setForgotEmail('');
                      setOtp('');
                      setOtpInputs(['', '', '', '', '', '']);
                      setNewPassword('');
                      setConfirmNewPassword('');
                      setForgotError('');
                      setForgotSuccess('');
                    }}
                    className="text-xs font-semibold bg-transparent border-none cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: '#4ADE80' }}
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    className="block w-full pl-10 pr-4 py-3 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(34,197,94,0.22)',
                      color: '#ffffff',
                      caretColor: '#22C55E'
                    }}
                    placeholder="••••••••"
                    required
                    onFocus={(e) => {
                      e.target.style.borderColor = '#22C55E';
                      e.target.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.15), 0 0 18px rgba(34,197,94,0.25)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = 'rgba(34,197,94,0.22)';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>
              </div>

              {/* Route line animation */}
              <div className="relative h-3 mx-0.5">
                <svg viewBox="0 0 300 14" preserveAspectRatio="none" className="w-full h-full block overflow-visible">
                  <path
                    d="M4 7 L296 7"
                    style={{
                      fill: 'none',
                      stroke: '#22C55E',
                      strokeWidth: 1.5,
                      strokeLinecap: 'round',
                      opacity: 0.5
                    }}
                  />
                </svg>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 rounded-[10px] py-3.5 text-sm font-bold tracking-wider border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: 'linear-gradient(180deg, #4ADE80, #22C55E)',
                  color: '#07130F'
                }}
              >
                {loading ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#07130F] border-t-transparent" />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="flex items-center justify-center gap-1.5 mt-5 text-xs" style={{ color: '#94A3B8' }}>
              <span>Don't have an account?</span>
              <Link to="/register" className="font-semibold no-underline transition-opacity hover:opacity-80"
                style={{ color: '#4ADE80' }}>
                Register
              </Link>
            </div>
          </div>
        </TiltCard>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(7,13,22,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowForgotModal(false)}
          />
          <div className="relative z-10 w-full max-w-md rounded-[18px] p-[1px] animate-modal-enter"
            style={{
              background: 'linear-gradient(180deg, rgba(201,162,75,0.18), rgba(201,162,75,0.08))',
              boxShadow: '0 30px 60px -20px rgba(0,0,0,0.6)'
            }}
          >
            <div className="rounded-[17px] p-8"
              style={{
                background: 'linear-gradient(180deg, #0f1c2b, #070d16)'
              }}
            >
              <div className="flex items-center justify-between pb-4 mb-6"
                style={{ borderBottom: '1px solid rgba(201,162,75,0.15)' }}
              >
                <h3 className="text-lg font-serif font-semibold flex items-center gap-2" style={{ color: '#f2ede3' }}>
                  <Key className="h-4 w-4" style={{ color: '#c9a24b' }} />
                  Reset Credentials
                </h3>
                <button
                  onClick={() => setShowForgotModal(false)}
                  className="p-1.5 rounded-lg transition-colors cursor-pointer border-none bg-transparent"
                  style={{ color: '#8a97a8' }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {forgotError && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs"
                  style={{ background: 'rgba(224,138,138,0.1)', border: '1px solid rgba(224,138,138,0.2)', color: '#e08a8a' }}
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotSuccess && (
                <div className="mb-4 flex items-start gap-2.5 rounded-xl p-3.5 text-xs"
                  style={{ background: 'rgba(142,201,161,0.1)', border: '1px solid rgba(142,201,161,0.2)', color: '#8ec9a1' }}
                >
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{forgotSuccess}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <p className="text-xs leading-relaxed" style={{ color: '#8a97a8' }}>
                    Enter your registered email address below. A 6-digit verification code will be sent to reset your password.
                  </p>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8a97a8' }}>
                      Email Address
                    </label>
                    <input
                      type="text"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="block w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(201,162,75,0.22)',
                        color: '#f2ede3',
                        caretColor: '#c9a24b'
                      }}
                      placeholder="name@company.com"
                      required
                      onFocus={(e) => {
                        e.target.style.borderColor = '#c9a24b';
                        e.target.style.boxShadow = '0 0 0 3px rgba(201,162,75,0.15)';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = 'rgba(201,162,75,0.22)';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full flex items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-bold border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(180deg, #e4c77a, #c9a24b)',
                      color: '#171006'
                    }}
                  >
                    {forgotLoading ? 'Sending OTP...' : 'Send Verification OTP'}
                  </button>
                </form>
              )}

              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOtpOnly} className="space-y-4">
                  <p className="text-xs leading-relaxed" style={{ color: '#8a97a8' }}>
                    Enter the 6-digit code sent to <strong style={{ color: '#e4c77a' }}>{forgotEmail}</strong>
                  </p>

                  <div className="text-center py-2.5 px-3 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,162,75,0.15)' }}
                  >
                    {countdown > 0 ? (
                      <span className="font-semibold flex items-center justify-center gap-1.5" style={{ color: '#8a97a8' }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#c9a24b', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        Code expires in: <strong style={{ color: '#c9a24b', fontFamily: 'Space Grotesk, monospace' }}>{`${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')}`}</strong>
                      </span>
                    ) : (
                      <span className="font-bold flex items-center justify-center gap-1.5" style={{ color: '#e08a8a' }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                        Code expired (2 min limit) — Request a new code below
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8a97a8' }}>
                      Verification Code
                    </label>
                    <div className="flex justify-between gap-2">
                      {otpInputs.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`otp-${idx}`}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          value={digit}
                          onChange={(e) => handleOtpChange(idx, e.target.value)}
                          onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                          onPaste={idx === 0 ? handleOtpPaste : undefined}
                          disabled={countdown === 0}
                          className="w-full aspect-square text-center font-mono text-lg font-bold rounded-xl outline-none transition-all"
                          style={{
                            background: digit ? 'rgba(201,162,75,0.06)' : 'rgba(255,255,255,0.02)',
                            border: digit ? '1px solid #e4c77a' : '1px solid rgba(201,162,75,0.22)',
                            color: '#f2ede3',
                            caretColor: '#c9a24b'
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = '#c9a24b';
                            e.target.style.boxShadow = '0 0 0 3px rgba(201,162,75,0.15), 0 0 18px rgba(201,162,75,0.25)';
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = digit ? '#e4c77a' : 'rgba(201,162,75,0.22)';
                            e.target.style.boxShadow = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || countdown === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-bold border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(180deg, #e4c77a, #c9a24b)',
                      color: '#171006'
                    }}
                  >
                    {forgotLoading ? 'Verifying...' : 'Verify Code'}
                  </button>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(1);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      className="flex-1 py-2.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all border-none"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(201,162,75,0.15)',
                        color: '#8a97a8'
                      }}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={countdown > 0}
                      className="flex-1 py-2.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed border-none"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(201,162,75,0.15)',
                        color: countdown > 0 ? '#8a97a8' : '#e4c77a'
                      }}
                    >
                      {countdown > 0 ? `Resend (${String(Math.floor(countdown / 60)).padStart(2, '0')}:${String(countdown % 60).padStart(2, '0')})` : '🔄 Resend OTP'}
                    </button>
                  </div>
                </form>
              )}

              {forgotStep === 3 && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-xs leading-relaxed" style={{ color: '#8a97a8' }}>
                    Enter your new password below.
                  </p>

                  <div className="text-center py-2.5 px-3 rounded-xl text-xs"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,162,75,0.15)' }}
                  >
                    {countdown > 0 ? (
                      <span className="font-semibold flex items-center justify-center gap-1.5" style={{ color: '#8a97a8' }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: '#c9a24b', animation: 'pulse 1.5s ease-in-out infinite' }} />
                        Session expires in: <strong style={{ color: '#c9a24b' }}>{countdown}s</strong>
                      </span>
                    ) : (
                      <span className="font-bold flex items-center justify-center gap-1.5" style={{ color: '#e08a8a' }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                        Session expired — request a new code
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8a97a8' }}>
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={countdown === 0}
                      className="block w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(201,162,75,0.22)',
                        color: '#f2ede3',
                        caretColor: '#c9a24b'
                      }}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#8a97a8' }}>
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      disabled={countdown === 0}
                      className="block w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                      style={{
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(201,162,75,0.22)',
                        color: '#f2ede3',
                        caretColor: '#c9a24b'
                      }}
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading || countdown === 0}
                    className="w-full flex items-center justify-center gap-2 rounded-[10px] py-3 text-sm font-bold border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(180deg, #e4c77a, #c9a24b)',
                      color: '#171006'
                    }}
                  >
                    {forgotLoading ? 'Resetting...' : 'Reset Password'}
                  </button>

                  <div className="flex gap-3 mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotStep(2);
                        setForgotError('');
                        setForgotSuccess('');
                      }}
                      className="flex-1 py-2.5 rounded-[10px] text-xs font-semibold cursor-pointer transition-all border-none"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(201,162,75,0.15)',
                        color: '#8a97a8'
                      }}
                    >
                      Back
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
