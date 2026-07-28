import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Shield, Mail, Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CustomSaveModal } from '../components/common/CustomSaveModal';
import { ConsoleLayout } from '../components/console/ConsoleLayout';

export const ProfilePage = () => {
  const { user, theme, updateTheme } = useAuth();
  const [saveStatus, setSaveStatus] = React.useState('');
  const [pendingTheme, setPendingTheme] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleThemeChange = (newTheme) => {
    setPendingTheme(newTheme);
    setIsModalOpen(true);
  };

  const confirmThemeChange = () => {
    updateTheme(pendingTheme);
    setSaveStatus('Theme updated successfully!');
    setIsModalOpen(false);
    setTimeout(() => setSaveStatus(''), 3000);
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

  return (
    <ConsoleLayout title="My Profile">
      <div className="max-w-3xl mx-auto px-2 py-4">
        
        {/* Back Link */}
        <div style={{ marginBottom: '24px' }}>
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary mb-4 group transition-colors">
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </Link>
        </div>

        {/* Profile Card Container */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl border-white/5 relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-cyan-500/25 border border-primary/20 text-primary">
              <User className="h-10 w-10 text-cyan-400" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight text-white">{user?.name}</h2>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2.5 mt-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${getRoleBadgeColor(user?.role)}`}>
                  {formatRole(user?.role)}
                </span>
                <span className="text-xs text-gray-400">Authenticated Member</span>
              </div>
            </div>
          </div>

          {/* Profile Details List */}
          <div className="mt-8 space-y-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">General Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Email Address */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Mail className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-white mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Permission Role */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Shield className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Security Tier</p>
                  <p className="text-sm font-semibold text-white mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Account Creation Time */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/5 md:col-span-2">
                <Calendar className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Membership Validity</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    Active (Session Token Refreshed)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Theme Settings Selection */}
          <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Console Personalization</h3>
              {saveStatus && (
                <span className="text-xs font-bold text-primary animate-pulse">{saveStatus}</span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {/* Theme option 1: Cream Luxury */}
              <button
                onClick={() => handleThemeChange('warm-editorial-theme')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] ${
                  theme === 'warm-editorial-theme'
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold text-white">Cream Luxury</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Light Theme</span>
                <div className="flex gap-1 mt-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#F5F0E8] border border-white/10" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#2C1810]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#B47850]" />
                </div>
              </button>

              {/* Theme option 2: Neon Noir */}
              <button
                onClick={() => handleThemeChange('neon-noir-theme')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] ${
                  theme === 'neon-noir-theme'
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold text-white">Neon Noir</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Midnight Cyan</span>
                <div className="flex gap-1 mt-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0A0015] border border-white/10" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#7B2FFF]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#00D4FF]" />
                </div>
              </button>

              {/* Theme option 3: Deep Ocean */}
              <button
                onClick={() => handleThemeChange('deep-ocean-theme')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] ${
                  theme === 'deep-ocean-theme'
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold text-white">Deep Ocean</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Bioluminescent</span>
                <div className="flex gap-1 mt-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#020C1B] border border-white/10" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#00D4FF]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#00FFA3]" />
                </div>
              </button>

              {/* Theme option 4: Obsidian Gold */}
              <button
                onClick={() => handleThemeChange('obsidian-gold-theme')}
                className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all cursor-pointer hover:scale-[1.02] ${
                  theme === 'obsidian-gold-theme'
                    ? 'bg-primary/10 border-primary text-primary shadow-lg shadow-primary/5'
                    : 'bg-white/[0.02] border-white/5 text-gray-400 hover:border-white/10'
                }`}
              >
                <span className="text-xs font-bold text-white">Obsidian Gold</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Ultra Premium</span>
                <div className="flex gap-1 mt-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-[#0D0D0D] border border-white/10" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#D4AF37]" />
                  <span className="w-3.5 h-3.5 rounded-full bg-[#2A2A2A]" />
                </div>
              </button>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-10 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-gray-400 leading-relaxed font-medium">
            <p>
              <strong>Security Note:</strong> Account edits and credential resets require administrative approval. To request details updates, contact your DevOps and Security teams.
            </p>
          </div>

        </div>
      </div>

      <CustomSaveModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={confirmThemeChange}
        themeName={pendingTheme}
        email={user?.email}
      />
    </ConsoleLayout>
  );
};

export default ProfilePage;
