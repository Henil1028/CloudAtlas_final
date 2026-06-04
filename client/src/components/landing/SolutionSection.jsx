import React from 'react';
import { Cpu, ShieldAlert, Zap, BarChart2 } from 'lucide-react';

export const SolutionSection = () => {
  const solutions = [
    {
      icon: Cpu,
      title: 'AI Cost Prediction',
      description: 'Leveraging regression models like XGBoost and Random Forest to forecast resource costs 90 days out with high confidence.',
    },
    {
      icon: ShieldAlert,
      title: 'Anomaly Detection',
      description: 'Continuous scanning of hourly billings to flag cost spikes instantly, pinpointing the exact resource causing the surge.',
    },
    {
      icon: Zap,
      title: 'Optimization Engine',
      description: 'Algorithmic recommendations to resize undersized instances, shut down inactive clusters, and purchase reserved options.',
    },
    {
      icon: BarChart2,
      title: 'FinOps Dashboard',
      description: 'A unified single-pane interface mapping cross-platform cloud resources and prediction vectors for financial analysis.',
    },
  ];

  return (
    <section className="relative py-24 bg-navy-deep overflow-hidden">
      {/* Background orange sunset glow */}
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Our Approach</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            How CloudAtlas Solves It
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            By shifting cloud cost management from retro reports to real-time predictive operations.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((sol, index) => {
            const IconComp = sol.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 rounded-2xl border border-white/5 hover:border-primary/20 hover:translate-y-[-4px] shadow-lg shadow-navy-dark/20 transition-all duration-300 group"
              >
                <div className="h-12 w-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary mb-5 group-hover:scale-110 transition-transform">
                  <IconComp className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2.5">{sol.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{sol.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default SolutionSection;
