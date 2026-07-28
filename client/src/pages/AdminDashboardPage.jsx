import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { PageHeader } from '../components/console/PageHeader';
import { Users, ShieldAlert, Mail, Phone, Calendar, Search, Shield, ShieldCheck, UserX, UserCheck, RefreshCw, Key, Settings, Sliders, Play, Trash2, Cpu } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const AdminDashboardPage = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Premium Subscription Features (For SuperUser & Enterprise)
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production billing scraper', key: 'ca_live_f89839ad78d22ef1', rateLimit: 5000, created: '2026-07-08' },
    { id: 2, name: 'CI/CD pipeline test runner', key: 'ca_test_23982cd98ffea98a', rateLimit: 1000, created: '2026-07-16' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyLimit, setNewKeyLimit] = useState(3000);

  // Hyperparameters Tuner
  const [lr, setLr] = useState(0.01);
  const [epochs, setEpochs] = useState(100);
  const [batchSize, setBatchSize] = useState(64);
  const [trainingLogs, setTrainingLogs] = useState([]);
  const [training, setTraining] = useState(false);

  // Egress bypass toggle
  const [bypassActive, setBypassActive] = useState(true);

  const handleGenerateKey = () => {
    if (!newKeyName.trim()) return;
    const newKey = {
      id: Date.now(),
      name: newKeyName,
      key: 'ca_live_' + Math.random().toString(36).substr(2, 16),
      rateLimit: newKeyLimit,
      created: new Date().toISOString().split('T')[0]
    };
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };

  const handleDeleteKey = (id) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
  };

  const handleStartTraining = () => {
    if (training) return;
    setTraining(true);
    setTrainingLogs(['[SYSTEM] Initializing forecasting model optimization parameters...']);
    let step = 1;
    const interval = setInterval(() => {
      if (step > 4) {
        setTrainingLogs(prev => [...prev, `[SUCCESS] Optimization complete! Final Accuracy: ${(98.2 - lr * 1.5).toFixed(2)}%, Loss: ${(0.02 + lr * 0.1).toFixed(4)}`]);
        setTraining(false);
        clearInterval(interval);
      } else {
        const loss = (0.08 - step * 0.015 + lr * 0.08).toFixed(4);
        const acc = (95.1 + step * 0.7).toFixed(1);
        setTrainingLogs(prev => [...prev, `[EPOCH ${step * 25}/${epochs}] Batch size: ${batchSize} | Loss: ${loss} | Accuracy: ${acc}%`]);
        step++;
      }
    }, 1000);
  };

  const handleToggleStatus = async (user) => {
    try {
      setError(null);
      await api.put(`/auth/users/${user._id}`, {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: user.isActive === false ? true : false
      });
      fetchUsers(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const fetchUsers = async (showPulse = true) => {
    try {
      if (showPulse) setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to load users:', err);
      setError(err.response?.data?.message || 'Failed to retrieve users list from API');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(false);
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

  const formatRole = (role) => {
    return role ? role.replace('_', ' ').toUpperCase() : 'USER';
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  return (
    <ConsoleLayout title="Admin Panel">
      <PageHeader
        title="Admin Control Center"
        subtitle="Manage registered users, inspect registration details, and monitor platform permissions"
        icon={Shield}
        breadcrumb={['CloudAtlas AI', 'Admin Portal', 'Dashboard']}
        actions={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh Accounts
          </button>
        }
      />

      {/* Grid Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Total Users */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                All Platform Accounts
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {users.length}
              </h3>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(6,182,212,0.12)', color: '#06B6D4',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Super Admins */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Super Administrators
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {users.filter(u => u.role === 'super_admin').length}
              </h3>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(124,58,237,0.12)', color: '#8B5CF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <ShieldCheck className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Standard Users */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Standard Consumers
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {users.filter(u => u.role !== 'super_admin').length}
              </h3>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* User Activity & API Usage Analytics */}
      <div className="glass-card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h4 style={{ margin: '0 0 16px', fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: 800, color: '#F1F5F9' }}>
          User Activity & API Egress Volume (Last 7 Days)
        </h4>
        <div style={{ width: '100%', height: '240px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={[
                { day: 'Mon', activeUsers: Math.max(1, Math.round((users.length || 3) * 0.3)), apiCalls: 120 },
                { day: 'Tue', activeUsers: Math.max(1, Math.round((users.length || 3) * 0.5)), apiCalls: 230 },
                { day: 'Wed', activeUsers: Math.max(1, Math.round((users.length || 3) * 0.6)), apiCalls: 450 },
                { day: 'Thu', activeUsers: Math.max(1, Math.round((users.length || 3) * 0.4)), apiCalls: 310 },
                { day: 'Fri', activeUsers: Math.max(1, Math.round((users.length || 3) * 0.8)), apiCalls: 580 },
                { day: 'Sat', activeUsers: Math.max(1, Math.round((users.length || 3) * 0.9)), apiCalls: 890 },
                { day: 'Sun', activeUsers: users.length || 3, apiCalls: 1200 }
              ]}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
              <XAxis dataKey="day" stroke="#475569" style={{ fontSize: '10px' }} />
              <YAxis stroke="#475569" style={{ fontSize: '10px' }} />
              <Tooltip
                contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px' }}
                labelStyle={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="activeUsers" name="Active Members" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorUsers)" strokeWidth={2} />
              <Area type="monotone" dataKey="apiCalls" name="API Calls Volume" stroke="#06B6D4" fillOpacity={1} fill="url(#colorCalls)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Accounts Control Panel */}
      <div className="glass-card" style={{ padding: '24px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Filter by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/5 focus:border-primary rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all"
            />
          </div>

          {/* Role Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {[
              { id: 'all', label: 'All Accounts' },
              { id: 'super_admin', label: 'Super Admins' },
              { id: 'user', label: 'Standard Users' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                style={{
                  padding: '6px 12px', borderRadius: '7px',
                  fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  background: roleFilter === tab.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: roleFilter === tab.id ? '1px solid rgba(124,58,237,0.3)' : '1px solid transparent',
                  color: roleFilter === tab.id ? '#A78BFA' : '#64748B',
                  transition: 'all 0.15s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div style={{
            padding: '12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
            color: '#EF4444', fontSize: '12px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
            <p className="text-gray-400 font-medium text-xs">Accessing user listings...</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User details</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Contact channels</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role permissions</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status (SuperUser Toggle)</th>
                  <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Member since</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B', fontSize: '12px' }}>
                      No registered user accounts match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      style={{
                        borderBottom: '1px solid rgba(255,255,255,0.03)',
                        transition: 'background 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.01)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '10px',
                            background: 'rgba(255,255,255,0.04)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, color: '#06B6D4', fontSize: '14px',
                            border: '1px solid rgba(255,255,255,0.05)'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9' }}>{user.name}</div>
                            <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'Space Grotesk, monospace' }}>ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94A3B8' }}>
                            <Mail className="h-3.5 w-3.5 text-gray-500" />
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: '#64748B' }}>
                              <Phone className="h-3.5 w-3.5 text-gray-600" />
                              {user.phoneNumber}
                            </div>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                          {formatRole(user.role)}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          title="Click to toggle status (SuperUser Control)"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 10px', borderRadius: '6px', border: 'none',
                            fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            background: user.isActive !== false ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                            color: user.isActive !== false ? '#10B981' : '#EF4444',
                            transition: 'all 0.2s'
                          }}
                        >
                          <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: user.isActive !== false ? '#10B981' : '#EF4444'
                          }} />
                          {user.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                        </button>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#94A3B8' }}>
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 💎 SUPERUSER PREMIUM SUBSCRIPTION FACILITIES */}
      <div style={{ marginTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '18px' }}>💎</span>
          <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#F1F5F9' }}>
            SuperUser Premium Facilities
          </h3>
          <span className="badge-cyan" style={{ marginLeft: '8px' }}>Enterprise Tier</span>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(420px, 1fr))',
          gap: '20px'
        }}>
          {/* Card 1: API Token generator */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={16} color="#06B6D4" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Inter' }}>
                API Keys Manager & Rate Limiting
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', lineHeight: 1.5 }}>
              Generate custom bearer keys for automated CI/CD billing integrations and customize server rate-limit quotas.
            </p>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Key Description (e.g. Scraper)"
                value={newKeyName}
                onChange={e => setNewKeyName(e.target.value)}
                className="input-field"
                style={{ flex: 1, height: '36px', fontSize: '12px' }}
              />
              <button
                onClick={handleGenerateKey}
                className="btn-primary ripple"
                style={{ height: '36px', padding: '0 14px', fontSize: '12px', cursor: 'pointer', borderRadius: '8px' }}
              >
                Generate Token
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>
                Rate Limit Quota: {newKeyLimit.toLocaleString()} req/min
              </label>
              <input
                type="range"
                min="500"
                max="10000"
                step="500"
                value={newKeyLimit}
                onChange={e => setNewKeyLimit(Number(e.target.value))}
                style={{ accentColor: '#7C3AED', width: '100%', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              {apiKeys.map(k => (
                <div key={k.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#F1F5F9' }}>{k.name}</div>
                    <div style={{ fontSize: '10px', fontFamily: 'Space Grotesk, monospace', color: '#06B6D4', marginTop: '2px' }}>
                      {k.key} · <span style={{ color: '#475569' }}>{k.rateLimit} req/m</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteKey(k.id)}
                    style={{
                      background: 'none', border: 'none', color: '#EF4444',
                      cursor: 'pointer', display: 'flex', alignItems: 'center'
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Hyperparameters optimization sandbox */}
          <div className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={16} color="#8B5CF6" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Inter' }}>
                XGBoost Model Hyperparameter Tuning
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '11.5px', color: '#64748B', lineHeight: 1.5 }}>
              Tune deep learning multipliers, model learning curves, and batch intervals to simulate forecasting error drops.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Learning Rate ({lr})</span>
                <input
                  type="range"
                  min="0.001"
                  max="0.1"
                  step="0.005"
                  value={lr}
                  onChange={e => setLr(Number(e.target.value))}
                  style={{ accentColor: '#8B5CF6', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Epochs ({epochs})</span>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="50"
                  value={epochs}
                  onChange={e => setEpochs(Number(e.target.value))}
                  style={{ accentColor: '#8B5CF6', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <span style={{ fontSize: '10px', color: '#64748B', fontWeight: 600 }}>Batch Size ({batchSize})</span>
                <input
                  type="range"
                  min="16"
                  max="128"
                  step="16"
                  value={batchSize}
                  onChange={e => setBatchSize(Number(e.target.value))}
                  style={{ accentColor: '#8B5CF6', cursor: 'pointer' }}
                />
              </div>
            </div>

            <button
              onClick={handleStartTraining}
              disabled={training}
              className="btn-primary ripple"
              style={{
                width: '100%', height: '36px', fontSize: '12px', fontWeight: 600,
                cursor: training ? 'not-allowed' : 'pointer', borderRadius: '8px'
              }}
            >
              {training ? 'Tuning Forecasting Model...' : 'Start Model Hyperparameter Tune'}
            </button>

            <div style={{
              background: '#040713', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '8px', padding: '10px', height: '90px', overflowY: 'auto',
              fontFamily: 'Space Grotesk, monospace', fontSize: '10px'
            }}>
              {trainingLogs.length === 0 ? (
                <div style={{ color: '#475569', textAlign: 'center', marginTop: '24px' }}>Click Start to trigger simulation outputs</div>
              ) : (
                trainingLogs.map((log, i) => (
                  <div key={i} style={{
                    color: log.includes('SUCCESS') ? '#10B981' : log.includes('SYSTEM') ? '#8B5CF6' : '#94A3B8',
                    marginBottom: '4px'
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Card 3: Network Bypass Control Banner */}
        <div className="glass-card" style={{
          marginTop: '20px', padding: '20px', display: 'flex',
          alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F1F5F9', fontFamily: 'Inter' }}>
                Multi-Region Cross-Provider Egress Bypass Scheduler
              </h4>
            </div>
            <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: '#64748B', maxWidth: '640px', lineHeight: 1.5 }}>
              Enable bypass optimization routing rules. Bypass queues AWS network traffic locally through CloudAtlas nodes, avoiding cross-provider egress billing marks.
            </p>
          </div>

          <button
            onClick={() => setBypassActive(!bypassActive)}
            style={{
              padding: '10px 20px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.2s',
              background: bypassActive ? 'rgba(16,185,129,0.12)' : 'rgba(255,255,255,0.05)',
              border: bypassActive ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.08)',
              color: bypassActive ? '#10B981' : '#64748B'
            }}
          >
            {bypassActive ? 'Egress Bypass ACTIVE' : 'Egress Bypass INACTIVE'}
          </button>
        </div>
      </div>
    </ConsoleLayout>
  );
};

export default AdminDashboardPage;
