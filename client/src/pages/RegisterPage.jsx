import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, AlertCircle, ArrowRight, User, Key } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { TiltCard } from '../components/common/TiltCard';
import { CinematicBackground } from '../components/landing/CinematicBackground';

export const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [localError, setLocalError] = useState('');
  const [preferredTheme, setPreferredTheme] = useState('neon-noir-theme');
  const [saveTheme, setSaveTheme] = useState(true);
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpInputs, setOtpInputs] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(120); // 2 minutes (120 seconds)
  const [verifying, setVerifying] = useState(false);
  const { register, verifyRegistration, resendRegistration, loading } = useAuth();
  const navigate = useNavigate();

  // 2-minute countdown timer effect
  useEffect(() => {
    if (!showOtp || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtp, countdown]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleOtpChange = (index, value) => {
    const digit = value.replace(/[^0-9]/g, '').slice(0, 1);
    const newOtp = [...otpInputs];
    newOtp[index] = digit;
    setOtpInputs(newOtp);
    const combined = newOtp.join('');
    setOtp(combined);

    if (digit && index < 5) {
      const nextInput = document.getElementById(`reg-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpInputs[index] && index > 0) {
      const prevInput = document.getElementById(`reg-otp-${index - 1}`);
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
    const focusInput = document.getElementById(`reg-otp-${focusIdx}`);
    if (focusInput) focusInput.focus();
  };

  const handleSubmit = async (e) => {
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
        setCountdown(120); // Reset 2 min timer
        if (res.devOtp) {
          setOtp(res.devOtp);
          const digits = res.devOtp.split('');
          setOtpInputs(digits.concat(Array(6 - digits.length).fill('')));
        }
        return;
      }
      if (saveTheme) {
        localStorage.setItem('console-theme', preferredTheme);
      } else {
        localStorage.removeItem('console-theme');
      }
      navigate('/dashboard');
    } catch (err) {
      setLocalError(err.message || 'Registration failed. Please check your inputs.');
    }
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
      if (saveTheme) {
        localStorage.setItem('console-theme', preferredTheme);
      }
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
      setCountdown(120); // Reset 2 min countdown on resend
      if (res && res.devOtp) {
        setOtp(res.devOtp);
        const digits = res.devOtp.split('');
        setOtpInputs(digits.concat(Array(6 - digits.length).fill('')));
      }
      setLocalError('');
    } catch (err) {
      setLocalError(err.message || 'Failed to resend OTP.');
    }
  };

  const themeOptions = [
    {
      id: 'warm-editorial-theme',
      name: 'Cream Luxury',
      desc: 'Warm Editorial',
      colors: ['#F5F0E8', '#2C1810', '#B47850']
    },
    {
      id: 'neon-noir-theme',
      name: 'Neon Noir',
      desc: 'Midnight & Cyan',
      colors: ['#0A0015', '#7B2FFF', '#00D4FF']
    },
    {
      id: 'deep-ocean-theme',
      name: 'Deep Ocean',
      desc: 'Bioluminescent',
      colors: ['#020C1B', '#00D4FF', '#00FFA3']
    },
    {
      id: 'obsidian-gold-theme',
      name: 'Obsidian Gold',
      desc: 'Ultra Premium',
      colors: ['#0D0D0D', '#D4AF37', '#2A2A2A']
    }
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-[#07130F]">
      {/* Animated Cinematic Background */}
      <CinematicBackground />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md my-8">
        {/* Logo and header */}
        <div className="flex flex-col items-center mb-6">
          <Link to="/" className="flex items-center gap-2.5 group mb-4">
            <svg viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="1.4" className="w-6 h-6">
              <circle cx="12" cy="12" r="9.2"/>
              <path d="M12 2.8v18.4M2.8 12h18.4M6 6.2c2 2 4 2.8 6 2.8s4-.8 6-2.8M6 17.8c2-2 4-2.8 6-2.8s4 .8 6 2.8"/>
            </svg>
            <span className="font-serif text-sm tracking-[0.14em] uppercase text-[#22C55E] font-medium">
              Cloud_Atlas
            </span>
          </Link>
          <p className="text-[#94A3B8] text-xs">Create your multi-cloud diagnostic console account</p>
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
              Create Account
            </h1>
            <p className="text-center text-xs mb-6" style={{ color: '#94A3B8' }}>
              Register your administrator console
            </p>

            {localError && (
              <div className="mb-5 flex items-start gap-2.5 rounded-xl p-3.5 text-xs"
                style={{ background: 'rgba(224,138,138,0.1)', border: '1px solid rgba(224,138,138,0.2)', color: '#e08a8a' }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{localError}</span>
              </div>
            )}

            {showOtp && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <p className="text-xs text-center" style={{ color: '#94A3B8', lineHeight: 1.6 }}>
                  We've sent a 6-digit verification code to <span style={{ color: '#4ADE80', fontWeight: 600 }}>{email}</span>. Please check your inbox or server log.
                </p>

                {/* 2-Minute Timer Display Badge */}
                <div className="text-center py-2.5 px-3 rounded-xl text-xs"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(74,222,128,0.2)' }}
                >
                  {countdown > 0 ? (
                    <span className="font-semibold flex items-center justify-center gap-2" style={{ color: '#94A3B8' }}>
                      <span className="inline-block w-2 h-2 rounded-full" style={{ background: '#4ADE80', animation: 'pulse 1.5s ease-in-out infinite' }} />
                      Code expires in: <strong style={{ color: '#4ADE80', fontFamily: 'Space Grotesk, monospace', fontSize: '13px' }}>{formatTime(countdown)}</strong>
                    </span>
                  ) : (
                    <span className="font-bold flex items-center justify-center gap-1.5" style={{ color: '#EF4444' }}>
                      <span className="inline-block w-2 h-2 rounded-full bg-current" />
                      Code expired (2 min limit) — Click Resend Code below
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: '#94A3B8' }}>
                    6-Digit Verification Code
                  </label>
                  <div className="flex justify-between gap-2">
                    {otpInputs.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`reg-otp-${idx}`}
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
                          background: digit ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.02)',
                          border: digit ? '1px solid #4ADE80' : '1px solid rgba(74,222,128,0.22)',
                          color: '#ffffff',
                          caretColor: '#4ADE80'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#4ADE80';
                          e.target.style.boxShadow = '0 0 0 3px rgba(74,222,128,0.15), 0 0 18px rgba(74,222,128,0.25)';
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = digit ? '#4ADE80' : 'rgba(74,222,128,0.22)';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={verifying || countdown === 0}
                  className="w-full flex items-center justify-center gap-2 rounded-[10px] py-3.5 text-sm font-bold tracking-wider border-none cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(180deg, #4ADE80, #22C55E)',
                    color: '#07130F'
                  }}
                >
                  {verifying ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#07130F] border-t-transparent" />
                  ) : (
                    <>
                      Verify & Activate Account
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs mt-4">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: countdown > 0 ? '#64748B' : '#4ADE80',
                      cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                      fontWeight: 600,
                      opacity: countdown > 0 ? 0.6 : 1
                    }}
                  >
                    {countdown > 0 ? `Resend Code (${formatTime(countdown)})` : '🔄 Resend Code'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowOtp(false)}
                    style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}
                  >
                    Back to Signup
                  </button>
                </div>
              </form>
            )}

            {!showOtp && (
              <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(34,197,94,0.22)',
                      color: '#ffffff',
                      caretColor: '#22C55E'
                    }}
                    placeholder="Clinical Administrator Name"
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

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(34,197,94,0.22)',
                      color: '#ffffff',
                      caretColor: '#22C55E'
                    }}
                    placeholder="name@company.com"
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

              {/* Phone Number Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <span className="text-xs font-bold font-mono">+</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all font-mono tracking-wider"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(34,197,94,0.22)',
                      color: '#ffffff',
                      caretColor: '#22C55E'
                    }}
                    placeholder="9876543210 (10 digits)"
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

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
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
                <p className="text-[10px] mt-1" style={{ color: '#94A3B8' }}>Min 8 chars, 1 uppercase, 1 lowercase, 1 number & 1 special char.</p>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
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

              {/* Secret Code Field */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-1.5" style={{ color: '#94A3B8' }}>
                  Invitation Key
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none" style={{ color: '#94A3B8' }}>
                    <Key className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={secretCode}
                    onChange={(e) => setSecretCode(e.target.value)}
                    className="block w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(34,197,94,0.22)',
                      color: '#ffffff',
                      caretColor: '#22C55E'
                    }}
                    placeholder="Enter invitation or admin key (Optional)"
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
                <p className="text-[10px] mt-1" style={{ color: '#94A3B8' }}>
                  Optional. For demo, key defaults to <span style={{ color: '#4ADE80' }}>ATLAS-ADMIN-99</span>.
                </p>
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

              {/* Register Button */}
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
                    Register Console
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

            <div className="flex items-center justify-center gap-1.5 mt-5 text-xs" style={{ color: '#94A3B8' }}>
              <span>Already have an account?</span>
              <Link to="/login" className="font-semibold no-underline transition-opacity hover:opacity-80"
                style={{ color: '#4ADE80' }}>
                Sign In
              </Link>
            </div>
          </div>
        </TiltCard>
      </div>
    </div>
  );
};
export default RegisterPage;
