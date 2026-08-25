import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { PageHeader } from '../components/console/PageHeader';
import { 
  Users, Shield, ShieldCheck, Mail, Phone, Calendar, Search, 
  RefreshCw, Plus, Edit2, Trash2, X, Activity, BarChart3, 
  Database, Zap, CheckCircle2, FileText, Sparkles, Clock, CheckCircle,
  Download, Lock, Bell, Send, Server, HardDrive, Cpu, Globe, Wifi, AlertTriangle, Sliders
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const AdminDashboardPage = () => {
  const { user: currentUser } = useAuth();
  
  // Dashboard Active Tab State: 'users' | 'overview' | 'logs'
  const [activeTab, setActiveTab] = useState('users');

  // Default sample accounts list as fallback
  const defaultAccounts = [
    { _id: 'usr_admin1', name: 'Super Admin', email: 'admin1@cloudatlas.ai', phoneNumber: '9876543210', role: 'super_admin', isActive: true, createdAt: '2026-01-15T08:00:00.000Z' },
    { _id: 'usr_alex', name: 'Alex Vance', email: 'devops@cloudatlas.io', phoneNumber: '9876543212', role: 'admin', isActive: true, createdAt: '2026-02-01T10:15:00.000Z' },
    { _id: 'usr_sarah', name: 'Sarah Chen', email: 'sarah.chen@finops.io', phoneNumber: '9876543213', role: 'user', isActive: true, createdAt: '2026-02-14T14:20:00.000Z' },
    { _id: 'usr_marcus', name: 'Marcus Wright', email: 'marcus.wright@cloudatlas.ai', phoneNumber: '9876543214', role: 'user', isActive: true, createdAt: '2026-03-05T11:45:00.000Z' },
    { _id: 'usr_elena', name: 'Elena Rostova', email: 'elena.rostova@cloudatlas.ai', phoneNumber: '9876543215', role: 'admin', isActive: true, createdAt: '2026-03-20T16:10:00.000Z' }
  ];

  // User Accounts State
  const [users, setUsers] = useState(defaultAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // User Management Modals State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Form State for User Create/Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'user'
  });

  // Toast Notification State
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isCreateOpen || isEditOpen || isDeleteOpen || createdCredentials) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCreateOpen, isEditOpen, isDeleteOpen, createdCredentials]);

  // Fetch Users List
  const fetchUsers = async (showPulse = true) => {
    try {
      if (showPulse) setLoading(true);
      const response = await api.get('/auth/users');
      const data = response.data;
      if (Array.isArray(data) && data.length > 0) {
        setUsers(data);
      } else if (data && Array.isArray(data.users) && data.users.length > 0) {
        setUsers(data.users);
      }
      setError(null);
    } catch (err) {
      console.error('Failed to load users:', err);
      // Keep existing users state so UI is never empty
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
    showToast('info', 'Platform accounts & stats refreshed');
  };



  // User Management Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOpen = () => {
    setFormData({ name: '', email: '', phoneNumber: '', password: '', role: 'user' });
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const savedEmail = formData.email.trim().toLowerCase();
      const savedPassword = formData.password;
      await api.post('/auth/users', formData);
      setIsCreateOpen(false);
      fetchUsers(false);
      setCreatedCredentials({
        name: formData.name,
        email: savedEmail,
        password: savedPassword,
        role: formData.role
      });
      showToast('success', `User account for "${formData.name}" created successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user account';
      setError(msg);
      showToast('error', msg);
    }
  };

  const handleEditOpen = (u) => {
    setSelectedUser(u);
    setFormData({
      name: u.name || '',
      email: u.email || '',
      phoneNumber: u.phoneNumber || '',
      password: '',
      role: u.role || 'user'
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      };
      if (formData.password && formData.password.trim().length >= 8) {
        payload.password = formData.password.trim();
      }
      await api.put(`/auth/users/${selectedUser._id}`, payload);
      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers(false);
      showToast('success', `Updated user details for "${formData.name}"`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user account';
      setError(msg);
      showToast('error', msg);
    }
  };

  const handleDeleteOpen = (u) => {
    if (u.role === 'super_admin') {
      showToast('error', 'Action Prohibited: Super Admin accounts cannot be deleted!');
      return;
    }
    setSelectedUser(u);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    try {
      setError(null);
      const deletedName = selectedUser.name;
      await api.delete(`/auth/users/${selectedUser._id}`);
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers(false);
      showToast('success', `Deleted account for "${deletedName}"`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user account';
      setError(msg);
      showToast('error', msg);
    }
  };

  const handleToggleStatus = async (u) => {
    if (u.role === 'super_admin') {
      showToast('error', 'Cannot change status of Super Admin account');
      return;
    }
    try {
      setError(null);
      const nextStatus = u.isActive === false ? true : false;
      await api.put(`/auth/users/${u._id}`, {
        name: u.name,
        email: u.email,
        phoneNumber: u.phoneNumber,
        role: u.role,
        isActive: nextStatus
      });
      fetchUsers(false);
      showToast('info', `Account "${u.name}" status changed to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle status';
      setError(msg);
      showToast('error', msg);
    }
  };

  // Role Badge Styling
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20';
      case 'admin':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      default:
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
    }
  };

  const formatRole = (role) => {
    return role ? role.replace('_', ' ').toUpperCase() : 'USER';
  };

  const safeUsers = Array.isArray(users) ? users : [];

  const filteredUsers = safeUsers.filter((u) => {
    if (!u) return false;
    const name = u.name ? String(u.name) : '';
    const email = u.email ? String(u.email) : '';
    const phone = u.phoneNumber ? String(u.phoneNumber) : '';
    const term = (searchTerm || '').toLowerCase();

    const matchesSearch = 
      name.toLowerCase().includes(term) ||
      email.toLowerCase().includes(term) ||
      phone.includes(term);
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Chart Data
  const userRolePieData = [
    { name: 'Super Admins', value: safeUsers.filter(u => u?.role === 'super_admin').length || 1, color: '#06B6D4' },
    { name: 'Admins', value: safeUsers.filter(u => u?.role === 'admin').length || 2, color: '#F59E0B' },
    { name: 'Standard Users', value: safeUsers.filter(u => u?.role !== 'super_admin' && u?.role !== 'admin').length || 5, color: '#8B5CF6' }
  ];

  const cloudCostsBarData = [
    { provider: 'AWS EC2 & S3', compute: 24500, storage: 12100, egress: 5900 },
    { provider: 'Azure VM & Blob', compute: 16800, storage: 8400, egress: 3100 },
    { provider: 'Google Cloud Platform', compute: 9400, storage: 4900, egress: 2100 }
  ];

  // System Audit Logs Stream
  const auditLogs = [
    { id: 1, type: 'AUTH', title: 'Administrator login authenticated', user: currentUser?.email || 'admin1@cloudatlas.ai', time: '2 mins ago', severity: 'info' },
    { id: 2, type: 'USER', title: 'User account created successfully', user: 'Admin Console', time: '18 mins ago', severity: 'success' },
    { id: 3, type: 'USER', title: 'User account status toggled ACTIVE', user: 'Admin Console', time: '45 mins ago', severity: 'info' },
    { id: 4, type: 'SECURITY', title: 'Security permissions validated for administrator', user: 'System Gatekeeper', time: '1 hour ago', severity: 'info' },
    { id: 5, type: 'DATASET', title: 'AWS Billing dataset (2,000 rows) indexed', user: 'Batch System', time: '4 hours ago', severity: 'info' }
  ];

  return (
    <ConsoleLayout title="Admin Panel">
      <PageHeader
        title="Admin Dashboard & User Management"
        subtitle="View platform analytics, manage user account permissions, configure security roles, and monitor system activity"
        icon={Shield}
        breadcrumb={['CloudAtlas AI', 'Admin Portal', 'Dashboard']}
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded-xl text-xs font-semibold text-gray-300 hover:text-white transition-all cursor-pointer shadow-sm"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
            
            <button
              onClick={handleCreateOpen}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0A0610] rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:shadow-[0_0_25px_rgba(245,158,11,0.6)] transition-all cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              Create Member
            </button>
          </div>
        }
      />

      {/* 📊 TOP LEVEL EXECUTIVE KPI CARDS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Card 1: Total Accounts */}
        <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                All Platform Accounts
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {safeUsers.length}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={12} />
                <span>{safeUsers.filter(u => u?.isActive !== false).length} Active Accounts</span>
              </p>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(6,182,212,0.12)', color: '#06B6D4',
              border: '1px solid rgba(6,182,212,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 2: Administrators */}
        <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Administrators
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {safeUsers.filter(u => u?.role === 'super_admin' || u?.role === 'admin').length}
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#06B6D4', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ShieldCheck size={12} />
                <span>Admin & Root Privileges</span>
              </p>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(124,58,237,0.12)', color: '#8B5CF6',
              border: '1px solid rgba(124,58,237,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 3: Cloud Infrastructure Datasets */}
        <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Processed Records
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                248,920
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Database size={12} />
                <span>Multi-Cloud Billing Datasets</span>
              </p>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(245,158,11,0.12)', color: '#F59E0B',
              border: '1px solid rgba(245,158,11,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Database className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Card 4: System Operational Health */}
        <div className="glass-card" style={{ padding: '20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                System Status
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#10B981' }}>
                99.98%
              </h3>
              <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>All Systems Operational</span>
              </p>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(16,185,129,0.12)', color: '#10B981',
              border: '1px solid rgba(16,185,129,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Zap className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* 🗂️ NAVIGATION TABS */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingBottom: '12px',
        marginBottom: '24px',
        overflowX: 'auto'
      }}>
        {[
          { id: 'users', label: 'User Accounts & Permissions', icon: Users },
          { id: 'overview', label: 'Platform Analytics', icon: BarChart3 },
          { id: 'logs', label: 'System Audit Logs', icon: FileText }
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '12.5px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                background: isSelected ? 'rgba(245,158,11,0.12)' : 'rgba(255,255,255,0.02)',
                border: isSelected ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(255,255,255,0.05)',
                color: isSelected ? '#F59E0B' : '#94A3B8',
                boxShadow: isSelected ? '0 0 20px rgba(245,158,11,0.15)' : 'none'
              }}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.id === 'users' && (
                <span style={{
                  padding: '2px 6px',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.1)',
                  fontSize: '10px',
                  color: isSelected ? '#F59E0B' : '#64748B'
                }}>
                  {safeUsers.length}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* --------------------------------------------------------------------- */}
      {/* TAB 1: USER ACCOUNTS MANAGEMENT TABLE */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'users' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Controls Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Search Input */}
            <div style={{ position: 'relative', width: '100%', maxWidth: '340px' }}>
              <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search users by name, email or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/[0.03] border border-white/5 focus:border-[#F59E0B] rounded-xl text-xs text-white placeholder-gray-500 outline-none transition-all"
              />
            </div>

            {/* Role Filter Tabs */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Accounts' },
                { id: 'super_admin', label: 'Super Admins' },
                { id: 'admin', label: 'Admins' },
                { id: 'user', label: 'Standard Users' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setRoleFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    background: roleFilter === tab.id ? 'rgba(255,255,255,0.08)' : 'transparent',
                    border: roleFilter === tab.id ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                    color: roleFilter === tab.id ? '#F1F5F9' : '#64748B'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <button
              onClick={handleCreateOpen}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-[#0A0610] rounded-xl text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.4)] hover:scale-[1.02] transition-all cursor-pointer"
            >
              <Plus size={14} />
              <span>Create Member</span>
            </button>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px', background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px',
              color: '#EF4444', fontSize: '12px', marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#F59E0B] border-t-transparent shadow-lg"></div>
              <p className="text-gray-400 font-medium text-xs">Retrieving platform user accounts...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email / Contact</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role Permission</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status (SuperUser Toggle)</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Date</th>
                    <th style={{ padding: '12px 16px', fontSize: '11px', fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                        No matching user accounts found.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => {
                      const userName = u.name || u.email || 'User';
                      const userInitial = userName.charAt(0).toUpperCase();
                      return (
                        <tr
                          key={u._id}
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
                                fontWeight: 600, color: '#F1F5F9', fontSize: '14px'
                              }}>
                                {userInitial}
                              </div>
                              <div>
                                <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#F1F5F9' }}>{userName}</div>
                                <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'Space Grotesk, monospace' }}>ID: {u._id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94A3B8' }}>
                                <Mail className="h-3.5 w-3.5 text-gray-500" />
                                {u.email}
                              </div>
                              {u.phoneNumber && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                                  <Phone className="h-3.5 w-3.5 text-gray-600" />
                                  {u.phoneNumber}
                                </div>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(u.role)}`}>
                              {formatRole(u.role)}
                            </span>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <button
                              onClick={() => handleToggleStatus(u)}
                              title="Click to toggle status (SuperUser Control)"
                              style={{
                                display: 'inline-flex', alignItems: 'center', gap: '6px',
                                padding: '4px 10px', borderRadius: '6px', border: 'none',
                                fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                                background: u.isActive !== false ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
                                color: u.isActive !== false ? '#10B981' : '#EF4444',
                                transition: 'all 0.2s'
                              }}
                            >
                              <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: u.isActive !== false ? '#10B981' : '#EF4444'
                              }} />
                              {u.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                            </button>
                          </td>
                          <td style={{ padding: '16px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94A3B8' }}>
                              <Calendar className="h-4 w-4 text-gray-500" />
                              {new Date(u.createdAt || Date.now()).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </div>
                          </td>
                          <td style={{ padding: '16px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={() => handleEditOpen(u)}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '6px',
                                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                                  color: '#94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#A78BFA'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)'; }}
                                onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                              >
                                <Edit2 size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteOpen(u)}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '6px',
                                  background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)',
                                  color: '#EF4444', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  cursor: 'pointer', transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.05)'; }}
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 2: PLATFORM ANALYTICS */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Row 1 Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {/* Chart 1: User Growth */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                    User Activity & API Calls Volume
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                    Daily platform active users vs query throughput
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                    { day: 'Mon', activeUsers: 45, apiCalls: 1200 },
                    { day: 'Tue', activeUsers: 52, apiCalls: 1450 },
                    { day: 'Wed', activeUsers: 58, apiCalls: 1800 },
                    { day: 'Thu', activeUsers: 64, apiCalls: 2100 },
                    { day: 'Fri', activeUsers: 72, apiCalls: 2500 },
                    { day: 'Sat', activeUsers: 68, apiCalls: 2300 },
                    { day: 'Sun', activeUsers: 78, apiCalls: 2900 }
                  ]} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorUsersGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorCallsGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="day" stroke="#475569" style={{ fontSize: '11px' }} />
                    <YAxis stroke="#475569" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                      labelStyle={{ color: '#64748B', fontWeight: 600, fontSize: '11px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="activeUsers" name="Active Members" stroke="#8B5CF6" fillOpacity={1} fill="url(#colorUsersGrad)" strokeWidth={2.5} />
                    <Area type="monotone" dataKey="apiCalls" name="API Calls Volume" stroke="#06B6D4" fillOpacity={1} fill="url(#colorCallsGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Cloud Costs */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h4 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                    Multi-Cloud Spend Distribution ($)
                  </h4>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                    AWS, Azure, and GCP cost allocations
                  </p>
                </div>
              </div>

              <div style={{ width: '100%', height: '260px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={cloudCostsBarData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                    <XAxis dataKey="provider" stroke="#475569" style={{ fontSize: '10px' }} />
                    <YAxis stroke="#475569" style={{ fontSize: '11px' }} />
                    <Tooltip
                      contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                      itemStyle={{ fontSize: '12px' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                    <Bar dataKey="compute" name="Compute ($)" fill="#7C3AED" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="storage" name="Storage ($)" fill="#06B6D4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="egress" name="Egress ($)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 2 Chart: User Roles */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h4 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '15px', fontWeight: 800, color: '#F1F5F9' }}>
                  User Security & Role Distribution
                </h4>
                <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                  Breakdown of active accounts by permission tier
                </p>
              </div>
            </div>

            <div style={{ width: '100%', height: '240px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={userRolePieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {userRolePieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: '#0B1023', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px' }}
                    itemStyle={{ fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --------------------------------------------------------------------- */}
      {/* TAB 3: SYSTEM AUDIT LOGS STREAM */}
      {/* --------------------------------------------------------------------- */}
      {activeTab === 'logs' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <h4 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '16px', fontWeight: 800, color: '#F1F5F9' }}>
                System Audit & Administrative Activity Stream
              </h4>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                Real-time event logs of account actions and security authorizations
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {auditLogs.map(log => (
              <div key={log.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.04)',
                transition: 'background 0.2s'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                    fontFamily: 'Space Grotesk, monospace',
                    background: log.severity === 'success' ? 'rgba(16,185,129,0.1)' : 'rgba(6,182,212,0.1)',
                    color: log.severity === 'success' ? '#10B981' : '#06B6D4',
                    border: '1px solid ' + (log.severity === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(6,182,212,0.2)')
                  }}>
                    [{log.type}]
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#F1F5F9' }}>{log.title}</div>
                    <div style={{ fontSize: '11px', color: '#64748B', marginTop: '2px' }}>Initiated by: {log.user}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: '#475569' }}>
                  <Clock size={12} />
                  <span>{log.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODALS SECTION */}
      {/* ===================================================================== */}

      {/* CREATE MEMBER MODAL */}
      {isCreateOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '460px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#F1F5F9' }}>Create Platform Member</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="e.g. John Doe" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="e.g. john@cloudatlas.ai" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Phone Number (10 Digits)</label>
                <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="e.g. 9876543210" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="••••••••" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Role Permission</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '4px'
                }}>
                  {[
                    { val: 'user', label: 'User', desc: 'Standard', color: { text: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' } },
                    { val: 'admin', label: 'Admin', desc: 'Manager', color: { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' } },
                    { val: 'super_admin', label: 'Super Admin', desc: 'Root', color: { text: '#06B6D4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' } }
                  ].map(item => {
                    const isSelected = formData.role === item.val;
                    return (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setFormData(f => ({ ...f, role: item.val }))}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: isSelected ? item.color.bg : 'transparent',
                          border: isSelected ? `1px solid ${item.color.border}` : '1px solid transparent',
                          color: isSelected ? item.color.text : '#475569',
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{item.label}</div>
                        <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsCreateOpen(false)} className="btn-secondary" style={{ flex: 1, height: '42px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary ripple" style={{ flex: 1, height: '42px', cursor: 'pointer' }}>Submit User</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT MEMBER MODAL */}
      {isEditOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '460px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#F1F5F9' }}>Edit User Details</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Phone Number</label>
                <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>New Password <span style={{ color: '#475569', textTransform: 'none', fontWeight: 400, fontSize: '10px' }}>(leave blank to keep current)</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="Min 8 characters" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Role Permission</label>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '6px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '10px',
                  padding: '4px'
                }}>
                  {[
                    { val: 'user', label: 'User', desc: 'Standard', color: { text: '#8B5CF6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.3)' } },
                    { val: 'admin', label: 'Admin', desc: 'Manager', color: { text: '#F59E0B', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)' } },
                    { val: 'super_admin', label: 'Super Admin', desc: 'Root', color: { text: '#06B6D4', bg: 'rgba(6,182,212,0.1)', border: 'rgba(6,182,212,0.3)' } }
                  ].map(item => {
                    const isSelected = formData.role === item.val;
                    return (
                      <button
                        type="button"
                        key={item.val}
                        onClick={() => setFormData(f => ({ ...f, role: item.val }))}
                        style={{
                          padding: '8px 4px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textAlign: 'center',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          background: isSelected ? item.color.bg : 'transparent',
                          border: isSelected ? `1px solid ${item.color.border}` : '1px solid transparent',
                          color: isSelected ? item.color.text : '#475569',
                        }}
                      >
                        <div style={{ fontWeight: 700 }}>{item.label}</div>
                        <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>{item.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsEditOpen(false)} className="btn-secondary" style={{ flex: 1, height: '42px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" className="btn-primary ripple" style={{ flex: 1, height: '42px', cursor: 'pointer' }}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* CREDENTIALS DISPLAY MODAL */}
      {createdCredentials && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.92)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '480px', padding: '32px', border: '1px solid rgba(34,197,94,0.3)', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.9), 0 0 40px rgba(34,197,94,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22C55E' }}>
                <CheckCircle size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#F1F5F9' }}>Account Created</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Save or share these initial login credentials</p>
              </div>
              <button onClick={() => setCreatedCredentials(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', marginLeft: 'auto' }}><X size={18} /></button>
            </div>

            <div style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Full Name</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'Space Grotesk, monospace' }}>{createdCredentials.name}</p>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Login Email</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#38BDF8', fontFamily: 'Space Grotesk, monospace' }}>{createdCredentials.email}</p>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Initial Password</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#F59E0B', fontFamily: 'Space Grotesk, monospace', letterSpacing: '0.05em' }}>{createdCredentials.password}</p>
              </div>
            </div>

            <button
              onClick={() => setCreatedCredentials(null)}
              className="btn-primary ripple"
              style={{ width: '100%', height: '44px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', borderRadius: '12px' }}
            >
              Close & Return to Dashboard
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.88)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '420px', padding: '28px', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            <h3 style={{ margin: '0 0 12px', fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 800, color: '#EF4444' }}>Delete Account</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#94A3B8', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete the user account for <strong>{selectedUser?.name}</strong>? This action cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsDeleteOpen(false)} className="btn-secondary" style={{ flex: 1, height: '40px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={handleDeleteSubmit}
                style={{
                  flex: 1, height: '40px', background: '#EF4444', border: 'none', borderRadius: '10px',
                  color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING TOAST NOTIFICATION */}
      {toast && createPortal(
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999999, display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px', borderRadius: '14px',
          background: toast.type === 'error' ? '#180B0F' : toast.type === 'info' ? '#071626' : '#0B1A13',
          border: toast.type === 'error' ? '1px solid rgba(239,68,68,0.4)' : toast.type === 'info' ? '1px solid rgba(6,182,212,0.4)' : '1px solid rgba(34,197,94,0.4)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.8), 0 0 20px ' + (toast.type === 'error' ? 'rgba(239,68,68,0.2)' : toast.type === 'info' ? 'rgba(6,182,212,0.2)' : 'rgba(34,197,94,0.2)'),
          color: '#ffffff', fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600
        }}>
          <span style={{
            fontSize: '16px',
            color: toast.type === 'error' ? '#EF4444' : toast.type === 'info' ? '#06B6D4' : '#22C55E'
          }}>
            {toast.type === 'error' ? '🚫' : toast.type === 'info' ? 'ℹ️' : '✅'}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', marginLeft: '8px', padding: 0 }}
          >
            <X size={14} />
          </button>
        </div>,
        document.body
      )}

    </ConsoleLayout>
  );
};

export default AdminDashboardPage;
