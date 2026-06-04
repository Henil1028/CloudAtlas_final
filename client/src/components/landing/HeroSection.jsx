import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, TrendingUp, ShieldAlert, Cpu, Sparkles, Activity } from 'lucide-react';

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-28 pb-20 overflow-hidden grid-bg">
      {/* Floating orbs for sunset ocean gradient */}
      <div className="floating-orb orb-orange w-[500px] h-[500px] top-[-10%] right-[-10%]" />
      <div className="floating-orb orb-navy w-[600px] h-[600px] bottom-[-20%] left-[-10%]" />
      <div className="floating-orb orb-gold w-[400px] h-[400px] top-[40%] left-[30%]" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full text-center">
        {/* Animated Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-8 animate-bounce">
          <Sparkles className="h-4 w-4 animate-spin text-gold" />
          <span>SaaS Platform Built for FinOps</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.1] mb-6">
          Predict Cloud Costs <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-gold to-white glow-text">
            Before They Impact
          </span>{' '}
          Your Budget
        </h1>

        {/* Subheadline */}
        <p className="mx-auto max-w-3xl text-base sm:text-xl text-gray-300 leading-relaxed mb-10">
          AI-powered cloud cost forecasting, anomaly detection, resource optimization, and FinOps analytics across AWS, Azure, and Google Cloud.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-20">
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-orange-600 px-8 py-4 text-base font-bold text-white hover:opacity-95 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all glow-button w-full sm:w-auto"
          >
            Get Started
            <ArrowRight className="h-5 w-5" />
          </Link>
          <a
            href="#dashboard-preview"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white/5 border border-white/10 px-8 py-4 text-base font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all w-full sm:w-auto hover:scale-[1.02]"
          >
            <Play className="h-5 w-5 text-primary fill-primary" />
            View Live Demo
          </a>
        </div>

        {/* Hero Dashboard Card */}
        <div className="mx-auto max-w-4xl p-1.5 rounded-3xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-2xl backdrop-blur-md relative">
          <div className="absolute -inset-0.5 bg-gradient-to-tr from-primary/30 to-gold/30 rounded-3xl blur-[12px] opacity-30 z-0 pointer-events-none" />
          
          <div className="relative z-10 glass-card rounded-[22px] overflow-hidden p-6 sm:p-8">
            {/* Header bar of simulated card */}
            <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-6">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 bg-red-500 rounded-full" />
                <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                <div className="h-3 w-3 bg-green-500 rounded-full" />
                <span className="text-xs text-gray-500 font-medium ml-2">cloudatlas-forecast-dashboard.app</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                <Activity className="h-3.5 w-3.5 text-primary animate-pulse" />
                <span className="text-[10px] font-bold tracking-widest text-primary uppercase">Live Prediction Grid</span>
              </div>
            </div>

            {/* Stat Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {/* Stat 1 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Current Spend</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1.5">$48,250</p>
                <span className="text-[10px] font-medium text-gray-500">Month-to-Date runrate</span>
              </div>

              {/* Stat 2 */}
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 relative overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <div className="absolute top-0 right-0 p-3 opacity-15">
                  <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <p className="text-[10px] font-semibold text-primary uppercase tracking-widest">Predicted Spend</p>
                <p className="text-xl sm:text-2xl font-black text-white mt-1.5">$54,120</p>
                <span className="text-[10px] font-semibold text-primary flex items-center gap-0.5 mt-0.5">
                  <TrendingUp className="h-3.5 w-3.5" /> XGBoost +/- 1.2%
                </span>
              </div>

              {/* Stat 3 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Savings Found</p>
                <p className="text-xl sm:text-2xl font-black text-green-400 mt-1.5">$9,480</p>
                <span className="text-[10px] font-semibold text-green-500">Unused assets detected</span>
              </div>

              {/* Stat 4 */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Efficiency Score</p>
                <p className="text-xl sm:text-2xl font-black text-gold mt-1.5">92%</p>
                <span className="text-[10px] font-semibold text-gold flex items-center gap-0.5 mt-0.5">
                  <Sparkles className="h-3.5 w-3.5" /> High optimization
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Wave layers at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px] overflow-hidden pointer-events-none">
        <svg className="wave-layer wave-layer-1" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,60 C150,100 350,20 500,60 C650,100 850,20 1000,60 C1150,100 1300,60 1400,60 L1400,120 L0,120 Z" fill="#E87F24" />
        </svg>
        <svg className="wave-layer wave-layer-2" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,50 C180,90 280,10 480,50 C680,90 780,10 980,50 C1180,90 1280,50 1400,50 L1400,120 L0,120 Z" fill="#e2a84b" />
        </svg>
        <svg className="wave-layer wave-layer-3" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,40 C200,80 300,0 500,40 C700,80 800,0 1000,40 C1200,80 1300,40 1400,40 L1400,120 L0,120 Z" fill="#0f0f1a" />
        </svg>
      </div>
    </section>
  );
};
export default HeroSection;
