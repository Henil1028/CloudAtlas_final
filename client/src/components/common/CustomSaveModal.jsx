import React from 'react';
import { X, Check } from 'lucide-react';

export const CustomSaveModal = ({ isOpen, onClose, onSave, themeName, email }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Dark blur backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Animated Modal Card */}
      <div className="relative z-10 w-full max-w-sm transform scale-95 opacity-0 animate-modal-enter glass-card rounded-3xl p-6 border border-white/10 shadow-2xl overflow-hidden text-center">
        {/* Glowing aura inside modal */}
        <div className="absolute -top-20 -left-20 w-40 h-40 rounded-full bg-[#00D4FF]/20 blur-[50px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 rounded-full bg-[#00FFA3]/20 blur-[50px] pointer-events-none" />

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer z-20"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#00FFA3] bg-[#00FFA3]/10 px-2.5 py-1 rounded-full border border-[#00FFA3]/20">
            Save Preference
          </span>
        </div>

        <h3 className="text-lg font-black text-white">Save Custom Theme?</h3>
        <p className="text-[11px] text-gray-400 leading-relaxed max-w-[280px] mx-auto mt-1">
          Lock in your preferred console styling for future sessions.
        </p>

        {/* Animated Half-Circle Gauge containing active theme name */}
        <div className="flex justify-center my-6 relative">
          <svg className="w-32 h-32 transform -rotate-90">
            {/* Background half-circle */}
            <circle
              cx="64"
              cy="64"
              r="48"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="301.6"
              strokeDashoffset="150.8" /* exact half */
              strokeLinecap="round"
            />
            {/* Animated foreground half-circle */}
            <circle
              cx="64"
              cy="64"
              r="48"
              stroke="#00D4FF"
              strokeWidth="6"
              fill="transparent"
              strokeDasharray="301.6"
              strokeDashoffset="150.8"
              className="animate-pulse"
              strokeLinecap="round"
              style={{
                transformOrigin: 'center',
                filter: 'drop-shadow(0 0 4px rgba(0, 212, 255, 0.4))'
              }}
            />
          </svg>
          {/* Details inside the half circle */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pt-2">
            <span className="text-[8px] text-gray-500 font-extrabold uppercase tracking-wider leading-none">Console Style</span>
            <span className="text-xs font-black text-[#00D4FF] mt-1 capitalize truncate max-w-[90px] leading-tight">
              {themeName ? themeName.replace('-theme', '').replace('-', ' ') : 'Neon Noir'}
            </span>
          </div>
        </div>

        {/* Details card below */}
        <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 text-left text-xs mb-6 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider">Storage Target</span>
            <span className="text-white font-bold text-[10px]">Browser Storage</span>
          </div>
          <div className="flex justify-between items-center border-t border-white/5 pt-2">
            <span className="text-gray-500 font-semibold text-[10px] uppercase tracking-wider">User Account</span>
            <span className="text-gray-300 font-semibold text-[11px] truncate max-w-[150px]">{email || 'admin1@cloudatlas.ai'}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-gray-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#00FFA3] to-[#0066FF] text-xs font-black text-black hover:opacity-95 shadow-lg shadow-[#00FFA3]/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Check className="h-3.5 w-3.5 stroke-[3px]" />
            Save Change
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomSaveModal;
