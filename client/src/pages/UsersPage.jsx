import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ConsoleLayout } from '../components/console/ConsoleLayout';
import { PageHeader } from '../components/console/PageHeader';
import { Users, Search, Shield, Mail, Phone, Calendar, ArrowLeft, Plus, Edit2, Trash2, X, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';

export const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState(null);
  
  // Selected User State for Edit/Delete
  const [selectedUser, setSelectedUser] = useState(null);

  // Lock body scroll when any modal is active so delete modal stays perfectly fixed in viewport
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

  // Toast Alert State
  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    password: '',
    role: 'user'
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/users');
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch users:', err);
      setError(err.response?.data?.message || 'Failed to load user management data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateOpen = () => {
    if (currentUser?.role !== 'super_admin') {
      showToast('error', 'Permission Denied: Super Admin privileges are required to create accounts!');
      return;
    }
    setFormData({ name: '', email: '', phoneNumber: '', password: '', role: 'user' });
    setIsCreateOpen(true);
  };

  // CRUD API Handlers
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') {
      showToast('error', 'Permission Denied: Super Admin privileges are required to create accounts!');
      return;
    }
    try {
      setError(null);
      const savedEmail = formData.email.trim().toLowerCase();
      const savedPassword = formData.password;
      await api.post('/auth/users', formData);
      setIsCreateOpen(false);
      fetchUsers();
      // Show credential summary so admin can share login details
      setCreatedCredentials({ name: formData.name, email: savedEmail, password: savedPassword, role: formData.role });
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user account';
      setError(msg);
      showToast('error', msg);
    }
  };

  const handleEditOpen = (user) => {
    if (currentUser?.role !== 'super_admin') {
      showToast('error', 'Permission Denied: Super Admin privileges are required to edit accounts!');
      return;
    }
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      password: '', // leave empty
      role: user.role
    });
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (currentUser?.role !== 'super_admin') {
      showToast('error', 'Permission Denied: Super Admin privileges are required to edit accounts!');
      return;
    }
    try {
      setError(null);
      const payload = {
        name: formData.name,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        role: formData.role
      };
      // Include password only if admin explicitly typed a new one
      if (formData.password && formData.password.trim().length >= 8) {
        payload.password = formData.password.trim();
      }
      await api.put(`/auth/users/${selectedUser._id}`, payload);
      const updatedName = formData.name;
      setIsEditOpen(false);
      setSelectedUser(null);
      fetchUsers();
      showToast('success', `User account for "${updatedName}" has been updated successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user account';
      setError(msg);
      showToast('error', msg);
    }
  };

  const handleDeleteOpen = (user) => {
    if (currentUser?.role !== 'super_admin') {
      showToast('error', 'Permission Denied: Super Admin privileges are required to delete accounts!');
      return;
    }
    if (user.role === 'super_admin') {
      showToast('error', 'Action Prohibited: The Super Admin account cannot be deleted!');
      return;
    }
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteSubmit = async () => {
    if (!selectedUser) return;
    if (selectedUser.role === 'super_admin') {
      setIsDeleteOpen(false);
      showToast('error', 'Action Prohibited: The Super Admin account cannot be deleted!');
      return;
    }
    const deletedName = selectedUser.name;
    try {
      setError(null);
      await api.delete(`/auth/users/${selectedUser._id}`);
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
      showToast('success', `User account for "${deletedName}" has been deleted successfully!`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete user account';
      setError(msg);
      showToast('error', msg);
    }
  };

  const handleToggleStatus = async (user) => {
    if (user.role === 'super_admin') {
      showToast('error', 'Action Prohibited: Cannot change status of Super Admin account!');
      return;
    }
    try {
      setError(null);
      const nextStatus = user.isActive === false ? true : false;
      await api.put(`/auth/users/${user._id}`, {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        role: user.role,
        isActive: nextStatus
      });
      fetchUsers();
      showToast('info', `Account status for "${user.name}" updated to ${nextStatus ? 'ACTIVE' : 'SUSPENDED'}.`);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to toggle status';
      setError(msg);
      showToast('error', msg);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phoneNumber && u.phoneNumber.includes(searchTerm))
  );

  return (
    <ConsoleLayout title="User Management">
      <PageHeader
        title="User Accounts & Management"
        subtitle="Manage and view registration details of all platform members"
        icon={Users}
        breadcrumb={['CloudAtlas AI', 'Admin', 'Users']}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary group transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>
      </div>

      {/* Stats Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Total Platform Users
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {users.length}
              </h3>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(6,182,212,0.08)', color: '#06B6D4',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto'
            }}>
              <Users className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between' }}>
            <div>
              <p style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Super Administrators
              </p>
              <h3 style={{ margin: '8px 0 0', fontSize: '28px', fontWeight: 700, fontFamily: 'Space Grotesk, monospace', color: '#F1F5F9' }}>
                {users.filter(u => u.role === 'super_admin').length}
              </h3>
            </div>
            <div style={{
              width: '44px', height: '44px', borderRadius: '10px',
              background: 'rgba(124,58,237,0.08)', color: '#8B5CF6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto'
            }}>
              <Shield className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <div className="glass-card" style={{ padding: '24px', overflow: 'hidden' }}>
        {/* Table Filter Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px'
        }}>
          <div style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }}>
              <Search className="h-4 w-4" />
            </span>
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px 10px 38px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px',
                fontSize: '13px',
                color: '#F1F5F9',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#7C3AED'}
              onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.07)'}
            />
          </div>

          <button
            onClick={() => {
              setFormData({ name: '', email: '', phoneNumber: '', password: '', role: 'user' });
              setIsCreateOpen(true);
            }}
            className="btn-primary ripple"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <Plus size={14} />
            Create Member
          </button>
        </div>

        {error && (
          <div style={{
            padding: '12px', background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)', borderRadius: '8px',
            color: '#EF4444', fontSize: '13px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 0', gap: '16px' }}>
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg shadow-primary/20"></div>
            <p className="text-gray-400 font-medium text-xs">Loading user list...</p>
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
                    <td colSpan={5} style={{ padding: '32px 16px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                      No matching user accounts found.
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
                            fontWeight: 600, color: '#F1F5F9', fontSize: '14px'
                          }}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: 600, color: '#F1F5F9' }}>{user.name}</div>
                            <div style={{ fontSize: '10px', color: '#475569', fontFamily: 'Space Grotesk, monospace' }}>ID: {user._id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#94A3B8' }}>
                            <Mail className="h-3.5 w-3.5 text-gray-500" />
                            {user.email}
                          </div>
                          {user.phoneNumber && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px', color: '#94A3B8' }}>
                          <Calendar className="h-4 w-4 text-gray-500" />
                          {new Date(user.createdAt || Date.now()).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditOpen(user)}
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
                            onClick={() => handleDeleteOpen(user)}
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE MEMBER MODAL */}
      {isCreateOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '460px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#F1F5F9' }}>Create Platform Member</h3>
              <button onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="e.g. John Doe" />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="e.g. john@cloudatlas.ai" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Phone Number</label>
                <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="e.g. +15550199" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Password</label>
                <input required type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="••••••••" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Security Tier (Role)</label>
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
                    { val: 'user', label: 'User', desc: 'Standard', color: { text: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' } },
                    { val: 'admin', label: 'Admin', desc: 'Billing', color: { text: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' } },
                    { val: 'super_admin', label: 'Super Admin', desc: 'Root', color: { text: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' } }
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
          background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '460px', padding: '28px', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#F1F5F9' }}>Edit User Details</h3>
              <button onClick={() => setIsEditOpen(false)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Full Name</label>
                <input required type="text" name="name" value={formData.name} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} />
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Email Address</label>
                <input required type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Phone Number</label>
                <input required type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>New Password <span style={{ color: '#475569', textTransform: 'none', fontWeight: 400, fontSize: '10px' }}>(leave blank to keep current)</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} className="input-field" style={{ width: '100%' }} placeholder="Min 8 characters" />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Security Tier (Role)</label>
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
                    { val: 'user', label: 'User', desc: 'Standard', color: { text: '#A78BFA', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)' } },
                    { val: 'admin', label: 'Admin', desc: 'Billing', color: { text: '#EF4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)' } },
                    { val: 'super_admin', label: 'Super Admin', desc: 'Root', color: { text: '#06B6D4', bg: 'rgba(6,182,212,0.08)', border: 'rgba(6,182,212,0.2)' } }
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

      {/* CREDENTIALS SUCCESS MODAL */}
      {createdCredentials && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.9)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '480px', padding: '32px', border: '1px solid rgba(34,197,94,0.25)', boxShadow: '0 25px 60px -12px rgba(0,0,0,0.9), 0 0 40px rgba(34,197,94,0.08)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✅</div>
              <div>
                <h3 style={{ margin: 0, fontFamily: 'Outfit, sans-serif', fontSize: '17px', fontWeight: 700, color: '#F1F5F9' }}>Account Created Successfully</h3>
                <p style={{ margin: '2px 0 0', fontSize: '12px', color: '#64748B' }}>Share these credentials securely with the user</p>
              </div>
              <button onClick={() => setCreatedCredentials(null)} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer', marginLeft: 'auto' }}><X size={18} /></button>
            </div>

            {/* Credential Box */}
            <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Name</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#F1F5F9', fontFamily: 'Space Grotesk, monospace' }}>{createdCredentials.name}</p>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Login Email</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#38BDF8', fontFamily: 'Space Grotesk, monospace' }}>{createdCredentials.email}</p>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Password</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#A78BFA', fontFamily: 'Space Grotesk, monospace', letterSpacing: '0.05em' }}>{createdCredentials.password}</p>
              </div>
              <div style={{ height: '1px', background: 'rgba(255,255,255,0.04)' }} />
              <div>
                <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Role</p>
                <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: createdCredentials.role === 'super_admin' ? 'rgba(6,182,212,0.1)' : 'rgba(167,139,250,0.1)', color: createdCredentials.role === 'super_admin' ? '#06B6D4' : '#A78BFA', border: createdCredentials.role === 'super_admin' ? '1px solid rgba(6,182,212,0.2)' : '1px solid rgba(167,139,250,0.2)', textTransform: 'uppercase' }}>{createdCredentials.role?.replace('_', ' ')}</span>
              </div>
            </div>

            <div style={{ padding: '10px 14px', background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)', borderRadius: '8px', marginBottom: '20px' }}>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#CA8A04', lineHeight: 1.5 }}>⚠️ <strong>Security Notice:</strong> This password is shown only once. Share it with the user through a secure channel and ask them to change it after first login.</p>
            </div>

            <button
              onClick={() => { setCreatedCredentials(null); showToast('success', `Account for "${createdCredentials.name}" is ready to login!`); }}
              className="btn-primary ripple"
              style={{ width: '100%', height: '44px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: '10px' }}
            >
              Got it — Close
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && createPortal(
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh',
          background: 'rgba(5, 8, 22, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          zIndex: 999999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
        }}>
          <div className="glass-card animate-modal-enter" style={{ width: '100%', maxWidth: '420px', padding: '28px', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.85)' }}>
            <h3 style={{ margin: '0 0 12px', fontFamily: 'Outfit, sans-serif', fontSize: '18px', fontWeight: 700, color: '#EF4444' }}>Delete Account</h3>
            <p style={{ margin: '0 0 20px', fontSize: '13.5px', color: '#94A3B8', lineHeight: 1.5, fontFamily: 'Inter' }}>
              Are you sure you want to delete the user account for <strong>{selectedUser?.name}</strong>? This action is permanent and cannot be undone.
            </p>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setIsDeleteOpen(false)} className="btn-secondary" style={{ flex: 1, height: '40px', cursor: 'pointer' }}>Cancel</button>
              <button
                onClick={handleDeleteSubmit}
                style={{
                  flex: 1, height: '40px', background: '#EF4444', border: 'none', borderRadius: '8px',
                  color: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
                onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* FLOATING TOAST ALERT */}
      {toast && createPortal(
        <div style={{
          position: 'fixed', top: '24px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999999, display: 'flex', alignItems: 'center', gap: '12px',
          padding: '12px 20px', borderRadius: '12px',
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

export default UsersPage;
