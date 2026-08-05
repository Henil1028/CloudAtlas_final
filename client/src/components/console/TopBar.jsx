import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Upload, Bell, Sun, Moon, Menu,
  LogOut, User, Settings, ChevronDown, X, Command, Shield, Users, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'alert', text: 'Compute cost spike: +178% vs 7-day baseline', time: '2h ago', color: '#EF4444' },
  { id: 2, type: 'alert', text: 'Database I/O cost anomaly: unusual query volume', time: '5h ago', color: '#EF4444' },
  { id: 3, type: 'warning', text: 'Storage egress charges +65% above expected', time: '1d ago', color: '#F59E0B' },
  { id: 4, type: 'info', text: 'Azure Blob cold-tier access pattern anomaly', time: '2d ago', color: '#06B6D4' },
];

const SEARCHABLE_PAGES = [
  { name: 'Dashboard Overview', path: '/dashboard', desc: 'Main cost console & quick stats' },
  { name: 'Cost Analytics', path: '/analytics', desc: 'Detailed cost breakdown & filters' },
  { name: 'Cost Prediction', path: '/predictions', desc: 'XGBoost cost forecasting model' },
  { name: 'Model Training', path: '/model-training', desc: 'Retrain forecasting algorithms' },
  { name: 'Cost Simulator', path: '/simulator', desc: 'What-if architecture spend simulation' },
  { name: 'Risk Assessment', path: '/risk-assessment', desc: 'Cost overrun & alert probability logs' },
  { name: 'Anomaly Detection', path: '/anomalies', desc: 'SVM auto cost-spike alerts list' },
  { name: 'AI Insight Engine', path: '/insights', desc: 'Chat interface for FinOps questions' },
  { name: 'Datasets & Feeds', path: '/datasets', desc: 'Billing data source manager' },
  { name: 'Reports Manager', path: '/reports', desc: 'Export billing summaries & PDFs' },
  { name: 'Upload CSV', path: '/upload', desc: 'Upload billing CSV data files' },
  { name: 'My Profile', path: '/profile', desc: 'Personal details & system role' },
  { name: 'Platform Settings', path: '/settings', desc: 'Configure cloud integrations' }
];

