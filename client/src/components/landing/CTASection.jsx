import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ArrowRight, Sparkles } from 'lucide-react';

export const CTASection = () => {
  const { token } = useAuth();

  return (
    <section className="relative py-28 overflow-hidden grid-bg border-t border-white/5" style={{ backgroundColor: 'var(--color-navy-dark)' }}>
      {/* Background Orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />

      <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
          <Sparkles className="h-4 w-4 text-[#34D399] animate-pulse" />
          <span>Real-time Clinical Node Analytics</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-[1.2] mb-6">
          Secure Your Distributed <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-hover">
            Healthcare Diagnostics Today
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-gray-400 text-sm sm:text-base leading-relaxed mb-10">
          Join clinical administrators and medical practitioners running predictive models across healthcare clinics and multi-cloud sync modules.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <Link
            to={token ? '/dashboard' : '/login'}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-hover px-8 py-4 text-base font-bold text-white hover:opacity-95 shadow-lg shadow-primary/25 hover:scale-[1.02] transition-all glow-button w-full sm:w-auto"
          >
            Access AI Console
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="mailto:support@cloudatlas-predict.com"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all hover:scale-[1.02] w-full sm:w-auto"
          >
            Connect Diagnostics
          </a>
        </div>

      </div>
    </section>
  );
};
export default CTASection;
