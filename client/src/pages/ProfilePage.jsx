import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { Shield, Mail, Calendar, User, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProfilePage = () => {
  const { user } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20';
      case 'admin':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'finance_manager':
        return 'bg-green-500/10 text-green-400 border border-green-500/20';
      case 'devops_engineer':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
    }
  };

  const formatRole = (role) => {
    return role ? role.replace('_', ' ').toUpperCase() : 'VIEWER';
  };

  return (
    <div className="min-h-screen bg-navy-dark flex flex-col grid-bg text-white">
      <Navbar />

      <div className="pt-28 pb-16 flex-grow mx-auto max-w-3xl w-full px-4 relative z-10">
        
        {/* Back Link */}
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-primary mb-8 group transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        {/* Profile Card Container */}
        <div className="glass-card rounded-2xl p-8 shadow-2xl border-white/5 relative overflow-hidden">
          {/* Subtle top decoration */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

          {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-8 border-b border-white/5">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary/20 to-gold/20 border border-primary/20 text-primary">
              <User className="h-10 w-10" />
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold tracking-tight">{user?.name}</h2>
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
                <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</p>
                  <p className="text-sm font-semibold text-white mt-1">{user?.email}</p>
                </div>
              </div>

              {/* Permission Role */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <Shield className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Security Tier</p>
                  <p className="text-sm font-semibold text-white mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
                </div>
              </div>

              {/* Account Creation Time */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-white/[0.02] border border-white/5 md:col-span-2">
                <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Membership Validity</p>
                  <p className="text-sm font-semibold text-white mt-1">
                    Active (Session Token Refreshed)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="mt-10 p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-gray-400 leading-relaxed">
            <p>
              <strong>Security Note:</strong> Account edits and credential resets require administrative approval. To request details updates, contact your DevOps and Security teams.
            </p>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
};
export default ProfilePage;