export const TopBar = ({ onMenuClick, title = 'Dashboard', collapsed }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const searchRef = useRef(null);

  React.useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setDarkMode(false);
      document.documentElement.classList.add('light-mode');
    }
  }, []);

  const handleLogout = () => {
    setShowProfile(false);
    logout(navigate);
  };

  const filteredSuggestions = searchVal.trim()
    ? SEARCHABLE_PAGES.filter(p => p.name.toLowerCase().includes(searchVal.toLowerCase()) || p.desc.toLowerCase().includes(searchVal.toLowerCase()))
    : [];

  const initials = user?.name ? user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : 'U';

  const formatRole = (role) => {
    return role ? role.replace('_', ' ').toUpperCase() : 'USER';
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'admin':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    }
  };

  return (
    <header 
      className="console-topbar"
      style={{
        left: collapsed ? '96px' : '272px',
        transition: 'left 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
      }}
    >
      {/* Bottom glowing accent line */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '1px',
        background: 'linear-gradient(90deg, transparent, rgba(34,197,94,0.3), rgba(139,92,246,0.35), transparent)',
        boxShadow: '0 1px 8px rgba(34,197,94,0.15)'
      }} />
      {/* Left: Menu + Title + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
        {/* Mobile menu */}
        <button
          onClick={onMenuClick}
          style={{
            display: 'none', alignItems: 'center', justifyContent: 'center',
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            color: '#94A3B8', cursor: 'pointer',
          }}
          className="flex lg:hidden"
        >
          <Menu size={18} />
        </button>

        {/* Search bar */}
        <div style={{ position: 'relative', maxWidth: '420px', flex: 1 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 14px',
            background: searchOpen ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)',
            border: searchOpen ? '1px solid rgba(139,92,246,0.4)' : '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
            cursor: 'text',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: searchOpen ? '0 0 16px rgba(139,92,246,0.2)' : 'none',
            transform: searchOpen ? 'scale(1.01)' : 'scale(1)'
          }}
            onClick={() => { setSearchOpen(true); setTimeout(() => searchRef.current?.focus(), 50); }}
            onMouseEnter={e => {
              if (!searchOpen) {
                e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
              }
            }}
            onMouseLeave={e => {
              if (!searchOpen) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)';
                e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
              }
            }}
          >
            <Search size={14} color={searchOpen ? '#A78BFA' : '#475569'} style={{ transition: 'color 0.3s' }} />
            <input
              ref={searchRef}
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setSearchOpen(true)}
              onBlur={() => { setTimeout(() => setSearchOpen(false), 150); }}
              onKeyDown={e => {
                if (e.key === 'Enter' && searchVal.trim()) {
                  navigate(`/insights?q=${encodeURIComponent(searchVal)}`);
                  setSearchVal('');
                  setSearchOpen(false);
                  searchRef.current?.blur();
                }
              }}
              placeholder="Ask anything about costs..."
              style={{
                flex: 1, background: 'none', border: 'none', outline: 'none',
                color: '#F1F5F9', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                minWidth: 0,
              }}
            />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '2px',
              padding: '2px 6px', borderRadius: '4px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#475569', fontSize: '10px', fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap', flexShrink: 0,
            }}>
              <Command size={9} />K
            </div>
          </div>

          {/* Suggestions Dropdown */}
          {searchOpen && filteredSuggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: '46px',
              left: 0,
              right: 0,
              background: '#0B1023',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
              zIndex: 100,
              maxHeight: '260px',
              overflowY: 'auto',
              padding: '6px'
            }}>
              {filteredSuggestions.map(suggestion => (
                <button
                  key={suggestion.path}
                  onMouseDown={() => {
                    navigate(suggestion.path);
                    setSearchVal('');
                    setSearchOpen(false);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'Inter, sans-serif' }}>{suggestion.name}</span>
                  <span style={{ fontSize: '10px', color: '#475569', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>{suggestion.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Middle Section: Active Indicators (Addressing the whitespace gaps dynamically) */}
      <div className="hidden lg:flex items-center gap-4 px-4" style={{ flex: 1, justifyContent: 'center' }}>
        {user?.role === 'super_admin' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '4px 12px', borderRadius: '20px',
            background: 'rgba(6,182,212,0.08)', border: '1px solid rgba(6,182,212,0.15)',
            fontSize: '11px', fontWeight: 600, color: '#06B6D4',
            animation: 'pulse 2s infinite',
          }}>
            <Shield size={11} />
            Admin Shield Active
          </div>
        )}
      </div>

      {/* Right: Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 }}>

        {/* Upload CSV */}
        <button
          onClick={() => navigate('/upload')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 14px', borderRadius: '8px',
            background: 'rgba(124,58,237,0.15)',
            border: '1px solid rgba(124,58,237,0.25)',
            color: '#8B5CF6', cursor: 'pointer',
            fontSize: '12.5px', fontWeight: 600,
            fontFamily: 'Inter, sans-serif',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.25)';
            e.currentTarget.style.boxShadow = '0 0 16px rgba(124,58,237,0.3)';
            e.currentTarget.style.transform = 'translateY(-1px) scale(1.02)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(124,58,237,0.15)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.transform = 'translateY(0) scale(1)';
          }}
        >
          <Upload size={13} />
          <span className="hidden sm:inline">Upload CSV</span>
        </button>



        {/* Dark mode toggle */}
        <button
          onClick={() => {
            const nextMode = !darkMode;
            setDarkMode(nextMode);
            if (nextMode) {
              document.documentElement.classList.remove('light-mode');
              localStorage.setItem('theme', 'dark');
            } else {
              document.documentElement.classList.add('light-mode');
              localStorage.setItem('theme', 'light');
            }
          }}
          style={{
            width: '36px', height: '36px', borderRadius: '8px',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            color: '#94A3B8', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
            e.currentTarget.style.color = '#F1F5F9';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
            e.currentTarget.style.color = '#94A3B8';
          }}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Moon size={15} /> : <Sun size={15} className="text-amber-400" />}
        </button>

        {/* Profile Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 10px 6px 6px', borderRadius: '10px',
              background: darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
              border: darkMode ? '1px solid rgba(255,255,255,0.07)' : '1px solid #CBD5E1',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.07)' : '#E2E8F0';
              e.currentTarget.style.borderColor = 'rgba(124,58,237,0.3)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = darkMode ? 'rgba(255,255,255,0.04)' : '#F1F5F9';
              e.currentTarget.style.borderColor = darkMode ? 'rgba(255,255,255,0.07)' : '#CBD5E1';
            }}
          >
            <div style={{
              width: '28px', height: '28px', borderRadius: '7px',
              background: 'linear-gradient(135deg, #7C3AED, #06B6D4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '11px', color: '#fff',
              flexShrink: 0,
            }}>
              {initials}
            </div>
            <div className="hidden sm:block" style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: darkMode ? '#F1F5F9' : '#0F172A', fontFamily: 'Inter, sans-serif', lineHeight: 1.2 }}>
                {user?.name?.split(' ')[0] || 'Admin'}
              </div>
              <div style={{ fontSize: '10px', color: darkMode ? '#94A3B8' : '#475569', fontFamily: 'Inter, sans-serif', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {user?.role || 'super_admin'}
              </div>
            </div>
            <ChevronDown size={12} color={darkMode ? '#94A3B8' : '#475569'} style={{ transition: 'transform 0.2s', transform: showProfile ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>

          {showProfile && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setShowProfile(false)} />
              <div className="animate-modal-enter" style={{
                position: 'absolute', top: '44px', right: 0,
                width: '260px', zIndex: 50,
                background: darkMode ? '#0B1023' : '#FFFFFF',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #E2E8F0',
                borderRadius: '14px', boxShadow: darkMode ? '0 20px 60px rgba(0,0,0,0.5)' : '0 10px 40px rgba(15,23,42,0.15)',
                overflow: 'hidden', padding: '8px',
              }}>
                {/* Profile Header with styled Role Badge */}
                <div style={{ padding: '10px 12px', borderBottom: darkMode ? '1px solid rgba(255,255,255,0.06)' : '1px solid #F1F5F9', marginBottom: '6px' }}>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: darkMode ? '#F1F5F9' : '#0F172A' }}>{user?.name}</p>
                  <p style={{ margin: '2px 0 6px', fontSize: '11px', color: darkMode ? '#64748B' : '#475569' }}>{user?.email}</p>
                  <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${getRoleBadgeColor(user?.role)}`}>
                    {formatRole(user?.role)}
                  </span>
                </div>

                {/* Standard Links */}
                {[
                  { icon: User, label: 'My Profile', path: '/profile' },
                  { icon: Settings, label: 'Platform Settings', path: '/settings' },
                ].map(item => (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); setShowProfile(false); }}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '8px 12px', borderRadius: '8px',
                      background: 'none', border: 'none', color: '#94A3B8',
                      cursor: 'pointer', fontSize: '12.5px', fontFamily: 'Inter, sans-serif',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#F1F5F9'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#94A3B8'; }}
                  >
                    <item.icon size={13.5} />
                    {item.label}
                  </button>
                ))}

                {/* Conditional Admin Links (Appropriate items based on role) */}
                {user?.role === 'super_admin' && (
                  <>
                    <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '4px 0' }} />
                    <div style={{ padding: '4px 12px 2px', fontSize: '9px', fontWeight: 700, color: '#475569', uppercase: true, letterSpacing: '0.06em' }}>ADMIN TOOLS</div>
                    {[
                      { icon: Shield, label: 'Admin Dashboard', path: '/admin/dashboard' },
                      { icon: Users, label: 'User Management', path: '/users' },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setShowProfile(false); }}
                        style={{
                          width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                          padding: '8px 12px', borderRadius: '8px',
                          background: 'none', border: 'none', color: '#A78BFA',
                          cursor: 'pointer', fontSize: '12.5px', fontFamily: 'Inter, sans-serif',
                          transition: 'all 0.15s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; e.currentTarget.style.color = '#C084FC'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#A78BFA'; }}
                      >
                        <item.icon size={13.5} />
                        {item.label}
                      </button>
                    ))}
                  </>
                )}

                <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '6px 0' }} />
                
                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 12px', borderRadius: '8px',
                    background: 'none', border: 'none', color: '#EF4444',
                    cursor: 'pointer', fontSize: '12.5px', fontFamily: 'Inter, sans-serif',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <LogOut size={13.5} />
                  Logout Session
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
