import React from 'react';
import { Cpu, BarChart2, Bell, HelpCircle, Layers, Globe, CheckCircle } from 'lucide-react';

export const FeaturesSection = () => {
  const features = [
    {
      icon: Cpu,
      title: 'XGBoost Prediction',
      description: 'Dynamic gradient-boosted regression modeling of hourly billing trends. Yields up to 98% forecasting accuracy.',
    },
    {
      icon: Layers,
      title: 'Random Forest Classification',
      description: 'Hierarchical decision classification that separates base-load services from volatile temporary workloads.',
    },
    {
      icon: Bell,
      title: 'Real-Time Alerts',
      description: 'Instant notification webhooks via Slack, MS Teams, or Email when budget thresholds are projected to breach.',
    },
    {
      icon: BarChart2,
      title: 'Billing Analytics',
      description: 'Granular breakdown of cloud expenses mapped by tag, department, region, and custom organization clusters.',
    },
    {
      icon: HelpCircle,
      title: 'Recommendation Engine',
      description: 'Continuous heuristic analysis matching current usage to optimal instances, generating immediate ROI pathways.',
    },
    {
      icon: Globe,
      title: 'Multi-Cloud Support',
      description: 'Unified database parsing AWS Cur, Azure Cost Exports, and GCP BigQuery billing streams automatically.',
    },
  ];

  return (
    <section id="features" className="relative py-24 bg-navy-dark overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-semibold text-primary uppercase tracking-widest">Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-2">
            Engineered for Precision Cost Control
          </h2>
          <p className="text-gray-400 mt-4 text-sm sm:text-base leading-relaxed">
            Harnessing state-of-the-art predictive modeling to secure cloud budget pipelines.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat, index) => {
            const IconComp = feat.icon;
            return (
              <div
                key={index}
                className="glass-card p-6 sm:p-8 rounded-2xl border border-white/5 hover:border-primary/20 hover:scale-[1.02] shadow-xl transition-all duration-300 relative group overflow-hidden"
              >
                {/* Micro animation glow overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="flex items-center gap-3.5 mb-4 relative z-10">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-primary shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                    <IconComp className="h-5 w-5" />
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white">{feat.title}</h3>
                </div>
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed relative z-10">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;
